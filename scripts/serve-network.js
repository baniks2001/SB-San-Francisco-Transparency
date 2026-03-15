#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

// Get the current IP address and WiFi network name
function getLocalIP() {
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
      return found;
    }
  }
  
  return ips.length > 0 ? ips[0] : { name: 'localhost', address: 'localhost' };
}

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

// Update .env file with network IP
function updateEnvFile(ip) {
  const fs = require('fs');
  const envPath = path.join(__dirname, '..', '.env');
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  const lines = envContent.split('\n');
  let updated = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('DETECTED_IP=')) {
      lines[i] = `DETECTED_IP=${ip}`;
      updated = true;
    }
    if (lines[i].startsWith('REACT_APP_API_URL=')) {
      lines[i] = `REACT_APP_API_URL=http://${ip}:5000/api`;
      updated = true;
    }
  }
  
  if (!updated) {
    lines.push(`DETECTED_IP=${ip}`);
    lines.push(`REACT_APP_API_URL=http://${ip}:5000/api`);
  }
  
  fs.writeFileSync(envPath, lines.join('\n'));
  console.log(`✅ Updated .env with IP: ${ip}`);
}

// Start serve with network configuration
function startNetworkServe() {
  const networkInfo = getLocalIP();
  const localIP = networkInfo.address;
  const interfaceName = networkInfo.name;
  const wifiNetwork = getWiFiNetworkName();
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SANGGUNIANG BAYAN - NETWORK SERVE');
  console.log('='.repeat(60));
  
  // Update environment
  updateEnvFile(localIP);
  
  // Display network information
  console.log('\n📡 Network Information:');
  console.log(`   Interface: ${interfaceName}`);
  console.log(`   IP Address: ${localIP}`);
  console.log(`   WiFi Network: ${wifiNetwork}`);
  
  // Display access URLs
  console.log('\n🌐 Access URLs:');
  console.log(`   Local:    http://localhost:3000`);
  console.log(`   Network:  http://${localIP}:3000`);
  console.log(`   API:      http://${localIP}:5000`);
  
  console.log('\n🔧 Configuration:');
  console.log(`   Host:     0.0.0.0 (accepts all connections)`);
  console.log(`   Port:     3000`);
  console.log(`   Platform: ${process.platform}`);
  
  console.log('\n💡 Access Instructions:');
  console.log(`   1. Connect devices to "${wifiNetwork}"`);
  console.log(`   2. Use Network URL on other devices`);
  console.log(`   3. Make sure firewall allows port 3000`);
  
  console.log('\n' + '='.repeat(60));
  console.log('🌐 Starting network serve...');
  console.log('Press Ctrl+C to stop serving');
  console.log('='.repeat(60) + '\n');
  
  // Start serve with network configuration
  const serveProcess = spawn('serve', ['-s', 'build', '-l', '3000', '-h', '0.0.0.0'], {
    stdio: 'inherit',
    shell: true
  });
  
  serveProcess.on('error', (error) => {
    console.error('❌ Failed to start serve:', error.message);
    console.log('\n💡 Make sure serve is installed:');
    console.log('   npm install -g serve');
    process.exit(1);
  });
  
  serveProcess.on('close', (code) => {
    console.log(`\n⏹️  Serve process exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⏹️  Shutting down network serve...');
    serveProcess.kill('SIGINT');
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n⏹️  Shutting down network serve...');
    serveProcess.kill('SIGTERM');
    process.exit(0);
  });
}

// Command line interface
if (require.main === module) {
  const command = process.argv[2];
  
  switch (command) {
    case 'check':
      const networkInfo = getLocalIP();
      const wifiNetwork = getWiFiNetworkName();
      console.log(`📡 Network Information:`);
      console.log(`   Interface: ${networkInfo.name}`);
      console.log(`   IP Address: ${networkInfo.address}`);
      console.log(`   WiFi Network: ${wifiNetwork}`);
      console.log(`   Network URL: http://${networkInfo.address}:3000`);
      break;
      
    case 'update':
      updateEnvFile(getLocalIP().address);
      break;
      
    default:
      startNetworkServe();
  }
}

module.exports = { getLocalIP, updateEnvFile, startNetworkServe };
