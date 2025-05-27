#!/usr/bin/env node

/**
 * Cross-Database Reference Validation and Integrity Testing
 * Validates data consistency across Neo4j, MongoDB, and Weaviate
 */

const fs = require('fs').promises;
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

class DatabaseIntegrityValidator {
  constructor() {
    this.neo4jDriver = null;
    this.mongoClient = null;
    this.weaviateClient = null;
    this.validationResults = {
      passed: 0,
      failed: 0,
      warnings: 0,
      issues: []
    };
  }

  async initialize() {
    console.log('🔧 Initializing database connections for validation...');
    
    try {
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
    } catch (error) {
      console.error('❌ Failed to initialize database connections:', error);
      throw error;
    }
  }

  async validateDataConsistency() {
    console.log('🔍 Running cross-database consistency validation...');
    
    await this.validateCharacterReferences();
    await this.validateLocationReferences();
    await this.validateFactionReferences();
    await this.validateSchemaConsistency();
    await this.validateDataIntegrity();
    await this.validatePerformanceMetrics();
  }

  async validateCharacterReferences() {
    console.log('\n👤 Validating character data consistency...');
    
    try {
      // Get characters from Neo4j
      const neo4jCharacters = await this.getNeo4jCharacters();
      
      // Get character references from Weaviate
      const weaviateCharacters = await this.getWeaviateCharacters();
      
      // Cross-reference validation
      const neo4jNames = new Set(neo4jCharacters.map(c => c.name));
      const weaviateNames = new Set(weaviateCharacters.map(c => this.extractNameFromContent(c.content)));
      
      // Check for missing references
      const missingInWeaviate = [...neo4jNames].filter(name => !weaviateNames.has(name));
      const orphanedInWeaviate = [...weaviateNames].filter(name => name && !neo4jNames.has(name));
      
      if (missingInWeaviate.length > 0) {
        this.addIssue('warning', 'Characters missing in Weaviate', 
          `${missingInWeaviate.length} characters exist in Neo4j but not in Weaviate: ${missingInWeaviate.slice(0, 3).join(', ')}${missingInWeaviate.length > 3 ? '...' : ''}`);
      }
      
      if (orphanedInWeaviate.length > 0) {
        this.addIssue('warning', 'Orphaned characters in Weaviate', 
          `${orphanedInWeaviate.length} character references in Weaviate not found in Neo4j`);
      }
      
      if (missingInWeaviate.length === 0 && orphanedInWeaviate.length === 0) {
        this.addPass('Character references are consistent across databases');
      }
      
      console.log(`  📊 Neo4j characters: ${neo4jCharacters.length}`);
      console.log(`  📊 Weaviate character references: ${weaviateCharacters.length}`);
      console.log(`  ${missingInWeaviate.length === 0 && orphanedInWeaviate.length === 0 ? '✅' : '⚠️'} Character reference validation complete`);
      
    } catch (error) {
      this.addIssue('error', 'Character validation failed', error.message);
    }
  }

  async validateLocationReferences() {
    console.log('\n🌍 Validating location data consistency...');
    
    try {
      const neo4jLocations = await this.getNeo4jLocations();
      const weaviateLocations = await this.getWeaviateLocations();
      
      const neo4jNames = new Set(neo4jLocations.map(l => l.name));
      const weaviateNames = new Set(weaviateLocations.map(l => this.extractNameFromContent(l.content)));
      
      const missingInWeaviate = [...neo4jNames].filter(name => !weaviateNames.has(name));
      
      if (missingInWeaviate.length > 0) {
        this.addIssue('warning', 'Locations missing in Weaviate', 
          `${missingInWeaviate.length} locations exist in Neo4j but not in Weaviate`);
      } else {
        this.addPass('Location references are consistent across databases');
      }
      
      console.log(`  📊 Neo4j locations: ${neo4jLocations.length}`);
      console.log(`  📊 Weaviate location references: ${weaviateLocations.length}`);
      console.log(`  ${missingInWeaviate.length === 0 ? '✅' : '⚠️'} Location reference validation complete`);
      
    } catch (error) {
      this.addIssue('error', 'Location validation failed', error.message);
    }
  }

