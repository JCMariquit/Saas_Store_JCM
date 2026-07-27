@echo off
setlocal EnableExtensions
title JCM - Import Both Databases

cd /d "%~dp0"

REM ============================================================
REM CONFIGURATION
REM ============================================================
set "INVENTORY_DB=jcm_inventory_db"
set "SAAS_DB=jcm_saas_db"
set "DB_HOST=127.0.0.1"
set "DB_PORT=3306"
set "DB_USER=root"
set "DB_PASS="
set "MYSQL_BIN=C:\xampp\mysql\bin"

set "TRANSFER_DIR=%~dp0transfer"
set "INVENTORY_FILE=%TRANSFER_DIR%\jcm_inventory_db_latest.sql"
set "SAAS_FILE=%TRANSFER_DIR%\jcm_saas_db_latest.sql"

REM ============================================================
REM FIND DATABASE PROGRAMS
REM ============================================================
set "MYSQL_EXE="
set "DUMP_EXE="

if exist "%MYSQL_BIN%\mariadb.exe" set "MYSQL_EXE=%MYSQL_BIN%\mariadb.exe"
if not defined MYSQL_EXE if exist "%MYSQL_BIN%\mysql.exe" set "MYSQL_EXE=%MYSQL_BIN%\mysql.exe"

if exist "%MYSQL_BIN%\mariadb-dump.exe" set "DUMP_EXE=%MYSQL_BIN%\mariadb-dump.exe"
if not defined DUMP_EXE if exist "%MYSQL_BIN%\mysqldump.exe" set "DUMP_EXE=%MYSQL_BIN%\mysqldump.exe"

if not defined MYSQL_EXE (
    echo.
    echo ERROR: mariadb.exe or mysql.exe was not found.
    echo Expected folder: %MYSQL_BIN%
    echo.
    pause
    exit /b 1
)

if not defined DUMP_EXE (
    echo.
    echo ERROR: mariadb-dump.exe or mysqldump.exe was not found.
    echo Expected folder: %MYSQL_BIN%
    echo.
    pause
    exit /b 1
)

if not exist "%INVENTORY_FILE%" (
    echo.
    echo ERROR: Missing %INVENTORY_FILE%
    echo Run Git pull first or export both databases from the source PC.
    echo.
    pause
    exit /b 1
)

if not exist "%SAAS_FILE%" (
    echo.
    echo ERROR: Missing %SAAS_FILE%
    echo Run Git pull first or export both databases from the source PC.
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0jcm_inventory_views.sql" (
    echo.
    echo ERROR: jcm_inventory_views.sql is missing.
    echo.
    pause
    exit /b 1
)

set "PASS_ARG="
if not "%DB_PASS%"=="" set "PASS_ARG=-p%DB_PASS%"

for /f %%I in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd_HHmmss"') do set "STAMP=%%I"

set "BACKUP_DIR=%~dp0safety_backups\%STAMP%"
if not exist "%BACKUP_DIR%" mkdir "%BACKUP_DIR%"

set "INVENTORY_BACKUP=%BACKUP_DIR%\jcm_inventory_db_before_import.sql"
set "INVENTORY_BACKUP_TEMP=%BACKUP_DIR%\jcm_inventory_db_before_import.tmp"
set "SAAS_BACKUP=%BACKUP_DIR%\jcm_saas_db_before_import.sql"

echo.
echo ============================================================
echo JCM DUAL DATABASE IMPORT
echo ============================================================
echo This will replace BOTH local databases:
echo - %INVENTORY_DB%
echo - %SAAS_DB%
echo.
echo Incoming files:
echo - %INVENTORY_FILE%
echo - %SAAS_FILE%
echo.
echo Automatic safety backups will be created first.
echo.
set /p "CONFIRM=Type IMPORT to continue: "

if /I not "%CONFIRM%"=="IMPORT" (
    echo.
    echo Import cancelled. Nothing was changed.
    echo.
    pause
    exit /b 0
)

echo.
echo [1/6] Backing up the current %INVENTORY_DB%...

"%DUMP_EXE%" ^
  --host=%DB_HOST% ^
  --port=%DB_PORT% ^
  --user=%DB_USER% ^
  %PASS_ARG% ^
  --default-character-set=utf8mb4 ^
  --single-transaction ^
  --quick ^
  --hex-blob ^
  --routines ^
  --events ^
  --triggers ^
  --add-drop-table ^
  --skip-lock-tables ^
  --databases "%INVENTORY_DB%" ^
  --ignore-table=%INVENTORY_DB%.vw_batch_inventory ^
  --ignore-table=%INVENTORY_DB%.vw_batch_issue_candidates ^
  --ignore-table=%INVENTORY_DB%.vw_batch_stock_reconciliation ^
  --ignore-table=%INVENTORY_DB%.vw_purchase_receipt_batch_reconciliation ^
  --ignore-table=%INVENTORY_DB%.vw_stock_adjustment_batch_reconciliation ^
  --ignore-table=%INVENTORY_DB%.vw_stock_issuance_batch_reconciliation ^
  --ignore-table=%INVENTORY_DB%.vw_stock_movement_batch_reconciliation ^
  --ignore-table=%INVENTORY_DB%.vw_stock_transfer_batch_reconciliation ^
  > "%INVENTORY_BACKUP_TEMP%"

if errorlevel 1 (
    echo.
    echo INVENTORY SAFETY BACKUP FAILED.
    echo Nothing was dropped.
    pause
    exit /b 1
)

