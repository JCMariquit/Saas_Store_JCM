@echo off
setlocal EnableExtensions
title JCM - Export Both Databases

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

REM ============================================================
REM FIND DUMP PROGRAM
REM ============================================================
set "DUMP_EXE="

if exist "%MYSQL_BIN%\mariadb-dump.exe" (
    set "DUMP_EXE=%MYSQL_BIN%\mariadb-dump.exe"
)

if not defined DUMP_EXE if exist "%MYSQL_BIN%\mysqldump.exe" (
    set "DUMP_EXE=%MYSQL_BIN%\mysqldump.exe"
)

if not defined DUMP_EXE (
    echo.
    echo ERROR: mariadb-dump.exe or mysqldump.exe was not found.
    echo Expected folder: %MYSQL_BIN%
    echo Edit MYSQL_BIN near the top of this BAT file when XAMPP is elsewhere.
    echo.
    pause
    exit /b 1
)

if not exist "%~dp0jcm_inventory_views.sql" (
    echo.
    echo ERROR: jcm_inventory_views.sql is missing beside this BAT file.
    echo.
    pause
    exit /b 1
)

set "TRANSFER_DIR=%~dp0transfer"
if not exist "%TRANSFER_DIR%" mkdir "%TRANSFER_DIR%"

set "INVENTORY_FILE=%TRANSFER_DIR%\jcm_inventory_db_latest.sql"
set "SAAS_FILE=%TRANSFER_DIR%\jcm_saas_db_latest.sql"
set "INVENTORY_TEMP=%TRANSFER_DIR%\jcm_inventory_db_latest.tmp"

set "PASS_ARG="
if not "%DB_PASS%"=="" set "PASS_ARG=-p%DB_PASS%"

echo.
echo ============================================================
echo JCM DUAL DATABASE EXPORT
echo ============================================================
echo 1. %INVENTORY_DB%
echo 2. %SAAS_DB%
echo.

echo [1/3] Exporting %INVENTORY_DB% without the 8 complex views...

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
  > "%INVENTORY_TEMP%"

if errorlevel 1 (
    echo.
    echo INVENTORY EXPORT FAILED.
    if exist "%INVENTORY_TEMP%" del "%INVENTORY_TEMP%"
    pause
    exit /b 1
)

move /Y "%INVENTORY_TEMP%" "%INVENTORY_FILE%" > nul

(
    echo.
    echo.
    echo -- ============================================================
    echo -- JCM INVENTORY CANONICAL VIEWS
    echo -- ============================================================
) >> "%INVENTORY_FILE%"

type "%~dp0jcm_inventory_views.sql" >> "%INVENTORY_FILE%"

if errorlevel 1 (
    echo.
    echo FAILED TO APPEND INVENTORY VIEWS.
    if exist "%INVENTORY_FILE%" del "%INVENTORY_FILE%"
    pause
    exit /b 1
)

powershell -NoProfile -Command ^
  "$text = Get-Content -Raw -LiteralPath '%INVENTORY_FILE%'; if ($text -match 'CASE\s+END\s+FROM') { exit 1 }"

if errorlevel 1 (
    echo.
    echo INVENTORY VALIDATION FAILED: Broken CASE END was detected.
    if exist "%INVENTORY_FILE%" del "%INVENTORY_FILE%"
    pause
    exit /b 1
)

echo [2/3] Exporting %SAAS_DB%...

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
  > "%SAAS_FILE%"

if errorlevel 1 (
    echo.
    echo SAAS EXPORT FAILED.
    if exist "%SAAS_FILE%" del "%SAAS_FILE%"
    pause
    exit /b 1
)

echo [3/3] Checking exported files...

for %%F in ("%INVENTORY_FILE%" "%SAAS_FILE%") do (
    if not exist "%%~F" (
        echo ERROR: Missing export file %%~F
        pause
        exit /b 1
    )

    if %%~zF LSS 1000 (
        echo ERROR: Export file is unexpectedly small: %%~F
        pause
        exit /b 1
    )
)

echo.
echo ============================================================
echo BOTH DATABASES EXPORTED SUCCESSFULLY
echo ============================================================
echo.
echo Files ready for Git push:
echo %INVENTORY_FILE%
echo %SAAS_FILE%
echo.
echo Next:
echo 1. git add .
echo 2. git commit -m "Sync latest development databases"
echo 3. git push
echo.
explorer "%TRANSFER_DIR%"
pause
exit /b 0
