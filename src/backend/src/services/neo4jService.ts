import neo4j, { Driver, Session, Record, QueryResult } from 'neo4j-driver';
import { Record as Neo4jRecord } from 'neo4j-driver';
import { logger } from '../utils/logger';

/**
 * Manages connections and operations for the Neo4j graph database
 */
class Neo4jService {
  private driver: Driver | null = null;
  private readonly uri: string;
  private readonly user: string;
  private readonly password: string;
  private readonly database: string;
  private readonly maxConnectionPoolSize: number;
  private readonly connectionAcquisitionTimeout: number;
  private isConnected: boolean = false;

  constructor() {
    this.uri = process.env.NEO4J_URI || 'bolt://neo4j:7687';
    this.user = process.env.NEO4J_USER || 'neo4j';
    this.password = process.env.NEO4J_PASSWORD || 'password';
    this.database = process.env.NEO4J_DATABASE || 'neo4j';
    this.maxConnectionPoolSize = Number(process.env.NEO4J_MAX_CONNECTION_POOL_SIZE || '50');
    this.connectionAcquisitionTimeout = Number(process.env.NEO4J_CONNECTION_ACQUISITION_TIMEOUT || '5000');
  }

  /**
   * Initialize the Neo4j driver and test connection
   */
  async initialize(): Promise<void> {
    try {
      this.driver = neo4j.driver(
        this.uri,
        neo4j.auth.basic(this.user, this.password),
        {
          maxConnectionPoolSize: this.maxConnectionPoolSize,
          connectionAcquisitionTimeout: this.connectionAcquisitionTimeout,
        }
      );

      // Test the connection
      await this.verifyConnectivity();
      this.isConnected = true;
      logger.info('Successfully connected to Neo4j database');
    } catch (error) {
      logger.error('Failed to connect to Neo4j database', { error });
      throw error;
    }
  }

  /**
   * Test database connectivity
   */
  async verifyConnectivity(): Promise<void> {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized');
    }

