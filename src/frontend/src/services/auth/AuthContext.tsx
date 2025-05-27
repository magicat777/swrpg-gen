import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../../types/api';
import { setAuthToken } from '../api/apiClient';
import { AuthAPI } from '../api/authApi';
import { AuthPersistence } from './authPersistence';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const logout = useCallback((): void => {
    // Clear auth state
    setUser(null);
    setAuthToken(null);
    
    // Clear all stored auth data
    AuthPersistence.clearAuthData();
    
    console.log('🔐 User logged out');
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await AuthAPI.getProfile();
      
      if (response.status === 'success' && response.data?.user) {
        setUser(response.data.user);
        
        // Update stored user data
        localStorage.setItem('user_data', JSON.stringify(response.data.user));
        
        console.log('User profile refreshed:', response.data.user.username);
      } else {
        throw new Error('Failed to get user profile');
      }
      
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might need to login again
      logout();
      throw error;
    }
  }, [logout]);

  // Initialize auth state from persistent storage
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      // Try to restore auth from persistent storage
      const authState = AuthPersistence.initializeAuth();
      
      if (authState.isAuthenticated && authState.token) {
        try {
          // Set token for API calls
          setAuthToken(authState.token);
          
          // Validate token with backend
          const isValid = await AuthPersistence.validateTokenWithBackend();
          
          if (isValid) {
            setUser(authState.user);
            console.log('🔐 Auth restored from storage:', authState.user.username);
          } else {
            console.log('🔐 Stored token invalid, clearing auth');
            logout();
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          // Token is invalid, clear it
          setAuthToken(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, [logout]);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await AuthAPI.login(credentials);
      
      if (response.status === 'success' && response.data) {
        const { user: userData, token } = response.data;
        
        // Store token and update auth state
        setAuthToken(token);
        setUser(userData);
        
        // Save auth data with persistence manager
        AuthPersistence.saveAuthData(token, userData);
        
        console.log('🔐 Login successful:', userData.username);
      } else {
        throw new Error(response.message || 'Login failed');
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Login failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      
      const response = await AuthAPI.register(userData);
      
      if (response.status === 'success' && response.data) {
        const { user: newUser, token } = response.data;
        
        // Store token and update auth state
        setAuthToken(token);
        setUser(newUser);
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user_data', JSON.stringify(newUser));
        
        console.log('Registration successful:', newUser.username);
      } else {
        throw new Error(response.message || 'Registration failed');
      }
      
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract meaningful error message
      let errorMessage = 'Registration failed';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;