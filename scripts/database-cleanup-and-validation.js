#!/usr/bin/env node

/**
 * Database Cleanup and Validation System
 * Removes duplicates, creates canonical dataset, and implements validation
 */

const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');
const fs = require('fs');

// Configuration
const MONGODB_URI = 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';
const NEO4J_URI = 'bolt://localhost:7687';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = 'password';

// Canonical Star Wars Dataset (15 each)
const CANONICAL_CHARACTERS = [
    {
        name: "Luke Skywalker",
        species: "Human",
        homeworld: "Tatooine",
        affiliation: "Rebel Alliance",
        forceUser: true,
        description: "A young farm boy who becomes a powerful Jedi Knight and helps destroy the Death Star."
    },
    {
        name: "Leia Organa",
        species: "Human", 
        homeworld: "Alderaan",
        affiliation: "Rebel Alliance",
        forceUser: true,
        description: "Princess of Alderaan and leader of the Rebel Alliance against the Empire."
    },
    {
        name: "Han Solo",
        species: "Human",
        homeworld: "Corellia", 
        affiliation: "Rebel Alliance",
        forceUser: false,
        description: "Smuggler captain of the Millennium Falcon who joins the Rebel Alliance."
    },
    {
        name: "Darth Vader",
        species: "Human",
        homeworld: "Tatooine",
        affiliation: "Galactic Empire",
        forceUser: true,
        description: "Dark Lord of the Sith and enforcer of the Emperor's will."
    },
    {
        name: "Obi-Wan Kenobi",
        species: "Human",
        homeworld: "Stewjon",
        affiliation: "Jedi Order",
        forceUser: true,
        description: "Jedi Master who trained Anakin Skywalker and later Luke Skywalker."
    },
    {
        name: "Yoda",
        species: "Unknown",
        homeworld: "Dagobah",
        affiliation: "Jedi Order",
        forceUser: true,
        description: "Ancient and powerful Jedi Master, teacher of many Jedi."
    },
    {
        name: "Chewbacca",
        species: "Wookiee",
        homeworld: "Kashyyyk",
        affiliation: "Rebel Alliance", 
        forceUser: false,
        description: "Loyal Wookiee companion and co-pilot of the Millennium Falcon."
    },
    {
        name: "C-3PO",
        species: "Droid",
        homeworld: "Tatooine",
        affiliation: "Rebel Alliance",
        forceUser: false,
        description: "Protocol droid fluent in over six million forms of communication."
    },
    {
        name: "R2-D2",
        species: "Droid", 
        homeworld: "Naboo",
        affiliation: "Rebel Alliance",
        forceUser: false,
        description: "Astromech droid and loyal companion throughout the galaxy's conflicts."
    },
    {
        name: "Emperor Palpatine",
        species: "Human",
        homeworld: "Naboo",
        affiliation: "Galactic Empire",
        forceUser: true,
        description: "Dark Lord of the Sith who manipulated the Republic's fall and rules the Empire."
    },
    {
        name: "Boba Fett",
        species: "Human",
        homeworld: "Kamino",
        affiliation: "Independent",
        forceUser: false,
        description: "Notorious bounty hunter with Mandalorian armor."
    },
    {
        name: "Lando Calrissian", 
        species: "Human",
        homeworld: "Socorro",
        affiliation: "Rebel Alliance",
        forceUser: false,
        description: "Administrator of Cloud City and smuggler who joins the Rebellion."
    },
    {
        name: "Jabba the Hutt",
        species: "Hutt",
        homeworld: "Nal Hutta",
        affiliation: "Hutt Cartel",
        forceUser: false,
        description: "Powerful crime lord who controls much of the Outer Rim's underworld."
    },
    {
        name: "Grand Moff Tarkin",
        species: "Human",
        homeworld: "Eriadu",
        affiliation: "Galactic Empire",
        forceUser: false,
        description: "High-ranking Imperial officer who commanded the first Death Star."
    },
    {
        name: "Owen Lars",
        species: "Human", 
        homeworld: "Tatooine",
        affiliation: "Independent",
        forceUser: false,
        description: "Moisture farmer on Tatooine who raised Luke Skywalker."
    }
];

