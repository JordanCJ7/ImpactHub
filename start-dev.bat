@echo off
echo Starting ImpactHub Development Environment...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: npm is not installed or not in PATH
    pause
    exit /b 1
)

echo Checking dependencies...

REM Check if root dependencies are installed
if not exist "node_modules" (
    echo Installing root dependencies...
    npm install
)

REM Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

REM Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

echo.
echo Starting both Frontend and Backend...
echo.
echo Backend will be available at: http://localhost:5000
echo Frontend will be available at: http://localhost:5173
echo.
echo Press Ctrl+C to stop both services
echo.

REM Start both services using concurrently
npm run dev

pause
