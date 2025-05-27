import { logger } from '../utils/logger';
import neo4jService, { Neo4jService } from './neo4jService';
import mongodbService from './mongodbService';
import weaviateService from './weaviateService';

/**
 * Types of context to retrieve and include
 */
export enum ContextType {
  CHARACTER = 'character',
  LOCATION = 'location',
  FACTION = 'faction',
  ITEM = 'item',
  EVENT = 'event',
  LORE = 'lore',
  SESSION_HISTORY = 'session_history',
  WORLD_STATE = 'world_state',
}

/**
 * Interface for context assembly options
 */
export interface ContextOptions {
  types?: ContextType[];
  maxItems?: number;
  maxTokens?: number;
  sessionId?: string;
  includeIds?: string[];
  query?: string;
}

/**
 * Service for assembling context from various data sources
 */
class ContextAssemblyService {
  private readonly DEFAULT_MAX_ITEMS = 5;
  private readonly DEFAULT_MAX_TOKENS = 4000;

  /**
   * Gather and assemble context from multiple data sources
   */
  async assembleContext(options: ContextOptions = {}): Promise<string> {
    // Set default options
    const types = options.types || Object.values(ContextType);
    const maxItems = options.maxItems || this.DEFAULT_MAX_ITEMS;
    const maxTokens = options.maxTokens || this.DEFAULT_MAX_TOKENS;

    try {
      logger.debug('Assembling context', { types, maxItems, sessionId: options.sessionId });

      const contextParts: string[] = [];
      let remainingTokens = maxTokens;
      
      // Process each context type according to priority
      for (const type of this.prioritizeContextTypes(types)) {
        if (remainingTokens <= 0) break;
        
        // Retrieve context for this type
        const contextPart = await this.retrieveContext(
          type, 
          {
            maxItems,
            maxTokens: remainingTokens,
            sessionId: options.sessionId,
            includeIds: options.includeIds,
            query: options.query
          }
        );
        
        if (contextPart) {
          // Estimate tokens (very rough approximation: 4 chars ≈ 1 token)
          const estimatedTokens = Math.ceil(contextPart.length / 4);
          remainingTokens -= estimatedTokens;
          
          contextParts.push(contextPart);
        }
      }
      
      return contextParts.join('\n\n');
    } catch (error) {
      logger.error('Error assembling context', { error, options });
      return '';
    }
  }

  /**
   * Prioritize context types based on relevance to the current task
   */
  private prioritizeContextTypes(types: ContextType[]): ContextType[] {
    // Base prioritization (can be customized later)
    const priorityOrder: ContextType[] = [
      ContextType.SESSION_HISTORY,  // Most recent conversation
      ContextType.WORLD_STATE,      // Current state of the world
      ContextType.CHARACTER,        // Characters involved
      ContextType.LOCATION,         // Current location
      ContextType.EVENT,            // Recent events
      ContextType.FACTION,          // Relevant factions
      ContextType.ITEM,             // Relevant items
      ContextType.LORE,             // Background lore
    ];
    
    // Filter to only requested types, maintaining priority order
    return priorityOrder.filter(type => types.includes(type));
  }

  /**
   * Retrieve context for a specific type
   */
  private async retrieveContext(
    type: ContextType,
    options: {
      maxItems: number;
      maxTokens: number;
      sessionId?: string;
      includeIds?: string[];
      query?: string;
    }
  ): Promise<string> {
    try {
      switch (type) {
        case ContextType.CHARACTER:
          return this.retrieveCharacterContext(options);
        case ContextType.LOCATION:
          return this.retrieveLocationContext(options);
        case ContextType.FACTION:
          return this.retrieveFactionContext(options);
        case ContextType.EVENT:
          return this.retrieveEventContext(options);
        case ContextType.LORE:
          return this.retrieveLoreContext(options);
        case ContextType.SESSION_HISTORY:
          return this.retrieveSessionHistoryContext(options);
        case ContextType.WORLD_STATE:
          return this.retrieveWorldStateContext(options);
        case ContextType.ITEM:
          return this.retrieveItemContext(options);
        default:
          return '';
      }
    } catch (error) {
      logger.error('Error retrieving context', { error, type, options });
      return '';
    }
  }

