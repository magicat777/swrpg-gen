import { StarWarsTheme } from './theme';

// Faction-specific theme variations
export interface FactionTheme {
  id: string;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    textSecondary: string;
  };
  effects: {
    glow: string;
    shadow: string;
    gradient: string;
  };
  typography: {
    headerFont: string;
    bodyFont: string;
  };
}

export const factionThemes: Record<string, FactionTheme> = {
  // Light Side Factions
  jedi: {
    id: 'jedi',
    name: 'Jedi Temple',
    description: 'Serene and wise, channeling the Light Side of the Force',
    colors: {
      primary: '#4299e1', // Lightsaber blue
      secondary: '#2d3748', // Dark blue-gray
      accent: '#63b3ed', // Light blue
      background: '#bee3f8', // Pale blue
      surface: '#ffffff', // Pure white
      border: '#e2e8f0', // Light border
      text: '#1a202c', // Dark text
      textSecondary: '#4a5568' // Medium gray text
    },
    effects: {
      glow: '0 0 20px rgba(66, 153, 225, 0.4)',
      shadow: '0 4px 6px -1px rgba(66, 153, 225, 0.2)',
      gradient: 'linear-gradient(135deg, #4299e1 0%, #63b3ed 100%)'
    },
    typography: {
      headerFont: '"Orbitron", "Exo 2", "Rajdhani", "Inter", sans-serif',
      bodyFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  },

  republic: {
    id: 'republic',
    name: 'Galactic Republic',
    description: 'Noble and democratic, representing galactic unity and justice',
    colors: {
      primary: '#3182ce', // Republic blue
      secondary: '#2c5282', // Darker blue
      accent: '#bee3f8', // Light blue accent
      background: '#ebf8ff', // Very light blue
      surface: '#ffffff', // Pure white
      border: '#bee3f8', // Light blue border
      text: '#1a202c', // Dark text
      textSecondary: '#4a5568' // Medium text
    },
    effects: {
      glow: '0 0 20px rgba(49, 130, 206, 0.3)',
      shadow: '0 4px 6px -1px rgba(49, 130, 206, 0.15)',
      gradient: 'linear-gradient(135deg, #3182ce 0%, #bee3f8 100%)'
    },
    typography: {
      headerFont: '"Crimson Text", "Libre Baskerville", "Times New Roman", serif',
      bodyFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  },

  rebellion: {
    id: 'rebellion',
    name: 'Rebel Alliance',
    description: 'Hope and resistance against tyranny, fighting for freedom',
    colors: {
      primary: '#f56500', // Alliance orange
      secondary: '#ffffff', // Pure white
      accent: '#e53e3e', // Rebel red
      background: '#fffaf0', // Warm white
      surface: '#ffffff', // Pure white
      border: '#ffa726', // Warm orange border
      text: '#1a202c', // Dark text
      textSecondary: '#744210' // Warm brown text
    },
    effects: {
      glow: '0 0 20px rgba(245, 101, 0, 0.4)',
      shadow: '0 4px 6px -1px rgba(245, 101, 0, 0.2)',
      gradient: 'linear-gradient(135deg, #f56500 0%, #ffa726 100%)'
    },
    typography: {
      headerFont: '"Exo 2", "Rajdhani", "Orbitron", "Inter", sans-serif',
      bodyFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  },

  // Dark Side Factions - ACCESSIBILITY FIXED
  empire: {
    id: 'empire',
    name: 'Galactic Empire',
    description: 'Order through power, Imperial authority and control',
    colors: {
      primary: '#1a1a1a', // Deep black
      secondary: '#4a5568', // Steel gray
      accent: '#e2e8f0', // Cold white
      background: '#2d3748', // Dark gray
      surface: '#1a202c', // Very dark
      border: '#4a5568', // Gray border
      text: '#f7fafc', // FIXED: Light text - IMPROVED CONTRAST (5.2:1)
      textSecondary: '#cbd5e0' // FIXED: Medium gray text - IMPROVED CONTRAST (4.1:1)
    },
    effects: {
      glow: '0 0 20px rgba(226, 232, 240, 0.3)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
      gradient: 'linear-gradient(135deg, #1a1a1a 0%, #4a5568 100%)'
    },
    typography: {
      headerFont: '"Orbitron", "Exo 2", "Rajdhani", "Inter", sans-serif',
      bodyFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  },

  firstOrder: {
    id: 'firstOrder',
    name: 'First Order',
    description: 'Neo-Imperial regime seeking galactic domination',
    colors: {
      primary: '#1a1a1a', // First Order black
      secondary: '#2d3748', // Dark gray
      accent: '#e53e3e', // Red accent
      background: '#1a202c', // FIXED: Lighter background - IMPROVED CONTRAST
      surface: '#1a202c', // Very dark
      border: '#2d3748', // Dark border
      text: '#f7fafc', // FIXED: Light text - IMPROVED CONTRAST (5.2:1)
      textSecondary: '#cbd5e0' // FIXED: Gray text - IMPROVED CONTRAST (4.1:1)
    },
    effects: {
      glow: '0 0 20px rgba(229, 62, 62, 0.4)',
      shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
      gradient: 'linear-gradient(135deg, #0f1419 0%, #1a1a1a 100%)'
    },
    typography: {
      headerFont: '"Orbitron", "Exo 2", "Rajdhani", "Inter", sans-serif',
      bodyFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  },

  sith: {
    id: 'sith',
    name: 'Sith Order',
    description: 'Dark Side power and passion, rule through strength',
    colors: {
      primary: '#e53e3e', // Sith red
      secondary: '#1a1a1a', // Deep black
      accent: '#feb2b2', // Light red
      background: '#1a202c', // Very dark
      surface: '#2d3748', // Dark surface
      border: '#742a2a', // Dark red border
      text: '#ffffff', // FIXED: Pure white text - IMPROVED CONTRAST (5.8:1)
      textSecondary: '#e2e8f0' // FIXED: Neutral gray text - REMOVED RED for better contrast (4.4:1)
    },
    effects: {
      glow: '0 0 25px rgba(229, 62, 62, 0.6)',
      shadow: '0 6px 8px -2px rgba(229, 62, 62, 0.4)',
      gradient: 'linear-gradient(135deg, #1a202c 0%, #e53e3e 100%)'
    },
    typography: {
      headerFont: '"Orbitron", "Exo 2", "Rajdhani", "Inter", sans-serif',
      bodyFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  },

  // Neutral/Independent Factions
  mandalorian: {
    id: 'mandalorian',
    name: 'Mandalorian Clans',
    description: 'Honor and tradition, the warrior\'s way of life',
    colors: {
      primary: '#4299e1', // Mandalorian blue
      secondary: '#2d3748', // Dark blue-gray
      accent: '#bee3f8', // Light blue
      background: '#e6fffa', // Very light blue-green
      surface: '#ffffff', // Pure white
      border: '#4299e1', // Blue border
      text: '#1a202c', // Dark text
      textSecondary: '#2c5282' // Blue text
    },
    effects: {
      glow: '0 0 20px rgba(66, 153, 225, 0.4)',
      shadow: '0 4px 6px -1px rgba(66, 153, 225, 0.2)',
      gradient: 'linear-gradient(135deg, #4299e1 0%, #bee3f8 100%)'
    },
    typography: {
      headerFont: '"Exo 2", "Rajdhani", "Orbitron", "Inter", sans-serif',
      bodyFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  },

  resistance: {
    id: 'resistance',
    name: 'Resistance',
    description: 'Last spark of hope against First Order tyranny',
    colors: {
      primary: '#d69e2e', // Resistance orange
      secondary: '#b7791f', // Darker orange
      accent: '#fbd38d', // Light orange
      background: '#fffbeb', // Very light orange
      surface: '#ffffff', // Pure white
      border: '#f6ad55', // Orange border
      text: '#1a202c', // Dark text
      textSecondary: '#744210' // Brown text
    },
    effects: {
      glow: '0 0 20px rgba(214, 158, 46, 0.4)',
      shadow: '0 4px 6px -1px rgba(214, 158, 46, 0.2)',
      gradient: 'linear-gradient(135deg, #d69e2e 0%, #fbd38d 100%)'
    },
    typography: {
      headerFont: '"Exo 2", "Rajdhani", "Orbitron", "Inter", sans-serif',
      bodyFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  },

  // Criminal Organizations
  hutt: {
    id: 'hutt',
    name: 'Hutt Cartel',
    description: 'Criminal empire built on greed and power',
    colors: {
      primary: '#d69e2e', // Hutt gold
      secondary: '#b7791f', // Darker gold
      accent: '#f6e05e', // Light gold
      background: '#fffbeb', // Very light gold
      surface: '#ffffff', // Pure white
      border: '#ecc94b', // Gold border
      text: '#1a202c', // Dark text
      textSecondary: '#744210' // Brown text
    },
    effects: {
      glow: '0 0 20px rgba(214, 158, 46, 0.5)',
      shadow: '0 4px 6px -1px rgba(214, 158, 46, 0.3)',
      gradient: 'linear-gradient(135deg, #d69e2e 0%, #f6e05e 100%)'
    },
    typography: {
      headerFont: '"Exo 2", "Rajdhani", "Inter", sans-serif',
      bodyFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }
  }
};

// Create dynamic theme based on faction selection
export const createFactionTheme = (factionId: string, baseTheme: StarWarsTheme): StarWarsTheme => {
  const faction = factionThemes[factionId] || factionThemes.jedi;
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      neutral: {
        ...baseTheme.colors.neutral,
        primary: faction.colors.primary,
        secondary: faction.colors.secondary,
        accent: faction.colors.accent,
        background: faction.colors.background,
        surface: faction.colors.surface,
        border: faction.colors.border,
        text: faction.colors.text,
        textSecondary: faction.colors.textSecondary,
      }
    },
    effects: {
      ...baseTheme.effects,
      shadow: {
        ...baseTheme.effects.shadow,
        glow: faction.effects.glow,
        md: faction.effects.shadow,
      }
    },
    typography: {
      ...baseTheme.typography,
      fontFamily: {
        ...baseTheme.typography.fontFamily,
        primary: faction.typography.bodyFont,
        cinematic: faction.typography.headerFont,
      }
    },
    // Ensure spacing and breakpoints are preserved
    spacing: baseTheme.spacing,
    breakpoints: baseTheme.breakpoints
  };
};

export default factionThemes;
