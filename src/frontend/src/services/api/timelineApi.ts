import { apiGet } from './apiClient';

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string; // BBY/ABY format
  dateNumeric: number; // For sorting
  era: string;
  category: 'political' | 'military' | 'jedi' | 'sith' | 'technology' | 'cultural' | 'other';
  significance: 'low' | 'medium' | 'high' | 'critical';
  participants?: string[];
  location?: string;
  consequences?: string[];
  relatedEvents?: string[];
  sources?: string[];
  tags?: string[];
  isCanonical: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEra {
  id: string;
  name: string;
  description: string;
  timeframe: string;
  startDate: number;
  endDate: number;
  characteristics: string[];
  majorEvents: string[];
  keyFigures: string[];
  significance: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEventsResponse {
  events: TimelineEvent[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface TimelineStats {
  totalEvents: number;
  canonicalEvents: number;
  eventsByCategory: Record<string, number>;
  eventsByEra: Record<string, number>;
  eventsBySignificance: Record<string, number>;
  generatedAt: string;
}

export interface TimelineSearchResult {
  query: string;
  results: TimelineEvent[];
  count: number;
}

export interface TimelineEventsFilters {
  era?: string;
  category?: 'political' | 'military' | 'jedi' | 'sith' | 'technology' | 'cultural' | 'other';
  significance?: 'low' | 'medium' | 'high' | 'critical';
  startDate?: number;
  endDate?: number;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'dateNumeric' | 'title' | 'significance' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

class TimelineApi {
  /**
   * Get timeline events with optional filtering
   */
  async getTimelineEvents(filters: TimelineEventsFilters = {}): Promise<TimelineEventsResponse> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const url = `/timeline/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await apiGet<{ data: TimelineEventsResponse }>(url);
    return response.data;
  }

  /**
   * Get all timeline eras
   */
  async getTimelineEras(): Promise<TimelineEra[]> {
    const response = await apiGet<{ data: TimelineEra[] }>('/timeline/eras');
    return response.data;
  }

  /**
   * Get a specific timeline event by ID
   */
  async getTimelineEvent(eventId: string): Promise<TimelineEvent> {
    const response = await apiGet<{ data: TimelineEvent }>(`/timeline/events/${eventId}`);
    return response.data;
  }

  /**
   * Get timeline statistics
   */
  async getTimelineStats(): Promise<TimelineStats> {
    const response = await apiGet<{ data: TimelineStats }>('/timeline/stats');
    return response.data;
  }

  /**
   * Search timeline events by text
   */
  async searchTimelineEvents(query: string, limit: number = 50): Promise<TimelineSearchResult> {
    const queryParams = new URLSearchParams({
      q: query,
      limit: limit.toString()
    });
    
    const response = await apiGet<{ data: TimelineSearchResult }>(`/timeline/search?${queryParams.toString()}`);
    return response.data;
  }

  /**
   * Get events for a specific era
   */
  async getEventsForEra(eraName: string, limit: number = 100): Promise<TimelineEvent[]> {
    const result = await this.getTimelineEvents({
      era: eraName,
      limit,
      sortBy: 'dateNumeric',
      sortOrder: 'asc'
    });
    return result.events;
  }

  /**
   * Get events by category
   */
  async getEventsByCategory(
    category: 'political' | 'military' | 'jedi' | 'sith' | 'technology' | 'cultural' | 'other',
    limit: number = 100
  ): Promise<TimelineEvent[]> {
    const result = await this.getTimelineEvents({
      category,
      limit,
      sortBy: 'dateNumeric',
      sortOrder: 'asc'
    });
    return result.events;
  }

  /**
   * Get critical events (highest significance)
   */
  async getCriticalEvents(limit: number = 50): Promise<TimelineEvent[]> {
    const result = await this.getTimelineEvents({
      significance: 'critical',
      limit,
      sortBy: 'dateNumeric',
      sortOrder: 'asc'
    });
    return result.events;
  }

  /**
   * Get events in a date range
   */
  async getEventsInDateRange(
    startDate: number,
    endDate: number,
    limit: number = 100
  ): Promise<TimelineEvent[]> {
    const result = await this.getTimelineEvents({
      startDate,
      endDate,
      limit,
      sortBy: 'dateNumeric',
      sortOrder: 'asc'
    });
    return result.events;
  }
}

export const timelineApi = new TimelineApi();
export default timelineApi;