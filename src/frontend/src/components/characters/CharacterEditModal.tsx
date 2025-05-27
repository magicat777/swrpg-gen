import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { X, Save, User, Globe, Users, Scroll } from 'lucide-react';
import { Button } from '../ui/Button';

interface Character {
  id: number;
  name: string;
  species: string;
  occupation: string;
  homeworld: string;
  affiliation: string;
  description: string;
}

interface CharacterEditModalProps {
  character: Character | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (character: Character) => void;
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

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FormSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FormIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.colors.lightSide.primary};
  flex-shrink: 0;
`;

const FormLabel = styled.label`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  display: block;
  flex: 1;
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

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.textSecondary};
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  transition: ${({ theme }) => theme.effects.transition.fast};
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.textSecondary};
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const CharacterEditModal: React.FC<CharacterEditModalProps> = ({
  character,
  isOpen,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Character>({
    id: 0,
    name: '',
    species: '',
    occupation: '',
    homeworld: '',
    affiliation: '',
    description: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when character changes
  useEffect(() => {
    if (character) {
      setFormData(character);
    }
    setErrors({});
  }, [character]);

  const handleInputChange = (field: keyof Character, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Character name is required';
    }

    if (!formData.species.trim()) {
      newErrors.species = 'Species is required';
    }

    if (!formData.occupation.trim()) {
      newErrors.occupation = 'Occupation is required';
    }

    if (!formData.homeworld.trim()) {
      newErrors.homeworld = 'Homeworld is required';
    }

    if (!formData.affiliation.trim()) {
      newErrors.affiliation = 'Affiliation is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  if (!character) return null;

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Edit Character</ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <FormGroup>
            <FormSection>
              <FormIcon>
                <User size={18} />
              </FormIcon>
              <div style={{ flex: 1 }}>
                <FormLabel>Character Name</FormLabel>
                <FormInput
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter character name"
                />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </div>
            </FormSection>
          </FormGroup>

          <FormGroup>
            <FormSection>
              <FormIcon>
                <Globe size={18} />
              </FormIcon>
              <div style={{ flex: 1 }}>
                <FormLabel>Species</FormLabel>
                <FormInput
                  type="text"
                  value={formData.species}
                  onChange={(e) => handleInputChange('species', e.target.value)}
                  placeholder="e.g., Human, Twi'lek, Wookiee"
                />
                {errors.species && <ErrorMessage>{errors.species}</ErrorMessage>}
              </div>
            </FormSection>
          </FormGroup>

          <FormGroup>
            <FormSection>
              <FormIcon>
                <Users size={18} />
              </FormIcon>
              <div style={{ flex: 1 }}>
                <FormLabel>Occupation</FormLabel>
                <FormInput
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  placeholder="e.g., Smuggler, Jedi Knight, Bounty Hunter"
                />
                {errors.occupation && <ErrorMessage>{errors.occupation}</ErrorMessage>}
              </div>
            </FormSection>
          </FormGroup>

          <FormGroup>
            <FormSection>
              <FormIcon>
                <Globe size={18} />
              </FormIcon>
              <div style={{ flex: 1 }}>
                <FormLabel>Homeworld</FormLabel>
                <FormInput
                  type="text"
                  value={formData.homeworld}
                  onChange={(e) => handleInputChange('homeworld', e.target.value)}
                  placeholder="e.g., Tatooine, Coruscant, Alderaan"
                />
                {errors.homeworld && <ErrorMessage>{errors.homeworld}</ErrorMessage>}
              </div>
            </FormSection>
          </FormGroup>

          <FormGroup>
            <FormSection>
              <FormIcon>
                <Users size={18} />
              </FormIcon>
              <div style={{ flex: 1 }}>
                <FormLabel>Affiliation</FormLabel>
                <FormInput
                  type="text"
                  value={formData.affiliation}
                  onChange={(e) => handleInputChange('affiliation', e.target.value)}
                  placeholder="e.g., Rebel Alliance, Galactic Empire, Independent"
                />
                {errors.affiliation && <ErrorMessage>{errors.affiliation}</ErrorMessage>}
              </div>
            </FormSection>
          </FormGroup>

          <FormGroup>
            <FormSection>
              <FormIcon>
                <Scroll size={18} />
              </FormIcon>
              <div style={{ flex: 1 }}>
                <FormLabel>Description</FormLabel>
                <FormTextarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter character background, personality, and important details..."
                />
                {errors.description && <ErrorMessage>{errors.description}</ErrorMessage>}
              </div>
            </FormSection>
          </FormGroup>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Save size={16} />}
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};