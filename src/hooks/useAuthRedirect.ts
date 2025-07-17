"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/supabase";

interface UseAuthRedirectOptions {
  redirectAuthenticated?: string;
  redirectUnauthenticated?: string;
  allowedRoles?: UserRole[];
}

/**
 * Hook for handling authentication-based redirects
 * 
 * @param options Configuration options for redirects
 * @returns Authentication state information
 */
export function useAuthRedirect(options: UseAuthRedirectOptions = {}) {
  const {
    redirectAuthenticated,
    redirectUnauthenticated = "/auth/login",
    allowedRoles = [],
  } = options;

  const { user, profile, loading, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // Handle unauthenticated users
    if (!user || !profile) {
      if (redirectUnauthenticated) {
        router.push(redirectUnauthenticated);
      }
      return;
    }

    // Handle authenticated users
    if (redirectAuthenticated) {
      // Check role permissions if specified
      if (allowedRoles.length > 0) {
        if (hasPermission(allowedRoles)) {
          router.push(redirectAuthenticated);
        } else {
          // Redirect to role-specific dashboard if not allowed
          router.push(`/dashboard/${profile.role}`);
        }
      } else {
        // No role restrictions, just redirect
        router.push(redirectAuthenticated);
      }
    } else if (allowedRoles.length > 0 && !hasPermission(allowedRoles)) {
      // No redirect specified but user doesn't have permission
      router.push(`/dashboard/${profile.role}`);
    }
  }, [
    user,
    profile,
    loading,
    router,
    redirectAuthenticated,
    redirectUnauthenticated,
    allowedRoles,
    hasPermission,
  ]);

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user && !!profile,
    hasPermission,
  };
}