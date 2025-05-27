#!/usr/bin/env node

/**
 * Import Enhanced Character Profiles to MongoDB and Neo4j
 * 
 * Imports comprehensive Original Trilogy character profiles with
 * enhanced RPG-focused content to both MongoDB and Neo4j databases
 */

const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

class EnhancedCharacterImporter {
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

  async loadEnhancedCharacterData() {
    try {
      const dataPath = path.join(__dirname, '../data/lore/characters_enhanced_original_trilogy.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      console.log(`📄 Loaded enhanced character data: ${data.metadata.title}`);
      console.log(`📊 Total characters: ${data.metadata.total_characters}`);
      
      return data.characters;
    } catch (error) {
      console.error('❌ Failed to load enhanced character data:', error.message);
      throw error;
    }
  }

  async importToMongoDB(charactersData) {
    try {
      const db = this.mongoClient.db('swrpg');
      const collection = db.collection('characters');

      console.log('🔄 Starting MongoDB import...');

      // Convert characters object to array with proper formatting
      const characterArray = Object.entries(charactersData).map(([key, character]) => {
        return {
          ...character,
          last_updated: new Date(),
          enhancement_version: '1.0',
          import_timestamp: new Date()
        };
      });

      // Clear existing enhanced characters (optional - comment out to preserve)
      // await collection.deleteMany({ enhancement_version: { $exists: true } });

      // Insert enhanced characters
      const result = await collection.insertMany(characterArray, { ordered: false });
      
      console.log(`✅ MongoDB: Imported ${result.insertedCount} enhanced character profiles`);
      
      // Create indexes for performance
      await collection.createIndex({ 'basic_info.id': 1 });
      await collection.createIndex({ name: 1 });
      await collection.createIndex({ species: 1 });
      await collection.createIndex({ 'abilities.force_sensitivity': 1 });
      await collection.createIndex({ affiliation: 1 });
      
      console.log('✅ MongoDB: Created performance indexes');
      
      return result;
    } catch (error) {
      console.error('❌ MongoDB import failed:', error.message);
      throw error;
    }
  }

  async importToNeo4j(charactersData) {
    try {
      const session = this.neo4jDriver.session();
      
      console.log('🔄 Starting Neo4j import...');

      try {
        // Clear existing enhanced character nodes (optional)
        // await session.run('MATCH (c:Character {enhancement_version: "1.0"}) DETACH DELETE c');

        let importCount = 0;

        for (const [key, character] of Object.entries(charactersData)) {
          // Create main character node with enhanced properties
          const characterQuery = `
            MERGE (c:Character {id: $id})
            SET c.name = $name,
                c.species = $species,
                c.description = $description,
                c.homeworld = $homeworld,
                c.birth_year = $birth_year,
                c.age_during_trilogy = $age_during_trilogy,
                c.force_sensitivity = $force_sensitivity,
                c.height = $height,
                c.hair = $hair,
                c.eyes = $eyes,
                c.primary_weapon = $primary_weapon,
                c.wookieepedia_url = $wookieepedia_url,
                c.enhancement_version = "1.0",
                c.last_updated = datetime(),
                c.import_timestamp = datetime()
            RETURN c
          `;

          const characterParams = {
            id: character.basic_info?.id || key,
            name: character.basic_info?.name || character.name,
            species: character.basic_info?.species || character.species,
            description: character.description || '',
            homeworld: character.basic_info?.homeworld || '',
            birth_year: character.basic_info?.birth_year || '',
            age_during_trilogy: character.basic_info?.age_during_trilogy || '',
            force_sensitivity: character.abilities?.force_sensitivity || 'None',
            height: character.physical_description?.height || '',
            hair: character.physical_description?.hair || '',
            eyes: character.physical_description?.eyes || '',
            primary_weapon: character.equipment?.primary_weapon || '',
            wookieepedia_url: character.wookieepedia_url || ''
          };

          await session.run(characterQuery, characterParams);

          // Create affiliation relationships
          if (character.basic_info?.affiliations) {
            for (const affiliation of character.basic_info.affiliations) {
              const affiliationQuery = `
                MATCH (c:Character {id: $characterId})
                MERGE (f:Faction {name: $factionName})
                MERGE (c)-[:AFFILIATED_WITH]->(f)
              `;
              await session.run(affiliationQuery, {
                characterId: character.basic_info.id || key,
                factionName: affiliation
              });
            }
          }

          // Create family relationships
          if (character.relationships?.family) {
            for (const [relationshipType, relatedCharacter] of Object.entries(character.relationships.family)) {
              if (typeof relatedCharacter === 'string') {
                const familyQuery = `
                  MATCH (c1:Character {id: $characterId})
                  MATCH (c2:Character {name: $relatedName})
                  MERGE (c1)-[:FAMILY_RELATIONSHIP {type: $relationshipType}]->(c2)
                `;
                await session.run(familyQuery, {
                  characterId: character.basic_info.id || key,
                  relatedName: relatedCharacter,
                  relationshipType: relationshipType
                });
              }
            }
          }

          // Create mentor relationships
          if (character.relationships?.mentors) {
            for (const [mentorKey, mentorInfo] of Object.entries(character.relationships.mentors)) {
              if (typeof mentorInfo === 'object' && mentorInfo.character) {
                const mentorQuery = `
                  MATCH (student:Character {id: $studentId})
                  MATCH (mentor:Character {name: $mentorName})
                  MERGE (student)-[:TRAINED_BY {
                    relationship_type: $relationshipType,
                    training_period: $trainingPeriod,
                    location: $location
                  }]->(mentor)
                `;
                await session.run(mentorQuery, {
                  studentId: character.basic_info.id || key,
                  mentorName: mentorInfo.character || mentorKey.replace('_', ' '),
                  relationshipType: mentorInfo.relationship_type || 'mentor',
                  trainingPeriod: mentorInfo.training_period || '',
                  location: mentorInfo.location || ''
                });
              }
            }
          }

          importCount++;
        }

        console.log(`✅ Neo4j: Imported ${importCount} enhanced character profiles with relationships`);
        
      } finally {
        await session.close();
      }
    } catch (error) {
      console.error('❌ Neo4j import failed:', error.message);
      throw error;
    }
  }

  async validateImport() {
    try {
      console.log('🔍 Validating import...');

      // Validate MongoDB
      const db = this.mongoClient.db('swrpg');
      const mongoCollection = db.collection('characters');
      const mongoCount = await mongoCollection.countDocuments({ enhancement_version: '1.0' });
      console.log(`📊 MongoDB: Found ${mongoCount} enhanced character profiles`);

      // Validate Neo4j
      const session = this.neo4jDriver.session();
      try {
        const neo4jResult = await session.run('MATCH (c:Character {enhancement_version: "1.0"}) RETURN count(c) as count');
        const neo4jCount = neo4jResult.records[0].get('count').toNumber();
        console.log(`📊 Neo4j: Found ${neo4jCount} enhanced character nodes`);

        // Validate relationships
        const relationshipResult = await session.run(`
          MATCH (c:Character {enhancement_version: "1.0"})-[r]-()
          RETURN type(r) as relationship_type, count(r) as count
          ORDER BY count DESC
        `);
        
        console.log('📊 Neo4j Relationships:');
        relationshipResult.records.forEach(record => {
          console.log(`  - ${record.get('relationship_type')}: ${record.get('count')}`);
        });

      } finally {
        await session.close();
      }

      if (mongoCount > 0 && neo4jCount > 0) {
        console.log('✅ Import validation successful');
        return true;
      } else {
        console.log('❌ Import validation failed - missing data');
        return false;
      }

    } catch (error) {
      console.error('❌ Import validation failed:', error.message);
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
      console.log('🚀 Starting Enhanced Character Profiles Import');
      console.log('===============================================');

      await this.initialize();
      
      const charactersData = await this.loadEnhancedCharacterData();
      
      await this.importToMongoDB(charactersData);
      await this.importToNeo4j(charactersData);
      
      const validationSuccess = await this.validateImport();
      
      if (validationSuccess) {
        console.log('🎉 Enhanced character profiles import completed successfully!');
      } else {
        console.log('⚠️  Import completed with validation warnings');
      }

    } catch (error) {
      console.error('💥 Import failed:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  const importer = new EnhancedCharacterImporter();
  importer.run().catch(console.error);
}

module.exports = EnhancedCharacterImporter;