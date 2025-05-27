/**
 * Frontend Analytics Service for Star Wars RPG Generator
 * Tracks user interactions, page views, performance metrics, and business events
 */

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  customDimensions?: Record<string, string | number>;
}

export interface PageViewEvent {
  page: string;
  title?: string;
  referrer?: string;
  userType: 'authenticated' | 'anonymous';
  sessionId: string;
  timestamp: number;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  cumulativeLayoutShift?: number;
  firstInputDelay?: number;
}

export interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  userAgent: string;
  referrer?: string;
  faction?: string;
}

class AnalyticsService {
  private sessionId: string;
  private session: UserSession;
  private eventQueue: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;
  private backendUrl: string;

  constructor() {
    this.backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    this.sessionId = this.generateSessionId();
    this.session = this.initializeSession();
    this.setupPerformanceMonitoring();
    this.setupEventListeners();
    
    // Send queued events periodically
    setInterval(() => this.flushEventQueue(), 30000); // Every 30 seconds
    
    // Send events before page unload
    window.addEventListener('beforeunload', () => this.flushEventQueue());
    
    console.log('📊 Analytics service initialized');
  }

  /**
   * Initialize user session
   */
  private initializeSession(): UserSession {
    const session: UserSession = {
      sessionId: this.sessionId,
      startTime: Date.now(),
      lastActivity: Date.now(),
      pageViews: 0,
      events: 0,
      userAgent: navigator.userAgent,
      referrer: document.referrer || undefined
    };

    // Load existing session if available
    try {
      const savedSession = sessionStorage.getItem('swrpg_analytics_session');
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        // Check if session is still valid (within 30 minutes of inactivity)
        if (Date.now() - parsed.lastActivity < 30 * 60 * 1000) {
          return { ...parsed, lastActivity: Date.now() };
        }
      }
    } catch (error) {
      console.warn('Failed to load analytics session:', error);
    }

    return session;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return 'swrpg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Monitor page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (perfData) {
          const metrics: PerformanceMetrics = {
            pageLoadTime: perfData.loadEventEnd - perfData.fetchStart,
            domContentLoaded: perfData.domContentLoadedEventEnd - perfData.fetchStart
          };

