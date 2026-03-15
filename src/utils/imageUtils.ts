// Import enhanced URL utilities
import { getImageUrl as getEnhancedImageUrl, getApiBaseUrl as getEnhancedApiUrl, getLogoUrl as getEnhancedLogoUrl } from './urlUtils';

// Re-export the enhanced functions for backward compatibility
export const getImageUrl = getEnhancedImageUrl;
export const getApiUrl = getEnhancedApiUrl;
export const getLogoUrl = getEnhancedLogoUrl;
