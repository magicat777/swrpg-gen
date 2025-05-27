import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { starWarsTheme, StarWarsTheme } from './theme';

interface ThemeContextType {
  theme: StarWarsTheme;
  currentTheme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  themeMode: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
}

const fontSizeMultipliers = {
  small: 0.875,  // 14px base
  medium: 1,     // 16px base  
  large: 1.125   // 18px base
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  themeMode, 
  fontSize 
}) => {
  const [currentTheme, setCurrentTheme] = React.useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (themeMode === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      setCurrentTheme(mediaQuery.matches ? 'dark' : 'light');
      
      const handleChange = (e: MediaQueryListEvent) => {
        setCurrentTheme(e.matches ? 'dark' : 'light');
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setCurrentTheme(themeMode);
    }
  }, [themeMode]);

  const adaptedTheme = useMemo((): StarWarsTheme => {
    const multiplier = fontSizeMultipliers[fontSize];
    const isDark = currentTheme === 'dark';
    
    return {
      ...starWarsTheme,
      colors: {
        ...starWarsTheme.colors,
        neutral: {
          ...starWarsTheme.colors.neutral,
          // Swap colors based on theme
          primary: isDark ? starWarsTheme.colors.darkSide.surface : starWarsTheme.colors.neutral.primary,
          background: isDark ? starWarsTheme.colors.darkSide.background : starWarsTheme.colors.lightSide.background,
          surface: isDark ? starWarsTheme.colors.darkSide.surface : starWarsTheme.colors.lightSide.surface,
          text: isDark ? starWarsTheme.colors.lightSide.surface : starWarsTheme.colors.neutral.text,
          textSecondary: isDark ? starWarsTheme.colors.neutral.accent : starWarsTheme.colors.neutral.textSecondary,
          border: isDark ? starWarsTheme.colors.neutral.secondary : starWarsTheme.colors.neutral.border,
        },
      },
      typography: {
        ...starWarsTheme.typography,
        fontSize: {
          xs: `${0.75 * multiplier}rem`,
          sm: `${0.875 * multiplier}rem`,
          base: `${1 * multiplier}rem`,
          lg: `${1.125 * multiplier}rem`,
          xl: `${1.25 * multiplier}rem`,
          '2xl': `${1.5 * multiplier}rem`,
          '3xl': `${1.875 * multiplier}rem`,
          '4xl': `${2.25 * multiplier}rem`,
        },
      },
    };
  }, [currentTheme, fontSize]);

  const contextValue: ThemeContextType = {
    theme: adaptedTheme,
    currentTheme,
    fontSize,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <StyledThemeProvider theme={adaptedTheme}>
        {children}
      </StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};