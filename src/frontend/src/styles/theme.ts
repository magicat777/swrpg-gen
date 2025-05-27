export interface StarWarsTheme {
  colors: {
    // Light Side Colors
    lightSide: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
    };
    // Dark Side Colors
    darkSide: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
    };
    // Neutral Colors
    neutral: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      surface: string;
      text: string;
      textSecondary: string;
      border: string;
    };
    // Faction Colors
    factions: {
      empire: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
      rebellion: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
      republic: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
      firstOrder: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
      resistance: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
      jedi: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
      sith: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
      mandalorian: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
      hutt: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
      };
    };
    // Semantic Colors
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: {
      primary: string;
      secondary: string;
      monospace: string;
      cinematic: string;
      technical: string;
      lore: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
      heavy: number;
      black: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  breakpoints: {
    mobile: string;
    tablet: string;
    desktop: string;
    wide: string;
  };
  effects: {
    shadow: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      glow: string;
    };
    borderRadius: {
      sm: string;
      md: string;
      lg: string;
      full: string;
    };
    transition: {
      fast: string;
      normal: string;
      slow: string;
    };
  };
}

export const starWarsTheme: StarWarsTheme = {
  colors: {
    lightSide: {
      primary: '#4F9EFF', // Light blue
      secondary: '#7DD3FC', // Sky blue
      accent: '#FCD34D', // Golden yellow
      background: '#F8FAFC', // Very light blue
      surface: '#FFFFFF',
    },
    darkSide: {
      primary: '#DC2626', // Deep red
      secondary: '#991B1B', // Dark red
      accent: '#FBBF24', // Amber
      background: '#0F172A', // Very dark blue
      surface: '#1E293B', // Dark slate
    },
    neutral: {
      primary: '#1E293B', // Dark slate
      secondary: '#475569', // Slate
      accent: '#94A3B8', // Light slate
      background: '#F1F5F9', // Very light slate
      surface: '#FFFFFF',
      text: '#0F172A', // Very dark slate
      textSecondary: '#64748B', // Medium slate
      border: '#E2E8F0', // Light slate border
    },
    factions: {
      empire: {
        primary: '#2D3748', // Imperial dark gray
        secondary: '#4A5568', // Lighter gray
        accent: '#E53E3E', // Imperial red
        background: '#1A202C', // Very dark gray
      },
      rebellion: {
        primary: '#E53E3E', // Rebel red
        secondary: '#C53030', // Darker red
        accent: '#FED7D7', // Light red accent
        background: '#742A2A', // Dark red background
      },
      republic: {
        primary: '#3182CE', // Republic blue
        secondary: '#2C5282', // Darker blue
        accent: '#BEE3F8', // Light blue accent
        background: '#2A4365', // Dark blue background
      },
      firstOrder: {
        primary: '#1A202C', // First Order black
        secondary: '#2D3748', // Dark gray
        accent: '#E53E3E', // Red accent
        background: '#0F1419', // Almost black
      },
      resistance: {
        primary: '#D69E2E', // Orange
        secondary: '#B7791F', // Darker orange
        accent: '#FBD38D', // Light orange
        background: '#744210', // Dark orange background
      },
      jedi: {
        primary: '#38A169', // Jedi green
        secondary: '#2F855A', // Darker green
        accent: '#C6F6D5', // Light green
        background: '#22543D', // Dark green background
      },
      sith: {
        primary: '#E53E3E', // Sith red
        secondary: '#C53030', // Darker red
        accent: '#FED7D7', // Light red
        background: '#742A2A', // Dark red background
      },
      mandalorian: {
        primary: '#4299E1', // Mandalorian blue
        secondary: '#3182CE', // Darker blue
        accent: '#BEE3F8', // Light blue
        background: '#2C5282', // Dark blue background
      },
      hutt: {
        primary: '#D69E2E', // Hutt gold
        secondary: '#B7791F', // Darker gold
        accent: '#F6E05E', // Light gold
        background: '#744210', // Dark gold background
      },
    },
    success: '#38A169', // Green
    warning: '#D69E2E', // Orange
    error: '#E53E3E', // Red
    info: '#3182CE', // Blue
  },
  typography: {
    fontFamily: {
      // Star Wars Logo & Headers - StarJedi Special Edition with fallbacks
      logo: '"StarJediSpecial", "Helvetica Neue", "Helvetica", "Arial Black", sans-serif',
      // Opening Crawl Body - Star Jedi (Classic Star Wars) with fallbacks  
      crawl: '"StarJedi", "Orbitron", "Times New Roman", serif',
      // Film Titles - Univers Light Ultra Condensed equivalent
      title: '"Helvetica Neue", "Arial Narrow", "Univers", sans-serif',
      // Main UI Text - Clean, readable
      primary: '"Helvetica Neue", "Helvetica", "Arial", sans-serif',
      // Secondary/Technical - Trade Gothic Bold equivalent
      secondary: '"Franklin Gothic Medium", "Trade Gothic", "Arial Bold", sans-serif',
      // Monospace for code/technical
      monospace: '"SF Mono", "Monaco", "Cascadia Code", "Roboto Mono", monospace',
      // Cinematic headers
      cinematic: '"Orbitron", "Exo 2", "Rajdhani", sans-serif',
      // Technical readouts
      technical: '"Eurostile", "Microgramma", "Orbitron", monospace',
      // Lore and story text
      lore: '"Minion Pro", "Adobe Garamond Pro", "Times New Roman", serif',
    },
    fontSize: {
      xs: '0.75rem',   // 12px
      sm: '0.875rem',  // 14px
      base: '1rem',    // 16px
      lg: '1.125rem',  // 18px
      xl: '1.25rem',   // 20px
      '2xl': '1.5rem', // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      light: 300,           // Univers Light Ultra Condensed
      normal: 400,          // Standard UI text
      medium: 500,          // Medium emphasis
      semibold: 600,        // News Gothic Bold
      bold: 700,            // Trade Gothic Bold  
      heavy: 800,           // Franklin Gothic Heavy
      black: 900,           // Helvetica Black (Logo weight)
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    },
  },
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
    '3xl': '4rem',  // 64px
    '4xl': '6rem',  // 96px
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },
  effects: {
    shadow: {
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      glow: '0 0 20px rgba(79, 158, 255, 0.3)',
    },
    borderRadius: {
      sm: '0.25rem',  // 4px
      md: '0.375rem', // 6px
      lg: '0.5rem',   // 8px
      full: '9999px',
    },
    transition: {
      fast: 'all 0.15s ease',
      normal: 'all 0.3s ease',
      slow: 'all 0.5s ease',
    },
  },
};

// Styled Components theme extension
declare module 'styled-components' {
  export interface DefaultTheme extends StarWarsTheme {
    // This interface intentionally extends StarWarsTheme
  }
}