          this.trackEvent({
            category: 'Performance',
            action: 'Page Load',
            value: metrics.pageLoadTime,
            customDimensions: {
              domContentLoaded: metrics.domContentLoaded,
              page: window.location.pathname
            }
          });
        }
      }, 1000);
    });

    // Monitor Web Vitals if available
    if ('web-vitals' in window || typeof window.webVitals !== 'undefined') {
      this.setupWebVitalsMonitoring();
    }
  }

  /**
   * Setup Web Vitals monitoring
   */
  private setupWebVitalsMonitoring(): void {
    try {
      // FCP - First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            this.trackEvent({
              category: 'Performance',
              action: 'First Contentful Paint',
              value: entry.startTime,
              customDimensions: { page: window.location.pathname }
            });
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // LCP - Largest Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackEvent({
            category: 'Performance',
            action: 'Largest Contentful Paint',
            value: entry.startTime,
            customDimensions: { page: window.location.pathname }
          });
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // CLS - Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let clsValue = 0;
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        if (clsValue > 0) {
          this.trackEvent({
            category: 'Performance',
            action: 'Cumulative Layout Shift',
            value: clsValue,
            customDimensions: { page: window.location.pathname }
          });
        }
      }).observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.warn('Web Vitals monitoring not available:', error);
    }
  }

  /**
   * Setup global event listeners for automatic tracking
   */
  private setupEventListeners(): void {
    // Track clicks on important elements
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      
      // Track button clicks
      if (target.tagName === 'BUTTON' || target.closest('button')) {
        const button = target.tagName === 'BUTTON' ? target : target.closest('button');
        this.trackEvent({
          category: 'UI',
          action: 'Button Click',
          label: button?.textContent?.trim() || button?.getAttribute('aria-label') || 'Unknown Button'
        });
      }

      // Track link clicks
      if (target.tagName === 'A' || target.closest('a')) {
        const link = target.tagName === 'A' ? target as HTMLAnchorElement : target.closest('a');
        this.trackEvent({
          category: 'Navigation',
          action: 'Link Click',
          label: link?.href || link?.textContent?.trim() || 'Unknown Link'
        });
      }
    });

    // Track form submissions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      this.trackEvent({
        category: 'Form',
        action: 'Submit',
        label: form.id || form.className || 'Unknown Form'
      });
    });

    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth && scrollDepth % 25 === 0) {
        maxScrollDepth = scrollDepth;
        this.trackEvent({
          category: 'Engagement',
          action: 'Scroll Depth',
          label: `${scrollDepth}%`,
          value: scrollDepth
        });
      }
    });
  }

  /**
   * Track page view
   */
  trackPageView(page: string, title?: string, userType: 'authenticated' | 'anonymous' = 'anonymous'): void {
    if (!this.isEnabled) return;

    this.session.pageViews++;
    this.session.lastActivity = Date.now();
    this.updateSessionStorage();

    const pageViewEvent: PageViewEvent = {
      page: this.cleanPath(page),
      title: title || document.title,
      referrer: document.referrer || undefined,
      userType,
      sessionId: this.sessionId,
      timestamp: Date.now()
    };

    this.trackEvent({
      category: 'Navigation',
      action: 'Page View',
      label: pageViewEvent.page,
      customDimensions: {
        title: pageViewEvent.title,
        userType: pageViewEvent.userType,
        sessionId: pageViewEvent.sessionId
      }
    });

    console.log('📊 Page view tracked:', pageViewEvent.page);
  }

  /**
   * Track custom event
   */
  trackEvent(event: AnalyticsEvent): void {
    if (!this.isEnabled) return;

    const enrichedEvent: AnalyticsEvent = {
      ...event,
      customDimensions: {
        ...event.customDimensions,
        sessionId: this.sessionId,
        timestamp: Date.now(),
        page: window.location.pathname,
        userAgent: navigator.userAgent.substring(0, 100), // Truncate for privacy
      }
    };

    this.session.events++;
    this.session.lastActivity = Date.now();
    this.updateSessionStorage();

    this.eventQueue.push(enrichedEvent);

    // Immediately send high-priority events
    if (event.category === 'Error' || event.category === 'Auth') {
      this.flushEventQueue();
    }

    console.log('📊 Event tracked:', event.category, event.action);
  }

  /**
   * Track Star Wars RPG specific events
   */
  trackStoryGeneration(type: 'character' | 'location' | 'quest' | 'dialogue', era: string, success: boolean): void {
    this.trackEvent({
      category: 'Star Wars RPG',
      action: 'Story Generation',
      label: `${type}_${era}`,
      value: success ? 1 : 0,
      customDimensions: {
        type,
        era,
        success: success.toString()
      }
    });
  }

  trackCharacterCreation(faction: string, era: string, success: boolean): void {
    this.trackEvent({
      category: 'Star Wars RPG',
      action: 'Character Creation',
      label: `${faction}_${era}`,
      value: success ? 1 : 0,
      customDimensions: {
        faction,
        era,
        success: success.toString()
      }
    });
  }

  trackFactionSelection(newFaction: string, previousFaction?: string): void {
    this.session.faction = newFaction;
    this.updateSessionStorage();

    this.trackEvent({
      category: 'Star Wars RPG',
      action: 'Faction Selection',
      label: newFaction,
      customDimensions: {
        newFaction,
        previousFaction: previousFaction || 'none'
      }
    });
  }

  trackFeatureUsage(feature: string, action: string, success: boolean = true): void {
    this.trackEvent({
      category: 'Feature Usage',
      action: feature,
      label: action,
      value: success ? 1 : 0,
      customDimensions: {
        success: success.toString()
      }
    });
  }

  /**
   * Track user authentication events
   */
  trackAuth(action: 'login' | 'register' | 'logout', success: boolean, userId?: string): void {
    if (userId) {
      this.session.userId = userId;
      this.updateSessionStorage();
    }

    this.trackEvent({
      category: 'Auth',
      action: action.charAt(0).toUpperCase() + action.slice(1),
      value: success ? 1 : 0,
      customDimensions: {
        success: success.toString(),
        userId: userId || 'anonymous'
      }
    });
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: string): void {
    this.trackEvent({
      category: 'Error',
      action: error.name || 'Unknown Error',
      label: error.message,
      customDimensions: {
        context: context || 'unknown',
        stack: error.stack?.substring(0, 500) // Truncate stack trace
      }
    });
  }

  /**
   * Clean up URL paths for privacy
   */
  private cleanPath(path: string): string {
    return path
      .replace(/\/[0-9a-fA-F]{24}/g, '/:id') // MongoDB ObjectIDs
      .replace(/\/\d+/g, '/:id') // Numeric IDs
      .replace(/\/[0-9a-fA-F-]{36}/g, '/:uuid') // UUIDs
      .split('?')[0]; // Remove query parameters
  }

  /**
   * Update session in storage
   */
  private updateSessionStorage(): void {
    try {
      sessionStorage.setItem('swrpg_analytics_session', JSON.stringify(this.session));
    } catch (error) {
      console.warn('Failed to update analytics session:', error);
    }
  }

  /**
   * Send events to backend
   */
  private async flushEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(`${this.backendUrl}/api/analytics/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session: this.session,
          events
        })
      });

      if (!response.ok) {
        throw new Error(`Analytics API responded with ${response.status}`);
      }

      console.log(`📊 Sent ${events.length} analytics events to backend`);
    } catch (error) {
      console.warn('Failed to send analytics events:', error);
      // Re-queue events for retry (but limit queue size to prevent memory issues)
      this.eventQueue = [...events.slice(-50), ...this.eventQueue];
    }
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    console.log('📊 Analytics', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Get current session info
   */
  getSession(): UserSession {
    return { ...this.session };
  }

  /**
   * End current session
   */
  endSession(): void {
    this.flushEventQueue();
    this.trackEvent({
      category: 'Session',
      action: 'End',
      value: Date.now() - this.session.startTime,
      customDimensions: {
        duration: (Date.now() - this.session.startTime).toString(),
        pageViews: this.session.pageViews.toString(),
        events: this.session.events.toString()
      }
    });
    
    sessionStorage.removeItem('swrpg_analytics_session');
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
export default analyticsService;