import React from 'react';
import { useSettings } from '../../services/settings/SettingsContext';
import { FactionThemeProvider } from '../../styles/FactionThemeContext';
import { AnalyticsProvider } from '../../services/analytics/AnalyticsContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const { settings } = useSettings();

  return (
    <FactionThemeProvider>
      <AnalyticsProvider>
        {children}
      </AnalyticsProvider>
    </FactionThemeProvider>
  );
};