import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Filter, Eye, Edit, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { CharacterDetailModal } from '../../components/characters/CharacterDetailModal';
import { CharacterFilterModal } from '../../components/characters/CharacterFilterModal';
import { CharacterEditModal } from '../../components/characters/CharacterEditModal';
import { CharacterAddModal } from '../../components/characters/CharacterAddModal';
import { RebelIcon, JediIcon, MandalorianIcon } from '../../components/ui/StarWarsIcons';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: between;
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

const CharacterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const CharacterCard = styled.div`
  background-color: ${({ theme }) => theme.colors.neutral.surface};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    box-shadow: ${({ theme }) => theme.effects.shadow.md};
    transform: translateY(-2px);
  }
`;

const CharacterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const CharacterName = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
`;

const CharacterActions = styled.div`
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

const CharacterInfo = styled.div`
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

const CharacterDescription = styled.p`
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

// Character interface matching API response
interface Character {
  id: string;
  name: string;
  species: string;
  homeworld: string;
  affiliation: string[];
  description: string;
  force_sensitivity?: string;
  rank?: string;
  era?: string;
  // Enhanced fields
  enhanced?: boolean;
  basic_info?: {
    id: string;
    name: string;
    species: string;
    homeworld: string;
    birth_year?: string;
    age_during_trilogy?: string;
    affiliations: string[];
  };
  physical_description?: {
    height?: string;
    hair?: string;
    eyes?: string;
    distinctive_features?: string[];
    typical_attire?: string[];
  };
  personality?: {
    core_traits?: string[];
    strengths?: string[];
    weaknesses?: string[];
    motivations?: string[];
    fears?: string[];
  };
  abilities?: {
    force_sensitivity?: string;
    force_powers?: string[];
    lightsaber_form?: string;
    combat_skills?: string[];
    other_skills?: string[];
  };
  equipment?: {
    primary_weapon?: string;
    secondary_weapons?: string[];
    signature_items?: string[];
    tools?: string[];
  };
  relationships?: {
    family?: Record<string, any>;
    mentors?: Record<string, any>;
    allies?: Record<string, any>;
    enemies?: Record<string, any>;
  };
  character_development?: {
    episode_4?: string;
    episode_5?: string;
    episode_6?: string;
    key_moments?: string[];
  };
  rpg_elements?: {
    notable_quotes?: string[];
    mannerisms?: string[];
    gm_hooks?: string[];
    story_seeds?: string[];
  };
  reputation?: Record<string, string>;
  historical_significance?: string;
  wookieepedia_url?: string;
  canon_source?: string;
  enhancement_version?: string;
  last_updated?: string;
}

interface CharacterFilters {
  species: string;
  affiliation: string;
  forceUser: string;
  era: string;
}

const defaultFilters: CharacterFilters = {
  species: 'All Species',
  affiliation: 'All Affiliations',
  forceUser: 'All Characters',
  era: 'All Eras'
};

