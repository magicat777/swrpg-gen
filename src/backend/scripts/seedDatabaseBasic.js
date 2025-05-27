const databaseService = require('../services/databaseService');
const logger = require('../utils/logger');

// Sample data for seeding
const SAMPLE_CHARACTERS = [
  {
    name: 'Luke Skywalker',
    species: 'Human',
    gender: 'Male',
    occupation: 'Jedi Knight',
    affiliation: 'Rebel Alliance',
    forceUser: true,
    alignment: 'Light',
    personalityTraits: ['optimistic', 'determined', 'compassionate'],
    background: 'Farm boy turned Jedi Knight, son of Anakin Skywalker',
    abilities: ['lightsaber combat', 'force sensitivity', 'piloting'],
    equipment: ['lightsaber', 'blaster']
  },
  {
    name: 'Darth Vader',
    species: 'Human',
    gender: 'Male',
    occupation: 'Sith Lord',
    affiliation: 'Galactic Empire',
    forceUser: true,
    alignment: 'Dark',
    personalityTraits: ['intimidating', 'powerful', 'conflicted'],
    background: 'Fallen Jedi Knight, father of Luke Skywalker',
    abilities: ['lightsaber combat', 'force mastery', 'leadership'],
    equipment: ['red lightsaber', 'life support armor']
  },
  {
    name: 'Han Solo',
    species: 'Human',
    gender: 'Male',
    occupation: 'Smuggler',
    affiliation: 'Rebel Alliance',
    forceUser: false,
    alignment: 'Light',
    personalityTraits: ['roguish', 'loyal', 'brave'],
    background: 'Corellian smuggler and pilot of the Millennium Falcon',
    abilities: ['piloting', 'marksmanship', 'charm'],
    equipment: ['DL-44 blaster', 'Millennium Falcon']
  },
  {
    name: 'Princess Leia',
    species: 'Human',
    gender: 'Female',
    occupation: 'Princess/Senator',
    affiliation: 'Rebel Alliance',
    forceUser: true,
    alignment: 'Light',
    personalityTraits: ['strong-willed', 'diplomatic', 'courageous'],
    background: 'Princess of Alderaan and leader in the Rebel Alliance',
    abilities: ['diplomacy', 'leadership', 'force sensitivity'],
    equipment: ['blaster', 'comlink']
  }
];

const SAMPLE_LOCATIONS = [
  {
    name: 'Mos Eisley Cantina',
    type: 'Cantina',
    planet: 'Tatooine',
    system: 'Tatoo System',
    region: 'Outer Rim',
    description: 'A rough spaceport cantina known for its diverse clientele and shady dealings',
    atmosphere: 'seedy',
    features: ['bar', 'music', 'diverse species'],
    dangers: ['criminal activity', 'violence', 'imperial patrols']
  },
  {
    name: 'Death Star',
    type: 'Space Station',
    planet: null,
    system: 'Various',
    region: 'Empire-wide',
    description: 'Massive Imperial battle station with planet-destroying capabilities',
    atmosphere: 'sterile',
    features: ['superlaser', 'TIE fighter bays', 'detention levels'],
    dangers: ['imperial forces', 'execution', 'space combat']
  },
  {
    name: 'Dagobah Swamp',
    type: 'Swamp',
    planet: 'Dagobah',
    system: 'Dagobah System',
    region: 'Outer Rim',
    description: 'Murky swamp planet where Yoda lived in exile',
    atmosphere: 'mystical',
    features: ['dense vegetation', 'swamp creatures', 'force nexus'],
    dangers: ['dangerous wildlife', 'treacherous terrain', 'dark side visions']
  },
  {
    name: 'Cloud City',
    type: 'Mining Colony',
    planet: 'Bespin',
    system: 'Bespin System',
    region: 'Outer Rim',
    description: 'Floating city in the clouds, mining tibanna gas',
    atmosphere: 'luxurious',
    features: ['floating platforms', 'casino', 'carbon freezing chamber'],
    dangers: ['imperial occupation', 'betrayal', 'atmospheric storms']
  }
];

