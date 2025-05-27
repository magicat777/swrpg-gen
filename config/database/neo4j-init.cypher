// Neo4j Initialization Script for Star Wars RPG Generator
// This script creates constraints, indexes, and basic seed data

// SCHEMA: Create Constraints
// Ensures uniqueness for key entities

// Character constraints
CREATE CONSTRAINT character_name IF NOT EXISTS FOR (c:Character) REQUIRE c.name IS UNIQUE;

// Location constraints
CREATE CONSTRAINT location_name IF NOT EXISTS FOR (l:Location) REQUIRE l.name IS UNIQUE;

// Faction constraints
CREATE CONSTRAINT faction_name IF NOT EXISTS FOR (f:Faction) REQUIRE f.name IS UNIQUE;

// Item constraints
CREATE CONSTRAINT item_name IF NOT EXISTS FOR (i:Item) REQUIRE i.name IS UNIQUE;

// Event constraints
CREATE CONSTRAINT event_name IF NOT EXISTS FOR (e:Event) REQUIRE e.name IS UNIQUE;

// Species constraints
CREATE CONSTRAINT species_name IF NOT EXISTS FOR (s:Species) REQUIRE s.name IS UNIQUE;

// Era constraints
CREATE CONSTRAINT era_name IF NOT EXISTS FOR (e:Era) REQUIRE e.name IS UNIQUE;

// SCHEMA: Create Indexes
// Improves query performance

// Character indexes
CREATE INDEX character_name_index IF NOT EXISTS FOR (c:Character) ON (c.name);
CREATE INDEX character_species_index IF NOT EXISTS FOR (c:Character) ON (c.species);
CREATE INDEX character_occupation_index IF NOT EXISTS FOR (c:Character) ON (c.occupation);

// Location indexes
CREATE INDEX location_name_index IF NOT EXISTS FOR (l:Location) ON (l.name);
CREATE INDEX location_region_index IF NOT EXISTS FOR (l:Location) ON (l.region);
CREATE INDEX location_type_index IF NOT EXISTS FOR (l:Location) ON (l.type);

// Faction indexes
CREATE INDEX faction_name_index IF NOT EXISTS FOR (f:Faction) ON (f.name);
CREATE INDEX faction_type_index IF NOT EXISTS FOR (f:Faction) ON (f.type);

// Item indexes
CREATE INDEX item_name_index IF NOT EXISTS FOR (i:Item) ON (i.name);
CREATE INDEX item_type_index IF NOT EXISTS FOR (i:Item) ON (i.type);

// Event indexes
CREATE INDEX event_name_index IF NOT EXISTS FOR (e:Event) ON (e.name);
CREATE INDEX event_year_index IF NOT EXISTS FOR (e:Event) ON (e.year);

// SEED DATA: Create Basic Entities
// Minimal dataset to enable basic functionality

// Create Eras
CREATE (e1:Era {name: "High Republic Era", startYear: "-300", endYear: "0", description: "Golden age of the Jedi and Republic expansion"})
CREATE (e2:Era {name: "Imperial Era", startYear: "0", endYear: "4", description: "Period of the Galactic Empire's rule"})
CREATE (e3:Era {name: "New Republic Era", startYear: "4", endYear: "34", description: "Period after the fall of the Empire"})
CREATE (e4:Era {name: "First Order Era", startYear: "34", endYear: "35", description: "Rise and fall of the First Order"});

// Create Species
CREATE (s1:Species {name: "Human", description: "Baseline humanoid species", homeworld: "Various", traits: ["Adaptable", "Diplomatic", "Ambitious"]})
CREATE (s2:Species {name: "Twi'lek", description: "Humanoids with twin head tentacles", homeworld: "Ryloth", traits: ["Agile", "Cunning", "Resilient"]})
CREATE (s3:Species {name: "Wookiee", description: "Tall, hairy bipeds from Kashyyyk", homeworld: "Kashyyyk", traits: ["Strong", "Loyal", "Temperamental"]})
CREATE (s4:Species {name: "Rodian", description: "Green-skinned humanoids with bug-like features", homeworld: "Rodia", traits: ["Keen senses", "Hunters", "Aggressive"]})
CREATE (s5:Species {name: "Trandoshan", description: "Reptilian humanoids with regenerative abilities", homeworld: "Trandosha", traits: ["Tough", "Regenerative", "Confrontational"]});

// Create Regions
CREATE (r1:Region {name: "Core Worlds", description: "Central region of the galaxy and cradle of civilization"})
CREATE (r2:Region {name: "Inner Rim", description: "Prosperous region just outside the Core Worlds"})
CREATE (r3:Region {name: "Mid Rim", description: "Region between the Inner Rim and Outer Rim"})
CREATE (r4:Region {name: "Outer Rim", description: "Lawless frontier region far from galactic center"})
CREATE (r5:Region {name: "Unknown Regions", description: "Unexplored region beyond the Outer Rim"});

