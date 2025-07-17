import { UnifiedDashboardLayout } from "@/components/layouts/unified-dashboard-layout"
import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function Layout({ children }: { children: React.ReactNode }) {
  // Check for demo user in cookies (transferred from localStorage via middleware)
  const cookieStore = cookies()
  const demoUserRole = cookieStore.get('demoUserRole')?.value
  
  if (demoUserRole) {
    return <UnifiedDashboardLayout userRole={demoUserRole as any}>{children}</UnifiedDashboardLayout>
  }
  
  // Regular Supabase auth flow
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
  
  return <UnifiedDashboardLayout userRole={userRole}>{children}</UnifiedDashboardLayout>
}