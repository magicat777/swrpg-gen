import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { SessionApi } from '../../services/api/sessionApi';
import { 
  LightsaberIcon, 
  DeathStarIcon, 
  RebelIcon, 
  ImperialIcon, 
  MandalorianIcon,
  JediIcon
} from '../ui/StarWarsIcons';
import { useAnalytics } from '../../services/analytics/AnalyticsContext';

interface SessionCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSessionCreated?: () => void;
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
  box-shadow: ${({ theme }) => theme.effects.shadow.xl};
  width: 100%;
  max-width: 600px;
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

const FormSection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SectionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.colors.lightSide.primary};
`;

const SectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Label = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.lightSide.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.textSecondary};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.lightSide.primary}20;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.textSecondary};
  }
`;

const Select = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.lightSide.primary}20;
  }
`;

const CheckboxGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.neutral.background};
  }
`;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) => theme.colors.lightSide.primary};
`;

const CheckboxLabel = styled.span`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.text};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const eras = [
  'Old Republic',
  'Prequel Era', 
  'Original Trilogy',
  'New Republic',
  'Sequel Era'
];

const toneOptions = [
  'Heroic Rebellion',
  'Imperial Politics',
  'Sith Darkness',
  'Cantina Adventures',
  'Clone Wars',
  'Outer Rim Exploration',
  'Jedi Investigation',
  'Underworld Survival'
];

