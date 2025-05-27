import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Search, Book, Calendar, Globe, Users, Scroll, Eye, ExternalLink, Edit, Plus, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Pagination } from '../../components/ui/Pagination';
import { LoreEditModal } from '../../components/lore/LoreEditModal';
import { LoreAddModal } from '../../components/lore/LoreAddModal';
import { LoreDetailModal } from '../../components/lore/LoreDetailModal';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  gap: ${({ theme }) => theme.spacing.md};
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize['3xl']};
  font-weight: ${({ theme }) => theme.typography.fontWeight.bold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
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

const CategoryTabs = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  overflow-x: auto;
  padding-bottom: ${({ theme }) => theme.spacing.xs};
`;

const CategoryTab = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 2px solid ${({ $isActive, theme }) => 
    $isActive ? theme.colors.lightSide.primary : theme.colors.neutral.border
  };
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background-color: ${({ $isActive, theme }) => 
    $isActive ? theme.colors.lightSide.primary : theme.colors.neutral.surface
  };
  color: ${({ $isActive, theme }) => 
    $isActive ? 'white' : theme.colors.neutral.text
  };
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.effects.transition.fast};
  white-space: nowrap;
  
  &:hover {
    background-color: ${({ $isActive, theme }) => 
      $isActive ? theme.colors.lightSide.secondary : theme.colors.lightSide.primary
    };
    color: white;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

const LoreGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const LoreCard = styled.div`
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

const LoreImage = styled.div<{ $category: string }>`
  height: 120px;
  background: ${({ $category, theme }) => {
    switch ($category) {
      case 'characters': return `linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)`;
      case 'events': return `linear-gradient(135deg, #dc2626 0%, #ea580c 100%)`;
      case 'locations': return `linear-gradient(135deg, #059669 0%, #0891b2 100%)`;
      case 'organizations': return `linear-gradient(135deg, #7c2d12 0%, #a16207 100%)`;
      case 'timeline': return `linear-gradient(135deg, #1e40af 0%, #6366f1 100%)`;
      default: return `linear-gradient(135deg, ${theme.colors.neutral.accent} 0%, ${theme.colors.neutral.border} 100%)`;
    }
  }};
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CategoryIcon = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  padding: ${({ theme }) => theme.spacing.md};
  color: white;
`;

const LoreContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`;

const LoreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const LoreTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSize.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  color: ${({ theme }) => theme.colors.neutral.text};
  margin: 0;
  flex: 1;
`;

const LoreCategory = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.effects.borderRadius.full};
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: ${({ theme }) => theme.colors.lightSide.primary}20;
  color: ${({ theme }) => theme.colors.lightSide.primary};
`;

const LoreDescription = styled.p`
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  line-height: ${({ theme }) => theme.typography.lineHeight.relaxed};
  margin: 0 0 ${({ theme }) => theme.spacing.md} 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const LoreActions = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.neutral.border};
  border-radius: ${({ theme }) => theme.effects.borderRadius.md};
  background-color: ${({ theme }) => theme.colors.neutral.background};
  color: ${({ theme }) => theme.colors.neutral.textSecondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  cursor: pointer;
  transition: ${({ theme }) => theme.effects.transition.fast};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightSide.primary};
    color: white;
    border-color: ${({ theme }) => theme.colors.lightSide.primary};
  }
`;

// Faction data structure from API
interface FactionEntry {
  id: string;
  name: string;
  type: string;
  description: string;
  era: string;
  alignment: string;
  headquarters?: string;
  philosophy?: string;
  importance?: string;
  detailed_content?: string;
  key_figures?: string;
  wookieepedia_url?: string;
  source?: string;
}

// Lore entry format for modals
interface LoreEntry {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  era?: string;
  source: string;
}

const categories = [
  { id: 'all', label: 'All Factions', icon: Book },
  { id: 'Religious Order', label: 'Religious Orders', icon: Scroll },
  { id: 'Government', label: 'Governments', icon: Globe },
  { id: 'Military Organization', label: 'Military', icon: Users },
  { id: 'Criminal Organization', label: 'Criminal', icon: Users },
  { id: 'Force Order', label: 'Force Orders', icon: Scroll }
];

