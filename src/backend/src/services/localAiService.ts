import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { promises as fs } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  top_p?: number;
  max_tokens?: number;
  stream?: boolean;
  stop?: string[];
}

export interface CompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
    index: number;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface CompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    delta: {
      content?: string;
    };
    finish_reason: string | null;
    index: number;
  }[];
}

export interface GenerationStrategy {
  name: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  stopSequences?: string[];
}

export interface StoryAnalysisResult {
  entities: {
    characters: string[];
    locations: string[];
    factions: string[];
    items: string[];
  };
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral';
    tension: number; // 0-10
    mood: string;
  };
  themes: string[];
  events: {
    type: string;
    significance: number;
    description: string;
  }[];
}

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface ModelsResponse {
  object: string;
  data: ModelInfo[];
}

/**
 * Service for interacting with the LocalAI API
 */
class LocalAiService {
  private client: AxiosInstance;
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly defaultModel: string;
  private isAvailable: boolean = false;
  private responseCache: Map<string, { response: string; timestamp: number }> = new Map();
  private readonly cacheTimeout: number = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.apiUrl = process.env.LOCALAI_API_URL || 'http://localai:8080';
    this.apiKey = process.env.LOCALAI_API_KEY || 'change_this_key';
    this.timeout = Number(process.env.LOCALAI_TIMEOUT || '60000');
    this.defaultModel = process.env.LOCALAI_DEFAULT_MODEL || 'swrpg-mistral7b';
    
