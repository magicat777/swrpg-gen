#!/usr/bin/env node

/**
 * Import Faction Relationship Matrix to MongoDB and Neo4j
 * 
 * Imports comprehensive faction relationship data with political,
 * military, and social connections between Original Trilogy factions
 */

const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');
const fs = require('fs');
const path = require('path');

class FactionRelationshipImporter {
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

  async loadFactionRelationshipData() {
    try {
      const dataPath = path.join(__dirname, '../data/lore/faction_relationships_original_trilogy.json');
      const rawData = fs.readFileSync(dataPath, 'utf8');
      const data = JSON.parse(rawData);
      
      console.log(`📄 Loaded faction relationship data: ${data.metadata.title}`);
      console.log(`📊 Total factions: ${data.metadata.total_factions}`);
      
      return data;
    } catch (error) {
      console.error('❌ Failed to load faction relationship data:', error.message);
      throw error;
    }
  }

  async importToMongoDB(relationshipData) {
    try {
      const db = this.mongoClient.db('swrpg');
      const relationshipCollection = db.collection('faction_relationships');
      const factionCollection = db.collection('factions');

      console.log('🔄 Starting MongoDB faction relationship import...');

      // Import relationship matrix
      const relationshipArray = Object.entries(relationshipData.relationship_matrix).map(([factionId, factionData]) => {
        return {
          faction_id: factionId,
          faction_name: factionData.faction_id,
          tier: this.determineFactionTier(factionId, relationshipData.faction_hierarchy),
          relationships: factionData.relationships || {},
          dual_identity_network: factionData.dual_identity_network || {},
          political_network: factionData.political_network || {},
          military_relationships: factionData.military_relationships || {},
          personal_bonds: factionData.personal_bonds || {},
          partnership_bonds: factionData.partnership_bonds || {},
          criminal_connections: factionData.criminal_connections || {},
          rebel_integration: factionData.rebel_integration || {},
          last_updated: new Date(),
          version: relationshipData.metadata.version
        };
      });

      const relationshipResult = await relationshipCollection.insertMany(relationshipArray, { ordered: false });
      console.log(`✅ MongoDB: Imported ${relationshipResult.insertedCount} faction relationship profiles`);

      // Update existing factions with enhancement data
      let factionUpdateCount = 0;
      
      // Import political dynamics
      if (relationshipData.political_dynamics) {
        const politicalDoc = {
          type: 'political_dynamics',
          data: relationshipData.political_dynamics,
          last_updated: new Date(),
          version: relationshipData.metadata.version
        };
        await db.collection('political_dynamics').insertOne(politicalDoc);
      }

      // Import relationship evolution data
      if (relationshipData.relationship_evolution) {
        const evolutionDoc = {
          type: 'relationship_evolution',
          data: relationshipData.relationship_evolution,
          last_updated: new Date(),
          version: relationshipData.metadata.version
        };
        await db.collection('relationship_evolution').insertOne(evolutionDoc);
      }

      // Create indexes for performance
      await relationshipCollection.createIndex({ faction_id: 1 });
      await relationshipCollection.createIndex({ faction_name: 1 });
      await relationshipCollection.createIndex({ tier: 1 });
      await relationshipCollection.createIndex({ 'relationships.type': 1 });
      
      console.log('✅ MongoDB: Created performance indexes for faction relationships');
      
      return relationshipResult;
    } catch (error) {
      console.error('❌ MongoDB faction relationship import failed:', error.message);
      throw error;
    }
  }

  determineFactionTier(factionId, hierarchy) {
    for (const [tier, factions] of Object.entries(hierarchy)) {
      if (factions.some(faction => faction.toLowerCase().replace(/\s+/g, '_') === factionId)) {
        return tier;
      }
    }
    return 'tier_4_local_independent'; // default
  }

