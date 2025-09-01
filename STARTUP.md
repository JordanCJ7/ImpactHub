# ImpactHub Development Setup

This file explains how to automatically start both frontend and backend services when opening the project.

## Quick Start Options

### Option 1: Using npm scripts (Recommended)
```bash
# Install the concurrently package first
npm install

# Start both services
npm run dev
```

### Option 2: Using Windows Batch File
Double-click `start-dev.bat` or run in terminal:
```cmd
start-dev.bat
```

### Option 3: Using PowerShell Script
```powershell
.\start-dev.ps1
```

### Option 4: Using VS Code Tasks
- Open VS Code
- Press `Ctrl+Shift+P`
- Type "Tasks: Run Task"
- Select "Start Both Services"

## What happens when you start:

1. **Backend** starts on `http://localhost:5000`
2. **Frontend** starts on `http://localhost:5173`

## Automatic Setup

The VS Code workspace is configured to:
- Automatically detect and suggest running the startup task
- Provide debug configurations for both services
- Exclude unnecessary files from search

## Manual Setup

If you prefer to start services manually:

### Backend:
```bash
cd backend
npm start
```

### Frontend:
```bash
cd frontend
npm run dev
```

## Dependencies

All startup methods will automatically:
- Check for Node.js and npm installation
- Install missing dependencies for root, backend, and frontend
- Start both services in parallel

## Stopping Services

Press `Ctrl+C` in the terminal to stop both services.