  /**
   * Retrieve character context from Neo4j
   */
  private async retrieveCharacterContext(options: {
    maxItems: number;
    maxTokens: number;
    includeIds?: string[];
    query?: string;
  }): Promise<string> {
    try {
      let characters: any[] = [];
      
      // If specific IDs are provided, retrieve those characters
      if (options.includeIds && options.includeIds.length > 0) {
        const query = `
          MATCH (c:Character)
          WHERE c.id IN $ids
          RETURN c
          LIMIT $limit
        `;
        
        const params: any = { ids: options.includeIds, limit: Math.floor(options.maxItems) };
        const result = await neo4jService.read(
          query,
          params,
          (records) => Neo4jService.toObjects(records)
        );
        
        characters = result as any[];
      }
      // If a search query is provided, use it to find relevant characters
      else if (options.query) {
        const result = await weaviateService.semanticSearch(
          'WorldKnowledge',
          options.query,
          ['title', 'content', 'category'],
          options.maxItems,
          {
            path: ['category'],
            operator: 'Equal',
            valueString: 'character'
          }
        );
        
        // Use character names from content instead of relatedEntities
        const allCharacters = await neo4jService.findCharacters({});
        
        // Filter to relevant characters mentioned in the knowledge content
        const relevantCharacters = allCharacters.filter(char => {
          const name = char.name || (char.c && char.c.name);
          return result.some(item => 
            item.content && item.content.toLowerCase().includes(name.toLowerCase())
          );
        }).slice(0, options.maxItems);
        
        characters = relevantCharacters;
      }
      // Otherwise, retrieve a sample of characters
      else {
        const query = `
          MATCH (c:Character)
          RETURN c
          LIMIT $limit
        `;
        
        const result = await neo4jService.read(
          query,
          { limit: Math.floor(options.maxItems) } as any,
          (records) => Neo4jService.toObjects(records)
        );
        
        characters = result as any[];
      }
      
      // Format the character context
      if (characters.length > 0) {
        return `# Characters\n\n${characters.map(char => this.formatCharacter(char)).join('\n\n')}`;
      }
      
      return '';
    } catch (error) {
      logger.error('Error retrieving character context', { error, options });
      return '';
    }
  }

  /**
   * Format a character object into a string
   */
  private formatCharacter(character: any): string {
    try {
      const c = character.c || character;
      
      return `## ${c.name || 'Unknown Character'}
Species: ${c.species || 'Unknown'}
Gender: ${c.gender || 'Unknown'}
Occupation: ${c.occupation || 'Unknown'}
Force User: ${c.forceUser ? 'Yes' : 'No'}
Alignment: ${c.alignment || 'Unknown'}
Personality: ${Array.isArray(c.personality) ? c.personality.join(', ') : c.personality || 'Unknown'}
${c.biography ? `\nBackground: ${c.biography}` : ''}`;
    } catch (error) {
      logger.error('Error formatting character', { error, character });
      return `## Character (Error formatting data)`;
    }
  }

  /**
   * Retrieve location context from Neo4j
   */
  private async retrieveLocationContext(options: {
    maxItems: number;
    maxTokens: number;
    includeIds?: string[];
    query?: string;
  }): Promise<string> {
    try {
      let locations: any[] = [];
      
      // If specific IDs are provided, retrieve those locations
      if (options.includeIds && options.includeIds.length > 0) {
        const query = `
          MATCH (l:Location)
          WHERE l.id IN $ids
          RETURN l
          LIMIT $limit
        `;
        
        const params: any = { ids: options.includeIds, limit: Math.floor(options.maxItems) };
        const result = await neo4jService.read(
          query,
          params,
          (records) => Neo4jService.toObjects(records)
        );
        
        locations = result as any[];
      }
      // If a search query is provided, use it to find relevant locations
      else if (options.query) {
        const result = await weaviateService.semanticSearch(
          'WorldKnowledge',
          options.query,
          ['title', 'content', 'category'],
          options.maxItems,
          {
            path: ['category'],
            operator: 'Equal',
            valueString: 'location'
          }
        );
        
        // Use location names from content instead of relatedEntities
        const allLocations = await neo4jService.findLocations({});
        
        // Filter to relevant locations mentioned in the knowledge content
        const relevantLocations = allLocations.filter(loc => {
          const name = loc.name || (loc.l && loc.l.name);
          return result.some(item => 
            item.content && item.content.toLowerCase().includes(name.toLowerCase())
          );
        }).slice(0, options.maxItems);
        
        locations = relevantLocations;
      }
      // Otherwise, retrieve a sample of locations
      else {
        const query = `
          MATCH (l:Location)
          RETURN l
          LIMIT $limit
        `;
        
        const result = await neo4jService.read(
          query,
          { limit: Math.floor(options.maxItems) } as any,
          (records) => Neo4jService.toObjects(records)
        );
        
        locations = result as any[];
      }
      
      // Format the location context
      if (locations.length > 0) {
        return `# Locations\n\n${locations.map(loc => this.formatLocation(loc)).join('\n\n')}`;
      }
      
      return '';
    } catch (error) {
      logger.error('Error retrieving location context', { error, options });
      return '';
    }
  }

