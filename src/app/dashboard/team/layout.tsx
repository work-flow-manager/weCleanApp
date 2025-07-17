import { UnifiedDashboardLayout } from "@/components/layouts/unified-dashboard-layout";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function TeamDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Check if we have a session
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect("/auth/login");
  }
  
  // Get user profile to determine role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  
  const userRole = profile?.role || "customer";
  
  // Only team members can access this layout
  if (userRole !== "team") {
    redirect(`/dashboard/${userRole}`);
  }
  
  return <UnifiedDashboardLayout userRole="team">{children}</UnifiedDashboardLayout>;
}