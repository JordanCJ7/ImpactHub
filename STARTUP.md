# ImpactHub Development Setup

Choose your preferred way to start both frontend and backend services for development.


## 🏆 Best Option: VS Code Tasks (Recommended)

1. Open VS Code in the project folder.
2. **Quick method:** Press `Ctrl+Shift+P` → Type `Tasks: Run Build Task` → Press `Enter`.
3. **Full method:** Press `Ctrl+Shift+P` → Type `Tasks: Run Task` → Select `Start Backend` and `Start Frontend` (each will open in a new terminal tab).


## 🚀 Alternative: Manual Start in Separate Terminals

Open two integrated terminals in VS Code:

```powershell
# Terminal 1: Backend
cd backend; npm run dev

# Terminal 2: Frontend
cd frontend; npm run dev
```

## 🔧 Single Terminal (Mixed Logs)

```bash
# All logs in one terminal (harder to debug)
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
