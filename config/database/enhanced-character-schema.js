// Enhanced Character Schema for MongoDB
// Supports comprehensive Original Trilogy character profiles
// Run this script to add enhanced character schema validation

// Connect to the swrpg database
db = db.getSiblingDB('swrpg');

// Enhanced Characters Collection Schema Validation
db.runCommand({
  collMod: "characters",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "species", "description"],
      properties: {
        id: {
          bsonType: "string",
          description: "Character unique identifier must be a string and is required"
        },
        name: {
          bsonType: "string",
          description: "Character name must be a string and is required"
        },
        species: {
          bsonType: "string",
          description: "Character species must be a string and is required"
        },
        description: {
          bsonType: "string",
          description: "Character description must be a string and is required"
        },
        affiliation: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Character affiliations must be an array of strings"
        },
        homeworld: {
          bsonType: "string",
          description: "Character homeworld must be a string"
        },
        
        // Enhanced Profile Fields
        basic_info: {
          bsonType: "object",
          properties: {
            birth_name: {
              bsonType: "string"
            },
            titles: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            birth_year: {
              bsonType: "string"
            },
            death_year: {
              bsonType: "string"
            },
            age_during_trilogy: {
              bsonType: "string"
            },
            aliases: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        physical_description: {
          bsonType: "object",
          properties: {
            height: {
              bsonType: "string"
            },
            hair: {
              bsonType: "string"
            },
            eyes: {
              bsonType: "string"
            },
            distinctive_features: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            typical_attire: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            voice: {
              bsonType: "string"
            }
          }
        },
        
        personality: {
          bsonType: "object",
          properties: {
            core_traits: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            strengths: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            weaknesses: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            motivations: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            fears: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        abilities: {
          bsonType: "object",
          properties: {
            force_sensitivity: {
              bsonType: "string",
              enum: ["None", "Low", "Moderate", "High", "Very High", "Legendary"]
            },
            force_powers: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            lightsaber_form: {
              bsonType: "string"
            },
            combat_skills: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            other_skills: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            leadership_skills: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            political_skills: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        equipment: {
          bsonType: "object",
          properties: {
            primary_weapon: {
              bsonType: "string"
            },
            secondary_weapons: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            signature_items: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            tools: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            armor: {
              bsonType: "string"
            }
          }
        },
        
        relationships: {
          bsonType: "object",
          properties: {
            family: {
              bsonType: "object"
            },
            mentors: {
              bsonType: "object"
            },
            students: {
              bsonType: "object"
            },
            allies: {
              bsonType: "object"
            },
            enemies: {
              bsonType: "object"
            },
            colleagues: {
              bsonType: "object"
            },
            romance: {
              bsonType: "object"
            },
            partners: {
              bsonType: "object"
            }
          }
        },
        
        character_development: {
          bsonType: "object",
          properties: {
            episode_4: {
              bsonType: "string"
            },
            episode_5: {
              bsonType: "string"
            },
            episode_6: {
              bsonType: "string"
            },
            key_moments: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
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
            }
          }
        },
        
        rpg_elements: {
          bsonType: "object",
          properties: {
            notable_quotes: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            mannerisms: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            gm_hooks: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            story_seeds: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        reputation: {
          bsonType: "object",
          description: "How different factions view this character"
        },
        
        historical_significance: {
          bsonType: "object",
          properties: {
            galactic_importance: {
              bsonType: "string"
            },
            key_events: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            strategic_value: {
              bsonType: "string"
            }
          }
        },
        
        // Source and metadata
        wookieepedia_url: {
          bsonType: "string",
          description: "Wookieepedia reference URL"
        },
        canon_source: {
          bsonType: "string",
          description: "Original source material"
        },
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

print("Enhanced character schema validation has been applied to characters collection");