// Create Major Locations (Planets)
CREATE (l1:Location {name: "Tatooine", region: "Outer Rim", type: "Planet", climate: "Desert", description: "Desert planet with binary suns"})
CREATE (l2:Location {name: "Coruscant", region: "Core Worlds", type: "Planet", climate: "Temperate", description: "City-covered ecumenopolis and galactic capital"})
CREATE (l3:Location {name: "Kashyyyk", region: "Mid Rim", type: "Planet", climate: "Tropical", description: "Forest planet and homeworld of the Wookiees"})
CREATE (l4:Location {name: "Naboo", region: "Mid Rim", type: "Planet", climate: "Temperate", description: "Beautiful planet with diverse terrain"})
CREATE (l5:Location {name: "Hoth", region: "Outer Rim", type: "Planet", climate: "Frozen", description: "Ice planet and former Rebel Alliance base"});

// Create Sub-Locations
CREATE (l6:Location {name: "Mos Eisley Cantina", type: "Building", description: "Wretched hive of scum and villainy on Tatooine"})
CREATE (l7:Location {name: "Jedi Temple", type: "Building", description: "Main headquarters of the Jedi Order on Coruscant"})
CREATE (l8:Location {name: "Imperial Palace", type: "Building", description: "Former Jedi Temple, converted to the Emperor's residence"})
CREATE (l9:Location {name: "Theed Royal Palace", type: "Building", description: "Royal palace in the capital city of Naboo"});

// Create Location Relationships
CREATE (l6)-[:LOCATED_IN]->(l1)
CREATE (l7)-[:LOCATED_IN]->(l2)
CREATE (l8)-[:LOCATED_IN]->(l2)
CREATE (l9)-[:LOCATED_IN]->(l4)
CREATE (l1)-[:LOCATED_IN]->(r4)
CREATE (l2)-[:LOCATED_IN]->(r1)
CREATE (l3)-[:LOCATED_IN]->(r3)
CREATE (l4)-[:LOCATED_IN]->(r3)
CREATE (l5)-[:LOCATED_IN]->(r4);

// Create Factions
CREATE (f1:Faction {name: "Rebel Alliance", type: "Military/Political", description: "Alliance to Restore the Republic, opposed to the Galactic Empire"})
CREATE (f2:Faction {name: "Galactic Empire", type: "Government", description: "Autocratic regime that replaced the Galactic Republic"})
CREATE (f3:Faction {name: "Jedi Order", type: "Religious/Military", description: "Order of Force-sensitive guardians of peace and justice"})
CREATE (f4:Faction {name: "Sith", type: "Religious/Military", description: "Order of dark side Force users"})
CREATE (f5:Faction {name: "Hutt Cartel", type: "Criminal", description: "Crime syndicate controlled by Hutts"})
CREATE (f6:Faction {name: "Galactic Republic", type: "Government", description: "Democratic government that preceded the Empire"})
CREATE (f7:Faction {name: "New Republic", type: "Government", description: "Government formed after the defeat of the Empire"});

// Create Faction Relationships
CREATE (f1)-[:HOSTILE_TO]->(f2)
CREATE (f2)-[:HOSTILE_TO]->(f1)
CREATE (f3)-[:HOSTILE_TO]->(f4)
CREATE (f4)-[:HOSTILE_TO]->(f3)
CREATE (f3)-[:AFFILIATED_WITH]->(f6)
CREATE (f2)-[:HOSTILE_TO]->(f3)
CREATE (f1)-[:AFFILIATED_WITH]->(f7)
CREATE (f5)-[:HOSTILE_TO]->(f6)
CREATE (f5)-[:HOSTILE_TO]->(f7);

// Create Era Relationships
CREATE (f6)-[:EXISTS_DURING]->(e1)
CREATE (f3)-[:EXISTS_DURING]->(e1)
CREATE (f2)-[:EXISTS_DURING]->(e2)
CREATE (f1)-[:EXISTS_DURING]->(e2)
CREATE (f7)-[:EXISTS_DURING]->(e3);

// Create Iconic Characters
CREATE (c1:Character {name: "Luke Skywalker", gender: "Male", occupation: "Jedi Knight", era: "Imperial Era", species: "Human", description: "Farm boy from Tatooine who became a Jedi Knight"})
CREATE (c2:Character {name: "Darth Vader", gender: "Male", occupation: "Sith Lord", era: "Imperial Era", species: "Human", description: "Fallen Jedi and Dark Lord of the Sith"})
CREATE (c3:Character {name: "Han Solo", gender: "Male", occupation: "Smuggler", era: "Imperial Era", species: "Human", description: "Smuggler captain of the Millennium Falcon"})
CREATE (c4:Character {name: "Leia Organa", gender: "Female", occupation: "Princess/General", era: "Imperial Era", species: "Human", description: "Princess of Alderaan and Rebel leader"})
CREATE (c5:Character {name: "Chewbacca", gender: "Male", occupation: "Co-pilot", era: "Imperial Era", species: "Wookiee", description: "Wookiee warrior and Han Solo's co-pilot"});

