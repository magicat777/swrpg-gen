import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Search, Map, Filter, Eye, Edit, Plus, MapPin, RefreshCw, Navigation } from 'lucide-react';
import GalacticMap from '../../components/map/GalacticMap';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { LocationDetailModal } from '../../components/locations/LocationDetailModal';
import { LocationFilterModal } from '../../components/locations/LocationFilterModal';
import { LocationEditModal } from '../../components/locations/LocationEditModal';
import { LocationAddModal } from '../../components/locations/LocationAddModal';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
  flex: 1;
`;

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
  flex-wrap: wrap;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.md} 48px;
  border: 2px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  background-color: ${({ theme }) => theme.colors.neutral.surface};
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

const SearchIcon = styled(Search)`
  position: absolute;
  left: ${({ theme }) => theme.spacing.md};
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  pointer-events: none;
`;

const LocationGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const LocationCard = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  overflow: hidden;
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.effects.shadow.md};
    transform: translateY(-2px);
  }
`;

const LocationImage = styled.div<{ $climate: string }>`
  height: 120px;
  background: ${({ $climate, theme }) => {
    switch ($climate) {
      case 'Desert': return `linear-gradient(135deg, #f4a460 0%, #daa520 100%)`;
      case 'Forest': return `linear-gradient(135deg, #228b22 0%, #006400 100%)`;
      case 'Ice': return `linear-gradient(135deg, #87ceeb 0%, #4169e1 100%)`;
      case 'Urban': return `linear-gradient(135deg, #696969 0%, #2f4f4f 100%)`;
      case 'Swamp': return `linear-gradient(135deg, #556b2f 0%, #8fbc8f 100%)`;
      case 'Volcanic': return `linear-gradient(135deg, #dc143c 0%, #8b0000 100%)`;
      default: return `linear-gradient(135deg, ${theme.colors.neutral.accent} 0%, ${theme.colors.neutral.border} 100%)`;
    }
  }};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClimateIcon = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  padding: ${({ theme }) => theme.spacing.md};
  color: white;
`;

const LocationContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const LocationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LocationName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
  flex: 1;
`;

const LocationActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  cursor: pointer;
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightSide.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const LocationInfo = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;

const InfoLabel = styled.span`
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const InfoValue = styled.span`
  color: ${({ theme }) => theme.colors.neutral.text};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const LocationDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin: 0;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
`;

const EmptyStateIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background-color: ${({ theme }) => theme.colors.neutral.background};
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  color: ${({ theme }) => theme.colors.neutral.accent};
  margin: 0 auto ${({ theme }) => theme.spacing.md};
`;

// Location interface matching API response
interface Location {
  id: string;
  name: string;
  system: string;
  region: string;
  climate: string;
  terrain: string;
  description: string;
  force_nexus?: string;
  significance?: string;
  era?: string;
  importance?: string;
  // Enhanced fields
  enhanced?: boolean;
  basic_info?: {
    id: string;
    name: string;
    system: string;
    region: string;
    sector?: string;
    coordinates?: string;
  };
  environmental_data?: {
    climate: string;
    terrain: string;
    atmosphere?: string;
    gravity?: string;
    day_length?: string;
    year_length?: string;
    temperature_range?: string;
    natural_resources?: string[];
    hazards?: string[];
  };
  cultural_significance?: {
    galactic_reputation?: string;
    historical_importance?: string;
    cultural_impact?: string;
    strategic_value?: string;
  };
  points_of_interest?: {
    landmarks?: string[];
    settlements?: string[];
    installations?: string[];
    natural_wonders?: string[];
  };
  inhabitants?: {
    native_species?: string[];
    population?: string;
    major_cities?: string[];
    government?: string;
    economy?: string;
  };
  history?: {
    ancient_history?: string;
    recent_events?: string;
    galactic_civil_war_role?: string;
    notable_battles?: string[];
  };
  rpg_elements?: {
    adventure_hooks?: string[];
    notable_npcs?: string[];
    local_customs?: string[];
    dangers_opportunities?: string[];
  };
  galactic_importance?: string;
  wookieepedia_url?: string;
  canon_source?: string;
  enhancement_version?: string;
  last_updated?: string;
}

