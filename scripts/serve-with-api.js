#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
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
        networkName = 'WiFi Network';
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
function startServeWithAPI() {
  const networkInfo = getLocalIP();
  const localIP = networkInfo.address;
  const interfaceName = networkInfo.name;
  const wifiNetwork = getWiFiNetworkName();
  
  console.log('\n' + '='.repeat(60));
  console.log('🚀 SANGGUNIANG BAYAN - SERVE WITH API');
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
  console.log(`   Frontend: http://${localIP}:3000`);
  console.log(`   Backend:  http://${localIP}:5000`);
  console.log(`   API:      http://${localIP}:5000/api`);
  
  console.log('\n🔧 Configuration:');
  console.log(`   Frontend: Port 3000 (all interfaces)`);
  console.log(`   Backend:  Port 5000 (all interfaces)`);
  console.log(`   Platform: ${process.platform}`);
  
  console.log('\n💡 Process:');
  console.log(`   1. Updating environment variables...`);
  console.log(`   2. Building frontend with new API URL...`);
  console.log(`   3. Starting frontend server...`);
  
  console.log('\n' + '='.repeat(60));
  
  // Step 1: Update environment
  console.log('🔄 Step 1/3: Updating environment...');
  updateEnvFile(localIP);
  
  // Step 2: Build with new environment
  console.log('🔨 Step 2/3: Building frontend...');
  const buildProcess = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });
  
  buildProcess.on('error', (error) => {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  });
  
  buildProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Build failed with code:', code);
      process.exit(code);
    }
    
    console.log('✅ Build completed successfully');
    
    // Step 3: Start frontend server
    console.log('🌐 Step 3/3: Starting frontend server...');
    
    const serveProcess = spawn('serve', ['-s', 'build', '-l', '3000'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..')
    });
    
    serveProcess.on('error', (error) => {
      console.error('❌ Failed to start serve:', error.message);
      console.log('\n💡 Make sure serve is installed:');
      console.log('   npm install -g serve');
      process.exit(1);
    });
    
    console.log('\n🎉 Frontend is now serving!');
    console.log(`📱 Access from mobile: http://${localIP}:3000`);
    console.log(`🔗 API should connect to: http://${localIP}:5000/api`);
    console.log('\nPress Ctrl+C to stop serving');
    console.log('='.repeat(60) + '\n');
    
    serveProcess.on('close', (code) => {
      console.log(`\n⏹️  Serve process exited with code ${code}`);
      process.exit(code);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n⏹️  Shutting down serve...');
      serveProcess.kill('SIGINT');
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log('\n⏹️  Shutting down serve...');
      serveProcess.kill('SIGTERM');
      process.exit(0);
    });
  });
}

// Command line interface
if (require.main === module) {
  startServeWithAPI();
}

module.exports = { startServeWithAPI };
