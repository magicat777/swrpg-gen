import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Filter, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface LocationFilters {
  climate: string;
  terrain: string;
  sector: string;
  population: string;
}

interface LocationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: LocationFilters) => void;
  currentFilters: LocationFilters;
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

const climates = [
  'All Climates',
  'Desert',
  'Forest',
  'Ice',
  'Urban',
  'Swamp',
  'Volcanic',
  'Tropical',
  'Temperate',
  'Arid'
];

const terrains = [
  'All Terrains',
  'Desert',
  'Forest Moon',
  'Frozen Wasteland',
  'Cityscape',
  'Swamp',
  'Volcanic',
  'Mountains',
  'Ocean',
  'Plains'
];

const sectors = [
  'All Sectors',
  'Core Worlds',
  'Inner Rim',
  'Mid Rim',
  'Outer Rim',
  'Unknown Regions',
  'Wild Space'
];

const populations = [
  'All Populations',
  'Uninhabited',
  'Under 1 Million',
  '1M - 100M',
  '100M - 1B',
  'Over 1 Billion'
];

export const LocationFilterModal: React.FC<LocationFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters
}) => {
  const [filters, setFilters] = useState<LocationFilters>(currentFilters);

  const handleFilterChange = (key: keyof LocationFilters, value: string) => {
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
    const resetFilters: LocationFilters = {
      climate: 'All Climates',
      terrain: 'All Terrains',
      sector: 'All Sectors',
      population: 'All Populations'
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
            Filter Locations
          </ModalTitle>
          <CloseButton onClick={handleClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <FilterGroup>
            <FilterLabel htmlFor="climate">Climate</FilterLabel>
            <FilterSelect
              id="climate"
              value={filters.climate}
              onChange={(e) => handleFilterChange('climate', e.target.value)}
            >
              {climates.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="terrain">Terrain</FilterLabel>
            <FilterSelect
              id="terrain"
              value={filters.terrain}
              onChange={(e) => handleFilterChange('terrain', e.target.value)}
            >
              {terrains.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="sector">Sector</FilterLabel>
            <FilterSelect
              id="sector"
              value={filters.sector}
              onChange={(e) => handleFilterChange('sector', e.target.value)}
            >
              {sectors.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="population">Population</FilterLabel>
            <FilterSelect
              id="population"
              value={filters.population}
              onChange={(e) => handleFilterChange('population', e.target.value)}
            >
              {populations.map(option => (
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

export default LocationFilterModal;