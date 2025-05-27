import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider } from 'styled-components';
import { starWarsTheme } from './theme';
import { createFactionTheme, factionThemes } from './factionThemes';

interface FactionThemeContextType {
  currentFaction: string;
  setFaction: (factionId: string) => void;
  availableFactions: typeof factionThemes;
}

const FactionThemeContext = createContext<FactionThemeContextType>({
  currentFaction: 'jedi',
  setFaction: () => {},
  availableFactions: factionThemes,
});

export const useFactionTheme = () => {
  const context = useContext(FactionThemeContext);
  if (!context) {
    throw new Error('useFactionTheme must be used within a FactionThemeProvider');
  }
  return context;
};

interface FactionThemeProviderProps {
  children: ReactNode;
}

export const FactionThemeProvider: React.FC<FactionThemeProviderProps> = ({ children }) => {
  const [currentFaction, setCurrentFaction] = useState<string>('jedi');

  // Load saved faction preference on mount
  useEffect(() => {
    const savedFaction = localStorage.getItem('dashboardTheme');
    if (savedFaction && factionThemes[savedFaction]) {
      setCurrentFaction(savedFaction);
    }
  }, []);

  const setFaction = (factionId: string) => {
    if (factionThemes[factionId]) {
      setCurrentFaction(factionId);
      localStorage.setItem('dashboardTheme', factionId);
      console.log(`🎨 Switched to ${factionThemes[factionId].name} theme`);
    }
  };

  // Create dynamic theme based on current faction
  const dynamicTheme = createFactionTheme(currentFaction, starWarsTheme);

  return (
    <FactionThemeContext.Provider 
      value={{ 
        currentFaction, 
        setFaction, 
        availableFactions: factionThemes 
      }}
    >
      <ThemeProvider theme={dynamicTheme}>
        {children}
      </ThemeProvider>
    </FactionThemeContext.Provider>
  );
};

export default FactionThemeProvider;