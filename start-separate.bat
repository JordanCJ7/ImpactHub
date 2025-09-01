@echo off
echo Starting ImpactHub with Separate Command Prompts...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Checking dependencies...

REM Check and install dependencies
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)

if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo Starting Backend in separate window...
start "ImpactHub Backend" cmd /k "cd /d %~dp0backend && echo ImpactHub Backend Server && echo Available at: http://localhost:5000 && echo. && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend in separate window...
start "ImpactHub Frontend" cmd /k "cd /d %~dp0frontend && echo ImpactHub Frontend Server && echo Available at: http://localhost:5173 && echo. && npm run dev"

echo.
echo ✅ Both services are starting in separate windows!
echo 📊 Backend: http://localhost:5000
echo 🌐 Frontend: http://localhost:5173
echo.
echo Check the separate command prompt windows for logs.

pause
