import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import mongodbService from '../services/mongodbService';
import { ObjectId } from 'mongodb';

interface TimelineEvent {
  _id?: ObjectId;
  id?: string;
  title: string;
  description: string;
  date: string; // In BBY/ABY format (e.g., "19 BBY", "4 ABY")
  dateNumeric: number; // Numeric value for sorting (negative for BBY, positive for ABY)
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
  createdAt: Date;
  updatedAt: Date;
}

interface TimelineEra {
  _id?: ObjectId;
  id?: string;
  name: string;
  description: string;
  timeframe: string;
  startDate: number; // Numeric BBY/ABY
  endDate: number; // Numeric BBY/ABY
  characteristics: string[];
  majorEvents: string[];
  keyFigures: string[];
  significance: string;
  color?: string; // For UI display
  createdAt: Date;
  updatedAt: Date;
}

class TimelineController {
  /**
   * Get all timeline events with optional filtering
   */
  async getTimelineEvents(req: Request, res: Response): Promise<void> {
    try {
      const {
        era,
        category,
        significance,
        startDate,
        endDate,
        search,
        limit = 100,
        offset = 0,
        sortBy = 'dateNumeric',
        sortOrder = 'asc'
      } = req.query;

      const eventsCollection = mongodbService.getTimelineEventsCollection();
      
      // Build filter query
      const filter: any = {};
      
      if (era) filter.era = era;
      if (category) filter.category = category;
      if (significance) filter.significance = significance;
      
      if (startDate || endDate) {
        filter.dateNumeric = {};
        if (startDate) filter.dateNumeric.$gte = parseInt(startDate as string);
        if (endDate) filter.dateNumeric.$lte = parseInt(endDate as string);
      }
      
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { participants: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }

      // Execute query with pagination and sorting
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

      const events = await eventsCollection
        .find(filter)
        .sort(sort)
        .skip(parseInt(offset as string))
        .limit(parseInt(limit as string))
        .toArray();

      const total = await eventsCollection.countDocuments(filter);

      // Format response
      const formattedEvents = events.map(event => ({
        ...event,
        id: event._id.toString(),
        _id: undefined
      }));

      logger.info(`Retrieved ${formattedEvents.length} timeline events`, {
        filter,
        total,
        limit,
        offset
      });

      res.json({
        success: true,
        data: {
          events: formattedEvents,
          pagination: {
            total,
            limit: parseInt(limit as string),
            offset: parseInt(offset as string),
            hasMore: parseInt(offset as string) + formattedEvents.length < total
          }
        }
      });

    } catch (error) {
      logger.error('Error getting timeline events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get timeline events'
      });
    }
  }

  /**
   * Get timeline eras
   */
  async getTimelineEras(req: Request, res: Response): Promise<void> {
    try {
      const erasCollection = mongodbService.getTimelineErasCollection();
      
      const eras = await erasCollection
        .find({})
        .sort({ startDate: 1 })
        .toArray();

      const formattedEras = eras.map(era => ({
        ...era,
        id: era._id.toString(),
        _id: undefined
      }));

      logger.info(`Retrieved ${formattedEras.length} timeline eras`);

      res.json({
        success: true,
        data: formattedEras
      });

    } catch (error) {
      logger.error('Error getting timeline eras:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get timeline eras'
      });
    }
  }

  /**
   * Get a specific timeline event
   */
  async getTimelineEvent(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      // Validate ObjectId format
      if (!ObjectId.isValid(eventId)) {
        res.status(400).json({
          success: false,
          error: 'Invalid event ID format'
        });
        return;
      }

      const eventsCollection = mongodbService.getTimelineEventsCollection();
      
      const event = await eventsCollection.findOne({
        _id: new ObjectId(eventId)
      });

      if (!event) {
        res.status(404).json({
          success: false,
          error: 'Timeline event not found'
        });
        return;
      }

      const formattedEvent = {
        ...event,
        id: event._id.toString(),
        _id: undefined
      };

      logger.info(`Retrieved timeline event: ${eventId}`);

      res.json({
        success: true,
        data: formattedEvent
      });

    } catch (error) {
      logger.error('Error getting timeline event:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get timeline event'
      });
    }
  }

  /**
   * Get timeline statistics
   */
  async getTimelineStats(req: Request, res: Response): Promise<void> {
    try {
      const eventsCollection = mongodbService.getTimelineEventsCollection();
      
      // Get basic counts
      const totalEvents = await eventsCollection.countDocuments({});
      const canonicalEvents = await eventsCollection.countDocuments({ isCanonical: true });
      
      // Get events by category
      const eventsByCategory = await eventsCollection.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      // Get events by era
      const eventsByEra = await eventsCollection.aggregate([
        {
          $group: {
            _id: '$era',
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      // Get events by significance
      const eventsBySignificance = await eventsCollection.aggregate([
        {
          $group: {
            _id: '$significance',
            count: { $sum: 1 }
          }
        }
      ]).toArray();

      const stats = {
        totalEvents,
        canonicalEvents,
        eventsByCategory: Object.fromEntries(
          eventsByCategory.map(item => [item._id, item.count])
        ),
        eventsByEra: Object.fromEntries(
          eventsByEra.map(item => [item._id, item.count])
        ),
        eventsBySignificance: Object.fromEntries(
          eventsBySignificance.map(item => [item._id, item.count])
        ),
        generatedAt: new Date()
      };

      logger.info('Generated timeline statistics', { stats });

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error('Error getting timeline stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get timeline statistics'
      });
    }
  }

  /**
   * Search timeline events by text
   */
  async searchTimelineEvents(req: Request, res: Response): Promise<void> {
    try {
      const { q, limit = 50 } = req.query;

      if (!q || typeof q !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
        return;
      }

      const eventsCollection = mongodbService.getTimelineEventsCollection();
      
      const events = await eventsCollection
        .find({
          $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { participants: { $regex: q, $options: 'i' } },
            { location: { $regex: q, $options: 'i' } },
            { tags: { $regex: q, $options: 'i' } }
          ]
        })
        .sort({ dateNumeric: 1 })
        .limit(parseInt(limit as string))
        .toArray();

      const formattedEvents = events.map(event => ({
        ...event,
        id: event._id.toString(),
        _id: undefined
      }));

      logger.info(`Search found ${formattedEvents.length} timeline events`, {
        query: q,
        resultCount: formattedEvents.length
      });

      res.json({
        success: true,
        data: {
          query: q,
          results: formattedEvents,
          count: formattedEvents.length
        }
      });

    } catch (error) {
      logger.error('Error searching timeline events:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search timeline events'
      });
    }
  }
}

export default new TimelineController();