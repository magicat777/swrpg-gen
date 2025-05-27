const { v4: uuidv4 } = require('uuid');
const { createApiError } = require('../middlewares/errorHandler');
const databaseService = require('../services/databaseService');
const localAiService = require('../services/localAiService');
const logger = require('../utils/logger');

/**
 * Generate story content based on prompt and context
 */
const generateStoryContent = async (req, res, next) => {
  try {
    const {
      sessionId,
      prompt,
      context = {},
      messageType = 'Narrative',
      settings = {}
    } = req.body;
    
    if (!sessionId || !prompt) {
      return next(createApiError(400, 'Session ID and prompt are required'));
    }
    
    // Get session information
    const sessionsCollection = databaseService.mongodb.getCollection('sessions');
    const session = await sessionsCollection.findOne({ _id: sessionId });
    
    if (!session) {
      return next(createApiError(404, 'Session not found'));
    }
    
    // Merge session settings with request settings
    const mergedSettings = {
      ...session.settings,
      ...settings
    };
    
    // Get relevant session messages for context
    const messagesCollection = databaseService.mongodb.getCollection('messages');
    const recentMessages = await messagesCollection.find(
      { sessionId, isHidden: { $ne: true } }
    )
      .sort({ timestamp: -1 })
      .limit(10)
      .toArray();
    
    // Prepare message history
    const messageHistory = recentMessages
      .reverse()
      .map(msg => ({
        role: msg.sender.type === 'System' ? 'system' : 'user',
        content: msg.content
      }));
    
    // Add system prompt
    const systemPrompt = localAiService.createSystemPrompt(mergedSettings);
    messageHistory.unshift({ role: 'system', content: systemPrompt });
    
    // Add user's current prompt
    messageHistory.push({ role: 'user', content: prompt });
    
    // Generate response
    const response = await localAiService.generateChatCompletion(messageHistory, {
      temperature: mergedSettings.temperature || 0.7,
      max_tokens: 2048
    });
    
    const content = response.choices[0].message.content;
    
    // Store the generated message
    const messageId = uuidv4();
    const now = new Date();
    
    const newMessage = {
      _id: messageId,
      sessionId,
      sender: {
        type: 'System',
        name: 'GM Assistant'
      },
      content,
      timestamp: now,
      type: messageType,
      attachments: [],
      references: context.references || {},
      isHidden: false,
      reactions: [],
      meta: {
        aiGenerationParams: {
          temperature: mergedSettings.temperature || 0.7,
          prompt: prompt,
          modelUsed: response.model
        }
      }
    };
    
    await messagesCollection.insertOne(newMessage);
    
    // Update session lastModified time
    await sessionsCollection.updateOne(
      { _id: sessionId },
      { 
        $set: { lastModified: now },
        $push: { messageHistory: messageId }
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: newMessage
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze story content for entities and events
 */
const analyzeStoryContent = async (req, res, next) => {
  try {
    const { content, sessionId } = req.body;
    
    if (!content) {
      return next(createApiError(400, 'Content is required'));
    }
    
    // Prepare prompt for entity extraction
    const extractionPrompt = [
      { role: 'system', content: 'You are an AI assistant that extracts entities and events from Star Wars RPG narrative text. Identify characters, locations, items, factions, and key events mentioned in the text. Return the extracted information in a structured format.' },
      { role: 'user', content: `Extract entities and events from the following Star Wars RPG narrative text. Return ONLY a JSON object with the following keys: "characters", "locations", "items", "factions", "events". Each key should contain an array of objects with "name" and "description" fields.\n\nText: ${content}` }
    ];
    
    // Generate analysis
    const response = await localAiService.generateChatCompletion(extractionPrompt, {
      temperature: 0.2,
      max_tokens: 1024
    });
    
    let analysis;
    try {
      // Try to parse the response as JSON
      analysis = JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error parsing AI response as JSON:', error);
      return next(createApiError(500, 'Failed to parse AI analysis'));
    }
    
    // If sessionId is provided, store important events as StoryEvent in Weaviate
    if (sessionId && analysis.events && analysis.events.length > 0) {
      const weaviateClient = databaseService.weaviate.getClient();
      
      // Get the most recent message ID for this session
      const messagesCollection = databaseService.mongodb.getCollection('messages');
      const latestMessage = await messagesCollection.findOne(
        { sessionId },
        { sort: { timestamp: -1 }, projection: { _id: 1 } }
      );
      
      // Store significant events
      for (const event of analysis.events) {
        if (event.name && event.description) {
          try {
            await weaviateClient.data
              .creator()
              .withClassName('StoryEvent')
              .withProperties({
                title: event.name,
                description: event.description,
                timestamp: new Date().toISOString(),
                sessionId,
                messageId: latestMessage?._id || null,
                participants: analysis.characters?.map(c => c.name) || [],
                importance: 5, // Default importance
                type: 'Generated',
                tags: ['auto-extracted']
              })
              .do();
          } catch (error) {
            logger.error('Error storing event in Weaviate:', error);
          }
        }
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: analysis
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Find similar story events
 */
const findSimilarEvents = async (req, res, next) => {
  try {
    const { query, sessionId, limit = 5 } = req.query;
    
    if (!query) {
      return next(createApiError(400, 'Query is required'));
    }
    
    const weaviateClient = databaseService.weaviate.getClient();
    
    const weaviateQuery = weaviateClient.graphql
      .get()
      .withClassName('StoryEvent')
      .withNearText({
        concepts: [query],
        certainty: 0.7
      })
      .withLimit(parseInt(limit, 10));
    
    // Add session filter if provided
    if (sessionId) {
      weaviateQuery.withWhere({
        operator: 'Equal',
        path: ['sessionId'],
        valueString: sessionId
      });
    }
    
    const result = await weaviateQuery.do();
    
    res.status(200).json({
      status: 'success',
      results: result.data.Get.StoryEvent?.length || 0,
      data: result.data.Get.StoryEvent || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a new NPC character
 */
const generateCharacter = async (req, res, next) => {
  try {
    const {
      name,
      species,
      faction,
      occupation,
      traits = [],
      era = 'Imperial Era',
      importance = 'minor', // minor, supporting, major
      alignment = 'neutral' // light, dark, neutral
    } = req.body;
    
    if (!species) {
      return next(createApiError(400, 'Species is required'));
    }
    
    // Prepare character generation prompt
    const generationPrompt = [
      { role: 'system', content: 'You are an AI assistant that generates detailed Star Wars characters for tabletop RPGs. Create vivid, lore-accurate characters with consistent motivations and personalities.' },
      { role: 'user', content: `Generate a detailed ${importance} ${alignment}-aligned ${species} character${name ? ` named ${name}` : ''}${faction ? ` who belongs to the ${faction}` : ''}${occupation ? ` working as a ${occupation}` : ''}. The character exists during the ${era} of Star Wars.${traits.length > 0 ? ` Include these traits: ${traits.join(', ')}.` : ''}\n\nReturn ONLY a JSON object with the following structure: {\n  "name": "Character name",\n  "species": "Species",\n  "gender": "Gender (if applicable)",\n  "age": "Approximate age",\n  "occupation": "Character's job or role",\n  "faction": "Political or social group affiliation",\n  "appearance": "Physical description",\n  "personality": "Personality traits and behavior",\n  "background": "Brief history",\n  "motivation": "What drives this character",\n  "secrets": "1-2 interesting secrets",\n  "skills": ["Notable skills"],\n  "quirks": ["Distinctive habits or traits"],\n  "relationships": ["Notable relationships"],\n  "possessions": ["Significant items they own"]\n}` }
    ];
    
    // Generate character
    const response = await localAiService.generateChatCompletion(generationPrompt, {
      temperature: 0.7,
      max_tokens: 1024
    });
    
    let character;
    try {
      // Try to parse the response as JSON
      character = JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error parsing AI response as JSON:', error);
      return next(createApiError(500, 'Failed to parse AI generation'));
    }
    
    // Generate Neo4j node if character data is valid
    if (character && character.name) {
      const neo4jDriver = databaseService.neo4j.driver;
      const session = neo4jDriver.session();
      
      try {
        const characterId = uuidv4();
        
        // Create character node
        const result = await session.run(
          `
          CREATE (c:Character {
            id: $id,
            name: $name,
            species: $species,
            gender: $gender,
            birthYear: $birthYear,
            occupation: $occupation,
            forceUser: $forceUser,
            alignment: $alignment,
            personality: $personality,
            biography: $biography,
            isPlayerCharacter: false,
            isCanon: false
          })
          RETURN c
          `,
          {
            id: characterId,
            name: character.name,
            species: character.species,
            gender: character.gender || 'Unknown',
            birthYear: character.age ? `Approximately ${character.age} years old` : 'Unknown',
            occupation: character.occupation,
            forceUser: character.skills?.some(skill => skill.toLowerCase().includes('force')) || false,
            alignment: alignment,
            personality: Array.isArray(character.personality) ? character.personality : [character.personality],
            biography: character.background
          }
        );
        
        const createdNode = result.records[0].get('c').properties;
        
        // Add faction relationship if specified
        if (character.faction) {
          await session.run(
            `
            MATCH (c:Character {id: $characterId})
            MERGE (f:Faction {name: $factionName})
            ON CREATE SET f.id = $factionId
            CREATE (c)-[:BELONGS_TO {role: $role, since: "Unknown", status: "Active"}]->(f)
            `,
            {
              characterId,
              factionName: character.faction,
              factionId: uuidv4(),
              role: character.occupation || 'Member'
            }
          );
        }
        
        character.id = characterId;
      } finally {
        await session.close();
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: character
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a new location
 */
const generateLocation = async (req, res, next) => {
  try {
    const {
      name,
      type = 'Planet', // Planet, System, City, Building, etc.
      region,
      era = 'Imperial Era',
      features = [],
      inhabitants = [],
      controlledBy = ''
    } = req.body;
    
    if (!type) {
      return next(createApiError(400, 'Location type is required'));
    }
    
    // Prepare location generation prompt
    const generationPrompt = [
      { role: 'system', content: 'You are an AI assistant that generates detailed Star Wars locations for tabletop RPGs. Create vivid, lore-accurate locations that fit within the Star Wars universe.' },
      { role: 'user', content: `Generate a detailed Star Wars ${type.toLowerCase()}${name ? ` named ${name}` : ''}${region ? ` in the ${region} region` : ''}. The location exists during the ${era} of Star Wars.${features.length > 0 ? ` Include these features: ${features.join(', ')}.` : ''}${inhabitants.length > 0 ? ` It is inhabited by: ${inhabitants.join(', ')}.` : ''}${controlledBy ? ` It is controlled by the ${controlledBy}.` : ''}\n\nReturn ONLY a JSON object with the following structure: {\n  "name": "Location name",\n  "type": "${type}",\n  "region": "Galactic region",\n  "sector": "Galactic sector (if applicable)",\n  "climate": ["Climate types"],\n  "terrain": ["Terrain types"],\n  "population": "Approximate population",\n  "government": "Type of government",\n  "majorSpecies": ["Notable species present"],\n  "resources": ["Notable resources or exports"],\n  "pointsOfInterest": ["Significant locations within"],\n  "threats": ["Dangers or hazards"],\n  "history": "Brief history",\n  "description": "Detailed physical description",\n  "controlledBy": "Faction in control",\n  "economicStatus": "Economic condition"\n}` }
    ];
    
    // Generate location
    const response = await localAiService.generateChatCompletion(generationPrompt, {
      temperature: 0.7,
      max_tokens: 1024
    });
    
    let location;
    try {
      // Try to parse the response as JSON
      location = JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error parsing AI response as JSON:', error);
      return next(createApiError(500, 'Failed to parse AI generation'));
    }
    
    // Generate Neo4j node if location data is valid
    if (location && location.name) {
      const neo4jDriver = databaseService.neo4j.driver;
      const session = neo4jDriver.session();
      
      try {
        const locationId = uuidv4();
        
        // Create location node
        const result = await session.run(
          `
          CREATE (l:Location {
            id: $id,
            name: $name,
            type: $type,
            sector: $sector,
            region: $region,
            climate: $climate,
            terrain: $terrain,
            population: $population,
            government: $government,
            description: $description,
            isCanon: false
          })
          RETURN l
          `,
          {
            id: locationId,
            name: location.name,
            type: location.type,
            sector: location.sector || 'Unknown',
            region: location.region || 'Unknown',
            climate: Array.isArray(location.climate) ? location.climate : [location.climate || 'Unknown'],
            terrain: Array.isArray(location.terrain) ? location.terrain : [location.terrain || 'Unknown'],
            population: location.population || 'Unknown',
            government: location.government || 'Unknown',
            description: location.description || ''
          }
        );
        
        const createdNode = result.records[0].get('l').properties;
        
        // Add controlling faction relationship if specified
        if (location.controlledBy) {
          await session.run(
            `
            MATCH (l:Location {id: $locationId})
            MERGE (f:Faction {name: $factionName})
            ON CREATE SET f.id = $factionId
            CREATE (f)-[:CONTROLS {since: "Unknown", strength: "Full Control"}]->(l)
            `,
            {
              locationId,
              factionName: location.controlledBy,
              factionId: uuidv4()
            }
          );
        }
        
        location.id = locationId;
      } finally {
        await session.close();
      }
    }
    
    res.status(200).json({
      status: 'success',
      data: location
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate a new quest or mission
 */
const generateQuest = async (req, res, next) => {
  try {
    const {
      title,
      type = 'Main', // Main, Side, Personal
      difficulty = 'Medium', // Easy, Medium, Hard
      length = 'Medium', // Short, Medium, Long
      characters = [],
      locations = [],
      themes = [],
      constraints = []
    } = req.body;
    
    // Prepare quest generation prompt
    const generationPrompt = [
      { role: 'system', content: 'You are an AI assistant that generates detailed Star Wars RPG quests and missions for tabletop games. Create engaging, lore-accurate adventures with clear objectives, challenges, and rewards.' },
      { role: 'user', content: `Generate a ${difficulty} difficulty, ${length} length ${type.toLowerCase()} quest${title ? ` titled "${title}"` : ''} for a Star Wars RPG campaign.${characters.length > 0 ? ` Include these characters: ${characters.join(', ')}.` : ''}${locations.length > 0 ? ` Set in these locations: ${locations.join(', ')}.` : ''}${themes.length > 0 ? ` Emphasize these themes: ${themes.join(', ')}.` : ''}${constraints.length > 0 ? ` Follow these constraints: ${constraints.join(', ')}.` : ''}\n\nReturn ONLY a JSON object with the following structure: {\n  "title": "Quest title",\n  "type": "${type}",\n  "difficulty": "${difficulty}",\n  "estimatedLength": "Number of sessions",\n  "summary": "Brief overview",\n  "hook": "How players get involved",\n  "objectives": ["Primary and secondary goals"],\n  "challenges": [\n    {"type": "Challenge type", "description": "Detailed description", "difficulty": "1-10"}\n  ],\n  "locations": ["Places involved"],\n  "npcs": [\n    {"name": "NPC name", "role": "Role in quest", "motivation": "What drives them"}\n  ],\n  "rewards": ["XP", "Credits", "Items", "Story rewards"],\n  "complications": ["Potential twists or problems"],\n  "followUp": "Possible sequel hooks"\n}` }
    ];
    
    // Generate quest
    const response = await localAiService.generateChatCompletion(generationPrompt, {
      temperature: 0.7,
      max_tokens: 1536
    });
    
    let quest;
    try {
      // Try to parse the response as JSON
      quest = JSON.parse(response.choices[0].message.content);
    } catch (error) {
      logger.error('Error parsing AI response as JSON:', error);
      return next(createApiError(500, 'Failed to parse AI generation'));
    }
    
    // Store the quest in MongoDB
    if (quest && quest.title) {
      const questId = uuidv4();
      quest.id = questId;
      
      const generatedContentCollection = databaseService.mongodb.getCollection('generatedContent');
      await generatedContentCollection.insertOne({
        _id: questId,
        type: 'Quest',
        name: quest.title,
        content: quest,
        createdAt: new Date(),
        createdBy: 'System',
        tags: [quest.type, quest.difficulty, ...themes],
        isApproved: false,
        usageCount: 0,
        meta: {
          generationParams: {
            type,
            difficulty,
            length,
            characters,
            locations,
            themes
          }
        }
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: quest
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available story templates
 */
const getStoryTemplates = async (req, res, next) => {
  try {
    const { type, tags, limit = 10 } = req.query;
    
    const weaviateClient = databaseService.weaviate.getClient();
    
    const query = weaviateClient.graphql
      .get()
      .withClassName('PlotTemplate')
      .withLimit(parseInt(limit, 10));
    
    // Add filters if provided
    if (type || tags) {
      const whereFilter = {
        operator: 'And',
        operands: []
      };
      
      if (type) {
        whereFilter.operands.push({
          operator: 'Equal',
          path: ['type'],
          valueString: type
        });
      }
      
      if (tags) {
        const tagList = tags.split(',');
        whereFilter.operands.push({
          operator: 'ContainsAny',
          path: ['tags'],
          valueStringArray: tagList
        });
      }
      
      query.withWhere(whereFilter);
    }
    
    const result = await query.do();
    
    res.status(200).json({
      status: 'success',
      results: result.data.Get.PlotTemplate?.length || 0,
      data: result.data.Get.PlotTemplate || []
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new story template
 */
const createStoryTemplate = async (req, res, next) => {
  try {
    const {
      title,
      summary,
      structure,
      type,
      complexity,
      recommendedLength,
      keyElements,
      hooks,
      challenges,
      suitableEras,
      tags
    } = req.body;
    
    if (!title || !summary || !type) {
      return next(createApiError(400, 'Title, summary, and type are required'));
    }
    
    const weaviateClient = databaseService.weaviate.getClient();
    
    // Create new template in Weaviate
    const result = await weaviateClient.data
      .creator()
      .withClassName('PlotTemplate')
      .withProperties({
        title,
        summary,
        structure: structure || summary,
        type,
        complexity: complexity || 5,
        recommendedLength: recommendedLength || 1,
        keyElements: keyElements || [],
        hooks: hooks || '',
        challenges: challenges || [],
        suitableEras: suitableEras || ['All Eras'],
        tags: tags || [type]
      })
      .do();
    
    // Get the created object
    const templateId = result?.id;
    let createdTemplate = null;
    
    if (templateId) {
      const getResult = await weaviateClient.data
        .getterById()
        .withClassName('PlotTemplate')
        .withId(templateId)
        .do();
      
      createdTemplate = getResult?.properties;
      createdTemplate.id = templateId;
    }
    
    res.status(201).json({
      status: 'success',
      data: createdTemplate
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateStoryContent,
  analyzeStoryContent,
  findSimilarEvents,
  generateCharacter,
  generateLocation,
  generateQuest,
  getStoryTemplates,
  createStoryTemplate
};