const SAMPLE_FACTIONS = [
  {
    name: 'Rebel Alliance',
    type: 'Military Alliance',
    alignment: 'Light',
    goals: ['Restore the Republic', 'Defeat the Empire', 'Restore freedom'],
    leadership: ['Mon Mothma', 'Admiral Ackbar', 'Princess Leia'],
    resources: ['Starfighter squadrons', 'Intelligence network', 'Hidden bases']
  },
  {
    name: 'Galactic Empire',
    type: 'Authoritarian Government',
    alignment: 'Dark',
    goals: ['Maintain order', 'Expand territory', 'Eliminate rebellion'],
    leadership: ['Emperor Palpatine', 'Darth Vader', 'Grand Moff Tarkin'],
    resources: ['Star Destroyers', 'Stormtroopers', 'Death Star']
  },
  {
    name: 'Jedi Order',
    type: 'Religious Order',
    alignment: 'Light',
    goals: ['Protect peace', 'Serve the Force', 'Train new Jedi'],
    leadership: ['Yoda', 'Obi-Wan Kenobi'],
    resources: ['Force abilities', 'Lightsabers', 'Ancient knowledge']
  },
  {
    name: 'Sith',
    type: 'Religious Order',
    alignment: 'Dark',
    goals: ['Rule the galaxy', 'Destroy the Jedi', 'Embrace the dark side'],
    leadership: ['Emperor Palpatine', 'Darth Vader'],
    resources: ['Dark side powers', 'Red lightsabers', 'Imperial support']
  }
];

/**
 * Seed Neo4j database with sample data
 */
async function seedNeo4j() {
  logger.info('Seeding Neo4j database...');
  
  try {
    // Clear existing data
    await databaseService.neo4j.runQuery('MATCH (n) DETACH DELETE n');
    logger.info('Cleared existing Neo4j data');

    // Create characters
    for (const character of SAMPLE_CHARACTERS) {
      const cypher = `
        CREATE (c:Character {
          name: $name,
          species: $species,
          gender: $gender,
          occupation: $occupation,
          affiliation: $affiliation,
          forceUser: $forceUser,
          alignment: $alignment,
          personalityTraits: $personalityTraits,
          background: $background,
          abilities: $abilities,
          equipment: $equipment,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN c
      `;
      await databaseService.neo4j.runQuery(cypher, character);
    }
    logger.info(`Created ${SAMPLE_CHARACTERS.length} characters`);

    // Create locations
    for (const location of SAMPLE_LOCATIONS) {
      const cypher = `
        CREATE (l:Location {
          name: $name,
          type: $type,
          planet: $planet,
          system: $system,
          region: $region,
          description: $description,
          atmosphere: $atmosphere,
          features: $features,
          dangers: $dangers,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN l
      `;
      await databaseService.neo4j.runQuery(cypher, location);
    }
    logger.info(`Created ${SAMPLE_LOCATIONS.length} locations`);

    // Create factions
    for (const faction of SAMPLE_FACTIONS) {
      const cypher = `
        CREATE (f:Faction {
          name: $name,
          type: $type,
          alignment: $alignment,
          goals: $goals,
          leadership: $leadership,
          resources: $resources,
          createdAt: datetime(),
          updatedAt: datetime()
        })
        RETURN f
      `;
      await databaseService.neo4j.runQuery(cypher, faction);
    }
    logger.info(`Created ${SAMPLE_FACTIONS.length} factions`);

    // Create relationships between characters and factions
    const characterFactionRelationships = [
      { character: 'Luke Skywalker', faction: 'Rebel Alliance', relationship: 'MEMBER_OF' },
      { character: 'Luke Skywalker', faction: 'Jedi Order', relationship: 'MEMBER_OF' },
      { character: 'Darth Vader', faction: 'Galactic Empire', relationship: 'LEADS' },
      { character: 'Darth Vader', faction: 'Sith', relationship: 'MEMBER_OF' },
      { character: 'Han Solo', faction: 'Rebel Alliance', relationship: 'ALLY_OF' },
      { character: 'Princess Leia', faction: 'Rebel Alliance', relationship: 'LEADS' }
    ];

    for (const rel of characterFactionRelationships) {
      const cypher = `
        MATCH (c:Character {name: $character})
        MATCH (f:Faction {name: $faction})
        CREATE (c)-[:${rel.relationship}]->(f)
      `;
      await databaseService.neo4j.runQuery(cypher, rel);
    }
    logger.info(`Created ${characterFactionRelationships.length} character-faction relationships`);

    // Create faction relationships
    const factionRelationships = [
      { faction1: 'Rebel Alliance', faction2: 'Galactic Empire', relationship: 'ENEMY_OF' },
      { faction1: 'Jedi Order', faction2: 'Sith', relationship: 'ENEMY_OF' },
      { faction1: 'Rebel Alliance', faction2: 'Jedi Order', relationship: 'ALLY_OF' },
      { faction1: 'Galactic Empire', faction2: 'Sith', relationship: 'ALLY_OF' }
    ];

    for (const rel of factionRelationships) {
      const cypher = `
        MATCH (f1:Faction {name: $faction1})
        MATCH (f2:Faction {name: $faction2})
        CREATE (f1)-[:${rel.relationship}]->(f2)
      `;
      await databaseService.neo4j.runQuery(cypher, rel);
    }
    logger.info(`Created ${factionRelationships.length} faction relationships`);

    logger.info('Neo4j seeding completed successfully');
  } catch (error) {
    logger.error('Neo4j seeding failed:', error);
    throw error;
  }
}

