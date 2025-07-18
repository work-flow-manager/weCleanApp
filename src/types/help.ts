// Help-related types and interfaces

export interface HelpTopic {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  relatedTopics?: string[];
  lastUpdated?: string;
}

export interface HelpCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  topics: string[];
}

export interface HelpContext {
  page: string;
  section?: string;
  role?: string;
  action?: string;
}

export interface HelpSearchResult {
  topic: HelpTopic;
  relevance: number;
}

export interface HelpTooltip {
  id: string;
  targetElement: string;
  content: string;
  title?: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  showOnce?: boolean;
  showDelay?: number;
  dismissable?: boolean;
}

export interface HelpTourStep {
  id: string;
  targetElement: string;
  title: string;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
  showSkip?: boolean;
  showNext?: boolean;
  showPrev?: boolean;
}

export interface HelpTour {
  id: string;
  title: string;
  description?: string;
  steps: HelpTourStep[];
  showOnFirstVisit?: boolean;
  role?: string[];
}

// API Request/Response types
export interface SearchHelpRequest {
  query: string;
  context?: HelpContext;
  limit?: number;
}

export interface GetContextualHelpRequest {
  context: HelpContext;
  limit?: number;
}

export interface HelpSearchResponse {
  results: HelpSearchResult[];
  totalResults: number;
}

export interface GetHelpTooltipsRequest {
  page: string;
  section?: string;
  role?: string;
}

export interface GetHelpTooltipsResponse {
  tooltips: HelpTooltip[];
}