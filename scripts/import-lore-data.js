#!/usr/bin/env node

/**
 * Star Wars Lore Data Import Script
 * Imports comprehensive lore data into MongoDB, Neo4j, and Weaviate
 */

const fs = require('fs').promises;
const path = require('path');
const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');
const axios = require('axios');

// Configuration
const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin',
    database: 'swrpg'
  },
  neo4j: {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'neo4j',
    password: process.env.NEO4J_PASSWORD || 'password'
  },
  dataPath: path.join(__dirname, '..', 'data', 'lore')
};

// Logging utility
const log = {
  info: (msg) => console.log(`[INFO] ${msg}`),
  error: (msg) => console.error(`[ERROR] ${msg}`),
  success: (msg) => console.log(`[SUCCESS] ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${msg}`)
};

class LoreDataImporter {
  constructor() {
    this.mongoClient = null;
    this.neo4jDriver = null;
    this.stats = {
      mongodb: { inserted: 0, updated: 0, errors: 0 },
      neo4j: { created: 0, relationships: 0, errors: 0 }
    };
  }

  async initialize() {
    try {
      // Connect to MongoDB
      this.mongoClient = new MongoClient(config.mongodb.uri);
      await this.mongoClient.connect();
      log.success('Connected to MongoDB');

      // Connect to Neo4j
      this.neo4jDriver = neo4j.driver(
        config.neo4j.uri,
        neo4j.auth.basic(config.neo4j.user, config.neo4j.password)
      );
      await this.neo4jDriver.verifyConnectivity();
      log.success('Connected to Neo4j');

    } catch (error) {
      log.error(`Initialization failed: ${error.message}`);
      throw error;
    }
  }

  async loadLoreFiles() {
    const loreFiles = [
      'force_and_jedi.json',
      'characters_expanded.json',
      'locations_expanded.json',
      'timeline_events.json',
      'factions_organizations.json'
    ];

    const loreData = {};
    
    for (const file of loreFiles) {
      try {
        const filePath = path.join(config.dataPath, file);
        const rawData = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(rawData);
        const dataKey = file.replace('.json', '');
        loreData[dataKey] = data;
        log.info(`Loaded ${file}`);
      } catch (error) {
        log.error(`Failed to load ${file}: ${error.message}`);
      }
    }

    return loreData;
  }

  async importToMongoDB(loreData) {
    const db = this.mongoClient.db(config.mongodb.database);
    
    try {
      // Import Force and Jedi lore
      await this.importForceData(db, loreData.force_and_jedi);
      
      // Import Characters
      await this.importCharacters(db, loreData.characters_expanded);
      
      // Import Locations
      await this.importLocations(db, loreData.locations_expanded);
      
      // Import Timeline Events
      await this.importEvents(db, loreData.timeline_events);
      
      // Import Factions
      await this.importFactions(db, loreData.factions_organizations);
      
      log.success(`MongoDB import complete: ${this.stats.mongodb.inserted} inserted, ${this.stats.mongodb.updated} updated`);
    } catch (error) {
      log.error(`MongoDB import failed: ${error.message}`);
      this.stats.mongodb.errors++;
    }
  }

