// Vercel-specific URL utilities
export const getBaseUrl = (): string => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
};

export const getApiBaseUrl = (): string => {
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  const port = window.location.port;
  
  // For Vercel deployment, API is on the same domain
  if (hostname.includes('vercel.app') || hostname.includes('.vercel.app')) {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  
  // For development with separate ports
  if (process.env.NODE_ENV === 'development' && 
      (hostname === 'localhost' || hostname === '127.0.0.1') && 
      (!port || port === '3000' || port === '3001')) {
    return `http://localhost:5000`;
  }
  
  // For other environments (port forwarding, etc.)
  return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
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
  
  // For Vercel deployment
  const hostname = window.location.hostname;
  if (hostname.includes('vercel.app') || hostname.includes('.vercel.app')) {
    const baseUrl = getBaseUrl();
    return `${baseUrl}/uploads/${cleanPath}`;
  }
  
  // For development with separate ports
  if (process.env.NODE_ENV === 'development' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      (!window.location.port || window.location.port === '3000' || window.location.port === '3001')) {
    return `http://localhost:5000/uploads/${cleanPath}`;
  }
  
  // For other environments (port forwarding, etc.)
  const baseUrl = getBaseUrl();
  return `${baseUrl}/uploads/${cleanPath}`;
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
  
  // For Vercel deployment
  const hostname = window.location.hostname;
  if (hostname.includes('vercel.app') || hostname.includes('.vercel.app')) {
    const baseUrl = getBaseUrl();
    return `${baseUrl}${logoPath}`;
  }
  
  // For development with separate ports
  if (process.env.NODE_ENV === 'development' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
      (!window.location.port || window.location.port === '3000' || window.location.port === '3001')) {
    return `http://localhost:5000${logoPath}`;
  }
  
  // For other environments (port forwarding, etc.)
  const baseUrl = getBaseUrl();
  return `${baseUrl}${logoPath}`;
};

// Utility to get current network information
export const getNetworkInfo = () => {
  return {
    protocol: window.location.protocol,
    hostname: window.location.hostname,
    port: window.location.port,
    origin: window.location.origin,
    apiBaseUrl: getApiBaseUrl(),
    baseUrl: getBaseUrl(),
    isVercel: window.location.hostname.includes('vercel.app') || window.location.hostname.includes('.vercel.app')
  };
};

// Debug helper to log network information
export const debugNetworkInfo = () => {
  const info = getNetworkInfo();
  console.log('Vercel Network Information:', info);
  return info;
};
