"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Download, 
  Loader2, 
  MapPin, 
  PieChart, 
  Plus, 
  Star, 
  Users, 
  XCircle 
} from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";

// Mock data for the dashboard
const recentJobs = [
  { 
    id: "job-1", 
    title: "Office Cleaning - Downtown", 
    customer: "Acme Corp", 
    status: "completed", 
    date: "Today, 2:30 PM",
    team: ["Jane D.", "Mike S."],
    rating: 5
  },
  { 
    id: "job-2", 
    title: "Residential Deep Clean", 
    customer: "John Smith", 
    status: "in-progress", 
    date: "Today, 3:45 PM",
    team: ["Sarah L.", "Tom B."],
    rating: null
  },
  { 
    id: "job-3", 
    title: "Restaurant Cleaning", 
    customer: "Tasty Bites", 
    status: "scheduled", 
    date: "Tomorrow, 8:00 AM",
    team: ["David R.", "Lisa M."],
    rating: null
  },
  { 
    id: "job-4", 
    title: "Post-Construction Cleanup", 
    customer: "BuildRight Construction", 
    status: "scheduled", 
    date: "Tomorrow, 1:00 PM",
    team: ["Robert J.", "Emma T."],
    rating: null
  },
];

const teamMembers = [
  { 
    id: "team-1", 
    name: "Jane Doe", 
    role: "Team Lead", 
    avatar: "", 
    status: "active",
    jobsCompleted: 128,
    rating: 4.9
  },
  { 
    id: "team-2", 
    name: "Mike Smith", 
    role: "Cleaner", 
    avatar: "", 
    status: "active",
    jobsCompleted: 95,
    rating: 4.7
  },
  { 
    id: "team-3", 
    name: "Sarah Lee", 
    role: "Cleaner", 
    avatar: "", 
    status: "on-job",
    jobsCompleted: 87,
    rating: 4.8
  },
  { 
    id: "team-4", 
    name: "Tom Brown", 
    role: "Cleaner", 
    avatar: "", 
    status: "on-job",
    jobsCompleted: 62,
    rating: 4.6
  },
];

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || "Admin"}! Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => router.push("/jobs/new")}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> New Job
          </Button>
          <Button variant="outline" className="border-pink-200">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$24,685</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+15.2%</span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
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
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+12%</span>
              <span className="text-xs text-muted-foreground ml-1">from last week</span>
            </div>
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
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+3</span>
              <span className="text-xs text-muted-foreground ml-1">new this month</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Satisfaction
            </CardTitle>
            <Star className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.8/5</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+0.2</span>
              <span className="text-xs text-muted-foreground ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
            {/* Recent Jobs */}
            <Card className="md:col-span-4 backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Recent Jobs</CardTitle>
                <CardDescription>
                  Overview of the latest cleaning jobs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentJobs.map((job) => (
                    <div key={job.id} className="flex items-center justify-between border-b border-pink-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className={`w-2 h-2 mt-2 rounded-full ${
                          job.status === "completed" ? "bg-green-500" : 
                          job.status === "in-progress" ? "bg-blue-500" : 
                          "bg-amber-500"
                        }`} />
                        <div>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-muted-foreground">{job.customer}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{job.date}</span>
                            {job.rating && (
                              <div className="flex items-center">
                                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                <span className="text-xs ml-1">{job.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={
                          job.status === "completed" ? "bg-green-500" : 
                          job.status === "in-progress" ? "bg-blue-500" : 
                          "bg-amber-500"
                        }>
                          {job.status === "completed" ? "Completed" : 
                           job.status === "in-progress" ? "In Progress" : 
                           "Scheduled"}
                        </Badge>
                        <div className="flex -space-x-2">
                          {job.team.map((member, i) => (
                            <Avatar key={i} className="border-2 border-white h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {member.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push("/jobs")}
                >
                  View All Jobs
                </Button>
              </CardFooter>
            </Card>
            
            {/* Performance Overview */}
            <Card className="md:col-span-3 backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Business Performance</CardTitle>
                <CardDescription>
                  Key metrics for this month
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Job Completion Rate</div>
                    <div className="text-sm font-medium">95%</div>
                  </div>
                  <Progress value={95} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">On-Time Arrival</div>
                    <div className="text-sm font-medium">92%</div>
                  </div>
                  <Progress value={92} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Customer Retention</div>
                    <div className="text-sm font-medium">88%</div>
                  </div>
                  <Progress value={88} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Team Utilization</div>
                    <div className="text-sm font-medium">78%</div>
                  </div>
                  <Progress value={78} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                  onClick={() => setActiveTab("analytics")}
                >
                  View Detailed Analytics
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center justify-center gap-2 py-4 border-pink-200 hover:bg-pink-50"
                  onClick={() => router.push("/jobs/new")}
                >
                  <Calendar className="h-5 w-5 text-pink-500" />
                  <span>Create Job</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center justify-center gap-2 py-4 border-pink-200 hover:bg-pink-50"
                  onClick={() => router.push("/team")}
                >
                  <Users className="h-5 w-5 text-pink-500" />
                  <span>Manage Team</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center justify-center gap-2 py-4 border-pink-200 hover:bg-pink-50"
                  onClick={() => router.push("/map")}
                >
                  <MapPin className="h-5 w-5 text-pink-500" />
                  <span>View Map</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center justify-center gap-2 py-4 border-pink-200 hover:bg-pink-50"
                  onClick={() => router.push("/analytics")}
                >
                  <BarChart3 className="h-5 w-5 text-pink-500" />
                  <span>Analytics</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Manage your cleaning team members
                </CardDescription>
              </div>
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => router.push("/team/new")}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Team Member
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between border-b border-pink-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-pink-100 text-pink-500">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex flex-col items-end">
                        <div className="text-sm font-medium">{member.jobsCompleted} jobs</div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                          <span className="text-xs ml-1">{member.rating}</span>
                        </div>
                      </div>
                      <Badge className={
                        member.status === "active" ? "bg-green-500" : 
                        member.status === "on-job" ? "bg-blue-500" : 
                        "bg-gray-500"
                      }>
                        {member.status === "active" ? "Available" : 
                         member.status === "on-job" ? "On Job" : 
                         "Unavailable"}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                        onClick={() => router.push(`/team/${member.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                onClick={() => router.push("/team")}
              >
                Manage All Team Members
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>
                  Overall team metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Average Rating</div>
                    <div className="text-sm font-medium">4.7/5</div>
                  </div>
                  <Progress value={94} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">On-Time Arrival</div>
                    <div className="text-sm font-medium">92%</div>
                  </div>
                  <Progress value={92} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Job Completion Rate</div>
                    <div className="text-sm font-medium">98%</div>
                  </div>
                  <Progress value={98} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Team Availability</CardTitle>
                <CardDescription>
                  Current team status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm font-medium">Available</span>
                    </div>
                    <span className="text-sm font-medium">18 members</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">On Job</span>
                    </div>
                    <span className="text-sm font-medium">24 members</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-sm font-medium">Off Duty</span>
                    </div>
                    <span className="text-sm font-medium">3 members</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex items-center justify-between font-medium">
                    <span>Total Team Size</span>
                    <span>45 members</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monthly revenue breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="h-16 w-16 mx-auto mb-4 text-pink-200" />
                  <p>Revenue chart visualization would appear here</p>
                  <p className="text-sm">Monthly trend showing $24,685 total</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Job Distribution</CardTitle>
                <CardDescription>
                  Jobs by type and location
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <PieChart className="h-16 w-16 mx-auto mb-4 text-pink-200" />
                  <p>Job distribution chart would appear here</p>
                  <p className="text-sm">Showing breakdown by service type</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
              <CardDescription>
                Business metrics for the current month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Customer Metrics</h3>
                  <Separator className="bg-pink-100" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">New Customers</span>
                      <span className="text-sm font-medium">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Repeat Customers</span>
                      <span className="text-sm font-medium">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Customer Rating</span>
                      <span className="text-sm font-medium">4.8/5</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Job Metrics</h3>
                  <Separator className="bg-pink-100" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Jobs Completed</span>
                      <span className="text-sm font-medium">142</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">On-Time Completion</span>
                      <span className="text-sm font-medium">95%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Avg. Job Value</span>
                      <span className="text-sm font-medium">$175</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Financial Metrics</h3>
                  <Separator className="bg-pink-100" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Revenue</span>
                      <span className="text-sm font-medium">$24,685</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Profit Margin</span>
                      <span className="text-sm font-medium">32%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Operational Costs</span>
                      <span className="text-sm font-medium">$16,785</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                onClick={() => router.push("/analytics")}
              >
                View Detailed Reports
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}