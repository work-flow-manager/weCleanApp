import { supabase } from './client';

// Define proper types for the team member data
interface TeamMemberProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface TeamMember {
  id: string;
  profiles: TeamMemberProfile;
}

interface TeamMemberResponse {
  id: string;
  name: string;
  avatar?: string;
}

export async function getTeamMembers(): Promise<TeamMemberResponse[]> {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        id,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('is_active', true);

    if (error) {
      throw error;
    }

    // Cast data to the correct type
    const typedData = data as unknown as TeamMember[];

    return typedData.map(member => ({
      id: member.id,
      name: member.profiles ? member.profiles.full_name : 'Unknown',
      avatar: member.profiles ? member.profiles.avatar_url || undefined : undefined
    }));
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}