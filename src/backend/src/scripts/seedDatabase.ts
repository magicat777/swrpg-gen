#!/usr/bin/env ts-node

/**
 * Database seeding script for Star Wars RPG Generator
 * Populates Neo4j, MongoDB, and Weaviate with initial data
 */

import neo4jService from '../services/neo4jService';
import mongodbService from '../services/mongodbService';
import weaviateService from '../services/weaviateService';
import databaseService from '../services/databaseService';
import { logger } from '../utils/logger';

// Star Wars data for seeding
const SAMPLE_CHARACTERS = [
  {
    name: 'Luke Skywalker',
    species: 'Human',
    gender: 'Male',
    occupation: 'Jedi Knight',
    affiliation: 'Rebel Alliance',
    forceUser: true,
    alignment: 'Light',
    personality: ['Brave', 'Idealistic', 'Determined'],
    background: 'Farm boy from Tatooine who became a Jedi and helped destroy the Death Star'
  },
  {
    name: 'Darth Vader',
    species: 'Human',
    gender: 'Male',
    occupation: 'Sith Lord',
    affiliation: 'Galactic Empire',
    forceUser: true,
    alignment: 'Dark',
    personality: ['Imposing', 'Ruthless', 'Conflicted'],
    background: 'Former Jedi who fell to the dark side and became the Emperor\'s right hand'
  },
  {
    name: 'Han Solo',
    species: 'Human',
    gender: 'Male',
    occupation: 'Smuggler',
    affiliation: 'Independent',
    forceUser: false,
    alignment: 'Neutral',
    personality: ['Charming', 'Roguish', 'Loyal'],
    background: 'Smuggler who joined the Rebellion and captains the Millennium Falcon'
  },
  {
    name: 'Princess Leia Organa',
    species: 'Human',
    gender: 'Female',
    occupation: 'Diplomat',
    affiliation: 'Rebel Alliance',
    forceUser: true,
    alignment: 'Light',
    personality: ['Leader', 'Determined', 'Diplomatic'],
    background: 'Princess of Alderaan and leader in the Rebel Alliance'
  }
];

const SAMPLE_LOCATIONS = [
  {
    name: 'Mos Eisley Cantina',
    type: 'Cantina',
    planet: 'Tatooine',
    region: 'Mos Eisley',
    description: 'A wretched hive of scum and villainy where smugglers and criminals gather',
    atmosphere: 'Seedy',
    population: 200,
    government: 'Independent'
  },
  {
    name: 'Death Star',
    type: 'Space Station',
    planet: 'Mobile',
    region: 'Deep Space',
    description: 'Massive Imperial battle station capable of destroying entire planets',
    atmosphere: 'Military',
    population: 1000000,
    government: 'Imperial'
  },
  {
    name: 'Cloud City',
    type: 'Mining Colony',
    planet: 'Bespin',
    region: 'Upper Atmosphere',
    description: 'Floating city in the clouds, known for tibanna gas mining',
    atmosphere: 'Luxurious',
    population: 50000,
    government: 'Independent'
  }
];

const SAMPLE_FACTIONS = [
  {
    name: 'Rebel Alliance',
    allegiance: 'Light',
    type: 'Military Organization',
    description: 'Coalition fighting against the tyrannical Galactic Empire',
    goals: ['Restore the Republic', 'Defeat the Empire', 'Bring freedom to the galaxy'],
    resources: 'Limited but growing',
    territory: 'Hidden bases throughout the galaxy',
    leaderName: 'Mon Mothma'
  },
  {
    name: 'Galactic Empire',
    allegiance: 'Dark',
    type: 'Government',
    description: 'Authoritarian regime ruling the galaxy through fear and oppression',
    goals: ['Maintain order', 'Crush rebellion', 'Rule through fear'],
    resources: 'Vast military and industrial capacity',
    territory: 'Most of the known galaxy',
    leaderName: 'Emperor Palpatine'
  },
  {
    name: 'Jedi Order',
    allegiance: 'Light',
    type: 'Religious Order',
    description: 'Ancient order of Force-sensitive peacekeepers',
    goals: ['Maintain peace', 'Serve the Force', 'Protect the innocent'],
    resources: 'Nearly extinct',
    territory: 'None (in hiding)',
    leaderName: 'Yoda'
  }
];

