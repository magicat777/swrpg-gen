import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, MapPin, ExternalLink, Filter } from 'lucide-react';
import apiClient from '../../services/api/apiClient';

const PanelContainer = styled.div`
  width: 350px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 12px;
  padding: ${({ theme }) => theme.spacing.lg};
  border: 1px solid #333;
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PanelHeader = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.sm} 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: rgba(74, 144, 226, 0.5);
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.1);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.neutral.textSecondary};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const FilterSelect = styled.select`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.neutral.text};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  
  &:focus {
    outline: none;
    border-color: rgba(74, 144, 226, 0.5);
  }
`;

const LocationsContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  max-height: 60vh;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(74, 144, 226, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(74, 144, 226, 0.5);
    }
  }
`;

const LocationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LocationItem = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  padding: ${({ theme }) => theme.spacing.md};
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
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin-bottom: 2px;
`;

const LocationDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const LocationType = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  text-transform: capitalize;
`;

const LocationRegion = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: rgba(74, 144, 226, 0.8);
`;

const LocationActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ActionButton = styled.button`
  padding: 4px 8px;
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 4px;
  color: #4A90E2;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
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
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const ErrorContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
  background: rgba(233, 75, 60, 0.1);
  border: 1px solid rgba(233, 75, 60, 0.3);
  border-radius: 6px;
  color: #E94B3C;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  text-align: center;
`;

const StatusBar = styled.div`
  margin-top: ${({ theme }) => theme.spacing.md};
  padding: ${({ theme }) => theme.spacing.sm};
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
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
  canonical?: boolean;
  source?: string;
}

interface LocationsPanelProps {
  selectedLocationId?: string;
  onLocationSelect: (location: Location) => void;
  onLocationView: (location: Location) => void;
}

const LocationsPanel: React.FC<LocationsPanelProps> = ({
  selectedLocationId,
  onLocationSelect,
  onLocationView
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [total, setTotal] = useState(0);

  // Fetch locations from the database
  const fetchLocations = async (search = '', type = '', region = '') => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: '50', // Show more locations for the galaxy map
        offset: '0',
        enhanced: 'true' // Use MongoDB for enhanced location data
      });

      if (search) params.append('search', search);
      if (type) params.append('type', type);
      if (region) params.append('planet', region); // API uses 'planet' parameter for region filtering

      const response = await apiClient.get(`/world/locations?${params.toString()}`);
      
      if (response.data && response.data.data) {
        setLocations(response.data.data);
        setTotal(response.data.total || response.data.data.length);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations. Please try again.');
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchLocations();
  }, []);

  // Search and filter handling
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchLocations(searchTerm, typeFilter, regionFilter);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, typeFilter, regionFilter]);

  const handleLocationClick = (location: Location) => {
    onLocationSelect(location);
  };

  const handleViewDetails = (location: Location) => {
    onLocationView(location);
  };

  // Get unique types and regions for filters
  const uniqueTypes = [...new Set(locations.map(loc => loc.type).filter(Boolean))];
  const uniqueRegions = [...new Set(locations.map(loc => loc.region).filter(Boolean))];

  return (
    <PanelContainer>
      <PanelHeader>
        <Title>
          <MapPin size={20} />
          Galaxy Locations ({total})
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

        <FilterContainer>
          <FilterSelect
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </FilterSelect>
          
          <FilterSelect
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="">All Regions</option>
            {uniqueRegions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </FilterSelect>
        </FilterContainer>
      </PanelHeader>

      <LocationsContainer>
        {loading && (
          <LoadingContainer>
            Loading locations...
          </LoadingContainer>
        )}

        {error && (
          <ErrorContainer>
            {error}
          </ErrorContainer>
        )}

        {!loading && !error && (
          <LocationsList>
            {locations.map((location) => (
              <LocationItem
                key={location.id}
                $isSelected={selectedLocationId === location.id}
                onClick={() => handleLocationClick(location)}
              >
                <LocationIcon $type={location.type} />
                <LocationInfo>
                  <LocationName>{location.name}</LocationName>
                  <LocationDetails>
                    <LocationType>{location.type}</LocationType>
                    {location.region && (
                      <LocationRegion>{location.region}</LocationRegion>
                    )}
                  </LocationDetails>
                </LocationInfo>
                <LocationActions>
                  <ActionButton onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(location);
                  }}>
                    <ExternalLink size={12} />
                  </ActionButton>
                </LocationActions>
              </LocationItem>
            ))}
          </LocationsList>
        )}
      </LocationsContainer>

      <StatusBar>
        Data Source: MongoDB • All Canonical Locations
      </StatusBar>
    </PanelContainer>
  );
};

export default LocationsPanel;