move /Y "%INVENTORY_BACKUP_TEMP%" "%INVENTORY_BACKUP%" > nul
type "%~dp0jcm_inventory_views.sql" >> "%INVENTORY_BACKUP%"

if errorlevel 1 (
    echo.
    echo FAILED TO COMPLETE INVENTORY SAFETY BACKUP.
    echo Nothing was dropped.
    pause
    exit /b 1
)

echo [2/6] Backing up the current %SAAS_DB%...

"%DUMP_EXE%" ^
  --host=%DB_HOST% ^
  --port=%DB_PORT% ^
  --user=%DB_USER% ^
  %PASS_ARG% ^
  --default-character-set=utf8mb4 ^
  --single-transaction ^
  --quick ^
  --hex-blob ^
  --routines ^
  --events ^
  --triggers ^
  --add-drop-table ^
  --skip-lock-tables ^
  --databases "%SAAS_DB%" ^
  > "%SAAS_BACKUP%"

if errorlevel 1 (
    echo.
    echo SAAS SAFETY BACKUP FAILED.
    echo Nothing was dropped.
    pause
    exit /b 1
)

echo.
echo Safety backups completed:
echo %BACKUP_DIR%

echo.
echo [3/6] Recreating both databases...

(
    echo DROP DATABASE IF EXISTS `%INVENTORY_DB%`;
    echo CREATE DATABASE `%INVENTORY_DB%` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    echo DROP DATABASE IF EXISTS `%SAAS_DB%`;
    echo CREATE DATABASE `%SAAS_DB%` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
) | "%MYSQL_EXE%" ^
      --host=%DB_HOST% ^
      --port=%DB_PORT% ^
      --user=%DB_USER% ^
      %PASS_ARG%

if errorlevel 1 (
    echo.
    echo FAILED TO RECREATE THE DATABASES.
    echo Safety backups remain at:
    echo %BACKUP_DIR%
    pause
    exit /b 1
)

echo [4/6] Importing %INVENTORY_DB%...

"%MYSQL_EXE%" ^
  --host=%DB_HOST% ^
  --port=%DB_PORT% ^
  --user=%DB_USER% ^
  %PASS_ARG% ^
  --default-character-set=utf8mb4 ^
  < "%INVENTORY_FILE%"

if errorlevel 1 (
    echo.
    echo INVENTORY IMPORT FAILED.
    echo Safety backups:
    echo %BACKUP_DIR%
    pause
    exit /b 1
)

echo [5/6] Importing %SAAS_DB%...

"%MYSQL_EXE%" ^
  --host=%DB_HOST% ^
  --port=%DB_PORT% ^
  --user=%DB_USER% ^
  %PASS_ARG% ^
  --default-character-set=utf8mb4 ^
  < "%SAAS_FILE%"

if errorlevel 1 (
    echo.
    echo SAAS IMPORT FAILED.
    echo Safety backups:
    echo %BACKUP_DIR%
    pause
    exit /b 1
)

echo [6/6] Verifying both databases...

for /f "usebackq tokens=*" %%V in (`"%MYSQL_EXE%" --host=%DB_HOST% --port=%DB_PORT% --user=%DB_USER% %PASS_ARG% --batch --skip-column-names --execute="SELECT COUNT(*) FROM information_schema.VIEWS WHERE TABLE_SCHEMA='%INVENTORY_DB%';"`) do set "INVENTORY_VIEW_COUNT=%%V"

if not "%INVENTORY_VIEW_COUNT%"=="8" (
    echo.
    echo VERIFICATION FAILED: Expected 8 inventory views, found %INVENTORY_VIEW_COUNT%.
    echo Safety backups:
    echo %BACKUP_DIR%
    pause
    exit /b 1
)

"%MYSQL_EXE%" ^
  --host=%DB_HOST% ^
  --port=%DB_PORT% ^
  --user=%DB_USER% ^
  %PASS_ARG% ^
  --database=%INVENTORY_DB% ^
  --batch ^
  --skip-column-names ^
  --execute="SELECT COUNT(*) FROM products; SELECT COUNT(*) FROM vw_batch_inventory; SELECT COUNT(*) FROM vw_batch_issue_candidates;" > nul

if errorlevel 1 (
    echo.
    echo INVENTORY VERIFICATION FAILED.
    echo Safety backups:
    echo %BACKUP_DIR%
    pause
    exit /b 1
)

"%MYSQL_EXE%" ^
  --host=%DB_HOST% ^
  --port=%DB_PORT% ^
  --user=%DB_USER% ^
  %PASS_ARG% ^
  --database=%SAAS_DB% ^
  --batch ^
  --skip-column-names ^
  --execute="SELECT COUNT(*) FROM users; SELECT COUNT(*) FROM products; SELECT COUNT(*) FROM plans; SELECT COUNT(*) FROM subscriptions; SELECT COUNT(*) FROM user_product_access;" > nul

if errorlevel 1 (
    echo.
    echo SAAS VERIFICATION FAILED.
    echo Safety backups:
    echo %BACKUP_DIR%
    pause
    exit /b 1
)

echo.
echo ============================================================
echo BOTH DATABASES IMPORTED AND VERIFIED
echo ============================================================
echo Inventory views : %INVENTORY_VIEW_COUNT%
echo Safety backups  : %BACKUP_DIR%
echo.
echo You may now open the Laravel system.
echo Recommended command:
echo php artisan optimize:clear
echo.
pause
exit /b 0