const SAMPLE_WORLD_KNOWLEDGE = [
  {
    title: 'The Force',
    content: 'The Force is an energy field created by all living things. It surrounds us, penetrates us, and binds the galaxy together. Those sensitive to the Force can use it to enhance their abilities.',
    category: 'Mysticism',
    era: 'All Eras',
    canonicity: 'canon',
    importance: 10,
    source: 'Original Trilogy',
    tags: ['Force', 'Jedi', 'Sith', 'mysticism']
  },
  {
    title: 'Lightsabers',
    content: 'Elegant weapons from a more civilized age. Lightsabers are energy swords used by Jedi and Sith, powered by kyber crystals that focus the Force.',
    category: 'Technology',
    era: 'All Eras',
    canonicity: 'canon',
    importance: 9,
    source: 'Original Trilogy',
    tags: ['lightsaber', 'weapon', 'Jedi', 'Sith', 'kyber crystal']
  },
  {
    title: 'Hyperspace Travel',
    content: 'Faster-than-light travel is achieved by entering hyperspace, an alternate dimension where ships can travel at incredible speeds between star systems.',
    category: 'Technology',
    era: 'All Eras',
    canonicity: 'canon',
    importance: 8,
    source: 'Original Trilogy',
    tags: ['hyperspace', 'travel', 'technology', 'space']
  }
];

const SAMPLE_STORY_EVENTS = [
  {
    title: 'Battle of Yavin',
    description: 'The Rebel Alliance\'s desperate assault on the Death Star, resulting in its destruction and a major victory against the Empire.',
    participants: ['Luke Skywalker', 'Han Solo', 'Princess Leia'],
    location: 'Yavin 4',
    era: 'Imperial Era',
    type: 'Battle',
    importance: 10,
    consequences: 'Death Star destroyed, major blow to Imperial morale',
    tags: ['battle', 'Death Star', 'Rebel Alliance', 'victory']
  },
  {
    title: 'Rescue from Cloud City',
    description: 'Han Solo is rescued from Jabba\'s palace after being frozen in carbonite, leading to a dangerous mission.',
    participants: ['Luke Skywalker', 'Princess Leia', 'Chewbacca'],
    location: 'Tatooine',
    era: 'Imperial Era',
    type: 'Rescue Mission',
    importance: 7,
    consequences: 'Han Solo freed, Jabba the Hutt killed',
    tags: ['rescue', 'Jabba', 'carbonite', 'Tatooine']
  }
];

const SAMPLE_NARRATIVE_ELEMENTS = [
  {
    title: 'Cantina Atmosphere',
    content: 'The smoky cantina fills with the sound of alien music and hushed conversations. Eyes follow your every move as you navigate between tables of suspicious characters.',
    type: 'description',
    tone: 'tense',
    useContext: 'When characters enter a seedy establishment',
    quality: 8,
    tags: ['cantina', 'atmosphere', 'seedy', 'suspicious']
  },
  {
    title: 'Force Awakening',
    content: 'Something stirs within you - a tingling sensation, as if the very air around you has become charged with energy. The Force is strong here.',
    type: 'description',
    tone: 'mystical',
    useContext: 'When a character first senses the Force',
    quality: 9,
    tags: ['Force', 'awakening', 'mystical', 'power']
  }
];

