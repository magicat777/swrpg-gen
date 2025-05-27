import { apiGet, apiPost, apiPut, apiPatch } from './apiClient';

export interface UserSettings {
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    fontSize: 'small' | 'medium' | 'large';
    sidebarCollapsed: boolean;
  };
  notifications: {
    sessionUpdates: boolean;
    storyGeneration: boolean;
    systemAlerts: boolean;
    emailNotifications: boolean;
  };
  privacy: {
    dataSharing: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  generation: {
    autoSave: boolean;
    maxStoryLength: number;
    defaultEra: string;
    preferredComplexity: 'simple' | 'moderate' | 'complex';
  };
}

export interface SettingsResponse {
  status: string;
  data?: {
    settings: UserSettings;
  };
  message?: string;
}

/**
 * Get user settings from the backend
 */
export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const response = await apiGet<SettingsResponse>('/settings');
    return response.data?.settings || getDefaultSettings();
  } catch (error) {
    console.error('Error fetching user settings:', error);
    // Return default settings if backend fails
    return getDefaultSettings();
  }
};

/**
 * Get default settings
 */
const getDefaultSettings = (): UserSettings => {
  return {
      appearance: {
        theme: 'dark',
        fontSize: 'medium',
        sidebarCollapsed: false,
      },
      notifications: {
        sessionUpdates: true,
        storyGeneration: true,
        systemAlerts: true,
        emailNotifications: false,
      },
      privacy: {
        dataSharing: false,
        analytics: true,
        crashReports: true,
      },
      generation: {
        autoSave: true,
        maxStoryLength: 5000,
        defaultEra: 'Original Trilogy',
        preferredComplexity: 'moderate',
      },
    };
};

/**
 * Update user settings (full update)
 */
export const updateUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    const response = await apiPut<SettingsResponse>('/settings', { settings });
    return response.data?.settings || getDefaultSettings();
  } catch (error) {
    console.error('Error updating user settings:', error);
    throw error;
  }
};

/**
 * Update a specific settings category
 */
export const updateSettingsCategory = async (
  category: keyof UserSettings,
  updates: Partial<UserSettings[keyof UserSettings]>
): Promise<UserSettings> => {
  try {
    const response = await apiPatch<SettingsResponse>(`/settings/${category}`, updates);
    return response.data?.settings || getDefaultSettings();
  } catch (error) {
    console.error(`Error updating ${category} settings:`, error);
    throw error;
  }
};

/**
 * Reset user settings to defaults
 */
export const resetUserSettings = async (): Promise<UserSettings> => {
  try {
    const response = await apiPost<SettingsResponse>('/settings/reset');
    return response.data?.settings || getDefaultSettings();
  } catch (error) {
    console.error('Error resetting user settings:', error);
    throw error;
  }
};