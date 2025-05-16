'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginInput, LoginResponse } from '@/types/user';
import { login as loginService, logout as logoutService, getStoredToken, getCurrentUser } from '@/services/auth';
import { setAuthToken, removeAuthToken } from '@/lib/graphql';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (input: LoginInput) => Promise<LoginResponse>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ['/signin', '/signup', '/forgot-password'];
const LOGIN_PATH = '/signin';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkTokenExpiration = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        // Token has expired
        handleLogout();
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      handleLogout();
      return false;
    }
  };

  const handleLogout = () => {
    logoutService();
    removeAuthToken();
    setUser(null);
    setToken(null);
    router.push(LOGIN_PATH);
  };

  useEffect(() => {
    // Check for stored token on initial load
    const initializeAuth = async () => {
      const storedToken = getStoredToken();
      if (storedToken) {
        const isValid = checkTokenExpiration(storedToken);
        if (isValid) {
          try {
            setToken(storedToken);
            setAuthToken(storedToken);
            // Fetch user data
            const userData = await getCurrentUser(storedToken);
            // Ensure we handle user with missing role data
            setUser({
              ...userData,
              role: userData.role || null
            });
          } catch (error) {
            console.error('Error fetching user data:', error);
            handleLogout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Force redirect if not authenticated
  useEffect(() => {
    if (!loading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      if (!token && !isPublicRoute) {
        // Not authenticated and trying to access protected route
        router.push(LOGIN_PATH);
      } else if (token && isPublicRoute && pathname !== '/') {
        // Authenticated but trying to access login/register pages
        router.push('/');
      }
    }
  }, [loading, token, pathname]);

  const login = async (input: LoginInput) => {
    try {
      const response = await loginService(input);
      if (response.token) {
        const isValid = checkTokenExpiration(response.token);
        if (!isValid) {
          throw new Error('Invalid or expired token');
        }
        
        // Ensure we handle user with missing role data
        const userData = {
          ...response.user,
          role: response.user.role || null
        };
        
        setUser(userData);
        setToken(response.token);
        setAuthToken(response.token);
        router.push('/');
      }
      return response;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    handleLogout();
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token,
  };

  if (loading) {
    return <div>Loading...</div>; // Or your loading component
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 