  /**
   * Format a location object into a string
   */
  private formatLocation(location: any): string {
    try {
      const l = location.l || location;
      
      return `## ${l.name || 'Unknown Location'}
Type: ${l.type || 'Unknown'}
Region: ${l.region || 'Unknown'}
Climate: ${l.climate || 'Unknown'}
Population: ${l.population || 'Unknown'}
Government: ${l.government || 'Unknown'}
${l.description ? `\nDescription: ${l.description}` : ''}`;
    } catch (error) {
      logger.error('Error formatting location', { error, location });
      return `## Location (Error formatting data)`;
    }
  }

  /**
   * Retrieve faction context from Neo4j
   */
  private async retrieveFactionContext(options: {
    maxItems: number;
    maxTokens: number;
    includeIds?: string[];
    query?: string;
  }): Promise<string> {
    try {
      let factions: any[] = [];
      
      // Similar implementation as character and location contexts
      // For brevity, this is simplified
      
      const query = `
        MATCH (f:Faction)
        ${options.includeIds && options.includeIds.length > 0 ? 'WHERE f.id IN $ids' : ''}
        RETURN f
        LIMIT $limit
      `;
      
      const result = await neo4jService.read(
        query,
        { 
          ids: options.includeIds || [], 
          limit: Math.floor(options.maxItems) 
        } as any,
        (records) => Neo4jService.toObjects(records)
      );
      
      factions = result as any[];
      
      // Format the faction context
      if (factions.length > 0) {
        return `# Factions\n\n${factions.map(faction => this.formatFaction(faction)).join('\n\n')}`;
      }
      
      return '';
    } catch (error) {
      logger.error('Error retrieving faction context', { error, options });
      return '';
    }
  }

  /**
   * Format a faction object into a string
   */
  private formatFaction(faction: any): string {
    try {
      const f = faction.f || faction;
      
      return `## ${f.name || 'Unknown Faction'}
Type: ${f.type || 'Unknown'}
Leader: ${f.leader || 'Unknown'}
Headquarters: ${f.headquarters || 'Unknown'}
Founded: ${f.founded || 'Unknown'}
Ideology: ${f.ideology || 'Unknown'}
Goals: ${Array.isArray(f.goals) ? f.goals.join(', ') : f.goals || 'Unknown'}
Strength: ${f.strength || 'Unknown'}
${f.description ? `\nDescription: ${f.description}` : ''}`;
    } catch (error) {
      logger.error('Error formatting faction', { error, faction });
      return `## Faction (Error formatting data)`;
    }
  }

  /**
   * Retrieve event context from Neo4j and Weaviate
   */
  private async retrieveEventContext(options: {
    maxItems: number;
    maxTokens: number;
    includeIds?: string[];
    query?: string;
  }): Promise<string> {
    try {
      // Implementation would combine Neo4j event data with StoryEvent data from Weaviate
      // Simplified for brevity
      
      let events: any[] = [];
      
      if (options.query) {
        // Use semantic search to find relevant events
        const result = await weaviateService.findRelatedStoryEvents(
          options.query,
          options.maxItems
        );
        
        events = result as any[];
      } else if (options.includeIds && options.includeIds.length > 0) {
        // Retrieve specific events from Neo4j
        const query = `
          MATCH (e:Event)
          WHERE e.id IN $ids
          RETURN e
          LIMIT $limit
        `;
        
        const params: any = { ids: options.includeIds, limit: Math.floor(options.maxItems) };
        const result = await neo4jService.read(
          query,
          params,
          (records) => Neo4jService.toObjects(records)
        );
        
        events = result as any[];
      }
      
      // Format the event context
      if (events.length > 0) {
        return `# Events\n\n${events.map(event => this.formatEvent(event)).join('\n\n')}`;
      }
      
      return '';
    } catch (error) {
      logger.error('Error retrieving event context', { error, options });
      return '';
    }
  }

