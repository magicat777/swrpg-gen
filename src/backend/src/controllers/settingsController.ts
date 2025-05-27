import { Request, Response } from 'express';
import { logger } from '../utils/logger';

interface UserSettings {
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

const DEFAULT_SETTINGS: UserSettings = {
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

// In-memory storage for demo purposes - in production, this would use a database
const userSettingsStore = new Map<string, UserSettings>();

/**
 * Get user settings
 */
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    // Get settings from store or return defaults
    const settings = userSettingsStore.get(userId) || DEFAULT_SETTINGS;

    logger.info(`Retrieved settings for user ${userId}`);

    return res.json({
      status: 'success',
      data: { settings },
    });
  } catch (error) {
    logger.error('Error retrieving user settings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve settings',
    });
  }
};

/**
 * Update user settings
 */
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { settings } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    if (!settings) {
      return res.status(400).json({
        status: 'error',
        message: 'Settings data is required',
      });
    }

    // Get current settings or defaults
    const currentSettings = userSettingsStore.get(userId) || DEFAULT_SETTINGS;

    // Merge new settings with current settings
    const updatedSettings: UserSettings = {
      appearance: { ...currentSettings.appearance, ...settings.appearance },
      notifications: { ...currentSettings.notifications, ...settings.notifications },
      privacy: { ...currentSettings.privacy, ...settings.privacy },
      generation: { ...currentSettings.generation, ...settings.generation },
    };

    // Store updated settings
    userSettingsStore.set(userId, updatedSettings);

    logger.info(`Updated settings for user ${userId}`);

    return res.json({
      status: 'success',
      data: { settings: updatedSettings },
      message: 'Settings updated successfully',
    });
  } catch (error) {
    logger.error('Error updating user settings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update settings',
    });
  }
};

/**
 * Update specific setting category
 */
export const updateSettingCategory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { category } = req.params;
    const updates = req.body;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    if (!['appearance', 'notifications', 'privacy', 'generation'].includes(category)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid settings category',
      });
    }

    // Get current settings or defaults
    const currentSettings = userSettingsStore.get(userId) || DEFAULT_SETTINGS;

    // Update specific category
    const updatedSettings = {
      ...currentSettings,
      [category]: { ...currentSettings[category as keyof UserSettings], ...updates },
    };

    // Store updated settings
    userSettingsStore.set(userId, updatedSettings);

    logger.info(`Updated ${category} settings for user ${userId}`);

    return res.json({
      status: 'success',
      data: { settings: updatedSettings },
      message: `${category} settings updated successfully`,
    });
  } catch (error) {
    logger.error(`Error updating ${req.params.category} settings:`, error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update settings',
    });
  }
};

/**
 * Reset user settings to defaults
 */
export const resetUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated',
      });
    }

    // Reset to default settings
    userSettingsStore.set(userId, { ...DEFAULT_SETTINGS });

    logger.info(`Reset settings to defaults for user ${userId}`);

    return res.json({
      status: 'success',
      data: { settings: DEFAULT_SETTINGS },
      message: 'Settings reset to defaults successfully',
    });
  } catch (error) {
    logger.error('Error resetting user settings:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to reset settings',
    });
  }
};

export default {
  getUserSettings,
  updateUserSettings,
  updateSettingCategory,
  resetUserSettings,
};