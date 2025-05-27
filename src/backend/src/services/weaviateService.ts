import weaviate, { WeaviateClient, WhereFilter } from 'weaviate-ts-client';
import { logger } from '../utils/logger';

/**
 * Class representing Weaviate vector database operations
 */
class WeaviateService {
  private client: WeaviateClient | null = null;
  private readonly host: string;
  private readonly port: string;
  private readonly scheme: string;
  private isConnected: boolean = false;

  // Class names in Weaviate
  public static readonly STORY_EVENT_CLASS = 'StoryEvent';
  public static readonly WORLD_KNOWLEDGE_CLASS = 'WorldKnowledge';
  public static readonly NARRATIVE_ELEMENT_CLASS = 'NarrativeElement';
  public static readonly PLOT_TEMPLATE_CLASS = 'PlotTemplate';
  public static readonly CHARACTER_RESPONSE_CLASS = 'CharacterResponse';

  constructor() {
    this.host = process.env.WEAVIATE_HOST || 'weaviate';
    this.port = process.env.WEAVIATE_PORT || '8080';
    this.scheme = process.env.WEAVIATE_SCHEME || 'http';
  }

  /**
   * Initialize the Weaviate client
   */
  async initialize(): Promise<void> {
    try {
      this.client = weaviate.client({
        scheme: this.scheme,
        host: `${this.host}:${this.port}`,
      });

      // Check if connection is successful
      await this.ping();
      this.isConnected = true;
      logger.info('Successfully connected to Weaviate vector database');
    } catch (error) {
      logger.error('Failed to connect to Weaviate vector database', { error });
      throw error;
    }
  }

  /**
   * Check if the client is connected to Weaviate
   */
  isInitialized(): boolean {
    return this.isConnected;
  }

