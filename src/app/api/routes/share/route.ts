import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { RouteResult } from '@/lib/services/routeOptimization';

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Only admin and managers can share routes
    if (!['admin', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Only admins and managers can share routes' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { route, teamMemberIds, name, description } = body;

    // Validate required fields
    if (!route || !teamMemberIds || !Array.isArray(teamMemberIds) || teamMemberIds.length === 0) {
      return NextResponse.json(
        { error: 'Route and teamMemberIds are required' },
        { status: 400 }
      );
    }

    // Validate route object
    if (!route.points || !Array.isArray(route.points) || route.points.length === 0) {
      return NextResponse.json(
        { error: 'Route must have points array' },
        { status: 400 }
      );
    }

    // Create shared route record
    const { data: sharedRoute, error: sharedRouteError } = await supabase
      .from('shared_routes')
      .insert({
        name: name || `Route ${new Date().toLocaleDateString()}`,
        description: description || '',
        route_data: route,
        created_by: session.user.id,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sharedRouteError) {
      console.error('Error creating shared route:', sharedRouteError);
      return NextResponse.json(
        { error: 'Failed to create shared route' },
        { status: 500 }
      );
    }

    // Share route with team members
    const teamMemberShares = teamMemberIds.map(teamMemberId => ({
      route_id: sharedRoute.id,
      team_member_id: teamMemberId,
      shared_at: new Date().toISOString()
    }));

    const { error: shareError } = await supabase
      .from('route_shares')
      .insert(teamMemberShares);

    if (shareError) {
      console.error('Error sharing route with team members:', shareError);
      return NextResponse.json(
        { error: 'Failed to share route with team members' },
        { status: 500 }
      );
    }

    // Create notifications for team members
    const notifications = teamMemberIds.map(teamMemberId => ({
      user_id: teamMemberId,
      type: 'route_shared',
      title: 'New Route Assigned',
      message: `A new route "${sharedRoute.name}" has been shared with you.`,
      is_read: false,
      related_id: sharedRoute.id,
      created_at: new Date().toISOString()
    }));

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error('Error creating notifications:', notificationError);
      // Continue despite notification error
    }

    return NextResponse.json({
      success: true,
      sharedRoute: {
        id: sharedRoute.id,
        name: sharedRoute.name,
        description: sharedRoute.description,
        sharedWith: teamMemberIds.length
      }
    });
  } catch (error) {
    console.error('Error in route sharing:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const routeId = url.searchParams.get('routeId');

    if (routeId) {
      // Get specific route
      let query = supabase
        .from('shared_routes')
        .select(`
          id,
          name,
          description,
          route_data,
          created_by,
          created_at,
          profiles (id, full_name, avatar_url)
        `)
        .eq('id', routeId);

      // If not admin or manager, check if route is shared with user
      if (!['admin', 'manager'].includes(profile.role)) {
        query = query.or(`created_by.eq.${session.user.id},route_shares.team_member_id.eq.${session.user.id}`);
      }

      const { data: route, error: routeError } = await query.single();

      if (routeError) {
        console.error('Error getting route:', routeError);
        return NextResponse.json(
          { error: 'Route not found or access denied' },
          { status: 404 }
        );
      }

      // Get team members the route is shared with
      const { data: shares, error: sharesError } = await supabase
        .from('route_shares')
        .select(`
          team_member_id,
          shared_at,
          team_members (
            id,
            profiles (id, full_name, avatar_url)
          )
        `)
        .eq('route_id', routeId);

      if (sharesError) {
        console.error('Error getting route shares:', sharesError);
        // Continue despite shares error
      }

      return NextResponse.json({
        route: {
          ...route,
          sharedWith: shares || []
        }
      });
    } else {
      // Get all routes
      let query = supabase
        .from('shared_routes')
        .select(`
          id,
          name,
          description,
          created_by,
          created_at,
          profiles (id, full_name, avatar_url)
        `);

      // If not admin or manager, only get routes shared with user
      if (!['admin', 'manager'].includes(profile.role)) {
        // Get team member ID for the current user
        const { data: teamMember, error: teamMemberError } = await supabase
          .from('team_members')
          .select('id')
          .eq('profile_id', session.user.id)
          .single();

        if (teamMemberError) {
          console.error('Error getting team member:', teamMemberError);
          return NextResponse.json(
            { error: 'Team member not found' },
            { status: 404 }
          );
        }

        // Get routes shared with this team member
        const { data: sharedRouteIds, error: sharedRouteIdsError } = await supabase
          .from('route_shares')
          .select('route_id')
          .eq('team_member_id', teamMember.id);

        if (sharedRouteIdsError) {
          console.error('Error getting shared route IDs:', sharedRouteIdsError);
          return NextResponse.json(
            { error: 'Failed to get shared routes' },
            { status: 500 }
          );
        }

        const routeIds = sharedRouteIds.map(share => share.route_id);
        
        if (routeIds.length > 0) {
          query = query.in('id', routeIds);
        } else {
          // No routes shared with this user
          return NextResponse.json({ routes: [] });
        }
      }

      // Order by creation date
      query = query.order('created_at', { ascending: false });

      const { data: routes, error: routesError } = await query;

      if (routesError) {
        console.error('Error getting routes:', routesError);
        return NextResponse.json(
          { error: 'Failed to get routes' },
          { status: 500 }
        );
      }

      return NextResponse.json({ routes: routes || [] });
    }
  } catch (error) {
    console.error('Error in route retrieval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}