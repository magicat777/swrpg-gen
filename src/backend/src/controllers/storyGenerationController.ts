import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import localAiService, { ChatMessage } from '../services/localAiService';
import contextAssemblyService, { ContextType } from '../services/contextAssemblyService';
import storyAnalysisService from '../services/storyAnalysisService';
import mongodbService from '../services/mongodbService';

export interface GenerateNarrativeRequest {
  sessionId: string;
  userInput: string;
  context?: {
    characters?: string[];
    locations?: string[];
    factions?: string[];
    items?: string[];
  };
  options?: {
    style?: 'action' | 'dialogue' | 'description' | 'introspection';
    length?: 'short' | 'medium' | 'long';
    tone?: 'dramatic' | 'lighthearted' | 'suspenseful' | 'mysterious';
    temperature?: number;
    maxTokens?: number;
  };
}

export interface GenerateDialogueRequest {
  sessionId: string;
  characterId: string;
  situation: string;
  targetAudience: string;
  previousContext?: string;
  options?: {
    emotionalState?: string;
    temperature?: number;
  };
}

export interface AnalyzeStoryRequest {
  content: string;
  sessionId?: string;
  options?: {
    includeEntities?: boolean;
    includeSentiment?: boolean;
    includeThemes?: boolean;
    includeContradictions?: boolean;
  };
}

/**
 * Controller for story generation endpoints
 */
