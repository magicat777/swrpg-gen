import { logger } from '../utils/logger';
import localAiService, { StoryAnalysisResult } from './localAiService';
import neo4jService from './neo4jService';
import weaviateService from './weaviateService';

export interface EntityExtractionResult {
  characters: ExtractedCharacter[];
  locations: ExtractedLocation[];
  factions: ExtractedFaction[];
  items: ExtractedItem[];
  events: ExtractedEvent[];
}

export interface ExtractedCharacter {
  name: string;
  confidence: number;
  context: string;
  isNew: boolean;
  existingId?: string;
}

export interface ExtractedLocation {
  name: string;
  confidence: number;
  context: string;
  isNew: boolean;
  existingId?: string;
}

export interface ExtractedFaction {
  name: string;
  confidence: number;
  context: string;
  isNew: boolean;
  existingId?: string;
}

export interface ExtractedItem {
  name: string;
  confidence: number;
  context: string;
  type?: string;
  isNew: boolean;
  existingId?: string;
}

export interface ExtractedEvent {
  description: string;
  type: string;
  significance: number;
  timestamp?: Date;
  location?: string;
  participants: string[];
}

export interface SentimentAnalysis {
  overall: 'positive' | 'negative' | 'neutral';
  tension: number; // 0-10
  mood: string;
  emotions: {
    character?: string;
    emotion: string;
    intensity: number;
  }[];
  conflictLevel: number; // 0-10
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
  narrativeArcs: {
    type: string;
    progress: number;
    description: string;
  }[];
}

export interface ContradictionCheck {
  contradictions: {
    type: 'fact' | 'character' | 'timeline' | 'lore';
    description: string;
    severity: 'low' | 'medium' | 'high';
    conflictingElements: string[];
  }[];
  consistencyScore: number; // 0-100
}

/**
 * Service for analyzing story content and extracting narrative elements
 */
class StoryAnalysisService {
  /**
   * Perform comprehensive story analysis
   */
  async analyzeStory(content: string, sessionId?: string): Promise<{
    entities: EntityExtractionResult;
    sentiment: SentimentAnalysis;
    themes: ThemeAnalysis;
    contradictions: ContradictionCheck;
    analysis: StoryAnalysisResult;
  }> {
    try {
      logger.debug('Starting comprehensive story analysis', { contentLength: content.length, sessionId });

      // Run analysis in parallel for efficiency
      const [
        entities,
        llmAnalysis,
        contradictions
      ] = await Promise.all([
        this.extractEntities(content),
        localAiService.analyzeStoryContent(content),
        this.checkContradictions(content, sessionId)
      ]);

      // Enhanced sentiment analysis
      const sentiment = await this.analyzeSentiment(content, entities);
      
      // Enhanced theme analysis
      const themes = await this.analyzeThemes(content, llmAnalysis.themes);

      return {
        entities,
        sentiment,
        themes,
        contradictions,
        analysis: llmAnalysis
      };
    } catch (error) {
      logger.error('Failed to analyze story', { error, sessionId });
      throw error;
    }
  }

