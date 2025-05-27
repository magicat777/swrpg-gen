import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, MapPin, ExternalLink } from 'lucide-react';

const PanelContainer = styled.div`
  width: 350px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid #333;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 16px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 8px 8px 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ffffff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
  }

  &::placeholder {
    color: #888888;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #888888;
`;

const LocationsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
`;

const LocationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LocationItem = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${props => props.$isSelected ? 'rgba(74, 144, 226, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$isSelected ? 'rgba(74, 144, 226, 0.5)' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(74, 144, 226, 0.1);
    border-color: rgba(74, 144, 226, 0.3);
    transform: translateY(-1px);
  }
`;

const LocationIcon = styled.div<{ $type: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$type?.toLowerCase()) {
      case 'planet': return '#4A90E2';
      case 'moon': return '#F5A623';
      case 'space station': 
      case 'station': return '#E94B3C';
      case 'city': return '#50E3C2';
      default: return '#4A90E2';
    }
  }};
  flex-shrink: 0;
  box-shadow: 0 0 8px ${props => {
    switch (props.$type?.toLowerCase()) {
      case 'planet': return 'rgba(74, 144, 226, 0.4)';
      case 'moon': return 'rgba(245, 166, 35, 0.4)';
      case 'space station':
      case 'station': return 'rgba(233, 75, 60, 0.4)';
      case 'city': return 'rgba(80, 227, 194, 0.4)';
      default: return 'rgba(74, 144, 226, 0.4)';
    }
  }};
`;

const LocationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const LocationName = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 2px;
`;

const LocationType = styled.div`
  font-size: 12px;
  color: #888888;
  text-transform: capitalize;
`;

const LocationRegion = styled.div`
  font-size: 12px;
  color: rgba(74, 144, 226, 0.8);
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 4px;
  color: #4A90E2;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &:hover {
    background: rgba(74, 144, 226, 0.2);
    border-color: rgba(74, 144, 226, 0.5);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 32px;
  color: #888888;
`;

const StatusBar = styled.div`
  margin-top: 16px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: 12px;
  color: #888888;
  text-align: center;
`;

interface Location {
  id: string;
  name: string;
  type: string;
  region: string;
  climate: string;
  terrain: string;
  description: string;
}

interface SimpleLocationsPanelProps {
  selectedLocationId?: string;
  onLocationSelect: (location: Location) => void;
  onLocationView: (location: Location) => void;
}

// Mock data for now - will be replaced with API call
const MOCK_LOCATIONS: Location[] = [
  {
    id: 'tatooine',
    name: 'Tatooine',
    type: 'Planet',
    region: 'Outer Rim',
    climate: 'Arid',
    terrain: 'Desert',
    description: 'Twin-sunned desert world, homeworld of Luke and Anakin Skywalker.'
  },
  {
    id: 'coruscant', 
    name: 'Coruscant',
    type: 'Planet',
    region: 'Core Worlds',
    climate: 'Temperate',
    terrain: 'Cityscape',
    description: 'Galaxy-spanning city and capital of the Republic and Empire.'
  },
  {
    id: 'hoth',
    name: 'Hoth',
    type: 'Planet', 
    region: 'Outer Rim',
    climate: 'Frozen',
    terrain: 'Ice plains',
    description: 'Frozen wasteland that served as Echo Base.'
  },
  {
    id: 'endor',
    name: 'Endor',
    type: 'Moon',
    region: 'Outer Rim', 
    climate: 'Temperate',
    terrain: 'Forest',
    description: 'Forest moon inhabited by Ewoks.'
  },
  {
    id: 'dagobah',
    name: 'Dagobah',
    type: 'Planet',
    region: 'Outer Rim',
    climate: 'Murky',
    terrain: 'Swamp',
    description: 'Swamp world where Yoda lived in exile.'
  }
];

const SimpleLocationsPanel: React.FC<SimpleLocationsPanelProps> = ({
  selectedLocationId,
  onLocationSelect,
  onLocationView
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch locations from database API
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/world/locations');
        if (response.ok) {
          const data = await response.json();
          // Transform API response to match our interface
          const transformedLocations = data.map((loc: any) => ({
            id: loc._id || loc.id,
            name: loc.name,
            type: loc.type || 'Planet',
            region: loc.region || loc.sector || 'Unknown',
            climate: loc.climate || 'Unknown',
            terrain: loc.terrain || 'Unknown',
            description: loc.description || 'No description available.'
          }));
          setLocations(transformedLocations);
        } else {
          console.error('Failed to fetch locations:', response.statusText);
          // Fallback to mock data if API fails
          setLocations(MOCK_LOCATIONS);
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
        // Fallback to mock data if API fails
        setLocations(MOCK_LOCATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchLocations();
  }, []);

  // Filter locations based on search
  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location);
  };

  const handleViewDetails = (location: Location) => {
    onLocationView(location);
  };

  return (
    <PanelContainer>
      <Title>
        <MapPin size={20} />
        Galaxy Locations ({filteredLocations.length})
      </Title>
      
      <SearchContainer>
        <SearchIcon>
          <Search size={16} />
        </SearchIcon>
        <SearchInput
          type="text"
          placeholder="Search locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      <LocationsContainer>
        {loading ? (
          <LoadingContainer>
            Loading locations...
          </LoadingContainer>
        ) : (
          <LocationsList>
            {filteredLocations.map((location) => (
              <LocationItem
                key={location.id}
                $isSelected={selectedLocationId === location.id}
                onClick={() => handleLocationClick(location)}
              >
                <LocationIcon $type={location.type} />
                <LocationInfo>
                  <LocationName>{location.name}</LocationName>
                  <LocationType>{location.type}</LocationType>
                  <LocationRegion>{location.region}</LocationRegion>
                </LocationInfo>
                <ActionButton onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(location);
                }}>
                  <ExternalLink size={12} />
                </ActionButton>
              </LocationItem>
            ))}
          </LocationsList>
        )}
      </LocationsContainer>

      <StatusBar>
        Live Database • {locations.length} Canonical Locations
      </StatusBar>
    </PanelContainer>
  );
};

export default SimpleLocationsPanel;