const SAMPLE_PLOT_TEMPLATES = [
  {
    title: 'Rescue Mission',
    summary: 'A vital ally has been captured and must be rescued from enemy territory',
    structure: '1. Learn of capture, 2. Gather intelligence, 3. Plan infiltration, 4. Execute rescue, 5. Escape pursuit',
    type: 'rescue',
    complexity: 'moderate',
    recommendedLength: 'single session',
    challenges: 'Infiltration, combat, time pressure, chase sequences',
    tags: ['rescue', 'infiltration', 'teamwork']
  },
  {
    title: 'Imperial Heist',
    summary: 'Steal vital information or equipment from an Imperial facility',
    structure: '1. Identify target, 2. Reconnaissance, 3. Acquire equipment, 4. Infiltrate facility, 5. Obtain objective, 6. Escape',
    type: 'heist',
    complexity: 'complex',
    recommendedLength: 'multi-session',
    challenges: 'Security systems, Imperial forces, stealth, technical expertise',
    tags: ['heist', 'Imperial', 'stealth', 'technical']
  }
];

class DatabaseSeeder {
  async seedAll(): Promise<void> {
    logger.info('Starting database seeding process...');

    try {
      // Initialize all database connections
      await databaseService.initialize();

      // Initialize schemas
      await this.initializeSchemas();

      // Seed Neo4j with graph data
      await this.seedNeo4j();

      // Seed MongoDB with session data
      await this.seedMongoDB();

      // Seed Weaviate with knowledge data
      await this.seedWeaviate();

      logger.info('Database seeding completed successfully');
    } catch (error) {
      logger.error('Database seeding failed', { error });
      throw error;
    }
  }

  private async initializeSchemas(): Promise<void> {
    logger.info('Initializing database schemas...');

    await Promise.all([
      neo4jService.initializeSchema(),
      mongodbService.initializeDatabase(),
      weaviateService.initializeSchema()
    ]);

    logger.info('Database schemas initialized');
  }

  private async seedNeo4j(): Promise<void> {
    logger.info('Seeding Neo4j with characters, locations, and factions...');

    // Create characters
    for (const character of SAMPLE_CHARACTERS) {
      try {
        const created = await neo4jService.createCharacter(character);
        logger.debug(`Created character: ${created.name}`);
      } catch (error) {
        logger.warn(`Failed to create character ${character.name}`, { error });
      }
    }

    // Create locations
    for (const location of SAMPLE_LOCATIONS) {
      try {
        const created = await neo4jService.createLocation(location);
        logger.debug(`Created location: ${created.name}`);
      } catch (error) {
        logger.warn(`Failed to create location ${location.name}`, { error });
      }
    }

    // Create factions
    for (const faction of SAMPLE_FACTIONS) {
      try {
        const created = await neo4jService.createFaction(faction);
        logger.debug(`Created faction: ${created.name}`);
      } catch (error) {
        logger.warn(`Failed to create faction ${faction.name}`, { error });
      }
    }

    // Create some relationships
    try {
      await neo4jService.createCharacterFactionRelationship('Luke Skywalker', 'Rebel Alliance', 'Member');
      await neo4jService.createCharacterFactionRelationship('Princess Leia Organa', 'Rebel Alliance', 'Leader');
      await neo4jService.createCharacterFactionRelationship('Darth Vader', 'Galactic Empire', 'Enforcer');
      await neo4jService.createCharacterRelationship('Luke Skywalker', 'Darth Vader', 'FATHER_OF', { revealed: true });
      await neo4jService.createCharacterRelationship('Han Solo', 'Princess Leia Organa', 'ROMANTIC_INTEREST', { mutual: true });
      
      logger.info('Created character and faction relationships');
    } catch (error) {
      logger.warn('Some relationships could not be created', { error });
    }

    logger.info('Neo4j seeding completed');
  }

