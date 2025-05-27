#!/usr/bin/env node

/**
 * Import Enhanced Location Profiles to MongoDB and Neo4j
 * 
 * Imports comprehensive Original Trilogy location profiles with
 * enhanced environmental, cultural, and RPG-focused content
 */

const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

class EnhancedLocationImporter {
  constructor() {
    this.mongoUri = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';
    this.neo4jUri = process.env.NEO4J_URI || 'bolt://localhost:7687';
    this.neo4jUser = process.env.NEO4J_USER || 'neo4j';
    this.neo4jPassword = process.env.NEO4J_PASSWORD || 'password';
    
    this.mongoClient = null;
    this.neo4jDriver = null;
  }

  async initialize() {
    try {
      // Initialize MongoDB connection
      this.mongoClient = new MongoClient(this.mongoUri);
      await this.mongoClient.connect();
      console.log('✅ Connected to MongoDB');

      // Initialize Neo4j connection
      this.neo4jDriver = neo4j.driver(
        this.neo4jUri,
        neo4j.auth.basic(this.neo4jUser, this.neo4jPassword)
      );
      await this.neo4jDriver.verifyConnectivity();
      console.log('✅ Connected to Neo4j');

    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }

  async loadEnhancedLocationData() {
    try {
      const dataPath = path.join(__dirname, '../data/lore/locations_enhanced_original_trilogy.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      console.log(`📄 Loaded enhanced location data: ${data.metadata.title}`);
      console.log(`📊 Total locations: ${data.metadata.total_locations}`);
      
      return data.locations;
    } catch (error) {
      console.error('❌ Failed to load enhanced location data:', error.message);
      throw error;
    }
  }

  async importToMongoDB(locationsData) {
    try {
      const db = this.mongoClient.db('swrpg');
      const collection = db.collection('locations');

      console.log('🔄 Starting MongoDB location import...');

      // Convert locations object to array with proper formatting
      const locationArray = Object.entries(locationsData).map(([key, location]) => {
        return {
          ...location,
          last_updated: new Date(),
          enhancement_version: '1.0',
          import_timestamp: new Date()
        };
      });

      // Insert enhanced locations
      const result = await collection.insertMany(locationArray, { ordered: false });
      
      console.log(`✅ MongoDB: Imported ${result.insertedCount} enhanced location profiles`);
      
      // Create indexes for performance
      await collection.createIndex({ 'basic_info.id': 1 });
      await collection.createIndex({ name: 1 });
      await collection.createIndex({ region: 1 });
      await collection.createIndex({ 'basic_info.classification': 1 });
      await collection.createIndex({ 'environmental_details.climate': 1 });
      
      console.log('✅ MongoDB: Created performance indexes for locations');
      
      return result;
    } catch (error) {
      console.error('❌ MongoDB location import failed:', error.message);
      throw error;
    }
  }

  async importToNeo4j(locationsData) {
    try {
      const session = this.neo4jDriver.session();
      
      console.log('🔄 Starting Neo4j location import...');

      try {
        let importCount = 0;

        for (const [key, location] of Object.entries(locationsData)) {
          // Create main location node with enhanced properties
          const locationQuery = `
            MERGE (l:Location {id: $id})
            SET l.name = $name,
                l.region = $region,
                l.description = $description,
                l.system = $system,
                l.classification = $classification,
                l.coordinates = $coordinates,
                l.gravity = $gravity,
                l.atmosphere = $atmosphere,
                l.climate = $climate,
                l.population = $population,
                l.government = $government,
                l.strategic_value = $strategic_value,
                l.enhancement_version = "1.0",
                l.last_updated = datetime(),
                l.import_timestamp = datetime()
            RETURN l
          `;

          const locationParams = {
            id: location.basic_info?.id || key,
            name: location.basic_info?.name || location.name,
            region: location.basic_info?.region || location.region,
            description: location.description || '',
            system: location.basic_info?.system || location.system || '',
            classification: location.basic_info?.classification || '',
            coordinates: location.basic_info?.coordinates || '',
            gravity: location.environmental_details?.gravity || '',
            atmosphere: location.environmental_details?.atmospheric_composition || '',
            climate: location.environmental_details?.climate || location.climate || '',
            population: location.population_and_culture?.estimated_population || '',
            government: location.population_and_culture?.government || '',
            strategic_value: location.military_significance?.strategic_value || 
                           location.historical_significance?.strategic_importance || ''
          };

          await session.run(locationQuery, locationParams);

          // Create character origin relationships
          if (location.character_origins) {
            for (const [characterKey, originInfo] of Object.entries(location.character_origins)) {
              if (typeof originInfo === 'object' && originInfo.connection_type) {
                const originQuery = `
                  MATCH (l:Location {id: $locationId})
                  MATCH (c:Character {name: $characterName})
                  MERGE (c)-[:ORIGINATED_FROM {
                    connection_type: $connectionType,
                    duration: $duration,
                    significance: $significance
                  }]->(l)
                `;
                
                // Convert character key to readable name
                const characterName = characterKey.replace(/_/g, ' ')
                  .replace(/\b\w/g, char => char.toUpperCase());
                
                await session.run(originQuery, {
                  locationId: location.basic_info?.id || key,
                  characterName: characterName,
                  connectionType: originInfo.connection_type,
                  duration: originInfo.duration || '',
                  significance: originInfo.significance || ''
                });
              }
            }
          }

          // Create faction territory relationships
          if (location.faction_territories) {
            for (const [factionKey, territoryInfo] of Object.entries(location.faction_territories)) {
              if (typeof territoryInfo === 'object' && territoryInfo.control_type) {
                const territoryQuery = `
                  MATCH (l:Location {id: $locationId})
                  MERGE (f:Faction {name: $factionName})
                  MERGE (f)-[:CONTROLS_TERRITORY {
                    control_type: $controlType,
                    operations: $operations,
                    interaction: $interaction
                  }]->(l)
                `;
                
                // Convert faction key to readable name
                const factionName = factionKey.replace(/_/g, ' ')
                  .replace(/\b\w/g, char => char.toUpperCase());
                
                await session.run(territoryQuery, {
                  locationId: location.basic_info?.id || key,
                  factionName: factionName,
                  controlType: territoryInfo.control_type,
                  operations: Array.isArray(territoryInfo.operations) ? 
                    territoryInfo.operations.join(', ') : (territoryInfo.operations || ''),
                  interaction: territoryInfo.interaction || ''
                });
              }
            }
          }

          // Create system relationships for planets in same system
          if (location.basic_info?.system) {
            const systemQuery = `
              MERGE (s:StarSystem {name: $systemName})
              WITH s
              MATCH (l:Location {id: $locationId})
              MERGE (l)-[:LOCATED_IN]->(s)
            `;
            
            await session.run(systemQuery, {
              systemName: location.basic_info.system,
              locationId: location.basic_info?.id || key
            });
          }

          importCount++;
        }

        console.log(`✅ Neo4j: Imported ${importCount} enhanced location profiles with relationships`);
        
      } finally {
        await session.close();
      }
    } catch (error) {
      console.error('❌ Neo4j location import failed:', error.message);
      throw error;
    }
  }

  async validateImport() {
    try {
      console.log('🔍 Validating location import...');

      // Validate MongoDB
      const db = this.mongoClient.db('swrpg');
      const mongoCollection = db.collection('locations');
      const mongoCount = await mongoCollection.countDocuments({ enhancement_version: '1.0' });
      console.log(`📊 MongoDB: Found ${mongoCount} enhanced location profiles`);

      // Validate Neo4j
      const session = this.neo4jDriver.session();
      try {
        const neo4jResult = await session.run('MATCH (l:Location {enhancement_version: "1.0"}) RETURN count(l) as count');
        const neo4jCount = neo4jResult.records[0].get('count').toNumber();
        console.log(`📊 Neo4j: Found ${neo4jCount} enhanced location nodes`);

        // Validate relationships
        const relationshipResult = await session.run(`
          MATCH (l:Location {enhancement_version: "1.0"})-[r]-()
          RETURN type(r) as relationship_type, count(r) as count
          ORDER BY count DESC
        `);
        
        console.log('📊 Neo4j Location Relationships:');
        relationshipResult.records.forEach(record => {
          console.log(`  - ${record.get('relationship_type')}: ${record.get('count')}`);
        });

        // Validate star systems
        const systemResult = await session.run(`
          MATCH (s:StarSystem)<-[:LOCATED_IN]-(l:Location {enhancement_version: "1.0"})
          RETURN s.name as system_name, count(l) as location_count
          ORDER BY location_count DESC
        `);
        
        console.log('📊 Star Systems:');
        systemResult.records.forEach(record => {
          console.log(`  - ${record.get('system_name')}: ${record.get('location_count')} locations`);
        });

      } finally {
        await session.close();
      }

      if (mongoCount > 0 && neo4jCount > 0) {
        console.log('✅ Location import validation successful');
        return true;
      } else {
        console.log('❌ Location import validation failed - missing data');
        return false;
      }

    } catch (error) {
      console.error('❌ Location import validation failed:', error.message);
      return false;
    }
  }

  async cleanup() {
    try {
      if (this.mongoClient) {
        await this.mongoClient.close();
        console.log('🔌 MongoDB connection closed');
      }
      
      if (this.neo4jDriver) {
        await this.neo4jDriver.close();
        console.log('🔌 Neo4j connection closed');
      }
    } catch (error) {
      console.error('❌ Cleanup failed:', error.message);
    }
  }

  async run() {
    try {
      console.log('🚀 Starting Enhanced Location Profiles Import');
      console.log('=============================================');

      await this.initialize();
      
      const locationsData = await this.loadEnhancedLocationData();
      
      await this.importToMongoDB(locationsData);
      await this.importToNeo4j(locationsData);
      
      const validationSuccess = await this.validateImport();
      
      if (validationSuccess) {
        console.log('🎉 Enhanced location profiles import completed successfully!');
      } else {
        console.log('⚠️  Import completed with validation warnings');
      }

    } catch (error) {
      console.error('💥 Location import failed:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  const importer = new EnhancedLocationImporter();
  importer.run().catch(console.error);
}

module.exports = EnhancedLocationImporter;