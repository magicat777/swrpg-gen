import metricsService from './metricsService';
import { logger } from '../utils/logger';

/**
 * Business Metrics Service for Star Wars RPG Generator
 * Tracks business-specific events and KPIs
 */
class BusinessMetricsService {
  
  /**
   * Track story generation events with enhanced context
   */
  trackStoryGeneration(
    type: 'character' | 'location' | 'quest' | 'dialogue',
    era: string,
    success: boolean,
    complexity: 'simple' | 'moderate' | 'complex' = 'moderate',
    generationTimeMs?: number,
    wordCount?: number,
    userId?: string
  ): void {
    try {
      metricsService.recordStoryGeneration(type, era, success ? 'success' : 'error', complexity);
      
      // Additional business intelligence
      metricsService.recordFeatureUsage(
        'Story Generation',
        `${type}_${era}`,
        success
      );

      if (generationTimeMs) {
        metricsService.httpRequestDuration.observe(
          { method: 'POST', route: '/api/story/generate', status_code: success ? '200' : '500' },
          generationTimeMs / 1000
        );
      }

      logger.info('📊 Story generation tracked', {
        type,
        era,
        success,
        complexity,
        generationTimeMs,
        wordCount,
        userId
      });
    } catch (error) {
      logger.error('Failed to track story generation:', error);
    }
  }

  /**
   * Track character creation with detailed metrics
   */
  trackCharacterCreation(
    faction: string,
    era: string,
    success: boolean,
    characterType?: string,
    creationMethod?: 'manual' | 'generated' | 'template',
    userId?: string
  ): void {
    try {
      metricsService.recordCharacterCreation(faction, era, success ? 'success' : 'error');
      
      metricsService.recordFeatureUsage(
        'Character Creation',
        characterType || 'unknown',
        success
      );

      // Track creation method preference
      if (creationMethod) {
        metricsService.recordFeatureUsage(
          'Character Creation Method',
          creationMethod,
          success
        );
      }

      logger.info('📊 Character creation tracked', {
        faction,
        era,
        success,
        characterType,
        creationMethod,
        userId
      });
    } catch (error) {
      logger.error('Failed to track character creation:', error);
    }
  }

  /**
   * Track faction theme selections and user preferences
   */
  trackFactionEngagement(
    newFaction: string,
    previousFaction?: string,
    sessionDurationMs?: number,
    userId?: string
  ): void {
    try {
      metricsService.recordFactionSelection(newFaction, previousFaction || 'none');
      
      // Track faction popularity
      metricsService.recordFeatureUsage(
        'Faction Popularity',
        newFaction,
        true
      );

      // Track session engagement by faction
      if (sessionDurationMs) {
        metricsService.sessionDuration.observe(
          { user_type: userId ? 'user' : 'anonymous' },
          sessionDurationMs / 1000
        );
      }

      logger.info('📊 Faction engagement tracked', {
        newFaction,
        previousFaction,
        sessionDurationMs,
        userId
      });
    } catch (error) {
      logger.error('Failed to track faction engagement:', error);
    }
  }

  /**
   * Track user session activities and engagement patterns
   */
  trackSessionActivity(
    sessionId: string,
    activityType: 'page_view' | 'feature_use' | 'content_create' | 'content_view',
    details: {
      page?: string;
      feature?: string;
      contentType?: string;
      duration?: number;
      userId?: string;
      faction?: string;
    }
  ): void {
    try {
      // Track general session activity
      metricsService.recordFeatureUsage(
        'Session Activity',
        activityType,
        true
      );

      // Track page engagement
      if (details.page) {
        metricsService.recordPageView(
          details.page,
          details.userId ? 'authenticated' : 'anonymous'
        );
      }

      // Track feature engagement by faction
      if (details.faction && details.feature) {
        metricsService.recordFeatureUsage(
          `${details.faction} Features`,
          details.feature,
          true
        );
      }

      logger.debug('📊 Session activity tracked', {
        sessionId,
        activityType,
        ...details
      });
    } catch (error) {
      logger.error('Failed to track session activity:', error);
    }
  }

