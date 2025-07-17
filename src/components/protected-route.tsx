"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserRole } from "@/lib/supabase"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
  redirectTo?: string
  loadingComponent?: React.ReactNode
}

export function ProtectedRoute({
  children,
  allowedRoles = [],
  redirectTo = "/auth/login",
  loadingComponent,
}: ProtectedRouteProps) {
  const router = useRouter()
  const { user, profile, loading, hasPermission } = useAuth()
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    if (loading) return // Wait for auth context to initialize

    const checkAuth = async () => {
      // If no user is logged in, redirect to login
      if (!user || !profile) {
        router.push(redirectTo)
        return
      }
      
      // If roles are specified, check permissions
      if (allowedRoles.length > 0 && !hasPermission(allowedRoles)) {
        // Redirect to user's dashboard if they don't have permission
        router.push(`/dashboard/${profile.role}`)
        return
      }
      
      setIsChecking(false)
    }
    
    checkAuth()
  }, [user, profile, loading, router, allowedRoles, hasPermission, redirectTo])
  
  // Show loading state while checking auth
  if (loading || isChecking) {
    return loadingComponent || (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    )
  }
  
  return <>{children}</>
}