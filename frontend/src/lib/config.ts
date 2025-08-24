// API Configuration
export const API_CONFIG = {
  // Use environment variable or fallback to localhost for development
  baseURL: (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000',
  timeout: 30000,
  withCredentials: true
};

// Helper function to build API URLs
export const buildApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.baseURL.replace(/\/$/, ''); // Remove trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
};

// Environment check
export const isDevelopment = (import.meta as any).env?.MODE === 'development';
export const isProduction = (import.meta as any).env?.MODE === 'production';