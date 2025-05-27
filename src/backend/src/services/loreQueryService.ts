import { logger } from '../utils/logger';
import neo4jService from './neo4jService';
import weaviateService from './weaviateService';
import localAiService, { ChatMessage } from './localAiService';

export interface LoreQueryResult {
  isLoreQuery: boolean;
  queryType: 'character' | 'location' | 'faction' | 'event' | 'general' | null;
  entities: any[];
  directAnswer?: string;
  relatedContent?: any[];
}

/**
 * Service for handling lore-based questions by querying our Star Wars database
 */
class LoreQueryService {
  
  /**
   * Analyze user input to determine if it's a lore question
   */
  async analyzeLoreQuery(userInput: string): Promise<LoreQueryResult> {
    try {
      // Use LLM to classify the query
      const classificationPrompt = `Analyze this user input to determine if it's asking for Star Wars lore information:

"${userInput}"

Respond with JSON in this exact format:
{
  "isLoreQuery": true/false,
  "queryType": "character|location|faction|event|general|null",
  "extractedEntities": ["entity1", "entity2"],
  "confidenceLevel": 0.0-1.0
}

Examples:
- "Where was Luke Skywalker born?" → isLoreQuery: true, queryType: "character", extractedEntities: ["Luke Skywalker"]
- "What is Tatooine like?" → isLoreQuery: true, queryType: "location", extractedEntities: ["Tatooine"]  
- "I want to attack the stormtroopers" → isLoreQuery: false, queryType: null
- "Tell me about the Rebel Alliance" → isLoreQuery: true, queryType: "faction", extractedEntities: ["Rebel Alliance"]`;

      const response = await localAiService.createChatCompletion([
        { role: 'system', content: 'You are an expert at analyzing Star Wars lore queries. Always respond with valid JSON.' },
        { role: 'user', content: classificationPrompt }
      ], {
        temperature: 0.1,
        max_tokens: 200
      });

      let classification;
      try {
        // Extract JSON from response
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          classification = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        logger.warn('Failed to parse lore query classification', { error: e, response });
        return {
          isLoreQuery: false,
          queryType: null,
          entities: []
        };
      }

      if (!classification.isLoreQuery || classification.confidenceLevel < 0.7) {
        return {
          isLoreQuery: false,
          queryType: null,
          entities: []
        };
      }

      // Query database for entities
      const entities = await this.findEntitiesInDatabase(
        classification.extractedEntities,
        classification.queryType
      );

      let directAnswer = '';
      let relatedContent: any[] = [];

      if (entities.length > 0) {
        // Generate contextual answer based on found entities
        directAnswer = await this.generateContextualAnswer(userInput, entities);
        
        // Find related content from Weaviate
        relatedContent = await this.findRelatedContent(userInput, classification.queryType);
      }

      return {
        isLoreQuery: true,
        queryType: classification.queryType,
        entities,
        directAnswer,
        relatedContent
      };

    } catch (error) {
      logger.error('Failed to analyze lore query', { error, userInput });
      return {
        isLoreQuery: false,
        queryType: null,
        entities: []
      };
    }
  }

  /**
   * Find entities in Neo4j database
   */
  private async findEntitiesInDatabase(entityNames: string[], queryType: string): Promise<any[]> {
    try {
      const foundEntities: any[] = [];

      for (const entityName of entityNames) {
        let entity = null;

        // Try to find the entity based on query type
        switch (queryType) {
          case 'character':
            entity = await this.findCharacterByName(entityName);
            break;
          case 'location':
            entity = await this.findLocationByName(entityName);
            break;
          case 'faction':
            entity = await this.findFactionByName(entityName);
            break;
          default:
            // Try all types
            entity = await this.findCharacterByName(entityName) ||
                     await this.findLocationByName(entityName) ||
                     await this.findFactionByName(entityName);
        }

        if (entity) {
          foundEntities.push({
            ...entity,
            entityType: this.determineEntityType(entity)
          });
        }
      }

      return foundEntities;
    } catch (error) {
      logger.error('Failed to find entities in database', { error, entityNames, queryType });
      return [];
    }
  }

  /**
   * Find character by name in Neo4j
   */
  private async findCharacterByName(name: string): Promise<any> {
    try {
      const query = `
        MATCH (c:Character)
        WHERE toLower(c.name) CONTAINS toLower($name)
        RETURN c
        LIMIT 1
      `;

      const result = await neo4jService.read(query, { name }) as any[];
      if (result.length > 0) {
        const character = result[0].c || result[0];
        return {
          id: character.id,
          name: character.name,
          species: character.species,
          occupation: character.occupation,
          homeworld: character.homeworld,
          affiliation: character.affiliation,
          forceUser: character.forceUser,
          alignment: character.alignment,
          personality: character.personality,
          biography: character.biography
        };
      }
      return null;
    } catch (error) {
      logger.error('Failed to find character', { error, name });
      return null;
    }
  }

  /**
   * Find location by name in Neo4j
   */
  private async findLocationByName(name: string): Promise<any> {
    try {
      const query = `
        MATCH (l:Location)
        WHERE toLower(l.name) CONTAINS toLower($name)
        RETURN l
        LIMIT 1
      `;

      const result = await neo4jService.read(query, { name }) as any[];
      if (result.length > 0) {
        const location = result[0].l || result[0];
        return {
          id: location.id,
          name: location.name,
          type: location.type,
          region: location.region,
          climate: location.climate,
          population: location.population,
          government: location.government,
          description: location.description
        };
      }
      return null;
    } catch (error) {
      logger.error('Failed to find location', { error, name });
      return null;
    }
  }

