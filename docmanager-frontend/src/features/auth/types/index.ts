/**
 * User type returned from the API
 */
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Login request payload
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response from the API
 */
export interface LoginResponse {
  access: string;
  refresh: string;
  user: User;
}

/**
 * Refresh token response
 */
export interface RefreshResponse {
  access: string;
}

/**
 * Auth state for context
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth context value
 */
export interface AuthContextValue extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
}