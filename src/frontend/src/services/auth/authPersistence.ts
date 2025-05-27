// Authentication Persistence Manager
// Handles token storage, validation, and automatic refresh

interface StoredAuthData {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    roles: string[];
  };
  expiresAt: number;
  lastValidated: number;
}

const AUTH_STORAGE_KEY = 'swrpg_auth_data';
const TOKEN_REFRESH_THRESHOLD = 60 * 60 * 1000; // 1 hour before expiry

export class AuthPersistence {
  
  static saveAuthData(token: string, user: any): void {
    try {
      // Decode JWT to get expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      const authData: StoredAuthData = {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles
        },
        expiresAt: payload.exp * 1000, // Convert to milliseconds
        lastValidated: Date.now()
      };
      
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      console.log('🔐 Auth data saved with expiration:', new Date(authData.expiresAt));
      
    } catch (error) {
      console.error('Failed to save auth data:', error);
    }
  }
  
  static getAuthData(): StoredAuthData | null {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!data) return null;
      
      const authData: StoredAuthData = JSON.parse(data);
      
      // Check if token is expired
      if (Date.now() >= authData.expiresAt) {
        console.log('🔐 Token expired, clearing auth data');
        this.clearAuthData();
        return null;
      }
      
      return authData;
      
    } catch (error) {
      console.error('Failed to get auth data:', error);
      this.clearAuthData();
      return null;
    }
  }
  
  static clearAuthData(): void {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('auth_token'); // Clear legacy token storage
    console.log('🔐 Auth data cleared');
  }
  
  static isTokenValid(): boolean {
    const authData = this.getAuthData();
    if (!authData) return false;
    
    const now = Date.now();
    const isValid = now < authData.expiresAt;
    
    if (!isValid) {
      this.clearAuthData();
    }
    
    return isValid;
  }
  
  static needsRefresh(): boolean {
    const authData = this.getAuthData();
    if (!authData) return false;
    
    const now = Date.now();
    const timeUntilExpiry = authData.expiresAt - now;
    
    return timeUntilExpiry < TOKEN_REFRESH_THRESHOLD;
  }
  
  static getToken(): string | null {
    const authData = this.getAuthData();
    return authData?.token || null;
  }
  
  static getUser(): any | null {
    const authData = this.getAuthData();
    return authData?.user || null;
  }
  
  static updateLastValidated(): void {
    const authData = this.getAuthData();
    if (authData) {
      authData.lastValidated = Date.now();
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    }
  }
  
  // Validate token with backend
  static async validateTokenWithBackend(): Promise<boolean> {
    try {
      const token = this.getToken();
      if (!token) return false;
      
      const response = await fetch('http://localhost:3000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        this.updateLastValidated();
        return true;
      } else {
        console.log('🔐 Token validation failed, clearing auth data');
        this.clearAuthData();
        return false;
      }
      
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }
  
  // Initialize auth state from storage
  static initializeAuth(): { isAuthenticated: boolean; user: any; token: string | null } {
    const authData = this.getAuthData();
    
    if (authData && this.isTokenValid()) {
      return {
        isAuthenticated: true,
        user: authData.user,
        token: authData.token
      };
    }
    
    return {
      isAuthenticated: false,
      user: null,
      token: null
    };
  }
}

export default AuthPersistence;