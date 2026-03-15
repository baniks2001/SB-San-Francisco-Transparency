// Import enhanced URL utilities
import { getImageUrl as getEnhancedImageUrl, getApiUrl as getEnhancedApiUrl, getLogoUrl as getEnhancedLogoUrl } from './urlUtils';
import { getImageUrl as getVercelImageUrl, getApiUrl as getVercelApiUrl, getLogoUrl as getVercelLogoUrl } from './vercelUtils';

// Detect if running on Vercel
const isVercel = () => {
  return typeof window !== 'undefined' && (
    window.location.hostname.includes('vercel.app') || 
    window.location.hostname.includes('.vercel.app')
  );
};

// Use appropriate utilities based on environment
export const getImageUrl = isVercel() ? getVercelImageUrl : getEnhancedImageUrl;
export const getApiUrl = isVercel() ? getVercelApiUrl : getEnhancedApiUrl;
export const getLogoUrl = isVercel() ? getVercelLogoUrl : getEnhancedLogoUrl;