  async importForceData(db, forceData) {
    const collection = db.collection('force_lore');
    
    // Import Force philosophies
    for (const [key, philosophy] of Object.entries(forceData.force_philosophy || {})) {
      const document = {
        _id: `philosophy_${key}`,
        type: 'philosophy',
        name: key,
        ...philosophy,
        importedAt: new Date()
      };
      
      await this.upsertDocument(collection, document);
    }

    // Import Force powers
    for (const [category, powers] of Object.entries(forceData.force_powers || {})) {
      for (const [powerKey, power] of Object.entries(powers)) {
        const document = {
          _id: `power_${category}_${powerKey}`,
          type: 'force_power',
          category: category,
          name: powerKey,
          ...power,
          importedAt: new Date()
        };
        
        await this.upsertDocument(collection, document);
      }
    }

    // Import lightsaber forms
    for (const [formKey, form] of Object.entries(forceData.lightsaber_combat?.seven_forms || {})) {
      const document = {
        _id: `lightsaber_form_${formKey}`,
        type: 'lightsaber_form',
        name: formKey,
        ...form,
        importedAt: new Date()
      };
      
      await this.upsertDocument(collection, document);
    }

    // Import Jedi organization structure
    const jediOrg = forceData.jedi_organization;
    if (jediOrg) {
      const document = {
        _id: 'jedi_organization',
        type: 'organization_structure',
        ...jediOrg,
        importedAt: new Date()
      };
      
      await this.upsertDocument(collection, document);
    }

    // Import Force traditions
    for (const [category, traditions] of Object.entries(forceData.force_traditions || {})) {
      for (const [traditionKey, tradition] of Object.entries(traditions)) {
        const document = {
          _id: `tradition_${category}_${traditionKey}`,
          type: 'force_tradition',
          category: category,
          name: traditionKey,
          ...tradition,
          importedAt: new Date()
        };
        
        await this.upsertDocument(collection, document);
      }
    }
  }

  async importCharacters(db, charactersData) {
    const collection = db.collection('characters');
    
    for (const [category, characters] of Object.entries(charactersData)) {
      for (const [charKey, character] of Object.entries(characters)) {
        const document = {
          _id: `character_${charKey}`,
          type: 'character',
          category: category,
          slug: charKey,
          ...character,
          importedAt: new Date()
        };
        
        await this.upsertDocument(collection, document);
      }
    }
  }

  async importLocations(db, locationsData) {
    const collection = db.collection('locations');
    
    for (const [region, locations] of Object.entries(locationsData)) {
      for (const [locKey, location] of Object.entries(locations)) {
        const document = {
          _id: `location_${locKey}`,
          type: 'location',
          region: region,
          slug: locKey,
          ...location,
          importedAt: new Date()
        };
        
        await this.upsertDocument(collection, document);
      }
    }
  }

  async importEvents(db, timelineData) {
    const collection = db.collection('timeline_events');
    
    // Import major eras
    for (const [eraKey, era] of Object.entries(timelineData.galactic_timeline?.major_eras || {})) {
      const document = {
        _id: `era_${eraKey}`,
        type: 'era',
        name: eraKey,
        ...era,
        importedAt: new Date()
      };
      
      await this.upsertDocument(collection, document);
    }

    // Import pivotal moments
    for (const [momentKey, moment] of Object.entries(timelineData.galactic_timeline?.pivotal_moments || {})) {
      const document = {
        _id: `moment_${momentKey}`,
        type: 'pivotal_moment',
        name: momentKey,
        ...moment,
        importedAt: new Date()
      };
      
      await this.upsertDocument(collection, document);
    }

    // Import Force history
    for (const [historyKey, history] of Object.entries(timelineData.force_history || {})) {
      const document = {
        _id: `force_history_${historyKey}`,
        type: 'force_history',
        name: historyKey,
        ...history,
        importedAt: new Date()
      };
      
      await this.upsertDocument(collection, document);
    }
  }

  async importFactions(db, factionsData) {
    const collection = db.collection('factions');
    
    for (const [category, factions] of Object.entries(factionsData)) {
      for (const [factionKey, faction] of Object.entries(factions)) {
        const document = {
          _id: `faction_${factionKey}`,
          type: 'faction',
          category: category,
          slug: factionKey,
          ...faction,
          importedAt: new Date()
        };
        
        await this.upsertDocument(collection, document);
      }
    }
  }

  async upsertDocument(collection, document) {
    try {
      const result = await collection.replaceOne(
        { _id: document._id },
        document,
        { upsert: true }
      );
      
      if (result.upsertedCount > 0) {
        this.stats.mongodb.inserted++;
      } else if (result.modifiedCount > 0) {
        this.stats.mongodb.updated++;
      }
    } catch (error) {
      log.error(`Failed to upsert document ${document._id}: ${error.message}`);
      this.stats.mongodb.errors++;
    }
  }