    this.client = axios.create({
      baseURL: this.apiUrl,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      }
    });
  }

  /**
   * Initialize the service and check if the API is available
   */
  async initialize(): Promise<void> {
    try {
      // Check if the API is available
      await this.checkHealth();
      this.isAvailable = true;
      logger.info('Successfully connected to LocalAI service');
    } catch (error) {
      logger.error('Failed to connect to LocalAI service', { error });
      throw error;
    }
  }

  /**
   * Check LocalAI health status
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/readyz');
      return response.status === 200;
    } catch (error) {
      logger.error('LocalAI health check failed', { error });
      return false;
    }
  }

  /**
   * Get available models from LocalAI
   */
  async getModels(): Promise<ModelInfo[]> {
    try {
      const response = await this.client.get<ModelsResponse>('/v1/models');
      return response.data.data;
    } catch (error) {
      logger.error('Failed to get LocalAI models', { error });
      throw error;
    }
  }

  /**
   * Generate cache key for requests
   */
  private getCacheKey(messages: ChatMessage[], options: any): string {
    const content = JSON.stringify({ messages, options });
    return Buffer.from(content).toString('base64').slice(0, 64);
  }

  /**
   * Check cache for response
   */
  private getCachedResponse(cacheKey: string): string | null {
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.response;
    }
    if (cached) {
      this.responseCache.delete(cacheKey);
    }
    return null;
  }

  /**
   * Cache response
   */
  private cacheResponse(cacheKey: string, response: string): void {
    this.responseCache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });

    // Clean old cache entries periodically
    if (this.responseCache.size > 100) {
      const now = Date.now();
      for (const [key, value] of this.responseCache.entries()) {
        if (now - value.timestamp > this.cacheTimeout) {
          this.responseCache.delete(key);
        }
      }
    }
  }

  /**
   * Create a chat completion with the LocalAI service
   */
  async createChatCompletion(
    messages: ChatMessage[],
    options: {
      model?: string;
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      stop?: string[];
      useCache?: boolean;
    } = {}
  ): Promise<string> {
    try {
      // Check cache for deterministic requests (low temperature)
      const useCache = options.useCache !== false && (options.temperature || 0.7) < 0.3;
      let cacheKey = '';
      
      if (useCache) {
        cacheKey = this.getCacheKey(messages, options);
        const cached = this.getCachedResponse(cacheKey);
        if (cached) {
          logger.debug('Using cached response', { cacheKey: cacheKey.slice(0, 16) });
          return cached;
        }
      }

      const request: CompletionRequest = {
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature,
        top_p: options.top_p,
        max_tokens: options.max_tokens,
        stop: options.stop
      };

      const response = await this.client.post<CompletionResponse>(
        '/v1/chat/completions',
        request
      );

      const content = response.data.choices[0].message.content;

      // Cache response if applicable
      if (useCache && cacheKey) {
        this.cacheResponse(cacheKey, content);
      }

      return content;
    } catch (error) {
      logger.error('Failed to create chat completion', { error, messages });
      throw error;
    }
  }

  /**
   * Create a streaming chat completion with the LocalAI service
   */
  async createStreamingChatCompletion(
    messages: ChatMessage[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
    onError: (error: Error) => void,
    options: {
      model?: string;
      temperature?: number;
      top_p?: number;
      max_tokens?: number;
      stop?: string[];
    } = {}
  ): Promise<void> {
    try {
      const request: CompletionRequest = {
        model: options.model || this.defaultModel,
        messages,
        temperature: options.temperature,
        top_p: options.top_p,
        max_tokens: options.max_tokens,
        stream: true,
        stop: options.stop
      };

      const response = await this.client.post('/v1/chat/completions', request, {
        responseType: 'stream'
      });

      const stream = response.data;

      stream.on('data', (chunk: Buffer) => {
        try {
          // Split the chunk into lines
          const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
          
          for (const line of lines) {
            // Check for "data: " prefix and remove it
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              
              // Check for [DONE] marker
              if (jsonStr.trim() === '[DONE]') {
                onComplete();
                continue;
              }
              
              // Parse the JSON
              try {
                const parsed = JSON.parse(jsonStr) as CompletionChunk;
                const content = parsed.choices[0]?.delta?.content || '';
                if (content) {
                  onChunk(content);
                }
              } catch (e) {
                logger.warn('Failed to parse streaming response chunk', { chunk: jsonStr, error: e });
              }
            }
          }
        } catch (e) {
          logger.error('Error processing stream chunk', { error: e });
        }
      });

      stream.on('end', () => {
        onComplete();
      });

      stream.on('error', (error: Error) => {
        logger.error('Stream error', { error });
        onError(error);
      });
    } catch (error) {
      logger.error('Failed to create streaming chat completion', { error, messages });
      onError(error as Error);
    }
  }

  /**
   * Load a template file from the prompt-templates directory
   */
  private async loadTemplate(templateName: string): Promise<string> {
    try {
      // Templates are mounted at /app/prompt-templates in the container
      const templatePath = join('/app/prompt-templates', `${templateName}.tmpl`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      return templateContent;
    } catch (error) {
      logger.error('Failed to load template', { templateName, error });
      throw new Error(`Template ${templateName} not found`);
    }
  }

  /**
   * Generate narrative text based on a template and context
   */
  async generateNarrative(
    templateName: string,
    context: Record<string, any>,
    options: {
      temperature?: number;
      max_tokens?: number;
      retryOnFailure?: boolean;
    } = {}
  ): Promise<string> {
    // Load template content
    const templateContent = await this.loadTemplate(templateName);
    
    // Replace template variables with actual context values
    let prompt = templateContent;
    for (const [key, value] of Object.entries(context)) {
      const replacement = value !== undefined && value !== null ? value.toString() : '';
      prompt = prompt.replace(new RegExp(`{{.${key}}}`, 'g'), replacement);
    }
      
    const messages: ChatMessage[] = [
      { role: 'user', content: prompt }
    ];

    try {
      // Generate completion
      return await this.createChatCompletion(messages, {
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1024
      });
    } catch (error) {
      // Retry with different parameters if specified
      if (options.retryOnFailure) {
        logger.warn('Retrying narrative generation with adjusted parameters', { error });
        return this.createChatCompletion(messages, {
          temperature: 0.5,
          max_tokens: 512
        });
      }
      throw error;
    }
  }

  /**
   * Generate a character description
   */
  async generateCharacter(
    era: string,
    species: string,
    affiliation: string,
    characterType: string,
    forceSensitive: boolean,
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      // Prepare parameters
      const params = {
        context: context.context || "",
        era,
        species,
        affiliation,
        character_type: characterType,
        force_sensitive: forceSensitive.toString()
      };

      // Generate completion using the character generation template
      const response = await this.generateNarrative(
        "character-generation", 
        params, 
        { temperature: 0.8 }
      );

      // Parse the JSON response
      try {
        // Extract JSON from response - handle markdown code blocks and extra text
        let jsonString = response;
        
        // Remove markdown code blocks if present
        const codeBlockMatch = response.match(/```json\s*([\s\S]*?)\s*```/);
        if (codeBlockMatch) {
          jsonString = codeBlockMatch[1];
        } else {
          // Fallback to finding JSON object
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            jsonString = jsonMatch[0];
          }
        }
        
        if (jsonString.trim()) {
          // Clean up common JSON formatting issues from LLM responses
          jsonString = jsonString
            .replace(/,(\s*[}\]])/g, '$1') // Remove trailing commas
            .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Add quotes to unquoted keys
            .replace(/:\s*([^",\{\[\s][^,\}\]]*?)(\s*[,\}\]])/g, ': "$1"$2'); // Add quotes to unquoted string values
          
          return JSON.parse(jsonString.trim());
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        logger.error('Failed to parse character generation response', { error: e, response });
        
        // For development, let's return a simplified character object when JSON parsing fails
        return {
          name: "Generated Character",
          species: "Human",
          occupation: "Character generation failed - JSON parsing error",
          background: "This character was generated but the response format needs improvement.",
          error: true
        };
      }
    } catch (error) {
      logger.error('Failed to generate character', { error, context });
      throw error;
    }
  }

  /**
   * Generate a location description
   */
  async generateLocation(
    planet: string,
    region: string,
    locationType: string,
    era: string,
    atmosphere: string,
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      // Prepare parameters
      const params = {
        context: context.context || "",
        planet,
        region,
        location_type: locationType,
        era,
        atmosphere
      };

      // Generate completion using the location description template
      const response = await this.generateNarrative(
        "location-description", 
        params, 
        { temperature: 0.7 }
      );

      // Parse the JSON response
      try {
        // Extract JSON from response - handle cases where LLM adds extra text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        logger.error('Failed to parse location generation response', { error: e, response });
        throw new Error('Invalid response format from location generation');
      }
    } catch (error) {
      logger.error('Failed to generate location', { error, context });
      throw error;
    }
  }

  /**
   * Generate a narrative continuation
   */
  async generateNarrativeContinuation(
    era: string,
    location: string,
    sessionSummary: string,
    recentEvents: string,
    currentScene: string,
    playerCharacters: string,
    npcsPresent: string,
    lastMessage: string,
    context: Record<string, any>
  ): Promise<string> {
    try {
      // Prepare parameters
      const params = {
        context: context.context || "",
        era,
        location,
        session_summary: sessionSummary,
        recent_events: recentEvents,
        current_scene: currentScene,
        player_characters: playerCharacters,
        npcs_present: npcsPresent,
        last_message: lastMessage
      };

      // Generate completion using the narrative continuation template
      return this.generateNarrative(
        "narrative-continuation", 
        params, 
        { temperature: 0.8 }
      );
    } catch (error) {
      logger.error('Failed to generate narrative continuation', { error, context });
      throw error;
    }
  }

  /**
   * Generate character dialogue
   */
  async generateDialogue(
    characterName: string,
    species: string,
    occupation: string,
    affiliation: string,
    personality: string,
    speechPattern: string,
    knowledge: string,
    emotionalState: string,
    relationship: string,
    location: string,
    situation: string,
    topic: string,
    previousDialogue: string,
    playerInput: string,
    context: Record<string, any>
  ): Promise<string> {
    try {
      // Prepare parameters
      const params = {
        context: context.context || "",
        character_name: characterName,
        species,
        occupation,
        affiliation,
        personality,
        speech_pattern: speechPattern,
        knowledge,
        emotional_state: emotionalState,
        relationship,
        location,
        situation,
        topic,
        previous_dialogue: previousDialogue,
        player_input: playerInput
      };

      // Generate completion using the dialogue generation template
      return this.generateNarrative(
        "dialogue-generation", 
        params, 
        { temperature: 0.7 }
      );
    } catch (error) {
      logger.error('Failed to generate dialogue', { error, context });
      throw error;
    }
  }

  /**
   * Generate a quest
   */
  async generateQuest(
    era: string,
    location: string,
    theme: string,
    plotStatus: string,
    playerCharacters: string,
    notableNpcs: string,
    previousAdventures: string,
    questType: string,
    difficulty: string,
    duration: string,
    requiredHooks: string,
    restrictions: string,
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    try {
      // Prepare parameters
      const params = {
        context: context.context || "",
        era,
        location,
        theme,
        plot_status: plotStatus,
        player_characters: playerCharacters,
        notable_npcs: notableNpcs,
        previous_adventures: previousAdventures,
        quest_type: questType,
        difficulty,
        duration,
        required_hooks: requiredHooks,
        restrictions
      };

      // Generate completion using the quest generation template
      const response = await this.generateNarrative(
        "quest-generation", 
        params, 
        { temperature: 0.7, max_tokens: 1500 }
      );

      // Parse the JSON response
      try {
        // Extract JSON from response - handle cases where LLM adds extra text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        logger.error('Failed to parse quest generation response', { error: e, response });
        throw new Error('Invalid response format from quest generation');
      }
    } catch (error) {
      logger.error('Failed to generate quest', { error, context });
      throw error;
    }
  }

  /**
   * Generate story with advanced strategies
   */
  async generateWithStrategy(
    strategy: GenerationStrategy,
    context: string,
    userInput?: string
  ): Promise<string> {
    try {
      const messages: ChatMessage[] = [
        { role: 'system', content: strategy.systemPrompt },
        { role: 'user', content: context }
      ];

      if (userInput) {
        messages.push({ role: 'user', content: userInput });
      }

      return this.createChatCompletion(messages, {
        temperature: strategy.temperature,
        max_tokens: strategy.maxTokens,
        stop: strategy.stopSequences
      });
    } catch (error) {
      logger.error('Failed to generate with strategy', { error, strategy: strategy.name });
      throw error;
    }
  }

  /**
   * Analyze story content for entities, sentiment, and themes
   */
  async analyzeStoryContent(content: string): Promise<StoryAnalysisResult> {
    try {
      const analysisPrompt = `Analyze the following Star Wars story content and extract:

1. ENTITIES (characters, locations, factions, items mentioned)
2. SENTIMENT (overall mood, tension level 0-10, emotional atmosphere)
3. THEMES (Star Wars themes present: hope, redemption, power, corruption, etc.)
4. EVENTS (significant events with type and significance 1-10)

Provide your analysis in valid JSON format:

{
  "entities": {
    "characters": ["character names"],
    "locations": ["location names"],
    "factions": ["faction names"],
    "items": ["item names"]
  },
  "sentiment": {
    "overall": "positive|negative|neutral",
    "tension": 0-10,
    "mood": "descriptive mood"
  },
  "themes": ["theme names"],
  "events": [
    {
      "type": "event type",
      "significance": 1-10,
      "description": "brief description"
    }
  ]
}

Content to analyze:
${content}`;

      const messages: ChatMessage[] = [
        { role: 'system', content: 'You are an expert Star Wars story analyst. Provide detailed analysis in the exact JSON format requested.' },
        { role: 'user', content: analysisPrompt }
      ];

      const response = await this.createChatCompletion(messages, {
        temperature: 0.3,
        max_tokens: 1000
      });

      // Parse and validate response
      try {
        // Extract JSON from response - handle cases where LLM adds extra text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        logger.error('Failed to parse story analysis response', { error: e, response });
        // Return default analysis if parsing fails
        return {
          entities: { characters: [], locations: [], factions: [], items: [] },
          sentiment: { overall: 'neutral', tension: 5, mood: 'unknown' },
          themes: [],
          events: []
        };
      }
    } catch (error) {
      logger.error('Failed to analyze story content', { error });
      throw error;
    }
  }

  /**
   * Generate narrative with context-aware continuation
   */
  async generateContextualNarrative(
    context: string,
    userAction: string,
    options: {
      style?: 'action' | 'dialogue' | 'description' | 'introspection';
      length?: 'short' | 'medium' | 'long';
      tone?: 'dramatic' | 'lighthearted' | 'suspenseful' | 'mysterious';
    } = {}
  ): Promise<string> {
    try {
      const style = options.style || 'description';
      const length = options.length || 'medium';
      const tone = options.tone || 'dramatic';

      const lengthGuide = {
        short: '1-2 sentences (50-100 words)',
        medium: '2-3 paragraphs (150-250 words)',
        long: '3-4 paragraphs (250-400 words)'
      };

      const systemPrompt = `You are an expert Star Wars narrative writer. Generate a ${tone} ${style}-focused continuation that is ${lengthGuide[length]}.

Style Guidelines:
- Action: Focus on movement, combat, physical activities
- Dialogue: Emphasize character speech and conversation
- Description: Rich sensory details and environmental storytelling
- Introspection: Character thoughts, emotions, internal conflict

Tone Guidelines:
- Dramatic: High stakes, emotional weight, epic scope
- Lighthearted: Humor, adventure, optimism
- Suspenseful: Tension, uncertainty, anticipation
- Mysterious: Intrigue, secrets, unanswered questions

Maintain Star Wars authenticity and universe consistency.`;

      const userPrompt = `Context: ${context}\n\nUser Action: ${userAction}\n\nProvide the narrative continuation:`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      return this.createChatCompletion(messages, {
        temperature: 0.8,
        max_tokens: length === 'long' ? 500 : length === 'medium' ? 300 : 150
      });
    } catch (error) {
      logger.error('Failed to generate contextual narrative', { error, options });
      throw error;
    }
  }

  /**
   * Generate character-specific dialogue with personality consistency
   */
  async generateCharacterDialogue(
    characterId: string,
    characterInfo: {
      name: string;
      personality: string[];
      speechPattern?: string;
      knowledge: string;
      currentEmotion: string;
    },
    situation: string,
    targetAudience: string,
    previousContext: string
  ): Promise<string> {
    try {
      const systemPrompt = `You are ${characterInfo.name}, a Star Wars character with the following traits:

Personality: ${characterInfo.personality.join(', ')}
Speech Pattern: ${characterInfo.speechPattern || 'Standard Basic'}
Knowledge Level: ${characterInfo.knowledge}
Current Emotional State: ${characterInfo.currentEmotion}

You must:
1. Stay in character at all times
2. Use speech patterns and vocabulary consistent with your background
3. Respond appropriately to the situation and audience
4. Consider your emotional state and relationship dynamics
5. Include subtle character-specific mannerisms or phrases

Respond with dialogue only - no narration or action descriptions.`;

      const userPrompt = `Situation: ${situation}\n\nSpeaking to: ${targetAudience}\n\nPrevious Context: ${previousContext}\n\nRespond as ${characterInfo.name}:`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      return this.createChatCompletion(messages, {
        temperature: 0.7,
        max_tokens: 200
      });
    } catch (error) {
      logger.error('Failed to generate character dialogue', { error, characterId });
      throw error;
    }
  }

  /**
   * Process and validate LLM responses
   */
  async processResponse(
    rawResponse: string,
    expectedFormat: 'text' | 'json' | 'dialogue',
    validationRules?: {
      maxLength?: number;
      requiredFields?: string[];
      forbiddenContent?: string[];
    }
  ): Promise<{ valid: boolean; processed: any; errors: string[] }> {
    try {
      const errors: string[] = [];
      let processed: any = rawResponse;

      // Length validation
      if (validationRules?.maxLength && rawResponse.length > validationRules.maxLength) {
        errors.push(`Response exceeds maximum length of ${validationRules.maxLength} characters`);
      }

      // Content validation
      if (validationRules?.forbiddenContent) {
        for (const forbidden of validationRules.forbiddenContent) {
          if (rawResponse.toLowerCase().includes(forbidden.toLowerCase())) {
            errors.push(`Response contains forbidden content: ${forbidden}`);
          }
        }
      }

      // Format-specific processing
      if (expectedFormat === 'json') {
        try {
          processed = JSON.parse(rawResponse);
          
          // Validate required fields
          if (validationRules?.requiredFields) {
            for (const field of validationRules.requiredFields) {
              if (!(field in processed)) {
                errors.push(`Missing required field: ${field}`);
              }
            }
          }
        } catch (e) {
          errors.push('Invalid JSON format');
          processed = null;
        }
      } else if (expectedFormat === 'dialogue') {
        // Clean up dialogue formatting
        processed = rawResponse
          .replace(/^["']|["']$/g, '') // Remove surrounding quotes
          .replace(/\n\s*\n/g, '\n') // Remove double line breaks
          .trim();
        
        // Validate dialogue doesn't contain narration
        if (processed.includes('*') || processed.includes('[') || processed.includes('(')) {
          errors.push('Dialogue contains narration or action descriptions');
        }
      }

      return {
        valid: errors.length === 0,
        processed,
        errors
      };
    } catch (error) {
      logger.error('Failed to process response', { error, expectedFormat });
      return {
        valid: false,
        processed: null,
        errors: ['Processing failed due to internal error']
      };
    }
  }

  /**
   * Check if the service is available
   */
  isInitialized(): boolean {
    return this.isAvailable;
  }
}

// Create singleton instance
const localAiService = new LocalAiService();

export default localAiService;