  async validateFactionReferences() {
    console.log('\n🏛️ Validating faction data consistency...');
    
    try {
      const neo4jFactions = await this.getNeo4jFactions();
      const weaviateFactions = await this.getWeaviateFactions();
      
      const neo4jNames = new Set(neo4jFactions.map(f => f.name));
      const weaviateNames = new Set(weaviateFactions.map(f => this.extractNameFromContent(f.content)));
      
      const missingInWeaviate = [...neo4jNames].filter(name => !weaviateNames.has(name));
      
      if (missingInWeaviate.length > 0) {
        this.addIssue('warning', 'Factions missing in Weaviate', 
          `${missingInWeaviate.length} factions exist in Neo4j but not in Weaviate`);
      } else {
        this.addPass('Faction references are consistent across databases');
      }
      
      console.log(`  📊 Neo4j factions: ${neo4jFactions.length}`);
      console.log(`  📊 Weaviate faction references: ${weaviateFactions.length}`);
      console.log(`  ${missingInWeaviate.length === 0 ? '✅' : '⚠️'} Faction reference validation complete`);
      
    } catch (error) {
      this.addIssue('error', 'Faction validation failed', error.message);
    }
  }

  async validateSchemaConsistency() {
    console.log('\n📋 Validating schema consistency...');
    
    try {
      // Check Neo4j constraints
      const neo4jConstraints = await this.getNeo4jConstraints();
      
      // Check Weaviate schema
      const weaviateSchema = await this.getWeaviateSchema();
      
      // Validate required classes exist
      const requiredClasses = ['WorldKnowledge', 'StoryEvent', 'NarrativeElement', 'PlotTemplate', 'CharacterResponse'];
      const existingClasses = weaviateSchema.classes.map(c => c.class);
      const missingClasses = requiredClasses.filter(cls => !existingClasses.includes(cls));
      
      if (missingClasses.length > 0) {
        this.addIssue('error', 'Missing Weaviate classes', `Required classes missing: ${missingClasses.join(', ')}`);
      } else {
        this.addPass('All required Weaviate classes exist');
      }
      
      // Validate required fields exist
      const worldKnowledgeClass = weaviateSchema.classes.find(c => c.class === 'WorldKnowledge');
      if (worldKnowledgeClass) {
        const requiredFields = ['title', 'content', 'category', 'era', 'canonicity', 'importance'];
        const existingFields = worldKnowledgeClass.properties.map(p => p.name);
        const missingFields = requiredFields.filter(field => !existingFields.includes(field));
        
        if (missingFields.length > 0) {
          this.addIssue('error', 'Missing WorldKnowledge fields', `Required fields missing: ${missingFields.join(', ')}`);
        } else {
          this.addPass('WorldKnowledge class has all required fields');
        }
      }
      
      console.log(`  📊 Neo4j constraints: ${neo4jConstraints.length}`);
      console.log(`  📊 Weaviate classes: ${existingClasses.length}`);
      console.log(`  ${missingClasses.length === 0 ? '✅' : '❌'} Schema consistency validation complete`);
      
    } catch (error) {
      this.addIssue('error', 'Schema validation failed', error.message);
    }
  }

  async validateDataIntegrity() {
    console.log('\n🔒 Validating data integrity...');
    
    try {
      // Check for duplicate entries in Neo4j
      const duplicateCharacters = await this.findDuplicateCharacters();
      const duplicateLocations = await this.findDuplicateLocations();
      
      if (duplicateCharacters.length > 0) {
        this.addIssue('warning', 'Duplicate characters found', `${duplicateCharacters.length} duplicate character names detected`);
      }
      
      if (duplicateLocations.length > 0) {
        this.addIssue('warning', 'Duplicate locations found', `${duplicateLocations.length} duplicate location names detected`);
      }
      
      // Check for orphaned relationships
      const orphanedRelationships = await this.findOrphanedRelationships();
      if (orphanedRelationships.length > 0) {
        this.addIssue('warning', 'Orphaned relationships found', `${orphanedRelationships.length} relationships with missing nodes`);
      }
      
      if (duplicateCharacters.length === 0 && duplicateLocations.length === 0 && orphanedRelationships.length === 0) {
        this.addPass('Data integrity checks passed');
      }
      
      console.log(`  ${duplicateCharacters.length === 0 && duplicateLocations.length === 0 && orphanedRelationships.length === 0 ? '✅' : '⚠️'} Data integrity validation complete`);
      
    } catch (error) {
      this.addIssue('error', 'Data integrity validation failed', error.message);
    }
  }