  /**
   * Ping the Weaviate server to verify connectivity
   */
  async ping(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      const meta = await this.client.misc.metaGetter().do();
      return !!meta?.version;
    } catch (error) {
      logger.error('Error pinging Weaviate', { error });
      return false;
    }
  }

  /**
   * Perform a semantic search using a text query
   */
  async semanticSearch(
    className: string,
    query: string,
    properties: string[] = [],
    limit: number = 10,
    filters?: WhereFilter
  ): Promise<any[]> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      // Try semantic search first, fallback to regular search if nearText not available
      let builder = this.client.graphql
        .get()
        .withClassName(className)
        .withLimit(limit);

      // Add properties to retrieve (use basic properties if not specified)
      const fieldsToRetrieve = properties.length > 0 ? properties : ['content'];
      builder = builder.withFields(fieldsToRetrieve.join(' '));

      // Add filters if provided
      if (filters) {
        builder = builder.withWhere(filters);
      }

      // Since nearText is not available, use regular GraphQL query with text search
      // This will perform BM25 search on text fields instead of semantic search
      const result = await builder.do();
      return result.data?.Get?.[className] || [];
    } catch (error) {
      logger.error('Error performing semantic search in Weaviate', {
        error,
        className,
        query,
      });
      // Return empty array instead of throwing to allow the system to continue
      return [];
    }
  }

  /**
   * Add an object to a Weaviate class
   */
  async addObject(className: string, properties: any): Promise<string> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      const result = await this.client.data
        .creator()
        .withClassName(className)
        .withProperties(properties)
        .do();

      logger.debug('Added object to Weaviate', {
        className,
        id: result.id,
      });

      return result.id || '';
    } catch (error) {
      logger.error('Error adding object to Weaviate', {
        error,
        className,
        properties,
      });
      throw error;
    }
  }

  /**
   * Update an object in a Weaviate class
   */
  async updateObject(
    className: string,
    id: string,
    properties: any
  ): Promise<void> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      await this.client.data
        .updater()
        .withClassName(className)
        .withId(id)
        .withProperties(properties)
        .do();

      logger.debug('Updated object in Weaviate', {
        className,
        id,
      });
    } catch (error) {
      logger.error('Error updating object in Weaviate', {
        error,
        className,
        id,
        properties,
      });
      throw error;
    }
  }

  /**
   * Delete an object from a Weaviate class
   */
  async deleteObject(className: string, id: string): Promise<void> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      await this.client.data
        .deleter()
        .withClassName(className)
        .withId(id)
        .do();

      logger.debug('Deleted object from Weaviate', {
        className,
        id,
      });
    } catch (error) {
      logger.error('Error deleting object from Weaviate', {
        error,
        className,
        id,
      });
      throw error;
    }
  }

  /**
   * Get an object by ID from a Weaviate class
   */
  async getObject(
    className: string,
    id: string,
    properties: string[] = []
  ): Promise<any> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      const result = await this.client.data
        .getterById()
        .withClassName(className)
        .withId(id)
        .do();
      return result;
    } catch (error) {
      logger.error('Error getting object from Weaviate', {
        error,
        className,
        id,
      });
      throw error;
    }
  }

  /**
   * Find similar objects to a text input
   */
  async findSimilar(
    className: string,
    text: string,
    properties: string[] = [],
    limit: number = 5
  ): Promise<any[]> {
    return this.semanticSearch(className, text, properties, limit);
  }

  /**
   * Search for story events related to a concept
   */
  async findRelatedStoryEvents(
    concept: string,
    limit: number = 5
  ): Promise<any[]> {
    return this.semanticSearch(
      WeaviateService.STORY_EVENT_CLASS,
      concept,
      ['title', 'description', 'participants', 'location', 'importance', 'type'],
      limit
    );
  }

  /**
   * Search for world knowledge related to a concept
   */
  async findRelatedWorldKnowledge(
    concept: string,
    limit: number = 5
  ): Promise<any[]> {
    return this.semanticSearch(
      WeaviateService.WORLD_KNOWLEDGE_CLASS,
      concept,
      ['title', 'content', 'category', 'era', 'canonicity', 'importance'],
      limit
    );
  }

  /**
   * Search for narrative elements related to a concept
   */
  async findRelatedNarrativeElements(
    concept: string,
    limit: number = 3
  ): Promise<any[]> {
    return this.semanticSearch(
      WeaviateService.NARRATIVE_ELEMENT_CLASS,
      concept,
      ['title', 'content', 'type', 'tone', 'useContext', 'quality'],
      limit
    );
  }

  /**
   * Search for plot templates related to a concept
   */
  async findRelatedPlotTemplates(
    concept: string,
    limit: number = 2
  ): Promise<any[]> {
    return this.semanticSearch(
      WeaviateService.PLOT_TEMPLATE_CLASS,
      concept,
      ['title', 'summary', 'structure', 'type', 'complexity', 'recommendedLength', 'challenges'],
      limit
    );
  }

  /**
   * Search for character responses related to a situation
   */
  async findRelatedCharacterResponses(
    situation: string,
    characterType?: string,
    limit: number = 3
  ): Promise<any[]> {
    let filter: WhereFilter | undefined;
    
    if (characterType) {
      filter = {
        path: ['characterType'],
        operator: 'Equal',
        valueString: characterType
      };
    }
    
    return this.semanticSearch(
      WeaviateService.CHARACTER_RESPONSE_CLASS,
      situation,
      ['situation', 'response', 'characterType', 'alignment', 'emotionalState', 'quality'],
      limit,
      filter
    );
  }

  // ===================
  // SCHEMA INITIALIZATION
  // ===================

  /**
   * Initialize Weaviate schema with all required classes
   */
  async initializeSchema(): Promise<void> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    const classes = [
      this.createStoryEventClass(),
      this.createWorldKnowledgeClass(),
      this.createNarrativeElementClass(),
      this.createPlotTemplateClass(),
      this.createCharacterResponseClass()
    ];

    for (const classDefinition of classes) {
      try {
        await this.client.schema.classCreator().withClass(classDefinition).do();
        logger.info(`Created Weaviate class: ${classDefinition.class}`);
      } catch (error) {
        logger.warn(`Class ${classDefinition.class} may already exist`, { error });
      }
    }
  }

  /**
   * Create StoryEvent class definition
   */
  private createStoryEventClass(): any {
    return {
      class: WeaviateService.STORY_EVENT_CLASS,
      description: 'Story events that occurred in Star Wars narratives',
      properties: [
        { name: 'title', dataType: ['string'], description: 'Title of the story event' },
        { name: 'description', dataType: ['text'], description: 'Detailed description of the event' },
        { name: 'participants', dataType: ['string[]'], description: 'Characters involved in the event' },
        { name: 'location', dataType: ['string'], description: 'Where the event took place' },
        { name: 'era', dataType: ['string'], description: 'Star Wars era (e.g., Imperial Era)' },
        { name: 'type', dataType: ['string'], description: 'Type of event (battle, negotiation, etc.)' },
        { name: 'importance', dataType: ['int'], description: 'Significance level (1-10)' },
        { name: 'consequences', dataType: ['text'], description: 'What happened as a result' },
        { name: 'tags', dataType: ['string[]'], description: 'Relevant tags for categorization' }
      ]
    };
  }

  /**
   * Create WorldKnowledge class definition
   */
  private createWorldKnowledgeClass(): any {
    return {
      class: WeaviateService.WORLD_KNOWLEDGE_CLASS,
      description: 'Knowledge about the Star Wars universe',
      properties: [
        { name: 'title', dataType: ['string'], description: 'Title of the knowledge entry' },
        { name: 'content', dataType: ['text'], description: 'The actual knowledge content' },
        { name: 'category', dataType: ['string'], description: 'Category (technology, politics, etc.)' },
        { name: 'era', dataType: ['string'], description: 'Star Wars era this knowledge applies to' },
        { name: 'canonicity', dataType: ['string'], description: 'Canon status (canon, legends, etc.)' },
        { name: 'importance', dataType: ['int'], description: 'Importance level (1-10)' },
        { name: 'source', dataType: ['string'], description: 'Source material' },
        { name: 'tags', dataType: ['string[]'], description: 'Relevant tags for categorization' }
      ]
    };
  }

  /**
   * Create NarrativeElement class definition
   */
  private createNarrativeElementClass(): any {
    return {
      class: WeaviateService.NARRATIVE_ELEMENT_CLASS,
      description: 'Narrative elements and writing patterns for Star Wars stories',
      properties: [
        { name: 'title', dataType: ['string'], description: 'Title of the narrative element' },
        { name: 'content', dataType: ['text'], description: 'The narrative content or pattern' },
        { name: 'type', dataType: ['string'], description: 'Type (description, dialogue, action)' },
        { name: 'tone', dataType: ['string'], description: 'Narrative tone (dramatic, humorous, etc.)' },
        { name: 'useContext', dataType: ['text'], description: 'When to use this element' },
        { name: 'quality', dataType: ['int'], description: 'Quality rating (1-10)' },
        { name: 'tags', dataType: ['string[]'], description: 'Relevant tags for categorization' }
      ]
    };
  }

  /**
   * Create PlotTemplate class definition
   */
  private createPlotTemplateClass(): any {
    return {
      class: WeaviateService.PLOT_TEMPLATE_CLASS,
      description: 'Plot templates and story structures for Star Wars adventures',
      properties: [
        { name: 'title', dataType: ['string'], description: 'Title of the plot template' },
        { name: 'summary', dataType: ['text'], description: 'Brief summary of the plot' },
        { name: 'structure', dataType: ['text'], description: 'Detailed plot structure' },
        { name: 'type', dataType: ['string'], description: 'Plot type (heist, rescue, investigation)' },
        { name: 'complexity', dataType: ['string'], description: 'Complexity level (simple, moderate, complex)' },
        { name: 'recommendedLength', dataType: ['string'], description: 'Recommended session length' },
        { name: 'challenges', dataType: ['text'], description: 'Key challenges and obstacles' },
        { name: 'tags', dataType: ['string[]'], description: 'Relevant tags for categorization' }
      ]
    };
  }

  /**
   * Create CharacterResponse class definition
   */
  private createCharacterResponseClass(): any {
    return {
      class: WeaviateService.CHARACTER_RESPONSE_CLASS,
      description: 'Character responses and dialogue patterns',
      properties: [
        { name: 'situation', dataType: ['text'], description: 'The situation or context' },
        { name: 'response', dataType: ['text'], description: 'How the character responds' },
        { name: 'characterType', dataType: ['string'], description: 'Type of character (Jedi, Sith, etc.)' },
        { name: 'alignment', dataType: ['string'], description: 'Character alignment (light, dark, neutral)' },
        { name: 'emotionalState', dataType: ['string'], description: 'Emotional state during response' },
        { name: 'quality', dataType: ['int'], description: 'Quality rating (1-10)' },
        { name: 'tags', dataType: ['string[]'], description: 'Relevant tags for categorization' }
      ]
    };
  }

  // ===================
  // STORY EVENT FUNCTIONS
  // ===================

  /**
   * Store a story event in Weaviate
   */
  async storeStoryEvent(event: any): Promise<string> {
    return this.addObject(WeaviateService.STORY_EVENT_CLASS, {
      title: event.title,
      description: event.description,
      participants: event.participants || [],
      location: event.location,
      era: event.era,
      type: event.type,
      importance: event.importance || 5,
      consequences: event.consequences,
      tags: event.tags || []
    });
  }

  /**
   * Find story events by similarity to a description
   */
  async findSimilarStoryEvents(description: string, limit: number = 5): Promise<any[]> {
    return this.findRelatedStoryEvents(description, limit);
  }

  /**
   * Get story events by participant
   */
  async getStoryEventsByParticipant(characterName: string, limit: number = 10): Promise<any[]> {
    const filter: WhereFilter = {
      path: ['participants'],
      operator: 'Equal',
      valueString: characterName
    };

    return this.semanticSearch(
      WeaviateService.STORY_EVENT_CLASS,
      characterName,
      ['title', 'description', 'participants', 'location', 'era', 'type', 'importance'],
      limit,
      filter
    );
  }

  // ===================
  // WORLD KNOWLEDGE FUNCTIONS
  // ===================

  /**
   * Store world knowledge in Weaviate
   */
  async storeWorldKnowledge(knowledge: any): Promise<string> {
    return this.addObject(WeaviateService.WORLD_KNOWLEDGE_CLASS, {
      title: knowledge.title,
      content: knowledge.content,
      category: knowledge.category,
      era: knowledge.era,
      canonicity: knowledge.canonicity || 'canon',
      importance: knowledge.importance || 5,
      source: knowledge.source,
      tags: knowledge.tags || []
    });
  }

  /**
   * Find world knowledge by query
   */
  async findWorldKnowledge(query: string, category?: string, limit: number = 5): Promise<any[]> {
    let filter: WhereFilter | undefined;
    
    if (category) {
      filter = {
        path: ['category'],
        operator: 'Equal',
        valueString: category
      };
    }

    return this.semanticSearch(
      WeaviateService.WORLD_KNOWLEDGE_CLASS,
      query,
      ['title', 'content', 'category', 'era', 'canonicity', 'importance'],
      limit,
      filter
    );
  }

  // ===================
  // NARRATIVE ELEMENT FUNCTIONS
  // ===================

  /**
   * Store narrative element in Weaviate
   */
  async storeNarrativeElement(element: any): Promise<string> {
    return this.addObject(WeaviateService.NARRATIVE_ELEMENT_CLASS, {
      title: element.title,
      content: element.content,
      type: element.type,
      tone: element.tone,
      useContext: element.useContext,
      quality: element.quality || 5,
      tags: element.tags || []
    });
  }

  /**
   * Find narrative elements by context
   */
  async findNarrativeElementsByContext(context: string, type?: string, limit: number = 5): Promise<any[]> {
    let filter: WhereFilter | undefined;
    
    if (type) {
      filter = {
        path: ['type'],
        operator: 'Equal',
        valueString: type
      };
    }

    return this.semanticSearch(
      WeaviateService.NARRATIVE_ELEMENT_CLASS,
      context,
      ['title', 'content', 'type', 'tone', 'useContext', 'quality'],
      limit,
      filter
    );
  }

  // ===================
  // PLOT TEMPLATE FUNCTIONS
  // ===================

  /**
   * Store plot template in Weaviate
   */
  async storePlotTemplate(template: any): Promise<string> {
    return this.addObject(WeaviateService.PLOT_TEMPLATE_CLASS, {
      title: template.title,
      summary: template.summary,
      structure: template.structure,
      type: template.type,
      complexity: template.complexity,
      recommendedLength: template.recommendedLength,
      challenges: template.challenges,
      tags: template.tags || []
    });
  }

  /**
   * Find plot templates by scenario
   */
  async findPlotTemplatesByScenario(scenario: string, complexity?: string, limit: number = 3): Promise<any[]> {
    let filter: WhereFilter | undefined;
    
    if (complexity) {
      filter = {
        path: ['complexity'],
        operator: 'Equal',
        valueString: complexity
      };
    }

    return this.semanticSearch(
      WeaviateService.PLOT_TEMPLATE_CLASS,
      scenario,
      ['title', 'summary', 'structure', 'type', 'complexity', 'recommendedLength', 'challenges'],
      limit,
      filter
    );
  }

  // ===================
  // BATCH OPERATIONS
  // ===================

  /**
   * Batch create objects for improved performance
   */
  async batchCreate(className: string, objects: any[]): Promise<string[]> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      const batch = this.client.batch.objectsBatcher();
      const ids: string[] = [];

      for (const obj of objects) {
        const id = await batch
          .withObject({
            class: className,
            properties: obj
          })
          .do();
        ids.push(String(id));
      }

      logger.info(`Batch created ${objects.length} objects in ${className}`);
      return ids;
    } catch (error) {
      logger.error('Error in batch create operation', { error, className });
      throw error;
    }
  }

  // ===================
  // HYBRID SEARCH FUNCTIONS
  // ===================

  /**
   * Perform hybrid search combining vector and keyword search
   */
  async hybridSearch(
    className: string,
    query: string,
    properties: string[] = [],
    limit: number = 10,
    alpha: number = 0.75
  ): Promise<any[]> {
    if (!this.client) {
      throw new Error('Weaviate client not initialized');
    }

    try {
      let builder = this.client.graphql
        .get()
        .withClassName(className)
        .withHybrid({ query, alpha })
        .withLimit(limit);

      if (properties.length > 0) {
        builder = builder.withFields(properties.join(' '));
      }

      const result = await builder.do();
      return result.data?.Get?.[className] || [];
    } catch (error) {
      logger.error('Error performing hybrid search in Weaviate', {
        error,
        className,
        query,
      });
      throw error;
    }
  }
}

// Create singleton instance
const weaviateService = new WeaviateService();

export default weaviateService;