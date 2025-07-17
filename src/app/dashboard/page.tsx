"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const { profile, loading, isAuthenticated } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Check for demo user in localStorage
    const demoUserLoggedIn = localStorage.getItem('demoUserLoggedIn');
    const demoUserRole = localStorage.getItem('demoUserRole');
    
    if (demoUserLoggedIn === 'true' && demoUserRole) {
      setIsRedirecting(true);
      router.push(`/dashboard/${demoUserRole}`);
      return;
    }
    
    // If not a demo user, check for authenticated user
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // If authenticated, redirect to role-specific dashboard
    if (!loading && isAuthenticated && profile?.role) {
      setIsRedirecting(true);
      router.push(`/dashboard/${profile.role}`);
    }
  }, [loading, isAuthenticated, profile, router]);

  if (loading || isRedirecting) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900">Loading your dashboard...</h3>
        <p className="text-gray-500 mt-2">Please wait while we prepare your experience.</p>
      </div>
    );
  }

  // This should not be visible as we should redirect
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold">Welcome to We-Clean Dashboard</h1>
      <p className="mt-4">Redirecting to your personalized dashboard...</p>
    </div>
  );
}