"use client";

import React, { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Calendar, MapPin, BarChart3 } from "lucide-react";

export default function RoleDashboard() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const role = params.role as string;

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    } else if (!loading && profile && profile.role !== role) {
      router.push(`/dashboard/${profile.role}`);
    }
  }, [user, profile, loading, role, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
          <span className="text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  const getDashboardContent = () => {
    switch (role) {
      case "admin":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Users
                  </CardTitle>
                  <Users className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,234</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Jobs
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last week
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Team Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45</div>
                  <p className="text-xs text-muted-foreground">
                    +3 new this month
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$12,345</div>
                  <p className="text-xs text-muted-foreground">
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Admin Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Welcome to your admin dashboard. Here you can manage all
                  aspects of your cleaning business.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                    Manage Users
                  </Button>
                  <Button
                    variant="outline"
                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    View Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "manager":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Today's Jobs
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">3 in progress</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Team Available
                  </CardTitle>
                  <Users className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    out of 12 total
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completion Rate
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">94%</div>
                  <p className="text-xs text-muted-foreground">This week</p>
                </CardContent>
              </Card>
            </div>
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Manager Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Manage your team and coordinate cleaning jobs efficiently.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                    Create New Job
                  </Button>
                  <Button
                    variant="outline"
                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    Assign Team
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "team":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    My Jobs Today
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">1 completed</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Current Location
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">Downtown Office</div>
                  <p className="text-xs text-muted-foreground">
                    Next: Residential Area
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Performance
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">4.8</div>
                  <p className="text-xs text-muted-foreground">
                    Average rating
                  </p>
                </CardContent>
              </Card>
            </div>
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Team Member Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  View your assigned jobs and update job status in real-time.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="bg-pink-500 hover:bg-pink-600 text-white">
                    Check In
                  </Button>
                  <Button
                    variant="outline"
                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    Upload Photos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case "customer":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Upcoming Cleanings
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    Next: Tomorrow 2PM
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Cleaner Status
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-sm font-bold">On the way</div>
                  <p className="text-xs text-muted-foreground">
                    ETA: 15 minutes
                  </p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Last Service
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-pink-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5★</div>
                  <p className="text-xs text-muted-foreground">3 days ago</p>
                </CardContent>
              </Card>
            </div>
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Customer Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Schedule cleanings, track your cleaner, and manage your
                  service history.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    className="bg-pink-500 hover:bg-pink-600 text-white"
                    onClick={() => router.push("/schedule")}
                  >
                    Schedule Cleaning
                  </Button>
                  <Button
                    variant="outline"
                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    Track Cleaner
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return <div>Invalid role</div>;
    }
  };

  return (
    <DashboardLayout
      userRole={profile.role}
      userName={profile.full_name}
      userAvatar={profile.avatar_url}
    >
      {getDashboardContent()}
    </DashboardLayout>
  );
}
