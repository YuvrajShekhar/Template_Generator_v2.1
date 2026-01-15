import * as React from "react";
import { authApi, tokenStorage } from "../services/authApi";
import type { AuthContextValue, User } from "../types";

const AuthContext = React.createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Check for existing auth on mount
  React.useEffect(() => {
    const initAuth = async () => {
      const accessToken = tokenStorage.getAccessToken();
      const storedUser = tokenStorage.getUser();

      if (accessToken && storedUser) {
        // Verify token is still valid by calling /me
        try {
          const currentUser = await authApi.getMe(accessToken);
          setUser(currentUser);
        } catch {
          // Token is invalid, try to refresh
          const refreshed = await refreshAccessToken();
          if (!refreshed) {
            // Refresh failed, clear everything
            tokenStorage.clearTokens();
          }
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    const response = await authApi.login(username, password);
    tokenStorage.setTokens(response.access, response.refresh, response.user);
    setUser(response.user);
  };

  const logout = async (): Promise<void> => {
    const accessToken = tokenStorage.getAccessToken();
    const refreshToken = tokenStorage.getRefreshToken();

    if (refreshToken && accessToken) {
      try {
        await authApi.logout(refreshToken, accessToken);
      } catch {
        // Ignore logout errors
      }
    }

    tokenStorage.clearTokens();
    setUser(null);
  };

  const refreshAccessToken = async (): Promise<string | null> => {
    const refreshToken = tokenStorage.getRefreshToken();

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await authApi.refreshToken(refreshToken);
      const currentUser = tokenStorage.getUser();

      if (currentUser) {
        tokenStorage.setTokens(response.access, refreshToken, currentUser);
        return response.access;
      }

      return null;
    } catch {
      tokenStorage.clearTokens();
      setUser(null);
      return null;
    }
  };

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthContext;