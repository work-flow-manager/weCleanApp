"use client";

import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/supabase";

/**
 * Hook for conditionally rendering UI elements based on user roles
 */
export function useRoleBasedUI() {
  const { profile, hasPermission } = useAuth();
  
  /**
   * Check if the current user has any of the specified roles
   */
  const canAccess = (roles: UserRole[]): boolean => {
    return hasPermission(roles);
  };
  
  /**
   * Conditionally render content based on user roles
   */
  const renderIfRole = <T>(roles: UserRole[], content: T, fallback: T = null as unknown as T): T => {
    return canAccess(roles) ? content : fallback;
  };
  
  /**
   * Get role-specific content from a map
   */
  const getRoleContent = <T>(contentMap: Partial<Record<UserRole, T>>, defaultContent: T): T => {
    if (!profile) return defaultContent;
    return contentMap[profile.role] || defaultContent;
  };
  
  return {
    currentRole: profile?.role || null,
    canAccess,
    renderIfRole,
    getRoleContent,
    isAdmin: profile?.role === "admin",
    isManager: profile?.role === "manager",
    isTeam: profile?.role === "team",
    isCustomer: profile?.role === "customer",
  };
}