// Create Character Relationships
CREATE (c1)-[:AFFILIATED_WITH]->(f1)
CREATE (c2)-[:AFFILIATED_WITH]->(f2)
CREATE (c2)-[:AFFILIATED_WITH]->(f4)
CREATE (c3)-[:AFFILIATED_WITH]->(f1)
CREATE (c4)-[:AFFILIATED_WITH]->(f1)
CREATE (c5)-[:AFFILIATED_WITH]->(f1)
CREATE (c1)-[:KNOWS]->(c3)
CREATE (c1)-[:KNOWS]->(c4)
CREATE (c1)-[:KNOWS]->(c5)
CREATE (c3)-[:KNOWS]->(c4)
CREATE (c3)-[:KNOWS]->(c5)
CREATE (c4)-[:KNOWS]->(c5)
CREATE (c1)-[:HOSTILE_TO]->(c2)
CREATE (c2)-[:HOSTILE_TO]->(c1)
CREATE (c5)-[:MEMBER_OF]->(s3)
CREATE (c1)-[:MEMBER_OF]->(s1)
CREATE (c2)-[:MEMBER_OF]->(s1)
CREATE (c3)-[:MEMBER_OF]->(s1)
CREATE (c4)-[:MEMBER_OF]->(s1);

// Create Items
CREATE (i1:Item {name: "Lightsaber", type: "Weapon", description: "Plasma blade weapon used by Jedi and Sith"})
CREATE (i2:Item {name: "Blaster Pistol", type: "Weapon", description: "Common energy-based ranged weapon"})
CREATE (i3:Item {name: "Millennium Falcon", type: "Vehicle", description: "Modified YT-1300 Corellian light freighter"})
CREATE (i4:Item {name: "X-wing Starfighter", type: "Vehicle", description: "Rebel Alliance strike starfighter"});

// Create Item Relationships
CREATE (c1)-[:OWNS]->(i1)
CREATE (c2)-[:OWNS]->(i1)
CREATE (c3)-[:OWNS]->(i2)
CREATE (c3)-[:OWNS]->(i3)
CREATE (c1)-[:OWNS]->(i4)
CREATE (i1)-[:AFFILIATED_WITH]->(f3)
CREATE (i4)-[:AFFILIATED_WITH]->(f1);

// Create Key Events
CREATE (e1:Event {name: "Battle of Yavin", year: "0", era: "Imperial Era", description: "Rebel victory with the destruction of the first Death Star"})
CREATE (e2:Event {name: "Battle of Hoth", year: "3", era: "Imperial Era", description: "Imperial attack on the Rebel base on Hoth"})
CREATE (e3:Event {name: "Battle of Endor", year: "4", era: "Imperial Era", description: "Rebel victory that marked the beginning of the end for the Empire"});

// Create Event Relationships
CREATE (c1)-[:PARTICIPATED_IN]->(e1)
CREATE (c2)-[:PARTICIPATED_IN]->(e1)
CREATE (c3)-[:PARTICIPATED_IN]->(e1)
CREATE (c4)-[:PARTICIPATED_IN]->(e1)
CREATE (c1)-[:PARTICIPATED_IN]->(e2)
CREATE (c2)-[:PARTICIPATED_IN]->(e2)
CREATE (c3)-[:PARTICIPATED_IN]->(e2)
CREATE (c4)-[:PARTICIPATED_IN]->(e2)
CREATE (c5)-[:PARTICIPATED_IN]->(e2)
CREATE (c1)-[:PARTICIPATED_IN]->(e3)
CREATE (c3)-[:PARTICIPATED_IN]->(e3)
CREATE (c4)-[:PARTICIPATED_IN]->(e3)
CREATE (c5)-[:PARTICIPATED_IN]->(e3)
CREATE (f1)-[:PARTICIPATED_IN]->(e1)
CREATE (f2)-[:PARTICIPATED_IN]->(e1)
CREATE (f1)-[:PARTICIPATED_IN]->(e2)
CREATE (f2)-[:PARTICIPATED_IN]->(e2)
CREATE (f1)-[:PARTICIPATED_IN]->(e3)
CREATE (f2)-[:PARTICIPATED_IN]->(e3)
CREATE (e1)-[:LOCATED_IN]->(l5)
CREATE (e3)-[:LOCATED_IN]->(l5);