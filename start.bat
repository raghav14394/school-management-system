@echo off
echo ================================================
echo   EduManage - School Management System
echo ================================================
echo.

REM Set Node.js path
set PATH=C:\Program Files\nodejs;%PATH%

REM Start the backend server (in-memory mode)
echo Starting backend server...
cd /d "%~dp0server"
start "EduManage Server" cmd /c "node server-memory.js"

REM Wait for server to be ready
timeout /t 3 /nobreak >nul

REM Start the frontend
echo Starting frontend...
cd /d "%~dp0client"
start "EduManage Client" cmd /c "npx vite --host"

echo.
echo ================================================
echo   Application started!
echo   Frontend: http://localhost:3000
echo   Backend:  http://localhost:5000

echo.
echo   Demo Login Credentials:
echo   Admin:   admin@school.com / admin123
echo   Teacher: john.smith@school.com / teacher123
echo   Student: student1@school.com / student123
echo   Parent:  parent1@school.com / parent123
echo ================================================
echo.
pause
