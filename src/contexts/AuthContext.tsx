"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase,
  UserProfile,
  UserRole,
  createCustomerProfile,
  getUserProfile,
} from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  userRole: UserRole | null;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile | null>;
  hasPermission: (allowedRoles: UserRole[]) => boolean;
  refreshProfile: () => Promise<UserProfile | null>;
  redirectToDashboard: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);

      if (session?.user) {
        // Get user profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        } else {
          // Create profile if it doesn't exist
          const newProfile = {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name || "",
            role: (session.user.user_metadata?.role as UserRole) || "customer",
            avatar_url: session.user.user_metadata?.avatar_url,
          };

          const { data: createdProfile } = await supabase
            .from("profiles")
            .insert([newProfile])
            .select()
            .single();

          if (createdProfile) {
            setProfile(createdProfile);
          }
        }
      }

      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        setProfile(profileData);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, rememberMe?: boolean) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        // Set session expiry based on remember me option
        expiresIn: rememberMe ? 30 * 24 * 60 * 60 : 8 * 60 * 60, // 30 days or 8 hours
      }
    });

    if (error) throw error;
  };

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    role: UserRole = "customer",
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: "customer", // Always create as customer
        },
      },
    });

    if (error) throw error;

    // If signup successful and user is created, create customer profile
    if (data.user) {
      try {
        await createCustomerProfile(data.user.id, email, fullName);
      } catch (profileError) {
        console.error("Error creating customer profile:", profileError);
        // Don't throw here to avoid breaking the signup flow
      }
    }

    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile | null> => {
    if (!user) throw new Error("User not authenticated");
    
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id)
      .select()
      .single();
    
    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }
    
    setProfile(data);
    return data;
  };
  
  const hasPermission = (allowedRoles: UserRole[]): boolean => {
    if (!profile) return false;
    return allowedRoles.includes(profile.role);
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (!user) return null;
    
    try {
      const profile = await getUserProfile(user.id);
      if (profile) {
        setProfile(profile);
      }
      return profile;
    } catch (error) {
      console.error("Error refreshing profile:", error);
      return null;
    }
  };
  
  const router = useRouter();
  
  const redirectToDashboard = () => {
    if (!profile) return;
    router.push(`/dashboard/${profile.role}`);
  };

  const isAuthenticated = !!user && !!profile;
  const userRole = profile?.role || null;

  const value = {
    user,
    profile,
    loading,
    isAuthenticated,
    userRole,
    signIn,
    signUp,
    signOut,
    updateProfile,
    hasPermission,
    refreshProfile,
    redirectToDashboard,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