    try {
      await this.driver.verifyConnectivity();
    } catch (error) {
      logger.error('Neo4j connectivity verification failed', { error });
      throw error;
    }
  }

  /**
   * Get a new session with the Neo4j database
   */
  getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized');
    }
    return this.driver.session({ database: this.database });
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    if (this.driver) {
      try {
        await this.driver.close();
        this.isConnected = false;
        logger.info('Neo4j driver closed');
      } catch (error) {
        logger.error('Error closing Neo4j driver', { error });
        throw error;
      }
    }
  }

  /**
   * Execute a read transaction with the provided Cypher query and parameters
   */
  async read<T>(
    cypher: string,
    params: any = {},
    transformer?: (records: Neo4jRecord[]) => T
  ): Promise<T> {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized');
    }

    const session = this.getSession();
    try {
      const result = await session.executeRead((tx) => tx.run(cypher, params));
      return transformer ? transformer(result.records) : result.records as unknown as T;
    } catch (error) {
      logger.error('Error executing Neo4j read transaction', {
        error,
        query: cypher,
        params,
      });
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Execute a write transaction with the provided Cypher query and parameters
   */
  async write<T>(
    cypher: string,
    params: any = {},
    transformer?: (result: QueryResult) => T
  ): Promise<T> {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized');
    }

    const session = this.getSession();
    try {
      const result = await session.executeWrite((tx) => tx.run(cypher, params));
      return transformer ? transformer(result) : result as unknown as T;
    } catch (error) {
      logger.error('Error executing Neo4j write transaction', {
        error,
        query: cypher,
        params,
      });
      throw error;
    } finally {
      await session.close();
    }
  }

  /**
   * Check if the connection is established
   */
  isInitialized(): boolean {
    return this.isConnected;
  }

  /**
   * Initialize database schema with constraints and indices
   */
  async initializeSchema(): Promise<void> {
    const session = this.getSession();
    try {
      // Create constraints
      const constraints = [
        'CREATE CONSTRAINT character_name_unique IF NOT EXISTS FOR (c:Character) REQUIRE c.name IS UNIQUE',
        'CREATE CONSTRAINT location_name_unique IF NOT EXISTS FOR (l:Location) REQUIRE l.name IS UNIQUE',
        'CREATE CONSTRAINT faction_name_unique IF NOT EXISTS FOR (f:Faction) REQUIRE f.name IS UNIQUE',
        'CREATE CONSTRAINT item_id_unique IF NOT EXISTS FOR (i:Item) REQUIRE i.id IS UNIQUE',
        'CREATE CONSTRAINT event_id_unique IF NOT EXISTS FOR (e:Event) REQUIRE e.id IS UNIQUE',
      ];

      // Create indices for better performance
      const indices = [
        'CREATE INDEX character_type_index IF NOT EXISTS FOR (c:Character) ON (c.type)',
        'CREATE INDEX location_type_index IF NOT EXISTS FOR (l:Location) ON (l.type)',
        'CREATE INDEX faction_allegiance_index IF NOT EXISTS FOR (f:Faction) ON (f.allegiance)',
        'CREATE INDEX event_timestamp_index IF NOT EXISTS FOR (e:Event) ON (e.timestamp)',
        'CREATE INDEX item_type_index IF NOT EXISTS FOR (i:Item) ON (i.type)',
      ];

      // Execute constraints
      for (const constraint of constraints) {
        try {
          await session.run(constraint);
        } catch (error) {
          logger.warn(`Constraint creation failed (may already exist): ${constraint}`, { error });
        }
      }

      // Execute indices
      for (const index of indices) {
        try {
          await session.run(index);
        } catch (error) {
          logger.warn(`Index creation failed (may already exist): ${index}`, { error });
        }
      }

      logger.info('Neo4j schema initialization completed');
    } catch (error) {
      logger.error('Error initializing Neo4j schema', { error });
      throw error;
    } finally {
      await session.close();
    }
  }

  // ===================
  // CHARACTER MANAGEMENT
  // ===================

  /**
   * Create a new character in the database
   */
  async createCharacter(character: any): Promise<any> {
    const cypher = `
      CREATE (c:Character {
        name: $name,
        species: $species,
        gender: $gender,
        occupation: $occupation,
        affiliation: $affiliation,
        forceUser: $forceUser,
        alignment: $alignment,
        personality: $personality,
        background: $background,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN c
    `;

    const result = await this.write(cypher, character);
    return (result as any).records && (result as any).records.length > 0 ? Neo4jService.toObject((result as any).records[0]) : null;
  }

  /**
   * Find characters by various criteria
   */
  async findCharacters(filters: any = {}): Promise<any[]> {
    let cypher = 'MATCH (c:Character)';
    const params: any = {};
    const conditions: string[] = [];

    if (filters.name) {
      conditions.push('c.name = $name');
      params.name = filters.name;
    }
    if (filters.species) {
      conditions.push('c.species = $species');
      params.species = filters.species;
    }
    if (filters.affiliation) {
      conditions.push('c.affiliation = $affiliation');
      params.affiliation = filters.affiliation;
    }
    if (filters.forceUser !== undefined) {
      conditions.push('c.forceUser = $forceUser');
      params.forceUser = filters.forceUser;
    }

    if (conditions.length > 0) {
      cypher += ' WHERE ' + conditions.join(' AND ');
    }

    cypher += ' RETURN c ORDER BY c.name';

    const records = await this.read<Neo4jRecord[]>(cypher, params);
    return Neo4jService.toObjects(records);
  }

  /**
   * Update character properties
   */
  async updateCharacter(name: string, updates: any): Promise<any> {
    const setClause = Object.keys(updates)
      .map(key => `c.${key} = $${key}`)
      .join(', ');

    const cypher = `
      MATCH (c:Character {name: $name})
      SET ${setClause}, c.updatedAt = datetime()
      RETURN c
    `;

    const params = { name, ...updates };
    const result = await this.write(cypher, params);
    return (result as any).records && (result as any).records.length > 0 ? Neo4jService.toObject((result as any).records[0]) : null;
  }

  /**
   * Create relationship between characters
   */
  async createCharacterRelationship(fromName: string, toName: string, relationship: string, properties: any = {}): Promise<void> {
    const cypher = `
      MATCH (a:Character {name: $fromName}), (b:Character {name: $toName})
      CREATE (a)-[r:${relationship} $properties]->(b)
      RETURN r
    `;

    await this.write(cypher, { fromName, toName, properties });
  }

  // ===================
  // LOCATION MANAGEMENT
  // ===================

  /**
   * Create a new location in the database
   */
  async createLocation(location: any): Promise<any> {
    const cypher = `
      CREATE (l:Location {
        name: $name,
        type: $type,
        planet: $planet,
        region: $region,
        description: $description,
        atmosphere: $atmosphere,
        population: $population,
        government: $government,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN l
    `;

    const result = await this.write(cypher, location);
    return (result as any).records && (result as any).records.length > 0 ? Neo4jService.toObject((result as any).records[0]) : null;
  }

  /**
   * Find locations by various criteria
   */
  async findLocations(filters: any = {}): Promise<any[]> {
    let cypher = 'MATCH (l:Location)';
    const params: any = {};
    const conditions: string[] = [];

    if (filters.name) {
      conditions.push('l.name = $name');
      params.name = filters.name;
    }
    if (filters.planet) {
      conditions.push('l.planet = $planet');
      params.planet = filters.planet;
    }
    if (filters.type) {
      conditions.push('l.type = $type');
      params.type = filters.type;
    }

    if (conditions.length > 0) {
      cypher += ' WHERE ' + conditions.join(' AND ');
    }

    cypher += ' RETURN l ORDER BY l.name';

    const records = await this.read<Neo4jRecord[]>(cypher, params);
    return Neo4jService.toObjects(records);
  }

  /**
   * Create relationship between locations (e.g., contains, connects to)
   */
  async createLocationRelationship(fromName: string, toName: string, relationship: string, properties: any = {}): Promise<void> {
    const cypher = `
      MATCH (a:Location {name: $fromName}), (b:Location {name: $toName})
      CREATE (a)-[r:${relationship} $properties]->(b)
      RETURN r
    `;

    await this.write(cypher, { fromName, toName, properties });
  }

  // ===================
  // FACTION MANAGEMENT
  // ===================

  /**
   * Create a new faction in the database
   */
  async createFaction(faction: any): Promise<any> {
    const cypher = `
      CREATE (f:Faction {
        name: $name,
        allegiance: $allegiance,
        type: $type,
        description: $description,
        goals: $goals,
        resources: $resources,
        territory: $territory,
        leaderName: $leaderName,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN f
    `;

    const result = await this.write(cypher, faction);
    return (result as any).records && (result as any).records.length > 0 ? Neo4jService.toObject((result as any).records[0]) : null;
  }

  /**
   * Find factions by various criteria
   */
  async findFactions(filters: any = {}): Promise<any[]> {
    let cypher = 'MATCH (f:Faction)';
    const params: any = {};
    const conditions: string[] = [];

    if (filters.name) {
      conditions.push('f.name = $name');
      params.name = filters.name;
    }
    if (filters.allegiance) {
      conditions.push('f.allegiance = $allegiance');
      params.allegiance = filters.allegiance;
    }
    if (filters.type) {
      conditions.push('f.type = $type');
      params.type = filters.type;
    }

    if (conditions.length > 0) {
      cypher += ' WHERE ' + conditions.join(' AND ');
    }

    cypher += ' RETURN f ORDER BY f.name';

    const records = await this.read<Neo4jRecord[]>(cypher, params);
    return Neo4jService.toObjects(records);
  }

  /**
   * Create relationship between character and faction
   */
  async createCharacterFactionRelationship(characterName: string, factionName: string, role: string, properties: any = {}): Promise<void> {
    const cypher = `
      MATCH (c:Character {name: $characterName}), (f:Faction {name: $factionName})
      CREATE (c)-[r:MEMBER_OF {role: $role} $properties]->(f)
      RETURN r
    `;

    await this.write(cypher, { characterName, factionName, role, properties });
  }

  // ===================
  // EVENT MANAGEMENT
  // ===================

  /**
   * Create a new event in the database
   */
  async createEvent(event: any): Promise<any> {
    const cypher = `
      CREATE (e:Event {
        id: $id,
        title: $title,
        description: $description,
        type: $type,
        timestamp: datetime($timestamp),
        significance: $significance,
        location: $location,
        participants: $participants,
        consequences: $consequences,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN e
    `;

    const result = await this.write(cypher, event);
    return (result as any).records && (result as any).records.length > 0 ? Neo4jService.toObject((result as any).records[0]) : null;
  }

  /**
   * Find events by timeline and other criteria
   */
  async findEvents(filters: any = {}): Promise<any[]> {
    let cypher = 'MATCH (e:Event)';
    const params: any = {};
    const conditions: string[] = [];

    if (filters.type) {
      conditions.push('e.type = $type');
      params.type = filters.type;
    }
    if (filters.location) {
      conditions.push('e.location = $location');
      params.location = filters.location;
    }
    if (filters.fromDate) {
      conditions.push('e.timestamp >= datetime($fromDate)');
      params.fromDate = filters.fromDate;
    }
    if (filters.toDate) {
      conditions.push('e.timestamp <= datetime($toDate)');
      params.toDate = filters.toDate;
    }

    if (conditions.length > 0) {
      cypher += ' WHERE ' + conditions.join(' AND ');
    }

    cypher += ' RETURN e ORDER BY e.timestamp DESC';

    const records = await this.read<Neo4jRecord[]>(cypher, params);
    return Neo4jService.toObjects(records);
  }

  /**
   * Create relationship between event and character
   */
  async createEventCharacterRelationship(eventId: string, characterName: string, involvement: string, properties: any = {}): Promise<void> {
    const cypher = `
      MATCH (e:Event {id: $eventId}), (c:Character {name: $characterName})
      CREATE (e)-[r:INVOLVES {type: $involvement} $properties]->(c)
      RETURN r
    `;

    const params: any = { eventId, characterName, involvement, properties };
    await this.write(cypher, params);
  }

  // ===================
  // WORLD STATE QUERIES
  // ===================

  /**
   * Get current faction relationships and power dynamics
   */
  async getFactionRelationships(): Promise<any[]> {
    const cypher = `
      MATCH (f1:Faction)-[r]-(f2:Faction)
      RETURN f1.name as faction1, type(r) as relationship, f2.name as faction2, r as properties
    `;

    const records = await this.read<Neo4jRecord[]>(cypher);
    return Neo4jService.toObjects(records);
  }

  /**
   * Get character network and relationships
   */
  async getCharacterNetwork(characterName?: string): Promise<any[]> {
    let cypher: string;
    let params: any = {};

    if (characterName) {
      cypher = `
        MATCH (c1:Character {name: $characterName})-[r]-(c2:Character)
        RETURN c1.name as character1, type(r) as relationship, c2.name as character2, r as properties
      `;
      params.characterName = characterName;
    } else {
      cypher = `
        MATCH (c1:Character)-[r]-(c2:Character)
        RETURN c1.name as character1, type(r) as relationship, c2.name as character2, r as properties
        LIMIT 100
      `;
    }

    const records = await this.read<Neo4jRecord[]>(cypher, params);
    return Neo4jService.toObjects(records);
  }

  /**
   * Get timeline of events affecting a character
   */
  async getCharacterTimeline(characterName: string): Promise<any[]> {
    const cypher = `
      MATCH (c:Character {name: $characterName})<-[:INVOLVES]-(e:Event)
      RETURN e
      ORDER BY e.timestamp DESC
    `;

    const params: any = { characterName };
    const records = await this.read<Neo4jRecord[]>(cypher, params);
    return Neo4jService.toObjects(records);
  }

  /**
   * Convert Neo4j result to JSON objects
   */
  static toObject(record: Neo4jRecord): any {
    const result: any = {};
    for (const key of record.keys) {
      const value = record.get(key);
      result[key] = Neo4jService.parseNeo4jValue(value);
    }
    return result;
  }

  /**
   * Convert an array of Neo4j records to JSON objects
   */
  static toObjects(records: Neo4jRecord[]): any[] {
    return records.map((record) => Neo4jService.toObject(record));
  }

  /**
   * Parse Neo4j values and convert to standard JS types
   */
  private static parseNeo4jValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    // Handle Neo4j integer
    if (neo4j.isInt(value)) {
      return value.toNumber();
    }

    // Handle Neo4j Date
    if (neo4j.isDate(value)) {
      return value.toString();
    }

    // Handle Neo4j DateTime
    if (neo4j.isDateTime(value)) {
      return value.toString();
    }

    // Handle Neo4j Time
    if (neo4j.isTime(value)) {
      return value.toString();
    }

    // Handle Neo4j Duration
    if (neo4j.isDuration(value)) {
      return value.toString();
    }

    // Handle Node objects
    if (value.properties && typeof value.properties === 'object') {
      const result = { ...value.properties };
      // Add the Neo4j ID if available
      if (value.identity) {
        result.id = value.identity.toString();
      }
      // Add labels if available
      if (value.labels && Array.isArray(value.labels)) {
        result.labels = value.labels;
      }
      return result;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => Neo4jService.parseNeo4jValue(item));
    }

    // Handle objects
    if (typeof value === 'object') {
      const result: any = {};
      for (const key in value) {
        result[key] = Neo4jService.parseNeo4jValue(value[key]);
      }
      return result;
    }

    return value;
  }
}

// Create singleton instance
const neo4jService = new Neo4jService();

export default neo4jService;
export { Neo4jService };