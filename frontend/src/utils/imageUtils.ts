// Helper function for dynamic image URLs
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // Remove leading slash if present
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Check if running on network vs localhost
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `http://localhost:5000/uploads/${cleanPath}`;
  } else {
    return `http://${hostname}:5000/uploads/${cleanPath}`;
  }
};

// Helper function for dynamic API base URL
export const getApiUrl = (): string => {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5000';
  } else {
    return `http://${hostname}:5000`;
  }
};