  async importToNeo4j(loreData) {
    const session = this.neo4jDriver.session();
    
    try {
      // Create indexes for better performance
      await this.createNeo4jIndexes(session);
      
      // Import characters and their relationships
      await this.importCharacterRelationships(session, loreData.characters_expanded);
      
      // Import locations and their connections
      await this.importLocationRelationships(session, loreData.locations_expanded);
      
      // Import faction relationships
      await this.importFactionRelationships(session, loreData.factions_organizations);
      
      // Import Force user connections
      await this.importForceUserRelationships(session, loreData.force_and_jedi);
      
      log.success(`Neo4j import complete: ${this.stats.neo4j.created} nodes, ${this.stats.neo4j.relationships} relationships`);
    } catch (error) {
      log.error(`Neo4j import failed: ${error.message}`);
      this.stats.neo4j.errors++;
    } finally {
      await session.close();
    }
  }

  async createNeo4jIndexes(session) {
    const indexes = [
      'CREATE INDEX character_name IF NOT EXISTS FOR (c:Character) ON (c.name)',
      'CREATE INDEX location_name IF NOT EXISTS FOR (l:Location) ON (l.name)',
      'CREATE INDEX faction_name IF NOT EXISTS FOR (f:Faction) ON (f.name)',
      'CREATE INDEX force_tradition_name IF NOT EXISTS FOR (ft:ForceTradition) ON (ft.name)'
    ];

    for (const indexQuery of indexes) {
      try {
        await session.run(indexQuery);
      } catch (error) {
        // Index might already exist, continue
      }
    }
  }

  async importCharacterRelationships(session, charactersData) {
    for (const [category, characters] of Object.entries(charactersData)) {
      for (const [charKey, character] of Object.entries(characters)) {
        // Create character node
        await session.run(`
          MERGE (c:Character {id: $id})
          SET c.name = $name,
              c.species = $species,
              c.homeworld = $homeworld,
              c.category = $category,
              c.force_sensitivity = $force_sensitivity,
              c.rank = $rank,
              c.updated = datetime()
        `, {
          id: charKey,
          name: character.full_name || character.name || charKey,
          species: character.species,
          homeworld: character.homeworld,
          category: category,
          force_sensitivity: character.force_sensitivity,
          rank: character.rank
        });
        this.stats.neo4j.created++;

        // Create relationships
        if (character.key_relationships) {
          for (const [relType, targets] of Object.entries(character.key_relationships)) {
            if (Array.isArray(targets)) {
              for (const target of targets) {
                await this.createRelationship(session, charKey, target, relType.toUpperCase());
              }
            } else if (typeof targets === 'string') {
              await this.createRelationship(session, charKey, targets, relType.toUpperCase());
            }
          }
        }
      }
    }
  }

  async importLocationRelationships(session, locationsData) {
    for (const [region, locations] of Object.entries(locationsData)) {
      for (const [locKey, location] of Object.entries(locations)) {
        // Create location node
        await session.run(`
          MERGE (l:Location {id: $id})
          SET l.name = $name,
              l.system = $system,
              l.sector = $sector,
              l.region = $region,
              l.climate = $climate,
              l.terrain = $terrain,
              l.population = $population,
              l.updated = datetime()
        `, {
          id: locKey,
          name: location.name || locKey,
          system: location.system,
          sector: location.sector,
          region: region,
          climate: location.climate,
          terrain: location.terrain,
          population: location.population
        });
        this.stats.neo4j.created++;

        // Create system relationships
        if (location.system) {
          await session.run(`
            MERGE (s:System {name: $system})
            MERGE (l:Location {id: $locationId})
            MERGE (l)-[:LOCATED_IN]->(s)
          `, {
            system: location.system,
            locationId: locKey
          });
          this.stats.neo4j.relationships++;
        }
      }
    }
  }

