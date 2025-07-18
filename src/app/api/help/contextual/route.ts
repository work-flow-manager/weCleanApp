import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { GetContextualHelpRequest, HelpTopic } from '@/types/help';

/**
 * POST /api/help/contextual
 * Get contextual help based on current context
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
    const body: GetContextualHelpRequest = await request.json();
    
    // Validate required fields
    if (!body.context || !body.context.page) {
      return NextResponse.json(
        { error: 'Context with page is required' },
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
    
    // In a real implementation, this would query a database of help topics
    // For now, we'll simulate with mock data
    
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
    
    // Filter topics by context and role
    const { page, section, action } = body.context;
    const role = profile.role;
    
    const filteredTopics = topics.filter((topic: any) => {
      // Check if topic is relevant to the user's role
      if (topic.roles && !topic.roles.includes(role)) {
        return false;
      }
      
      // Check if topic matches the context
      if (!topic.contexts) return false;
      
      const contexts = topic.contexts;
      
      // Check page match
      if (!contexts.some((ctx: any) => ctx.page === page)) {
        return false;
      }
      
      // Check section match if provided
      if (section && !contexts.some((ctx: any) => ctx.section === section)) {
        return false;
      }
      
      // Check action match if provided
      if (action && !contexts.some((ctx: any) => ctx.action === action)) {
        return false;
      }
      
      return true;
    });
    
    // Sort by relevance (more specific matches first)
    filteredTopics.sort((a: any, b: any) => {
      const aContexts = a.contexts || [];
      const bContexts = b.contexts || [];
      
      // Count matching context properties
      const aMatches = aContexts.reduce((count: number, ctx: any) => {
        let matches = 0;
        if (ctx.page === page) matches++;
        if (section && ctx.section === section) matches++;
        if (action && ctx.action === action) matches++;
        return count + matches;
      }, 0);
      
      const bMatches = bContexts.reduce((count: number, ctx: any) => {
        let matches = 0;
        if (ctx.page === page) matches++;
        if (section && ctx.section === section) matches++;
        if (action && ctx.action === action) matches++;
        return count + matches;
      }, 0);
      
      return bMatches - aMatches;
    });
    
    // Limit results
    const limit = body.limit || 5;
    const limitedTopics = filteredTopics.slice(0, limit);
    
    return NextResponse.json({
      topics: limitedTopics
    });
  } catch (error) {
    console.error('Error in POST /api/help/contextual:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}