/**
 * Seed MongoDB database with sample data
 */
async function seedMongoDB() {
  logger.info('Seeding MongoDB database...');
  
  try {
    const sessionsCollection = databaseService.mongodb.getCollection('sessions');
    const messagesCollection = databaseService.mongodb.getCollection('messages');
    const usersCollection = databaseService.mongodb.getCollection('users');
    const worldStatesCollection = databaseService.mongodb.getCollection('worldStates');

    // Clear existing data
    await Promise.all([
      sessionsCollection.deleteMany({}),
      messagesCollection.deleteMany({}),
      usersCollection.deleteMany({}),
      worldStatesCollection.deleteMany({})
    ]);
    logger.info('Cleared existing MongoDB data');

    // Create sample users
    const sampleUsers = [
      {
        userId: 'user1',
        username: 'gamemaster',
        email: 'gm@example.com',
        role: 'GM',
        preferences: {
          theme: 'dark',
          autoSave: true,
          notifications: true
        },
        statistics: {
          sessionsPlayed: 0,
          totalPlayTime: 0,
          favoriteCharacterType: 'Jedi'
        },
        createdAt: new Date(),
        lastLogin: new Date()
      },
      {
        userId: 'user2',
        username: 'player1',
        email: 'player1@example.com',
        role: 'Player',
        preferences: {
          theme: 'light',
          autoSave: true,
          notifications: false
        },
        statistics: {
          sessionsPlayed: 0,
          totalPlayTime: 0,
          favoriteCharacterType: 'Smuggler'
        },
        createdAt: new Date(),
        lastLogin: new Date()
      }
    ];

    await usersCollection.insertMany(sampleUsers);
    logger.info(`Created ${sampleUsers.length} sample users`);

    // Create sample session
    const sampleSession = {
      sessionId: 'session_001',
      title: 'Escape from Tatooine',
      description: 'The heroes must escape the desert planet while avoiding Imperial forces',
      gameSystem: 'Star Wars RPG',
      userId: 'user1',
      participants: ['user1', 'user2'],
      isActive: true,
      messageCount: 0,
      settings: {
        difficulty: 'normal',
        theme: 'classic',
        allowDiceRolls: true
      },
      worldState: {
        currentLocation: 'Mos Eisley Cantina',
        activeCharacters: ['Luke Skywalker', 'Han Solo'],
        currentQuest: 'Find transport off-world'
      },
      createdAt: new Date(),
      lastActivity: new Date()
    };

    await sessionsCollection.insertOne(sampleSession);
    logger.info('Created sample session');

    // Create sample world state
    const sampleWorldState = {
      sessionId: 'session_001',
      timestamp: new Date(),
      state: {
        currentScene: 'Cantina Negotiations',
        activeEvents: ['Imperial patrol approaching'],
        characterStates: {
          'Luke Skywalker': { health: 100, location: 'Mos Eisley Cantina', status: 'ready' },
          'Han Solo': { health: 100, location: 'Mos Eisley Cantina', status: 'negotiating' }
        },
        environmentalFactors: {
          weather: 'clear',
          timeOfDay: 'afternoon',
          alertLevel: 'medium'
        }
      },
      metadata: {
        version: '1.0',
        checksum: 'abc123'
      }
    };

    await worldStatesCollection.insertOne(sampleWorldState);
    logger.info('Created sample world state');

    logger.info('MongoDB seeding completed successfully');
  } catch (error) {
    logger.error('MongoDB seeding failed:', error);
    throw error;
  }
}

