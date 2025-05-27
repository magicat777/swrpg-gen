// Enhanced Location Schema for MongoDB
// Supports comprehensive Original Trilogy location profiles
// Run this script to add enhanced location schema validation

// Connect to the swrpg database
db = db.getSiblingDB('swrpg');

// Enhanced Locations Collection Schema Validation
db.runCommand({
  collMod: "locations",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "name", "region", "description"],
      properties: {
        id: {
          bsonType: "string",
          description: "Location unique identifier must be a string and is required"
        },
        name: {
          bsonType: "string",
          description: "Location name must be a string and is required"
        },
        region: {
          bsonType: "string",
          description: "Galactic region must be a string and is required"
        },
        description: {
          bsonType: "string",
          description: "Location description must be a string and is required"
        },
        climate: {
          bsonType: "string",
          description: "Climate type must be a string"
        },
        terrain: {
          bsonType: "string",
          description: "Terrain type must be a string"
        },
        system: {
          bsonType: "string",
          description: "Star system must be a string"
        },
        
        // Enhanced Profile Fields
        basic_info: {
          bsonType: "object",
          properties: {
            coordinates: {
              bsonType: "string"
            },
            classification: {
              bsonType: "string"
            }
          }
        },
        
        environmental_details: {
          bsonType: "object",
          properties: {
            atmospheric_composition: {
              bsonType: "string"
            },
            gravity: {
              bsonType: "string"
            },
            day_cycle: {
              bsonType: "string"
            },
            year_length: {
              bsonType: "string"
            },
            suns: {
              bsonType: ["string", "array", "int"]
            },
            moons: {
              bsonType: ["string", "int"]
            },
            average_temperature: {
              bsonType: "string"
            },
            humidity: {
              bsonType: "string"
            },
            climate_zones: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        physical_geography: {
          bsonType: "object",
          properties: {
            terrain_types: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            notable_landmarks: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            water_sources: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            mineral_resources: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            geological_features: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        weather_patterns: {
          bsonType: "object",
          properties: {
            typical_conditions: {
              bsonType: "string"
            },
            seasonal_variations: {
              bsonType: "string"
            },
            weather_phenomena: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            visibility: {
              bsonType: "string"
            },
            wind_patterns: {
              bsonType: "string"
            },
            atmospheric_effects: {
              bsonType: "string"
            }
          }
        },
        
        flora_and_fauna: {
          bsonType: "object",
          properties: {
            native_species: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            plant_life: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            ecosystem: {
              bsonType: "string"
            }
          }
        },
        
        population_and_culture: {
          bsonType: "object",
          properties: {
            major_species: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            estimated_population: {
              bsonType: "string"
            },
            government: {
              bsonType: "string"
            },
            languages: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            major_settlements: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        economy_and_resources: {
          bsonType: "object",
          properties: {
            primary_industries: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            trade_goods: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            currency: {
              bsonType: "string"
            },
            economic_status: {
              bsonType: "string"
            }
          }
        },
        
        points_of_interest: {
          bsonType: "object",
          description: "Notable locations within this location"
        },
        
        faction_territories: {
          bsonType: "object",
          description: "Which factions control or influence this location"
        },
        
        military_significance: {
          bsonType: "object",
          properties: {
            strategic_value: {
              bsonType: "string"
            },
            defensive_features: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            facilities: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        force_nexus_properties: {
          bsonType: "object",
          properties: {
            force_presence: {
              bsonType: "string"
            },
            training_benefits: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            mystical_phenomena: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        rpg_elements: {
          bsonType: "object",
          properties: {
            adventure_hooks: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            encounter_types: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            skill_challenges: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            environmental_hazards: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            resources_available: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            atmospheric_elements: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        travel_information: {
          bsonType: "object",
          properties: {
            starport_facilities: {
              bsonType: "string"
            },
            transportation: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            accommodation: {
              bsonType: "string"
            },
            communication: {
              bsonType: "string"
            },
            navigation_hazards: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            survival_gear_required: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        
        historical_significance: {
          bsonType: "object",
          properties: {
            ancient_history: {
              bsonType: "string"
            },
            key_events: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            strategic_importance: {
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

print("Enhanced location schema validation has been applied to locations collection");