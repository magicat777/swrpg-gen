const { v4: uuidv4 } = require('uuid');
const { createApiError } = require('../middlewares/errorHandler');
const databaseService = require('../services/databaseService');
const logger = require('../utils/logger');

/**
 * Get characters matching query parameters
 */
const getCharacters = async (req, res, next) => {
  try {
    const {
      name,
      species,
      faction,
      location,
      isPlayerCharacter,
      isCanon,
      limit = 10
    } = req.query;
    
    let query = 'MATCH (c:Character)';
    const params = {};
    
    // Add filters
    const filters = [];
    if (name) {
      filters.push('c.name =~ $namePattern');
      params.namePattern = `(?i).*${name}.*`;
    }
    if (species) {
      filters.push('c.species = $species');
      params.species = species;
    }
    if (isPlayerCharacter !== undefined) {
      filters.push('c.isPlayerCharacter = $isPlayerCharacter');
      params.isPlayerCharacter = isPlayerCharacter === 'true';
    }
    if (isCanon !== undefined) {
      filters.push('c.isCanon = $isCanon');
      params.isCanon = isCanon === 'true';
    }
    
    // Add relationship filters
    if (faction) {
      query += ' MATCH (c)-[:BELONGS_TO]->(f:Faction)';
      filters.push('f.name =~ $factionPattern');
      params.factionPattern = `(?i).*${faction}.*`;
    }
    if (location) {
      query += ' MATCH (c)-[:LOCATED_AT]->(l:Location)';
      filters.push('l.name =~ $locationPattern');
      params.locationPattern = `(?i).*${location}.*`;
    }
    
    // Apply filters
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    // Add return statement with limit
    query += ` RETURN c LIMIT ${parseInt(limit, 10)}`;
    
    const result = await databaseService.neo4j.runQuery(query, params);
    
    const characters = result.map(record => record.get('c').properties);
    
    res.status(200).json({
      status: 'success',
      results: characters.length,
      data: characters
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a character by ID
 */
const getCharacterById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Character ID is required'));
    }
    
    const query = `
      MATCH (c:Character {id: $id})
      OPTIONAL MATCH (c)-[r1:BELONGS_TO]->(f:Faction)
      OPTIONAL MATCH (c)-[r2:LOCATED_AT]->(l:Location)
      OPTIONAL MATCH (c)-[r3:OWNS]->(i:Item)
      OPTIONAL MATCH (c)-[r4:KNOWS]->(c2:Character)
      RETURN c,
        collect(DISTINCT {type: 'BELONGS_TO', faction: f, since: r1.since, role: r1.role, status: r1.status}) as factions,
        collect(DISTINCT {type: 'LOCATED_AT', location: l, since: r2.from}) as locations,
        collect(DISTINCT {type: 'OWNS', item: i, since: r3.since, condition: r3.condition}) as items,
        collect(DISTINCT {type: 'KNOWS', character: c2, relationship: r4.relationship, since: r4.since, trust: r4.trust}) as relationships
    `;
    
    const result = await databaseService.neo4j.runQuery(query, { id });
    
    if (result.length === 0) {
      return next(createApiError(404, 'Character not found'));
    }
    
    const record = result[0];
    const character = record.get('c').properties;
    
    // Process relationships
    const factions = record.get('factions')
      .filter(r => r.faction)
      .map(r => ({
        ...r.faction.properties,
        since: r.since,
        role: r.role,
        status: r.status
      }));
    
    const locations = record.get('locations')
      .filter(r => r.location)
      .map(r => ({
        ...r.location.properties,
        since: r.since
      }));
    
    const items = record.get('items')
      .filter(r => r.item)
      .map(r => ({
        ...r.item.properties,
        since: r.since,
        condition: r.condition
      }));
    
    const relationships = record.get('relationships')
      .filter(r => r.character)
      .map(r => ({
        character: r.character.properties,
        relationship: r.relationship,
        since: r.since,
        trust: r.trust
      }));
    
    res.status(200).json({
      status: 'success',
      data: {
        ...character,
        factions,
        locations,
        items,
        relationships
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new character
 */
const createCharacter = async (req, res, next) => {
  try {
    const {
      name,
      species,
      gender,
      birthYear,
      homeworld,
      occupation,
      forceUser = false,
      alignment = 'Neutral',
      personality = [],
      biography = '',
      isPlayerCharacter = false,
      isCanon = false,
      faction = null
    } = req.body;
    
    if (!name || !species) {
      return next(createApiError(400, 'Name and species are required'));
    }
    
    const characterId = uuidv4();
    
    // Create character node
    const query = `
      CREATE (c:Character {
        id: $id,
        name: $name,
        species: $species,
        gender: $gender,
        birthYear: $birthYear,
        homeworld: $homeworld,
        occupation: $occupation,
        forceUser: $forceUser,
        alignment: $alignment,
        personality: $personality,
        biography: $biography,
        isPlayerCharacter: $isPlayerCharacter,
        isCanon: $isCanon
      })
      RETURN c
    `;
    
    const result = await databaseService.neo4j.runQuery(query, {
      id: characterId,
      name,
      species,
      gender: gender || '',
      birthYear: birthYear || '',
      homeworld: homeworld || '',
      occupation: occupation || '',
      forceUser,
      alignment,
      personality,
      biography,
      isPlayerCharacter,
      isCanon
    });
    
    const character = result[0].get('c').properties;
    
    // Add faction relationship if provided
    if (faction) {
      const factionQuery = `
        MATCH (c:Character {id: $characterId})
        MERGE (f:Faction {name: $factionName})
        ON CREATE SET f.id = $factionId
        CREATE (c)-[:BELONGS_TO {role: $role, since: $since, status: $status}]->(f)
        RETURN f
      `;
      
      const factionResult = await databaseService.neo4j.runQuery(factionQuery, {
        characterId,
        factionName: faction.name,
        factionId: faction.id || uuidv4(),
        role: faction.role || 'Member',
        since: faction.since || 'Unknown',
        status: faction.status || 'Active'
      });
      
      if (factionResult.length > 0) {
        character.faction = factionResult[0].get('f').properties;
      }
    }
    
    res.status(201).json({
      status: 'success',
      data: character
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update a character
 */
const updateCharacter = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Character ID is required'));
    }
    
    const {
      name,
      species,
      gender,
      birthYear,
      homeworld,
      occupation,
      forceUser,
      alignment,
      personality,
      biography,
      isPlayerCharacter,
      isCanon
    } = req.body;
    
    // Build update query
    let setClause = '';
    const params = { id };
    
    if (name !== undefined) {
      setClause += 'c.name = $name, ';
      params.name = name;
    }
    if (species !== undefined) {
      setClause += 'c.species = $species, ';
      params.species = species;
    }
    if (gender !== undefined) {
      setClause += 'c.gender = $gender, ';
      params.gender = gender;
    }
    if (birthYear !== undefined) {
      setClause += 'c.birthYear = $birthYear, ';
      params.birthYear = birthYear;
    }
    if (homeworld !== undefined) {
      setClause += 'c.homeworld = $homeworld, ';
      params.homeworld = homeworld;
    }
    if (occupation !== undefined) {
      setClause += 'c.occupation = $occupation, ';
      params.occupation = occupation;
    }
    if (forceUser !== undefined) {
      setClause += 'c.forceUser = $forceUser, ';
      params.forceUser = forceUser;
    }
    if (alignment !== undefined) {
      setClause += 'c.alignment = $alignment, ';
      params.alignment = alignment;
    }
    if (personality !== undefined) {
      setClause += 'c.personality = $personality, ';
      params.personality = personality;
    }
    if (biography !== undefined) {
      setClause += 'c.biography = $biography, ';
      params.biography = biography;
    }
    if (isPlayerCharacter !== undefined) {
      setClause += 'c.isPlayerCharacter = $isPlayerCharacter, ';
      params.isPlayerCharacter = isPlayerCharacter;
    }
    if (isCanon !== undefined) {
      setClause += 'c.isCanon = $isCanon, ';
      params.isCanon = isCanon;
    }
    
    // Remove trailing comma and space
    if (setClause) {
      setClause = setClause.slice(0, -2);
      
      const query = `
        MATCH (c:Character {id: $id})
        SET ${setClause}
        RETURN c
      `;
      
      const result = await databaseService.neo4j.runQuery(query, params);
      
      if (result.length === 0) {
        return next(createApiError(404, 'Character not found'));
      }
      
      const character = result[0].get('c').properties;
      
      res.status(200).json({
        status: 'success',
        data: character
      });
    } else {
      return next(createApiError(400, 'No properties provided for update'));
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get locations matching query parameters
 */
const getLocations = async (req, res, next) => {
  try {
    const {
      name,
      type,
      region,
      sector,
      climate,
      terrain,
      controlledBy,
      isCanon,
      limit = 10
    } = req.query;
    
    let query = 'MATCH (l:Location)';
    const params = {};
    
    // Add filters
    const filters = [];
    if (name) {
      filters.push('l.name =~ $namePattern');
      params.namePattern = `(?i).*${name}.*`;
    }
    if (type) {
      filters.push('l.type = $type');
      params.type = type;
    }
    if (region) {
      filters.push('l.region =~ $regionPattern');
      params.regionPattern = `(?i).*${region}.*`;
    }
    if (sector) {
      filters.push('l.sector =~ $sectorPattern');
      params.sectorPattern = `(?i).*${sector}.*`;
    }
    if (climate) {
      filters.push('ANY(c IN l.climate WHERE c =~ $climatePattern)');
      params.climatePattern = `(?i).*${climate}.*`;
    }
    if (terrain) {
      filters.push('ANY(t IN l.terrain WHERE t =~ $terrainPattern)');
      params.terrainPattern = `(?i).*${terrain}.*`;
    }
    if (isCanon !== undefined) {
      filters.push('l.isCanon = $isCanon');
      params.isCanon = isCanon === 'true';
    }
    
    // Add relationship filters
    if (controlledBy) {
      query += ' MATCH (f:Faction)-[:CONTROLS]->(l)';
      filters.push('f.name =~ $factionPattern');
      params.factionPattern = `(?i).*${controlledBy}.*`;
    }
    
    // Apply filters
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    // Add return statement with limit
    query += ` RETURN l LIMIT ${parseInt(limit, 10)}`;
    
    const result = await databaseService.neo4j.runQuery(query, params);
    
    const locations = result.map(record => record.get('l').properties);
    
    res.status(200).json({
      status: 'success',
      results: locations.length,
      data: locations
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a location by ID
 */
const getLocationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Location ID is required'));
    }
    
    const query = `
      MATCH (l:Location {id: $id})
      OPTIONAL MATCH (f:Faction)-[r1:CONTROLS]->(l)
      OPTIONAL MATCH (c:Character)-[r2:LOCATED_AT]->(l)
      RETURN l,
        collect(DISTINCT {faction: f, since: r1.since, strength: r1.strength}) as controllers,
        collect(DISTINCT {character: c, since: r2.from, reason: r2.reason}) as characters
    `;
    
    const result = await databaseService.neo4j.runQuery(query, { id });
    
    if (result.length === 0) {
      return next(createApiError(404, 'Location not found'));
    }
    
    const record = result[0];
    const location = record.get('l').properties;
    
    // Process relationships
    const controllers = record.get('controllers')
      .filter(r => r.faction)
      .map(r => ({
        ...r.faction.properties,
        since: r.since,
        strength: r.strength
      }));
    
    const characters = record.get('characters')
      .filter(r => r.character)
      .map(r => ({
        ...r.character.properties,
        since: r.since,
        reason: r.reason
      }));
    
    res.status(200).json({
      status: 'success',
      data: {
        ...location,
        controllers,
        characters
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new location
 */
const createLocation = async (req, res, next) => {
  try {
    const {
      name,
      type,
      sector,
      region,
      climate = [],
      terrain = [],
      population,
      government,
      description = '',
      isCanon = false,
      controlledBy = null
    } = req.body;
    
    if (!name || !type) {
      return next(createApiError(400, 'Name and type are required'));
    }
    
    const locationId = uuidv4();
    
    // Create location node
    const query = `
      CREATE (l:Location {
        id: $id,
        name: $name,
        type: $type,
        sector: $sector,
        region: $region,
        climate: $climate,
        terrain: $terrain,
        population: $population,
        government: $government,
        description: $description,
        isCanon: $isCanon
      })
      RETURN l
    `;
    
    const result = await databaseService.neo4j.runQuery(query, {
      id: locationId,
      name,
      type,
      sector: sector || '',
      region: region || '',
      climate: Array.isArray(climate) ? climate : [climate],
      terrain: Array.isArray(terrain) ? terrain : [terrain],
      population: population || '',
      government: government || '',
      description,
      isCanon
    });
    
    const location = result[0].get('l').properties;
    
    // Add controlling faction relationship if provided
    if (controlledBy) {
      const factionQuery = `
        MATCH (l:Location {id: $locationId})
        MERGE (f:Faction {name: $factionName})
        ON CREATE SET f.id = $factionId
        CREATE (f)-[:CONTROLS {since: $since, strength: $strength}]->(l)
        RETURN f
      `;
      
      const factionResult = await databaseService.neo4j.runQuery(factionQuery, {
        locationId,
        factionName: controlledBy.name,
        factionId: controlledBy.id || uuidv4(),
        since: controlledBy.since || 'Unknown',
        strength: controlledBy.strength || 'Full Control'
      });
      
      if (factionResult.length > 0) {
        location.controlledBy = factionResult[0].get('f').properties;
      }
    }
    
    res.status(201).json({
      status: 'success',
      data: location
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get factions matching query parameters
 */
const getFactions = async (req, res, next) => {
  try {
    const {
      name,
      type,
      leader,
      headquarters,
      ideology,
      isCanon,
      limit = 10
    } = req.query;
    
    let query = 'MATCH (f:Faction)';
    const params = {};
    
    // Add filters
    const filters = [];
    if (name) {
      filters.push('f.name =~ $namePattern');
      params.namePattern = `(?i).*${name}.*`;
    }
    if (type) {
      filters.push('f.type = $type');
      params.type = type;
    }
    if (leader) {
      filters.push('f.leader =~ $leaderPattern');
      params.leaderPattern = `(?i).*${leader}.*`;
    }
    if (headquarters) {
      filters.push('f.headquarters =~ $hqPattern');
      params.hqPattern = `(?i).*${headquarters}.*`;
    }
    if (ideology) {
      filters.push('f.ideology =~ $ideologyPattern');
      params.ideologyPattern = `(?i).*${ideology}.*`;
    }
    if (isCanon !== undefined) {
      filters.push('f.isCanon = $isCanon');
      params.isCanon = isCanon === 'true';
    }
    
    // Apply filters
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    // Add return statement with limit
    query += ` RETURN f LIMIT ${parseInt(limit, 10)}`;
    
    const result = await databaseService.neo4j.runQuery(query, params);
    
    const factions = result.map(record => record.get('f').properties);
    
    res.status(200).json({
      status: 'success',
      results: factions.length,
      data: factions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a faction by ID
 */
const getFactionById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Faction ID is required'));
    }
    
    const query = `
      MATCH (f:Faction {id: $id})
      OPTIONAL MATCH (c:Character)-[r1:BELONGS_TO]->(f)
      OPTIONAL MATCH (f)-[r2:CONTROLS]->(l:Location)
      RETURN f,
        collect(DISTINCT {character: c, role: r1.role, since: r1.since, status: r1.status}) as members,
        collect(DISTINCT {location: l, since: r2.since, strength: r2.strength}) as territories
    `;
    
    const result = await databaseService.neo4j.runQuery(query, { id });
    
    if (result.length === 0) {
      return next(createApiError(404, 'Faction not found'));
    }
    
    const record = result[0];
    const faction = record.get('f').properties;
    
    // Process relationships
    const members = record.get('members')
      .filter(r => r.character)
      .map(r => ({
        ...r.character.properties,
        role: r.role,
        since: r.since,
        status: r.status
      }));
    
    const territories = record.get('territories')
      .filter(r => r.location)
      .map(r => ({
        ...r.location.properties,
        since: r.since,
        strength: r.strength
      }));
    
    res.status(200).json({
      status: 'success',
      data: {
        ...faction,
        members,
        territories
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get items matching query parameters
 */
const getItems = async (req, res, next) => {
  try {
    const {
      name,
      type,
      manufacturer,
      owner,
      rarity,
      isCanon,
      limit = 10
    } = req.query;
    
    let query = 'MATCH (i:Item)';
    const params = {};
    
    // Add filters
    const filters = [];
    if (name) {
      filters.push('i.name =~ $namePattern');
      params.namePattern = `(?i).*${name}.*`;
    }
    if (type) {
      filters.push('i.type = $type');
      params.type = type;
    }
    if (manufacturer) {
      filters.push('i.manufacturer =~ $manufacturerPattern');
      params.manufacturerPattern = `(?i).*${manufacturer}.*`;
    }
    if (rarity) {
      filters.push('i.rarity = $rarity');
      params.rarity = rarity;
    }
    if (isCanon !== undefined) {
      filters.push('i.isCanon = $isCanon');
      params.isCanon = isCanon === 'true';
    }
    
    // Add relationship filters
    if (owner) {
      query += ' MATCH (o)-[:OWNS]->(i)';
      filters.push('(o:Character OR o:Faction) AND o.name =~ $ownerPattern');
      params.ownerPattern = `(?i).*${owner}.*`;
    }
    
    // Apply filters
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    // Add return statement with limit
    query += ` RETURN i LIMIT ${parseInt(limit, 10)}`;
    
    const result = await databaseService.neo4j.runQuery(query, params);
    
    const items = result.map(record => record.get('i').properties);
    
    res.status(200).json({
      status: 'success',
      results: items.length,
      data: items
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get an item by ID
 */
const getItemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Item ID is required'));
    }
    
    const query = `
      MATCH (i:Item {id: $id})
      OPTIONAL MATCH (o)-[r:OWNS]->(i)
      RETURN i,
        collect(DISTINCT {owner: o, since: r.since, condition: r.condition}) as owners
    `;
    
    const result = await databaseService.neo4j.runQuery(query, { id });
    
    if (result.length === 0) {
      return next(createApiError(404, 'Item not found'));
    }
    
    const record = result[0];
    const item = record.get('i').properties;
    
    // Process relationships
    const owners = record.get('owners')
      .filter(r => r.owner)
      .map(r => ({
        ...r.owner.properties,
        type: r.owner.labels[0],
        since: r.since,
        condition: r.condition
      }));
    
    res.status(200).json({
      status: 'success',
      data: {
        ...item,
        owners
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get events matching query parameters
 */
const getEvents = async (req, res, next) => {
  try {
    const {
      name,
      type,
      location,
      participant,
      significance,
      isCanon,
      limit = 10
    } = req.query;
    
    let query = 'MATCH (e:Event)';
    const params = {};
    
    // Add filters
    const filters = [];
    if (name) {
      filters.push('e.name =~ $namePattern');
      params.namePattern = `(?i).*${name}.*`;
    }
    if (type) {
      filters.push('e.type = $type');
      params.type = type;
    }
    if (location) {
      query += ' MATCH (e)-[:OCCURRED_AT]->(l:Location)';
      filters.push('l.name =~ $locationPattern');
      params.locationPattern = `(?i).*${location}.*`;
    }
    if (participant) {
      query += ' MATCH (p)-[:PARTICIPATED_IN]->(e)';
      filters.push('(p:Character OR p:Faction) AND p.name =~ $participantPattern');
      params.participantPattern = `(?i).*${participant}.*`;
    }
    if (significance) {
      filters.push('e.significance >= $significance');
      params.significance = parseInt(significance, 10);
    }
    if (isCanon !== undefined) {
      filters.push('e.isCanon = $isCanon');
      params.isCanon = isCanon === 'true';
    }
    
    // Apply filters
    if (filters.length > 0) {
      query += ' WHERE ' + filters.join(' AND ');
    }
    
    // Add return statement with limit
    query += ` RETURN e LIMIT ${parseInt(limit, 10)}`;
    
    const result = await databaseService.neo4j.runQuery(query, params);
    
    const events = result.map(record => record.get('e').properties);
    
    res.status(200).json({
      status: 'success',
      results: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get an event by ID
 */
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return next(createApiError(400, 'Event ID is required'));
    }
    
    const query = `
      MATCH (e:Event {id: $id})
      OPTIONAL MATCH (e)-[:OCCURRED_AT]->(l:Location)
      OPTIONAL MATCH (p)-[r:PARTICIPATED_IN]->(e)
      RETURN e, l,
        collect(DISTINCT {participant: p, role: r.role, outcome: r.outcome}) as participants
    `;
    
    const result = await databaseService.neo4j.runQuery(query, { id });
    
    if (result.length === 0) {
      return next(createApiError(404, 'Event not found'));
    }
    
    const record = result[0];
    const event = record.get('e').properties;
    const location = record.get('l')?.properties;
    
    // Process participants
    const participants = record.get('participants')
      .filter(r => r.participant)
      .map(r => ({
        ...r.participant.properties,
        type: r.participant.labels[0],
        role: r.role,
        outcome: r.outcome
      }));
    
    res.status(200).json({
      status: 'success',
      data: {
        ...event,
        location,
        participants
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search world knowledge
 */
const searchWorldKnowledge = async (req, res, next) => {
  try {
    const {
      query,
      category,
      era,
      tags,
      limit = 10
    } = req.query;
    
    if (!query) {
      return next(createApiError(400, 'Search query is required'));
    }
    
    // Prepare Weaviate query
    const weaviateClient = databaseService.weaviate.getClient();
    
    const weaviateQuery = weaviateClient.graphql
      .get()
      .withClassName('WorldKnowledge')
      .withFields('title content category era source canonicity tags importance _additional { certainty }')
      .withNearText({
        concepts: [query],
        certainty: 0.7
      })
      .withLimit(parseInt(limit, 10));
    
    // Add filters if specified
    if (category || era || tags) {
      const whereFilter = {
        operator: 'And',
        operands: []
      };
      
      if (category) {
        whereFilter.operands.push({
          operator: 'Equal',
          path: ['category'],
          valueString: category
        });
      }
      
      if (era) {
        whereFilter.operands.push({
          operator: 'Equal',
          path: ['era'],
          valueString: era
        });
      }
      
      if (tags) {
        const tagList = tags.split(',');
        whereFilter.operands.push({
          operator: 'ContainsAny',
          path: ['tags'],
          valueStringArray: tagList
        });
      }
      
      weaviateQuery.withWhere(whereFilter);
    }
    
    const result = await weaviateQuery.do();
    
    res.status(200).json({
      status: 'success',
      results: result.data.Get.WorldKnowledge?.length || 0,
      data: result.data.Get.WorldKnowledge || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add new world knowledge
 */
const addWorldKnowledge = async (req, res, next) => {
  try {
    const {
      title,
      content,
      category,
      era = 'All Eras',
      source = 'User Contributed',
      canonicity = 'homebrew',
      relatedEntities = [],
      tags = [],
      importance = 5
    } = req.body;
    
    if (!title || !content || !category) {
      return next(createApiError(400, 'Title, content, and category are required'));
    }
    
    const weaviateClient = databaseService.weaviate.getClient();
    
    // Create knowledge entry
    const result = await weaviateClient.data
      .creator()
      .withClassName('WorldKnowledge')
      .withProperties({
        title,
        content,
        category,
        era,
        source,
        canonicity,
        relatedEntities,
        tags,
        importance
      })
      .do();
    
    // Get the created object
    const knowledgeId = result?.id;
    let createdKnowledge = null;
    
    if (knowledgeId) {
      const getResult = await weaviateClient.data
        .getterById()
        .withClassName('WorldKnowledge')
        .withId(knowledgeId)
        .do();
      
      createdKnowledge = getResult?.properties;
      createdKnowledge.id = knowledgeId;
    }
    
    res.status(201).json({
      status: 'success',
      data: createdKnowledge
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Find relationships between entities
 */
const findRelationships = async (req, res, next) => {
  try {
    const { source, target, maxDepth = 3 } = req.query;
    
    if (!source || !target) {
      return next(createApiError(400, 'Source and target IDs are required'));
    }
    
    // Find shortest path between entities
    const query = `
      MATCH path = shortestPath(
        (source)-[*1..${parseInt(maxDepth, 10)}]-(target)
      )
      WHERE source.id = $sourceId AND target.id = $targetId
      RETURN path, length(path) as pathLength
      ORDER BY pathLength ASC
      LIMIT 1
    `;
    
    const result = await databaseService.neo4j.runQuery(query, {
      sourceId: source,
      targetId: target
    });
    
    if (result.length === 0) {
      return res.status(200).json({
        status: 'success',
        data: {
          connected: false,
          message: `No path found between entities within ${maxDepth} steps`,
          path: []
        }
      });
    }
    
    const record = result[0];
    const path = record.get('path');
    const pathLength = record.get('pathLength');
    
    // Extract path segments
    const segments = [];
    const nodes = path.segments.map(segment => segment.start);
    nodes.push(path.end); // Add the last node
    
    // Extract relationships
    const relationships = path.segments.map(segment => ({
      type: segment.relationship.type,
      properties: segment.relationship.properties
    }));
    
    // Combine into path segments
    for (let i = 0; i < nodes.length - 1; i++) {
      segments.push({
        source: {
          id: nodes[i].properties.id,
          label: nodes[i].labels[0],
          name: nodes[i].properties.name
        },
        relationship: relationships[i],
        target: {
          id: nodes[i + 1].properties.id,
          label: nodes[i + 1].labels[0],
          name: nodes[i + 1].properties.name
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        connected: true,
        pathLength,
        segments
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  getLocations,
  getLocationById,
  createLocation,
  getFactions,
  getFactionById,
  getItems,
  getItemById,
  getEvents,
  getEventById,
  searchWorldKnowledge,
  addWorldKnowledge,
  findRelationships
};