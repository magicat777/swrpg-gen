import { apiPost, apiGet } from './apiClient';
import type { ApiResponse } from '../../types/api';

export interface ChatMessage {
  id: string;
  sessionId: string;
  sender: {
    type: 'user' | 'system' | 'character';
    name: string;
    id?: string;
  };
  type: string;
  content: string;
  metadata?: any;
  timestamp: string;
}

export interface SendMessageRequest {
  sessionId: string;
  message: string;
  context?: {
    characters?: string[];
    locations?: string[];
    factions?: string[];
  };
}

export interface SendMessageResponse {
  response: string;
  responseType: 'lore' | 'narrative';
  metadata: {
    isLoreQuery: boolean;
    contextUsed?: boolean;
    timestamp: string;
  };
}

export interface ChatHistoryResponse {
  messages: ChatMessage[];
  metadata: {
    sessionId: string;
    messageCount: number;
    hasMore: boolean;
  };
}

/**
 * Send a chat message to the backend
 */
export const sendChatMessage = async (
  request: SendMessageRequest
): Promise<SendMessageResponse> => {
  const response = await apiPost<SendMessageResponse>('/chat/message', request);
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to send message');
  }
  
  return response.data;
};

/**
 * Get chat history for a session
 */
export const getChatHistory = async (
  sessionId: string,
  limit: number = 20,
  offset: number = 0
): Promise<ChatHistoryResponse> => {
  const response = await apiGet<ChatHistoryResponse>(
    `/chat/history/${sessionId}?limit=${limit}&offset=${offset}`
  );
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get chat history');
  }
  
  return response.data;
};

/**
 * Create a streaming chat connection using Server-Sent Events
 */
export const createChatStream = (
  request: SendMessageRequest,
  onChunk: (chunk: string) => void,
  onComplete: (type: 'lore' | 'narrative') => void,
  onError: (error: string) => void
): EventSource => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  
  // For SSE, we need to send data via URL params or use a different approach
  // For now, let's use the regular API and fall back to non-streaming
  
  // This is a simplified implementation - in production you might want to use WebSockets
  return new EventSource(`${API_BASE_URL}/chat/stream`);
};

/**
 * Check if a message appears to be a lore query
 */
export const isLoreQuery = (message: string): boolean => {
  const loreKeywords = [
    'where was', 'where is', 'who is', 'who was', 'what is', 'what was',
    'tell me about', 'describe', 'explain',
    'luke skywalker', 'darth vader', 'tatooine', 'coruscant', 'rebel alliance', 'empire'
  ];
  
  const lowercaseMessage = message.toLowerCase();
  return loreKeywords.some(keyword => lowercaseMessage.includes(keyword));
};

export default {
  sendChatMessage,
  getChatHistory,
  createChatStream,
  isLoreQuery
};