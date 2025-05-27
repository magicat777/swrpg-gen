import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import localAiService from '../services/localAiService';
import contextAssemblyService, { ContextType } from '../services/contextAssemblyService';
import mongodbService from '../services/mongodbService';
import { v4 as uuidv4 } from 'uuid';

/**
 * Controller for all content generation functions
 */
class GenerationController {
  /**
   * Generate a character
   */
  async generateCharacter(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { era, species, affiliation, characterType, forceSensitive } = req.body;
      
      // Temporarily disable context assembly to test LLM integration
      const context = "";
      
      // Log context for debugging
      logger.debug('Character generation context assembled', { 
        contextLength: context.length,
        context: context.substring(0, 200) + '...'
      });
      
      // Generate character
      const character = await localAiService.generateCharacter(
        era,
        species,
        affiliation,
        characterType,
        forceSensitive,
        { context }
      );
      
      // Store generated content if user is authenticated
      if (req.user) {
        const generatedContent = {
          type: 'character',
          name: character.name,
          content: character,
          createdAt: new Date(),
          createdBy: req.user.id,
          sessionId: req.body.sessionId || null,
          tags: [species, affiliation, characterType, era, forceSensitive ? 'force-sensitive' : 'non-force-sensitive'],
          isApproved: false,
          usageCount: 0,
          rating: null,
          references: {
            inspirations: [],
            relatedContent: []
          },
          meta: {}
        };
        
        // Save to GeneratedContent collection
        const generatedContentCollection = mongodbService.getGeneratedContentCollection();
        await generatedContentCollection.insertOne(generatedContent);
      }
      
      // Return the character
      res.status(200).json({
        status: 'success',
        data: {
          character
        }
      });
    } catch (error) {
      logger.error('Character generation error', { error });
      next(error);
    }
  }
  
  /**
   * Generate a location
   */
  async generateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { planet, region, locationType, era, atmosphere } = req.body;
      
      // Assemble relevant context
      const context = await contextAssemblyService.assembleContext({
        types: [
          ContextType.LOCATION,
          ContextType.CHARACTER,
          ContextType.LORE
        ],
        query: `${planet} ${region} ${locationType} ${era}`
      });
      
      // Generate location
      const location = await localAiService.generateLocation(
        planet,
        region,
        locationType,
        era,
        atmosphere,
        { context }
      );
      
      // Store generated content if user is authenticated
      if (req.user) {
        const generatedContent = {
          type: 'location',
          name: location.name,
          content: location,
          createdAt: new Date(),
          createdBy: req.user.id,
          sessionId: req.body.sessionId || null,
          tags: [planet, region, locationType, era, atmosphere],
          isApproved: false,
          usageCount: 0,
          rating: null,
          references: {
            inspirations: [],
            relatedContent: []
          },
          meta: {}
        };
        
        // Save to GeneratedContent collection
        const generatedContentCollection = mongodbService.getGeneratedContentCollection();
        await generatedContentCollection.insertOne(generatedContent);
      }
      
      // Return the location
      res.status(200).json({
        status: 'success',
        data: {
          location
        }
      });
    } catch (error) {
      logger.error('Location generation error', { error });
      next(error);
    }
  }
  
  /**
   * Generate a narrative continuation
   */
  async generateNarrativeContinuation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { 
        sessionId, 
        era,
        location,
        sessionSummary,
        recentEvents,
        currentScene,
        playerCharacters,
        npcsPresent,
        lastMessage
      } = req.body;
      
      // Assemble relevant context
      const context = await contextAssemblyService.assembleContext({
        types: [
          ContextType.SESSION_HISTORY,
          ContextType.WORLD_STATE,
          ContextType.CHARACTER,
          ContextType.LOCATION,
          ContextType.EVENT
        ],
        sessionId,
        query: `${currentScene} ${lastMessage}`
      });
      
      // Generate narrative continuation with defaults for missing values
      const narrative = await localAiService.generateNarrativeContinuation(
        era || 'Imperial Era',
        location || 'Unknown Location',
        sessionSummary || 'New session starting',
        recentEvents || 'The adventure begins',
        currentScene || 'Setting the scene',
        playerCharacters || 'Adventuring party',
        npcsPresent || 'Various NPCs',
        lastMessage,
        { context }
      );
      
      // Store as a message if session ID is provided
      if (sessionId) {
        const message = {
          sessionId,
          sender: {
            type: 'system',
            name: 'Narrator',
            id: 'narrator'
          },
          content: narrative,
          timestamp: new Date(),
          type: 'narrative',
          attachments: [],
          references: {},
          isHidden: false,
          reactions: [],
          meta: {
            generationParams: {
              era,
              location,
              currentScene
            }
          }
        };
        
        // Save to Messages collection
        const messagesCollection = mongodbService.getMessagesCollection();
        await messagesCollection.insertOne(message);
      }
      
      // Return the narrative
      res.status(200).json({
        status: 'success',
        data: {
          narrative
        }
      });
    } catch (error) {
      logger.error('Narrative generation error', { error });
      next(error);
    }
  }
  
  /**
   * Generate character dialogue
   */
  async generateDialogue(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        sessionId,
        characterName,
        species,
        occupation,
        affiliation,
        personality,
        speechPattern,
        knowledge,
        emotionalState,
        relationship,
        location,
        situation,
        topic,
        previousDialogue,
        playerInput
      } = req.body;
      
      // Assemble relevant context
      const context = await contextAssemblyService.assembleContext({
        types: [
          ContextType.SESSION_HISTORY,
          ContextType.CHARACTER,
          ContextType.LORE
        ],
        sessionId,
        query: `${characterName} ${situation} ${topic} ${playerInput}`
      });
      
      // Generate dialogue
      const dialogue = await localAiService.generateDialogue(
        characterName,
        species,
        occupation,
        affiliation,
        personality,
        speechPattern,
        knowledge,
        emotionalState,
        relationship,
        location,
        situation,
        topic,
        previousDialogue,
        playerInput,
        { context }
      );
      
      // Store as a message if session ID is provided
      if (sessionId) {
        const message = {
          sessionId,
          sender: {
            type: 'character',
            name: characterName,
            id: characterName.toLowerCase().replace(/\s+/g, '_')
          },
          content: dialogue,
          timestamp: new Date(),
          type: 'dialogue',
          attachments: [],
          references: {},
          isHidden: false,
          reactions: [],
          meta: {
            generationParams: {
              species,
              occupation,
              affiliation,
              emotionalState
            }
          }
        };
        
        // Save to Messages collection
        const messagesCollection = mongodbService.getMessagesCollection();
        await messagesCollection.insertOne(message);
      }
      
      // Return the dialogue
      res.status(200).json({
        status: 'success',
        data: {
          dialogue
        }
      });
    } catch (error) {
      logger.error('Dialogue generation error', { error });
      next(error);
    }
  }
  
  /**
   * Generate a quest
   */
  async generateQuest(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        sessionId,
        era,
        location,
        theme,
        plotStatus,
        playerCharacters,
        notableNpcs,
        previousAdventures,
        questType,
        difficulty,
        duration,
        requiredHooks,
        restrictions
      } = req.body;
      
      // Assemble relevant context
      const context = await contextAssemblyService.assembleContext({
        types: [
          ContextType.SESSION_HISTORY,
          ContextType.WORLD_STATE,
          ContextType.CHARACTER,
          ContextType.LOCATION,
          ContextType.EVENT,
          ContextType.LORE
        ],
        sessionId,
        query: `${theme} ${questType} ${location} ${era}`
      });
      
      // Generate quest
      const quest = await localAiService.generateQuest(
        era,
        location,
        theme,
        plotStatus,
        playerCharacters,
        notableNpcs,
        previousAdventures,
        questType,
        difficulty,
        duration,
        requiredHooks,
        restrictions,
        { context }
      );
      
      // Store generated content if user is authenticated
      if (req.user) {
        const generatedContent = {
          type: 'quest',
          name: quest.title,
          content: quest,
          createdAt: new Date(),
          createdBy: req.user.id,
          sessionId: sessionId || null,
          tags: [era, questType, difficulty, theme],
          isApproved: false,
          usageCount: 0,
          rating: null,
          references: {
            inspirations: [],
            relatedContent: []
          },
          meta: {}
        };
        
        // Save to GeneratedContent collection
        const generatedContentCollection = mongodbService.getGeneratedContentCollection();
        await generatedContentCollection.insertOne(generatedContent);
      }
      
      // Return the quest
      res.status(200).json({
        status: 'success',
        data: {
          quest
        }
      });
    } catch (error) {
      logger.error('Quest generation error', { error });
      next(error);
    }
  }
  
  /**
   * Generate streaming text completion
   */
  async streamCompletion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { messages, model, temperature, max_tokens } = req.body;
      
      // Set up SSE
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // Generate a request ID
      const requestId = uuidv4();
      
      // Send initial message
      res.write(`data: ${JSON.stringify({ id: requestId, type: 'start' })}\n\n`);
      
      // Stream completion
      await localAiService.createStreamingChatCompletion(
        messages,
        // Chunk handler
        (chunk) => {
          res.write(`data: ${JSON.stringify({ id: requestId, type: 'chunk', content: chunk })}\n\n`);
        },
        // Complete handler
        () => {
          res.write(`data: ${JSON.stringify({ id: requestId, type: 'end' })}\n\n`);
          res.end();
        },
        // Error handler
        (error) => {
          logger.error('Streaming error', { error, requestId });
          res.write(`data: ${JSON.stringify({ id: requestId, type: 'error', error: error.message })}\n\n`);
          res.end();
        },
        // Options
        {
          model,
          temperature,
          max_tokens
        }
      );
    } catch (error) {
      logger.error('Streaming setup error', { error });
      
      // If headers haven't been sent yet, return a regular error response
      if (!res.headersSent) {
        next(error);
      } else {
        // Try to send error as SSE
        try {
          res.write(`data: ${JSON.stringify({ type: 'error', error: (error as Error).message })}\n\n`);
          res.end();
        } catch (e) {
          logger.error('Error sending streaming error', { error: e });
        }
      }
    }
  }
}

// Create and export singleton instance
export default new GenerationController();