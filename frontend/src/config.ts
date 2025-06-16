// API Configuration
export const API_CONFIG = {
  // BASE_URL: 'https://hazy-eng.apifree.site/api',
  BASE_URL: 'http://localhost:8000/api',
  AUTH: {
    TOKEN: '/token',
  },
  WORDS: {
    BASE: '/words',
  },
} as const;

// Helper function to get full API URL
export const getApiUrl = (path: string): string => {
  return `${API_CONFIG.BASE_URL}${path}`;
};
