import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';

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

    // Get user's privacy settings
    const { data, error } = await supabase
      .from('profiles')
      .select('location_tracking_enabled, location_share_accuracy, location_track_only_during_shift')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error getting privacy settings:', error);
      return NextResponse.json(
        { error: 'Failed to get privacy settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      settings: {
        trackingEnabled: data.location_tracking_enabled ?? false,
        shareAccuracy: data.location_share_accuracy ?? true,
        trackOnlyDuringShift: data.location_track_only_during_shift ?? true
      }
    });
  } catch (error) {
    console.error('Error in privacy settings retrieval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    // Parse request body
    const body = await request.json();
    const { trackingEnabled, shareAccuracy, trackOnlyDuringShift } = body;

    // Validate required fields
    if (typeof trackingEnabled !== 'boolean' || 
        typeof shareAccuracy !== 'boolean' || 
        typeof trackOnlyDuringShift !== 'boolean') {
      return NextResponse.json(
        { error: 'All settings must be boolean values' },
        { status: 400 }
      );
    }

    // Update privacy settings
    const { data, error } = await supabase
      .from('profiles')
      .update({
        location_tracking_enabled: trackingEnabled,
        location_share_accuracy: shareAccuracy,
        location_track_only_during_shift: trackOnlyDuringShift
      })
      .eq('id', session.user.id)
      .select();

    if (error) {
      console.error('Error updating privacy settings:', error);
      return NextResponse.json(
        { error: 'Failed to update privacy settings' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true,
      settings: {
        trackingEnabled,
        shareAccuracy,
        trackOnlyDuringShift
      }
    });
  } catch (error) {
    console.error('Error in privacy settings update:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}