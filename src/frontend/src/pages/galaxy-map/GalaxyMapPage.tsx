import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Navigation } from 'lucide-react';
import GalacticMap from '../../components/map/GalacticMap';
import MinimalLocationsPanel from '../../components/galaxy-map/MinimalLocationsPanel';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
`;

const Header = styled.header`
  display: flex;
  justify-content: between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid #333;
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  background: linear-gradient(45deg, #FFE81F, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-left: auto;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 6px;
  color: #4A90E2;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(74, 144, 226, 0.2);
    border-color: rgba(74, 144, 226, 0.5);
  }
`;

const MapContent = styled.div`
  flex: 1;
  display: flex;
  gap: ${({ theme }) => theme.spacing.lg};
  padding: ${({ theme }) => theme.spacing.lg};
`;

const MapContainer = styled.div`
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid #333;
`;

const Sidebar = styled.div`
  width: 350px;
  display: flex;
  flex-direction: column;
  height: 100%;
`;


interface Location {
  id: string;
  name: string;
  type: string;
  region: string;
  climate: string;
  terrain: string;
  description: string;
  canonical?: boolean;
  source?: string;
}

// This will be replaced by live database data
const FALLBACK_LOCATIONS: Location[] = [];

const GalaxyMapPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  const handleLocationView = (location: Location) => {
    // Navigate to the location details page
    navigate(`/locations/${location.id}`);
  };

  return (
    <PageContainer>
      <Header>
        <Title>
          <Navigation size={28} />
          Galactic Navigation Chart
        </Title>
        <HeaderActions>
          <ActionButton onClick={() => navigate('/locations')}>
            <ExternalLink size={16} />
            Locations Database
          </ActionButton>
        </HeaderActions>
      </Header>

      <MapContent>
        <MapContainer>
          <GalacticMap />
        </MapContainer>

        <Sidebar>
          <MinimalLocationsPanel
            selectedLocationId={selectedLocation?.id}
            onLocationSelect={handleLocationSelect}
            onLocationView={handleLocationView}
          />
        </Sidebar>
      </MapContent>
    </PageContainer>
  );
};

export default GalaxyMapPage;