  private async seedMongoDB(): Promise<void> {
    logger.info('Seeding MongoDB with sample sessions and users...');

    // Create a sample user (for demonstration)
    try {
      const usersCollection = mongodbService.getUsersCollection();
      const existingUser = await usersCollection.findOne({ username: 'demo_user' });
      
      if (!existingUser) {
        const user = {
          username: 'demo_user',
          email: 'demo@swrpg.com',
          passwordHash: 'demo:hash',
          createdAt: new Date(),
          lastActive: new Date(),
          preferences: {
            theme: 'dark',
            defaultEra: 'Imperial Era',
            notificationsEnabled: true
          },
          roles: ['user']
        };

        const result = await usersCollection.insertOne(user);
        const userId = result.insertedId.toString();

        // Create a sample session
        const session = await mongodbService.createSession({
          userId,
          title: 'Escape from Tatooine',
          description: 'The heroes must escape Imperial forces on the desert planet',
          settings: {
            era: 'Imperial Era',
            difficulty: 'moderate',
            theme: 'adventure',
            allowForceUsers: true
          }
        });

        // Add sample messages
        await mongodbService.addMessage({
          sessionId: session._id.toString(),
          sender: {
            type: 'user',
            name: 'Game Master',
            id: userId
          },
          content: 'The twin suns of Tatooine beat down mercilessly as you emerge from the cantina...',
          type: 'narrative'
        });

        logger.info('Created sample user and session');
      }
    } catch (error) {
      logger.warn('Failed to create sample MongoDB data', { error });
    }

    logger.info('MongoDB seeding completed');
  }

  private async seedWeaviate(): Promise<void> {
    logger.info('Seeding Weaviate with knowledge base...');

    try {
      // Store world knowledge
      for (const knowledge of SAMPLE_WORLD_KNOWLEDGE) {
        const id = await weaviateService.storeWorldKnowledge(knowledge);
        logger.debug(`Stored world knowledge: ${knowledge.title} (${id})`);
      }

      // Store story events
      for (const event of SAMPLE_STORY_EVENTS) {
        const id = await weaviateService.storeStoryEvent(event);
        logger.debug(`Stored story event: ${event.title} (${id})`);
      }

      // Store narrative elements
      for (const element of SAMPLE_NARRATIVE_ELEMENTS) {
        const id = await weaviateService.storeNarrativeElement(element);
        logger.debug(`Stored narrative element: ${element.title} (${id})`);
      }

      // Store plot templates
      for (const template of SAMPLE_PLOT_TEMPLATES) {
        const id = await weaviateService.storePlotTemplate(template);
        logger.debug(`Stored plot template: ${template.title} (${id})`);
      }

      logger.info('Weaviate seeding completed');
    } catch (error) {
      logger.warn('Failed to seed Weaviate data', { error });
    }
  }

  async verifySeeding(): Promise<void> {
    logger.info('Verifying seeded data...');

    try {
      // Verify Neo4j data
      const characters = await neo4jService.findCharacters();
      const locations = await neo4jService.findLocations();
      const factions = await neo4jService.findFactions();

      logger.info(`Neo4j verification: ${characters.length} characters, ${locations.length} locations, ${factions.length} factions`);

      // Verify Weaviate data
      const knowledgeSearch = await weaviateService.findWorldKnowledge('Force');
      const eventSearch = await weaviateService.findSimilarStoryEvents('battle');

      logger.info(`Weaviate verification: Found ${knowledgeSearch.length} knowledge entries, ${eventSearch.length} story events`);

      logger.info('Data verification completed successfully');
    } catch (error) {
      logger.error('Data verification failed', { error });
    }
  }
}

// Main execution function
async function main() {
  const seeder = new DatabaseSeeder();
  
  try {
    await seeder.seedAll();
    await seeder.verifySeeding();
    logger.info('Database seeding and verification completed successfully');
  } catch (error) {
    logger.error('Seeding process failed', { error });
    process.exit(1);
  } finally {
    // Close database connections
    await databaseService.shutdown();
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    logger.error('Unhandled error in seeding script', { error });
    process.exit(1);
  });
}

export default DatabaseSeeder;