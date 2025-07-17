"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
}: ProtectedRouteProps) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push("/auth/login")
        return
      }
      
      if (allowedRoles.length > 0) {
        // Get user profile to determine role
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single()
        
        const userRole = profile?.role || "customer"
        
        if (!allowedRoles.includes(userRole)) {
          router.push(`/dashboard/${userRole}`)
        }
      }
    }
    
    checkAuth()
  }, [router, allowedRoles, supabase])
  
  return <>{children}</>
}