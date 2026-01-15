/**
 * Authentication Constants
 */

// Local storage keys
export const AUTH_STORAGE_KEYS = {
  ACCESS_TOKEN: "docmanager_access_token",
  REFRESH_TOKEN: "docmanager_refresh_token",
  USER: "docmanager_user",
} as const;

// Auth API endpoints
export const AUTH_ENDPOINTS = {
  LOGIN: "/api/auth/login/",
  LOGOUT: "/api/auth/logout/",
  REFRESH: "/api/auth/refresh/",
  ME: "/api/auth/me/",
} as const;

// Route paths
export const AUTH_ROUTES = {
  LOGIN: "/login",
  HOME: "/generator",
} as const;