import { apiGet, apiPost, createEventSource } from './apiClient';
import {
  GenerateNarrativeRequest,
  GenerateDialogueRequest,
  GenerateSceneRequest,
  GenerationTemplates,
  StoryAnalysis,
} from '../../types/api';

export class StoryApi {
  /**
   * Generate narrative continuation
   */
  static async generateNarrative(request: GenerateNarrativeRequest): Promise<{ narrative: string; metadata: Record<string, unknown> }> {
    const response = await apiPost<{ narrative: string; metadata: Record<string, unknown> }>('/story/generate/narrative', request);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate narrative');
    }
    return response.data;
  }

  /**
   * Generate character dialogue
   */
  static async generateDialogue(request: GenerateDialogueRequest): Promise<{ dialogue: string; character: Record<string, unknown>; metadata: Record<string, unknown> }> {
    const response = await apiPost<{ dialogue: string; character: Record<string, unknown>; metadata: Record<string, unknown> }>('/story/generate/dialogue', request);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate dialogue');
    }
    return response.data;
  }

  /**
   * Generate scene description
   */
  static async generateScene(request: GenerateSceneRequest): Promise<{ description: string; location: Record<string, unknown>; metadata: Record<string, unknown> }> {
    const response = await apiPost<{ description: string; location: Record<string, unknown>; metadata: Record<string, unknown> }>('/story/generate/scene', request);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to generate scene');
    }
    return response.data;
  }

  /**
   * Analyze story content
   */
  static async analyzeStory(content: string, sessionId?: string): Promise<{ analysis: StoryAnalysis; metadata: Record<string, unknown> }> {
    const response = await apiPost<{ analysis: StoryAnalysis; metadata: Record<string, unknown> }>('/story/analyze', {
      content,
      sessionId,
      options: {
        includeEntities: true,
        includeSentiment: true,
        includeThemes: true,
        includeContradictions: true,
      },
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to analyze story');
    }
    return response.data;
  }

  /**
   * Get generation templates and options
   */
  static async getTemplates(): Promise<GenerationTemplates> {
    const response = await apiGet<GenerationTemplates>('/story/templates');
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get templates');
    }
    return response.data;
  }

  /**
   * Get assembled context for a session
   */
  static async getSessionContext(
    sessionId: string,
    options?: {
      types?: string[];
      maxTokens?: number;
      maxItems?: number;
    }
  ): Promise<{ context: string; metadata: Record<string, unknown> }> {
    const params = new URLSearchParams();
    if (options?.types) {
      params.append('types', options.types.join(','));
    }
    if (options?.maxTokens) {
      params.append('maxTokens', options.maxTokens.toString());
    }
    if (options?.maxItems) {
      params.append('maxItems', options.maxItems.toString());
    }

    const response = await apiGet<{ context: string; metadata: Record<string, unknown> }>(
      `/story/session/${sessionId}/context?${params.toString()}`
    );
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get session context');
    }
    return response.data;
  }

  /**
   * Validate story content
   */
  static async validateStory(
    content: string,
    sessionId?: string,
    validationRules?: {
      checkConsistency?: boolean;
      checkLore?: boolean;
      checkCharacterVoice?: boolean;
      checkTimeline?: boolean;
    }
  ): Promise<{ validation: Record<string, unknown>; analysis: Record<string, unknown> }> {
    const response = await apiPost<{ validation: Record<string, unknown>; analysis: Record<string, unknown> }>('/story/validate', {
      content,
      sessionId,
      validationRules,
    });
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to validate story');
    }
    return response.data;
  }

  /**
   * Stream narrative generation with Server-Sent Events
   */
  static streamNarrative(
    request: GenerateNarrativeRequest,
    callbacks: {
      onChunk: (chunk: string) => void;
      onContext: (status: string) => void;
      onComplete: () => void;
      onError: (error: string) => void;
    }
  ): () => void {
    const eventSource = createEventSource('/story/stream/narrative');

    // Send the request data via POST first
    apiPost('/story/stream/narrative', request).catch(callbacks.onError);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        switch (event.type) {
          case 'chunk':
            callbacks.onChunk(data.content);
            break;
          case 'context':
            callbacks.onContext(data.status);
            break;
          case 'complete':
            callbacks.onComplete();
            eventSource.close();
            break;
          case 'error':
            callbacks.onError(data.error);
            eventSource.close();
            break;
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error);
        callbacks.onError('Failed to parse server response');
      }
    };

    eventSource.onerror = () => {
      callbacks.onError('Connection to server lost');
      eventSource.close();
    };

    // Return cleanup function
    return () => {
      eventSource.close();
    };
  }
}

export default StoryApi;