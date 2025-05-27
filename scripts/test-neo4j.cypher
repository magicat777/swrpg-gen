// Test Neo4j Connection and Schema
// Run with: cat ./scripts/test-neo4j.cypher | docker exec -i swrpg-neo4j cypher-shell -u neo4j -p password

// Test 1: Basic connectivity
RETURN 'Connected to Neo4j successfully' AS status;

// Test 2: Check database version
CALL dbms.components() YIELD name, versions, edition
RETURN name, versions, edition;

// Test 3: List installed plugins
CALL dbms.procedures() YIELD name
WHERE name STARTS WITH "apoc" OR name STARTS WITH "gds"
RETURN name LIMIT 10;

// Test 4: Check constraints
CALL db.constraints() YIELD name, description
RETURN name, description;

// Test 5: Check indexes
CALL db.indexes() YIELD name, labelsOrTypes, properties, type
RETURN name, labelsOrTypes, properties, type;

// Test 6: Create test node
CREATE (t:Test {name: 'Test Node', createdAt: datetime()})
RETURN t.name AS created;

// Test 7: Query the test node
MATCH (t:Test {name: 'Test Node'})
RETURN t.name, t.createdAt;

// Test 8: Delete test node
MATCH (t:Test {name: 'Test Node'})
DELETE t
RETURN 'Test node deleted' AS cleanup;

// Test 9: Check memory configuration
CALL dbms.listConfig() YIELD name, value
WHERE name CONTAINS 'dbms.memory'
RETURN name, value;

// Test 10: Check available procedures
CALL dbms.functions() YIELD name
RETURN name
ORDER BY name
LIMIT 10;