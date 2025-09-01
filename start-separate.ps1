# Start Backend and Frontend in Separate Terminals
Write-Host "Starting ImpactHub with Separate Terminals..." -ForegroundColor Green
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Cyan

# Check and install dependencies
if (!(Test-Path "node_modules")) {
    Write-Host "Installing root dependencies..." -ForegroundColor Yellow
    npm install
}

if (!(Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

if (!(Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "Starting Backend in separate terminal..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; Write-Host 'ImpactHub Backend Server' -ForegroundColor Green; Write-Host 'Available at: http://localhost:5000' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Start-Sleep -Seconds 2

Write-Host "Starting Frontend in separate terminal..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; Write-Host 'ImpactHub Frontend Server' -ForegroundColor Blue; Write-Host 'Available at: http://localhost:5173' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "Both services are starting in separate terminals!" -ForegroundColor Green
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Check the separate terminal windows for logs." -ForegroundColor Yellow

Read-Host "Press Enter to exit this launcher"