  /**
   * Format an event object into a string
   */
  private formatEvent(event: any): string {
    try {
      // Handle both Neo4j and Weaviate event formats
      const title = event.title || event.name || 'Unknown Event';
      const description = event.description || 'No description available';
      const date = event.date || event.timestamp || 'Unknown date';
      const location = event.location || 'Unknown location';
      const significance = event.significance || 'Unknown significance';
      
      return `## ${title}
Date: ${date}
Location: ${location}
Significance: ${significance}

${description}`;
    } catch (error) {
      logger.error('Error formatting event', { error, event });
      return `## Event (Error formatting data)`;
    }
  }

  /**
   * Retrieve item context from Neo4j
   */
  private async retrieveItemContext(options: {
    maxItems: number;
    maxTokens: number;
    includeIds?: string[];
    query?: string;
  }): Promise<string> {
    try {
      // Similar implementation as other contexts
      // Simplified for brevity
      
      let items: any[] = [];
      
      if (options.includeIds && options.includeIds.length > 0) {
        const query = `
          MATCH (i:Item)
          WHERE i.id IN $ids
          RETURN i
          LIMIT $limit
        `;
        
        const params: any = { ids: options.includeIds, limit: Math.floor(options.maxItems) };
        const result = await neo4jService.read(
          query,
          params,
          (records) => Neo4jService.toObjects(records)
        );
        
        items = result;
      }
      
      // Format the item context
      if (items.length > 0) {
        return `# Items\n\n${items.map(item => this.formatItem(item)).join('\n\n')}`;
      }
      
      return '';
    } catch (error) {
      logger.error('Error retrieving item context', { error, options });
      return '';
    }
  }

  /**
   * Format an item object into a string
   */
  private formatItem(item: any): string {
    try {
      const i = item.i || item;
      
      return `## ${i.name || 'Unknown Item'}
Type: ${i.type || 'Unknown'}
Manufacturer: ${i.manufacturer || 'Unknown'}
Class: ${i.class || 'Unknown'}
Rarity: ${i.rarity || 'Unknown'}
${i.description ? `\nDescription: ${i.description}` : ''}
${i.abilities ? `\nAbilities: ${Array.isArray(i.abilities) ? i.abilities.join(', ') : i.abilities}` : ''}`;
    } catch (error) {
      logger.error('Error formatting item', { error, item });
      return `## Item (Error formatting data)`;
    }
  }

  /**
   * Retrieve lore context from Weaviate
   */
  private async retrieveLoreContext(options: {
    maxItems: number;
    maxTokens: number;
    query?: string;
  }): Promise<string> {
    try {
      if (!options.query) {
        return '';  // Need a query to find relevant lore
      }
      
      // Use semantic search to find relevant world knowledge
      const result = await weaviateService.findRelatedWorldKnowledge(
        options.query,
        options.maxItems
      );
      
      // Format the lore context
      if (result.length > 0) {
        return `# Star Wars Lore\n\n${result.map(lore => this.formatLore(lore)).join('\n\n')}`;
      }
      
      return '';
    } catch (error) {
      logger.error('Error retrieving lore context', { error, options });
      return '';
    }
  }

  /**
   * Format a lore object into a string
   */
  private formatLore(lore: any): string {
    try {
      return `## ${lore.title || 'Unknown Lore'}
Category: ${lore.category || 'Unknown'}
Era: ${lore.era || 'Unknown'}
Canonicity: ${lore.canonicity || 'Unknown'}

${lore.content || 'No content available'}`;
    } catch (error) {
      logger.error('Error formatting lore', { error, lore });
      return `## Lore (Error formatting data)`;
    }
  }

  /**
   * Retrieve session history context from MongoDB
   */
  private async retrieveSessionHistoryContext(options: {
    maxItems: number;
    maxTokens: number;
    sessionId?: string;
  }): Promise<string> {
    try {
      if (!options.sessionId) {
        return '';  // Need a session ID to retrieve history
      }
      
      // Get the messages collection
      const messagesCollection = mongodbService.getMessagesCollection();
      
      // Query recent messages for this session
      const messages = await messagesCollection
        .find({ sessionId: options.sessionId })
        .sort({ timestamp: -1 })
        .limit(options.maxItems)
        .toArray();
      
      // Reverse to get chronological order
      messages.reverse();
      
      // Format the session history context
      if (messages.length > 0) {
        return `# Recent Session History\n\n${messages.map(msg => this.formatMessage(msg)).join('\n\n')}`;
      }
      
      return '';
    } catch (error) {
      logger.error('Error retrieving session history context', { error, options });
      return '';
    }
  }

