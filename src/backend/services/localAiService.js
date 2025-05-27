const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Service for interacting with LocalAI
 */
class LocalAiService {
  constructor() {
    this.baseUrl = process.env.LOCALAI_URL || 'http://localhost:8081';
    this.defaultModel = process.env.LOCALAI_MODEL || 'mistral-7b-instruct-v0.2.Q5_K_M';
    this.defaultParams = {
      temperature: 0.7,
      top_p: 0.95,
      max_tokens: parseInt(process.env.MAX_TOKENS || '4096', 10),
      context_size: parseInt(process.env.CONTEXT_SIZE || '8192', 10),
      frequency_penalty: 0.0,
      presence_penalty: 0.0,
    };
    
    // Initialize axios instance
    this.api = axios.create({
      baseURL: this.baseUrl,
      timeout: 120000, // 2 minutes
    });
  }

  /**
   * Get available models from LocalAI
   */
  async getModels() {
    try {
      const response = await this.api.get('/v1/models');
      return response.data;
    } catch (error) {
      logger.error('Error getting models from LocalAI:', error);
      throw error;
    }
  }
  
  /**
   * Generate text completion using LocalAI
   * @param {string} prompt - The prompt to complete
   * @param {Object} options - Configuration options
   */
  async generateCompletion(prompt, options = {}) {
    try {
      const params = {
        ...this.defaultParams,
        ...options,
        model: options.model || this.defaultModel,
        prompt,
      };
      
      const response = await this.api.post('/v1/completions', params);
      return response.data;
    } catch (error) {
      logger.error('Error generating completion from LocalAI:', error);
      throw error;
    }
  }
  
  /**
   * Generate chat completion using LocalAI
   * @param {Array} messages - Array of message objects with role and content
   * @param {Object} options - Configuration options
   */
  async generateChatCompletion(messages, options = {}) {
    try {
      const params = {
        ...this.defaultParams,
        ...options,
        model: options.model || this.defaultModel,
        messages,
      };
      
      const response = await this.api.post('/v1/chat/completions', params);
      return response.data;
    } catch (error) {
      logger.error('Error generating chat completion from LocalAI:', error);
      throw error;
    }
  }
  
  /**
   * Generate embeddings for text using LocalAI
   * @param {string|Array} input - Text to embed
   * @param {Object} options - Configuration options
   */
  async generateEmbeddings(input, options = {}) {
    try {
      const params = {
        model: options.model || this.defaultModel,
        input: Array.isArray(input) ? input : [input],
      };
      
      const response = await this.api.post('/v1/embeddings', params);
      return response.data;
    } catch (error) {
      logger.error('Error generating embeddings from LocalAI:', error);
      throw error;
    }
  }
  
  /**
   * Create a system prompt for Star Wars RPG generation
   * @param {Object} settings - Session settings
   */
  createSystemPrompt(settings = {}) {
    const { era = 'Imperial Era', location = '', tonePreferences = [] } = settings;
    
    // Base system prompt
    let systemPrompt = `You are a Star Wars RPG game master assistant for a tabletop roleplaying game set in the ${era}. 
Your task is to create immersive, consistent narrative content that follows Star Wars lore and themes.

Follow these principles when generating content:
- Maintain consistency with established Star Wars canon appropriate to the ${era}
- Create vivid descriptions using sensory details and Star Wars-specific terminology
- Balance action, dialogue, and description in your narratives
- Adapt your tone to match the current situation and location
- Respect player agency and provide interesting choices
- Create memorable NPCs with clear motivations and distinct personalities
- Generate plausible challenges appropriate to the characters' abilities`;

    // Add tone preferences if provided
    if (tonePreferences && tonePreferences.length > 0) {
      systemPrompt += `\n\nTone preferences: ${tonePreferences.join(', ')}`;
    }
    
    // Add location context if provided
    if (location) {
      systemPrompt += `\n\nCurrent location: ${location}`;
    }
    
    return systemPrompt;
  }
}

// Create and export singleton instance
const localAiService = new LocalAiService();
module.exports = localAiService;