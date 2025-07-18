import { createClient } from '@/lib/supabase/client';
import {
  HelpTopic,
  HelpCategory,
  HelpContext,
  HelpSearchResult,
  HelpTooltip,
  HelpTour,
  SearchHelpRequest,
  GetContextualHelpRequest,
  GetHelpTooltipsRequest
} from '@/types/help';

/**
 * Service for handling help content
 */
export class HelpService {
  /**
   * Get all help topics
   */
  static async getAllTopics(): Promise<HelpTopic[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('help_topics')
        .select('*')
        .order('title');
      
      if (error) {
        console.error('Error fetching help topics:', error);
        return [];
      }
      
      return data as HelpTopic[];
    } catch (error) {
      console.error('Error in getAllTopics:', error);
      return [];
    }
  }
  
  /**
   * Get all help categories
   */
  static async getAllCategories(): Promise<HelpCategory[]> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('help_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching help categories:', error);
        return [];
      }
      
      return data as HelpCategory[];
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      return [];
    }
  }
  
  /**
   * Get a help topic by ID
   */
  static async getTopicById(topicId: string): Promise<HelpTopic | null> {
    try {
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from('help_topics')
        .select('*')
        .eq('id', topicId)
        .single();
      
      if (error) {
        console.error('Error fetching help topic:', error);
        return null;
      }
      
      return data as HelpTopic;
    } catch (error) {
      console.error('Error in getTopicById:', error);
      return null;
    }
  }
  
  /**
   * Search help topics
   */
  static async searchTopics(request: SearchHelpRequest): Promise<HelpSearchResult[]> {
    try {
      // In a real implementation, this would call an API with full-text search
      // For now, we'll simulate a search with local data
      
      const response = await fetch('/api/help/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error('Failed to search help topics');
      }
      
      const data = await response.json();
      return data.results as HelpSearchResult[];
    } catch (error) {
      console.error('Error in searchTopics:', error);
      return [];
    }
  }
  
  /**
   * Get contextual help based on current context
   */
  static async getContextualHelp(request: GetContextualHelpRequest): Promise<HelpTopic[]> {
    try {
      // In a real implementation, this would call an API to get contextual help
      // For now, we'll simulate with local data
      
      const response = await fetch('/api/help/contextual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error('Failed to get contextual help');
      }
      
      const data = await response.json();
      return data.topics as HelpTopic[];
    } catch (error) {
      console.error('Error in getContextualHelp:', error);
      return [];
    }
  }
  
  /**
   * Get help tooltips for a page
   */
  static async getTooltips(request: GetHelpTooltipsRequest): Promise<HelpTooltip[]> {
    try {
      // In a real implementation, this would call an API to get tooltips
      // For now, we'll simulate with local data
      
      const response = await fetch('/api/help/tooltips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });
      
      if (!response.ok) {
        throw new Error('Failed to get help tooltips');
      }
      
      const data = await response.json();
      return data.tooltips as HelpTooltip[];
    } catch (error) {
      console.error('Error in getTooltips:', error);
      return [];
    }
  }
  
  /**
   * Get help tour for a page
   */
  static async getTour(pageId: string, role?: string): Promise<HelpTour | null> {
    try {
      // In a real implementation, this would call an API to get a tour
      // For now, we'll simulate with local data
      
      const response = await fetch(`/api/help/tours/${pageId}?role=${role || ''}`);
      
      if (!response.ok) {
        throw new Error('Failed to get help tour');
      }
      
      const data = await response.json();
      return data.tour as HelpTour;
    } catch (error) {
      console.error('Error in getTour:', error);
      return null;
    }
  }
  
  /**
   * Mark a help topic as viewed
   */
  static async markTopicViewed(topicId: string): Promise<boolean> {
    try {
      // In a real implementation, this would update user preferences
      // For now, we'll just return success
      return true;
    } catch (error) {
      console.error('Error in markTopicViewed:', error);
      return false;
    }
  }
  
  /**
   * Mark a tour as completed
   */
  static async markTourCompleted(tourId: string): Promise<boolean> {
    try {
      // In a real implementation, this would update user preferences
      // For now, we'll just return success
      return true;
    } catch (error) {
      console.error('Error in markTourCompleted:', error);
      return false;
    }
  }
}