  /**
   * Extract entities from story content
   */
  async extractEntities(content: string): Promise<EntityExtractionResult> {
    try {
      const extractionPrompt = `Analyze the following Star Wars story content and extract all mentioned entities with high precision.

For each entity, provide:
1. Exact name as mentioned
2. Confidence score (0.0-1.0)
3. Context snippet where mentioned
4. Entity type and subtype

Return valid JSON:
{
  "characters": [{"name": "string", "confidence": 0.0-1.0, "context": "string"}],
  "locations": [{"name": "string", "confidence": 0.0-1.0, "context": "string"}],
  "factions": [{"name": "string", "confidence": 0.0-1.0, "context": "string"}],
  "items": [{"name": "string", "confidence": 0.0-1.0, "context": "string", "type": "string"}],
  "events": [{"description": "string", "type": "string", "significance": 1-10, "participants": ["string"]}]
}

Content:
${content}`;

      const response = await localAiService.createChatCompletion([
        { role: 'system', content: 'You are an expert entity extractor for Star Wars content. Be precise and thorough.' },
        { role: 'user', content: extractionPrompt }
      ], { temperature: 0.2, max_tokens: 1500 });

      let extracted: any;
      try {
        // Extract JSON from response - handle cases where LLM adds extra text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          extracted = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        logger.error('Failed to parse entity extraction response', { error: e, response });
        // Return empty result on parse failure
        return {
          characters: [],
          locations: [],
          factions: [],
          items: [],
          events: []
        };
      }

      // Cross-reference with existing entities
      const [characters, locations, factions, items] = await Promise.all([
        this.crossReferenceCharacters(extracted.characters || []),
        this.crossReferenceLocations(extracted.locations || []),
        this.crossReferenceFactions(extracted.factions || []),
        this.crossReferenceItems(extracted.items || [])
      ]);

      return {
        characters,
        locations,
        factions,
        items,
        events: extracted.events || []
      };
    } catch (error) {
      logger.error('Failed to extract entities', { error });
      throw error;
    }
  }

