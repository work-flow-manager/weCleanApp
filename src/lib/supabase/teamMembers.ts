import { supabase } from './client';

export async function getTeamMembers() {
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

    return data.map(member => ({
      id: member.id,
      name: member.profiles?.full_name || 'Unknown',
      avatar: member.profiles?.avatar_url
    }));
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
}