export const APP_CONFIG = {
  // Performance settings
  API_TIMEOUT: 10000,
  DEBOUNCE_DELAY: 300,
  
  // App settings
  APP_NAME: 'Barbear.IA',
  VERSION: '1.0.0',
  
  // Development settings
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  ENABLE_DEBUG: process.env.NODE_ENV === 'development',
} as const;

export const ROUTES = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  APPOINTMENTS: '/appointments',
  CLIENTS: '/clients',
  BARBERS: '/barbers',
  SERVICES: '/services',
  SETTINGS: '/settings',
} as const;