interface LocationFilters {
  climate: string;
  terrain: string;
  region: string;
  forceNexus: string;
}

const defaultFilters: LocationFilters = {
  climate: 'All Climates',
  terrain: 'All Terrains',
  region: 'All Regions',
  forceNexus: 'All Locations'
};

export const LocationsPage: React.FC = () => {
  const { locationId } = useParams<{ locationId?: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [filters, setFilters] = useState<LocationFilters>(defaultFilters);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalLocations, setTotalLocations] = useState(0);
  const [locationsPerPage, setLocationsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [enhancedMode, setEnhancedMode] = useState(true);

  // Fetch locations from API
  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const timestamp = Date.now();
      const offset = (currentPage - 1) * locationsPerPage;
      let url = `http://localhost:3000/api/world/locations?limit=${locationsPerPage}&offset=${offset}&_t=${timestamp}`;
      
      // Add enhanced mode if enabled
      if (enhancedMode) {
        url += `&enhanced=true`;
      }
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      
      const data = await response.json();
      setLocations(data.data || []);
      setTotalLocations(data.total || 0);
      
      console.log('🌍 Fetched locations:', data.data?.length, 'of', data.total);
      
    } catch (err) {
      console.error('Error fetching locations:', err);
      setError('Failed to load locations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply client-side filtering
  useEffect(() => {
    const filtered = locations.filter(location => {
      const matchesClimate = filters.climate === 'All Climates' || location.climate === filters.climate;
      const matchesTerrain = filters.terrain === 'All Terrains' || location.terrain === filters.terrain;
      const matchesRegion = filters.region === 'All Regions' || location.region === filters.region;
      const matchesForceNexus = filters.forceNexus === 'All Locations' || 
        (filters.forceNexus === 'Force Nexus' && location.force_nexus && location.force_nexus !== 'Neutral') ||
        (filters.forceNexus === 'Neutral' && (!location.force_nexus || location.force_nexus === 'Neutral'));
      
      return matchesClimate && matchesTerrain && matchesRegion && matchesForceNexus;
    });
    
    setFilteredLocations(filtered);
  }, [locations, filters]);

  useEffect(() => {
    fetchLocations();
  }, [searchTerm, currentPage, locationsPerPage, enhancedMode]);

  // Handle URL parameter for direct location access
  useEffect(() => {
    if (locationId && locations.length > 0) {
      const location = locations.find(l => l.id === locationId);
      if (location) {
        setSelectedLocation(location);
        setIsDetailModalOpen(true);
      }
    }
  }, [locationId, locations]);

  const handleViewLocation = (locationId: string) => {
    const location = locations.find(l => l.id === locationId);
    if (location) {
      setSelectedLocation(location);
      setIsDetailModalOpen(true);
    }
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
    setIsEditModalOpen(true);
  };

  const handleApplyFilters = (newFilters: LocationFilters) => {
    setFilters(newFilters);
  };

  const handleAddLocation = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveLocation = (updatedLocation: Location) => {
    console.log('Saving location changes:', updatedLocation);
    setIsEditModalOpen(false);
    setEditingLocation(null);
    fetchLocations();
  };

  const handleAddNewLocation = (newLocation: Omit<Location, 'id'>) => {
    console.log('Adding new location:', newLocation);
    setIsAddModalOpen(false);
    fetchLocations();
  };

  const handleRefresh = () => {
    fetchLocations();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setLocationsPerPage(pageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const totalPages = Math.ceil(totalLocations / locationsPerPage);

  return (
    <PageContainer>
      <Header>
        <Title>Locations Database ({totalLocations} total)</Title>
        <Controls>
          <Button 
            variant={enhancedMode ? "primary" : "outline"}
            onClick={() => {
              setEnhancedMode(!enhancedMode);
              setCurrentPage(1);
            }}
            disabled={isLoading}
          >
            {enhancedMode ? "Enhanced Data" : "Basic Data"}
          </Button>
          <Button 
            variant="outline" 
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button 
            variant="outline" 
            leftIcon={<Filter size={16} />}
            onClick={() => setIsFilterModalOpen(true)}
          >
            Filters
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Plus size={16} />}
            onClick={handleAddLocation}
          >
            Add Location
          </Button>
        </Controls>
      </Header>

      <SearchContainer>
        <SearchIcon size={20} />
        <SearchInput
          type="text"
          placeholder="Search locations by name, system, region, climate, or terrain..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </SearchContainer>

      {error && (
        <div style={{ 
          color: 'red', 
          padding: '16px', 
          marginBottom: '16px', 
          backgroundColor: '#fee', 
          borderRadius: '8px' 
        }}>
          {error}
        </div>
      )}

      {isLoading ? (
        <EmptyState>
          <EmptyStateIcon>
            <RefreshCw size={32} />
          </EmptyStateIcon>
          <p style={{ fontFamily: 'var(--font-technical)', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Scanning star charts...
          </p>
        </EmptyState>
      ) : filteredLocations.length > 0 ? (
        <LocationGrid>
          {filteredLocations.map((location) => (
            <LocationCard key={location.id}>
              <LocationImage $climate={location.climate}>
                <ClimateIcon>
                  <MapPin size={24} />
                </ClimateIcon>
              </LocationImage>
              
              <LocationContent>
                <LocationHeader>
                  <LocationName>{location.name}</LocationName>
                  <LocationActions>
                    <ActionButton
                      onClick={() => handleViewLocation(location.id)}
                      title="View Details"
                    >
                      <Eye size={16} />
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleEditLocation(location)}
                      title="Edit Location"
                    >
                      <Edit size={16} />
                    </ActionButton>
                  </LocationActions>
                </LocationHeader>

                <LocationInfo>
                  <InfoRow>
                    <InfoLabel>System:</InfoLabel>
                    <InfoValue>{location.basic_info?.system || location.system}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Region:</InfoLabel>
                    <InfoValue>{location.basic_info?.region || location.region}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Climate:</InfoLabel>
                    <InfoValue>{location.environmental_data?.climate || location.climate}</InfoValue>
                  </InfoRow>
                  <InfoRow>
                    <InfoLabel>Terrain:</InfoLabel>
                    <InfoValue>{location.environmental_data?.terrain || location.terrain}</InfoValue>
                  </InfoRow>
                  {enhancedMode && location.basic_info?.sector && (
                    <InfoRow>
                      <InfoLabel>Sector:</InfoLabel>
                      <InfoValue>{location.basic_info.sector}</InfoValue>
                    </InfoRow>
                  )}
                  {enhancedMode && location.environmental_data?.atmosphere && (
                    <InfoRow>
                      <InfoLabel>Atmosphere:</InfoLabel>
                      <InfoValue>{location.environmental_data.atmosphere}</InfoValue>
                    </InfoRow>
                  )}
                  {enhancedMode && location.inhabitants?.population && (
                    <InfoRow>
                      <InfoLabel>Population:</InfoLabel>
                      <InfoValue>{location.inhabitants.population}</InfoValue>
                    </InfoRow>
                  )}
                  {location.force_nexus && location.force_nexus !== 'Neutral' && (
                    <InfoRow>
                      <InfoLabel>Force Nexus:</InfoLabel>
                      <InfoValue>{location.force_nexus}</InfoValue>
                    </InfoRow>
                  )}
                </LocationInfo>

                <LocationDescription>
                  {location.description}
                </LocationDescription>
              </LocationContent>
            </LocationCard>
          ))}
        </LocationGrid>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <Map size={32} />
          </EmptyStateIcon>
          <p style={{ fontFamily: 'var(--font-lore)', fontStyle: 'italic', color: 'var(--theme-colors-neutral-textSecondary)' }}>
            This sector of the galaxy remains uncharted. Perhaps you have discovered a new world to explore?
          </p>
          <Button 
            variant="primary" 
            leftIcon={<Plus size={16} />}
            onClick={handleAddLocation}
            forceSide="light"
          >
            Chart New World
          </Button>
        </EmptyState>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalLocations > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalLocations}
          itemsPerPage={locationsPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 20, 50, 100]}
          showPageSizeSelector={true}
          showInfo={true}
        />
      )}

      <LocationDetailModal
        location={selectedLocation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEditLocation}
      />

      <LocationFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      <LocationEditModal
        location={editingLocation}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLocation(null);
        }}
        onSave={handleSaveLocation}
      />

      <LocationAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNewLocation}
      />
    </PageContainer>
  );
};

export default LocationsPage;