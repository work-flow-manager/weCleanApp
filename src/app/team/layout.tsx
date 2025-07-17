import { DashboardLayout } from "@/components/dashboard-layout"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export default async function Layout({ children }: { children: React.ReactNode }) {
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
  
  const userRole = profile?.role || 'customer'
  
  // Only admin and manager can access team management
  if (!['admin', 'manager'].includes(userRole)) {
    redirect('/dashboard/' + userRole)
  }
  
  return <DashboardLayout userRole={userRole}>{children}</DashboardLayout>
}