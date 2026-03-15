# 🧹 Project Cleanup Plan
## Sangguniang Bayan Transparency Portal

This document identifies unused files that can be safely deleted to clean up your project.

## 📊 Analysis Summary

### ✅ Files to Keep (Essential)
- **Source Code**: All files in `src/` directory
- **Server**: All files in `server/` directory  
- **Build**: `build/` directory (production build)
- **Config**: `package.json`, `tsconfig.json`, `tailwind.config.js`, etc.
- **Environment**: `.env`, `.gitignore`
- **Documentation**: Keep essential docs like `online-setup.md`

### ❌ Files to Delete (Unused/Redundant)

#### 1. Redundant Nginx Files
Since we're using the Node.js proxy server instead of Nginx:
- `nginx.conf` - Nginx configuration (not used)
- `nginx-setup.md` - Nginx setup guide (replaced by online-setup.md)
- `start-nginx.bat` - Nginx startup script (not used)
- `stop-nginx.bat` - Nginx stop script (not used)
- `find-nginx.bat` - Nginx finder script (not used)

#### 2. Redundant Batch Files
These are replaced by the new proxy server setup:
- `start-network.bat` - Old network startup (replaced by start-online.bat)
- `serve-network.bat` - Old serve script (replaced by proxy-server.js)

#### 3. Unused Documentation
- `DEPLOYMENT.md` - Old deployment guide (replaced by online-setup.md)
- `NETWORK.md` - Old network guide (replaced by online-setup.md)
- `TROUBLESHOOTING.md` - Old troubleshooting (replaced by online-setup.md)

#### 4. Temporary/Unused Files
- `envv.zip` - Temporary environment backup (440 bytes, not needed)

#### 5. Redundant Deployment Configs
- `netlify.toml` - Netlify config (if not using Netlify)
- `vercel.json` - Vercel config (if not using Vercel)

## 🗑️ Safe to Delete Files

### High Priority (Definitely Unused)
```
nginx.conf
nginx-setup.md
start-nginx.bat
stop-nginx.bat
find-nginx.bat
start-network.bat
serve-network.bat
envv.zip
```

### Medium Priority (Likely Unused)
```
DEPLOYMENT.md
NETWORK.md
TROUBLESHOOTING.md
netlify.toml
vercel.json
```

## 📋 Cleanup Commands

### Option 1: Delete High Priority Files Only
```powershell
# Remove nginx-related files
Remove-Item "nginx.conf" -Force
Remove-Item "nginx-setup.md" -Force
Remove-Item "start-nginx.bat" -Force
Remove-Item "stop-nginx.bat" -Force
Remove-Item "find-nginx.bat" -Force

# Remove old batch files
Remove-Item "start-network.bat" -Force
Remove-Item "serve-network.bat" -Force

# Remove temporary files
Remove-Item "envv.zip" -Force
```

### Option 2: Delete All Unused Files
```powershell
# High priority files
Remove-Item "nginx.conf" -Force
Remove-Item "nginx-setup.md" -Force
Remove-Item "start-nginx.bat" -Force
Remove-Item "stop-nginx.bat" -Force
Remove-Item "find-nginx.bat" -Force
Remove-Item "start-network.bat" -Force
Remove-Item "serve-network.bat" -Force
Remove-Item "envv.zip" -Force

# Medium priority files
Remove-Item "DEPLOYMENT.md" -Force
Remove-Item "NETWORK.md" -Force
Remove-Item "TROUBLESHOOTING.md" -Force
Remove-Item "netlify.toml" -Force
Remove-Item "vercel.json" -Force
```

## 📊 Space Savings

### Estimated File Sizes
- **Nginx files**: ~15 KB
- **Old batch files**: ~3 KB  
- **Documentation**: ~15 KB
- **Config files**: ~1 KB
- **Temporary files**: ~1 KB
- **Total savings**: ~35 KB

### Benefits Beyond Space
- ✅ Cleaner project structure
- ✅ Less confusion for new developers
- ✅ Easier maintenance
- ✅ Focused documentation

## ⚠️ Before You Delete

### Backup Important Files
If you're unsure about any files, create a backup:
```powershell
# Create backup folder
New-Item -ItemType Directory -Path "backup" -Force

# Copy files to backup (optional)
Copy-Item "nginx.conf" "backup\" -Force
Copy-Item "nginx-setup.md" "backup\" -Force
```

### Verify Functionality
After cleanup, ensure these still work:
- `npm run online` - Should start proxy server
- `npm run build` - Should build successfully
- `npm start` - Should start development server

## 🔄 What You'll Keep

### Essential Files
- **`proxy-server.js`** - New proxy server (replaces nginx)
- **`start-online.bat`** - New startup script
- **`online-setup.md`** - Comprehensive setup guide
- **All source code** in `src/` and `server/`
- **All config files** (package.json, tsconfig.json, etc.)

### Documentation Structure
After cleanup, you'll have:
- `online-setup.md` - Complete setup and deployment guide
- `README.md` (if exists) - Project overview
- Code comments and inline documentation

## 🎯 Recommended Action

### Start with High Priority Only
```powershell
# Delete definitely unused files first
Remove-Item "nginx.conf","nginx-setup.md","start-nginx.bat","stop-nginx.bat","find-nginx.bat","start-network.bat","serve-network.bat","envv.zip" -Force
```

### Test Everything
```powershell
# Test the application still works
npm run build
npm run online:8080
```

### Then Delete Medium Priority (Optional)
```powershell
# If everything works, delete the rest
Remove-Item "DEPLOYMENT.md","NETWORK.md","TROUBLESHOOTING.md","netlify.toml","vercel.json" -Force
```

## ✅ Expected Result

After cleanup, your project will have:
- Cleaner root directory
- Focused documentation
- Modern proxy server setup
- No confusing duplicate files
- Easier maintenance and onboarding

Your project will be more professional and easier to understand! 🚀
