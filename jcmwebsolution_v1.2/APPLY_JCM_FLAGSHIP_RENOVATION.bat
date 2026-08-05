@echo off
setlocal
cd /d "%~dp0"

echo ============================================================
echo JCM Flagship Control Center Renovation
echo ============================================================
echo.

echo [1/5] Rebuilding Composer autoload...
call composer dump-autoload
if errorlevel 1 goto :error

echo.
echo [2/5] Discovering Laravel packages...
php artisan package:discover --ansi
if errorlevel 1 goto :error

echo.
echo [3/5] Clearing Laravel caches...
php artisan optimize:clear
if errorlevel 1 goto :error

echo.
echo [4/5] Verifying Admin routes...
php artisan route:list --path=admin
if errorlevel 1 goto :error

echo.
echo [5/5] Building frontend assets...
call npm run build
if errorlevel 1 goto :npm_error

echo.
echo ============================================================
echo Renovation applied successfully.
echo Restart php artisan serve, then press Ctrl + Shift + R.
echo ============================================================
pause
exit /b 0

:npm_error
echo.
echo Frontend build failed. If native package errors appear, delete node_modules,
echo run npm install, then run npm run build again.
goto :error

:error
echo.
echo ============================================================
echo A command failed. Review the error shown above.
echo The database was not modified by this BAT file.
echo ============================================================
pause
exit /b 1
