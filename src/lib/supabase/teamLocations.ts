import { supabase } from './client';

export interface TeamLocationUpdate {
  teamMemberId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: string;
}

/**
 * Updates a team member's location in the database
 */
export async function updateTeamMemberLocation(locationData: TeamLocationUpdate) {
  try {
    const { data, error } = await supabase
      .from('team_locations')
      .insert({
        team_member_id: locationData.teamMemberId,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy,
        timestamp: locationData.timestamp
      });

    if (error) {
      console.error('Error updating team member location:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Failed to update team member location:', error);
    throw error;
  }
}

/**
 * Gets the latest location for a team member
 */
export async function getTeamMemberLocation(teamMemberId: string) {
  try {
    const { data, error } = await supabase
      .from('team_locations')
      .select('*')
      .eq('team_member_id', teamMemberId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error('Error getting team member location:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Failed to get team member location:', error);
    throw error;
  }
}

/**
 * Gets the latest locations for all team members in a business
 */
export async function getTeamLocations(businessId: string) {
  try {
    // First get all team members for this business
    const { data: teamMembers, error: teamError } = await supabase
      .from('team_members')
      .select('id, profile_id')
      .eq('company_id', businessId);

    if (teamError) {
      console.error('Error getting team members:', teamError);
      throw new Error(teamError.message);
    }

    if (!teamMembers || teamMembers.length === 0) {
      return [];
    }

    // Get the latest location for each team member
    const teamMemberIds = teamMembers.map(member => member.id);
    
    // This query gets the most recent location for each team member
    const { data, error } = await supabase
      .rpc('get_latest_team_locations', { team_ids: teamMemberIds });

    if (error) {
      console.error('Error getting team locations:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get team locations:', error);
    throw error;
  }
}

/**
 * Gets location history for a team member within a time range
 */
export async function getTeamMemberLocationHistory(
  teamMemberId: string, 
  startTime: string, 
  endTime: string
) {
  try {
    const { data, error } = await supabase
      .from('team_locations')
      .select('*')
      .eq('team_member_id', teamMemberId)
      .gte('timestamp', startTime)
      .lte('timestamp', endTime)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error getting team member location history:', error);
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error('Failed to get team member location history:', error);
    throw error;
  }
}

/**
 * Deletes location history for a team member
 */
export async function deleteTeamMemberLocationHistory(teamMemberId: string) {
  try {
    const { error } = await supabase
      .from('team_locations')
      .delete()
      .eq('team_member_id', teamMemberId);

    if (error) {
      console.error('Error deleting team member location history:', error);
      throw new Error(error.message);
    }

    return true;
  } catch (error) {
    console.error('Failed to delete team member location history:', error);
    throw error;
  }
}

/**
 * Updates a team member's location privacy settings
 */
export async function updateLocationPrivacySettings(
  profileId: string,
  settings: {
    trackingEnabled: boolean;
    shareAccuracy: boolean;
    trackOnlyDuringShift: boolean;
  }
) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        location_tracking_enabled: settings.trackingEnabled,
        location_share_accuracy: settings.shareAccuracy,
        location_track_only_during_shift: settings.trackOnlyDuringShift
      })
      .eq('id', profileId);

    if (error) {
      console.error('Error updating location privacy settings:', error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error('Failed to update location privacy settings:', error);
    throw error;
  }
}

/**
 * Gets a team member's location privacy settings
 */
export async function getLocationPrivacySettings(profileId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('location_tracking_enabled, location_share_accuracy, location_track_only_during_shift')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error getting location privacy settings:', error);
      throw new Error(error.message);
    }

    return {
      trackingEnabled: data.location_tracking_enabled ?? false,
      shareAccuracy: data.location_share_accuracy ?? true,
      trackOnlyDuringShift: data.location_track_only_during_shift ?? true
    };
  } catch (error) {
    console.error('Failed to get location privacy settings:', error);
    throw error;
  }
}