import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useFactionTheme } from '../../styles/FactionThemeContext';
import analyticsService, { AnalyticsEvent } from './analyticsService';

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => void;
  trackPageView: (page?: string, title?: string) => void;
  trackStoryGeneration: (type: 'character' | 'location' | 'quest' | 'dialogue', era: string, success: boolean) => void;
  trackCharacterCreation: (faction: string, era: string, success: boolean) => void;
  trackFactionSelection: (newFaction: string, previousFaction?: string) => void;
  trackFeatureUsage: (feature: string, action: string, success?: boolean) => void;
  trackError: (error: Error, context?: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const { currentFaction } = useFactionTheme();

  // Track page views automatically
  useEffect(() => {
    const userType = isAuthenticated ? 'authenticated' : 'anonymous';
    analyticsService.trackPageView(location.pathname, document.title, userType);
  }, [location.pathname, isAuthenticated]);

  // Track authentication events
  useEffect(() => {
    if (isAuthenticated && user) {
      analyticsService.trackAuth('login', true, user.id);
    }
  }, [isAuthenticated, user]);

  // Track faction changes
  useEffect(() => {
    const previousFaction = sessionStorage.getItem('swrpg_previous_faction');
    if (previousFaction && previousFaction !== currentFaction) {
      analyticsService.trackFactionSelection(currentFaction, previousFaction);
    }
    sessionStorage.setItem('swrpg_previous_faction', currentFaction);
  }, [currentFaction]);

  // Setup global error tracking
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      analyticsService.trackError(new Error(event.message), 'Global Error Handler');
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      analyticsService.trackError(
        new Error(event.reason?.message || 'Unhandled Promise Rejection'), 
        'Promise Rejection'
      );
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      analyticsService.endSession();
    };
  }, []);

  const contextValue: AnalyticsContextType = {
    trackEvent: (event: AnalyticsEvent) => analyticsService.trackEvent(event),
    trackPageView: (page?: string, title?: string) => {
      const userType = isAuthenticated ? 'authenticated' : 'anonymous';
      analyticsService.trackPageView(page || location.pathname, title, userType);
    },
    trackStoryGeneration: (type, era, success) => analyticsService.trackStoryGeneration(type, era, success),
    trackCharacterCreation: (faction, era, success) => analyticsService.trackCharacterCreation(faction, era, success),
    trackFactionSelection: (newFaction, previousFaction) => analyticsService.trackFactionSelection(newFaction, previousFaction),
    trackFeatureUsage: (feature, action, success) => analyticsService.trackFeatureUsage(feature, action, success),
    trackError: (error, context) => analyticsService.trackError(error, context),
  };

  return (
    <AnalyticsContext.Provider value={contextValue}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = (): AnalyticsContextType => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export default AnalyticsContext;