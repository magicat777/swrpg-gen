#!/usr/bin/env node

/**
 * Comprehensive Star Wars Sample Data Import Script
 * Imports data into Neo4j, MongoDB, and Weaviate databases
 */

const fs = require('fs').promises;
const path = require('path');
const neo4j = require('neo4j-driver');
const { MongoClient } = require('mongodb');
const weaviate = require('weaviate-ts-client').default;

// Configuration
const config = {
  neo4j: {
    uri: 'bolt://localhost:7687',
    user: 'neo4j',
    password: 'password'
  },
  mongodb: {
    uri: 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin'
  },
  weaviate: {
    scheme: 'http',
    host: 'localhost:8080'
  }
};

class StarWarsDataImporter {
  constructor() {
    this.neo4jDriver = null;
    this.mongoClient = null;
    this.weaviateClient = null;
    this.stats = {
      characters: 0,
      locations: 0,
      factions: 0,
      events: 0,
      relationships: 0
    };
  }

  async initialize() {
    console.log('🚀 Initializing database connections...');
    
    // Initialize Neo4j
    this.neo4jDriver = neo4j.driver(
      config.neo4j.uri,
      neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
    );
    
    // Initialize MongoDB
    this.mongoClient = new MongoClient(config.mongodb.uri);
    await this.mongoClient.connect();
    
    // Initialize Weaviate
    this.weaviateClient = weaviate.client({
      scheme: config.weaviate.scheme,
      host: config.weaviate.host
    });
    
    console.log('✅ All database connections established');
  }