/**
 * Verify seeded data
 */
async function verifySeededData() {
  logger.info('Verifying seeded data...');
  
  try {
    // Verify Neo4j data
    const characterCount = await databaseService.neo4j.runQuery('MATCH (c:Character) RETURN count(c) as count');
    const locationCount = await databaseService.neo4j.runQuery('MATCH (l:Location) RETURN count(l) as count');
    const factionCount = await databaseService.neo4j.runQuery('MATCH (f:Faction) RETURN count(f) as count');
    const relationshipCount = await databaseService.neo4j.runQuery('MATCH ()-[r]->() RETURN count(r) as count');
    
    logger.info(`Neo4j verification - Characters: ${characterCount[0].get('count').toNumber()}, Locations: ${locationCount[0].get('count').toNumber()}, Factions: ${factionCount[0].get('count').toNumber()}, Relationships: ${relationshipCount[0].get('count').toNumber()}`);

    // Verify MongoDB data
    const sessionsCount = await databaseService.mongodb.getCollection('sessions').countDocuments();
    const usersCount = await databaseService.mongodb.getCollection('users').countDocuments();
    const worldStatesCount = await databaseService.mongodb.getCollection('worldStates').countDocuments();
    
    logger.info(`MongoDB verification - Sessions: ${sessionsCount}, Users: ${usersCount}, World States: ${worldStatesCount}`);

    logger.info('Data verification completed successfully');
  } catch (error) {
    logger.error('Data verification failed:', error);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    logger.info('Starting basic database seeding process (Neo4j + MongoDB only)...');
    
    // Connect to databases
    await databaseService.mongodb.connect();
    await databaseService.neo4j.connect();
    
    // Seed databases
    await Promise.all([
      seedNeo4j(),
      seedMongoDB()
    ]);
    
    // Verify the seeded data
    await verifySeededData();
    
    logger.info('Database seeding completed successfully!');
    
  } catch (error) {
    logger.error('Database seeding failed:', error);
    throw error;
  } finally {
    // Disconnect from databases
    await databaseService.mongodb.disconnect();
    await databaseService.neo4j.disconnect();
  }
}

// Export functions for potential individual use
module.exports = {
  seedDatabase,
  seedNeo4j,
  seedMongoDB,
  verifySeededData
};

// Run seeding if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      logger.info('Basic seeding script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Basic seeding script failed:', error);
      process.exit(1);
    });
}