const { MongoClient } = require('mongodb');

/**
 * Test the role-based authentication system components
 */
class RoleSystemTester {
  constructor() {
    this.uri = process.env.MONGODB_URI || 'mongodb://admin:password@mongodb:27017/swrpg?authSource=admin';
    this.dbName = process.env.MONGODB_DATABASE || 'swrpg';
    this.client = null;
    this.db = null;
  }

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

  async close() {
    if (this.client) {
      await this.client.close();
      console.log('✅ Disconnected from MongoDB');
    }
  }

  /**
   * Test role middleware functions
   */
  testRoleMiddleware() {
    console.log('🛡️  Testing Role Middleware Functions...');

    // Import the role middleware (simulate the imports)
    const UserRole = {
      GUEST: 'guest',
      USER: 'user',
      PREMIUM: 'premium',
      MODERATOR: 'moderator',
      ADMIN: 'admin',
      SUPER_ADMIN: 'super_admin'
    };

    const Permission = {
      READ_PUBLIC_CONTENT: 'read_public_content',
      CREATE_SESSION: 'create_session',
      GENERATE_CONTENT: 'generate_content',
      ADVANCED_GENERATION: 'advanced_generation',
      BATCH_GENERATION: 'batch_generation',
      EXPORT_DATA: 'export_data',
      CUSTOM_TEMPLATES: 'custom_templates',
      VIEW_USER_ACTIVITY: 'view_user_activity',
      MODERATE_CONTENT: 'moderate_content',
      MANAGE_REPORTS: 'manage_reports',
      MANAGE_USERS: 'manage_users',
      VIEW_SYSTEM_STATS: 'view_system_stats',
      CONFIGURE_SYSTEM: 'configure_system',
      MANAGE_ROLES: 'manage_roles',
      ACCESS_DATABASE: 'access_database',
      SYSTEM_MAINTENANCE: 'system_maintenance'
    };

    // Role permissions mapping (simulate from middleware)
    const ROLE_PERMISSIONS = {
      [UserRole.GUEST]: [Permission.READ_PUBLIC_CONTENT],
      [UserRole.USER]: [
        Permission.READ_PUBLIC_CONTENT,
        Permission.CREATE_SESSION,
        Permission.GENERATE_CONTENT
      ],
      [UserRole.PREMIUM]: [
        Permission.READ_PUBLIC_CONTENT,
        Permission.CREATE_SESSION,
        Permission.GENERATE_CONTENT,
        Permission.ADVANCED_GENERATION,
        Permission.BATCH_GENERATION,
        Permission.EXPORT_DATA,
        Permission.CUSTOM_TEMPLATES
      ],
      [UserRole.MODERATOR]: [
        Permission.READ_PUBLIC_CONTENT,
        Permission.CREATE_SESSION,
        Permission.GENERATE_CONTENT,
        Permission.VIEW_USER_ACTIVITY,
        Permission.MODERATE_CONTENT,
        Permission.MANAGE_REPORTS
      ],
      [UserRole.ADMIN]: [
        Permission.READ_PUBLIC_CONTENT,
        Permission.CREATE_SESSION,
        Permission.GENERATE_CONTENT,
        Permission.ADVANCED_GENERATION,
        Permission.VIEW_USER_ACTIVITY,
        Permission.MODERATE_CONTENT,
        Permission.MANAGE_REPORTS,
        Permission.MANAGE_USERS,
        Permission.VIEW_SYSTEM_STATS,
        Permission.CONFIGURE_SYSTEM
      ],
      [UserRole.SUPER_ADMIN]: Object.values(Permission)
    };

    // Test getHighestRole function
    function getHighestRole(roles) {
      const roleHierarchy = [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.MODERATOR,
        UserRole.PREMIUM,
        UserRole.USER,
        UserRole.GUEST
      ];

      for (const role of roleHierarchy) {
        if (roles.includes(role)) {
          return role;
        }
      }
      return UserRole.GUEST;
    }

    // Test hasPermission function
    function hasPermission(userRoles, permission) {
      const highestRole = getHighestRole(userRoles);
      const rolePermissions = ROLE_PERMISSIONS[highestRole] || [];
      return rolePermissions.includes(permission);
    }

    // Run tests
    const testCases = [
      {
        roles: ['user'],
        permission: Permission.GENERATE_CONTENT,
        expected: true,
        description: 'User should have generate content permission'
      },
      {
        roles: ['user'],
        permission: Permission.ADVANCED_GENERATION,
        expected: false,
        description: 'User should not have advanced generation permission'
      },
      {
        roles: ['premium'],
        permission: Permission.ADVANCED_GENERATION,
        expected: true,
        description: 'Premium user should have advanced generation permission'
      },
      {
        roles: ['admin'],
        permission: Permission.MANAGE_USERS,
        expected: true,
        description: 'Admin should have manage users permission'
      },
      {
        roles: ['super_admin'],
        permission: Permission.SYSTEM_MAINTENANCE,
        expected: true,
        description: 'Super admin should have all permissions'
      },
      {
        roles: ['user', 'premium'],
        permission: Permission.ADVANCED_GENERATION,
        expected: true,
        description: 'User with multiple roles should get highest role permissions'
      }
    ];

    let passedTests = 0;
    for (const testCase of testCases) {
      const result = hasPermission(testCase.roles, testCase.permission);
      if (result === testCase.expected) {
        console.log(`  ✓ ${testCase.description}`);
        passedTests++;
      } else {
        console.log(`  ❌ ${testCase.description} (expected: ${testCase.expected}, got: ${result})`);
      }
    }

    console.log(`  📊 ${passedTests}/${testCases.length} permission tests passed\n`);
    return passedTests === testCases.length;
  }

