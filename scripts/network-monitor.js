#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

// Get WiFi network name (SSID)
function getWiFiNetworkName() {
  try {
    const { execSync } = require('child_process');
    let networkName = 'Unknown Network';
    
    // Windows
    if (process.platform === 'win32') {
      try {
        const output = execSync('netsh wlan show interfaces | findstr "SSID"', { encoding: 'utf8' });
        const match = output.match(/SSID\s*:\s*(.+)/);
        if (match) {
          networkName = match[1].trim();
        }
      } catch (error) {
        // Try alternative Windows command
        try {
          const output = execSync('netsh wlan show name', { encoding: 'utf8' });
          const match = output.match(/SSID\s*:\s*(.+)/);
          if (match) {
            networkName = match[1].trim();
          }
        } catch (error2) {
          networkName = 'WiFi Network';
        }
      }
    }
    // macOS
    else if (process.platform === 'darwin') {
      try {
        const output = execSync('/System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport -I | grep "    SSID : " | sed "s/.*SSID : //"', { encoding: 'utf8' });
        networkName = output.trim();
      } catch (error) {
        networkName = 'WiFi Network';
      }
    }
    // Linux
    else if (process.platform === 'linux') {
      try {
        const output = execSync('iwgetid -r', { encoding: 'utf8' });
        networkName = output.trim();
      } catch (error) {
        try {
          const output = execSync('nmcli -t -f active,ssid dev wifi | grep "^yes:" | cut -d: -f2', { encoding: 'utf8' });
          networkName = output.trim();
        } catch (error2) {
          networkName = 'WiFi Network';
        }
      }
    }
    
    return networkName;
  } catch (error) {
    return 'WiFi Network';
  }
}
class NetworkMonitor {
  constructor() {
    this.currentIP = null;
    this.monitoring = false;
    this.interval = null;
    this.envPath = path.join(__dirname, '..', '.env');
  }

  // Get current network IP
  getCurrentIP() {
    const interfaces = os.networkInterfaces();
    const ips = [];
    
    for (const name of Object.keys(interfaces)) {
      for (const networkInterface of interfaces[name]) {
        if (!networkInterface.internal && networkInterface.family === 'IPv4') {
          ips.push({
            name: name,
            address: networkInterface.address
          });
        }
      }
    }
    
    // Prioritize WiFi/WLAN interfaces
    const priorities = ['Wi-Fi', 'wlan0', 'wlan1', 'Wireless', 'WiFi', 'Ethernet', 'eth0', 'en0'];
    
    for (const priority of priorities) {
      const found = ips.find(ip => ip.name.toLowerCase().includes(priority.toLowerCase()));
      if (found) {
        return found.address;
      }
    }
    
    return ips.length > 0 ? ips[0].address : 'localhost';
  }

  // Update .env file with new IP
  updateEnvFile(newIP) {
    let envContent = '';
    
    if (fs.existsSync(this.envPath)) {
      envContent = fs.readFileSync(this.envPath, 'utf8');
    }
    
    const lines = envContent.split('\n');
    let updated = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith('DETECTED_IP=')) {
        lines[i] = `DETECTED_IP=${newIP}`;
        updated = true;
      }
      if (lines[i].startsWith('REACT_APP_API_URL=')) {
        lines[i] = `REACT_APP_API_URL=http://${newIP}:5000/api`;
        updated = true;
      }
    }
    
    if (!updated) {
      lines.push(`DETECTED_IP=${newIP}`);
      lines.push(`REACT_APP_API_URL=http://${newIP}:5000/api`);
    }
    
    fs.writeFileSync(this.envPath, lines.join('\n'));
    console.log(`🔄 Updated IP: ${newIP}`);
  }

  // Start network monitoring
  startMonitoring(intervalMs = 5000) {
    if (this.monitoring) {
      console.log('⚠️  Network monitoring already running');
      return;
    }

    console.log('🔍 Starting network monitoring...');
    this.monitoring = true;
    this.currentIP = this.getCurrentIP();
    
    console.log(`📡 Current IP: ${this.currentIP}`);
    this.updateEnvFile(this.currentIP);

    this.interval = setInterval(() => {
      const newIP = this.getCurrentIP();
      
      if (newIP !== this.currentIP) {
        console.log(`🌐 IP changed from ${this.currentIP} to ${newIP}`);
        this.currentIP = newIP;
        this.updateEnvFile(newIP);
        
        // Optionally restart servers on IP change
        console.log('💡 Consider restarting servers to use new IP');
      }
    }, intervalMs);
  }

  // Stop network monitoring
  stopMonitoring() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.monitoring = false;
    console.log('⏹️  Network monitoring stopped');
  }

  // Get network status
  getNetworkStatus() {
    const interfaces = os.networkInterfaces();
    const activeInterfaces = [];
    
    for (const name of Object.keys(interfaces)) {
      for (const networkInterface of interfaces[name]) {
        if (!networkInterface.internal && networkInterface.family === 'IPv4') {
          activeInterfaces.push({
            name: name,
            address: networkInterface.address,
            netmask: networkInterface.netmask
          });
        }
      }
    }
    
    return {
      currentIP: this.currentIP,
      interfaces: activeInterfaces,
      monitoring: this.monitoring
    };
  }
}

// Enhanced startup script with continuous monitoring
function startWithMonitoring() {
  const monitor = new NetworkMonitor();
  const wifiNetwork = getWiFiNetworkName();
  
  // Initial network detection
  const initialIP = monitor.getCurrentIP();
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SANGGUNIANG BAYAN - NETWORK MONITORING STARTUP');
  console.log('='.repeat(60));
  console.log(`📡 WiFi Network: ${wifiNetwork}`);
  console.log(`📡 Initial IP: ${initialIP}`);
  
  // Update environment
  monitor.updateEnvFile(initialIP);
  
  // Display URLs
  console.log('\n🌐 Access URLs:');
  console.log(`   Local:    http://localhost:3000`);
  console.log(`   Network:  http://${initialIP}:3000`);
  console.log(`   Backend:  http://${initialIP}:5000`);
  
  console.log('\n🔍 Starting continuous network monitoring...');
  console.log('💡 IP changes will be detected automatically');
  console.log('💡 Press Ctrl+C to stop monitoring');
  console.log('='.repeat(60) + '\n');
  
  // Start monitoring
  monitor.startMonitoring(3000); // Check every 3 seconds
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⏹️  Shutting down network monitoring...');
    monitor.stopMonitoring();
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n⏹️  Shutting down network monitoring...');
    monitor.stopMonitoring();
    process.exit(0);
  });
  
  return monitor;
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'monitor':
      startWithMonitoring();
      break;
      
    case 'check':
      const monitor = new NetworkMonitor();
      const status = monitor.getNetworkStatus();
      const wifiNetwork = getWiFiNetworkName();
      console.log('📡 Network Status:');
      console.log(`   WiFi Network: ${wifiNetwork}`);
      console.log(`   Current IP: ${status.currentIP}`);
      console.log(`   Monitoring: ${status.monitoring ? 'Yes' : 'No'}`);
      console.log('   Interfaces:');
      status.interfaces.forEach(ip => {
        console.log(`     ${ip.name}: ${ip.address}`);
      });
      break;
      
    case 'update':
      const updateMonitor = new NetworkMonitor();
      const ip = updateMonitor.getCurrentIP();
      updateMonitor.updateEnvFile(ip);
      console.log(`✅ Updated IP: ${ip}`);
      break;
      
    default:
      startWithMonitoring();
  }
}

module.exports = NetworkMonitor;
