"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Users, Calendar, DollarSign, BarChart2, MapPin } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { profile, loading, isAuthenticated, hasPermission } = useAuth();
  const [isDemoUser, setIsDemoUser] = useState(false);

  useEffect(() => {
    // Check for demo user in localStorage
    const demoUserLoggedIn = localStorage.getItem('demoUserLoggedIn');
    const demoUserRole = localStorage.getItem('demoUserRole');
    
    if (demoUserLoggedIn === 'true' && demoUserRole === 'admin') {
      setIsDemoUser(true);
      return;
    }
    
    // If not a demo user, check for authenticated user with admin role
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    
    // Check if user has admin permission
    if (!loading && isAuthenticated && !hasPermission(['admin'])) {
      router.push('/dashboard');
    }
  }, [loading, isAuthenticated, hasPermission, router]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-pink-500 mb-4" />
        <h3 className="text-xl font-medium text-gray-900">Loading admin dashboard...</h3>
        <p className="text-gray-500 mt-2">Please wait while we prepare your experience.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Welcome back, {isDemoUser ? "Demo Admin" : profile?.full_name || "Admin"}
          </p>
        </div>
        <div>
          <Button className="bg-pink-500 hover:bg-pink-600 text-white">
            + New Job
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            title: "Total Jobs",
            value: "24",
            change: "+5%",
            icon: <Calendar className="h-5 w-5 text-pink-500" />,
          },
          {
            title: "Team Members",
            value: "8",
            change: "+2",
            icon: <Users className="h-5 w-5 text-blue-500" />,
          },
          {
            title: "Revenue",
            value: "$12,450",
            change: "+12%",
            icon: <DollarSign className="h-5 w-5 text-green-500" />,
          },
          {
            title: "Locations",
            value: "6",
            change: "+1",
            icon: <MapPin className="h-5 w-5 text-amber-500" />,
          },
        ].map((stat, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm border border-pink-200/30">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  <p className="text-xs text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className="p-2 rounded-full bg-gray-100">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border border-pink-200/30">
          <CardHeader className="pb-2">
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  title: "Office Deep Clean",
                  customer: "ABC Corp",
                  date: "Today, 2:00 PM",
                  status: "in-progress",
                },
                {
                  title: "Regular House Cleaning",
                  customer: "John Smith",
                  date: "Today, 9:00 AM",
                  status: "completed",
                },
                {
                  title: "Post-Construction Cleanup",
                  customer: "XYZ Builders",
                  date: "Tomorrow, 10:00 AM",
                  status: "scheduled",
                },
                {
                  title: "Apartment Move-Out Clean",
                  customer: "Sarah Johnson",
                  date: "Jun 17, 11:00 AM",
                  status: "scheduled",
                },
              ].map((job, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <h3 className="font-medium">{job.title}</h3>
                    <p className="text-sm text-gray-500">{job.customer} • {job.date}</p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        job.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : job.status === "in-progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {job.status === "completed"
                        ? "Completed"
                        : job.status === "in-progress"
                        ? "In Progress"
                        : "Scheduled"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/dashboard/jobs"
                className="text-sm text-pink-500 hover:text-pink-600 font-medium"
              >
                View all jobs
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border border-pink-200/30">
          <CardHeader className="pb-2">
            <CardTitle>Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <BarChart2 className="h-24 w-24 text-gray-300" />
            </div>
            <div className="text-center text-sm text-gray-500">
              Analytics data will appear here
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}