  /**
   * Cross-reference extracted characters with existing database entries
   */
  private async crossReferenceCharacters(extractedChars: any[]): Promise<ExtractedCharacter[]> {
    try {
      const result: ExtractedCharacter[] = [];

      for (const char of extractedChars) {
        // Search for existing character in Neo4j
        const query = `
          MATCH (c:Character)
          WHERE toLower(c.name) CONTAINS toLower($name)
          RETURN c.id as id, c.name as name
          LIMIT 1
        `;

        const existing = await neo4jService.read(
          query,
          { name: char.name },
          (records) => records.map(record => ({
            id: record.get('id'),
            name: record.get('name')
          }))
        );

        result.push({
          name: char.name,
          confidence: char.confidence,
          context: char.context,
          isNew: existing.length === 0,
          existingId: existing.length > 0 ? existing[0].id : undefined
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to cross-reference characters', { error });
      return extractedChars.map(char => ({
        name: char.name,
        confidence: char.confidence,
        context: char.context,
        isNew: true
      }));
    }
  }

  /**
   * Cross-reference extracted locations with existing database entries
   */
  private async crossReferenceLocations(extractedLocs: any[]): Promise<ExtractedLocation[]> {
    try {
      const result: ExtractedLocation[] = [];

      for (const loc of extractedLocs) {
        const query = `
          MATCH (l:Location)
          WHERE toLower(l.name) CONTAINS toLower($name)
          RETURN l.id as id, l.name as name
          LIMIT 1
        `;

        const existing = await neo4jService.read(
          query,
          { name: loc.name },
          (records) => records.map(record => ({
            id: record.get('id'),
            name: record.get('name')
          }))
        );

        result.push({
          name: loc.name,
          confidence: loc.confidence,
          context: loc.context,
          isNew: existing.length === 0,
          existingId: existing.length > 0 ? existing[0].id : undefined
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to cross-reference locations', { error });
      return extractedLocs.map(loc => ({
        name: loc.name,
        confidence: loc.confidence,
        context: loc.context,
        isNew: true
      }));
    }
  }

  /**
   * Cross-reference extracted factions with existing database entries
   */
  private async crossReferenceFactions(extractedFactions: any[]): Promise<ExtractedFaction[]> {
    try {
      const result: ExtractedFaction[] = [];

      for (const faction of extractedFactions) {
        const query = `
          MATCH (f:Faction)
          WHERE toLower(f.name) CONTAINS toLower($name)
          RETURN f.id as id, f.name as name
          LIMIT 1
        `;

        const existing = await neo4jService.read(
          query,
          { name: faction.name },
          (records) => records.map(record => ({
            id: record.get('id'),
            name: record.get('name')
          }))
        );

        result.push({
          name: faction.name,
          confidence: faction.confidence,
          context: faction.context,
          isNew: existing.length === 0,
          existingId: existing.length > 0 ? existing[0].id : undefined
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to cross-reference factions', { error });
      return extractedFactions.map(faction => ({
        name: faction.name,
        confidence: faction.confidence,
        context: faction.context,
        isNew: true
      }));
    }
  }

  /**
   * Cross-reference extracted items with existing database entries
   */
  private async crossReferenceItems(extractedItems: any[]): Promise<ExtractedItem[]> {
    try {
      const result: ExtractedItem[] = [];

      for (const item of extractedItems) {
        const query = `
          MATCH (i:Item)
          WHERE toLower(i.name) CONTAINS toLower($name)
          RETURN i.id as id, i.name as name
          LIMIT 1
        `;

        const existing = await neo4jService.read(
          query,
          { name: item.name },
          (records) => records.map(record => ({
            id: record.get('id'),
            name: record.get('name')
          }))
        );

        result.push({
          name: item.name,
          confidence: item.confidence,
          context: item.context,
          type: item.type,
          isNew: existing.length === 0,
          existingId: existing.length > 0 ? existing[0].id : undefined
        });
      }

      return result;
    } catch (error) {
      logger.error('Failed to cross-reference items', { error });
      return extractedItems.map(item => ({
        name: item.name,
        confidence: item.confidence,
        context: item.context,
        type: item.type,
        isNew: true
      }));
    }
  }

  /**
   * Perform enhanced sentiment analysis
   */
  async analyzeSentiment(content: string, entities: EntityExtractionResult): Promise<SentimentAnalysis> {
    try {
      const sentimentPrompt = `Analyze the emotional content and sentiment of this Star Wars story segment:

Consider:
1. Overall emotional tone (positive/negative/neutral)
2. Tension level (0-10, where 10 is extreme tension)
3. Dominant mood
4. Individual character emotions and their intensity
5. Conflict level (0-10, where 10 is active warfare)

Characters mentioned: ${entities.characters.map(c => c.name).join(', ')}

Return JSON:
{
  "overall": "positive|negative|neutral",
  "tension": 0-10,
  "mood": "descriptive mood",
  "emotions": [{"character": "name", "emotion": "emotion", "intensity": 0-10}],
  "conflictLevel": 0-10
}

Content:
${content}`;

      const response = await localAiService.createChatCompletion([
        { role: 'system', content: 'You are an expert in emotional analysis and narrative sentiment.' },
        { role: 'user', content: sentimentPrompt }
      ], { temperature: 0.3, max_tokens: 800 });

      try {
        // Extract JSON from response - handle cases where LLM adds extra text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        logger.error('Failed to parse sentiment analysis', { error: e, response });
        // Return default analysis
        return {
          overall: 'neutral',
          tension: 5,
          mood: 'uncertain',
          emotions: [],
          conflictLevel: 5
        };
      }
    } catch (error) {
      logger.error('Failed to analyze sentiment', { error });
      throw error;
    }
  }

  /**
   * Perform enhanced theme analysis
   */
  async analyzeThemes(content: string, basicThemes: string[]): Promise<ThemeAnalysis> {
    try {
      const themePrompt = `Analyze the Star Wars themes in this content and rate their presence:

Rate each Star Wars theme (0-10):
- Hope: Optimism, belief in a better future
- Redemption: Characters seeking to atone or change
- Power: Corruption, authority, control
- Corruption: Fall to darkness, moral decay
- Sacrifice: Characters giving up something important
- Legacy: Passing down traditions, knowledge, responsibility
- Destiny: Fate, chosen ones, prophetic elements

Also identify narrative arc types and their progression.

Return JSON:
{
  "primaryThemes": ["theme1", "theme2"],
  "starWarsThemes": {
    "hope": 0-10,
    "redemption": 0-10,
    "power": 0-10,
    "corruption": 0-10,
    "sacrifice": 0-10,
    "legacy": 0-10,
    "destiny": 0-10
  },
  "narrativeArcs": [
    {"type": "arc type", "progress": 0-100, "description": "brief description"}
  ]
}

Previously identified themes: ${basicThemes.join(', ')}

Content:
${content}`;

      const response = await localAiService.createChatCompletion([
        { role: 'system', content: 'You are an expert in Star Wars narrative themes and storytelling.' },
        { role: 'user', content: themePrompt }
      ], { temperature: 0.4, max_tokens: 1000 });

      try {
        // Extract JSON from response - handle cases where LLM adds extra text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        logger.error('Failed to parse theme analysis', { error: e, response });
        // Return default analysis
        return {
          primaryThemes: basicThemes,
          starWarsThemes: {
            hope: 5,
            redemption: 5,
            power: 5,
            corruption: 5,
            sacrifice: 5,
            legacy: 5,
            destiny: 5
          },
          narrativeArcs: []
        };
      }
    } catch (error) {
      logger.error('Failed to analyze themes', { error });
      throw error;
    }
  }

  /**
   * Check for story contradictions and consistency issues
   */
  async checkContradictions(content: string, sessionId?: string): Promise<ContradictionCheck> {
    try {
      // Get session history if available for context
      let sessionContext = '';
      if (sessionId) {
        // This would be implemented when world state management is added
        // sessionContext = await this.getSessionContext(sessionId);
      }

      const contradictionPrompt = `Analyze this Star Wars story content for internal contradictions and consistency issues:

Check for:
1. Factual contradictions (conflicting information)
2. Character behavior inconsistencies
3. Timeline contradictions
4. Star Wars lore violations

Rate each contradiction's severity (low/medium/high).
Provide an overall consistency score (0-100, where 100 is perfectly consistent).

Return JSON:
{
  "contradictions": [
    {
      "type": "fact|character|timeline|lore",
      "description": "description of contradiction",
      "severity": "low|medium|high",
      "conflictingElements": ["element1", "element2"]
    }
  ],
  "consistencyScore": 0-100
}

${sessionContext ? `Session Context: ${sessionContext}` : ''}

Content to analyze:
${content}`;

      const response = await localAiService.createChatCompletion([
        { role: 'system', content: 'You are an expert Star Wars lore keeper and story consistency checker.' },
        { role: 'user', content: contradictionPrompt }
      ], { temperature: 0.2, max_tokens: 1000 });

      try {
        // Extract JSON from response - handle cases where LLM adds extra text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        logger.error('Failed to parse contradiction check', { error: e, response });
        // Return default check
        return {
          contradictions: [],
          consistencyScore: 85
        };
      }
    } catch (error) {
      logger.error('Failed to check contradictions', { error });
      throw error;
    }
  }

  /**
   * Analyze dialogue for speaker identification and consistency
   */
  async analyzeDialogue(content: string, knownCharacters: string[]): Promise<{
    speakers: { name: string; confidence: number; dialogue: string }[];
    voiceConsistency: { character: string; consistency: number; issues: string[] }[];
    emotionalTones: { speaker: string; emotion: string; intensity: number }[];
  }> {
    try {
      const dialoguePrompt = `Analyze dialogue in this Star Wars content:

Known characters: ${knownCharacters.join(', ')}

Extract:
1. Speaker identification for each line of dialogue
2. Voice consistency issues for each character
3. Emotional tone of each speaker

Return JSON:
{
  "speakers": [{"name": "speaker", "confidence": 0-1, "dialogue": "what they said"}],
  "voiceConsistency": [{"character": "name", "consistency": 0-100, "issues": ["issue1"]}],
  "emotionalTones": [{"speaker": "name", "emotion": "emotion", "intensity": 0-10}]
}

Content:
${content}`;

      const response = await localAiService.createChatCompletion([
        { role: 'system', content: 'You are an expert in dialogue analysis and character voice consistency.' },
        { role: 'user', content: dialoguePrompt }
      ], { temperature: 0.3, max_tokens: 1200 });

      try {
        // Extract JSON from response - handle cases where LLM adds extra text
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (e) {
        logger.error('Failed to parse dialogue analysis', { error: e, response });
        return {
          speakers: [],
          voiceConsistency: [],
          emotionalTones: []
        };
      }
    } catch (error) {
      logger.error('Failed to analyze dialogue', { error });
      throw error;
    }
  }
}

// Create singleton instance
const storyAnalysisService = new StoryAnalysisService();

export default storyAnalysisService;