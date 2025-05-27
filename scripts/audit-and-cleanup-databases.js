#!/usr/bin/env node

/**
 * Database Audit and Cleanup Script
 * Identifies duplicates, validates data integrity, and provides cleanup options
 */

const { MongoClient } = require('mongodb');
const neo4j = require('neo4j-driver');

// Configuration
const MONGODB_URI = 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';
const NEO4J_URI = 'bolt://localhost:7687';
const NEO4J_USER = 'neo4j';
const NEO4J_PASSWORD = 'password';

class DatabaseAuditor {
    constructor() {
        this.mongoClient = null;
        this.neo4jDriver = null;
        this.results = {
            mongodb: {
                characters: { total: 0, duplicates: [], nullNames: [] },
                locations: { total: 0, duplicates: [], nullNames: [] },
                factions: { total: 0, duplicates: [], nullNames: [] }
            },
            neo4j: {
                characters: { total: 0, duplicates: [] },
                locations: { total: 0, duplicates: [] },
                factions: { total: 0, duplicates: [] }
            },
            crossReference: {
                mismatches: []
            }
        };
    }

    async connect() {
        try {
            // Connect to MongoDB
            this.mongoClient = new MongoClient(MONGODB_URI);
            await this.mongoClient.connect();
            console.log('✅ Connected to MongoDB');

            // Connect to Neo4j
            this.neo4jDriver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));
            await this.neo4jDriver.verifyConnectivity();
            console.log('✅ Connected to Neo4j');
        } catch (error) {
            console.error('❌ Database connection failed:', error.message);
            throw error;
        }
    }

    async auditMongoDB() {
        console.log('\n🔍 Auditing MongoDB collections...');
        const db = this.mongoClient.db('swrpg');
        
        const collections = ['characters', 'locations', 'factions'];
        
        for (const collectionName of collections) {
            console.log(`\n📋 Auditing ${collectionName}...`);
            const collection = db.collection(collectionName);
            
            // Get total count
            const total = await collection.countDocuments();
            this.results.mongodb[collectionName].total = total;
            console.log(`   Total documents: ${total}`);
            
            // Find duplicates by name
            const duplicates = await collection.aggregate([
                { $group: { _id: '$name', count: { $sum: 1 }, docs: { $push: '$$ROOT' } } },
                { $match: { count: { $gt: 1 } } },
                { $sort: { _id: 1 } }
            ]).toArray();
            
            this.results.mongodb[collectionName].duplicates = duplicates;
            
            if (duplicates.length > 0) {
                console.log(`   ⚠️  Found ${duplicates.length} duplicate name groups:`);
                duplicates.forEach(dup => {
                    console.log(`      "${dup._id}": ${dup.count} copies`);
                });
            } else {
                console.log('   ✅ No duplicates found');
            }
            
            // Find documents with null/empty names
            const nullNames = await collection.find({
                $or: [
                    { name: null },
                    { name: '' },
                    { name: { $exists: false } }
                ]
            }).toArray();
            
            this.results.mongodb[collectionName].nullNames = nullNames;
            
            if (nullNames.length > 0) {
                console.log(`   ⚠️  Found ${nullNames.length} documents with null/empty names`);
            }
        }
    }

    async auditNeo4j() {
        console.log('\n🔍 Auditing Neo4j nodes...');
        const session = this.neo4jDriver.session();
        
        try {
            const nodeTypes = ['Character', 'Location', 'Faction'];
            
            for (const nodeType of nodeTypes) {
                console.log(`\n📋 Auditing ${nodeType} nodes...`);
                
                // Get total count
                const countResult = await session.run(
                    `MATCH (n:${nodeType}) RETURN count(n) as total`
                );
                const total = countResult.records[0].get('total').toNumber();
                this.results.neo4j[nodeType.toLowerCase() + 's'].total = total;
                console.log(`   Total nodes: ${total}`);
                
                // Find duplicates by name
                const duplicatesResult = await session.run(`
                    MATCH (n:${nodeType})
                    WITH n.name as name, collect(n) as nodes
                    WHERE size(nodes) > 1 AND name IS NOT NULL
                    RETURN name, size(nodes) as count
                    ORDER BY name
                `);
                
                const duplicates = duplicatesResult.records.map(record => ({
                    name: record.get('name'),
                    count: record.get('count').toNumber()
                }));
                
                this.results.neo4j[nodeType.toLowerCase() + 's'].duplicates = duplicates;
                
                if (duplicates.length > 0) {
                    console.log(`   ⚠️  Found ${duplicates.length} duplicate name groups:`);
                    duplicates.forEach(dup => {
                        console.log(`      "${dup.name}": ${dup.count} copies`);
                    });
                } else {
                    console.log('   ✅ No duplicates found');
                }
            }
        } finally {
            await session.close();
        }
    }

    async crossReferenceAudit() {
        console.log('\n🔍 Cross-referencing between databases...');
        
        // This would compare names between MongoDB and Neo4j to find mismatches
        // For now, just log the concept
        console.log('   📊 Cross-reference audit would compare:');
        console.log('      - Character names between MongoDB and Neo4j');
        console.log('      - Location names between MongoDB and Neo4j');
        console.log('      - Faction names between MongoDB and Neo4j');
        console.log('   ℹ️  Implementation pending based on cleanup requirements');
    }

    async generateReport() {
        console.log('\n📊 AUDIT REPORT SUMMARY');
        console.log('========================');
        
        console.log('\n📚 MongoDB Collections:');
        Object.entries(this.results.mongodb).forEach(([collection, data]) => {
            console.log(`   ${collection.toUpperCase()}:`);
            console.log(`     Total: ${data.total}`);
            console.log(`     Duplicates: ${data.duplicates.length} groups`);
            console.log(`     Null names: ${data.nullNames.length}`);
        });
        
        console.log('\n🕸️  Neo4j Nodes:');
        Object.entries(this.results.neo4j).forEach(([nodeType, data]) => {
            console.log(`   ${nodeType.toUpperCase()}:`);
            console.log(`     Total: ${data.total}`);
            console.log(`     Duplicates: ${data.duplicates.length} groups`);
        });
        
        // Calculate overall health
        const totalDuplicateGroups = 
            Object.values(this.results.mongodb).reduce((sum, data) => sum + data.duplicates.length, 0) +
            Object.values(this.results.neo4j).reduce((sum, data) => sum + data.duplicates.length, 0);
        
        const totalNullNames = Object.values(this.results.mongodb).reduce((sum, data) => sum + data.nullNames.length, 0);
        
        console.log('\n🏥 DATABASE HEALTH:');
        if (totalDuplicateGroups === 0 && totalNullNames === 0) {
            console.log('   ✅ HEALTHY - No duplicates or data quality issues found');
        } else {
            console.log(`   ⚠️  NEEDS ATTENTION - ${totalDuplicateGroups} duplicate groups, ${totalNullNames} null names`);
        }
        
        return this.results;
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
    const auditor = new DatabaseAuditor();
    
    try {
        await auditor.connect();
        await auditor.auditMongoDB();
        await auditor.auditNeo4j();
        await auditor.crossReferenceAudit();
        const results = await auditor.generateReport();
        
        // Write results to file
        const fs = require('fs');
        const reportPath = '/home/magic/projects/swrpg-gen/logs/database-audit-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
        
    } catch (error) {
        console.error('❌ Audit failed:', error.message);
        process.exit(1);
    } finally {
        await auditor.close();
    }
}

if (require.main === module) {
    main();
}

module.exports = DatabaseAuditor;