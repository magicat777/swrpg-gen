import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getUserSettings, updateSettingsCategory, resetUserSettings } from '../api/settingsApi';

export interface Settings {
  appearance: {
    defaultFaction: string;           // Default faction theme on login
    highContrast: boolean;            // Accessibility: High contrast mode
    reducedMotion: boolean;           // Accessibility: Reduced motion
  };
  generation: {
    autoSave: boolean;                // Automatically save generated content
    defaultEra: string;               // Default Star Wars era for new sessions
    preferredComplexity: 'simple' | 'moderate' | 'complex'; // AI generation complexity
  };
}

const DEFAULT_SETTINGS: Settings = {
  appearance: {
    defaultFaction: 'jedi',           // Default to Jedi theme
    highContrast: false,              // Accessibility off by default
    reducedMotion: false,             // Normal animations by default
  },
  generation: {
    autoSave: true,                   // Auto-save enabled by default
    defaultEra: 'Original Trilogy',   // Classic Star Wars era
    preferredComplexity: 'moderate',  // Balanced complexity
  },
};

type SettingsAction =
  | { type: 'UPDATE_SETTING'; category: keyof Settings; key: string; value: any }
  | { type: 'RESET_SETTINGS' }
  | { type: 'LOAD_SETTINGS'; settings: Settings };

interface SettingsContextType {
  settings: Settings;
  isLoading: boolean;
  updateSetting: (category: keyof Settings, key: string, value: any) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const settingsReducer = (state: Settings, action: SettingsAction): Settings => {
  switch (action.type) {
    case 'UPDATE_SETTING':
      return {
        ...state,
        [action.category]: {
          ...state[action.category],
          [action.key]: action.value,
        },
      };
    case 'RESET_SETTINGS':
      return { ...DEFAULT_SETTINGS };
    case 'LOAD_SETTINGS':
      return { ...action.settings };
    default:
      return state;
  }
};

interface SettingsProviderProps {
  children: React.ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, dispatch] = useReducer(settingsReducer, DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        // Load settings from backend
        try {
          const backendSettings = await getUserSettings();
          dispatch({ type: 'LOAD_SETTINGS', settings: backendSettings });
          console.log('Settings loaded from backend successfully');
        } catch (backendError) {
          console.log('Backend settings failed, falling back to localStorage:', backendError);
        }
        // Fallback to localStorage
        try {
          const savedSettings = localStorage.getItem('swrpg-settings');
          if (savedSettings) {
            const parsedSettings = JSON.parse(savedSettings);
            const mergedSettings = {
              ...DEFAULT_SETTINGS,
              ...parsedSettings,
              appearance: { ...DEFAULT_SETTINGS.appearance, ...parsedSettings.appearance },
              generation: { ...DEFAULT_SETTINGS.generation, ...parsedSettings.generation },
            };
            dispatch({ type: 'LOAD_SETTINGS', settings: mergedSettings });
          }
        } catch (localError) {
          console.error('Failed to load settings from localStorage:', localError);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Save settings to localStorage as backup whenever they change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('swrpg-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error);
      }
    }
  }, [settings, isLoading]);

  const updateSetting = async (category: keyof Settings, key: string, value: any) => {
    try {
      // Optimistically update local state
      dispatch({ type: 'UPDATE_SETTING', category, key, value });
      
      // Update on backend
      try {
        const updates = { [key]: value };
        await updateSettingsCategory(category, updates);
        console.log('Setting updated on backend:', { category, key, value });
      } catch (error) {
        console.log('Backend settings update failed, keeping local change:', error);
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
      // Could implement rollback here if needed
    }
  };

  const resetSettings = async () => {
    try {
      // TODO: Re-enable when backend settings endpoints are working
      // const defaultSettings = await resetUserSettings();
      // dispatch({ type: 'LOAD_SETTINGS', settings: defaultSettings });
      
      // For now, just reset locally
      dispatch({ type: 'RESET_SETTINGS' });
      console.log('Settings reset to defaults');
    } catch (error) {
      console.error('Failed to reset settings:', error);
      // Fallback to local reset
      dispatch({ type: 'RESET_SETTINGS' });
    }
  };

  const contextValue: SettingsContextType = {
    settings,
    isLoading,
    updateSetting,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};