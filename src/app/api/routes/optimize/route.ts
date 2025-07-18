import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { optimizeRoute2Opt, optimizeRouteNearestNeighbor, Location } from '@/lib/services/routeOptimization';

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

    // Only admin, managers, and team members can optimize routes
    if (!['admin', 'manager', 'team'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { 
      locations, 
      startLocationIndex = 0, 
      endLocationIndex = startLocationIndex,
      startTime = new Date().toISOString(),
      algorithm = '2opt',
      averageSpeed = 30
    } = body;

    // Validate required fields
    if (!locations || !Array.isArray(locations) || locations.length === 0) {
      return NextResponse.json(
        { error: 'Locations array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Validate location objects
    for (const location of locations) {
      if (!location.id || !location.name || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
        return NextResponse.json(
          { error: 'Each location must have id, name, latitude, and longitude' },
          { status: 400 }
        );
      }
    }

    // Validate indices
    if (startLocationIndex < 0 || startLocationIndex >= locations.length) {
      return NextResponse.json(
        { error: 'Invalid startLocationIndex' },
        { status: 400 }
      );
    }

    if (endLocationIndex < 0 || endLocationIndex >= locations.length) {
      return NextResponse.json(
        { error: 'Invalid endLocationIndex' },
        { status: 400 }
      );
    }

    // Optimize route
    let result;
    if (algorithm === '2opt') {
      result = optimizeRoute2Opt(
        locations as Location[],
        startLocationIndex,
        endLocationIndex,
        startTime,
        averageSpeed
      );
    } else {
      result = optimizeRouteNearestNeighbor(
        locations as Location[],
        startLocationIndex,
        endLocationIndex,
        startTime,
        averageSpeed
      );
    }

    return NextResponse.json({
      success: true,
      route: result
    });
  } catch (error) {
    console.error('Error in route optimization:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}