import { API_CONFIG } from "@shared/constants/api";
import { AUTH_ENDPOINTS, AUTH_STORAGE_KEYS } from "@shared/constants/auth";
import type { LoginResponse, RefreshResponse, User } from "../types";

/**
 * Auth API Service
 */
export const authApi = {
  /**
   * Login with username and password
   */
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Login failed");
    }

    return response.json();
  },

  /**
   * Logout - blacklist the refresh token
   */
  logout: async (refreshToken: string, accessToken: string): Promise<void> => {
    await fetch(`${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    // We don't throw on logout failure - just clear local storage anyway
  },

  /**
   * Refresh the access token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshResponse> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.REFRESH}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    return response.json();
  },

  /**
   * Get current user info
   */
  getMe: async (accessToken: string): Promise<User> => {
    const response = await fetch(`${API_CONFIG.BASE_URL}${AUTH_ENDPOINTS.ME}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to get user info");
    }

    return response.json();
  },
};

/**
 * Token storage helpers
 */
export const tokenStorage = {
  getAccessToken: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
  },

  getUser: (): User | null => {
    const userStr = localStorage.getItem(AUTH_STORAGE_KEYS.USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setTokens: (access: string, refresh: string, user: User): void => {
    localStorage.setItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN, access);
    localStorage.setItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN, refresh);
    localStorage.setItem(AUTH_STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearTokens: (): void => {
    localStorage.removeItem(AUTH_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(AUTH_STORAGE_KEYS.USER);
  },
};

export default authApi;