  /**
   * Find faction by name in Neo4j
   */
  private async findFactionByName(name: string): Promise<any> {
    try {
      const query = `
        MATCH (f:Faction)
        WHERE toLower(f.name) CONTAINS toLower($name)
        RETURN f
        LIMIT 1
      `;

      const result = await neo4jService.read(query, { name }) as any[];
      if (result.length > 0) {
        const faction = result[0].f || result[0];
        return {
          id: faction.id,
          name: faction.name,
          type: faction.type,
          leader: faction.leader,
          headquarters: faction.headquarters,
          founded: faction.founded,
          ideology: faction.ideology,
          goals: faction.goals,
          description: faction.description
        };
      }
      return null;
    } catch (error) {
      logger.error('Failed to find faction', { error, name });
      return null;
    }
  }

  /**
   * Determine entity type from properties
   */
  private determineEntityType(entity: any): string {
    if (entity.species || entity.occupation) return 'character';
    if (entity.climate || entity.region) return 'location';
    if (entity.ideology || entity.leader) return 'faction';
    return 'unknown';
  }

  /**
   * Generate contextual answer based on found entities
   */
  private async generateContextualAnswer(userInput: string, entities: any[]): Promise<string> {
    try {
      // Prepare entity information for the LLM
      const entityInfo = entities.map(entity => {
        const type = entity.entityType;
        let info = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${entity.name}\n`;
        
        switch (type) {
          case 'character':
            info += `- Species: ${entity.species || 'Unknown'}\n`;
            info += `- Occupation: ${entity.occupation || 'Unknown'}\n`;
            info += `- Homeworld: ${entity.homeworld || 'Unknown'}\n`;
            info += `- Affiliation: ${entity.affiliation || 'Unknown'}\n`;
            if (entity.biography) info += `- Biography: ${entity.biography}\n`;
            break;
          case 'location':
            info += `- Type: ${entity.type || 'Unknown'}\n`;
            info += `- Region: ${entity.region || 'Unknown'}\n`;
            info += `- Climate: ${entity.climate || 'Unknown'}\n`;
            info += `- Population: ${entity.population || 'Unknown'}\n`;
            if (entity.description) info += `- Description: ${entity.description}\n`;
            break;
          case 'faction':
            info += `- Type: ${entity.type || 'Unknown'}\n`;
            info += `- Leader: ${entity.leader || 'Unknown'}\n`;
            info += `- Headquarters: ${entity.headquarters || 'Unknown'}\n`;
            if (entity.description) info += `- Description: ${entity.description}\n`;
            break;
        }
        return info;
      }).join('\n');

      const systemPrompt = `You are a knowledgeable Star Wars lore expert and Game Master. 
Answer the user's question using ONLY the provided database information. 
Be accurate, concise, and engaging. If the information isn't available in the database, say so.
Stay in character as a helpful GM who knows the Star Wars universe well.

Available Information:
${entityInfo}`;

      const response = await localAiService.createChatCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userInput }
      ], {
        temperature: 0.3,
        max_tokens: 300
      });

      return response.trim();
    } catch (error) {
      logger.error('Failed to generate contextual answer', { error, userInput });
      return "I'm sorry, I couldn't retrieve that information from our database right now.";
    }
  }

  /**
   * Find related content from Weaviate
   */
  private async findRelatedContent(query: string, queryType: string): Promise<any[]> {
    try {
      // Search for related world knowledge
      const worldKnowledge = await weaviateService.findRelatedWorldKnowledge(query, 3);
      
      // Search for related story events
      const storyEvents = await weaviateService.findRelatedStoryEvents(query, 2);
      
      return [
        ...worldKnowledge.map(item => ({ ...item, type: 'world_knowledge' })),
        ...storyEvents.map(item => ({ ...item, type: 'story_event' }))
      ];
    } catch (error) {
      logger.error('Failed to find related content', { error, query });
      return [];
    }
  }

  /**
   * Process a lore query and return a comprehensive response
   */
  async processLoreQuery(userInput: string, sessionId: string): Promise<string> {
    try {
      const queryResult = await this.analyzeLoreQuery(userInput);

      if (!queryResult.isLoreQuery) {
        // Not a lore query, return null to indicate regular processing should continue
        return '';
      }

      if (queryResult.entities.length === 0) {
        return "I searched our Star Wars database but couldn't find specific information about that. Could you be more specific or ask about a different character, location, or faction?";
      }

      let response = queryResult.directAnswer || '';

      // Add related content if available
      if (queryResult.relatedContent && queryResult.relatedContent.length > 0) {
        response += '\n\n**Related Information:**\n';
        for (const item of queryResult.relatedContent.slice(0, 2)) {
          if (item.title && item.content) {
            response += `• ${item.title}: ${item.content.substring(0, 100)}...\n`;
          }
        }
      }

      return response;
    } catch (error) {
      logger.error('Failed to process lore query', { error, userInput, sessionId });
      return "I encountered an error while searching our Star Wars database. Please try your question again.";
    }
  }
}

// Create singleton instance
const loreQueryService = new LoreQueryService();

export default loreQueryService;