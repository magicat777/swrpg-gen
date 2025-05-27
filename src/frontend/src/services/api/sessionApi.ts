import { apiGet, apiPost, apiPut, apiDelete } from './apiClient';
import {
  Session,
  CreateSessionRequest,
  Message,
} from '../../types/api';

export class SessionApi {
  /**
   * Create a new session
   */
  static async createSession(request: CreateSessionRequest): Promise<Session> {
    const response = await apiPost<Session>('/sessions', request);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create session');
    }
    return response.data;
  }

  /**
   * Get all sessions for the current user
   */
  static async getSessions(): Promise<Session[]> {
    const response = await apiGet<Session[]>('/sessions');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get sessions');
    }
    return response.data;
  }

  /**
   * Get a specific session by ID
   */
  static async getSession(sessionId: string): Promise<Session> {
    const response = await apiGet<Session>(`/sessions/${sessionId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get session');
    }
    return response.data;
  }

  /**
   * Update a session
   */
  static async updateSession(sessionId: string, updates: Partial<Session>): Promise<Session> {
    const response = await apiPut<Session>(`/sessions/${sessionId}`, updates);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update session');
    }
    return response.data;
  }

  /**
   * Delete a session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    const response = await apiDelete(`/sessions/${sessionId}`);
    if (!response.success) {
      throw new Error(response.error || 'Failed to delete session');
    }
  }

  /**
   * Get messages for a session
   */
  static async getSessionMessages(
    sessionId: string,
    options?: {
      limit?: number;
      offset?: number;
      type?: string;
    }
  ): Promise<Message[]> {
    const params = new URLSearchParams();
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.offset) {
      params.append('offset', options.offset.toString());
    }
    if (options?.type) {
      params.append('type', options.type);
    }

    const response = await apiGet<Message[]>(
      `/sessions/${sessionId}/messages?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get session messages');
    }
    return response.data;
  }

  /**
   * Add a message to a session
   */
  static async addMessage(sessionId: string, message: Omit<Message, 'id' | 'timestamp'>): Promise<Message> {
    const response = await apiPost<Message>(`/sessions/${sessionId}/messages`, message);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to add message');
    }
    return response.data;
  }

  /**
   * Search messages within a session
   */
  static async searchMessages(
    sessionId: string,
    query: string,
    options?: {
      limit?: number;
      type?: string;
    }
  ): Promise<Message[]> {
    const params = new URLSearchParams();
    params.append('q', query);
    if (options?.limit) {
      params.append('limit', options.limit.toString());
    }
    if (options?.type) {
      params.append('type', options.type);
    }

    const response = await apiGet<Message[]>(
      `/sessions/${sessionId}/messages/search?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to search messages');
    }
    return response.data;
  }

  /**
   * Get session statistics
   */
  static async getSessionStats(sessionId: string): Promise<{
    messageCount: number;
    characterCount: number;
    locationCount: number;
    totalTokens: number;
    lastActivity: string;
  }> {
    const response = await apiGet<{
      messageCount: number;
      characterCount: number;
      locationCount: number;
      totalTokens: number;
      lastActivity: string;
    }>(`/sessions/${sessionId}/stats`);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get session statistics');
    }
    return response.data;
  }
}

export default SessionApi;