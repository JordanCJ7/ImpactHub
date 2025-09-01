# ImpactHub Development Setup

This file explains how to start both frontend and backend services for development.

## 🚀 Recommended: Separate Terminals (Best for Development)

### Option 1: Using Windows Scripts
```cmd
# Separate command prompt windows
start-separate.bat

# OR separate PowerShell windows  
.\start-separate.ps1
```

### Option 2: Using VS Code Tasks (Recommended)
- Open VS Code
- Press `Ctrl+Shift+P`
- Type "Tasks: Run Task"
- Select "Auto Start Services (Separate Terminals)"

### Option 3: Manual Start (Individual Control)
**Backend Terminal:**
```bash
cd backend
npm run dev
```

**Frontend Terminal:**
```bash
cd frontend  
npm run dev
```

## 🔧 Alternative: Single Terminal (Mixed Logs)

### Option 4: Using npm scripts
```bash
# Start both in one terminal (logs will be mixed)
npm run dev
```

## ✅ What happens when you start:

1. **Backend** starts on `http://localhost:5000` 
2. **Frontend** starts on `http://localhost:5173`

## 🎯 Why Separate Terminals is Better:

- ✅ **Clear logs** - Each service has its own terminal
- ✅ **Easy debugging** - See exactly which service has issues  
- ✅ **Independent restart** - Restart just backend or frontend
- ✅ **Better development** - Can monitor each service separately
- ✅ **No mixed output** - Clean, readable logs

## 🔄 VS Code Workspace Benefits:

- Automatically suggests running startup tasks
- Provides debug configurations for both services
- Organized folder structure (Root/Backend/Frontend)
- Excludes unnecessary files from search

## 📦 Automatic Setup

All startup methods will automatically:
- Check for Node.js and npm installation
- Install missing dependencies for root, backend, and frontend
- Start both services with proper configuration

## 🛑 Stopping Services

- **Separate terminals**: Press `Ctrl+C` in each terminal window
- **Single terminal**: Press `Ctrl+C` once to stop both
