#!/usr/bin/env node

const os = require('os');
const { execSync } = require('child_process');

// Get all network interfaces
function getNetworkInterfaces() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const interface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (!interface.internal && interface.family === 'IPv4') {
        ips.push({
          name: name,
          address: interface.address,
          netmask: interface.netmask
        });
      }
    }
  }
  
  return ips;
}

// Get the most likely network IP (not localhost)
function getPrimaryNetworkIP() {
  const interfaces = getNetworkInterfaces();
  
  // Prefer Ethernet over WiFi, then any other interface
  const priorities = ['Ethernet', 'eth0', 'en0', 'Wi-Fi', 'wlan0', 'wlan1'];
  
  for (const priority of priorities) {
    const found = interfaces.find(ip => ip.name.toLowerCase().includes(priority.toLowerCase()));
    if (found) {
      return found.address;
    }
  }
  
  // Return first available IP if no priority found
  return interfaces.length > 0 ? interfaces[0].address : 'localhost';
}

// Generate URLs for different access methods
function generateUrls(ip, frontendPort = 3000, backendPort = 5000) {
  return {
    local: {
      frontend: `http://localhost:${frontendPort}`,
      backend: `http://localhost:${backendPort}`
    },
    network: {
      frontend: `http://${ip}:${frontendPort}`,
      backend: `http://${ip}:${backendPort}`
    },
    qr: {
      frontend: `http://${ip}:${frontendPort}`,
      backend: `http://${ip}:${backendPort}`
    }
  };
}

// Display startup information
function displayStartupInfo() {
  const primaryIP = getPrimaryNetworkIP();
  const urls = generateUrls(primaryIP);
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SANGGUNIANG BAYAN TRANSPARENCY PORTAL');
  console.log('='.repeat(60));
  
  console.log('\n📡 NETWORK ACCESS URLs:');
  console.log('\n🏠 Local Access:');
  console.log(`   Frontend: ${urls.local.frontend}`);
  console.log(`   Backend:  ${urls.local.backend}`);
  
  console.log('\n🌐 Network Access (for other devices):');
  console.log(`   Frontend: ${urls.network.frontend}`);
  console.log(`   Backend:  ${urls.network.backend}`);
  
  console.log('\n📱 QR Code Ready:');
  console.log(`   Scan this URL for mobile access: ${urls.qr.frontend}`);
  
  console.log('\n🔧 Network Interfaces:');
  const interfaces = getNetworkInterfaces();
  interfaces.forEach(ip => {
    console.log(`   ${ip.name}: ${ip.address}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('💡 TIP: Use the Network Access URL on other devices');
  console.log('💡 TIP: Make sure firewall allows ports 3000 and 5000');
  console.log('='.repeat(60) + '\n');
}

// Update .env file with detected IP
function updateEnvFile(ip) {
  const fs = require('fs');
  const path = require('path');
  
  const envPath = path.join(__dirname, '..', '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }
  
  // Update or add the dynamic IP configuration
  const lines = envContent.split('\n');
  let updated = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('REACT_APP_API_URL=')) {
      lines[i] = `REACT_APP_API_URL=http://${ip}:5000/api`;
      updated = true;
    }
    if (lines[i].startsWith('DETECTED_IP=')) {
      lines[i] = `DETECTED_IP=${ip}`;
      updated = true;
    }
  }
  
  if (!updated) {
    lines.push(`DETECTED_IP=${ip}`);
    lines.push(`REACT_APP_API_URL=http://${ip}:5000/api`);
  }
  
  fs.writeFileSync(envPath, lines.join('\n'));
  console.log(`✅ Updated .env with detected IP: ${ip}`);
}

// Main execution
if (require.main === module) {
  const primaryIP = getPrimaryNetworkIP();
  
  // Update environment file
  updateEnvFile(primaryIP);
  
  // Display startup information
  displayStartupInfo();
}

module.exports = {
  getNetworkInterfaces,
  getPrimaryNetworkIP,
  generateUrls,
  displayStartupInfo,
  updateEnvFile
};
