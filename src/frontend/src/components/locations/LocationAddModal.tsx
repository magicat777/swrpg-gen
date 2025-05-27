import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Plus, MapPin, Globe, Users, Building, Map } from 'lucide-react';
import { Button } from '../ui/Button';

interface Location {
  id: number;
  name: string;
  system: string;
  sector: string;
  climate: string;
  terrain: string;
  population: string;
  government: string;
  description: string;
}

interface LocationAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (location: Omit<Location, 'id'>) => void;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
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

const climateOptions = ['Desert', 'Forest', 'Ice', 'Urban', 'Swamp', 'Ocean', 'Mountain', 'Volcanic', 'Gas Giant', 'Space Station'];
const terrainOptions = ['Desert', 'Forest Moon', 'Cityscape', 'Swampland', 'Ice Plains', 'Ocean World', 'Mountains', 'Volcanic', 'Asteroid Field', 'Space Station'];

export const LocationAddModal: React.FC<LocationAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    system: '',
    sector: '',
    climate: '',
    terrain: '',
    population: '',
    government: '',
    description: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
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
      newErrors.name = 'Location name is required';
    }

    if (!formData.system.trim()) {
      newErrors.system = 'System is required';
    }

    if (!formData.sector.trim()) {
      newErrors.sector = 'Sector is required';
    }

    if (!formData.climate.trim()) {
      newErrors.climate = 'Climate is required';
    }

    if (!formData.terrain.trim()) {
      newErrors.terrain = 'Terrain is required';
    }

    if (!formData.population.trim()) {
      newErrors.population = 'Population is required';
    }

    if (!formData.government.trim()) {
      newErrors.government = 'Government type is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (validateForm()) {
      onAdd(formData);
      // Reset form
      setFormData({
        name: '',
        system: '',
        sector: '',
        climate: '',
        terrain: '',
        population: '',
        government: '',
        description: '',
      });
      setErrors({});
      onClose();
    }
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Add New Location</ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <FormGroup>
            <FormSection>
              <FormIcon>
                <MapPin size={18} />
              </FormIcon>
              <div style={{ flex: 1 }}>
                <FormLabel>Location Name</FormLabel>
                <FormInput
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter location name"
                />
                {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
              </div>
            </FormSection>
          </FormGroup>

          <FormGroup>
            <FormRow>
              <FormSection>
                <FormIcon>
                  <Globe size={18} />
                </FormIcon>
                <div style={{ flex: 1 }}>
                  <FormLabel>System</FormLabel>
                  <FormInput
                    type="text"
                    value={formData.system}
                    onChange={(e) => handleInputChange('system', e.target.value)}
                    placeholder="e.g., Coruscant System"
                  />
                  {errors.system && <ErrorMessage>{errors.system}</ErrorMessage>}
                </div>
              </FormSection>

              <FormSection>
                <FormIcon>
                  <Map size={18} />
                </FormIcon>
                <div style={{ flex: 1 }}>
                  <FormLabel>Sector</FormLabel>
                  <FormInput
                    type="text"
                    value={formData.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    placeholder="e.g., Core Worlds"
                  />
                  {errors.sector && <ErrorMessage>{errors.sector}</ErrorMessage>}
                </div>
              </FormSection>
            </FormRow>
          </FormGroup>

          <FormGroup>
            <FormRow>
              <FormSection>
                <FormIcon>
                  <Globe size={18} />
                </FormIcon>
                <div style={{ flex: 1 }}>
                  <FormLabel>Climate</FormLabel>
                  <FormSelect
                    value={formData.climate}
                    onChange={(e) => handleInputChange('climate', e.target.value)}
                  >
                    <option value="">Select climate</option>
                    {climateOptions.map(climate => (
                      <option key={climate} value={climate}>{climate}</option>
                    ))}
                  </FormSelect>
                  {errors.climate && <ErrorMessage>{errors.climate}</ErrorMessage>}
                </div>
              </FormSection>

              <FormSection>
                <FormIcon>
                  <Map size={18} />
                </FormIcon>
                <div style={{ flex: 1 }}>
                  <FormLabel>Terrain</FormLabel>
                  <FormSelect
                    value={formData.terrain}
                    onChange={(e) => handleInputChange('terrain', e.target.value)}
                  >
                    <option value="">Select terrain</option>
                    {terrainOptions.map(terrain => (
                      <option key={terrain} value={terrain}>{terrain}</option>
                    ))}
                  </FormSelect>
                  {errors.terrain && <ErrorMessage>{errors.terrain}</ErrorMessage>}
                </div>
              </FormSection>
            </FormRow>
          </FormGroup>

          <FormGroup>
            <FormRow>
              <FormSection>
                <FormIcon>
                  <Users size={18} />
                </FormIcon>
                <div style={{ flex: 1 }}>
                  <FormLabel>Population</FormLabel>
                  <FormInput
                    type="text"
                    value={formData.population}
                    onChange={(e) => handleInputChange('population', e.target.value)}
                    placeholder="e.g., 1 Trillion, Unknown"
                  />
                  {errors.population && <ErrorMessage>{errors.population}</ErrorMessage>}
                </div>
              </FormSection>

              <FormSection>
                <FormIcon>
                  <Building size={18} />
                </FormIcon>
                <div style={{ flex: 1 }}>
                  <FormLabel>Government</FormLabel>
                  <FormInput
                    type="text"
                    value={formData.government}
                    onChange={(e) => handleInputChange('government', e.target.value)}
                    placeholder="e.g., Galactic Republic, Hutt Cartel"
                  />
                  {errors.government && <ErrorMessage>{errors.government}</ErrorMessage>}
                </div>
              </FormSection>
            </FormRow>
          </FormGroup>

          <FormGroup>
            <FormSection>
              <FormIcon>
                <Map size={18} />
              </FormIcon>
              <div style={{ flex: 1 }}>
                <FormLabel>Description</FormLabel>
                <FormTextarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter location description, history, and important details..."
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
            leftIcon={<Plus size={16} />}
            onClick={handleAdd}
          >
            Add Location
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};