// MongoDB initialization script
// This script runs when the MongoDB container is first created

// Create the swrpg database
db = db.getSiblingDB('swrpg');

// Create collections
db.createCollection('sessions');
db.createCollection('messages');
db.createCollection('worldStates');
db.createCollection('users');
db.createCollection('generatedContent');
db.createCollection('ruleReferences');

// Create indexes
db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "apiKey": 1 }, { unique: true, sparse: true });

db.sessions.createIndex({ "createdBy": 1 });
db.sessions.createIndex({ "participants.userId": 1 });
db.sessions.createIndex({ "isActive": 1 });
db.sessions.createIndex({ "sessionName": "text" });

db.messages.createIndex({ "sessionId": 1, "timestamp": 1 });
db.messages.createIndex({ "references.characters": 1 });
db.messages.createIndex({ "references.locations": 1 });
db.messages.createIndex({ "content": "text" });

db.worldStates.createIndex({ "sessionId": 1, "timestamp": 1 });
db.worldStates.createIndex({ "messageId": 1 });

db.generatedContent.createIndex({ "type": 1 });
db.generatedContent.createIndex({ "sessionId": 1 });
db.generatedContent.createIndex({ "tags": 1 });
db.generatedContent.createIndex({ "name": "text", "content": "text" });

db.ruleReferences.createIndex({ "name": 1 });
db.ruleReferences.createIndex({ "category": 1 });
db.ruleReferences.createIndex({ "tags": 1 });
db.ruleReferences.createIndex({ "name": "text", "description": "text" });

// Create demo user
db.users.insertOne({
  username: 'demo-user',
  email: 'demo@example.com',
  passwordHash: '$2a$10$demopasswordhashfordevenv',
  createdAt: new Date(),
  lastActive: new Date(),
  preferences: {
    theme: 'dark',
    notificationsEnabled: true,
    defaultSettings: {
      era: 'Imperial Era',
      locale: 'en-US',
      tonePreferences: ['cinematic', 'dramatic'],
      contentFilters: []
    }
  },
  characters: [],
  savedLocations: [],
  savedItems: [],
  sessionHistory: [],
  roles: ['user'],
  meta: {}
});