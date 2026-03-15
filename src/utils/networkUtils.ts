// Network utility functions for automatic IP detection
export const getLocalIpAddress = async (): Promise<string> => {
  try {
    // Get local IP address from WebRTC
    const pc = new RTCPeerConnection({
      iceServers: [],
    });
    
    pc.createDataChannel('');
    
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    
    return new Promise((resolve) => {
      pc.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate) {
          const candidate = event.candidate.candidate;
          const match = candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
          if (match) {
            const ip = match[0];
            // Filter out local IPs and return the first valid one
            if (!ip.startsWith('127.') && !ip.startsWith('169.254.') && !ip.startsWith('::1')) {
              resolve(ip);
              pc.close();
            }
          }
        }
      };
      
      // Fallback to localhost if no IP found
      setTimeout(() => {
        resolve('localhost');
        pc.close();
      }, 2000);
    });
  } catch (error) {
    console.warn('Failed to get local IP, falling back to localhost:', error);
    return 'localhost';
  }
};

export const getApiBaseUrl = (): string => {
  // Check if we're in development or production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isDevelopment) {
    // In development, use localhost
    return 'http://localhost:5000/api';
  }
  
  // In production, try to detect the current host
  const currentHost = window.location.hostname;
  const currentPort = window.location.port;
  
  // If we're serving from the same machine as the API
  if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  
  // For network access, use the current host with API port
  const protocol = window.location.protocol;
  const apiPort = process.env.REACT_APP_API_PORT || '5000';
  return `${protocol}//${currentHost}:${apiPort}/api`;
};

export const getNetworkInfo = async (): Promise<{
  localIp: string;
  publicIp: string;
  hostname: string;
  port: string;
}> => {
  const localIp = await getLocalIpAddress();
  
  try {
    // Get public IP (optional, for external access)
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    const publicIp = data.ip;
    
    return {
      localIp,
      publicIp,
      hostname: window.location.hostname,
      port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80')
    };
  } catch (error) {
    console.warn('Failed to get public IP:', error);
    return {
      localIp,
      publicIp: localIp,
      hostname: window.location.hostname,
      port: window.location.port || (window.location.protocol === 'https:' ? '443' : '80')
    };
  }
};

// Utility to generate network URLs for serving
export const generateNetworkUrls = async () => {
  const networkInfo = await getNetworkInfo();
  
  return {
    local: `http://localhost:3000`,
    network: `http://${networkInfo.localIp}:3000`,
    public: networkInfo.publicIp !== networkInfo.localIp 
      ? `http://${networkInfo.publicIp}:3000` 
      : `http://${networkInfo.localIp}:3000`,
    current: window.location.origin
  };
};