  async importFactionRelationships(session, factionsData) {
    for (const [category, factions] of Object.entries(factionsData)) {
      for (const [factionKey, faction] of Object.entries(factions)) {
        // Create faction node
        await session.run(`
          MERGE (f:Faction {id: $id})
          SET f.name = $name,
              f.type = $type,
              f.category = $category,
              f.alignment = $alignment,
              f.timeframe = $timeframe,
              f.updated = datetime()
        `, {
          id: factionKey,
          name: faction.name || factionKey,
          type: faction.type,
          category: category,
          alignment: faction.alignment,
          timeframe: faction.timeframe
        });
        this.stats.neo4j.created++;

        // Create enemy relationships
        if (faction.enemies) {
          for (const enemy of faction.enemies) {
            await this.createFactionRelationship(session, factionKey, enemy, 'ENEMY_OF');
          }
        }

        // Create ally relationships
        if (faction.allies) {
          for (const ally of faction.allies) {
            await this.createFactionRelationship(session, factionKey, ally, 'ALLIED_WITH');
          }
        }
      }
    }
  }

  async importForceUserRelationships(session, forceData) {
    // Create Force tradition nodes and relationships
    for (const [category, traditions] of Object.entries(forceData.force_traditions || {})) {
      for (const [traditionKey, tradition] of Object.entries(traditions)) {
        await session.run(`
          MERGE (ft:ForceTradition {id: $id})
          SET ft.name = $name,
              ft.category = $category,
              ft.location = $location,
              ft.philosophy = $philosophy,
              ft.updated = datetime()
        `, {
          id: `${category}_${traditionKey}`,
          name: traditionKey,
          category: category,
          location: tradition.location,
          philosophy: tradition.philosophy || tradition.description
        });
        this.stats.neo4j.created++;
      }
    }
  }

  async createRelationship(session, fromId, toName, relType) {
    try {
      await session.run(`
        MATCH (from:Character {id: $fromId})
        MERGE (to:Character {name: $toName})
        MERGE (from)-[:${relType}]->(to)
      `, { fromId, toName });
      this.stats.neo4j.relationships++;
    } catch (error) {
      log.warn(`Failed to create relationship ${fromId} -> ${toName}: ${error.message}`);
    }
  }

  async createFactionRelationship(session, fromId, toName, relType) {
    try {
      await session.run(`
        MATCH (from:Faction {id: $fromId})
        MERGE (to:Faction {name: $toName})
        MERGE (from)-[:${relType}]->(to)
      `, { fromId, toName });
      this.stats.neo4j.relationships++;
    } catch (error) {
      log.warn(`Failed to create faction relationship ${fromId} -> ${toName}: ${error.message}`);
    }
  }

  async cleanup() {
    if (this.mongoClient) {
      await this.mongoClient.close();
      log.info('MongoDB connection closed');
    }
    
    if (this.neo4jDriver) {
      await this.neo4jDriver.close();
      log.info('Neo4j connection closed');
    }
  }

  async run() {
    try {
      log.info('Starting Star Wars lore data import...');
      
      await this.initialize();
      const loreData = await this.loadLoreFiles();
      
      log.info('Importing to MongoDB...');
      await this.importToMongoDB(loreData);
      
      log.info('Importing to Neo4j...');
      await this.importToNeo4j(loreData);
      
      log.success('Lore import completed successfully!');
      log.info(`Final stats: MongoDB (${this.stats.mongodb.inserted} inserted, ${this.stats.mongodb.updated} updated, ${this.stats.mongodb.errors} errors)`);
      log.info(`Final stats: Neo4j (${this.stats.neo4j.created} nodes, ${this.stats.neo4j.relationships} relationships, ${this.stats.neo4j.errors} errors)`);
      
    } catch (error) {
      log.error(`Import failed: ${error.message}`);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  const importer = new LoreDataImporter();
  importer.run().catch(console.error);
}

module.exports = LoreDataImporter;