  async validatePerformanceMetrics() {
    console.log('\n⚡ Validating performance metrics...');
    
    try {
      // Test Neo4j query performance
      const neo4jStartTime = Date.now();
      await this.getNeo4jCharacters();
      const neo4jDuration = Date.now() - neo4jStartTime;
      
      // Test Weaviate query performance
      const weaviateStartTime = Date.now();
      await this.getWeaviateCharacters();
      const weaviateDuration = Date.now() - weaviateStartTime;
      
      // Test MongoDB query performance (if we have session data)
      const mongoStartTime = Date.now();
      const db = this.mongoClient.db('swrpg_sessions');
      await db.collection('messages').find({}).limit(10).toArray();
      const mongoDuration = Date.now() - mongoStartTime;
      
      // Performance thresholds (in milliseconds)
      const SLOW_QUERY_THRESHOLD = 1000;
      
      if (neo4jDuration > SLOW_QUERY_THRESHOLD) {
        this.addIssue('warning', 'Slow Neo4j queries', `Query took ${neo4jDuration}ms (threshold: ${SLOW_QUERY_THRESHOLD}ms)`);
      }
      
      if (weaviateDuration > SLOW_QUERY_THRESHOLD) {
        this.addIssue('warning', 'Slow Weaviate queries', `Query took ${weaviateDuration}ms (threshold: ${SLOW_QUERY_THRESHOLD}ms)`);
      }
      
      if (mongoDuration > SLOW_QUERY_THRESHOLD) {
        this.addIssue('warning', 'Slow MongoDB queries', `Query took ${mongoDuration}ms (threshold: ${SLOW_QUERY_THRESHOLD}ms)`);
      }
      
      console.log(`  📊 Neo4j query time: ${neo4jDuration}ms`);
      console.log(`  📊 Weaviate query time: ${weaviateDuration}ms`);
      console.log(`  📊 MongoDB query time: ${mongoDuration}ms`);
      console.log(`  ${neo4jDuration <= SLOW_QUERY_THRESHOLD && weaviateDuration <= SLOW_QUERY_THRESHOLD && mongoDuration <= SLOW_QUERY_THRESHOLD ? '✅' : '⚠️'} Performance validation complete`);
      
    } catch (error) {
      this.addIssue('error', 'Performance validation failed', error.message);
    }
  }

  // Helper methods for database queries
  async getNeo4jCharacters() {
    const session = this.neo4jDriver.session();
    try {
      const result = await session.run('MATCH (c:Character) RETURN c.name as name, c.species as species, c.affiliations as affiliations');
      return result.records.map(record => ({
        name: record.get('name'),
        species: record.get('species'),
        affiliations: record.get('affiliations')
      }));
    } finally {
      await session.close();
    }
  }

  async getNeo4jLocations() {
    const session = this.neo4jDriver.session();
    try {
      const result = await session.run('MATCH (l:Location) RETURN l.name as name, l.region as region');
      return result.records.map(record => ({
        name: record.get('name'),
        region: record.get('region')
      }));
    } finally {
      await session.close();
    }
  }

  async getNeo4jFactions() {
    const session = this.neo4jDriver.session();
    try {
      const result = await session.run('MATCH (f:Faction) RETURN f.name as name, f.type as type');
      return result.records.map(record => ({
        name: record.get('name'),
        type: record.get('type')
      }));
    } finally {
      await session.close();
    }
  }

  async getWeaviateCharacters() {
    try {
      const result = await this.weaviateClient.graphql
        .get()
        .withClassName('WorldKnowledge')
        .withFields('title content category')
        .withWhere({
          path: ['category'],
          operator: 'Equal',
          valueString: 'character'
        })
        .do();
      return result.data?.Get?.WorldKnowledge || [];
    } catch (error) {
      return [];
    }
  }

  async getWeaviateLocations() {
    try {
      const result = await this.weaviateClient.graphql
        .get()
        .withClassName('WorldKnowledge')
        .withFields('title content category')
        .withWhere({
          path: ['category'],
          operator: 'Equal',
          valueString: 'location'
        })
        .do();
      return result.data?.Get?.WorldKnowledge || [];
    } catch (error) {
      return [];
    }
  }

