import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface CharacterFilters {
  species: string;
  affiliation: string;
  forceUser: string;
  era: string;
}

interface CharacterFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: CharacterFilters) => void;
  currentFilters: CharacterFilters;
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
  max-width: 400px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xl};
  border-bottom: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const ModalTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
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

const FilterGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.lightSide.primary}20;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

const species = [
  'All Species',
  'Human',
  'Twi\'lek',
  'Wookiee',
  'Rodian',
  'Mon Calamari',
  'Zabrak',
  'Togruta',
  'Bothan',
  'Sullustan'
];

const affiliations = [
  'All Affiliations',
  'Rebel Alliance',
  'Galactic Empire',
  'Jedi Order',
  'Sith',
  'Bounty Hunters',
  'Smugglers',
  'Independent',
  'New Republic',
  'First Order'
];

const forceUserOptions = [
  'All Characters',
  'Force Users',
  'Non-Force Users'
];

const eras = [
  'All Eras',
  'Old Republic',
  'Rise of the Empire',
  'Imperial Era',
  'New Republic',
  'First Order/Resistance'
];

export const CharacterFilterModal: React.FC<CharacterFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  const [filters, setFilters] = useState<CharacterFilters>(currentFilters);

  const handleFilterChange = (key: keyof CharacterFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters: CharacterFilters = {
      species: 'All Species',
      affiliation: 'All Affiliations',
      forceUser: 'All Characters',
      era: 'All Eras'
    };
    setFilters(resetFilters);
  };

  const handleClose = () => {
    setFilters(currentFilters); // Reset to current filters on cancel
    onClose();
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={handleClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            <Filter size={18} />
            Filter Characters
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <FilterGroup>
            <FilterLabel htmlFor="species">Species</FilterLabel>
            <FilterSelect
              id="species"
              value={filters.species}
              onChange={(e) => handleFilterChange('species', e.target.value)}
            >
              {species.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="affiliation">Affiliation</FilterLabel>
            <FilterSelect
              id="affiliation"
              value={filters.affiliation}
              onChange={(e) => handleFilterChange('affiliation', e.target.value)}
            >
              {affiliations.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="forceUser">Force Sensitivity</FilterLabel>
            <FilterSelect
              id="forceUser"
              value={filters.forceUser}
              onChange={(e) => handleFilterChange('forceUser', e.target.value)}
            >
              {forceUserOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="era">Era</FilterLabel>
            <FilterSelect
              id="era"
              value={filters.era}
              onChange={(e) => handleFilterChange('era', e.target.value)}
            >
              {eras.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </FilterSelect>
          </FilterGroup>
        </ModalBody>

        <ModalFooter>
          <Button
            variant="outline"
            leftIcon={<RotateCcw size={16} />}
            onClick={handleReset}
          >
            Reset
          </Button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CharacterFilterModal;