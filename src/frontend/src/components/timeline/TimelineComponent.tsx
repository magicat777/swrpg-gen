import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { timelineApi, TimelineEvent, TimelineEra } from '../../services/api/timelineApi';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// Styled Components
const TimelineContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: ${props => props.theme.colors.background};
  color: #ffffff;
`;

const TimelineHeader = styled.div`
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  h2 {
    margin: 0 0 1rem 0;
    color: ${props => props.theme.colors.primary};
    font-family: ${props => props.theme.typography.fontFamily.logo};
    font-weight: ${props => props.theme.typography.fontWeight.black};
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
`;

const FilterControls = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
`;

const FilterSelect = styled.select`
  padding: 0.5rem;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  min-width: 200px;
  
  &:focus {
    border-color: ${props => props.theme.colors.primary};
    outline: none;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const SortButton = styled.button`
  padding: 0.5rem 1rem;
  background: rgba(74, 144, 226, 0.1);
  color: #4A90E2;
  border: 1px solid rgba(74, 144, 226, 0.3);
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.2s;
  white-space: nowrap;
  
  &:hover {
    background: rgba(74, 144, 226, 0.2);
    border-color: rgba(74, 144, 226, 0.5);
  }
  
  &:focus {
    outline: none;
    border-color: rgba(74, 144, 226, 0.5);
  }
`;

const TimelineContent = styled.div`
  flex: 1;
  display: flex;
  overflow: hidden;
`;

const ErasPanel = styled.div`
  width: 250px;
  background: ${props => props.theme.colors.surface};
  border-right: 1px solid ${props => props.theme.colors.border};
  overflow-y: auto;
`;

const EraItem = styled.div<{ $isSelected: boolean; $color?: string }>`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  transition: background-color 0.2s;
  background: ${props => props.$isSelected ? props.theme.colors.backgroundHover : 'transparent'};
  border-left: 4px solid ${props => props.$color || props.theme.colors.primary};
  
  &:hover {
    background: ${props => props.theme.colors.backgroundHover};
  }
  
  h4 {
    margin: 0 0 0.5rem 0;
    color: ${props => props.theme.colors.primary};
    font-family: ${props => props.theme.typography.fontFamily.title};
    font-size: 0.9rem;
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    letter-spacing: 0.02em;
  }
  
  p {
    margin: 0;
    font-size: 0.8rem;
    color: #cccccc;
    font-family: ${props => props.theme.typography.fontFamily.primary};
    font-weight: ${props => props.theme.typography.fontWeight.normal};
  }
  
  .timeframe {
    font-family: ${props => props.theme.typography.fontFamily.technical};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    color: #ffffff;
    margin-top: 0.25rem;
    letter-spacing: 0.05em;
  }
`;

const EventsPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const EventsHeader = styled.div`
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  
  h3 {
    margin: 0;
    color: ${props => props.theme.colors.primary};
    font-family: ${props => props.theme.typography.fontFamily.crawl};
    font-weight: ${props => props.theme.typography.fontWeight.semibold};
  }
  
  .event-count {
    color: #cccccc;
    font-family: ${props => props.theme.typography.fontFamily.technical};
    font-size: 0.9rem;
    margin-top: 0.25rem;
    font-weight: ${props => props.theme.typography.fontWeight.normal};
    letter-spacing: 0.05em;
  }
`;

const EventsList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

const EventCard = styled.div<{ $significance: string }>`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-left: 4px solid ${props => {
    switch (props.$significance) {
      case 'critical': return '#ff4444';
      case 'high': return '#ff8800';
      case 'medium': return '#ffcc00';
      case 'low': return '#88cc88';
      default: return props.theme.colors.border;
    }
  }};
  border-radius: 4px;
  padding: 1rem;
  margin-bottom: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  
  .event-header {
    display: flex;
    justify-content: between;
    align-items: flex-start;
    margin-bottom: 0.5rem;
  }
  
  .event-title {
    font-family: ${props => props.theme.typography.fontFamily.secondary};
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    color: ${props => props.theme.colors.primary};
    margin: 0;
    flex: 1;
  }
  
  .event-date {
    background: ${props => props.theme.colors.backgroundHover};
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-family: ${props => props.theme.typography.fontFamily.technical};
    font-size: 0.8rem;
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    margin-left: 1rem;
    color: #ffffff;
    letter-spacing: 0.05em;
  }
  
  .event-description {
    color: #ffffff;
    font-family: ${props => props.theme.typography.fontFamily.lore};
    margin: 0.5rem 0;
    line-height: 1.4;
    font-weight: ${props => props.theme.typography.fontWeight.normal};
  }
  
  .event-meta {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
  }
  
  .event-category {
    background: ${props => props.theme.colors.primary};
    color: white;
    padding: 0.25rem 0.5rem;
    border-radius: 12px;
    font-family: ${props => props.theme.typography.fontFamily.technical};
    font-size: 0.75rem;
    font-weight: ${props => props.theme.typography.fontWeight.bold};
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }
  
  .event-participants {
    color: #cccccc;
    font-family: ${props => props.theme.typography.fontFamily.primary};
    font-size: 0.8rem;
    font-weight: ${props => props.theme.typography.fontWeight.normal};
  }
  
  .event-location {
    color: ${props => props.theme.colors.accent};
    font-family: ${props => props.theme.typography.fontFamily.technical};
    font-size: 0.8rem;
    font-style: italic;
    font-weight: ${props => props.theme.typography.fontWeight.normal};
    letter-spacing: 0.05em;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #cccccc;
  
  h3 {
    margin-bottom: 1rem;
    color: #ffffff;
    font-weight: bold;
  }
  
  p {
    font-weight: normal;
  }
`;

// Component
export const TimelineComponent: React.FC = () => {
  const [eras, setEras] = useState<TimelineEra[]>([]);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [selectedEra, setSelectedEra] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    significance: '',
    search: '',
    sortOrder: 'desc' as 'asc' | 'desc' // Default to newest first (desc)
  });

  // Load eras on component mount
  useEffect(() => {
    const loadEras = async () => {
      try {
        setLoading(true);
        const erasData = await timelineApi.getTimelineEras();
        setEras(erasData);
        
        // Auto-select first era
        if (erasData.length > 0) {
          setSelectedEra(erasData[0].name);
        }
      } catch (error) {
        console.error('Failed to load timeline eras:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEras();
  }, []);

  // Load events when era or filters change
  useEffect(() => {
    const loadEvents = async () => {
      if (!selectedEra) return;
      
      try {
        setEventsLoading(true);
        const eventFilters = {
          era: selectedEra,
          ...(filters.category && filters.category !== '' && { category: filters.category as any }),
          ...(filters.significance && filters.significance !== '' && { significance: filters.significance as any }),
          sortBy: 'dateNumeric' as const,
          sortOrder: filters.sortOrder,
          limit: 1000
        };
        
        // Add search to the API call if it exists
        if (filters.search && filters.search.trim() !== '') {
          eventFilters.search = filters.search.trim();
        }
        
        console.log('Loading events with filters:', eventFilters);
        const result = await timelineApi.getTimelineEvents(eventFilters);
        setEvents(result.events);
      } catch (error) {
        console.error('Failed to load timeline events:', error);
        setEvents([]);
      } finally {
        setEventsLoading(false);
      }
    };

    loadEvents();
  }, [selectedEra, filters]);

  // Use events directly since filtering is done server-side
  const filteredEvents = events;

  const selectedEraData = eras.find(era => era.name === selectedEra);

  if (loading) {
    return (
      <TimelineContainer>
        <LoadingContainer>
          <LoadingSpinner />
        </LoadingContainer>
      </TimelineContainer>
    );
  }

  return (
    <TimelineContainer>
      <TimelineHeader>        
        <FilterControls>
          <FilterSelect
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">All Categories</option>
            <option value="political">Political</option>
            <option value="military">Military</option>
            <option value="jedi">Jedi</option>
            <option value="sith">Sith</option>
            <option value="technology">Technology</option>
            <option value="cultural">Cultural</option>
            <option value="other">Other</option>
          </FilterSelect>
          
          <FilterSelect
            value={filters.significance}
            onChange={(e) => setFilters(prev => ({ ...prev, significance: e.target.value }))}
          >
            <option value="">All Significance</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </FilterSelect>
          
          <SearchInput
            type="text"
            placeholder="Search events, people, or locations..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          />
          
          <SortButton
            onClick={() => setFilters(prev => ({ 
              ...prev, 
              sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' 
            }))}
            title={`Currently showing ${filters.sortOrder === 'desc' ? 'newest first' : 'oldest first'}. Click to switch.`}
          >
            {filters.sortOrder === 'desc' ? '↓ Newest First' : '↑ Oldest First'}
          </SortButton>
        </FilterControls>
      </TimelineHeader>

      <TimelineContent>
        <ErasPanel>
          {eras.map((era) => (
            <EraItem
              key={era.id}
              $isSelected={era.name === selectedEra}
              $color={era.color}
              onClick={() => setSelectedEra(era.name)}
            >
              <h4>{era.name}</h4>
              <p>{era.description}</p>
              <div className="timeframe">{era.timeframe}</div>
            </EraItem>
          ))}
        </ErasPanel>

        <EventsPanel>
          <EventsHeader>
            <h3>{selectedEraData?.name || 'Timeline Events'}</h3>
            <div className="event-count">
              {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            </div>
          </EventsHeader>

          <EventsList>
            {eventsLoading ? (
              <LoadingContainer>
                <LoadingSpinner />
              </LoadingContainer>
            ) : filteredEvents.length === 0 ? (
              <EmptyState>
                <h3>No Events Found</h3>
                <p>Try adjusting your filters or selecting a different era.</p>
              </EmptyState>
            ) : (
              filteredEvents.map((event) => (
                <EventCard key={event.id} $significance={event.significance}>
                  <div className="event-header">
                    <h3 className="event-title">{event.title}</h3>
                    <div className="event-date">{event.date}</div>
                  </div>
                  
                  <p className="event-description">{event.description}</p>
                  
                  <div className="event-meta">
                    <span className="event-category">{event.category}</span>
                    
                    {event.participants && event.participants.length > 0 && (
                      <span className="event-participants">
                        👤 {event.participants.slice(0, 3).join(', ')}
                        {event.participants.length > 3 && ` +${event.participants.length - 3} more`}
                      </span>
                    )}
                    
                    {event.location && (
                      <span className="event-location">📍 {event.location}</span>
                    )}
                  </div>
                </EventCard>
              ))
            )}
          </EventsList>
        </EventsPanel>
      </TimelineContent>
    </TimelineContainer>
  );
};