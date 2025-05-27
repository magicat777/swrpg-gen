import React from 'react';
import styled from 'styled-components';
import { X, Edit, MapPin, Globe, Users, Building, Scroll } from 'lucide-react';
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

interface LocationDetailModalProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (location: Location) => void;
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
  max-width: 500px;
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

const LocationInfo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const InfoSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InfoIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: ${({ theme }) => theme.colors.lightSide.primary};
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const InfoValue = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.text};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Description = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
`;

const DescriptionLabel = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const DescriptionText = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin: 0;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.xl};
  border-top: 1px solid ${({ theme }) => theme.colors.neutral.border};
`;

export const LocationDetailModal: React.FC<LocationDetailModalProps> = ({
  location,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!location) return null;

  const handleEdit = () => {
    onEdit(location);
    onClose();
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>{location.name}</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          <LocationInfo>
            <InfoSection>
              <InfoIcon>
                <Globe size={18} />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>System</InfoLabel>
                <InfoValue>{location.system}</InfoValue>
              </InfoContent>
            </InfoSection>

            <InfoSection>
              <InfoIcon>
                <MapPin size={18} />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Sector</InfoLabel>
                <InfoValue>{location.sector}</InfoValue>
              </InfoContent>
            </InfoSection>

            <InfoSection>
              <InfoIcon>
                <Globe size={18} />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Climate</InfoLabel>
                <InfoValue>{location.climate}</InfoValue>
              </InfoContent>
            </InfoSection>

            <InfoSection>
              <InfoIcon>
                <MapPin size={18} />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Terrain</InfoLabel>
                <InfoValue>{location.terrain}</InfoValue>
              </InfoContent>
            </InfoSection>

            <InfoSection>
              <InfoIcon>
                <Users size={18} />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Population</InfoLabel>
                <InfoValue>{location.population}</InfoValue>
              </InfoContent>
            </InfoSection>

            <InfoSection>
              <InfoIcon>
                <Building size={18} />
              </InfoIcon>
              <InfoContent>
                <InfoLabel>Government</InfoLabel>
                <InfoValue>{location.government}</InfoValue>
              </InfoContent>
            </InfoSection>
          </LocationInfo>

          <Description>
            <DescriptionLabel>
              <Scroll size={18} />
              Description
            </DescriptionLabel>
            <DescriptionText>{location.description}</DescriptionText>
          </Description>
        </ModalBody>

        <ModalFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" leftIcon={<Edit size={16} />} onClick={handleEdit}>
            Edit Location
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LocationDetailModal;