// Convert faction entry to lore entry format
const adaptFactionToLoreEntry = (factionEntry: FactionEntry): LoreEntry => {
  // Use enhanced detailed content if available, otherwise build from basic fields
  const content = factionEntry.detailed_content || [
    factionEntry.philosophy && `Philosophy: ${factionEntry.philosophy}`,
    factionEntry.headquarters && `Headquarters: ${factionEntry.headquarters}`,
    factionEntry.alignment && `Alignment: ${factionEntry.alignment}`,
    factionEntry.key_figures && `Key Figures: ${factionEntry.key_figures}`,
    factionEntry.importance && `Importance: ${factionEntry.importance}`
  ].filter(Boolean).join('\n\n') || 'No additional content available.';

  return {
    id: factionEntry.id,
    title: factionEntry.name,
    category: factionEntry.type || 'organizations',
    description: factionEntry.description,
    content: content,
    era: factionEntry.era,
    source: factionEntry.wookieepedia_url || factionEntry.source || 'Star Wars Database'
  };
};

export const LorePage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loreEntries, setLoreEntries] = useState<FactionEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<FactionEntry[]>([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingLoreEntry, setEditingLoreEntry] = useState<LoreEntry | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [viewingLoreEntry, setViewingLoreEntry] = useState<LoreEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalFactions, setTotalFactions] = useState(0);
  const [factionsPerPage, setFactionsPerPage] = useState(20);

  // Fetch factions from API
  const fetchFactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const timestamp = Date.now();
      const offset = (currentPage - 1) * factionsPerPage;
      let url = `http://localhost:3000/api/world/factions?limit=${factionsPerPage}&offset=${offset}&_t=${timestamp}`;
      
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      
      const response = await fetch(url, {
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch factions');
      }
      
      const data = await response.json();
      setLoreEntries(data.data || []);
      setTotalFactions(data.total || 0);
      
      console.log('⚔️ Fetched factions:', data.data?.length, 'of', data.total);
      
    } catch (err) {
      console.error('Error fetching factions:', err);
      setError('Failed to load factions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Apply client-side filtering
  useEffect(() => {
    const filtered = loreEntries.filter(entry => {
      const matchesCategory = activeCategory === 'all' || entry.type === activeCategory;
      return matchesCategory;
    });
    
    setFilteredEntries(filtered);
  }, [loreEntries, activeCategory]);

  useEffect(() => {
    fetchFactions();
  }, [searchTerm, currentPage, factionsPerPage]);

  const handleViewLore = (loreId: string) => {
    const factionEntry = loreEntries.find(entry => entry.id === loreId);
    if (factionEntry) {
      const adaptedLoreEntry = adaptFactionToLoreEntry(factionEntry);
      setViewingLoreEntry(adaptedLoreEntry);
      setIsDetailModalOpen(true);
    }
  };

  const handleViewSource = (source: string) => {
    if (!source) {
      alert('No source URL available for this faction.');
      return;
    }
    
    // If it's a Wookieepedia URL, open it in a new tab
    if (source.includes('starwars.fandom.com') || source.startsWith('http')) {
      window.open(source, '_blank', 'noopener,noreferrer');
    } else {
      // For other sources, show the source information
      alert(`Source: ${source}\n\nThis faction's information comes from canonical Star Wars sources.`);
    }
  };

  const handleEditLore = (factionEntry: FactionEntry) => {
    const adaptedLoreEntry = adaptFactionToLoreEntry(factionEntry);
    setEditingLoreEntry(adaptedLoreEntry);
    setIsEditModalOpen(true);
  };

  const handleAddLore = () => {
    setIsAddModalOpen(true);
  };

  const handleSaveLore = (updatedLoreEntry: LoreEntry) => {
    // TODO: Save lore entry changes to backend
    console.log('Saving lore entry changes:', updatedLoreEntry);
    setIsEditModalOpen(false);
    setEditingLoreEntry(null);
  };

  const handleAddNewLore = (newLoreEntry: Omit<LoreEntry, 'id'>) => {
    console.log('Adding new lore entry:', newLoreEntry);
    setIsAddModalOpen(false);
    fetchFactions();
  };

  const handleRefresh = () => {
    fetchFactions();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFactionsPerPage(pageSize);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(totalFactions / factionsPerPage);

  const getCategoryIcon = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    const IconComponent = category?.icon || Book;
    return <IconComponent size={24} />;
  };

  return (
    <PageContainer>
      <Header>
        <HeaderContent>
          <Title>Star Wars Factions Database ({totalFactions} total)</Title>
          <Subtitle>
            Explore the organizations, orders, and factions of the Star Wars universe
          </Subtitle>
        </HeaderContent>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button 
            variant="outline" 
            leftIcon={<RefreshCw size={16} />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button 
            variant="primary" 
            leftIcon={<Plus size={16} />}
            onClick={handleAddLore}
          >
            Add Faction
          </Button>
        </div>
      </Header>

      <SearchContainer>
        <SearchIcon size={20} />
        <SearchInput
          type="text"
          placeholder="Search factions by name, type, or description..."
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

      <CategoryTabs>
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <CategoryTab
              key={category.id}
              $isActive={activeCategory === category.id}
              onClick={() => setActiveCategory(category.id)}
            >
              <IconComponent size={16} />
              {category.label}
            </CategoryTab>
          );
        })}
      </CategoryTabs>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
          <RefreshCw size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <p style={{ fontFamily: 'var(--font-technical)', fontSize: '0.875rem', fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Accessing Imperial Records...
          </p>
        </div>
      ) : (
        <>
          <LoreGrid>
            {filteredEntries.map((entry) => (
              <LoreCard key={entry.id}>
                <LoreImage $category={entry.type}>
                  <CategoryIcon>
                    {getCategoryIcon(entry.type)}
                  </CategoryIcon>
                </LoreImage>
                
                <LoreContent>
                  <LoreHeader>
                    <LoreTitle>{entry.name}</LoreTitle>
                    <LoreCategory>{entry.type}</LoreCategory>
                  </LoreHeader>

                  <LoreDescription>{entry.description}</LoreDescription>
                  
                  {entry.philosophy && (
                    <LoreDescription style={{ fontStyle: 'italic', marginTop: '8px' }}>
                      Philosophy: {entry.philosophy}
                    </LoreDescription>
                  )}

                  <LoreActions>
                    <ActionButton onClick={() => handleViewLore(entry.id)}>
                      <Eye size={14} />
                      Details
                    </ActionButton>
                    <ActionButton onClick={() => handleEditLore(entry)}>
                      <Edit size={14} />
                      Edit
                    </ActionButton>
                    <ActionButton onClick={() => handleViewSource(entry.wookieepedia_url || entry.source || '')}>
                      <ExternalLink size={14} />
                      Source
                    </ActionButton>
                  </LoreActions>
                </LoreContent>
              </LoreCard>
            ))}
          </LoreGrid>

          {filteredEntries.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', padding: '4rem', color: '#6b7280' }}>
              <Book size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p style={{ fontFamily: 'var(--font-lore)', fontStyle: 'italic', color: 'var(--theme-colors-neutral-textSecondary)' }}>
                These records have been lost to time. Perhaps the faction you seek operates in the shadows of the galaxy.
              </p>
            </div>
          )}

          {/* Pagination */}
          {!isLoading && !error && totalFactions > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalFactions}
              itemsPerPage={factionsPerPage}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              pageSizeOptions={[10, 20, 50, 100]}
              showPageSizeSelector={true}
              showInfo={true}
            />
          )}
        </>
      )}

      <LoreDetailModal
        loreEntry={viewingLoreEntry}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setViewingLoreEntry(null);
        }}
        onEdit={handleEditLore}
        onViewSource={handleViewSource}
      />

      <LoreEditModal
        loreEntry={editingLoreEntry}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingLoreEntry(null);
        }}
        onSave={handleSaveLore}
      />

      <LoreAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddNewLore}
      />
    </PageContainer>
  );
};

export default LorePage;