  /**
   * Format a message object into a string
   */
  private formatMessage(message: any): string {
    try {
      const sender = message.sender?.name || message.sender?.type || 'Unknown';
      const timestamp = new Date(message.timestamp).toISOString();
      
      return `## Message (${timestamp})
From: ${sender}
Type: ${message.type || 'Unknown'}

${message.content || 'No content'}`;
    } catch (error) {
      logger.error('Error formatting message', { error, message });
      return `## Message (Error formatting data)`;
    }
  }

  /**
   * Retrieve world state context from MongoDB
   */
  private async retrieveWorldStateContext(options: {
    maxItems: number;
    maxTokens: number;
    sessionId?: string;
  }): Promise<string> {
    try {
      if (!options.sessionId) {
        return '';  // Need a session ID to retrieve world state
      }
      
      // Get the sessions collection to find the current state ID
      const sessionsCollection = mongodbService.getSessionsCollection();
      
      // Find the session
      const session = await sessionsCollection.findOne({ _id: options.sessionId });
      
      if (!session || !session.currentStateId) {
        return '';  // No session or current state
      }
      
      // Get the world states collection
      const worldStatesCollection = mongodbService.getWorldStatesCollection();
      
      // Find the current world state
      const worldState = await worldStatesCollection.findOne({ _id: session.currentStateId });
      
      if (!worldState) {
        return '';  // No world state found
      }
      
      // Format the world state context
      return this.formatWorldState(worldState);
    } catch (error) {
      logger.error('Error retrieving world state context', { error, options });
      return '';
    }
  }

  /**
   * Format a world state object into a string
   */
  private formatWorldState(worldState: any): string {
    try {
      let result = `# Current World State\n\nTimestamp: ${new Date(worldState.timestamp).toISOString()}\n`;
      
      // Add characters
      if (worldState.entities?.characters && worldState.entities.characters.length > 0) {
        result += '\n## Characters\n';
        for (const char of worldState.entities.characters) {
          result += `- ${char.id}: Status: ${char.status}, Location: ${char.location}\n`;
          if (char.notes) {
            result += `  Notes: ${char.notes}\n`;
          }
        }
      }
      
      // Add locations
      if (worldState.entities?.locations && worldState.entities.locations.length > 0) {
        result += '\n## Locations\n';
        for (const loc of worldState.entities.locations) {
          result += `- ${loc.id}: Status: ${loc.status}\n`;
          if (loc.notes) {
            result += `  Notes: ${loc.notes}\n`;
          }
        }
      }
      
      // Add factions
      if (worldState.entities?.factions && worldState.entities.factions.length > 0) {
        result += '\n## Factions\n';
        for (const faction of worldState.entities.factions) {
          result += `- ${faction.id}\n`;
          if (faction.notes) {
            result += `  Notes: ${faction.notes}\n`;
          }
        }
      }
      
      // Add plot points
      if (worldState.plotPoints && worldState.plotPoints.length > 0) {
        result += '\n## Active Plot Points\n';
        for (const plot of worldState.plotPoints) {
          result += `- ${plot.type}: ${plot.description} (Status: ${plot.status})\n`;
        }
      }
      
      // Add active quests
      if (worldState.activeQuests && worldState.activeQuests.length > 0) {
        result += '\n## Active Quests\n';
        for (const quest of worldState.activeQuests) {
          result += `- ${quest.id}: Status: ${quest.status}, Progress: ${quest.progress}%\n`;
          if (quest.nextSteps && quest.nextSteps.length > 0) {
            result += `  Next Steps: ${quest.nextSteps.join(', ')}\n`;
          }
        }
      }
      
      return result;
    } catch (error) {
      logger.error('Error formatting world state', { error, worldState });
      return `# World State (Error formatting data)`;
    }
  }
}

// Create singleton instance
const contextAssemblyService = new ContextAssemblyService();

export default contextAssemblyService;