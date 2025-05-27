// Faction Relationships Schema for MongoDB
// Supports comprehensive faction relationship matrix
// Run this script to add faction relationships schema validation

// Connect to the swrpg database
db = db.getSiblingDB('swrpg');

// Create faction_relationships collection if it doesn't exist
db.createCollection("faction_relationships");

// Faction Relationships Collection Schema Validation
db.runCommand({
  collMod: "faction_relationships",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["faction_id", "relationships"],
      properties: {
        faction_id: {
          bsonType: "string",
          description: "Faction unique identifier must be a string and is required"
        },
        faction_name: {
          bsonType: "string",
          description: "Faction name for reference"
        },
        tier: {
          bsonType: "string",
          enum: ["tier_1_galactic_powers", "tier_2_regional_powers", "tier_3_military_organizations", "tier_4_local_independent"],
          description: "Faction power tier classification"
        },
        relationships: {
          bsonType: "object",
          description: "Relationships with other factions",
          patternProperties: {
            "^[a-zA-Z0-9_-]+$": {
              bsonType: "object",
              required: ["type", "intensity", "description"],
              properties: {
                type: {
                  bsonType: "string",
                  enum: ["Allied", "Hostile", "Neutral", "Subsidiary", "Competitive", "Exploitative"],
                  description: "Type of relationship"
                },
                intensity: {
                  bsonType: "string",
                  description: "Intensity level of the relationship"
                },
                description: {
                  bsonType: "string",
                  description: "Detailed description of the relationship"
                },
                evolution: {
                  bsonType: "string",
                  description: "How the relationship changes over time"
                },
                key_conflicts: {
                  bsonType: "array",
                  items: {
                    bsonType: "string"
                  },
                  description: "Major conflicts or events"
                },
                benefits: {
                  bsonType: "string",
                  description: "What each side gains"
                },
                tensions: {
                  bsonType: "string",
                  description: "Sources of conflict or tension"
                },
                strategic_approach: {
                  bsonType: "string",
                  description: "How faction approaches this relationship"
                },
                public_knowledge: {
                  bsonType: "string",
                  description: "How much the galaxy knows about this relationship"
                },
                power_dynamic: {
                  bsonType: "string",
                  description: "Who has more power in the relationship"
                },
                services: {
                  bsonType: "array",
                  items: {
                    bsonType: "string"
                  },
                  description: "Services provided between factions"
                },
                example: {
                  bsonType: "string",
                  description: "Specific example of the relationship"
                },
                complications: {
                  bsonType: "string",
                  description: "Factors that complicate the relationship"
                },
                threat_level: {
                  bsonType: "string",
                  description: "Level of threat posed"
                },
                personal_stakes: {
                  bsonType: "string",
                  description: "Personal elements affecting the relationship"
                },
                cultural_fit: {
                  bsonType: "string",
                  description: "How cultures align or clash"
                },
                payment: {
                  bsonType: "string",
                  description: "Payment or compensation structure"
                },
                notable_cases: {
                  bsonType: "array",
                  items: {
                    bsonType: "string"
                  },
                  description: "Notable instances of the relationship"
                }
              }
            }
          }
        },
        dual_identity_network: {
          bsonType: "object",
          description: "For factions with complex identities (like Vader/Anakin)"
        },
        political_network: {
          bsonType: "object",
          description: "Political relationships and alliances"
        },
        military_relationships: {
          bsonType: "object",
          description: "Military command structures and alliances"
        },
        personal_bonds: {
          bsonType: "object",
          description: "Personal relationships affecting faction dynamics"
        },
        partnership_bonds: {
          bsonType: "object",
          description: "Partnership and alliance structures"
        },
        criminal_connections: {
          bsonType: "object",
          description: "Criminal network relationships"
        },
        rebel_integration: {
          bsonType: "object",
          description: "How faction integrates with rebellion"
        },
        
        // Metadata
        last_updated: {
          bsonType: "date",
          description: "Last update timestamp"
        },
        version: {
          bsonType: "string",
          description: "Relationship matrix version"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// Enhanced Factions Collection Schema Validation
db.runCommand({
  collMod: "factions",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "description", "type", "era", "alignment"],
      properties: {
        id: {
          bsonType: "string",
          description: "Faction unique identifier must be a string and is required"
        },
        name: {
          bsonType: "string",
          description: "Faction name must be a string and is required"
        },
        description: {
          bsonType: "string",
          description: "Faction description must be a string and is required"
        },
        type: {
          bsonType: "string",
          enum: ["Government", "Military Organization", "Religious Order", "Criminal Organization", "Professional Organization", "Local Government", "Trade Organization", "Indigenous People"],
          description: "Faction type must be one of the allowed values and is required"
        },
        era: {
          bsonType: "string",
          description: "Historical era must be a string and is required"
        },
        alignment: {
          bsonType: "string",
          enum: ["Light Side", "Dark Side", "Neutral"],
          description: "Force alignment must be one of the allowed values and is required"
        },
        headquarters: {
          bsonType: "string",
          description: "Primary headquarters location"
        },
        detailed_content: {
          bsonType: "string",
          description: "Detailed faction description"
        },
        key_figures: {
          bsonType: "string",
          description: "Important faction members"
        },
        philosophy: {
          bsonType: "string",
          description: "Faction's core beliefs and philosophy"
        },
        source: {
          bsonType: "string",
          description: "Canon source material"
        },
        wookieepedia_url: {
          bsonType: "string",
          description: "Wookieepedia reference URL"
        },
        
        // Enhanced fields
        power_tier: {
          bsonType: "string",
          enum: ["tier_1_galactic_powers", "tier_2_regional_powers", "tier_3_military_organizations", "tier_4_local_independent"]
        },
        expansion: {
          bsonType: "string",
          description: "How faction expanded during trilogy"
        },
        military_buildup: {
          bsonType: "string",
          description: "Military development"
        },
        oppression: {
          bsonType: "string",
          description: "Methods of control or oppression"
        },
        resistance: {
          bsonType: "string",
          description: "Opposition faced"
        },
        formation: {
          bsonType: "string",
          description: "How faction was formed"
        },
        growth: {
          bsonType: "string",
          description: "How faction grew over time"
        },
        organization: {
          bsonType: "string",
          description: "Organizational structure"
        },
        preparation: {
          bsonType: "string",
          description: "Preparation for major events"
        },
        operations: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Primary operations and activities"
        },
        leadership: {
          bsonType: "string",
          description: "Leadership structure"
        },
        neutrality: {
          bsonType: "string",
          description: "Approach to galactic conflict"
        },
        
        // Timeline evolution
        episode_4_changes: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        },
        episode_5_changes: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        },
        episode_6_changes: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        },
        
        // Metadata
        last_updated: {
          bsonType: "date",
          description: "Last update timestamp"
        },
        enhancement_version: {
          bsonType: "string",
          description: "Enhancement version number"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

print("Faction relationships schema validation has been applied to faction_relationships and factions collections");