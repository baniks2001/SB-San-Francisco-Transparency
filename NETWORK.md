# Network Monitoring & Auto-Detection System

This system automatically detects and monitors your network IP address, ensuring your Sangguniang Bayan Transparency Portal is always accessible from other devices on your network.

## 🚀 Quick Start

### Default Startup (Recommended)
```bash
npm start
```
This starts with continuous network monitoring enabled.

### Windows Users
```bash
start-network.bat
```
Double-click this file for easy startup with monitoring.

## 📡 Available Commands

### Development Commands
- `npm start` - Start with continuous network monitoring (default)
- `npm run start:network` - Start with one-time network detection
- `npm run start:dev` - Start without network detection
- `npm run start:monitor` - Start with continuous monitoring

### Production Commands
- `npm run serve` - Build and serve with continuous monitoring
- `npm run serve:network` - Build and serve with one-time detection
- `npm run serve:monitor` - Build and serve with continuous monitoring

### Network Management
- `npm run network:check` - Check current network status
- `npm run network:update` - Manually update IP address

## 🌐 How It Works

### Automatic IP Detection
1. **Prioritizes WiFi/WLAN** interfaces for mobile access
2. **Falls back to Ethernet** if WiFi not available
3. **Updates .env file** automatically with detected IP
4. **Provides multiple access URLs** for different scenarios

### Continuous Monitoring
- **Checks every 3 seconds** for IP changes
- **Auto-updates configuration** when IP changes
- **Logs all changes** for debugging
- **Graceful shutdown** on Ctrl+C

### Access URLs
- **Local**: `http://localhost:3000` (same machine)
- **Network**: `http://[YOUR_IP]:3000` (other devices)
- **Backend**: `http://[YOUR_IP]:5000` (API access)

## 📱 Network Access Examples

### From Mobile/Tablet
1. Connect to the same WiFi network
2. Use the Network URL shown in startup
3. Access from any device on the network

### From Another Computer
1. Ensure same network connection
2. Use the Network URL in browser
3. Full functionality available

## 🔧 Configuration

### Environment Variables
```env
# Auto-detected (updated automatically)
DETECTED_IP=192.168.1.4
REACT_APP_API_URL=http://192.168.1.4:5000/api

# Network settings
AUTO_DETECT_IP=true
NETWORK_INTERFACE_PRIORITY=Wi-Fi,Ethernet,wlan0,eth0
```

### Monitoring Settings
- **Check Interval**: 3 seconds (configurable)
- **Priority Interfaces**: WiFi > Ethernet > Others
- **Auto-update**: Enabled by default

## 🛠️ Troubleshooting

### IP Not Detected
```bash
npm run network:check
```
Check if network interfaces are available.

### Manual IP Update
```bash
npm run network:update
```
Force update with current IP.

### Network Access Not Working
1. Check firewall settings (ports 3000, 5000)
2. Verify same network connection
3. Use `npm run network:check` to see detected IPs

### Monitoring Issues
- Stop monitoring: Ctrl+C in Network Monitor window
- Restart: `npm start` again
- Check status: `npm run network:check`

## 📋 Features

### ✅ Automatic Features
- [x] IP auto-detection on startup
- [x] Continuous monitoring for changes
- [x] Automatic .env file updates
- [x] Multi-interface support (WiFi, Ethernet)
- [x] Priority-based interface selection

### ✅ User Interface
- [x] Network Info component (development only)
- [x] Real-time IP display
- [x] Click-to-copy URLs
- [x] Mobile-friendly interface

### ✅ Development Tools
- [x] Windows batch file support
- [x] Command-line network tools
- [x] Status checking commands
- [x] Manual override options

## 🔄 IP Change Detection

The system monitors for:
- **Network interface changes** (WiFi to Ethernet)
- **IP address changes** (DHCP renewal)
- **New network connections** (different WiFi)
- **Interface disconnection** (cable unplugged)

When changes are detected:
1. **Logs the change** with timestamps
2. **Updates .env file** automatically
3. **Displays new URLs** for access
4. **Continues monitoring** for further changes

## 📊 Network Status Output

```
📡 Network Status:
   Current IP: 192.168.1.4
   Monitoring: Yes
   Interfaces:
     Wi-Fi: 192.168.1.4
     Ethernet 3: 192.168.56.1
```

## 🔒 Security Notes

- **Local network only** - No external internet access required
- **Firewall friendly** - Uses standard web ports
- **No data exposure** - Only serves local network
- **Auto-updates local** - Changes only affect your configuration

## 💡 Tips

### Best Performance
- Use **WiFi** for mobile device access
- Use **Ethernet** for desktop stability
- **Close other apps** using ports 3000/5000

### Mobile Access
- **Connect to same WiFi** as development machine
- **Use Network URL** (not localhost)
- **Refresh browser** if IP changes

### Development Workflow
1. **Start with monitoring**: `npm start`
2. **Check network status**: `npm run network:check`
3. **Access from mobile**: Use Network URL
4. **IP changes automatically** handled

---

🎯 **Result**: Your system is now always accessible from any device on your network, with automatic IP change detection and updates!
