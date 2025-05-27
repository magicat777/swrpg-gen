import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import type { 
  ApiResponse, 
  User, 
  LoginRequest, 
  LoginResponse 
} from '../../types/api';

/**
 * Authentication API service
 */
export class AuthAPI {
  
  /**
   * User registration
   */
  static async register(userData: {
    username: string;
    email: string;
    password: string;
  }): Promise<ApiResponse<LoginResponse>> {
    return apiPost<LoginResponse>('/auth/register', userData);
  }

  /**
   * User login
   */
  static async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return apiPost<LoginResponse>('/auth/login', credentials);
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiGet<{ user: User }>('/auth/me');
  }

  /**
   * Generate API key for current user
   */
  static async generateApiKey(): Promise<ApiResponse<{ apiKey: string }>> {
    return apiPost<{ apiKey: string }>('/auth/api-key');
  }

  /**
   * Revoke current user's API key
   */
  static async revokeApiKey(): Promise<ApiResponse<{ message: string }>> {
    return apiDelete<{ message: string }>('/auth/api-key');
  }

  /**
   * Validate current authentication status
   */
  static async validateToken(): Promise<boolean> {
    try {
      const response = await this.getProfile();
      return response.status === 'success' && !!response.data?.user;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user preferences
   */
  static async getPreferences(): Promise<ApiResponse<{ preferences: any }>> {
    return apiGet<{ preferences: any }>('/auth/preferences');
  }

  /**
   * Update user preferences
   */
  static async updatePreferences(preferences: any): Promise<ApiResponse<{ preferences: any }>> {
    return apiPut<{ preferences: any }>('/auth/preferences', { preferences });
  }

  /**
   * Change user password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<{ message: string }>> {
    return apiPut<{ message: string }>('/auth/change-password', { 
      currentPassword, 
      newPassword 
    });
  }
}

export default AuthAPI;