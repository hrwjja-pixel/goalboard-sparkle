import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// API 기본 URL 설정 (api.ts와 동일한 로직)
const getApiBaseUrl = () => {
  const baseUrl = import.meta.env.BASE_URL || '/';
  return baseUrl === '/' ? '' : baseUrl.replace(/\/$/, '');
};

const API_BASE_URL = getApiBaseUrl();

interface User {
  userId: string;
  email: string;
  name: string;
  picture?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token from localStorage on mount
  useEffect(() => {
    const checkAuthConfig = async () => {
      try {
        // Check if OAuth is configured on the server
        const response = await fetch(`${API_BASE_URL}/api/auth/config`);
        const config = await response.json();

        if (!config.oauthEnabled) {
          // OAuth not configured - skip authentication
          console.log('AuthContext: OAuth not configured, skipping authentication');
          setUser({
            userId: 'anonymous',
            email: 'anonymous@localhost',
            name: 'Anonymous User',
          });
          setIsLoading(false);
          return;
        }

        // OAuth is configured - check for stored token
        const storedToken = localStorage.getItem('auth_token');
        if (storedToken) {
          setToken(storedToken);
          fetchUserInfo(storedToken);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        // If config endpoint fails, assume OAuth is not configured
        console.log('AuthContext: Failed to check auth config, skipping authentication');
        setUser({
          userId: 'anonymous',
          email: 'anonymous@localhost',
          name: 'Anonymous User',
        });
        setIsLoading(false);
      }
    };

    checkAuthConfig();
  }, []);

  // Check for token in URL (from OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      login(tokenFromUrl);
      // Remove token from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchUserInfo = async (authToken: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    } catch (error) {
      console.error('Failed to fetch user info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    fetchUserInfo(newToken);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
