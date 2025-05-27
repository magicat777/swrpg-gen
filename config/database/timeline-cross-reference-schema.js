// Timeline Integration and Cross-Reference Schema for MongoDB
// Supports comprehensive timeline integration and cross-reference system
// Run this script to add timeline and cross-reference schema validation

// Connect to the swrpg database
db = db.getSiblingDB('swrpg');

// Create collections if they don't exist
db.createCollection("timeline_events");
db.createCollection("cross_references");

// Timeline Events Collection Schema Validation
db.runCommand({
  collMod: "timeline_events",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["year", "year_significance", "major_events"],
      properties: {
        year: {
          bsonType: "string",
          description: "Year identifier (e.g., '19_BBY', '0_ABY') must be a string and is required"
        },
        year_significance: {
          bsonType: "string",
          description: "Brief description of year's importance and is required"
        },
        major_events: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["event", "description"],
            properties: {
              event: {
                bsonType: "string",
                description: "Event name"
              },
              description: {
                bsonType: "string",
                description: "Event description"
              },
              timeframe: {
                bsonType: "string",
                description: "Specific timeframe within year"
              },
              characters_affected: {
                bsonType: "array",
                items: {
                  bsonType: "string"
                },
                description: "Characters involved in event"
              },
              characters_involved: {
                bsonType: "array",
                items: {
                  bsonType: "string"
                },
                description: "Characters participating in event"
              },
              locations_involved: {
                bsonType: "array",
                items: {
                  bsonType: "string"
                },
                description: "Locations where event occurred"
              },
              factions_involved: {
                bsonType: "array",
                items: {
                  bsonType: "string"
                },
                description: "Factions participating in event"
              },
              consequences: {
                bsonType: "string",
                description: "Results and consequences of event"
              },
              significance: {
                bsonType: "string",
                description: "Historical significance"
              },
              outcome: {
                bsonType: "string",
                description: "Event outcome"
              },
              turning_point: {
                bsonType: "string",
                description: "Key turning point in event"
              },
              truth_revealed: {
                bsonType: "string",
                description: "Truth revealed during event"
              },
              casualties: {
                bsonType: "string",
                description: "Casualties from event"
              },
              impact: {
                bsonType: "string",
                description: "Broader impact of event"
              },
              purpose: {
                bsonType: "string",
                description: "Purpose or goal of event"
              },
              risk: {
                bsonType: "string",
                description: "Risks involved"
              },
              cause: {
                bsonType: "string",
                description: "What caused the event"
              },
              aftermath: {
                bsonType: "string",
                description: "What happened after"
              }
            }
          },
          description: "Major events that occurred during this year"
        },
        character_developments: {
          bsonType: "object",
          description: "Character development during this period",
          patternProperties: {
            "^[a-zA-Z0-9_-]+$": {
              bsonType: "object",
              properties: {
                age_range: {
                  bsonType: "string"
                },
                location: {
                  bsonType: "string"
                },
                development: {
                  bsonType: "string"
                },
                relationships: {
                  bsonType: "array",
                  items: {
                    bsonType: "string"
                  }
                },
                skills_learned: {
                  bsonType: "array",
                  items: {
                    bsonType: "string"
                  }
                },
                activities: {
                  bsonType: "array",
                  items: {
                    bsonType: "string"
                  }
                },
                force_sensitivity: {
                  bsonType: "string"
                },
                internal_conflict: {
                  bsonType: "string"
                },
                burden: {
                  bsonType: "string"
                },
                wisdom: {
                  bsonType: "string"
                },
                role: {
                  bsonType: "string"
                },
                growth: {
                  bsonType: "string"
                },
                trials: {
                  bsonType: "string"
                },
                heroism: {
                  bsonType: "string"
                },
                relationship: {
                  bsonType: "string"
                },
                leadership: {
                  bsonType: "string"
                },
                decisions: {
                  bsonType: "string"
                },
                status: {
                  bsonType: "string"
                },
                obsession: {
                  bsonType: "string"
                },
                discovery: {
                  bsonType: "string"
                }
              }
            }
          }
        },
        faction_evolution: {
          bsonType: "object",
          description: "How factions change during this period"
        },
        location_changes: {
          bsonType: "object",
          description: "Changes to locations during this period"
        },
        character_transformations: {
          bsonType: "object",
          description: "Character transformations during this period",
          patternProperties: {
            "^[a-zA-Z0-9_-]+$": {
              bsonType: "object",
              properties: {
                beginning: {
                  bsonType: "string"
                },
                development: {
                  bsonType: "string"
                },
                ending: {
                  bsonType: "string"
                },
                key_growth: {
                  bsonType: "string"
                },
                completion: {
                  bsonType: "string"
                },
                growth: {
                  bsonType: "string"
                },
                future: {
                  bsonType: "string"
                },
                legacy: {
                  bsonType: "string"
                }
              }
            }
          }
        },
        developments: {
          bsonType: "object",
          description: "General developments during this period"
        },
        
        // Metadata
        canon_source: {
          bsonType: "string",
          description: "Source material"
        },
        last_updated: {
          bsonType: "date",
          description: "Last update timestamp"
        },
        version: {
          bsonType: "string",
          description: "Timeline version"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// Cross References Collection Schema Validation
db.runCommand({
  collMod: "cross_references",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["reference_type", "entity_id", "entity_name"],
      properties: {
        reference_type: {
          bsonType: "string",
          enum: ["character_relationships", "location_associations", "event_connections", "faction_networks", "thematic_links"],
          description: "Type of cross-reference and is required"
        },
        entity_id: {
          bsonType: "string",
          description: "ID of the entity being referenced and is required"
        },
        entity_name: {
          bsonType: "string",
          description: "Name of the entity being referenced and is required"
        },
        
        // Character relationship references
        family_connections: {
          bsonType: "object",
          description: "Family relationship connections"
        },
        mentorship_chain: {
          bsonType: "object",
          description: "Teacher-student relationships"
        },
        battle_companions: {
          bsonType: "object",
          description: "Combat and adventure partnerships"
        },
        enemy_relationships: {
          bsonType: "object",
          description: "Antagonistic relationships"
        },
        dual_identity_network: {
          bsonType: "object",
          description: "Complex identity relationships"
        },
        political_network: {
          bsonType: "object",
          description: "Political connections"
        },
        military_relationships: {
          bsonType: "object",
          description: "Military command relationships"
        },
        personal_bonds: {
          bsonType: "object",
          description: "Personal friendships and relationships"
        },
        partnership_bonds: {
          bsonType: "object",
          description: "Professional partnerships"
        },
        criminal_connections: {
          bsonType: "object",
          description: "Criminal network connections"
        },
        rebel_integration: {
          bsonType: "object",
          description: "Integration with rebel forces"
        },
        
        // Location association references
        character_origins: {
          bsonType: "object",
          description: "Characters associated with this location"
        },
        faction_territories: {
          bsonType: "object",
          description: "Factions controlling this location"
        },
        significant_events: {
          bsonType: "object",
          description: "Important events at this location"
        },
        military_significance: {
          bsonType: "object",
          description: "Military importance of location"
        },
        strategic_importance: {
          bsonType: "object",
          description: "Strategic value of location"
        },
        character_experiences: {
          bsonType: "object",
          description: "Character experiences at location"
        },
        character_convergence: {
          bsonType: "object",
          description: "Characters meeting at location"
        },
        pivotal_events: {
          bsonType: "object",
          description: "Key events at location"
        },
        indigenous_alliance: {
          bsonType: "object",
          description: "Local species alliances"
        },
        final_confrontations: {
          bsonType: "object",
          description: "Climactic events at location"
        },
        
        // Event connection references
        event_sequences: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              event: {
                bsonType: "string"
              },
              leads_to: {
                bsonType: "string"
              },
              significance: {
                bsonType: "string"
              }
            }
          },
          description: "Sequence of connected events"
        },
        
        // Thematic connection references
        redemption_arcs: {
          bsonType: "object",
          description: "Redemption theme connections"
        },
        coming_of_age: {
          bsonType: "object",
          description: "Coming of age theme connections"
        },
        family_legacy: {
          bsonType: "object",
          description: "Family legacy theme connections"
        },
        power_vs_compassion: {
          bsonType: "object",
          description: "Power vs compassion theme connections"
        },
        
        // RPG integration references
        story_navigation: {
          bsonType: "object",
          description: "Story navigation aids"
        },
        adventure_generation: {
          bsonType: "object",
          description: "Adventure generation hooks"
        },
        player_character_integration: {
          bsonType: "object",
          description: "Player character integration options"
        },
        
        // Metadata
        last_updated: {
          bsonType: "date",
          description: "Last update timestamp"
        },
        version: {
          bsonType: "string",
          description: "Cross-reference version"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

print("Timeline integration and cross-reference schema validation has been applied to timeline_events and cross_references collections");