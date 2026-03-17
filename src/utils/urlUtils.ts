// Enhanced URL utilities for better network handling
export const getBaseUrl = (): string => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

export const getApiBaseUrl = (): string => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const currentPort = window.location.port;
  
  // Check if running in dev tunnel
  const isDevTunnel = hostname.includes('asse.devtunnels.ms') ||
                     hostname.includes('loca.lt') ||
                     hostname.includes('ngrok');
  
  if (isDevTunnel) {
    // Use the same tunnel domain but port 5000 for API
    // Replace -3000 with -5000 for dev tunnels
    if (hostname.includes('-3000')) {
      return `${protocol}//${hostname.replace('-3000', '-5000')}`;
    }
    // For other tunnels, just change the port concept
    return `${protocol}//${hostname}`;
  }
  
  // API port configuration
  const apiPort = process.env.REACT_APP_API_PORT || '5000';
  
  // Handle different environments
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:${apiPort}`;
  }
  
  // For port forwarded or network access
  if (currentPort && currentPort !== '80' && currentPort !== '443') {
    return `${protocol}//${hostname}:${apiPort}`;
  }
  
  // Default for production
  return `${protocol}//${hostname}:${apiPort}`;
};

export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Handle different types of URLs
  if (imagePath.startsWith('data:')) {
    // Base64 encoded image
    return imagePath;
  }
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    // Already a full URL
    return imagePath;
  }
  
  // Relative path - construct full URL
  const apiBaseUrl = getApiBaseUrl();
  return `${apiBaseUrl}/uploads/${cleanPath}`;
};

export const getLogoUrl = (logoPath: string): string => {
  if (!logoPath) return '';
  
  // Handle different types of URLs
  if (logoPath.startsWith('data:')) {
    // Base64 encoded image
    return logoPath;
  }
  
  if (logoPath.startsWith('http://') || logoPath.startsWith('https://')) {
    // Already a full URL
    return logoPath;
  }
  
  // Relative path - construct full URL
  const apiBaseUrl = getApiBaseUrl();
  return `${apiBaseUrl}${logoPath}`;
};

// Utility to get current network information
export const getNetworkInfo = () => {
  return {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    origin: window.location.origin,
    apiBaseUrl: getApiBaseUrl(),
    baseUrl: getBaseUrl()
  };
};

// Debug helper to log network information
export const debugNetworkInfo = () => {
  const info = getNetworkInfo();
  console.log('Network Information:', info);
  return info;
};
