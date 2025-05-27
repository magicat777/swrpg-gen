// Test MongoDB Connection and Schema
// Run with: docker exec -i swrpg-mongodb mongosh -u admin -p password --authenticationDatabase admin < ./scripts/test-mongodb.js

// Connect to the swrpg database
db = db.getSiblingDB('swrpg');

// Test 1: Count documents in collections
print("=== Collection Statistics ===");
db.getCollectionNames().forEach(function(collName) {
  const count = db[collName].countDocuments();
  print(`${collName}: ${count} documents`);
});

// Test 2: Verify indexes
print("\n=== Index Information ===");
db.getCollectionNames().forEach(function(collName) {
  print(`\nIndexes for ${collName}:`);
  const indexes = db[collName].getIndexes();
  indexes.forEach(function(idx) {
    print(`  ${idx.name}: ${JSON.stringify(idx.key)}`);
  });
});

// Test 3: Insert test document
print("\n=== Test Insert Operation ===");
const testDoc = {
  name: "Test Document",
  createdAt: new Date(),
  tags: ["test", "temporary"],
  metadata: {
    source: "test-mongodb.js",
    purpose: "Connection validation"
  }
};

try {
  const result = db.testCollection.insertOne(testDoc);
  print(`Inserted document with ID: ${result.insertedId}`);
  
  // Query the inserted document
  const doc = db.testCollection.findOne({_id: result.insertedId});
  print(`Retrieved document: ${JSON.stringify(doc)}`);
  
  // Clean up
  db.testCollection.deleteOne({_id: result.insertedId});
  print("Test document deleted");
} catch (e) {
  print(`Error during test: ${e.message}`);
}

// Test 4: Validate schema
print("\n=== Schema Validation Rules ===");
db.getCollectionInfos().forEach(function(info) {
  if (info.options && info.options.validator) {
    print(`\nValidation rules for ${info.name}:`);
    print(JSON.stringify(info.options.validator, null, 2));
  }
});

print("\n=== Test Complete ===");