const CANONICAL_LOCATIONS = [
    {
        name: "Tatooine",
        type: "Planet",
        region: "Outer Rim",
        climate: "Arid",
        terrain: "Desert",
        description: "Twin-sunned desert world, home to moisture farmers and the infamous Mos Eisley cantina."
    },
    {
        name: "Hoth",
        type: "Planet", 
        region: "Outer Rim",
        climate: "Frozen",
        terrain: "Ice plains, mountains",
        description: "Frozen wasteland that served as the Rebel Alliance's Echo Base."
    },
    {
        name: "Endor",
        type: "Moon",
        region: "Outer Rim", 
        climate: "Temperate",
        terrain: "Forest",
        description: "Forest moon inhabited by Ewoks, site of the second Death Star's destruction."
    },
    {
        name: "Dagobah",
        type: "Planet",
        region: "Outer Rim",
        climate: "Murky",
        terrain: "Swamp, jungle",
        description: "Swamp world where Jedi Master Yoda lived in exile."
    },
    {
        name: "Alderaan",
        type: "Planet",
        region: "Core Worlds",
        climate: "Temperate",
        terrain: "Grasslands, mountains",
        description: "Peaceful world destroyed by the Death Star, former home of Princess Leia."
    },
    {
        name: "Coruscant",
        type: "Planet",
        region: "Core Worlds", 
        climate: "Temperate",
        terrain: "Cityscape",
        description: "Galaxy-spanning city and capital of both the Republic and Empire."
    },
    {
        name: "Death Star",
        type: "Space Station",
        region: "Mobile",
        climate: "Artificial",
        terrain: "Metal corridors",
        description: "Massive space station with planet-destroying capabilities."
    },
    {
        name: "Cloud City",
        type: "City",
        region: "Outer Rim",
        climate: "Temperate",
        terrain: "Floating platforms",
        description: "Tibanna gas mining facility floating in Bespin's atmosphere."
    },
    {
        name: "Mos Eisley",
        type: "City",
        region: "Outer Rim",
        climate: "Arid", 
        terrain: "Desert settlement",
        description: "Spaceport cantina known as a wretched hive of scum and villainy."
    },
    {
        name: "Jabba's Palace",
        type: "Structure",
        region: "Outer Rim",
        climate: "Arid",
        terrain: "Desert fortress", 
        description: "Fortress of the crime lord Jabba the Hutt on Tatooine."
    },
    {
        name: "Echo Base",
        type: "Military Base",
        region: "Outer Rim",
        climate: "Frozen",
        terrain: "Ice caves",
        description: "Hidden Rebel Alliance base on the ice planet Hoth."
    },
    {
        name: "Yavin 4",
        type: "Moon",
        region: "Outer Rim",
        climate: "Temperate",
        terrain: "Jungle, temples",
        description: "Jungle moon housing the Rebel Alliance base and ancient Massassi temples."
    },
    {
        name: "Kashyyyk", 
        type: "Planet",
        region: "Mid Rim",
        climate: "Temperate",
        terrain: "Forest, tree cities",
        description: "Forest world and homeworld of the Wookiees."
    },
    {
        name: "Naboo",
        type: "Planet",
        region: "Mid Rim",
        climate: "Temperate", 
        terrain: "Plains, swamps",
        description: "Peaceful world with underwater Gungan cities and surface human settlements."
    },
    {
        name: "Kamino",
        type: "Planet",
        region: "Extragalactic",
        climate: "Stormy",
        terrain: "Ocean, platforms",
        description: "Water world known for its advanced cloning facilities."
    }
];