export const CharactersPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [filteredCharacters, setFilteredCharacters] = useState<Character[]>([]);
  const [filters, setFilters] = useState<CharacterFilters>(defaultFilters);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCharacters, setTotalCharacters] = useState(0);
  const [charactersPerPage, setCharactersPerPage] = useState(20);
  const [enhancedMode, setEnhancedMode] = useState(true);

  // Fetch characters from API
  const fetchCharacters = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const timestamp = Date.now();
      const limit = charactersPerPage;
      const offset = (currentPage - 1) * charactersPerPage;
      
      let url = `http://localhost:3000/api/world/characters?limit=${limit}&offset=${offset}&_t=${timestamp}`;
      
      // Add enhanced mode if enabled
      if (enhancedMode) {
        url += `&enhanced=true`;
      }
      
      // Add search term if provided
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch characters');
      }
      
      const data = await response.json();
      setCharacters(data.data || []);
      setTotalCharacters(data.total || 0);
      
      console.log('📚 Fetched characters:', data.data?.length, 'of', data.total);
      
    } catch (err) {
      console.error('Error fetching characters:', err);
      setError('Failed to load characters. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply client-side filtering
  useEffect(() => {
    const filtered = characters.filter(character => {
      const matchesSpecies = filters.species === 'All Species' || character.species === filters.species;
      const matchesAffiliation = filters.affiliation === 'All Affiliations' || 
        character.affiliation.some(aff => aff === filters.affiliation);
      const matchesForceUser = filters.forceUser === 'All Characters' || 
        (filters.forceUser === 'Force Users' && character.force_sensitivity && character.force_sensitivity !== 'None') ||
        (filters.forceUser === 'Non-Force Users' && (!character.force_sensitivity || character.force_sensitivity === 'None'));
      const matchesEra = filters.era === 'All Eras' || character.era === filters.era;
      
      return matchesSpecies && matchesAffiliation && matchesForceUser && matchesEra;
    });
    
    setFilteredCharacters(filtered);
  }, [characters, filters]);

  // Fetch characters when component mounts or search/page changes
  useEffect(() => {
    fetchCharacters();
  }, [currentPage, searchTerm, charactersPerPage, enhancedMode]);

  const handleViewCharacter = (characterId: string) => {
    const character = characters.find(c => c.id === characterId);
    if (character) {
      setSelectedCharacter(character);
      setIsDetailModalOpen(true);
    }
  };

  const handleEditCharacter = (character: Character) => {
    setEditingCharacter(character);
    setIsEditModalOpen(true);
  };

  const handleApplyFilters = (newFilters: CharacterFilters) => {
    setFilters(newFilters);
  };

  const handleAddCharacter = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveCharacter = (updatedCharacter: Character) => {
    // TODO: Save character changes to backend
    console.log('Saving character changes:', updatedCharacter);
    setIsEditModalOpen(false);
    setEditingCharacter(null);
    // Refresh the list
    fetchCharacters();
  };

  const handleAddNewCharacter = (newCharacter: Omit<Character, 'id'>) => {
    // TODO: Add new character to backend
    console.log('Adding new character:', newCharacter);
    setIsAddModalOpen(false);
    // Refresh the list
    fetchCharacters();
  };

  const handleRefresh = () => {
    fetchCharacters();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchCharacters();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setCharactersPerPage(pageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const totalPages = Math.ceil(totalCharacters / charactersPerPage);

  return (
    <PageContainer>
      <Header>
        <Title>Heroes & Villains Archive ({totalCharacters} total)</Title>
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
            leftIcon={<JediIcon size={16} />}
            onClick={handleAddCharacter}
          >
            Add Hero
          </Button>
        </Controls>
      </Header>

      <SearchContainer>
        <SearchIcon size={20} />
        <SearchInput
          type="text"
          placeholder="Search heroes, villains, species, homeworld, affiliation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch(e)}
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
          <p style={{ 
            fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace', 
            fontSize: '14px', 
            fontWeight: 500, 
            letterSpacing: '0.05em', 
            textTransform: 'uppercase',
            color: '#64748B'
          }}>
            Accessing Jedi Archives...
          </p>
        </EmptyState>
      ) : filteredCharacters.length > 0 ? (
        <CharacterGrid>
          {filteredCharacters.map((character) => (
            <CharacterCard key={character.id}>
              <CharacterHeader>
                <CharacterName>{character.name}</CharacterName>
                <CharacterActions>
                  <ActionButton
                    onClick={() => handleViewCharacter(character.id)}
                    title="View Details"
                  >
                    <Eye size={16} />
                  </ActionButton>
                  <ActionButton
                    onClick={() => handleEditCharacter(character)}
                    title="Edit Character"
                  >
                    <Edit size={16} />
                  </ActionButton>
                </CharacterActions>
              </CharacterHeader>

              <CharacterInfo>
                <InfoRow>
                  <InfoLabel>Species:</InfoLabel>
                  <InfoValue>{character.basic_info?.species || character.species}</InfoValue>
                </InfoRow>
                {character.rank && (
                  <InfoRow>
                    <InfoLabel>Rank:</InfoLabel>
                    <InfoValue>{character.rank}</InfoValue>
                  </InfoRow>
                )}
                <InfoRow>
                  <InfoLabel>Homeworld:</InfoLabel>
                  <InfoValue>{character.basic_info?.homeworld || character.homeworld}</InfoValue>
                </InfoRow>
                <InfoRow>
                  <InfoLabel>Affiliation:</InfoLabel>
                  <InfoValue>{
                    character.basic_info?.affiliations ? 
                      character.basic_info.affiliations.join(', ') : 
                      (Array.isArray(character.affiliation) ? character.affiliation.join(', ') : character.affiliation)
                  }</InfoValue>
                </InfoRow>
                {(character.abilities?.force_sensitivity || character.force_sensitivity) && 
                 (character.abilities?.force_sensitivity || character.force_sensitivity) !== 'None' && (
                  <InfoRow>
                    <InfoLabel>Force Sensitivity:</InfoLabel>
                    <InfoValue>{character.abilities?.force_sensitivity || character.force_sensitivity}</InfoValue>
                  </InfoRow>
                )}
                {enhancedMode && character.basic_info?.birth_year && (
                  <InfoRow>
                    <InfoLabel>Born:</InfoLabel>
                    <InfoValue>{character.basic_info.birth_year}</InfoValue>
                  </InfoRow>
                )}
                {enhancedMode && character.physical_description?.height && (
                  <InfoRow>
                    <InfoLabel>Height:</InfoLabel>
                    <InfoValue>{character.physical_description.height}</InfoValue>
                  </InfoRow>
                )}
              </CharacterInfo>

              <CharacterDescription>
                {character.description}
              </CharacterDescription>
            </CharacterCard>
          ))}
        </CharacterGrid>
      ) : (
        <EmptyState>
          <EmptyStateIcon>
            <MandalorianIcon size={32} />
          </EmptyStateIcon>
          <p style={{ 
            fontFamily: '"Crimson Text", "Libre Baskerville", "Inter", serif', 
            fontStyle: 'italic',
            fontSize: '16px',
            lineHeight: '1.6',
            color: '#64748B'
          }}>
            The Jedi Archives remain incomplete. Perhaps the hero or villain you seek has not yet emerged from the shadows of the galaxy.
          </p>
          <Button 
            variant="primary" 
            leftIcon={<RebelIcon size={16} />}
            onClick={handleAddCharacter}
            forceSide="light"
          >
            Add to Archives
          </Button>
        </EmptyState>
      )}

      {/* Pagination */}
      {!isLoading && !error && totalCharacters > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalCharacters}
          itemsPerPage={charactersPerPage}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 20, 50, 100]}
          showPageSizeSelector={true}
          showInfo={true}
        />
      )}

      <CharacterDetailModal
        character={selectedCharacter}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEditCharacter}
      />

      <CharacterFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filters}
      />

      <CharacterEditModal
        character={editingCharacter}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCharacter(null);
        }}
        onSave={handleSaveCharacter}
      />

      <CharacterAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNewCharacter}
      />
    </PageContainer>
  );
};

export default CharactersPage;