class StoryGenerationController {
  /**
   * Generate narrative continuation
   */
  async generateNarrative(req: Request, res: Response): Promise<void> {
    try {
      const requestData = req.body as GenerateNarrativeRequest;
      
      // Validate required fields
      if (!requestData.sessionId || !requestData.userInput) {
        res.status(400).json({
          success: false,
          error: 'sessionId and userInput are required'
        });
        return;
      }

      logger.info('Generating narrative', { 
        sessionId: requestData.sessionId,
        inputLength: requestData.userInput.length,
        options: requestData.options
      });

      // Assemble context from multiple sources
      const contextTypes = [
        ContextType.SESSION_HISTORY,
        ContextType.WORLD_STATE,
        ContextType.CHARACTER,
        ContextType.LOCATION,
        ContextType.EVENT
      ];

      const assembledContext = await contextAssemblyService.assembleContext({
        types: contextTypes,
        sessionId: requestData.sessionId,
        includeIds: [
          ...(requestData.context?.characters || []),
          ...(requestData.context?.locations || []),
          ...(requestData.context?.factions || []),
          ...(requestData.context?.items || [])
        ],
        maxTokens: 3000,
        maxItems: 10
      });

      // Generate narrative using contextual generation
      const narrative = await localAiService.generateContextualNarrative(
        assembledContext,
        requestData.userInput,
        requestData.options || {}
      );

      // Validate and process the response
      const processedResponse = await localAiService.processResponse(
        narrative,
        'text',
        {
          maxLength: 2000,
          forbiddenContent: ['[OOC]', '(OOC)', 'out of character']
        }
      );

      if (!processedResponse.valid) {
        logger.warn('Generated narrative failed validation', {
          errors: processedResponse.errors,
          sessionId: requestData.sessionId
        });
        
        res.status(422).json({
          success: false,
          error: 'Generated content failed validation',
          details: processedResponse.errors
        });
        return;
      }

      // Store the generated message
      const messagesCollection = mongodbService.getMessagesCollection();
      const messageDoc = {
        sessionId: requestData.sessionId,
        sender: {
          type: 'system',
          name: 'Narrator'
        },
        type: 'narrative',
        content: processedResponse.processed,
        metadata: {
          generationType: 'contextual_narrative',
          userInput: requestData.userInput,
          options: requestData.options,
          contextLength: assembledContext.length
        },
        timestamp: new Date()
      };

      await messagesCollection.insertOne(messageDoc);

      // Analyze the generated content (background task)
      this.analyzeGeneratedContent(processedResponse.processed, requestData.sessionId)
        .catch(error => logger.error('Background story analysis failed', { error }));

      res.json({
        success: true,
        data: {
          narrative: processedResponse.processed,
          metadata: {
            contextUsed: assembledContext.length > 0,
            generationOptions: requestData.options,
            timestamp: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      logger.error('Failed to generate narrative', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: 'Internal server error during narrative generation'
      });
    }
  }

  /**
   * Generate character dialogue
   */
  async generateDialogue(req: Request, res: Response): Promise<void> {
    try {
      const requestData = req.body as GenerateDialogueRequest;
      
      // Validate required fields
      if (!requestData.sessionId || !requestData.characterId || !requestData.situation) {
        res.status(400).json({
          success: false,
          error: 'sessionId, characterId, and situation are required'
        });
        return;
      }

      logger.info('Generating dialogue', { 
        sessionId: requestData.sessionId,
        characterId: requestData.characterId
      });

      // Get character information from Neo4j
      const characterInfo = await this.getCharacterInfo(requestData.characterId);
      
      if (!characterInfo) {
        res.status(404).json({
          success: false,
          error: 'Character not found'
        });
        return;
      }

      // Get previous context
      const previousContext = requestData.previousContext || 
        await this.getRecentDialogueContext(requestData.sessionId, 3);

      // Generate dialogue
      const dialogue = await localAiService.generateCharacterDialogue(
        requestData.characterId,
        {
          name: characterInfo.name,
          personality: characterInfo.personality || [],
          speechPattern: characterInfo.speechPattern,
          knowledge: characterInfo.knowledge || characterInfo.biography || 'Standard knowledge',
          currentEmotion: requestData.options?.emotionalState || 'neutral'
        },
        requestData.situation,
        requestData.targetAudience,
        previousContext
      );

      // Validate dialogue
      const processedDialogue = await localAiService.processResponse(
        dialogue,
        'dialogue',
        {
          maxLength: 500,
          forbiddenContent: ['*', '[', '(', 'OOC']
        }
      );

      if (!processedDialogue.valid) {
        logger.warn('Generated dialogue failed validation', {
          errors: processedDialogue.errors,
          characterId: requestData.characterId
        });
        
        res.status(422).json({
          success: false,
          error: 'Generated dialogue failed validation',
          details: processedDialogue.errors
        });
        return;
      }

      // Store the dialogue message
      const messagesCollection = mongodbService.getMessagesCollection();
      const messageDoc = {
        sessionId: requestData.sessionId,
        sender: {
          type: 'character',
          id: requestData.characterId,
          name: characterInfo.name
        },
        type: 'dialogue',
        content: processedDialogue.processed,
        metadata: {
          generationType: 'character_dialogue',
          situation: requestData.situation,
          targetAudience: requestData.targetAudience,
          emotionalState: requestData.options?.emotionalState
        },
        timestamp: new Date()
      };

      await messagesCollection.insertOne(messageDoc);

      res.json({
        success: true,
        data: {
          dialogue: processedDialogue.processed,
          character: {
            id: requestData.characterId,
            name: characterInfo.name
          },
          metadata: {
            situation: requestData.situation,
            emotionalState: requestData.options?.emotionalState || 'neutral',
            timestamp: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      logger.error('Failed to generate dialogue', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: 'Internal server error during dialogue generation'
      });
    }
  }

  /**
   * Generate scene description
   */
  async generateSceneDescription(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, locationId, atmosphere, focusElements, options } = req.body;
      
      if (!sessionId || !locationId) {
        res.status(400).json({
          success: false,
          error: 'sessionId and locationId are required'
        });
        return;
      }

      logger.info('Generating scene description', { sessionId, locationId });

      // Get location information
      const locationInfo = await this.getLocationInfo(locationId);
      
      if (!locationInfo) {
        res.status(404).json({
          success: false,
          error: 'Location not found'
        });
        return;
      }

      // Assemble context for scene description
      const sceneContext = await contextAssemblyService.assembleContext({
        types: [ContextType.LOCATION, ContextType.CHARACTER, ContextType.EVENT, ContextType.WORLD_STATE],
        sessionId,
        includeIds: [locationId],
        maxTokens: 2000
      });

      // Generate scene description
      const scenePrompt = `Create a vivid scene description for this Star Wars location:

Location: ${locationInfo.name}
Type: ${locationInfo.type}
Region: ${locationInfo.region}
Atmosphere: ${atmosphere || 'neutral'}
Focus on: ${focusElements || 'general atmosphere'}

Context: ${sceneContext}

Provide a rich, immersive description that captures the Star Wars feel and includes sensory details.`;

      const description = await localAiService.createChatCompletion([
        { role: 'system', content: 'You are an expert at creating immersive Star Wars scene descriptions.' },
        { role: 'user', content: scenePrompt }
      ], {
        temperature: options?.temperature || 0.7,
        max_tokens: options?.maxTokens || 400
      });

      // Store the scene description
      const messagesCollection = mongodbService.getMessagesCollection();
      await messagesCollection.insertOne({
        sessionId,
        sender: { type: 'system', name: 'Narrator' },
        type: 'scene_description',
        content: description,
        metadata: {
          generationType: 'scene_description',
          locationId,
          atmosphere,
          focusElements
        },
        timestamp: new Date()
      });

      res.json({
        success: true,
        data: {
          description,
          location: {
            id: locationId,
            name: locationInfo.name
          },
          metadata: {
            atmosphere: atmosphere || 'neutral',
            focusElements,
            timestamp: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      logger.error('Failed to generate scene description', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: 'Internal server error during scene generation'
      });
    }
  }

  /**
   * Analyze story content
   */
  async analyzeStory(req: Request, res: Response): Promise<void> {
    try {
      const requestData = req.body as AnalyzeStoryRequest;
      
      if (!requestData.content) {
        res.status(400).json({
          success: false,
          error: 'content is required'
        });
        return;
      }

      logger.info('Analyzing story content', { 
        contentLength: requestData.content.length,
        sessionId: requestData.sessionId
      });

      const options = requestData.options || {
        includeEntities: true,
        includeSentiment: true,
        includeThemes: true,
        includeContradictions: true
      };

      let analysisResult: any = {};

      // Perform requested analyses
      if (options.includeEntities || options.includeSentiment || 
          options.includeThemes || options.includeContradictions) {
        
        const fullAnalysis = await storyAnalysisService.analyzeStory(
          requestData.content,
          requestData.sessionId
        );

        if (options.includeEntities) {
          analysisResult.entities = fullAnalysis.entities;
        }
        if (options.includeSentiment) {
          analysisResult.sentiment = fullAnalysis.sentiment;
        }
        if (options.includeThemes) {
          analysisResult.themes = fullAnalysis.themes;
        }
        if (options.includeContradictions) {
          analysisResult.contradictions = fullAnalysis.contradictions;
        }
      }

      res.json({
        success: true,
        data: {
          analysis: analysisResult,
          metadata: {
            contentLength: requestData.content.length,
            analysisOptions: options,
            timestamp: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      logger.error('Failed to analyze story', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: 'Internal server error during story analysis'
      });
    }
  }

  /**
   * Stream narrative generation (WebSocket or Server-Sent Events)
   */
  async streamNarrative(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, userInput, context, options } = req.body;
      
      if (!sessionId || !userInput) {
        res.status(400).json({
          success: false,
          error: 'sessionId and userInput are required'
        });
        return;
      }

      // Set up Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      });

      logger.info('Starting streaming narrative generation', { sessionId });

      try {
        // Assemble context
        const assembledContext = await contextAssemblyService.assembleContext({
          types: [ContextType.SESSION_HISTORY, ContextType.WORLD_STATE, ContextType.CHARACTER],
          sessionId,
          maxTokens: 2000
        });

        // Send context assembly complete event
        res.write(`event: context\ndata: ${JSON.stringify({ status: 'complete' })}\n\n`);

        // Prepare messages for streaming
        const messages: ChatMessage[] = [
          { role: 'system', content: 'You are an expert Star Wars narrator. Continue the story based on the context and user input.' },
          { role: 'user', content: `Context: ${assembledContext}\n\nUser Input: ${userInput}` }
        ];

        let fullResponse = '';

        // Start streaming generation
        await localAiService.createStreamingChatCompletion(
          messages,
          (chunk: string) => {
            fullResponse += chunk;
            res.write(`event: chunk\ndata: ${JSON.stringify({ content: chunk })}\n\n`);
          },
          async () => {
            // Store complete response
            const messagesCollection = mongodbService.getMessagesCollection();
            await messagesCollection.insertOne({
              sessionId,
              sender: { type: 'system', name: 'Narrator' },
              type: 'narrative',
              content: fullResponse,
              metadata: {
                generationType: 'streaming_narrative',
                userInput,
                streamingComplete: true
              },
              timestamp: new Date()
            });

            res.write(`event: complete\ndata: ${JSON.stringify({ status: 'complete' })}\n\n`);
            res.end();
          },
          (error: Error) => {
            logger.error('Streaming error', { error, sessionId });
            res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
          },
          options
        );

      } catch (error) {
        logger.error('Failed to start streaming', { error, sessionId });
        res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to start generation' })}\n\n`);
        res.end();
      }

    } catch (error) {
      logger.error('Failed to setup streaming', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error during streaming setup'
      });
    }
  }

  /**
   * Helper: Get character information from Neo4j
   */
  private async getCharacterInfo(characterId: string): Promise<any> {
    try {
      const neo4jService = require('../services/neo4jService').default;
      
      const query = `
        MATCH (c:Character {id: $id})
        RETURN c
      `;

      const result = await neo4jService.read(
        query,
        { id: characterId },
        (records: any[]) => records.map(record => record.get('c').properties)
      );

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Failed to get character info', { error, characterId });
      return null;
    }
  }

  /**
   * Helper: Get location information from Neo4j
   */
  private async getLocationInfo(locationId: string): Promise<any> {
    try {
      const neo4jService = require('../services/neo4jService').default;
      
      const query = `
        MATCH (l:Location {id: $id})
        RETURN l
      `;

      const result = await neo4jService.read(
        query,
        { id: locationId },
        (records: any[]) => records.map(record => record.get('l').properties)
      );

      return result.length > 0 ? result[0] : null;
    } catch (error) {
      logger.error('Failed to get location info', { error, locationId });
      return null;
    }
  }

  /**
   * Helper: Get recent dialogue context
   */
  private async getRecentDialogueContext(sessionId: string, messageCount: number): Promise<string> {
    try {
      const messagesCollection = mongodbService.getMessagesCollection();
      
      const messages = await messagesCollection
        .find({ 
          sessionId, 
          type: { $in: ['dialogue', 'narrative'] } 
        })
        .sort({ timestamp: -1 })
        .limit(messageCount)
        .toArray();

      return messages
        .reverse()
        .map(msg => `${msg.sender?.name || 'Unknown'}: ${msg.content}`)
        .join('\n');
    } catch (error) {
      logger.error('Failed to get dialogue context', { error, sessionId });
      return '';
    }
  }

  /**
   * Helper: Analyze generated content in background
   */
  private async analyzeGeneratedContent(content: string, sessionId: string): Promise<void> {
    try {
      const analysis = await storyAnalysisService.analyzeStory(content, sessionId);
      
      // Store analysis results for future reference
      // Note: This would need to be implemented when MongoDB service supports it
      logger.debug('Story analysis completed', { sessionId, analysisKeys: Object.keys(analysis) });

    } catch (error) {
      logger.error('Background content analysis failed', { error, sessionId });
    }
  }
}

export default new StoryGenerationController();