const CANONICAL_FACTIONS = [
    {
        name: "Rebel Alliance",
        type: "Military",
        alignment: "Light",
        era: "Galactic Civil War",
        description: "Coalition of rebels fighting against the tyrannical Galactic Empire."
    },
    {
        name: "Galactic Empire", 
        type: "Government",
        alignment: "Dark",
        era: "Galactic Civil War",
        description: "Autocratic regime that rules the galaxy through fear and oppression."
    },
    {
        name: "Jedi Order",
        type: "Religious",
        alignment: "Light", 
        era: "Multiple",
        description: "Ancient order of Force-users dedicated to peace and justice."
    },
    {
        name: "Sith",
        type: "Religious",
        alignment: "Dark",
        era: "Multiple", 
        description: "Dark side Force-users who seek power through passion and conflict."
    },
    {
        name: "Hutt Cartel",
        type: "Criminal",
        alignment: "Neutral",
        era: "Multiple",
        description: "Crime syndicate controlled by the Hutt species."
    },
    {
        name: "Bounty Hunters Guild",
        type: "Professional",
        alignment: "Neutral",
        era: "Multiple",
        description: "Organization of mercenaries and bounty hunters."
    },
    {
        name: "Imperial Navy",
        type: "Military", 
        alignment: "Dark",
        era: "Galactic Civil War",
        description: "Space fleet of the Galactic Empire."
    },
    {
        name: "Rebel Fleet",
        type: "Military",
        alignment: "Light",
        era: "Galactic Civil War",
        description: "Naval forces of the Rebel Alliance."
    },
    {
        name: "Mandalorians",
        type: "Cultural",
        alignment: "Neutral",
        era: "Multiple",
        description: "Warrior culture known for their distinctive armor and combat skills."
    },
    {
        name: "Ewoks",
        type: "Species",
        alignment: "Light", 
        era: "Galactic Civil War",
        description: "Primitive but brave teddy bear-like species from Endor."
    },
    {
        name: "Wookiees",
        type: "Species", 
        alignment: "Light",
        era: "Multiple",
        description: "Tall, furry species known for their loyalty and strength."
    },
    {
        name: "Tusken Raiders",
        type: "Tribal",
        alignment: "Neutral",
        era: "Multiple",
        description: "Nomadic people of Tatooine, also known as Sand People."
    },
    {
        name: "Jawas",
        type: "Species",
        alignment: "Neutral",
        era: "Multiple", 
        description: "Small scavengers who trade in droids and technology on Tatooine."
    },
    {
        name: "Cloud City Administration",
        type: "Government",
        alignment: "Neutral",
        era: "Galactic Civil War",
        description: "Local government of the tibanna gas mining operation."
    },
    {
        name: "Coruscant Underworld",
        type: "Criminal",
        alignment: "Dark",
        era: "Multiple",
        description: "Criminal organizations operating in the lower levels of Coruscant."
    }
];

class DatabaseCleaner {
    constructor() {
        this.mongoClient = null;
        this.neo4jDriver = null;
    }