  async loadLoreData() {
    console.log('📚 Loading lore data files...');
    
    const dataDir = path.join(__dirname, '../data/lore');
    const loreData = {};
    
    const files = [
      'characters_expanded.json',
      'locations_expanded.json', 
      'factions_organizations.json',
      'timeline_events.json',
      'force_and_jedi.json'
    ];
    
    for (const file of files) {
      const filePath = path.join(dataDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const key = file.replace('_expanded.json', '').replace('.json', '');
      loreData[key] = JSON.parse(content);
      console.log(`  ✓ Loaded ${file}`);
    }
    
    return loreData;
  }

  async importCharacters(charactersData) {
    console.log('👤 Importing characters...');
    
    const session = this.neo4jDriver.session();
    let count = 0;
    
    try {
      // Process all character categories
      for (const [category, characters] of Object.entries(charactersData)) {
        for (const [key, character] of Object.entries(characters)) {
          await this.importSingleCharacter(session, character, category);
          
          // Also add to Weaviate for semantic search
          await this.addCharacterToWeaviate(character);
          count++;
        }
      }
      
      this.stats.characters = count;
      console.log(`  ✅ Imported ${count} characters`);
    } finally {
      await session.close();
    }
  }

  async importSingleCharacter(session, character, category) {
    const cypher = `
      MERGE (c:Character {name: $name})
      SET c.species = $species,
          c.homeworld = $homeworld,
          c.birth_year = $birth_year,
          c.death_year = $death_year,
          c.force_sensitivity = $force_sensitivity,
          c.affiliations = $affiliations,
          c.personality_traits = $personality_traits,
          c.category = $category,
          c.updatedAt = datetime()
      RETURN c
    `;
    
    const params = {
      name: character.full_name || character.name,
      species: character.species || 'Unknown',
      homeworld: character.homeworld || 'Unknown',
      birth_year: character.birth_year || null,
      death_year: character.death_year || null,
      force_sensitivity: character.force_sensitivity || 'None',
      affiliations: character.affiliations || [],
      personality_traits: character.personality_traits || [],
      category
    };
    
    await session.run(cypher, params);
  }

  async addCharacterToWeaviate(character) {
    const characterObj = {
      title: character.full_name || character.name,
      content: this.generateCharacterDescription(character),
      category: 'character',
      era: this.extractEra(character),
      canonicity: 'canon',
      importance: this.calculateImportance(character)
    };

    try {
      await this.weaviateClient.data
        .creator()
        .withClassName('WorldKnowledge')
        .withProperties(characterObj)
        .do();
    } catch (error) {
      console.log(`    ⚠️  Warning: Could not add ${character.full_name || character.name} to Weaviate`);
    }
  }

  async importLocations(locationsData) {
    console.log('🌍 Importing locations...');
    
    const session = this.neo4jDriver.session();
    let count = 0;
    
    try {
      for (const [region, locations] of Object.entries(locationsData)) {
        for (const [key, location] of Object.entries(locations)) {
          await this.importSingleLocation(session, location, region);
          await this.addLocationToWeaviate(location);
          count++;
        }
      }
      
      this.stats.locations = count;
      console.log(`  ✅ Imported ${count} locations`);
    } finally {
      await session.close();
    }
  }

  async importSingleLocation(session, location, region) {
    const cypher = `
      MERGE (l:Location {name: $name})
      SET l.system = $system,
          l.sector = $sector,
          l.region = $region,
          l.climate = $climate,
          l.terrain = $terrain,
          l.population = $population,
          l.government = $government,
          l.category = $category,
          l.updatedAt = datetime()
      RETURN l
    `;
    
    const params = {
      name: location.name,
      system: location.system || 'Unknown',
      sector: location.sector || 'Unknown',
      region: region,
      climate: location.climate || 'Unknown',
      terrain: location.terrain || 'Unknown',
      population: location.population || 'Unknown',
      government: location.government || 'Unknown',
      category: region
    };
    
    await session.run(cypher, params);
  }

  async addLocationToWeaviate(location) {
    const locationObj = {
      title: location.name,
      content: this.generateLocationDescription(location),
      category: 'location',
      era: 'all_eras',
      canonicity: 'canon',
      importance: this.calculateLocationImportance(location)
    };

    try {
      await this.weaviateClient.data
        .creator()
        .withClassName('WorldKnowledge')
        .withProperties(locationObj)
        .do();
    } catch (error) {
      console.log(`    ⚠️  Warning: Could not add ${location.name} to Weaviate`);
    }
  }

  async importFactions(factionsData) {
    console.log('🏛️ Importing factions...');
    
    const session = this.neo4jDriver.session();
    let count = 0;
    
    try {
      for (const [category, factions] of Object.entries(factionsData)) {
        for (const [key, faction] of Object.entries(factions)) {
          await this.importSingleFaction(session, faction, category);
          await this.addFactionToWeaviate(faction);
          count++;
        }
      }
      
      this.stats.factions = count;
      console.log(`  ✅ Imported ${count} factions`);
    } finally {
      await session.close();
    }
  }

  async importSingleFaction(session, faction, category) {
    const cypher = `
      MERGE (f:Faction {name: $name})
      SET f.type = $type,
          f.alignment = $alignment,
          f.headquarters = $headquarters,
          f.founding = $founding,
          f.philosophy = $philosophy,
          f.category = $category,
          f.updatedAt = datetime()
      RETURN f
    `;
    
    const params = {
      name: faction.name,
      type: faction.type || 'Organization',
      alignment: faction.alignment || 'Neutral',
      headquarters: faction.headquarters || 'Unknown',
      founding: faction.founding || 'Unknown',
      philosophy: faction.philosophy || '',
      category
    };
    
    await session.run(cypher, params);
  }

  async addFactionToWeaviate(faction) {
    const factionObj = {
      title: faction.name,
      content: this.generateFactionDescription(faction),
      category: 'faction',
      era: 'all_eras',
      canonicity: 'canon',
      importance: this.calculateFactionImportance(faction)
    };

    try {
      await this.weaviateClient.data
        .creator()
        .withClassName('WorldKnowledge')
        .withProperties(factionObj)
        .do();
    } catch (error) {
      console.log(`    ⚠️  Warning: Could not add ${faction.name} to Weaviate`);
    }
  }

  async importEvents(eventsData) {
    console.log('📅 Importing timeline events...');
    
    const session = this.neo4jDriver.session();
    let count = 0;
    
    try {
      // Handle the nested timeline structure
      if (eventsData.galactic_timeline && eventsData.galactic_timeline.major_eras) {
        for (const [eraName, eraData] of Object.entries(eventsData.galactic_timeline.major_eras)) {
          // Import era-level events
          if (eraData.key_events) {
            for (const eventTitle of eraData.key_events) {
              const event = {
                title: eventTitle,
                description: eraData.description,
                timeframe: eraData.timeframe,
                significance: eraData.significance
              };
              await this.importSingleEvent(session, event, eraName);
              await this.addEventToWeaviate(event, eraName);
              count++;
            }
          }
          
          // Import major period events
          if (eraData.major_periods) {
            for (const [periodName, periodData] of Object.entries(eraData.major_periods)) {
              const event = {
                title: periodName.replace(/_/g, ' '),
                description: periodData.description,
                date: periodData.date,
                participants: periodData.participants,
                outcome: periodData.outcome,
                significance: periodData.significance
              };
              await this.importSingleEvent(session, event, eraName);
              await this.addEventToWeaviate(event, eraName);
              count++;
            }
          }
        }
      }
      
      this.stats.events = count;
      console.log(`  ✅ Imported ${count} events`);
    } finally {
      await session.close();
    }
  }

  async importSingleEvent(session, event, era) {
    const cypher = `
      CREATE (e:Event {
        id: randomUUID(),
        title: $title,
        description: $description,
        year: $year,
        era: $era,
        type: $type,
        location: $location,
        participants: $participants,
        significance: $significance,
        createdAt: datetime(),
        updatedAt: datetime()
      })
      RETURN e
    `;
    
    const params = {
      title: event.event || event.title || 'Unknown Event',
      description: event.description || event.details || '',
      year: event.year || event.date || 'Unknown',
      era: era,
      type: event.type || 'historical',
      location: event.location || 'Unknown',
      participants: event.participants || [],
      significance: event.significance || 5
    };
    
    await session.run(cypher, params);
  }

  async addEventToWeaviate(event, era) {
    const eventObj = {
      title: event.event || event.title || 'Unknown Event',
      description: event.description || event.details || '',
      participants: event.participants || [],
      location: event.location || 'Unknown',
      importance: event.significance || 5,
      type: event.type || 'historical'
    };

    try {
      await this.weaviateClient.data
        .creator()
        .withClassName('StoryEvent')
        .withProperties(eventObj)
        .do();
    } catch (error) {
      console.log(`    ⚠️  Warning: Could not add event to Weaviate`);
    }
  }

  // Helper methods for generating descriptions
  generateCharacterDescription(character) {
    const parts = [];
    if (character.full_name || character.name) {
      parts.push(`${character.full_name || character.name} is a character in the Star Wars universe.`);
    }
    if (character.species) parts.push(`Species: ${character.species}.`);
    if (character.homeworld) parts.push(`Homeworld: ${character.homeworld}.`);
    if (character.affiliations) parts.push(`Affiliations: ${character.affiliations.join(', ')}.`);
    if (character.description) parts.push(character.description);
    
    return parts.join(' ');
  }

  generateLocationDescription(location) {
    const parts = [];
    parts.push(`${location.name} is a location in the Star Wars universe.`);
    if (location.region) parts.push(`Located in the ${location.region}.`);
    if (location.climate) parts.push(`Climate: ${location.climate}.`);
    if (location.terrain) parts.push(`Terrain: ${location.terrain}.`);
    if (location.description) parts.push(location.description);
    
    return parts.join(' ');
  }

  generateFactionDescription(faction) {
    const parts = [];
    parts.push(`${faction.name} is an organization in the Star Wars universe.`);
    if (faction.type) parts.push(`Type: ${faction.type}.`);
    if (faction.alignment) parts.push(`Alignment: ${faction.alignment}.`);
    if (faction.headquarters) parts.push(`Headquarters: ${faction.headquarters}.`);
    if (faction.philosophy) parts.push(`Philosophy: ${faction.philosophy}.`);
    
    return parts.join(' ');
  }

  extractEra(character) {
    if (character.birth_year && character.birth_year.includes('BBY')) return 'pre_empire';
    if (character.affiliations && character.affiliations.includes('Rebel Alliance')) return 'rebellion';
    if (character.affiliations && character.affiliations.includes('Galactic Empire')) return 'empire';
    return 'unknown';
  }

  calculateImportance(character) {
    let importance = 5; // default
    if (character.rank && (character.rank.includes('Master') || character.rank.includes('Lord'))) importance += 2;
    if (character.affiliations && character.affiliations.length > 2) importance += 1;
    if (character.notable_quotes && character.notable_quotes.length > 0) importance += 1;
    return Math.min(importance, 10);
  }

  calculateLocationImportance(location) {
    let importance = 5;
    if (location.population && location.population.includes('trillion')) importance += 2;
    if (location.government && location.government.includes('Capital')) importance += 2;
    if (location.notable_locations) importance += 1;
    return Math.min(importance, 10);
  }

  calculateFactionImportance(faction) {
    let importance = 5;
    if (faction.peak_membership) importance += 1;
    if (faction.type && faction.type.includes('Empire')) importance += 2;
    if (faction.name && (faction.name.includes('Jedi') || faction.name.includes('Sith'))) importance += 2;
    return Math.min(importance, 10);
  }

  async createRelationships() {
    console.log('🔗 Creating relationships...');
    
    const session = this.neo4jDriver.session();
    let count = 0;
    
    try {
      // Sample relationships - this could be expanded based on the lore data
      const relationships = [
        { from: 'Luke Skywalker', to: 'Darth Vader', type: 'CHILD_OF' },
        { from: 'Luke Skywalker', to: 'Tatooine', type: 'BORN_ON' },
        { from: 'Darth Vader', to: 'Galactic Empire', type: 'MEMBER_OF' },
        { from: 'Luke Skywalker', to: 'Rebel Alliance', type: 'MEMBER_OF' },
        { from: 'Han Solo', to: 'Millennium Falcon', type: 'OWNS' },
        { from: 'Princess Leia', to: 'Rebel Alliance', type: 'LEADER_OF' }
      ];
      
      for (const rel of relationships) {
        const cypher = `
          MATCH (a {name: $from}), (b {name: $to})
          MERGE (a)-[r:${rel.type}]->(b)
          RETURN r
        `;
        
        try {
          await session.run(cypher, { from: rel.from, to: rel.to });
          count++;
        } catch (error) {
          // Skip if nodes don't exist
        }
      }
      
      this.stats.relationships = count;
      console.log(`  ✅ Created ${count} relationships`);
    } finally {
      await session.close();
    }
  }

  async cleanup() {
    console.log('🧹 Cleaning up connections...');
    
    if (this.neo4jDriver) {
      await this.neo4jDriver.close();
    }
    
    if (this.mongoClient) {
      await this.mongoClient.close();
    }
    
    console.log('✅ Cleanup complete');
  }

  async run() {
    try {
      await this.initialize();
      
      const loreData = await this.loadLoreData();
      
      // Import all data types
      if (loreData.characters_expanded) {
        await this.importCharacters(loreData.characters_expanded);
      }
      
      if (loreData.locations_expanded) {
        await this.importLocations(loreData.locations_expanded);
      }
      
      if (loreData.factions_organizations) {
        await this.importFactions(loreData.factions_organizations);
      }
      
      if (loreData.timeline_events) {
        await this.importEvents(loreData.timeline_events);
      }
      
      // Create relationships
      await this.createRelationships();
      
      // Print summary
      console.log('\n📊 Import Summary:');
      console.log(`  Characters: ${this.stats.characters}`);
      console.log(`  Locations: ${this.stats.locations}`);
      console.log(`  Factions: ${this.stats.factions}`);
      console.log(`  Events: ${this.stats.events}`);
      console.log(`  Relationships: ${this.stats.relationships}`);
      console.log('\n🎉 Sample data import completed successfully!');
      
    } catch (error) {
      console.error('❌ Import failed:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the importer
const importer = new StarWarsDataImporter();
importer.run();