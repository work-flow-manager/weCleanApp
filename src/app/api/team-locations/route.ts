import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

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

    // Get user profile to check if they are a team member
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Only team members and managers can update locations
    if (!['team', 'manager'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Only team members and managers can update locations' },
        { status: 403 }
      );
    }

    // Get team member record
    const { data: teamMember, error: teamMemberError } = await supabase
      .from('team_members')
      .select('id')
      .eq('profile_id', profile.id)
      .single();

    if (teamMemberError || !teamMember) {
      return NextResponse.json(
        { error: 'Team member record not found' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { latitude, longitude, accuracy } = body;

    // Validate required fields
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Latitude and longitude are required and must be numbers' },
        { status: 400 }
      );
    }

    // Insert location record
    const { data, error } = await supabase
      .from('team_locations')
      .insert({
        team_member_id: teamMember.id,
        latitude,
        longitude,
        accuracy: accuracy || null,
        timestamp: new Date().toISOString()
      })
      .select();

    if (error) {
      console.error('Error inserting location:', error);
      return NextResponse.json(
        { error: 'Failed to update location' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in team location update:', error);
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
      .select('id, role, company_id')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Only admin, managers, and team members can view locations
    if (!['admin', 'manager', 'team'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const teamMemberId = url.searchParams.get('teamMemberId');
    const companyId = url.searchParams.get('companyId') || profile.company_id;

    // If team member ID is provided, get that specific team member's location
    if (teamMemberId) {
      // Check if the team member belongs to the same company
      const { data: teamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .select('id, company_id')
        .eq('id', teamMemberId)
        .single();

      if (teamMemberError || !teamMember) {
        return NextResponse.json(
          { error: 'Team member not found' },
          { status: 404 }
        );
      }

      // Ensure the team member belongs to the same company
      if (teamMember.company_id !== profile.company_id && profile.role !== 'admin') {
        return NextResponse.json(
          { error: 'You can only view team members from your company' },
          { status: 403 }
        );
      }

      // Get the latest location for this team member
      const { data: location, error: locationError } = await supabase
        .from('team_locations')
        .select('*')
        .eq('team_member_id', teamMemberId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();

      if (locationError && locationError.code !== 'PGRST116') {
        console.error('Error getting team member location:', locationError);
        return NextResponse.json(
          { error: 'Failed to get team member location' },
          { status: 500 }
        );
      }

      return NextResponse.json({ location: location || null });
    }
    
    // Otherwise, get all team member locations for the company
    // First get all team members for this company
    const { data: teamMembers, error: teamMembersError } = await supabase
      .from('team_members')
      .select(`
        id,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('company_id', companyId);

    if (teamMembersError) {
      console.error('Error getting team members:', teamMembersError);
      return NextResponse.json(
        { error: 'Failed to get team members' },
        { status: 500 }
      );
    }

    if (!teamMembers || teamMembers.length === 0) {
      return NextResponse.json({ locations: [] });
    }

    // Get the latest location for each team member
    const teamMemberIds = teamMembers.map(member => member.id);
    
    // Use a custom RPC function to get the latest location for each team member
    const { data: locations, error: locationsError } = await supabase
      .rpc('get_latest_team_locations', { team_ids: teamMemberIds });

    if (locationsError) {
      console.error('Error getting team locations:', locationsError);
      return NextResponse.json(
        { error: 'Failed to get team locations' },
        { status: 500 }
      );
    }

    // Combine team member info with their locations
    const teamLocations = teamMembers.map(member => {
      const location = locations?.find(loc => loc.team_member_id === member.id);
      return {
        teamMember: {
          id: member.id,
          name: member.profiles?.full_name || 'Unknown',
          avatar: member.profiles?.avatar_url || null
        },
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp
        } : null
      };
    });

    return NextResponse.json({ locations: teamLocations });
  } catch (error) {
    console.error('Error in team location retrieval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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
      .select('id, role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    const url = new URL(request.url);
    const teamMemberId = url.searchParams.get('teamMemberId');

    // If no team member ID is provided, return error
    if (!teamMemberId) {
      return NextResponse.json(
        { error: 'Team member ID is required' },
        { status: 400 }
      );
    }

    // Check if user is deleting their own data or has admin/manager permissions
    if (profile.role !== 'admin' && profile.role !== 'manager') {
      // Get team member record to check if it belongs to the current user
      const { data: teamMember, error: teamMemberError } = await supabase
        .from('team_members')
        .select('profile_id')
        .eq('id', teamMemberId)
        .single();

      if (teamMemberError || !teamMember) {
        return NextResponse.json(
          { error: 'Team member not found' },
          { status: 404 }
        );
      }

      // Check if the team member belongs to the current user
      if (teamMember.profile_id !== profile.id) {
        return NextResponse.json(
          { error: 'You can only delete your own location data' },
          { status: 403 }
        );
      }
    }

    // Delete location data
    const { error } = await supabase
      .from('team_locations')
      .delete()
      .eq('team_member_id', teamMemberId);

    if (error) {
      console.error('Error deleting location data:', error);
      return NextResponse.json(
        { error: 'Failed to delete location data' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in team location deletion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}