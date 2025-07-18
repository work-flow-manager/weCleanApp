import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { SearchHelpRequest, HelpSearchResult } from '@/types/help';

/**
 * POST /api/help/search
 * Search help topics
 */
export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body: SearchHelpRequest = await request.json();
    
    // Validate required fields
    if (!body.query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }
    
    // Get user profile to get the role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('auth_id', user.id)
      .single();
    
    if (!profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }
    
    // In a real implementation, this would use a full-text search
    // For now, we'll simulate a search with mock data
    
    // Get all help topics
    const { data: topics, error } = await supabase
      .from('help_topics')
      .select('*');
    
    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch help topics' },
        { status: 500 }
      );
    }
    
    // Filter topics by query and role
    const query = body.query.toLowerCase();
    const role = profile.role;
    
    const filteredTopics = topics.filter((topic: any) => {
      // Check if topic is relevant to the user's role
      if (topic.roles && !topic.roles.includes(role)) {
        return false;
      }
      
      // Check if topic matches the query
      return (
        topic.title.toLowerCase().includes(query) ||
        topic.content.toLowerCase().includes(query) ||
        topic.tags.some((tag: string) => tag.toLowerCase().includes(query))
      );
    });
    
    // Calculate relevance score
    const results: HelpSearchResult[] = filteredTopics.map((topic: any) => {
      let relevance = 0;
      
      // Title match is most important
      if (topic.title.toLowerCase().includes(query)) {
        relevance += 10;
      }
      
      // Content match
      if (topic.content.toLowerCase().includes(query)) {
        relevance += 5;
      }
      
      // Tag match
      if (topic.tags.some((tag: string) => tag.toLowerCase().includes(query))) {
        relevance += 3;
      }
      
      // Context match
      if (body.context && topic.contexts && topic.contexts.includes(body.context.page)) {
        relevance += 2;
      }
      
      return {
        topic,
        relevance
      };
    });
    
    // Sort by relevance
    results.sort((a, b) => b.relevance - a.relevance);
    
    // Limit results
    const limit = body.limit || 10;
    const limitedResults = results.slice(0, limit);
    
    return NextResponse.json({
      results: limitedResults,
      totalResults: results.length
    });
  } catch (error) {
    console.error('Error in POST /api/help/search:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}