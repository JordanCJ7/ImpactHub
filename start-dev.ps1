# ImpactHub Development Environment Starter
Write-Host "Starting ImpactHub Development Environment..." -ForegroundColor Green
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

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "npm version: $npmVersion" -ForegroundColor Yellow
} catch {
    Write-Host "Error: npm is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Checking dependencies..." -ForegroundColor Cyan

# Check if root dependencies are installed
if (!(Test-Path "node_modules")) {
    Write-Host "Installing root dependencies..." -ForegroundColor Yellow
    npm install
}

# Check if backend dependencies are installed
if (!(Test-Path "backend\node_modules")) {
    Write-Host "Installing backend dependencies..." -ForegroundColor Yellow
    Set-Location backend
    npm install
    Set-Location ..
}

# Check if frontend dependencies are installed
if (!(Test-Path "frontend\node_modules")) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
}

Write-Host ""
Write-Host "Starting both Frontend and Backend..." -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be available at: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend will be available at: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press Ctrl+C to stop both services" -ForegroundColor Yellow
Write-Host ""

# Start both services using concurrently
npm run dev