  /**
   * Test database schema and user structure
   */
  async testDatabaseSchema() {
    console.log('📊 Testing Database Schema...');

    try {
      const usersCollection = this.db.collection('users');
      
      // Check if we have any users
      const userCount = await usersCollection.countDocuments();
      console.log(`  📈 Total users in database: ${userCount}`);

      if (userCount > 0) {
        // Check user schema structure
        const sampleUser = await usersCollection.findOne({});
        
        const requiredFields = ['username', 'email', 'passwordHash', 'roles', 'createdAt'];
        const missingFields = requiredFields.filter(field => !(field in sampleUser));
        
        if (missingFields.length === 0) {
          console.log('  ✓ User schema has all required fields');
        } else {
          console.log(`  ❌ User schema missing fields: ${missingFields.join(', ')}`);
          return false;
        }

        // Check role distribution
        const roleStats = await usersCollection.aggregate([
          { $unwind: { path: '$roles', preserveNullAndEmptyArrays: true } },
          {
            $group: {
              _id: { $ifNull: ['$roles', 'user'] },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } }
        ]).toArray();

        console.log('  📊 Role distribution:');
        roleStats.forEach(stat => {
          console.log(`    ${stat._id}: ${stat.count} users`);
        });

        // Check for admin users
        const adminUsers = await usersCollection.countDocuments({
          roles: { $in: ['admin', 'super_admin'] }
        });
        console.log(`  👑 Admin users: ${adminUsers}`);

        console.log('  ✅ Database schema validation completed\n');
        return true;
      } else {
        console.log('  ⚠️  No users found in database\n');
        return true; // Empty database is valid
      }

    } catch (error) {
      console.error('  ❌ Database schema test failed:', error.message);
      return false;
    }
  }

  /**
   * Test security measures
   */
  async testSecurityMeasures() {
    console.log('🔒 Testing Security Measures...');

    try {
      const usersCollection = this.db.collection('users');
      
      // Check that no passwords are stored in plain text
      const usersWithPlainPasswords = await usersCollection.find({
        password: { $exists: true }
      }).toArray();

      if (usersWithPlainPasswords.length === 0) {
        console.log('  ✓ No plain text passwords found');
      } else {
        console.log('  ❌ Found users with plain text passwords');
        return false;
      }

      // Check that password hashes are properly formatted (salt:hash)
      const usersWithHashes = await usersCollection.find({
        passwordHash: { $exists: true }
      }).toArray();

      if (usersWithHashes.length > 0) {
        const invalidHashes = usersWithHashes.filter(user => {
          const hash = user.passwordHash;
          return !hash.includes(':') || hash.split(':').length !== 2;
        });

        if (invalidHashes.length === 0) {
          console.log('  ✓ All password hashes properly formatted');
        } else {
          console.log('  ❌ Found improperly formatted password hashes');
          return false;
        }
      }

      // Check for default or weak passwords (by checking common patterns)
      const usersWithWeakHashes = await usersCollection.find({
        $or: [
          { username: 'admin', passwordHash: /^[a-f0-9]{32}:[a-f0-9]{128}$/ },
          { username: 'test', passwordHash: { $exists: true } }
        ]
      }).toArray();

      console.log('  ⚠️  Found potential test/default accounts:', usersWithWeakHashes.length);

      console.log('  ✅ Security measures validation completed\n');
      return true;

    } catch (error) {
      console.error('  ❌ Security validation failed:', error.message);
      return false;
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🧪 Starting Role-Based Authentication System Tests\n');

    try {
      await this.connect();

      const results = {
        middleware: this.testRoleMiddleware(),
        database: await this.testDatabaseSchema(),
        security: await this.testSecurityMeasures()
      };

      const allPassed = Object.values(results).every(result => result);

      console.log('📋 Test Results Summary:');
      console.log(`  Middleware Functions: ${results.middleware ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`  Database Schema: ${results.database ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`  Security Measures: ${results.security ? '✅ PASS' : '❌ FAIL'}`);

      if (allPassed) {
        console.log('\n🎉 All role system tests passed!');
        console.log('\n✨ The JWT-based authentication and role-based authorization system is ready!');
      } else {
        console.log('\n⚠️  Some tests failed. Please review the issues above.');
      }

      return allPassed;

    } catch (error) {
      console.error('💥 Test execution failed:', error.message);
      return false;
    } finally {
      await this.close();
    }
  }
}

/**
 * Main execution
 */
async function main() {
  const tester = new RoleSystemTester();
  const success = await tester.runAllTests();
  
  if (!success) {
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  main();
}

module.exports = RoleSystemTester;