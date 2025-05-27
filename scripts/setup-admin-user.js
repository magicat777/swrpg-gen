const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

/**
 * Script to create an initial admin user for the SWRPG Generator system
 */
class AdminUserSetup {
  constructor() {
    this.uri = process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/swrpg?authSource=admin';
    this.dbName = process.env.MONGODB_DATABASE || 'swrpg';
    this.client = null;
    this.db = null;
  }

  /**
   * Connect to MongoDB
   */
  async connect() {
    try {
      this.client = new MongoClient(this.uri);
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log('✅ Connected to MongoDB');
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message);
      throw error;
    }
  }

  /**
   * Close MongoDB connection
   */
  async close() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  /**
   * Create admin user
   */
  async createAdminUser(username, email, password) {
    try {
      const usersCollection = this.db.collection('users');

      // Check if admin user already exists
      const existingUser = await usersCollection.findOne({ 
        $or: [{ username }, { email }] 
      });

      if (existingUser) {
        if (existingUser.roles && existingUser.roles.includes('super_admin')) {
          console.log(`⚠️  Super admin user already exists: ${existingUser.username}`);
          return existingUser;
        } else {
          // Upgrade existing user to super admin
          console.log(`📈 Upgrading existing user ${existingUser.username} to super admin...`);
          await usersCollection.updateOne(
            { _id: existingUser._id },
            { 
              $set: { 
                roles: ['super_admin', 'admin', 'moderator', 'premium', 'user'],
                updatedAt: new Date(),
                updatedBy: 'system'
              }
            }
          );
          console.log(`✅ User ${existingUser.username} upgraded to super admin`);
          return existingUser;
        }
      }

      // Hash the password
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

      // Create the admin user
      const adminUser = {
        username,
        email,
        passwordHash: `${salt}:${hash}`,
        createdAt: new Date(),
        lastActive: new Date(),
        roles: ['super_admin', 'admin', 'moderator', 'premium', 'user'],
        status: 'active',
        preferences: {
          theme: 'dark',
          notificationsEnabled: true,
          defaultSettings: {
            era: 'Rebellion Era',
            locale: 'en-US',
            tonePreferences: ['immersive', 'detailed'],
            contentFilters: []
          }
        },
        characters: [],
        savedLocations: [],
        savedItems: [],
        sessionHistory: [],
        meta: {
          isSystemUser: true,
          createdBy: 'setup-script'
        }
      };

      // Insert the admin user
      const result = await usersCollection.insertOne(adminUser);

      if (!result.acknowledged) {
        throw new Error('Failed to create admin user');
      }

      console.log(`✅ Created super admin user: ${username}`);
      console.log(`📧 Email: ${email}`);
      console.log(`🆔 User ID: ${result.insertedId}`);
      console.log(`👑 Roles: ${adminUser.roles.join(', ')}`);

      return {
        ...adminUser,
        _id: result.insertedId
      };

    } catch (error) {
      console.error('❌ Failed to create admin user:', error.message);
      throw error;
    }
  }

  /**
   * Create default user roles and permissions documentation
   */
  async createRoleDocumentation() {
    try {
      const rolesCollection = this.db.collection('systemRoles');

      // Check if documentation already exists
      const existingDoc = await rolesCollection.findOne({ type: 'role_documentation' });
      if (existingDoc) {
        console.log('⚠️  Role documentation already exists');
        return;
      }

      const roleDocumentation = {
        type: 'role_documentation',
        createdAt: new Date(),
        roles: {
          guest: {
            description: 'Unauthenticated users with limited access',
            permissions: ['read_public_content'],
            rateLimit: 10,
            tokenLimit: 100
          },
          user: {
            description: 'Registered users with basic access',
            permissions: ['read_public_content', 'create_session', 'generate_content'],
            rateLimit: 100,
            tokenLimit: 500
          },
          premium: {
            description: 'Premium subscribers with enhanced features',
            permissions: [
              'read_public_content', 'create_session', 'generate_content',
              'advanced_generation', 'batch_generation', 'export_data', 'custom_templates'
            ],
            rateLimit: 500,
            tokenLimit: 2000
          },
          moderator: {
            description: 'Community moderators with content oversight',
            permissions: [
              'read_public_content', 'create_session', 'generate_content',
              'view_user_activity', 'moderate_content', 'manage_reports'
            ],
            rateLimit: 1000,
            tokenLimit: 1000
          },
          admin: {
            description: 'System administrators with management access',
            permissions: [
              'read_public_content', 'create_session', 'generate_content', 'advanced_generation',
              'view_user_activity', 'moderate_content', 'manage_reports',
              'manage_users', 'view_system_stats', 'configure_system'
            ],
            rateLimit: 2000,
            tokenLimit: 2000
          },
          super_admin: {
            description: 'Super administrators with full system access',
            permissions: ['ALL_PERMISSIONS'],
            rateLimit: 'unlimited',
            tokenLimit: 'unlimited'
          }
        }
      };

      await rolesCollection.insertOne(roleDocumentation);
      console.log('✅ Created role documentation');

    } catch (error) {
      console.error('❌ Failed to create role documentation:', error.message);
      throw error;
    }
  }

  /**
   * Setup database indexes for authentication system
   */
  async setupIndexes() {
    try {
      const usersCollection = this.db.collection('users');

      // Create indexes for efficient queries
      await usersCollection.createIndex({ username: 1 }, { unique: true });
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      await usersCollection.createIndex({ roles: 1 });
      await usersCollection.createIndex({ status: 1 });
      await usersCollection.createIndex({ lastActive: 1 });
      await usersCollection.createIndex({ createdAt: 1 });

      console.log('✅ Created authentication database indexes');

    } catch (error) {
      console.error('❌ Failed to create indexes:', error.message);
      throw error;
    }
  }
}

/**
 * Main setup function
 */
async function main() {
  console.log('🚀 Setting up Admin User and Authentication System\n');

  const setup = new AdminUserSetup();

  try {
    await setup.connect();

    // Create admin user
    const adminUser = await setup.createAdminUser(
      'admin',
      'admin@swrpg-gen.local',
      'AdminPassword123!'
    );

    // Create role documentation
    await setup.createRoleDocumentation();

    // Setup database indexes
    await setup.setupIndexes();

    console.log('\n🎉 Admin setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log('   • Super admin user created/upgraded ✅');
    console.log('   • Role documentation created ✅');
    console.log('   • Database indexes created ✅');
    console.log('\n🔐 Admin Login Credentials:');
    console.log(`   Username: admin`);
    console.log(`   Password: AdminPassword123!`);
    console.log(`   Email: admin@swrpg-gen.local`);
    console.log('\n⚠️  Please change the admin password after first login!');

  } catch (error) {
    console.error('\n💥 Setup failed:', error.message);
    process.exit(1);
  } finally {
    await setup.close();
  }
}

// Run setup if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = AdminUserSetup;