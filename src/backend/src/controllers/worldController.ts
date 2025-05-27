import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import neo4jService from '../services/neo4jService';
import mongodbService from '../services/mongodbService';

interface QueryParams {
  limit?: string;
  offset?: string;
  search?: string;
  species?: string;
  affiliation?: string;
  planet?: string;
  climate?: string;
  era?: string;
  force_sensitivity?: string;
  enhanced?: string;
}

class WorldController {
  /**
   * Get Star Wars characters from Neo4j database or enhanced MongoDB data
   */
  async getCharacters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        limit = '20',
        offset = '0',
        search,
        species,
        affiliation,
        force_sensitivity,
        enhanced
      } = req.query as QueryParams;

      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt(offset, 10);

      logger.debug('Fetching characters', {
        limit: limitNum,
        offset: offsetNum,
        search,
        species,
        affiliation,
        force_sensitivity,
        enhanced
      });

      // Check if enhanced data is requested or use MongoDB as default
      if (enhanced === 'true' || enhanced !== 'false') {
        // Build filters for MongoDB query
        const enhancedFilters: any = {};
        if (search) enhancedFilters.search = search;
        if (species) enhancedFilters.species = species;
        if (affiliation) enhancedFilters.affiliation = affiliation;
        if (force_sensitivity) enhancedFilters.force_sensitivity = force_sensitivity;

        // Get enhanced characters from MongoDB
        const characters = await mongodbService.findEnhancedCharacters(enhancedFilters, {
          limit: limitNum,
          offset: offsetNum
        });

        // Get total count for pagination
        const total = await mongodbService.getEnhancedCharacterCount(enhancedFilters);

        // Transform data to include all enhanced fields
        const enhancedCharacters = characters.map((character: any) => ({
          id: character.basic_info?.id || character.id || character.name,
          name: character.basic_info?.name || character.name,
          species: character.basic_info?.species || character.species,
          description: character.description,
          affiliation: character.basic_info?.affiliations || character.affiliation,
          homeworld: character.basic_info?.homeworld || character.homeworld,
          
          // Enhanced fields
          basic_info: character.basic_info,
          physical_description: character.physical_description,
          personality: character.personality,
          abilities: character.abilities,
          equipment: character.equipment,
          relationships: character.relationships,
          character_development: character.character_development,
          rpg_elements: character.rpg_elements,
          reputation: character.reputation,
          historical_significance: character.historical_significance,
          
          // Metadata
          wookieepedia_url: character.wookieepedia_url,
          canon_source: character.canon_source,
          enhancement_version: character.enhancement_version,
          last_updated: character.last_updated
        }));

        res.json({
          data: enhancedCharacters,
          total,
          limit: limitNum,
          offset: offsetNum,
          enhanced: true
        });
        return;
      }

      // Use the existing findCharacters method with proper filters
      const filters: any = {};
      if (search) filters.search = search;
      if (species) filters.species = species;
      if (affiliation) filters.affiliation = affiliation;

      // Get characters using existing service method
      const allCharacters = await neo4jService.findCharacters(filters);
      
      // Debug: Log the actual structure
      logger.debug('Character data structure', { 
        count: allCharacters.length, 
        firstRecord: allCharacters[0] 
      });
      
      // Apply pagination manually
      const total = allCharacters.length;
      const characters = allCharacters
        .slice(offsetNum, offsetNum + limitNum)
        .map((record: any) => {
          // The record has 'c' key containing the character node
          const character = record.c || record;
          return {
            id: character.name, // Use name as ID since no separate ID field
            name: character.name,
            species: character.species,
            description: character.background || character.description,
            affiliation: character.affiliation,
            homeworld: character.homeworld,
            occupation: character.occupation,
            forceSensitive: character.forceUser,
            abilities: character.abilities,
            equipment: character.equipment,
            personality: character.personalityTraits,
            background: character.background,
            alignment: character.alignment,
            gender: character.gender
          };
        });

      res.json({
        data: characters,
        total,
        limit: limitNum,
        offset: offsetNum
      });

    } catch (error) {
      logger.error('Error fetching characters', { error });
      next(error);
    }
  }

  /**
   * Get enhanced Star Wars characters from MongoDB
   */
  async getEnhancedCharacters(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        limit = '20',
        offset = '0',
        search,
        species,
        affiliation,
        force_sensitivity
      } = req.query as QueryParams;

      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt(offset, 10);

      logger.debug('Fetching enhanced characters', {
        limit: limitNum,
        offset: offsetNum,
        search,
        species,
        affiliation,
        force_sensitivity
      });

      // Build filters for MongoDB query
      const filters: any = {};
      if (search) filters.search = search;
      if (species) filters.species = species;
      if (affiliation) filters.affiliation = affiliation;
      if (force_sensitivity) filters.force_sensitivity = force_sensitivity;

      // Get enhanced characters from MongoDB
      const characters = await mongodbService.findEnhancedCharacters(filters, {
        limit: limitNum,
        offset: offsetNum
      });

      // Get total count for pagination
      const total = await mongodbService.getEnhancedCharacterCount(filters);

      // Transform data to include all enhanced fields
      const enhancedCharacters = characters.map((character: any) => ({
        id: character.basic_info?.id || character.id || character.name,
        name: character.basic_info?.name || character.name,
        species: character.basic_info?.species || character.species,
        description: character.description,
        affiliation: character.basic_info?.affiliations || character.affiliation,
        homeworld: character.basic_info?.homeworld || character.homeworld,
        
        // Enhanced fields
        basic_info: character.basic_info,
        physical_description: character.physical_description,
        personality: character.personality,
        abilities: character.abilities,
        equipment: character.equipment,
        relationships: character.relationships,
        character_development: character.character_development,
        rpg_elements: character.rpg_elements,
        reputation: character.reputation,
        historical_significance: character.historical_significance,
        
        // Metadata
        wookieepedia_url: character.wookieepedia_url,
        canon_source: character.canon_source,
        enhancement_version: character.enhancement_version,
        last_updated: character.last_updated
      }));

      res.json({
        data: enhancedCharacters,
        total,
        limit: limitNum,
        offset: offsetNum,
        enhanced: true
      });

    } catch (error) {
      logger.error('Error fetching enhanced characters', { error });
      next(error);
    }
  }

  /**
   * Get character by ID - supports enhanced data
   */
  async getCharacterById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { enhanced } = req.query as QueryParams;

      logger.debug('Fetching character by ID', { id, enhanced });

      // Check if enhanced data is requested
      if (enhanced === 'true') {
        const enhancedCharacter = await mongodbService.findEnhancedCharacterById(id);
        
        if (!enhancedCharacter) {
          res.status(404).json({ error: 'Enhanced character not found' });
          return;
        }

        res.json({
          id: enhancedCharacter.basic_info?.id || enhancedCharacter.id || enhancedCharacter.name,
          name: enhancedCharacter.basic_info?.name || enhancedCharacter.name,
          species: enhancedCharacter.basic_info?.species || enhancedCharacter.species,
          description: enhancedCharacter.description,
          affiliation: enhancedCharacter.basic_info?.affiliations || enhancedCharacter.affiliation,
          homeworld: enhancedCharacter.basic_info?.homeworld || enhancedCharacter.homeworld,
          
          // Enhanced fields
          basic_info: enhancedCharacter.basic_info,
          physical_description: enhancedCharacter.physical_description,
          personality: enhancedCharacter.personality,
          abilities: enhancedCharacter.abilities,
          equipment: enhancedCharacter.equipment,
          relationships: enhancedCharacter.relationships,
          character_development: enhancedCharacter.character_development,
          rpg_elements: enhancedCharacter.rpg_elements,
          reputation: enhancedCharacter.reputation,
          historical_significance: enhancedCharacter.historical_significance,
          
          // Metadata
          wookieepedia_url: enhancedCharacter.wookieepedia_url,
          canon_source: enhancedCharacter.canon_source,
          enhancement_version: enhancedCharacter.enhancement_version,
          last_updated: enhancedCharacter.last_updated,
          enhanced: true
        });
        return;
      }

      // Use existing service method to find characters by name (since name is the key)
      const characters = await neo4jService.findCharacters({ name: id });

      if (characters.length === 0) {
        res.status(404).json({ error: 'Character not found' });
        return;
      }

      const record = characters[0];
      const character = record.c || record;
      res.json({
        id: character.name,
        name: character.name,
        species: character.species,
        description: character.background || character.description,
        affiliation: character.affiliation,
        homeworld: character.homeworld,
        occupation: character.occupation,
        forceSensitive: character.forceUser,
        abilities: character.abilities,
        equipment: character.equipment,
        personality: character.personalityTraits,
        background: character.background,
        alignment: character.alignment,
        gender: character.gender
      });

    } catch (error) {
      logger.error('Error fetching character by ID', { error, id: req.params.id });
      next(error);
    }
  }

  /**
   * Get Star Wars locations from MongoDB or Neo4j database
   */
  async getLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        limit = '20',
        offset = '0',
        search,
        planet,
        climate,
        enhanced
      } = req.query as QueryParams;

      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt(offset, 10);

      logger.debug('Fetching locations', {
        limit: limitNum,
        offset: offsetNum,
        search,
        planet,
        climate,
        enhanced
      });

      // Check if enhanced data is requested or use MongoDB as default
      if (enhanced === 'true' || enhanced !== 'false') {
        // Build filters for MongoDB query
        const enhancedFilters: any = {};
        if (search) enhancedFilters.search = search;
        if (planet) enhancedFilters.region = planet; // MongoDB uses 'region' field
        if (climate) enhancedFilters.climate = climate;

        // Get enhanced locations from MongoDB
        const locations = await mongodbService.findEnhancedLocations(enhancedFilters, {
          limit: limitNum,
          offset: offsetNum
        });

        // Get total count for pagination
        const total = await mongodbService.getEnhancedLocationCount(enhancedFilters);

        // Transform data to include all enhanced fields
        const enhancedLocations = locations.map((location: any) => ({
          id: location.basic_info?.id || location.id || location.name,
          name: location.basic_info?.name || location.name,
          planet: location.basic_info?.planet || location.planet,
          region: location.basic_info?.region || location.region,
          description: location.description,
          climate: location.basic_info?.climate || location.climate,
          terrain: location.basic_info?.terrain || location.terrain,
          type: location.basic_info?.type || location.type,
          atmosphere: location.basic_info?.atmosphere || location.atmosphere,
          
          // Enhanced fields
          basic_info: location.basic_info,
          physical_description: location.physical_description,
          notable_features: location.notable_features,
          inhabitants: location.inhabitants,
          history: location.history,
          rpg_elements: location.rpg_elements,
          
          // Metadata
          wookieepedia_url: location.wookieepedia_url,
          canon_source: location.canon_source,
          enhancement_version: location.enhancement_version,
          last_updated: location.last_updated
        }));

        res.json({
          data: enhancedLocations,
          total,
          limit: limitNum,
          offset: offsetNum,
          enhanced: true
        });
        return;
      }

      // Use the existing findLocations method with proper filters for Neo4j
      const filters: any = {};
      if (search) filters.search = search;
      if (planet) filters.planet = planet;
      if (climate) filters.climate = climate;

      // Get locations using existing service method
      const allLocations = await neo4jService.findLocations(filters);
      
      // Apply pagination manually
      const total = allLocations.length;
      const locations = allLocations
        .slice(offsetNum, offsetNum + limitNum)
        .map((record: any) => {
          // The record has 'l' key containing the location node
          const location = record.l || record;
          return {
            id: location.name, // Use name as ID
            name: location.name,
            planet: location.planet,
            region: location.region,
            description: location.description,
            climate: location.climate,
            terrain: location.terrain,
            type: location.type,
            atmosphere: location.atmosphere,
            features: location.features,
            dangers: location.dangers,
            system: location.system
          };
        });

      res.json({
        data: locations,
        total,
        limit: limitNum,
        offset: offsetNum
      });

    } catch (error) {
      logger.error('Error fetching locations', { error });
      next(error);
    }
  }

  /**
   * Get location by ID
   */
  async getLocationById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      logger.debug('Fetching location by ID', { id });

      // Use existing service method to find locations by name
      const locations = await neo4jService.findLocations({ name: id });

      if (locations.length === 0) {
        res.status(404).json({ error: 'Location not found' });
        return;
      }

      const record = locations[0];
      const location = record.l || record;
      res.json({
        id: location.name,
        name: location.name,
        planet: location.planet,
        region: location.region,
        description: location.description,
        climate: location.climate,
        terrain: location.terrain,
        type: location.type,
        atmosphere: location.atmosphere,
        features: location.features,
        dangers: location.dangers,
        system: location.system
      });

    } catch (error) {
      logger.error('Error fetching location by ID', { error, id: req.params.id });
      next(error);
    }
  }

  /**
   * Get Star Wars factions from MongoDB or Neo4j database
   */
  async getFactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        limit = '20',
        offset = '0',
        search,
        era,
        enhanced
      } = req.query as QueryParams;

      const limitNum = parseInt(limit, 10);
      const offsetNum = parseInt(offset, 10);

      logger.debug('Fetching factions', {
        limit: limitNum,
        offset: offsetNum,
        search,
        era,
        enhanced
      });

      // Check if enhanced data is requested or use MongoDB as default
      if (enhanced === 'true' || enhanced !== 'false') {
        // Get factions from MongoDB
        const factionsCollection = mongodbService.getFactionsCollection();
        
        // Build query filters
        const query: any = {};
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
        if (era) {
          query.era = { $regex: era, $options: 'i' };
        }

        // Get total count
        const total = await factionsCollection.countDocuments(query);

        // Get factions with pagination
        const factions = await factionsCollection
          .find(query)
          .sort({ name: 1 })
          .skip(offsetNum)
          .limit(limitNum)
          .toArray();

        // Transform data
        const enhancedFactions = factions.map((faction: any) => ({
          id: faction.faction_id || faction.id || faction.name,
          name: faction.name,
          description: faction.description,
          type: faction.type,
          era: faction.era,
          alignment: faction.alignment,
          headquarters: faction.headquarters,
          leadership: faction.leadership,
          goals: faction.goals,
          resources: faction.resources,
          notableMembers: faction.notable_members || faction.notableMembers,
          allies: faction.allies,
          enemies: faction.enemies,
          // Enhanced fields
          detailed_content: faction.detailed_content,
          key_figures: faction.key_figures,
          wookieepedia_url: faction.wookieepedia_url,
          philosophy: faction.philosophy,
          source: faction.source,
          relationships: faction.relationships
        }));

        res.json({
          data: enhancedFactions,
          total,
          limit: limitNum,
          offset: offsetNum,
          enhanced: true
        });
        return;
      }

      // Use the existing findFactions method with proper filters for Neo4j
      const filters: any = {};
      if (search) filters.search = search;
      if (era) filters.era = era;

      // Get factions using existing service method
      const allFactions = await neo4jService.findFactions(filters);
      
      // Apply pagination manually
      const total = allFactions.length;
      const factions = allFactions
        .slice(offsetNum, offsetNum + limitNum)
        .map((record: any) => {
          // The record has 'f' key containing the faction node
          const faction = record.f || record;
          return {
            id: faction.name, // Use name as ID
            name: faction.name,
            description: faction.description,
            type: faction.type,
            era: faction.era,
            alignment: faction.alignment,
            headquarters: faction.headquarters,
            leadership: faction.leadership,
            goals: faction.goals,
            resources: faction.resources,
            notableMembers: faction.notableMembers,
            allies: faction.allies,
            enemies: faction.enemies,
            // Enhanced fields for improved lore page
            detailed_content: faction.detailed_content,
            key_figures: faction.key_figures,
            wookieepedia_url: faction.wookieepedia_url,
            philosophy: faction.philosophy,
            source: faction.source
          };
        });

      res.json({
        data: factions,
        total,
        limit: limitNum,
        offset: offsetNum
      });

    } catch (error) {
      logger.error('Error fetching factions', { error });
      next(error);
    }
  }

  /**
   * Get faction by ID
   */
  async getFactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      logger.debug('Fetching faction by ID', { id });

      // Use existing service method to find factions by name
      const factions = await neo4jService.findFactions({ name: id });

      if (factions.length === 0) {
        res.status(404).json({ error: 'Faction not found' });
        return;
      }

      const record = factions[0];
      const faction = record.f || record;
      
      // Debug logging
      logger.debug('Faction record debug', { record: JSON.stringify(record), faction: JSON.stringify(faction) });
      res.json({
        id: faction.name,
        name: faction.name,
        description: faction.description,
        type: faction.type,
        era: faction.era,
        alignment: faction.alignment,
        headquarters: faction.headquarters,
        leadership: faction.leadership,
        goals: faction.goals,
        resources: faction.resources,
        notableMembers: faction.notableMembers,
        allies: faction.allies,
        enemies: faction.enemies,
        // Enhanced fields for improved lore page
        detailed_content: faction.detailed_content,
        key_figures: faction.key_figures,
        wookieepedia_url: faction.wookieepedia_url,
        philosophy: faction.philosophy,
        source: faction.source
      });

    } catch (error) {
      logger.error('Error fetching faction by ID', { error, id: req.params.id });
      next(error);
    }
  }
}

export default new WorldController();