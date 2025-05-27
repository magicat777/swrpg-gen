import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import localAiService, { ChatMessage } from '../services/localAiService';
import loreQueryService from '../services/loreQueryService';
import contextAssemblyService, { ContextType } from '../services/contextAssemblyService';
import mongodbService from '../services/mongodbService';

export interface ChatMessageRequest {
  sessionId: string;
  message: string;
  context?: {
    characters?: string[];
    locations?: string[];
    factions?: string[];
  };
}

/**
 * Controller for general chat interactions with lore integration
 */
class ChatController {
  
  /**
   * Handle general chat message with lore query detection
   */
  async sendMessage(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, message, context } = req.body as ChatMessageRequest;
      
      if (!sessionId || !message) {
        res.status(400).json({
          success: false,
          error: 'sessionId and message are required'
        });
        return;
      }

      logger.info('Processing chat message', { sessionId, messageLength: message.length });

      // Store user message
      const messagesCollection = mongodbService.getMessagesCollection();
      const userMessageDoc = {
        sessionId,
        sender: {
          type: 'user',
          name: 'Player'
        },
        type: 'user_input',
        content: message,
        timestamp: new Date()
      };

      await messagesCollection.insertOne(userMessageDoc);

      // First, check if this is a lore query
      const loreResponse = await loreQueryService.processLoreQuery(message, sessionId);
      
      if (loreResponse) {
        // This was a lore query and we have a response
        const loreMessageDoc = {
          sessionId,
          sender: {
            type: 'system',
            name: 'Lore Master'
          },
          type: 'lore_response',
          content: loreResponse,
          metadata: {
            generationType: 'lore_query',
            userInput: message,
            isLoreQuery: true
          },
          timestamp: new Date()
        };

        await messagesCollection.insertOne(loreMessageDoc);

        res.json({
          success: true,
          data: {
            response: loreResponse,
            responseType: 'lore',
            metadata: {
              isLoreQuery: true,
              timestamp: new Date().toISOString()
            }
          }
        });
        return;
      }

