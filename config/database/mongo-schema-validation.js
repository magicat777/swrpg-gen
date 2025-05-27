// MongoDB Schema Validation for Star Wars RPG Generator
// This script adds schema validation to existing collections
// Run this script after the database and collections are created

// Connect to the swrpg database
db = db.getSiblingDB('swrpg');

// User Collection Schema Validation
db.runCommand({
  collMod: "users",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "passwordHash", "createdAt"],
      properties: {
        username: {
          bsonType: "string",
          description: "Username must be a string and is required"
        },
        email: {
          bsonType: "string",
          description: "Email must be a string and is required"
        },
        passwordHash: {
          bsonType: "string",
          description: "Password hash must be a string and is required"
        },
        createdAt: {
          bsonType: "date",
          description: "Created date must be a date and is required"
        },
        lastActive: {
          bsonType: "date",
          description: "Last active date must be a date"
        },
        preferences: {
          bsonType: "object",
          properties: {
            theme: {
              bsonType: "string"
            },
            notificationsEnabled: {
              bsonType: "bool"
            },
            defaultSettings: {
              bsonType: "object",
              properties: {
                era: {
                  bsonType: "string"
                },
                locale: {
                  bsonType: "string"
                },
                tonePreferences: {
                  bsonType: "array",
                  items: {
                    bsonType: "string"
                  }
                },
                contentFilters: {
                  bsonType: "array",
                  items: {
                    bsonType: "string"
                  }
                }
              }
            }
          }
        },
        characters: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["characterId", "name"],
            properties: {
              characterId: {
                bsonType: "objectId"
              },
              name: {
                bsonType: "string"
              },
              lastUsed: {
                bsonType: "date"
              }
            }
          }
        },
        savedLocations: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          }
        },
        savedItems: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          }
        },
        sessionHistory: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          }
        },
        roles: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        },
        meta: {
          bsonType: "object"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// Sessions Collection Schema Validation
db.runCommand({
  collMod: "sessions",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sessionName", "createdAt", "createdBy", "isActive"],
      properties: {
        sessionName: {
          bsonType: "string",
          description: "Session name must be a string and is required"
        },
        description: {
          bsonType: "string",
          description: "Session description must be a string"
        },
        createdAt: {
          bsonType: "date",
          description: "Created date must be a date and is required"
        },
        lastActive: {
          bsonType: "date",
          description: "Last active date must be a date"
        },
        createdBy: {
          bsonType: "objectId",
          description: "Creator ID must be an ObjectId and is required"
        },
        isActive: {
          bsonType: "bool",
          description: "Active status must be a boolean and is required"
        },
        era: {
          bsonType: "string",
          description: "Star Wars era must be a string"
        },
        setting: {
          bsonType: "object",
          properties: {
            mainLocation: {
              bsonType: "string"
            },
            locationContext: {
              bsonType: "string"
            },
            timePeriod: {
              bsonType: "string"
            }
          }
        },
        participants: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["userId", "role"],
            properties: {
              userId: {
                bsonType: "objectId"
              },
              role: {
                bsonType: "string",
                enum: ["player", "gm", "observer"]
              },
              characterIds: {
                bsonType: "array",
                items: {
                  bsonType: "objectId"
                }
              }
            }
          }
        },
        storyParameters: {
          bsonType: "object",
          properties: {
            toneStyle: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            themeElements: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            },
            contentFlags: {
              bsonType: "object"
            },
            narrativeType: {
              bsonType: "string"
            }
          }
        },
        currentWorldState: {
          bsonType: "objectId"
        },
        messageCount: {
          bsonType: "int"
        },
        tags: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// Messages Collection Schema Validation
db.runCommand({
  collMod: "messages",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sessionId", "timestamp", "content", "type"],
      properties: {
        sessionId: {
          bsonType: "objectId",
          description: "Session ID must be an ObjectId and is required"
        },
        timestamp: {
          bsonType: "date",
          description: "Timestamp must be a date and is required"
        },
        sender: {
          bsonType: "object",
          required: ["type"],
          properties: {
            userId: {
              bsonType: "objectId"
            },
            characterId: {
              bsonType: "objectId"
            },
            type: {
              bsonType: "string",
              enum: ["user", "character", "system", "gm"]
            }
          }
        },
        content: {
          bsonType: "string",
          description: "Content must be a string and is required"
        },
        type: {
          bsonType: "string",
          enum: ["dialog", "action", "narrative", "ooc", "system"],
          description: "Type must be one of the allowed values and is required"
        },
        references: {
          bsonType: "object",
          properties: {
            characters: {
              bsonType: "array",
              items: {
                bsonType: "objectId"
              }
            },
            locations: {
              bsonType: "array",
              items: {
                bsonType: "objectId"
              }
            },
            items: {
              bsonType: "array",
              items: {
                bsonType: "objectId"
              }
            }
          }
        },
        metadata: {
          bsonType: "object",
          properties: {
            importance: {
              bsonType: "int",
              minimum: 0,
              maximum: 10
            },
            emotion: {
              bsonType: "string"
            },
            visibility: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        },
        worldStateId: {
          bsonType: "objectId"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// WorldStates Collection Schema Validation
db.runCommand({
  collMod: "worldStates",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["sessionId", "timestamp"],
      properties: {
        sessionId: {
          bsonType: "objectId",
          description: "Session ID must be an ObjectId and is required"
        },
        timestamp: {
          bsonType: "date",
          description: "Timestamp must be a date and is required"
        },
        messageId: {
          bsonType: "objectId",
          description: "Message ID must be an ObjectId"
        },
        characters: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["characterId", "name"],
            properties: {
              characterId: {
                bsonType: "objectId"
              },
              name: {
                bsonType: "string"
              },
              location: {
                bsonType: "string"
              },
              status: {
                bsonType: "string"
              },
              inventory: {
                bsonType: "array",
                items: {
                  bsonType: "string"
                }
              },
              relationships: {
                bsonType: "array",
                items: {
                  bsonType: "object",
                  required: ["targetId", "type"],
                  properties: {
                    targetId: {
                      bsonType: "objectId"
                    },
                    type: {
                      bsonType: "string"
                    },
                    strength: {
                      bsonType: "int",
                      minimum: 0,
                      maximum: 10
                    }
                  }
                }
              },
              knowledge: {
                bsonType: "array",
                items: {
                  bsonType: "string"
                }
              },
              goals: {
                bsonType: "array",
                items: {
                  bsonType: "string"
                }
              }
            }
          }
        },
        locations: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["locationId", "name"],
            properties: {
              locationId: {
                bsonType: "objectId"
              },
              name: {
                bsonType: "string"
              },
              status: {
                bsonType: "string"
              },
              presentCharacters: {
                bsonType: "array",
                items: {
                  bsonType: "objectId"
                }
              },
              presentItems: {
                bsonType: "array",
                items: {
                  bsonType: "objectId"
                }
              },
              atmosphere: {
                bsonType: "string"
              }
            }
          }
        },
        plotPoints: {
          bsonType: "array",
          items: {
            bsonType: "object",
            required: ["description"],
            properties: {
              description: {
                bsonType: "string"
              },
              status: {
                bsonType: "string",
                enum: ["active", "resolved", "abandoned"]
              },
              importance: {
                bsonType: "int",
                minimum: 0,
                maximum: 10
              },
              relatedCharacters: {
                bsonType: "array",
                items: {
                  bsonType: "objectId"
                }
              }
            }
          }
        },
        globalState: {
          bsonType: "object",
          properties: {
            timeOfDay: {
              bsonType: "string"
            },
            weatherConditions: {
              bsonType: "string"
            },
            tension: {
              bsonType: "int",
              minimum: 0,
              maximum: 10
            },
            currentThemes: {
              bsonType: "array",
              items: {
                bsonType: "string"
              }
            }
          }
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// GeneratedContent Collection Schema Validation
db.runCommand({
  collMod: "generatedContent",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["type", "name", "content", "timestamp"],
      properties: {
        type: {
          bsonType: "string",
          enum: ["character", "location", "faction", "item", "event", "plot", "dialogue", "scene"],
          description: "Content type must be one of the allowed values and is required"
        },
        name: {
          bsonType: "string",
          description: "Name must be a string and is required"
        },
        content: {
          bsonType: "string",
          description: "Content must be a string and is required"
        },
        summary: {
          bsonType: "string",
          description: "Summary must be a string"
        },
        timestamp: {
          bsonType: "date",
          description: "Timestamp must be a date and is required"
        },
        sessionId: {
          bsonType: "objectId",
          description: "Session ID must be an ObjectId"
        },
        prompt: {
          bsonType: "string",
          description: "Prompt used for generation must be a string"
        },
        parameters: {
          bsonType: "object",
          description: "Parameters used for generation"
        },
        tags: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Tags must be an array of strings"
        },
        version: {
          bsonType: "string",
          description: "Generator version must be a string"
        },
        usage: {
          bsonType: "object",
          properties: {
            useCount: {
              bsonType: "int",
              minimum: 0
            },
            lastUsed: {
              bsonType: "date"
            }
          }
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

// RuleReferences Collection Schema Validation
db.runCommand({
  collMod: "ruleReferences",
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "category", "description"],
      properties: {
        name: {
          bsonType: "string",
          description: "Rule name must be a string and is required"
        },
        category: {
          bsonType: "string",
          description: "Category must be a string and is required"
        },
        description: {
          bsonType: "string",
          description: "Description must be a string and is required"
        },
        detailedText: {
          bsonType: "string",
          description: "Detailed text must be a string"
        },
        page: {
          bsonType: "int",
          description: "Page number must be an integer"
        },
        source: {
          bsonType: "string",
          description: "Source must be a string"
        },
        tags: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Tags must be an array of strings"
        },
        examples: {
          bsonType: "array",
          items: {
            bsonType: "string"
          },
          description: "Examples must be an array of strings"
        },
        relatedRules: {
          bsonType: "array",
          items: {
            bsonType: "objectId"
          },
          description: "Related rules must be an array of ObjectIds"
        }
      }
    }
  },
  validationLevel: "moderate",
  validationAction: "warn"
});

print("Schema validation rules have been applied to all collections");