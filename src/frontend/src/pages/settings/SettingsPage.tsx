import React from 'react';
import styled from 'styled-components';
import { 
  User, 
  Shield, 
  Palette, 
  Database, 
  Zap,
  Save,
  RotateCcw,
  Key
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../services/auth/AuthContext';
import { useSettings } from '../../services/settings/SettingsContext';
import { useFactionTheme } from '../../styles/FactionThemeContext';
import { AuthAPI } from '../../services/api/authApi';

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

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { settings, updateSetting, resetSettings } = useSettings();
  const { currentFaction, setFaction } = useFactionTheme();
  const [isChangingPassword, setIsChangingPassword] = React.useState(false);
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  return (
    <PageContainer>
      <Header>
        <Title>Settings</Title>
        <Subtitle>Customize your SW:RPG Generator experience</Subtitle>
      </Header>

      <SettingsGrid>
        {/* Profile */}
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
                <SettingDescription>Your display name in the application</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Input
                  type="text"
                  value={user?.username || ''}
                  disabled
                  placeholder="Username"
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
                  value={user?.email || ''}
                  disabled
                  placeholder="Email"
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
            <SectionTitle>Appearance & Accessibility</SectionTitle>
          </SectionHeader>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Theme Selector</SettingLabel>
                <SettingDescription>Change your faction theme using the selector in the header above</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {/* Theme selector is in header */}}
                  disabled
                >
                  Use Header Selector
                </Button>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Default Faction Theme</SettingLabel>
                <SettingDescription>Default faction theme when you log in</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.appearance.defaultFaction}
                  onChange={(e) => {
                    updateSetting('appearance', 'defaultFaction', e.target.value);
                    setFaction(e.target.value); // Also update current theme immediately
                  }}
                >
                  <option value="jedi">Jedi Temple</option>
                  <option value="empire">Galactic Empire</option>
                  <option value="rebellion">Rebel Alliance</option>
                  <option value="republic">Galactic Republic</option>
                  <option value="firstOrder">First Order</option>
                  <option value="sith">Sith Order</option>
                  <option value="mandalorian">Mandalorian Clans</option>
                  <option value="resistance">Resistance</option>
                </Select>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>High Contrast</SettingLabel>
                <SettingDescription>Increase contrast for better visibility</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.appearance.highContrast}
                  onClick={() => updateSetting('appearance', 'highContrast', !settings.appearance.highContrast)}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Reduced Motion</SettingLabel>
                <SettingDescription>Reduce animations for sensitivity or performance</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.appearance.reducedMotion}
                  onClick={() => updateSetting('appearance', 'reducedMotion', !settings.appearance.reducedMotion)}
                />
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </SettingsSection>

        {/* Account Security */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>
              <Shield size={18} />
            </SectionIcon>
            <SectionTitle>Account Security</SectionTitle>
          </SectionHeader>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Password</SettingLabel>
                <SettingDescription>Change your account password</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Button
                  variant="secondary"
                  size="sm"
                  leftIcon={<Key size={16} />}
                  onClick={() => setIsChangingPassword(true)}
                >
                  Change Password
                </Button>
              </SettingControl>
            </SettingItem>

            {isChangingPassword && (
              <>
                <SettingItem>
                  <SettingInfo>
                    <SettingLabel>Current Password</SettingLabel>
                    <SettingDescription>Enter your current password</SettingDescription>
                  </SettingInfo>
                  <SettingControl>
                    <Input
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      placeholder="Current password"
                    />
                  </SettingControl>
                </SettingItem>

                <SettingItem>
                  <SettingInfo>
                    <SettingLabel>New Password</SettingLabel>
                    <SettingDescription>Enter your new password</SettingDescription>
                  </SettingInfo>
                  <SettingControl>
                    <Input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      placeholder="New password"
                    />
                  </SettingControl>
                </SettingItem>

                <SettingItem>
                  <SettingInfo>
                    <SettingLabel>Confirm New Password</SettingLabel>
                    <SettingDescription>Confirm your new password</SettingDescription>
                  </SettingInfo>
                  <SettingControl>
                    <Input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      placeholder="Confirm new password"
                    />
                  </SettingControl>
                </SettingItem>

                <ButtonGroup>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={async () => {
                      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
                        alert('New passwords do not match');
                        return;
                      }
                      if (passwordForm.newPassword.length < 6) {
                        alert('Password must be at least 6 characters');
                        return;
                      }
                      
                      try {
                        const response = await AuthAPI.changePassword(
                          passwordForm.currentPassword,
                          passwordForm.newPassword
                        );
                        
                        if (response.status === 'success') {
                          alert('Password updated successfully!');
                          setIsChangingPassword(false);
                          setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        } else {
                          alert(response.message || 'Failed to update password');
                        }
                      } catch (error: any) {
                        console.error('Password change error:', error);
                        let errorMessage = 'Failed to update password';
                        if (error.response?.data?.message) {
                          errorMessage = error.response.data.message;
                        } else if (error.message) {
                          errorMessage = error.message;
                        }
                        alert(errorMessage);
                      }
                    }}
                  >
                    Update Password
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    }}
                  >
                    Cancel
                  </Button>
                </ButtonGroup>
              </>
            )}
          </SettingGroup>
        </SettingsSection>

        {/* Generation Settings */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>
              <Zap size={18} />
            </SectionIcon>
            <SectionTitle>Story Generation</SectionTitle>
          </SectionHeader>

          <SettingGroup>
            <SettingItem>
              <SettingInfo>
                <SettingLabel>Auto Save</SettingLabel>
                <SettingDescription>Automatically save generated content</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Toggle
                  $isOn={settings.generation.autoSave}
                  onClick={() => updateSetting('generation', 'autoSave', !settings.generation.autoSave)}
                />
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Default Era</SettingLabel>
                <SettingDescription>Default Star Wars era for new sessions</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.generation.defaultEra}
                  onChange={(e) => updateSetting('generation', 'defaultEra', e.target.value)}
                >
                  <option value="Old Republic">Old Republic</option>
                  <option value="Prequel Trilogy">Prequel Trilogy</option>
                  <option value="Original Trilogy">Original Trilogy</option>
                  <option value="Sequel Trilogy">Sequel Trilogy</option>
                  <option value="Custom">Custom</option>
                </Select>
              </SettingControl>
            </SettingItem>

            <SettingItem>
              <SettingInfo>
                <SettingLabel>Story Complexity</SettingLabel>
                <SettingDescription>Preferred complexity level for generated stories</SettingDescription>
              </SettingInfo>
              <SettingControl>
                <Select
                  value={settings.generation.preferredComplexity}
                  onChange={(e) => updateSetting('generation', 'preferredComplexity', e.target.value)}
                >
                  <option value="simple">Simple</option>
                  <option value="moderate">Moderate</option>
                  <option value="complex">Complex</option>
                </Select>
              </SettingControl>
            </SettingItem>
          </SettingGroup>
        </SettingsSection>

        {/* Actions */}
        <SettingsSection>
          <SectionHeader>
            <SectionIcon>
              <Database size={18} />
            </SectionIcon>
            <SectionTitle>Settings Management</SectionTitle>
          </SectionHeader>

          <SettingGroup>
            <p>Manage your settings and preferences</p>
            <ButtonGroup>
              <Button
                onClick={() => {/* Settings auto-save, this applies immediately */}}
                variant="primary"
                leftIcon={<Save size={16} />}
              >
                Apply & Save
              </Button>
              <Button
                onClick={resetSettings}
                variant="secondary"
                leftIcon={<RotateCcw size={16} />}
              >
                Reset to Defaults
              </Button>
            </ButtonGroup>
          </SettingGroup>
        </SettingsSection>
      </SettingsGrid>
    </PageContainer>
  );
};