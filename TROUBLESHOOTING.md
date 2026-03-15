# Network Access Troubleshooting Guide

If you can't access the site from other devices, follow these steps:

## 🔧 Quick Fixes

### 1. Use the New Network Serve Command
```bash
npm run serve
```
This now uses network-enabled serving by default.

### 2. Windows Users
```bash
serve-network.bat
```
Double-click this file for network serving.

### 3. Check Network Status
```bash
npm run network:check
```
Verify your IP address is detected correctly.

## 🌐 Network Access Verification

### Step 1: Check Your IP
```bash
npm run network:check
```
Output should show:
```
📡 Network Status:
   Current IP: 192.168.1.4
   Interfaces:
     Wi-Fi: 192.168.1.4
```

### Step 2: Start Network Serve
```bash
npm run serve
```
Look for this output:
```
📡 SERVE URLs:
   Local:    http://localhost:3000
   Network:  http://192.168.1.4:3000
   Host:     0.0.0.0 (accepts all connections)
```

### Step 3: Test Access
1. **On the same device**: Use `http://localhost:3000`
2. **On other devices**: Use `http://192.168.1.4:3000` (replace with your IP)

## 🛠️ Common Issues & Solutions

### Issue: "Site Can't Be Reached"
**Cause**: Serve not configured for network access  
**Solution**: Use `npm run serve` instead of `serve -s build`

### Issue: "Connection Refused"
**Cause**: Firewall blocking port 3000  
**Solution**: 
- Windows: Allow Node.js/serve through Windows Firewall
- Mac: Allow in Security & Privacy settings
- Antivirus: Add exception for port 3000

### Issue: "Wrong IP Address"
**Cause**: IP changed or wrong interface detected  
**Solution**: 
```bash
npm run network:update
npm run network:check
```

### Issue: "Only Works on Host Machine"
**Cause**: Serve binding to localhost only  
**Solution**: The new serve script binds to `0.0.0.0` (all interfaces)

### Issue: "Mobile Can't Connect"
**Cause**: Different network or mobile data  
**Solution**: 
- Connect mobile to same WiFi
- Turn off mobile data
- Use WiFi IP address

## 🔍 Debugging Steps

### 1. Verify Network Interface
```bash
npm run network:check
```
Check that your WiFi interface is detected with correct IP.

### 2. Test Local Access
Open `http://localhost:3000` on the host machine - should work.

### 3. Test Network Access
Open `http://[YOUR_IP]:3000` on the host machine - should work.

### 4. Test From Other Device
Open `http://[YOUR_IP]:3000` from another device on same network.

### 5. Check Firewall
```bash
# Windows (Admin PowerShell)
New-NetFirewallRule -DisplayName "Node.js Port 3000" -Direction Inbound -Port 3000 -Protocol TCP -Action Allow

# Or temporarily disable for testing
# Windows Security -> Firewall -> Allow apps
```

## 📱 Mobile Device Testing

### Android
1. Connect to same WiFi
2. Open Chrome
3. Enter `http://[YOUR_IP]:3000`
4. Ignore security warnings (if any)

### iPhone/iPad
1. Connect to same WiFi
2. Open Safari
3. Enter `http://[YOUR_IP]:3000`
4. Allow if prompted

## 🔧 Advanced Configuration

### Force Specific Interface
Edit `.env`:
```env
DETECTED_IP=192.168.1.100  # Your specific IP
```

### Change Port
Edit package.json serve script:
```json
"serve": "node scripts/serve-network.js -p 8080"
```

### Debug Mode
```bash
DEBUG=serve:* npm run serve
```

## 🚀 Emergency Commands

### Reset Network Config
```bash
npm run network:update
npm run serve
```

### Force Rebuild
```bash
rm -rf build
npm run build
npm run serve
```

### Check All Processes
```bash
netstat -ano | findstr :3000
taskkill /PID [PROCESS_ID] /F
npm run serve
```

## 💡 Pro Tips

### Best Performance
- Use **WiFi** for mobile devices
- **Close other apps** using port 3000
- **Restart serve** after network changes

### Security Notes
- Network access is **local only** (same WiFi/router)
- **No internet exposure** - only your local network
- **Safe for development** - no external access

### Multiple Devices
- **Unlimited devices** can connect on same network
- **Same URL** works for all devices
- **Real-time updates** when IP changes

---

## 🎯 Quick Start Checklist

1. ✅ `npm run build` - Build the app
2. ✅ `npm run network:check` - Verify IP detection  
3. ✅ `npm run serve` - Start network serving
4. ✅ Test `http://localhost:3000` - Local access
5. ✅ Test `http://[YOUR_IP]:3000` - Network access
6. ✅ Test from mobile device - Cross-device access

If all steps pass, your system is accessible from any device on your network! 🌐
