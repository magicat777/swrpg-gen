// API Response Types
export interface ApiResponse<T = unknown> {
  success?: boolean;
  status?: 'success' | 'error';
  data?: T;
  error?: string;
  message?: string;
  details?: string[];
}

// Authentication Types
export interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Session Types
export interface Session {
  id: string;
  name: string;
  description?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  settings: SessionSettings;
  currentStateId?: string;
  messageCount: number;
}

export interface SessionSettings {
  era: string;
  theme: string;
  difficulty: 'easy' | 'medium' | 'hard';
  autoSave: boolean;
}

export interface CreateSessionRequest {
  name: string;
  description?: string;
  settings: SessionSettings;
}

// Message Types
export interface Message {
  id: string;
  sessionId: string;
  sender: MessageSender;
  type: MessageType;
  content: string;
  metadata?: MessageMetadata;
  timestamp: string;
}

export interface MessageSender {
  type: 'user' | 'system' | 'character';
  id?: string;
  name: string;
}

export type MessageType = 
  | 'user_input' 
  | 'narrative' 
  | 'dialogue' 
  | 'scene_description' 
  | 'system_message'
  | 'system'
  | 'action'
  | 'chat'
  | 'lore';

export interface MessageMetadata {
  generationType?: string;
  characters?: string[];
  locations?: string[];
  options?: GenerationOptions;
  analysis?: StoryAnalysis;
  characterName?: string;
  actionType?: string;
  diceResult?: number;
  isLoreQuery?: boolean;
}

// Story Generation Types
export interface GenerationOptions {
  style?: 'action' | 'dialogue' | 'description' | 'introspection';
  length?: 'short' | 'medium' | 'long';
  tone?: 'dramatic' | 'lighthearted' | 'suspenseful' | 'mysterious';
  temperature?: number;
  maxTokens?: number;
}

export interface GenerateNarrativeRequest {
  sessionId: string;
  userInput: string;
  context?: {
    characters?: string[];
    locations?: string[];
    factions?: string[];
    items?: string[];
  };
  options?: GenerationOptions;
}

export interface GenerateDialogueRequest {
  sessionId: string;
  characterId: string;
  situation: string;
  targetAudience: string;
  previousContext?: string;
  options?: {
    emotionalState?: string;
    temperature?: number;
  };
}

export interface GenerateSceneRequest {
  sessionId: string;
  locationId: string;
  atmosphere?: string;
  focusElements?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
  };
}

// Story Analysis Types
export interface StoryAnalysis {
  entities: EntityAnalysis;
  sentiment: SentimentAnalysis;
  themes: ThemeAnalysis;
  contradictions: ContradictionCheck;
}

export interface EntityAnalysis {
  characters: ExtractedEntity[];
  locations: ExtractedEntity[];
  factions: ExtractedEntity[];
  items: ExtractedEntity[];
  events: ExtractedEvent[];
}

export interface ExtractedEntity {
  name: string;
  confidence: number;
  context: string;
  isNew: boolean;
  existingId?: string;
}

export interface ExtractedEvent {
  description: string;
  type: string;
  significance: number;
  participants: string[];
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  tension: number;
  mood: string;
  emotions: CharacterEmotion[];
  conflictLevel: number;
}

export interface CharacterEmotion {
  character?: string;
  emotion: string;
  intensity: number;
}

export interface ThemeAnalysis {
  primaryThemes: string[];
  starWarsThemes: {
    hope: number;
    redemption: number;
    power: number;
    corruption: number;
    sacrifice: number;
    legacy: number;
    destiny: number;
  };
  narrativeArcs: NarrativeArc[];
}

export interface NarrativeArc {
  type: string;
  progress: number;
  description: string;
}

export interface ContradictionCheck {
  contradictions: Contradiction[];
  consistencyScore: number;
}

export interface Contradiction {
  type: 'fact' | 'character' | 'timeline' | 'lore';
  description: string;
  severity: 'low' | 'medium' | 'high';
  conflictingElements: string[];
}

// World Data Types
export interface Character {
  id: string;
  name: string;
  species: string;
  gender: string;
  occupation: string;
  forceUser: boolean;
  alignment: string;
  personality: string[];
  biography?: string;
  homeworld?: string;
  affiliation?: string;
}

export interface Location {
  id: string;
  name: string;
  type: string;
  region: string;
  climate: string;
  population: string;
  government: string;
  description?: string;
}

export interface Faction {
  id: string;
  name: string;
  type: string;
  leader: string;
  headquarters: string;
  founded: string;
  ideology: string;
  goals: string[];
  strength: string;
  description?: string;
}

// Generation Templates
export interface GenerationTemplates {
  narrative: {
    styles: string[];
    lengths: string[];
    tones: string[];
  };
  dialogue: {
    emotionalStates: string[];
  };
  scene: {
    atmospheres: string[];
  };
}