  async getWeaviateFactions() {
    try {
      const result = await this.weaviateClient.graphql
        .get()
        .withClassName('WorldKnowledge')
        .withFields('title content category')
        .withWhere({
          path: ['category'],
          operator: 'Equal',
          valueString: 'faction'
        })
        .do();
      return result.data?.Get?.WorldKnowledge || [];
    } catch (error) {
      return [];
    }
  }

  async getNeo4jConstraints() {
    const session = this.neo4jDriver.session();
    try {
      const result = await session.run('SHOW CONSTRAINTS');
      return result.records;
    } catch (error) {
      return [];
    } finally {
      await session.close();
    }
  }

  async getWeaviateSchema() {
    try {
      return await this.weaviateClient.schema.getter().do();
    } catch (error) {
      return { classes: [] };
    }
  }

  async findDuplicateCharacters() {
    const session = this.neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (c:Character) WITH c.name as name, count(*) as count WHERE count > 1 RETURN name, count'
      );
      return result.records.map(record => ({
        name: record.get('name'),
        count: record.get('count').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  async findDuplicateLocations() {
    const session = this.neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (l:Location) WITH l.name as name, count(*) as count WHERE count > 1 RETURN name, count'
      );
      return result.records.map(record => ({
        name: record.get('name'),
        count: record.get('count').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  async findOrphanedRelationships() {
    const session = this.neo4jDriver.session();
    try {
      const result = await session.run(
        'MATCH (a)-[r]->(b) WHERE a IS NULL OR b IS NULL RETURN count(r) as orphaned_count'
      );
      const count = result.records[0]?.get('orphaned_count')?.toNumber() || 0;
      return count > 0 ? [{ count }] : [];
    } finally {
      await session.close();
    }
  }

  extractNameFromContent(content) {
    if (!content) return null;
    // Extract name from content like "Luke Skywalker is a character..."
    const match = content.match(/^([^.]+?) is a/);
    return match ? match[1].trim() : null;
  }

  // Utility methods for tracking validation results
  addPass(message) {
    this.validationResults.passed++;
    console.log(`    ✅ ${message}`);
  }

  addIssue(type, title, description) {
    if (type === 'error') {
      this.validationResults.failed++;
      console.log(`    ❌ ${title}: ${description}`);
    } else {
      this.validationResults.warnings++;
      console.log(`    ⚠️  ${title}: ${description}`);
    }
    
    this.validationResults.issues.push({
      type,
      title,
      description,
      timestamp: new Date().toISOString()
    });
  }

  async generateReport() {
    console.log('\n📊 Validation Report');
    console.log('=====================');
    console.log(`✅ Passed: ${this.validationResults.passed}`);
    console.log(`⚠️  Warnings: ${this.validationResults.warnings}`);
    console.log(`❌ Failed: ${this.validationResults.failed}`);
    
    if (this.validationResults.issues.length > 0) {
      console.log('\n🔍 Issues Found:');
      this.validationResults.issues.forEach((issue, index) => {
        const icon = issue.type === 'error' ? '❌' : '⚠️';
        console.log(`  ${index + 1}. ${icon} ${issue.title}`);
        console.log(`     ${issue.description}`);
      });
    }
    
    const overallStatus = this.validationResults.failed === 0 ? 'PASS' : 'FAIL';
    const statusIcon = overallStatus === 'PASS' ? '✅' : '❌';
    
    console.log(`\n${statusIcon} Overall Status: ${overallStatus}`);
    
    // Write report to file
    const report = {
      timestamp: new Date().toISOString(),
      status: overallStatus,
      summary: {
        passed: this.validationResults.passed,
        warnings: this.validationResults.warnings,
        failed: this.validationResults.failed
      },
      issues: this.validationResults.issues
    };
    
    await fs.writeFile(
      '/home/magic/projects/swrpg-gen/logs/database-integrity-report.json',
      JSON.stringify(report, null, 2)
    );
    
    console.log('📄 Report saved to logs/database-integrity-report.json');
  }

  async cleanup() {
    console.log('\n🧹 Cleaning up connections...');
    
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
      await this.validateDataConsistency();
      await this.generateReport();
    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the validator
const validator = new DatabaseIntegrityValidator();
validator.run();