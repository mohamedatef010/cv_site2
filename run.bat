@echo off
echo ====================================================
echo   Installing Server Dependencies (Express, Multer)...
echo ====================================================
cd profile-bootstrap-master
call npm install
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Failed to install npm dependencies. Make sure Node.js is installed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ====================================================
echo   Starting local Express server...
echo ====================================================
echo.
echo   - Website URL: http://localhost:3000
echo   - Admin Panel URL: http://localhost:3000/admin.html
echo.
echo   Default Credentials:
echo   - Username: admin
echo   - Password: admin_password_123
echo ====================================================
echo.

:: Open default browser
start http://localhost:3000
start http://localhost:3000/admin.html

:: Run node server
node server.js
pause
