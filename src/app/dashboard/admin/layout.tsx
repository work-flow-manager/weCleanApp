import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  
  // Check if we have a session
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }
  
  // Get user profile to determine role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  // Only allow admin users to access this layout
  if (!profile || profile.role !== 'admin') {
    // Redirect to appropriate dashboard based on role
    if (profile && profile.role) {
      redirect(`/dashboard/${profile.role}`)
    } else {
      redirect('/auth/login')
    }
  }
  
  return <>{children}</>
}