// API Configuration
// Environment-aware API base URLs and prefixes

export const API_BASE_URL = process.env.NODE_ENV === 'development' ? '' : 'http://localhost:8080';
export const API_PREFIX = process.env.NODE_ENV === 'development' ? '/api/v1' : '/mutil_agent/api/v1';
export const PUBLIC_PREFIX = process.env.NODE_ENV === 'development' ? '/public/api/v1' : '/mutil_agent/public/api/v1';

export const API_TIMEOUT = 60000; // 60 seconds