  /**
   * Track content consumption patterns
   */
  trackContentEngagement(
    contentType: 'character' | 'location' | 'faction' | 'timeline' | 'lore',
    action: 'view' | 'create' | 'edit' | 'delete' | 'share',
    contentId: string,
    success: boolean = true,
    metadata?: {
      era?: string;
      faction?: string;
      complexity?: string;
      userId?: string;
      timeSpentMs?: number;
    }
  ): void {
    try {
      metricsService.recordFeatureUsage(
        `Content ${action.charAt(0).toUpperCase() + action.slice(1)}`,
        contentType,
        success
      );

      // Track content by era
      if (metadata?.era) {
        metricsService.recordFeatureUsage(
          `${metadata.era} Content`,
          `${contentType}_${action}`,
          success
        );
      }

      // Track content by faction
      if (metadata?.faction) {
        metricsService.recordFeatureUsage(
          `${metadata.faction} Content`,
          `${contentType}_${action}`,
          success
        );
      }

      logger.info('📊 Content engagement tracked', {
        contentType,
        action,
        contentId,
        success,
        ...metadata
      });
    } catch (error) {
      logger.error('Failed to track content engagement:', error);
    }
  }

  /**
   * Track user onboarding and conversion funnel
   */
  trackUserJourney(
    stage: 'registration' | 'first_login' | 'first_character' | 'first_story' | 'first_session' | 'retention_7d' | 'retention_30d',
    userId: string,
    success: boolean = true,
    metadata?: {
      source?: string;
      timeToComplete?: number;
      faction?: string;
    }
  ): void {
    try {
      metricsService.recordFeatureUsage(
        'User Journey',
        stage,
        success
      );

      // Track conversion funnel
      metricsService.recordFeatureUsage(
        'Conversion Funnel',
        stage,
        success
      );

      // Track by acquisition source
      if (metadata?.source) {
        metricsService.recordFeatureUsage(
          `Acquisition ${metadata.source}`,
          stage,
          success
        );
      }

      logger.info('📊 User journey tracked', {
        stage,
        userId,
        success,
        ...metadata
      });
    } catch (error) {
      logger.error('Failed to track user journey:', error);
    }
  }

  /**
   * Track system performance and health metrics
   */
  trackSystemHealth(
    component: 'database' | 'api' | 'localai' | 'frontend',
    metric: 'response_time' | 'error_rate' | 'availability' | 'throughput',
    value: number,
    status: 'healthy' | 'degraded' | 'critical' = 'healthy'
  ): void {
    try {
      metricsService.recordFeatureUsage(
        `System ${component.charAt(0).toUpperCase() + component.slice(1)}`,
        metric,
        status === 'healthy'
      );

      // Record specific system metrics
      if (metric === 'error_rate') {
        metricsService.recordError(
          'System Error',
          component,
          status === 'critical' ? 'critical' : 'medium'
        );
      }

      logger.debug('📊 System health tracked', {
        component,
        metric,
        value,
        status
      });
    } catch (error) {
      logger.error('Failed to track system health:', error);
    }
  }

  /**
   * Generate business intelligence summary
   */
  async generateBusinessSummary(): Promise<{
    storyGeneration: { total: number; successRate: number; topTypes: string[] };
    userEngagement: { activeSessions: number; topFactions: string[]; avgSessionTime: number };
    contentCreation: { totalCharacters: number; totalLocations: number; topEras: string[] };
    systemHealth: { uptime: number; errorRate: number; avgResponseTime: number };
  }> {
    try {
      // This would typically query aggregated metrics
      // For now, return a basic structure that could be populated from Prometheus queries
      const summary = {
        storyGeneration: {
          total: 0,
          successRate: 0,
          topTypes: ['character', 'location', 'quest']
        },
        userEngagement: {
          activeSessions: 0,
          topFactions: ['jedi', 'empire', 'rebellion'],
          avgSessionTime: 0
        },
        contentCreation: {
          totalCharacters: 0,
          totalLocations: 0,
          topEras: ['Original Trilogy', 'Prequel Trilogy', 'Sequel Trilogy']
        },
        systemHealth: {
          uptime: process.uptime(),
          errorRate: 0,
          avgResponseTime: 0
        }
      };

      logger.info('📊 Business summary generated', summary);
      return summary;
    } catch (error) {
      logger.error('Failed to generate business summary:', error);
      throw error;
    }
  }

  /**
   * Track A/B test results for feature experiments
   */
  trackABTest(
    testName: string,
    variant: string,
    userId: string,
    conversionEvent?: string,
    success: boolean = true
  ): void {
    try {
      metricsService.recordFeatureUsage(
        `AB Test ${testName}`,
        variant,
        success
      );

      if (conversionEvent) {
        metricsService.recordFeatureUsage(
          `AB Conversion ${testName}`,
          `${variant}_${conversionEvent}`,
          success
        );
      }

      logger.info('📊 A/B test tracked', {
        testName,
        variant,
        userId,
        conversionEvent,
        success
      });
    } catch (error) {
      logger.error('Failed to track A/B test:', error);
    }
  }
}

// Export singleton instance
export default new BusinessMetricsService();