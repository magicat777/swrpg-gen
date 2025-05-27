import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Settings, Save, Trash2, UserX, Globe, Clock, Shield } from 'lucide-react';
import { Button } from '../ui/Button';

interface SessionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

interface SessionSettings {
  sessionName: string;
  era: string;
  location: string;
  tonePreferences: string[];
  difficulty: string;
  campaignLength: string;
  autoSave: boolean;
  allowSpectators: boolean;
  maxPlayers: number;
  isPrivate: boolean;
}

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${({ theme }) => theme.spacing.md};
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.effects.shadow.lg};
  width: 100%;
  max-width: 700px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize['2xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  cursor: pointer;
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral.background};
    color: ${({ theme }) => theme.colors.neutral.text};
  }
`;

const ModalBody = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`;

const SettingsSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  &:last-child {
    margin-bottom: 0;
  }
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

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FormLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const FormInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const FormSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  accent-color: ${({ theme }) => theme.colors.lightSide.primary};
`;

const CheckboxLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.text};
  cursor: pointer;
`;

const DangerZone = styled.div`
  border: 2px solid ${({ theme }) => theme.colors.error};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.error}10;
`;

const DangerTitle = styled.h4`
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

const ButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  justify-content: flex-end;
  margin-top: ${({ theme }) => theme.spacing.xl};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

export const SessionSettingsModal: React.FC<SessionSettingsModalProps> = ({
  isOpen,
  onClose,
  sessionId,
}) => {
  const [settings, setSettings] = useState<SessionSettings>({
    sessionName: 'Campaign 1 - Session 1',
    era: 'Imperial Era',
    location: 'Tatooine',
    tonePreferences: ['Heroic Adventure'],
    difficulty: 'Medium',
    campaignLength: 'Medium',
    autoSave: true,
    allowSpectators: false,
    maxPlayers: 6,
    isPrivate: false,
  });

  const handleInputChange = (field: keyof SessionSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Save settings to backend
    console.log('Saving session settings:', sessionId, settings);
    onClose();
  };

  const handleLeaveSession = () => {
    // TODO: Implement leave session functionality
    console.log('Leaving session:', sessionId);
  };

  const handleDeleteSession = () => {
    // TODO: Implement delete session functionality
    if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      console.log('Deleting session:', sessionId);
    }
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Settings size={24} />
            Session Settings
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <SettingsSection>
            <SectionHeader>
              <SectionIcon>
                <Settings size={18} />
              </SectionIcon>
              <SectionTitle>Basic Settings</SectionTitle>
            </SectionHeader>

            <FormGroup>
              <FormLabel>Session Name</FormLabel>
              <FormInput
                type="text"
                value={settings.sessionName}
                onChange={(e) => handleInputChange('sessionName', e.target.value)}
                placeholder="Enter session name"
              />
            </FormGroup>

            <FormRow>
              <FormGroup>
                <FormLabel>Era</FormLabel>
                <FormSelect
                  value={settings.era}
                  onChange={(e) => handleInputChange('era', e.target.value)}
                >
                  <option value="Old Republic">Old Republic</option>
                  <option value="Prequel Trilogy">Prequel Trilogy</option>
                  <option value="Imperial Era">Imperial Era</option>
                  <option value="Sequel Trilogy">Sequel Trilogy</option>
                  <option value="Custom">Custom</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Primary Location</FormLabel>
                <FormInput
                  type="text"
                  value={settings.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Tatooine, Coruscant"
                />
              </FormGroup>
            </FormRow>

            <FormRow>
              <FormGroup>
                <FormLabel>Difficulty</FormLabel>
                <FormSelect
                  value={settings.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                  <option value="Legendary">Legendary</option>
                </FormSelect>
              </FormGroup>

              <FormGroup>
                <FormLabel>Campaign Length</FormLabel>
                <FormSelect
                  value={settings.campaignLength}
                  onChange={(e) => handleInputChange('campaignLength', e.target.value)}
                >
                  <option value="Short">Short (1-5 sessions)</option>
                  <option value="Medium">Medium (6-15 sessions)</option>
                  <option value="Long">Long (16+ sessions)</option>
                </FormSelect>
              </FormGroup>
            </FormRow>
          </SettingsSection>

          <SettingsSection>
            <SectionHeader>
              <SectionIcon>
                <Globe size={18} />
              </SectionIcon>
              <SectionTitle>Session Options</SectionTitle>
            </SectionHeader>

            <CheckboxGroup>
              <Checkbox
                id="autoSave"
                checked={settings.autoSave}
                onChange={(e) => handleInputChange('autoSave', e.target.checked)}
              />
              <CheckboxLabel htmlFor="autoSave">Auto-save session progress</CheckboxLabel>
            </CheckboxGroup>

            <CheckboxGroup>
              <Checkbox
                id="allowSpectators"
                checked={settings.allowSpectators}
                onChange={(e) => handleInputChange('allowSpectators', e.target.checked)}
              />
              <CheckboxLabel htmlFor="allowSpectators">Allow spectators</CheckboxLabel>
            </CheckboxGroup>

            <CheckboxGroup>
              <Checkbox
                id="isPrivate"
                checked={settings.isPrivate}
                onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
              />
              <CheckboxLabel htmlFor="isPrivate">Private session (invite only)</CheckboxLabel>
            </CheckboxGroup>

            <FormGroup>
              <FormLabel>Maximum Players</FormLabel>
              <FormInput
                type="number"
                min="1"
                max="12"
                value={settings.maxPlayers}
                onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value))}
              />
            </FormGroup>
          </SettingsSection>

          <SettingsSection>
            <DangerZone>
              <DangerTitle>Danger Zone</DangerTitle>
              <DangerDescription>
                These actions are permanent and cannot be undone.
              </DangerDescription>
              
              <ButtonGroup style={{ marginTop: '1rem', paddingTop: 0, borderTop: 'none' }}>
                <Button
                  variant="outline"
                  leftIcon={<UserX size={16} />}
                  onClick={handleLeaveSession}
                >
                  Leave Session
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<Trash2 size={16} />}
                  onClick={handleDeleteSession}
                  style={{ color: 'red', borderColor: 'red' }}
                >
                  Delete Session
                </Button>
              </ButtonGroup>
            </DangerZone>
          </SettingsSection>

          <ButtonGroup>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              leftIcon={<Save size={16} />}
              onClick={handleSaveSettings}
            >
              Save Settings
            </Button>
          </ButtonGroup>
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};