  async importToNeo4j(relationshipData) {
    try {
      const session = this.neo4jDriver.session();
      
      console.log('🔄 Starting Neo4j faction relationship import...');

      try {
        let relationshipCount = 0;

        // Import faction relationships as Neo4j relationships
        for (const [factionId, factionData] of Object.entries(relationshipData.relationship_matrix)) {
          
          // Ensure faction node exists
          const factionQuery = `
            MERGE (f:Faction {id: $factionId})
            SET f.name = $factionName,
                f.tier = $tier,
                f.enhancement_version = "1.0",
                f.last_updated = datetime()
            RETURN f
          `;
          
          await session.run(factionQuery, {
            factionId: factionId,
            factionName: factionData.faction_id,
            tier: this.determineFactionTier(factionId, relationshipData.faction_hierarchy)
          });

          // Create relationships with other factions
          if (factionData.relationships) {
            for (const [targetFactionKey, relationship] of Object.entries(factionData.relationships)) {
              
              // Create target faction node
              const targetFactionQuery = `
                MERGE (target:Faction {id: $targetFactionId})
                SET target.name = $targetFactionName
                RETURN target
              `;
              
              const targetFactionName = targetFactionKey.replace(/_/g, ' ')
                .replace(/\b\w/g, char => char.toUpperCase());
              
              await session.run(targetFactionQuery, {
                targetFactionId: targetFactionKey,
                targetFactionName: targetFactionName
              });

              // Create relationship between factions
              const relationshipQuery = `
                MATCH (source:Faction {id: $sourceFactionId})
                MATCH (target:Faction {id: $targetFactionId})
                MERGE (source)-[r:FACTION_RELATIONSHIP {
                  type: $relationshipType,
                  intensity: $intensity,
                  description: $description,
                  evolution: $evolution,
                  benefits: $benefits,
                  tensions: $tensions,
                  strategic_approach: $strategicApproach
                }]->(target)
                RETURN r
              `;
              
              await session.run(relationshipQuery, {
                sourceFactionId: factionId,
                targetFactionId: targetFactionKey,
                relationshipType: relationship.type || 'Unknown',
                intensity: relationship.intensity || '',
                description: relationship.description || '',
                evolution: relationship.evolution || '',
                benefits: relationship.benefits || '',
                tensions: relationship.tensions || '',
                strategicApproach: relationship.strategic_approach || ''
              });

              relationshipCount++;
            }
          }
        }

        // Create alliance group relationships
        const allianceGroups = [
          {
            name: 'Rebel Coalition',
            members: ['rebel_alliance', 'royal_house_alderaan', 'jedi_order', 'ewoks'],
            type: 'ALLIANCE'
          },
          {
            name: 'Imperial Hierarchy',
            members: ['galactic_empire', 'imperial_navy', 'imperial_army', 'death_star_command', 'sith_order'],
            type: 'HIERARCHY'
          },
          {
            name: 'Criminal Underworld',
            members: ['hutt_cartel', 'bounty_hunters_guild'],
            type: 'CRIMINAL_NETWORK'
          }
        ];

        for (const group of allianceGroups) {
          // Create alliance group node
          const groupQuery = `
            MERGE (g:AllianceGroup {name: $groupName})
            SET g.type = $groupType,
                g.enhancement_version = "1.0",
                g.last_updated = datetime()
            RETURN g
          `;
          
          await session.run(groupQuery, {
            groupName: group.name,
            groupType: group.type
          });

          // Connect factions to alliance group
          for (const memberId of group.members) {
            const memberQuery = `
              MATCH (g:AllianceGroup {name: $groupName})
              MATCH (f:Faction {id: $factionId})
              MERGE (f)-[:MEMBER_OF {group_type: $groupType}]->(g)
            `;
            
            await session.run(memberQuery, {
              groupName: group.name,
              factionId: memberId,
              groupType: group.type
            });
          }
        }

        console.log(`✅ Neo4j: Created ${relationshipCount} faction relationships and 3 alliance groups`);
        
      } finally {
        await session.close();
      }
    } catch (error) {
      console.error('❌ Neo4j faction relationship import failed:', error.message);
      throw error;
    }
  }

  async validateImport() {
    try {
      console.log('🔍 Validating faction relationship import...');

      // Validate MongoDB
      const db = this.mongoClient.db('swrpg');
      const relationshipCollection = db.collection('faction_relationships');
      const mongoCount = await relationshipCollection.countDocuments({ version: '1.0' });
      console.log(`📊 MongoDB: Found ${mongoCount} faction relationship profiles`);

      // Validate Neo4j
      const session = this.neo4jDriver.session();
      try {
        // Count faction nodes
        const factionResult = await session.run('MATCH (f:Faction {enhancement_version: "1.0"}) RETURN count(f) as count');
        const factionCount = factionResult.records[0].get('count').toNumber();
        console.log(`📊 Neo4j: Found ${factionCount} enhanced faction nodes`);

        // Count faction relationships
        const relationshipResult = await session.run(`
          MATCH ()-[r:FACTION_RELATIONSHIP]->()
          RETURN count(r) as count
        `);
        const relationshipCount = relationshipResult.records[0].get('count').toNumber();
        console.log(`📊 Neo4j: Found ${relationshipCount} faction relationships`);

        // Count alliance groups
        const allianceResult = await session.run(`
          MATCH (g:AllianceGroup {enhancement_version: "1.0"})
          RETURN g.name as group_name, g.type as group_type
        `);
        
        console.log('📊 Alliance Groups:');
        allianceResult.records.forEach(record => {
          console.log(`  - ${record.get('group_name')} (${record.get('group_type')})`);
        });

        // Analyze relationship types
        const typeResult = await session.run(`
          MATCH ()-[r:FACTION_RELATIONSHIP]->()
          RETURN r.type as relationship_type, count(r) as count
          ORDER BY count DESC LIMIT 10
        `);
        
        console.log('📊 Relationship Types:');
        typeResult.records.forEach(record => {
          console.log(`  - ${record.get('relationship_type')}: ${record.get('count')}`);
        });

      } finally {
        await session.close();
      }

      if (mongoCount > 0 && factionCount > 0) {
        console.log('✅ Faction relationship import validation successful');
        return true;
      } else {
        console.log('❌ Faction relationship import validation failed - missing data');
        return false;
      }

    } catch (error) {
      console.error('❌ Faction relationship import validation failed:', error.message);
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
      console.log('🚀 Starting Faction Relationship Matrix Import');
      console.log('=============================================');

      await this.initialize();
      
      const relationshipData = await this.loadFactionRelationshipData();
      
      await this.importToMongoDB(relationshipData);
      await this.importToNeo4j(relationshipData);
      
      const validationSuccess = await this.validateImport();
      
      if (validationSuccess) {
        console.log('🎉 Faction relationship matrix import completed successfully!');
      } else {
        console.log('⚠️  Import completed with validation warnings');
      }

    } catch (error) {
      console.error('💥 Faction relationship import failed:', error.message);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the import if this file is executed directly
if (require.main === module) {
  const importer = new FactionRelationshipImporter();
  importer.run().catch(console.error);
}

module.exports = FactionRelationshipImporter;