    async connect() {
        try {
            this.mongoClient = new MongoClient(MONGODB_URI);
            await this.mongoClient.connect();
            console.log('✅ Connected to MongoDB');

            this.neo4jDriver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
            await this.neo4jDriver.verifyConnectivity();
            console.log('✅ Connected to Neo4j');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async cleanMongoDB() {
        console.log('\n🧹 Cleaning MongoDB collections...');
        const db = this.mongoClient.db('swrpg');
        
        const collections = ['characters', 'locations', 'factions'];
        
        for (const collectionName of collections) {
            console.log(`   Dropping ${collectionName} collection...`);
            try {
                await db.collection(collectionName).drop();
                console.log(`   ✅ Dropped ${collectionName}`);
            } catch (error) {
                if (error.message.includes('ns not found')) {
                    console.log(`   ℹ️  Collection ${collectionName} didn't exist`);
                } else {
                    throw error;
                }
            }
        }
    }

    async cleanNeo4j() {
        console.log('\n🧹 Cleaning Neo4j nodes...');
        const session = this.neo4jDriver.session();
        
        try {
            // Delete all nodes and relationships
            await session.run('MATCH (n) DETACH DELETE n');
            console.log('   ✅ Cleared all Neo4j nodes and relationships');
        } finally {
            await session.close();
        }
    }

    async seedMongoDB() {
        console.log('\n🌱 Seeding MongoDB with canonical data...');
        const db = this.mongoClient.db('swrpg');
        
        // Create collections with validation
        await this.createValidatedCollections(db);
        
        // Insert canonical data
        const collections = [
            { name: 'characters', data: CANONICAL_CHARACTERS },
            { name: 'locations', data: CANONICAL_LOCATIONS },
            { name: 'factions', data: CANONICAL_FACTIONS }
        ];
        
        for (const collection of collections) {
            console.log(`   Inserting ${collection.data.length} ${collection.name}...`);
            
            // Add metadata to each document
            const documentsWithMetadata = collection.data.map(doc => ({
                ...doc,
                id: doc.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
                createdAt: new Date(),
                updatedAt: new Date(),
                canonical: true,
                verified: true
            }));
            
            await db.collection(collection.name).insertMany(documentsWithMetadata);
            console.log(`   ✅ Inserted ${collection.data.length} ${collection.name}`);
        }
    }

    async createValidatedCollections(db) {
        console.log('   📋 Creating collections with validation schemas...');
        
        // Character schema
        await db.createCollection('characters', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'species', 'homeworld', 'affiliation', 'forceUser'],
                    properties: {
                        name: { bsonType: 'string', minLength: 1 },
                        species: { bsonType: 'string', minLength: 1 },
                        homeworld: { bsonType: 'string', minLength: 1 },
                        affiliation: { bsonType: 'string', minLength: 1 },
                        forceUser: { bsonType: 'bool' },
                        description: { bsonType: 'string' },
                        canonical: { bsonType: 'bool' },
                        verified: { bsonType: 'bool' }
                    }
                }
            }
        });
        
        // Location schema  
        await db.createCollection('locations', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'type', 'region', 'climate', 'terrain'],
                    properties: {
                        name: { bsonType: 'string', minLength: 1 },
                        type: { bsonType: 'string', minLength: 1 },
                        region: { bsonType: 'string', minLength: 1 },
                        climate: { bsonType: 'string', minLength: 1 },
                        terrain: { bsonType: 'string', minLength: 1 },
                        description: { bsonType: 'string' },
                        canonical: { bsonType: 'bool' },
                        verified: { bsonType: 'bool' }
                    }
                }
            }
        });
        
        // Faction schema
        await db.createCollection('factions', {
            validator: {
                $jsonSchema: {
                    bsonType: 'object',
                    required: ['name', 'type', 'alignment', 'era'],
                    properties: {
                        name: { bsonType: 'string', minLength: 1 },
                        type: { bsonType: 'string', minLength: 1 },
                        alignment: { bsonType: 'string', enum: ['Light', 'Dark', 'Neutral'] },
                        era: { bsonType: 'string', minLength: 1 },
                        description: { bsonType: 'string' },
                        canonical: { bsonType: 'bool' },
                        verified: { bsonType: 'bool' }
                    }
                }
            }
        });
        
        console.log('   ✅ Created validated collections');
    }

    async createIndexes(db) {
        console.log('   🔍 Creating unique indexes...');
        
        // Create unique indexes on names to prevent duplicates
        await db.collection('characters').createIndex({ name: 1 }, { unique: true });
        await db.collection('locations').createIndex({ name: 1 }, { unique: true });
        await db.collection('factions').createIndex({ name: 1 }, { unique: true });
        
        // Create indexes on other commonly queried fields
        await db.collection('characters').createIndex({ species: 1 });
        await db.collection('characters').createIndex({ affiliation: 1 });
        await db.collection('characters').createIndex({ forceUser: 1 });
        
        await db.collection('locations').createIndex({ type: 1 });
        await db.collection('locations').createIndex({ region: 1 });
        
        await db.collection('factions').createIndex({ type: 1 });
        await db.collection('factions').createIndex({ alignment: 1 });
        
        console.log('   ✅ Created indexes');
    }

    async seedNeo4j() {
        console.log('\n🌱 Seeding Neo4j with canonical data...');
        const session = this.neo4jDriver.session();
        
        try {
            // Create unique constraints
            await this.createNeo4jConstraints(session);
            
            // Create character nodes
            console.log('   Creating Character nodes...');
            for (const char of CANONICAL_CHARACTERS) {
                await session.run(`
                    CREATE (c:Character {
                        name: $name,
                        species: $species, 
                        homeworld: $homeworld,
                        affiliation: $affiliation,
                        forceUser: $forceUser,
                        description: $description,
                        canonical: true,
                        verified: true,
                        createdAt: datetime()
                    })
                `, char);
            }
            
            // Create location nodes
            console.log('   Creating Location nodes...');
            for (const location of CANONICAL_LOCATIONS) {
                await session.run(`
                    CREATE (l:Location {
                        name: $name,
                        type: $type,
                        region: $region, 
                        climate: $climate,
                        terrain: $terrain,
                        description: $description,
                        canonical: true,
                        verified: true,
                        createdAt: datetime()
                    })
                `, location);
            }
            
            // Create faction nodes
            console.log('   Creating Faction nodes...');
            for (const faction of CANONICAL_FACTIONS) {
                await session.run(`
                    CREATE (f:Faction {
                        name: $name,
                        type: $type,
                        alignment: $alignment,
                        era: $era, 
                        description: $description,
                        canonical: true,
                        verified: true,
                        createdAt: datetime()
                    })
                `, faction);
            }
            
            // Create relationships
            await this.createNeo4jRelationships(session);
            
            console.log('   ✅ Seeded Neo4j with canonical data');
            
        } finally {
            await session.close();
        }
    }

    async createNeo4jConstraints(session) {
        console.log('   📋 Creating Neo4j constraints...');
        
        const constraints = [
            'CREATE CONSTRAINT character_name_unique IF NOT EXISTS FOR (c:Character) REQUIRE c.name IS UNIQUE',
            'CREATE CONSTRAINT location_name_unique IF NOT EXISTS FOR (l:Location) REQUIRE l.name IS UNIQUE', 
            'CREATE CONSTRAINT faction_name_unique IF NOT EXISTS FOR (f:Faction) REQUIRE f.name IS UNIQUE'
        ];
        
        for (const constraint of constraints) {
            try {
                await session.run(constraint);
            } catch (error) {
                if (!error.message.includes('already exists')) {
                    throw error;
                }
            }
        }
        
        console.log('   ✅ Created Neo4j constraints');
    }

    async createNeo4jRelationships(session) {
        console.log('   🔗 Creating relationships...');
        
        // Character-Homeworld relationships
        await session.run(`
            MATCH (c:Character), (l:Location)
            WHERE c.homeworld = l.name
            CREATE (c)-[:BORN_ON]->(l)
        `);
        
        // Character-Faction relationships  
        await session.run(`
            MATCH (c:Character), (f:Faction)
            WHERE c.affiliation = f.name
            CREATE (c)-[:MEMBER_OF]->(f)
        `);
        
        // Location-Region relationships (create star systems)
        const systems = ['Tatooine System', 'Hoth System', 'Endor System'];
        for (const system of systems) {
            await session.run(`
                CREATE (s:StarSystem {name: $system, canonical: true})
            `, { system });
        }
        
        console.log('   ✅ Created relationships');
    }

    async validateData() {
        console.log('\n✅ Validating cleaned data...');
        
        // MongoDB validation
        const db = this.mongoClient.db('swrpg');
        const mongoResults = {
            characters: await db.collection('characters').countDocuments(),
            locations: await db.collection('locations').countDocuments(), 
            factions: await db.collection('factions').countDocuments()
        };
        
        // Neo4j validation
        const session = this.neo4jDriver.session();
        let neo4jResults;
        try {
            const result = await session.run(`
                MATCH (c:Character) WITH count(c) as characters
                MATCH (l:Location) WITH characters, count(l) as locations  
                MATCH (f:Faction) WITH characters, locations, count(f) as factions
                RETURN characters, locations, factions
            `);
            
            const record = result.records[0];
            neo4jResults = {
                characters: record.get('characters').toNumber(),
                locations: record.get('locations').toNumber(),
                factions: record.get('factions').toNumber()
            };
        } finally {
            await session.close();
        }
        
        console.log('📊 Final counts:');
        console.log(`   MongoDB: ${mongoResults.characters} characters, ${mongoResults.locations} locations, ${mongoResults.factions} factions`);
        console.log(`   Neo4j: ${neo4jResults.characters} characters, ${neo4jResults.locations} locations, ${neo4jResults.factions} factions`);
        
        const success = 
            mongoResults.characters === 15 && mongoResults.locations === 15 && mongoResults.factions === 15 &&
            neo4jResults.characters === 15 && neo4jResults.locations === 15 && neo4jResults.factions === 15;
            
        if (success) {
            console.log('✅ All databases contain exactly 15 canonical entries each');
            return true;
        } else {
            console.log('❌ Database counts do not match expected values');
            return false;
        }
    }

    async close() {
        if (this.mongoClient) {
            await this.mongoClient.close();
            console.log('🔌 Disconnected from MongoDB');
        }
        if (this.neo4jDriver) {
            await this.neo4jDriver.close();
            console.log('🔌 Disconnected from Neo4j');
        }
    }
}

// Main execution
async function main() {
    const cleaner = new DatabaseCleaner();
    
    try {
        console.log('🚀 Starting database cleanup and reinitialization...');
        await cleaner.connect();
        
        // Clean existing data
        await cleaner.cleanMongoDB();
        await cleaner.cleanNeo4j();
        
        // Seed with canonical data
        await cleaner.seedMongoDB();
        await cleaner.seedNeo4j();
        
        // Create indexes after seeding MongoDB
        const db = cleaner.mongoClient.db('swrpg');
        await cleaner.createIndexes(db);
        
        // Validate results
        const success = await cleaner.validateData();
        
        if (success) {
            console.log('\n🎉 Database cleanup and reinitialization completed successfully!');
            console.log('✨ All databases now contain clean, canonical Star Wars data');
            console.log('🛡️  Validation schemas and unique constraints are in place');
        } else {
            console.log('\n❌ Cleanup completed with errors - please check the data');
            process.exit(1);
        }
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        process.exit(1);
    } finally {
        await cleaner.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = DatabaseCleaner;