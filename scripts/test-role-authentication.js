const { MongoClient, ObjectId } = require('mongodb');

// Test Role-Based Authentication System
// ===================================

async function testRoleAuthentication() {
    console.log('🛡️  Testing Role-Based Authentication System');
    console.log('============================================');
    
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/swrpg?authSource=admin';
    const client = new MongoClient(MONGODB_URI);
    
    try {
        await client.connect();
        const db = client.db();
        const usersCollection = db.collection('users');
        
        console.log('\n1. Creating test users with different roles...');
        
        // Create admin user
        const adminUser = {
            username: 'testadmin',
            email: 'admin@test.com',
            passwordHash: 'test:hash', // Not real hash for testing
            roles: ['admin'],
            createdAt: new Date(),
            lastActive: new Date(),
            preferences: {
                theme: 'dark'
            }
        };
        
        // Create premium user
        const premiumUser = {
            username: 'testpremium',
            email: 'premium@test.com',
            passwordHash: 'test:hash',
            roles: ['premium'],
            createdAt: new Date(),
            lastActive: new Date(),
            preferences: {
                theme: 'dark'
            }
        };
        
        // Create moderator user
        const moderatorUser = {
            username: 'testmoderator',
            email: 'moderator@test.com',
            passwordHash: 'test:hash',
            roles: ['moderator'],
            createdAt: new Date(),
            lastActive: new Date(),
            preferences: {
                theme: 'dark'
            }
        };
        
        // Insert test users (update if exists)
        await usersCollection.replaceOne(
            { username: 'testadmin' },
            adminUser,
            { upsert: true }
        );
        
        await usersCollection.replaceOne(
            { username: 'testpremium' },
            premiumUser,
            { upsert: true }
        );
        
        await usersCollection.replaceOne(
            { username: 'testmoderator' },
            moderatorUser,
            { upsert: true }
        );
        
        console.log('✅ Created test users:');
        console.log('   - testadmin (admin role)');
        console.log('   - testpremium (premium role)');
        console.log('   - testmoderator (moderator role)');
        
        console.log('\n2. Verifying role assignments...');
        
        const roles = await usersCollection.find(
            { username: { $in: ['testadmin', 'testpremium', 'testmoderator'] } },
            { projection: { username: 1, roles: 1 } }
        ).toArray();
        
        roles.forEach(user => {
            console.log(`   ${user.username}: ${user.roles.join(', ')}`);
        });
        
        console.log('\n3. Role-based authentication system is ready for testing!');
        console.log('\nNext steps:');
        console.log('- Login with these test users');
        console.log('- Test different permission levels');
        console.log('- Verify admin routes are protected');
        
        console.log('\n4. Authentication endpoints to test:');
        console.log('POST /api/auth/login with testadmin:TestPass123');
        console.log('GET  /api/admin/users (admin only)');
        console.log('GET  /api/settings (requires authentication)');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        throw error;
    } finally {
        await client.close();
    }
}

// Run the test
testRoleAuthentication()
    .then(() => {
        console.log('\n🎉 Role authentication setup complete!');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n💥 Setup failed:', error);
        process.exit(1);
    });