import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../server';
import localAiService from '../services/localAiService';
import mongodbService from '../services/mongodbService';
import contextAssemblyService from '../services/contextAssemblyService';

// Mock the services
jest.mock('../services/localAiService');
jest.mock('../services/mongodbService');
jest.mock('../services/contextAssemblyService');

// Mock the database service to prevent actual database calls
jest.mock('../services/databaseService', () => ({
  initialize: jest.fn().mockResolvedValue(undefined),
  shutdown: jest.fn().mockResolvedValue(undefined),
  isInitialized: jest.fn().mockReturnValue(true),
  checkHealth: jest.fn().mockResolvedValue({
    status: 'ok',
    components: {
      neo4j: { status: 'ok' },
      mongodb: { status: 'ok' },
      weaviate: { status: 'ok' },
      localai: { status: 'ok' }
    }
  })
}));

// Mock express app.listen to avoid EADDRINUSE errors
import express from 'express';
const originalListen = express.application.listen;
express.application.listen = jest.fn().mockImplementation(function() {
  return {
    close: jest.fn(),
    address: jest.fn().mockReturnValue({ port: 3000 })
  };
});

// Mock JWT secret for testing
process.env.JWT_SECRET = 'test-secret';
process.env.API_KEY = 'test-api-key';

describe('Generation API', () => {
  // Set up mock collections before each test
  beforeEach(() => {
    // Create mock collections with necessary methods
    const mockCollection = {
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn()
    };

    // Set up collection mocks
    (mongodbService.getGeneratedContentCollection as jest.Mock).mockReturnValue(mockCollection);
    (mongodbService.getMessagesCollection as jest.Mock).mockReturnValue(mockCollection);
    
    // Mock context assembly service
    (contextAssemblyService.assembleContext as jest.Mock).mockResolvedValue('Assembled context for testing');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/generate/character', () => {
    test('should generate a character successfully', async () => {
      // Mock character data
      const mockCharacter = {
        name: 'Kira Navin',
        species: 'Human',
        gender: 'Female',
        occupation: 'Smuggler',
        forceUser: false,
        alignment: 'Neutral',
        personality: ['Resourceful', 'Independent', 'Cautious'],
        background: 'Grew up on Corellia, became a smuggler after Imperial occupation'
      };
      
      // Mock the generateCharacter method
      (localAiService.generateCharacter as jest.Mock).mockResolvedValue(mockCharacter);
      
      // Test data
      const requestData = {
        era: 'Imperial Era',
        species: 'Human',
        affiliation: 'Independent',
        characterType: 'Smuggler',
        forceSensitive: false
      };
      
      // Create a valid token
      const user = {
        id: '123456789012',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      };
      
      const token = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
      // Make the request
      const response = await request(app)
        .post('/api/generate/character')
        .set('Authorization', `Bearer ${token}`)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.character).toEqual(mockCharacter);
      
      // Verify service calls
      expect(contextAssemblyService.assembleContext).toHaveBeenCalled();
      expect(localAiService.generateCharacter).toHaveBeenCalledWith(
        requestData.era,
        requestData.species,
        requestData.affiliation,
        requestData.characterType,
        requestData.forceSensitive,
        expect.objectContaining({
          context: expect.any(String)
        })
      );
      
      // Verify content was saved
      const mockCollection = mongodbService.getGeneratedContentCollection();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'character',
          name: mockCharacter.name,
          content: mockCharacter,
          createdBy: user.id
        })
      );
    });
    
    test('should generate a character with API key authentication', async () => {
      // Mock character data
      const mockCharacter = {
        name: 'Kira Navin',
        species: 'Human',
        gender: 'Female',
        occupation: 'Smuggler',
        forceUser: false
      };
      
      // Mock the generateCharacter method
      (localAiService.generateCharacter as jest.Mock).mockResolvedValue(mockCharacter);
      
      // Test data
      const requestData = {
        era: 'Imperial Era',
        species: 'Human',
        affiliation: 'Independent',
        characterType: 'Smuggler',
        forceSensitive: false
      };
      
      // Make the request with API key
      const response = await request(app)
        .post('/api/generate/character')
        .set('X-API-Key', process.env.API_KEY!)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.character).toEqual(mockCharacter);
      
      // Verify service calls
      expect(contextAssemblyService.assembleContext).toHaveBeenCalled();
      expect(localAiService.generateCharacter).toHaveBeenCalled();
    });
    
    test('should return validation error with missing data', async () => {
      // Test data with missing fields
      const requestData = {
        era: 'Imperial Era',
        // Missing species
        affiliation: 'Independent',
        characterType: 'Smuggler'
        // Missing forceSensitive
      };
      
      // Make the request with API key
      const response = await request(app)
        .post('/api/generate/character')
        .set('X-API-Key', process.env.API_KEY!)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('VALIDATION_ERROR');
      
      // Verify no generation was attempted
      expect(localAiService.generateCharacter).not.toHaveBeenCalled();
      expect(contextAssemblyService.assembleContext).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/generate/location', () => {
    test('should generate a location successfully', async () => {
      // Mock location data
      const mockLocation = {
        name: 'The Rusty Blaster Cantina',
        type: 'Cantina',
        planet: 'Tatooine',
        region: 'Mos Eisley',
        description: 'A dimly lit cantina popular with smugglers and bounty hunters'
      };
      
      // Mock the generateLocation method
      (localAiService.generateLocation as jest.Mock).mockResolvedValue(mockLocation);
      
      // Test data
      const requestData = {
        planet: 'Tatooine',
        region: 'Mos Eisley',
        locationType: 'Cantina',
        era: 'Imperial Era',
        atmosphere: 'Seedy'
      };
      
      // Make the request with API key
      const response = await request(app)
        .post('/api/generate/location')
        .set('X-API-Key', process.env.API_KEY!)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.location).toEqual(mockLocation);
      
      // Verify service calls
      expect(contextAssemblyService.assembleContext).toHaveBeenCalled();
      expect(localAiService.generateLocation).toHaveBeenCalledWith(
        requestData.planet,
        requestData.region,
        requestData.locationType,
        requestData.era,
        requestData.atmosphere,
        expect.objectContaining({
          context: expect.any(String)
        })
      );
    });
  });

  describe('POST /api/generate/narrative', () => {
    test('should generate a narrative continuation', async () => {
      // Mock narrative text
      const mockNarrative = 'The Imperial officer looks down at the datapad, his expression darkening as he reads the report. "This is most troubling," he mutters, turning to the stormtroopers at his side. "Seal all exits. No one leaves until we find what we\'re looking for."';
      
      // Mock the generateNarrativeContinuation method
      (localAiService.generateNarrativeContinuation as jest.Mock).mockResolvedValue(mockNarrative);
      
      // Test data
      const requestData = {
        sessionId: 'session123',
        era: 'Imperial Era',
        location: 'Imperial Base',
        sessionSummary: 'Players are infiltrating an Imperial base',
        recentEvents: 'Players stole Imperial uniforms',
        currentScene: 'Players are pretending to be Imperial officers',
        playerCharacters: 'Two rebels disguised as Imperials',
        npcsPresent: 'Imperial officers, stormtroopers',
        lastMessage: 'The player asks what the alert is about'
      };
      
      // Make the request with API key
      const response = await request(app)
        .post('/api/generate/narrative')
        .set('X-API-Key', process.env.API_KEY!)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.narrative).toEqual(mockNarrative);
      
      // Verify service calls
      expect(contextAssemblyService.assembleContext).toHaveBeenCalled();
      expect(localAiService.generateNarrativeContinuation).toHaveBeenCalled();
      
      // Verify message was saved
      const mockCollection = mongodbService.getMessagesCollection();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: requestData.sessionId,
          content: mockNarrative,
          type: 'narrative'
        })
      );
    });
    
    test('should handle errors gracefully', async () => {
      // Mock error
      const mockError = new Error('LLM service unavailable');
      (localAiService.generateNarrativeContinuation as jest.Mock).mockRejectedValue(mockError);
      
      // Test data
      const requestData = {
        sessionId: 'session123',
        era: 'Imperial Era',
        location: 'Imperial Base',
        sessionSummary: 'Players are infiltrating an Imperial base',
        recentEvents: 'Players stole Imperial uniforms',
        currentScene: 'Players are pretending to be Imperial officers',
        playerCharacters: 'Two rebels disguised as Imperials',
        npcsPresent: 'Imperial officers, stormtroopers',
        lastMessage: 'The player asks what the alert is about'
      };
      
      // Make the request with API key
      const response = await request(app)
        .post('/api/generate/narrative')
        .set('X-API-Key', process.env.API_KEY!)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(500);
      expect(response.body.status).toBe('error');
    });
  });
  
  describe('POST /api/generate/dialogue', () => {
    test('should generate character dialogue', async () => {
      // Mock dialogue text
      const mockDialogue = 'I\'ve been expecting you, rebel scum. *adjusts imperial uniform* Your presence here is... most unfortunate. *narrows eyes* Tell me, what division did you say you were from again?';
      
      // Mock the generateDialogue method
      (localAiService.generateDialogue as jest.Mock).mockResolvedValue(mockDialogue);
      
      // Test data
      const requestData = {
        sessionId: 'session123',
        characterName: 'Officer Tarkin',
        species: 'Human',
        occupation: 'Imperial Officer',
        affiliation: 'Galactic Empire',
        personality: ['Strict', 'Suspicious', 'Loyal'],
        speechPattern: 'Formal, crisp Imperial accent',
        knowledge: 'Imperial protocols, security procedures',
        emotionalState: 'Suspicious',
        relationship: 'Authority figure, unfamiliar with the players',
        location: 'Imperial Base Command Center',
        situation: 'Questioning disguised rebels',
        topic: 'Security clearance verification',
        previousDialogue: 'Present your credentials immediately.',
        playerInput: 'We\'re from the maintenance division, sir. Just doing routine checks.'
      };
      
      // Make the request with JWT token
      const user = {
        id: '123456789012',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      };
      
      const token = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
      const response = await request(app)
        .post('/api/generate/dialogue')
        .set('Authorization', `Bearer ${token}`)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.dialogue).toEqual(mockDialogue);
      
      // Verify service calls
      expect(contextAssemblyService.assembleContext).toHaveBeenCalled();
      expect(localAiService.generateDialogue).toHaveBeenCalled();
      
      // Verify message was saved
      const mockCollection = mongodbService.getMessagesCollection();
      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: requestData.sessionId,
          content: mockDialogue,
          type: 'dialogue',
          sender: expect.objectContaining({
            name: requestData.characterName
          })
        })
      );
    });
    
    test('should not require validation for optional fields', async () => {
      // Mock dialogue text
      const mockDialogue = 'Yes, maintenance division. What section number?';
      
      // Mock the generateDialogue method
      (localAiService.generateDialogue as jest.Mock).mockResolvedValue(mockDialogue);
      
      // Test data with only required fields
      const requestData = {
        sessionId: 'session123',
        characterName: 'Officer Tarkin',
        // Including only required fields (characterName and playerInput)
        playerInput: 'We\'re from the maintenance division, sir.'
      };
      
      // Make the request with API key
      const response = await request(app)
        .post('/api/generate/dialogue')
        .set('X-API-Key', process.env.API_KEY!)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      
      // Verify generation was attempted
      expect(localAiService.generateDialogue).toHaveBeenCalled();
      expect(contextAssemblyService.assembleContext).toHaveBeenCalled();
    });
  });

  describe('POST /api/generate/quest', () => {
    test('should generate a quest successfully', async () => {
      // Mock quest data
      const mockQuest = {
        title: 'Infiltrate the Imperial Data Center',
        description: 'The rebels need to retrieve critical intel from a heavily guarded Imperial data center on Scarif.',
        objectives: [
          'Secure Imperial disguises',
          'Infiltrate the facility using forged credentials',
          'Download the Death Star plans',
          'Escape undetected'
        ],
        difficulty: 'Hard',
        rewards: 'Death Star plans, 5000 credits, Alliance commendation',
        locations: ['Scarif Imperial Complex', 'Data Vault', 'Beach Landing Zone'],
        keyNpcs: [
          {
            name: 'Director Krennic',
            role: 'Imperial antagonist',
            description: 'Ambitious director overseeing the facility'
          },
          {
            name: 'Cassian Andor',
            role: 'Alliance contact',
            description: 'Intelligence officer providing support'
          }
        ],
        hooks: 'The fate of the Rebellion depends on obtaining these plans',
        twists: 'The facility has a planetary shield that must be deactivated'
      };
      
      // Mock the generateQuest method
      (localAiService.generateQuest as jest.Mock).mockResolvedValue(mockQuest);
      
      // Mock the getGeneratedContentCollection method
      const mockInsertOne = jest.fn().mockResolvedValue({
        acknowledged: true,
        insertedId: '123'
      });
      const mockCollection = { insertOne: mockInsertOne };
      (mongodbService.getGeneratedContentCollection as jest.Mock).mockReturnValue(mockCollection);
      
      // Test data
      const requestData = {
        sessionId: 'session123',
        era: 'Imperial Era',
        location: 'Scarif',
        theme: 'Espionage',
        plotStatus: 'Rebels need intel on the Empire\'s new weapon',
        playerCharacters: 'Team of Alliance operatives with various skills',
        notableNpcs: 'Director Krennic, Alliance Command',
        previousAdventures: 'Players have successfully infiltrated Imperial facilities before',
        questType: 'infiltration',
        difficulty: 'hard',
        duration: 'one-shot',
        requiredHooks: 'Must involve stealing Imperial data',
        restrictions: 'No Force users available'
      };
      
      // Create a valid token for authenticated request
      const user = {
        id: '123456789012',
        username: 'testuser',
        email: 'test@example.com',
        roles: ['user']
      };
      
      const token = jwt.sign(user, process.env.JWT_SECRET!, { expiresIn: '1h' });
      
      // Make the request with a JWT token instead of API key to trigger content saving
      const response = await request(app)
        .post('/api/generate/quest')
        .set('Authorization', `Bearer ${token}`)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.quest).toEqual(mockQuest);
      
      // Verify service calls
      expect(contextAssemblyService.assembleContext).toHaveBeenCalled();
      expect(localAiService.generateQuest).toHaveBeenCalledWith(
        requestData.era,
        requestData.location,
        requestData.theme,
        requestData.plotStatus,
        requestData.playerCharacters,
        requestData.notableNpcs,
        requestData.previousAdventures,
        requestData.questType,
        requestData.difficulty,
        requestData.duration,
        requestData.requiredHooks,
        requestData.restrictions,
        expect.objectContaining({
          context: expect.any(String)
        })
      );
      
      // Verify content was saved
      expect(mockInsertOne).toHaveBeenCalled();
      expect(mockInsertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'quest',
          name: mockQuest.title,
          content: mockQuest
        })
      );
    });
    
    test('should handle missing parameters properly', async () => {
      // Test data with missing fields
      const requestData = {
        era: 'Imperial Era',
        location: 'Scarif',
        // Missing most required fields
      };
      
      // Make the request with API key
      const response = await request(app)
        .post('/api/generate/quest')
        .set('X-API-Key', process.env.API_KEY!)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
      expect(response.body.code).toBe('VALIDATION_ERROR');
      
      // Verify no generation was attempted
      expect(localAiService.generateQuest).not.toHaveBeenCalled();
      expect(contextAssemblyService.assembleContext).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/generate/stream', () => {
    test('should set up streaming response headers', async () => {
      // Mock streaming method
      (localAiService.createStreamingChatCompletion as jest.Mock).mockImplementation(
        (messages, onChunk, onComplete, _onError, _options) => {
          // Simulate sending a chunk
          onChunk('Test chunk');
          // Simulate completion
          onComplete();
          return Promise.resolve();
        }
      );
      
      // Test data
      const requestData = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello, how are you?' }
        ]
      };
      
      // Make the request with API key
      const response = await request(app)
        .post('/api/generate/stream')
        .set('X-API-Key', process.env.API_KEY!)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(200);
      expect(response.headers['content-type']).toMatch(/text\/event-stream/);
      expect(response.headers['cache-control']).toBe('no-cache');
      expect(response.headers['connection']).toBe('keep-alive');
      
      // Verify streaming was set up
      expect(localAiService.createStreamingChatCompletion).toHaveBeenCalledWith(
        requestData.messages,
        expect.any(Function), // onChunk
        expect.any(Function), // onComplete
        expect.any(Function), // onError
        expect.any(Object)    // options
      );
    });
    
    test('should handle streaming errors gracefully', async () => {
      // Mock streaming method to throw an error
      (localAiService.createStreamingChatCompletion as jest.Mock).mockImplementation(
        (_messages, _onChunk, _onComplete, onError, _options) => {
          // Simulate an error during streaming
          onError(new Error('Streaming service unavailable'));
          return Promise.resolve();
        }
      );
      
      // Test data
      const requestData = {
        messages: [
          { role: 'system', content: 'You are a helpful assistant' },
          { role: 'user', content: 'Hello, how are you?' }
        ]
      };
      
      // Make the request with API key
      const response = await request(app)
        .post('/api/generate/stream')
        .set('X-API-Key', process.env.API_KEY!)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(200); // SSE still returns 200 even with errors
      expect(response.headers['content-type']).toMatch(/text\/event-stream/);
      
      // Verify streaming was set up
      expect(localAiService.createStreamingChatCompletion).toHaveBeenCalled();
    });
    
    test('should handle setup errors before streaming begins', async () => {
      // Mock streaming method to throw an error immediately
      (localAiService.createStreamingChatCompletion as jest.Mock).mockRejectedValue(
        new Error('Failed to initialize streaming')
      );
      
      // Test data with invalid format
      const requestData = {
        messages: 'invalid-format' // Not an array
      };
      
      // Make the request with API key
      const response = await request(app)
        .post('/api/generate/stream')
        .set('X-API-Key', process.env.API_KEY!)
        .send(requestData);
      
      // Assertions
      expect(response.status).toBe(400); // Changed from 500 to 400 since validation happens first
      expect(response.body.status).toBe('error');
      
      // Streaming should not be attempted due to validation failure
      expect(localAiService.createStreamingChatCompletion).not.toHaveBeenCalled();
    });
  });
});