export const SessionCreationModal: React.FC<SessionCreationModalProps> = ({
  isOpen,
  onClose,
  onSessionCreated
}) => {
  const navigate = useNavigate();
  const { trackFeatureUsage, trackError } = useAnalytics();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    sessionName: '',
    description: '',
    era: 'Original Trilogy',
    location: '',
    maxPlayers: 4,
    tonePreferences: [] as string[],
    difficulty: 'normal',
    campaignLength: 'medium',
    allowNpcGeneration: true,
    allowWorldBuilding: true,
    enableVoiceMode: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    if (name === 'tonePreferences') {
      const value = e.target.value;
      setFormData(prev => ({
        ...prev,
        tonePreferences: checked
          ? [...prev.tonePreferences, value]
          : prev.tonePreferences.filter(tone => tone !== value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Track session creation start
    trackFeatureUsage('session-creation', 'start-create', true);
    
    try {
      // Create session data matching backend expectations
      const sessionData = {
        campaignName: formData.sessionName, // Backend expects 'campaignName'
        description: formData.description,
        setting: {
          era: formData.era,
          startingLocation: formData.location || 'Unknown'
        },
        campaignSettings: {
          playerCount: formData.maxPlayers,
          difficulty: formData.difficulty,
          campaignLength: formData.campaignLength
        },
        toneStyle: {
          themes: formData.tonePreferences
        },
        advancedOptions: {
          aiFeatures: formData.allowNpcGeneration
        }
      };

      // Call actual API
      const session = await SessionApi.createSession(sessionData);
      console.log('Session created:', session);
      
      // Track successful session creation
      trackFeatureUsage('session-creation', 'create-success', true);
      
      // Notify parent component about successful creation
      onSessionCreated?.();
      
      // Navigate to the new session
      navigate(`/session/${session._id || session.id}`);
      onClose();
    } catch (error) {
      console.error('Error creating session:', error);
      
      // Track session creation failure
      trackFeatureUsage('session-creation', 'create-error', false);
      trackError(error as Error, 'SessionCreationModal');
      
      alert('Failed to create session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Begin New Mission</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={handleSubmit}>
          <ModalBody>
            <FormSection>
              <SectionHeader>
                <SectionIcon>
                  <JediIcon size={20} />
                </SectionIcon>
                <SectionTitle>Mission Brief</SectionTitle>
              </SectionHeader>

              <FormGroup>
                <Label htmlFor="sessionName">Mission Codename</Label>
                <Input
                  id="sessionName"
                  name="sessionName"
                  type="text"
                  placeholder="Operation Name (e.g., 'Rebel Dawn', 'Imperial Shadow', 'Jedi's Path')"
                  value={formData.sessionName}
                  onChange={handleInputChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="description">Mission Briefing (Optional)</Label>
                <TextArea
                  id="description"
                  name="description"
                  placeholder="Describe the galactic situation, key objectives, or background events that drive this mission across the stars..."
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionHeader>
                <SectionIcon>
                  <DeathStarIcon size={20} />
                </SectionIcon>
                <SectionTitle>Galactic Timeline</SectionTitle>
              </SectionHeader>

              <FormGroup>
                <Label htmlFor="era">Galactic Era</Label>
                <Select
                  id="era"
                  name="era"
                  value={formData.era}
                  onChange={handleInputChange}
                >
                  {eras.map(era => (
                    <option key={era} value={era}>{era}</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="location">Starting Sector (Optional)</Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="e.g., Coruscant, Tatooine, Hoth, or forge your own world..."
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionHeader>
                <SectionIcon>
                  <RebelIcon size={20} />
                </SectionIcon>
                <SectionTitle>Squadron Configuration</SectionTitle>
              </SectionHeader>

              <FormGroup>
                <Label htmlFor="maxPlayers">Squadron Size</Label>
                <Select
                  id="maxPlayers"
                  name="maxPlayers"
                  value={formData.maxPlayers}
                  onChange={handleInputChange}
                >
                  {[2, 3, 4, 5, 6, 7, 8].map(num => (
                    <option key={num} value={num}>{num} Heroes</option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="difficulty">Mission Difficulty</Label>
                <Select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                >
                  <option value="easy">Padawan - Forgiving, story-focused</option>
                  <option value="normal">Jedi Knight - Balanced challenge</option>
                  <option value="hard">Jedi Master - Tactical, dangerous</option>
                  <option value="epic">Sith Lord - High stakes, deadly</option>
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="campaignLength">Mission Duration</Label>
                <Select
                  id="campaignLength"
                  name="campaignLength"
                  value={formData.campaignLength}
                  onChange={handleInputChange}
                >
                  <option value="short">Reconnaissance - 1-5 missions</option>
                  <option value="medium">Campaign - 6-15 missions</option>
                  <option value="long">Galactic War - 16+ missions</option>
                  <option value="ongoing">Eternal Vigilance - Open-ended</option>
                </Select>
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionHeader>
                <SectionIcon>
                  <LightsaberIcon size={20} />
                </SectionIcon>
                <SectionTitle>Force Resonance</SectionTitle>
              </SectionHeader>

              <FormGroup>
                <Label>Mission Themes (Choose your path through the Force)</Label>
                <CheckboxGroup>
                  {toneOptions.map(tone => (
                    <CheckboxItem key={tone}>
                      <Checkbox
                        name="tonePreferences"
                        value={tone}
                        checked={formData.tonePreferences.includes(tone)}
                        onChange={handleCheckboxChange}
                      />
                      <CheckboxLabel>{tone}</CheckboxLabel>
                    </CheckboxItem>
                  ))}
                </CheckboxGroup>
              </FormGroup>
            </FormSection>

            <FormSection>
              <SectionHeader>
                <SectionIcon>
                  <ImperialIcon size={20} />
                </SectionIcon>
                <SectionTitle>AI Protocol Settings</SectionTitle>
              </SectionHeader>

              <CheckboxGroup>
                <CheckboxItem>
                  <Checkbox
                    name="allowNpcGeneration"
                    checked={formData.allowNpcGeneration}
                    onChange={handleCheckboxChange}
                  />
                  <CheckboxLabel>Enable Character Generation Protocol</CheckboxLabel>
                </CheckboxItem>
                
                <CheckboxItem>
                  <Checkbox
                    name="allowWorldBuilding"
                    checked={formData.allowWorldBuilding}
                    onChange={handleCheckboxChange}
                  />
                  <CheckboxLabel>Enable Galactic Expansion Protocol</CheckboxLabel>
                </CheckboxItem>
                
                <CheckboxItem>
                  <Checkbox
                    name="enableVoiceMode"
                    checked={formData.enableVoiceMode}
                    onChange={handleCheckboxChange}
                  />
                  <CheckboxLabel>Enable Holocron Voice Mode (Future)</CheckboxLabel>
                </CheckboxItem>
              </CheckboxGroup>
            </FormSection>
          </ModalBody>

          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              disabled={!formData.sessionName.trim()}
            >
              Launch Mission
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SessionCreationModal;