      // Not a lore query, proceed with regular narrative generation
      await this.generateNarrativeResponse(sessionId, message, context, res);

    } catch (error) {
      logger.error('Failed to process chat message', { error, body: req.body });
      res.status(500).json({
        success: false,
        error: 'Internal server error while processing message'
      });
    }
  }

  /**
   * Generate regular narrative response for non-lore queries
   */
  private async generateNarrativeResponse(
    sessionId: string, 
    userMessage: string, 
    context: any, 
    res: Response
  ): Promise<void> {
    try {
      // Assemble context from session history and world state
      const assembledContext = await contextAssemblyService.assembleContext({
        types: [
          ContextType.SESSION_HISTORY,
          ContextType.WORLD_STATE,
          ContextType.CHARACTER,
          ContextType.LOCATION
        ],
        sessionId,
        includeIds: [
          ...(context?.characters || []),
          ...(context?.locations || []),
          ...(context?.factions || [])
        ],
        maxTokens: 2000,
        maxItems: 8
      });

      // Prepare system prompt for GM-style response
      const systemPrompt = `You are an expert Star Wars Game Master running a tabletop RPG session. 
Your role is to:
1. Continue the story based on player actions
2. Describe scenes, NPCs, and environments vividly
3. Present challenges and opportunities
4. Ask engaging questions to drive the narrative forward
5. Maintain Star Wars authenticity and atmosphere

Guidelines:
- Be creative and engaging
- Present choices and consequences
- Include sensory details
- Maintain appropriate pacing
- Respond to player actions meaningfully
- Ask what the player wants to do next when appropriate

Current Session Context:
${assembledContext}`;

      const userPrompt = `Player action/statement: "${userMessage}"

As the Game Master, respond to this player input with an engaging narrative continuation. Include scene description, NPC reactions, consequences of actions, and/or new story developments as appropriate.`;

      const messages: ChatMessage[] = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ];

      const response = await localAiService.createChatCompletion(messages, {
        temperature: 0.8,
        max_tokens: 400
      });

      // Store AI response
      const messagesCollection = mongodbService.getMessagesCollection();
      const aiMessageDoc = {
        sessionId,
        sender: {
          type: 'system',
          name: 'Game Master'
        },
        type: 'narrative',
        content: response,
        metadata: {
          generationType: 'gm_response',
          userInput: userMessage,
          contextLength: assembledContext.length,
          isLoreQuery: false
        },
        timestamp: new Date()
      };

      await messagesCollection.insertOne(aiMessageDoc);

      res.json({
        success: true,
        data: {
          response: response,
          responseType: 'narrative',
          metadata: {
            isLoreQuery: false,
            contextUsed: assembledContext.length > 0,
            timestamp: new Date().toISOString()
          }
        }
      });

    } catch (error) {
      logger.error('Failed to generate narrative response', { error, sessionId });
      throw error;
    }
  }

  /**
   * Get recent chat history for a session
   */
  async getChatHistory(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { limit = 20, offset = 0 } = req.query;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          error: 'sessionId is required'
        });
        return;
      }

      const messagesCollection = mongodbService.getMessagesCollection();
      const messages = await messagesCollection
        .find({ sessionId })
        .sort({ timestamp: -1 })
        .skip(Number(offset))
        .limit(Number(limit))
        .toArray();

      // Reverse to get chronological order
      const chronologicalMessages = messages.reverse();

      res.json({
        success: true,
        data: {
          messages: chronologicalMessages,
          metadata: {
            sessionId,
            messageCount: chronologicalMessages.length,
            hasMore: messages.length === Number(limit)
          }
        }
      });

    } catch (error) {
      logger.error('Failed to get chat history', { error, sessionId: req.params.sessionId });
      res.status(500).json({
        success: false,
        error: 'Internal server error while retrieving chat history'
      });
    }
  }

  /**
   * Stream chat response for real-time interaction
   */
  async streamChatResponse(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, message, context } = req.body;
      
      if (!sessionId || !message) {
        res.status(400).json({
          success: false,
          error: 'sessionId and message are required'
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

      logger.info('Starting streaming chat response', { sessionId });

      try {
        // Store user message first
        const messagesCollection = mongodbService.getMessagesCollection();
        const userMessageDoc = {
          sessionId,
          sender: { type: 'user', name: 'Player' },
          type: 'user_input',
          content: message,
          timestamp: new Date()
        };
        await messagesCollection.insertOne(userMessageDoc);

        // Check for lore query first
        res.write(`event: analysis\ndata: ${JSON.stringify({ status: 'checking_lore' })}\n\n`);
        
        const loreResponse = await loreQueryService.processLoreQuery(message, sessionId);
        
        if (loreResponse) {
          // Send lore response
          res.write(`event: lore_response\ndata: ${JSON.stringify({ content: loreResponse })}\n\n`);
          
          // Store lore response
          await messagesCollection.insertOne({
            sessionId,
            sender: { type: 'system', name: 'Lore Master' },
            type: 'lore_response',
            content: loreResponse,
            metadata: { generationType: 'lore_query', isLoreQuery: true },
            timestamp: new Date()
          });

          res.write(`event: complete\ndata: ${JSON.stringify({ status: 'complete', type: 'lore' })}\n\n`);
          res.end();
          return;
        }

        // Assemble context for narrative response
        res.write(`event: analysis\ndata: ${JSON.stringify({ status: 'assembling_context' })}\n\n`);
        
        const assembledContext = await contextAssemblyService.assembleContext({
          types: [ContextType.SESSION_HISTORY, ContextType.WORLD_STATE],
          sessionId,
          maxTokens: 1500
        });

        res.write(`event: context\ndata: ${JSON.stringify({ status: 'context_ready' })}\n\n`);

        // Prepare streaming messages
        const systemPrompt = `You are an expert Star Wars Game Master. Respond to the player's action with engaging narrative continuation.

Session Context: ${assembledContext}`;

        const messages: ChatMessage[] = [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Player: ${message}` }
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
            await messagesCollection.insertOne({
              sessionId,
              sender: { type: 'system', name: 'Game Master' },
              type: 'narrative',
              content: fullResponse,
              metadata: {
                generationType: 'streaming_gm_response',
                userInput: message,
                streamingComplete: true
              },
              timestamp: new Date()
            });

            res.write(`event: complete\ndata: ${JSON.stringify({ status: 'complete', type: 'narrative' })}\n\n`);
            res.end();
          },
          (error: Error) => {
            logger.error('Streaming chat error', { error, sessionId });
            res.write(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
          },
          {
            temperature: 0.8,
            max_tokens: 400
          }
        );

      } catch (error) {
        logger.error('Failed to start streaming chat', { error, sessionId });
        res.write(`event: error\ndata: ${JSON.stringify({ error: 'Failed to start generation' })}\n\n`);
        res.end();
      }

    } catch (error) {
      logger.error('Failed to setup streaming chat', { error });
      res.status(500).json({
        success: false,
        error: 'Internal server error during streaming setup'
      });
    }
  }
}

export default new ChatController();