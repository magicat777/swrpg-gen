import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Volume2, 
  Database, 
  Zap,
  Save,
  RotateCcw,
  Download,
  Upload,
  Trash2
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../services/auth/AuthContext';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  margin: 0;
`;

const SettingsGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing.xl};
`;

const SettingsSection = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  padding-bottom: ${({ theme }) => theme.spacing.md};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: ${({ theme }) => theme.colors.lightSide.primary}20;
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  color: ${({ theme }) => theme.colors.lightSide.primary};
`;

const SectionTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
`;

const SettingGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const SettingInfo = styled.div`
  flex: 1;
`;

const SettingLabel = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0 0 ${({ theme }) => theme.spacing.xs} 0;
`;

const SettingDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  margin: 0;
`;

const SettingControl = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Toggle = styled.button<{ $isOn: boolean }>`
  position: relative;
  width: 48px;
  height: 24px;
  background-color: ${({ $isOn, theme }) => 
    $isOn ? theme.colors.lightSide.primary : theme.colors.neutral.border
  };
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $isOn }) => $isOn ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background-color: white;
    border-radius: 50%;
    transition: ${({ theme }) => theme.effects.transition.fast};
  }
`;

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  min-width: 120px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const DangerZone = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-top: ${({ theme }) => theme.spacing.xl};
`;

const DangerTitle = styled.h3`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const DangerDescription = styled.p`
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

interface SettingsState {
  profile: {
    username: string;
    email: string;
    timezone: string;
  };
  notifications: {
    sessionUpdates: boolean;
    systemAlerts: boolean;
    emailDigest: boolean;
  };
  appearance: {
    theme: string;
    fontSize: string;
    language: string;
  };
  audio: {
    masterVolume: number;
    soundEffects: boolean;
    backgroundMusic: boolean;
  };
  gameplay: {
    autoSave: boolean;
    confirmActions: boolean;
    advancedMode: boolean;
  };
  privacy: {
    analytics: boolean;
    crashReports: boolean;
    dataSharing: boolean;
  };
}

const defaultSettings: SettingsState = {
  profile: {
    username: 'demo-user',
    email: 'demo@example.com',
    timezone: 'UTC'
  },
  notifications: {
    sessionUpdates: true,
    systemAlerts: true,
    emailDigest: false
  },
  appearance: {
    theme: 'dark',
    fontSize: 'medium',
    language: 'en'
  },
  audio: {
    masterVolume: 70,
    soundEffects: true,
    backgroundMusic: false
  },
  gameplay: {
    autoSave: true,
    confirmActions: true,
    advancedMode: false
  },
  privacy: {
    analytics: true,
    crashReports: true,
    dataSharing: false
  }
};

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings from localStorage on component mount
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('user_settings');
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings);
          // Merge with defaults to ensure all properties exist
          const mergedSettings = {
            ...defaultSettings,
            ...parsedSettings,
            profile: {
              ...defaultSettings.profile,
              ...parsedSettings.profile,
              // Use actual user data if available
              username: user?.username || parsedSettings.profile?.username || defaultSettings.profile.username,
              email: user?.email || parsedSettings.profile?.email || defaultSettings.profile.email
            }
          };
          setSettings(mergedSettings);
        } else if (user) {
          // Initialize with user data if no saved settings
          setSettings(prev => ({
            ...prev,
            profile: {
              ...prev.profile,
              username: user.username,
              email: user.email
            }
          }));
        }
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error);
      }
    };

    loadSettings();
  }, [user]);

  const updateSetting = (section: keyof SettingsState, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('user_settings', JSON.stringify(settings));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      console.log('Settings saved to localStorage:', settings);
      setHasChanges(false);
      
      // Show success message (you could add a toast notification here)
      console.log('✅ Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      // Show error message (you could add a toast notification here)
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      const resetSettings = {
        ...defaultSettings,
        profile: {
          ...defaultSettings.profile,
          username: user?.username || defaultSettings.profile.username,
          email: user?.email || defaultSettings.profile.email
        }
      };
      setSettings(resetSettings);
      setHasChanges(true);
    }
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log('Exporting user data...');
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // TODO: Implement account deletion
      console.log('Deleting account...');
    }
  };

  return (
    <PageContainer>
      <Header>
        <Title>Settings</Title>
        <Subtitle>Customize your Star Wars RPG Generator experience</Subtitle>
      </Header>

      <SettingsGrid>
        {/* Profile Settings */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>
              <User size={18} />
            </SectionIcon>
            <SectionTitle>Profile</SectionTitle>
          </SectionHeader>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Username</SettingLabel>
                <SettingDescription>Your display name across the platform</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Input
                  value={settings.profile.username}
                  onChange={(e) => updateSetting('profile', 'username', e.target.value)}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Email</SettingLabel>
                <SettingDescription>Your email address for notifications</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Input
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Timezone</SettingLabel>
                <SettingDescription>Your local timezone for session scheduling</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.profile.timezone}
                  onChange={(e) => updateSetting('profile', 'timezone', e.target.value)}
                >
                  <option value="UTC">UTC</option>
                  <option value="PST">Pacific</option>
                  <option value="EST">Eastern</option>
                  <option value="CST">Central</option>
                  <option value="MST">Mountain</option>
                </Select>
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </SettingsSection>

        {/* Notifications */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>
              <Bell size={18} />
            </SectionIcon>
            <SectionTitle>Notifications</SectionTitle>
          </SectionHeader>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Session Updates</SettingLabel>
                <SettingDescription>Get notified when sessions are updated or messages are sent</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.notifications.sessionUpdates}
                  onClick={() => updateSetting('notifications', 'sessionUpdates', !settings.notifications.sessionUpdates)}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>System Alerts</SettingLabel>
                <SettingDescription>Receive important system notifications and updates</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.notifications.systemAlerts}
                  onClick={() => updateSetting('notifications', 'systemAlerts', !settings.notifications.systemAlerts)}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Email Digest</SettingLabel>
                <SettingDescription>Weekly summary of your activity and sessions</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.notifications.emailDigest}
                  onClick={() => updateSetting('notifications', 'emailDigest', !settings.notifications.emailDigest)}
                />
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </SettingsSection>

        {/* Appearance */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>
              <Palette size={18} />
            </SectionIcon>
            <SectionTitle>Appearance</SectionTitle>
          </SectionHeader>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Theme</SettingLabel>
                <SettingDescription>Choose your preferred color scheme</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.appearance.theme}
                  onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </Select>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Font Size</SettingLabel>
                <SettingDescription>Adjust text size for better readability</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.appearance.fontSize}
                  onChange={(e) => updateSetting('appearance', 'fontSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </Select>
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </SettingsSection>

        {/* Gameplay */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>
              <Zap size={18} />
            </SectionIcon>
            <SectionTitle>Gameplay</SectionTitle>
          </SectionHeader>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Auto-Save</SettingLabel>
                <SettingDescription>Automatically save session progress</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.gameplay.autoSave}
                  onClick={() => updateSetting('gameplay', 'autoSave', !settings.gameplay.autoSave)}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Confirm Actions</SettingLabel>
                <SettingDescription>Ask for confirmation before destructive actions</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.gameplay.confirmActions}
                  onClick={() => updateSetting('gameplay', 'confirmActions', !settings.gameplay.confirmActions)}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Advanced Mode</SettingLabel>
                <SettingDescription>Enable advanced features and detailed controls</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.gameplay.advancedMode}
                  onClick={() => updateSetting('gameplay', 'advancedMode', !settings.gameplay.advancedMode)}
                />
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </SettingsSection>

        {/* Data & Privacy */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>
              <Shield size={18} />
            </SectionIcon>
            <SectionTitle>Data & Privacy</SectionTitle>
          </SectionHeader>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Analytics</SettingLabel>
                <SettingDescription>Help improve the app by sharing usage data</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.privacy.analytics}
                  onClick={() => updateSetting('privacy', 'analytics', !settings.privacy.analytics)}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Crash Reports</SettingLabel>
                <SettingDescription>Automatically send crash reports to help fix bugs</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.privacy.crashReports}
                  onClick={() => updateSetting('privacy', 'crashReports', !settings.privacy.crashReports)}
                />
              </SettingControl>
            </SettingItem>

            <ButtonGroup>
              <Button variant="outline" leftIcon={<Download size={16} />} onClick={handleExportData}>
                Export Data
              </Button>
            </ButtonGroup>
          </SettingGroup>
        </SettingsSection>
      </SettingsGrid>

      {/* Save/Reset Controls */}
      <ButtonGroup>
        <Button
          variant="primary"
          leftIcon={<Save size={16} />}
          onClick={handleSave}
          disabled={!hasChanges}
          isLoading={isSaving}
        >
          Save Changes
        </Button>
        <Button
          variant="outline"
          leftIcon={<RotateCcw size={16} />}
          onClick={handleReset}
          disabled={!hasChanges}
        >
          Reset to Defaults
        </Button>
      </ButtonGroup>

      {/* Danger Zone */}
      <DangerZone>
        <DangerTitle>Danger Zone</DangerTitle>
        <DangerDescription>
          These actions are permanent and cannot be undone. Please proceed with caution.
        </DangerDescription>
        <Button
          variant="outline"
          leftIcon={<Trash2 size={16} />}
          onClick={handleDeleteAccount}
          style={{ color: '#ef4444', borderColor: '#ef4444' }}
        >
          Delete Account
        </Button>
      </DangerZone>
    </PageContainer>
  );
};

export default SettingsPage;