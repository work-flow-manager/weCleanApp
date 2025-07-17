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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  MapPin, 
  Plus, 
  Star, 
  Users, 
  AlertTriangle,
  TrendingUp,
  UserCheck,
  ClipboardList
} from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";

// Mock data for the manager dashboard
const todaysJobs = [
  { 
    id: "job-1", 
    title: "Office Cleaning - Tech Corp", 
    customer: "Tech Corp", 
    status: "in-progress", 
    time: "9:00 AM - 11:00 AM",
    team: ["Jane D.", "Mike S."],
    location: "Downtown",
    priority: "high"
  },
  { 
    id: "job-2", 
    title: "Residential Deep Clean", 
    customer: "Sarah Johnson", 
    status: "scheduled", 
    time: "1:00 PM - 3:00 PM",
    team: ["Tom B.", "Lisa M."],
    location: "Suburbs",
    priority: "medium"
  },
  { 
    id: "job-3", 
    title: "Restaurant Cleaning", 
    customer: "Tasty Bites", 
    status: "completed", 
    time: "6:00 AM - 8:00 AM",
    team: ["David R.", "Emma T."],
    location: "City Center",
    priority: "high"
  },
];

const teamPerformance = [
  { 
    id: "team-1", 
    name: "Jane Doe", 
    avatar: "", 
    status: "on-job",
    currentJob: "Office Cleaning - Tech Corp",
    completedToday: 2,
    rating: 4.9,
    efficiency: 95
  },
  { 
    id: "team-2", 
    name: "Mike Smith", 
    avatar: "", 
    status: "on-job",
    currentJob: "Office Cleaning - Tech Corp",
    completedToday: 2,
    rating: 4.7,
    efficiency: 88
  },
  { 
    id: "team-3", 
    name: "Tom Brown", 
    avatar: "", 
    status: "available",
    currentJob: null,
    completedToday: 3,
    rating: 4.6,
    efficiency: 92
  },
  { 
    id: "team-4", 
    name: "Lisa Martinez", 
    avatar: "", 
    status: "available",
    currentJob: null,
    completedToday: 2,
    rating: 4.8,
    efficiency: 90
  },
];

const upcomingSchedule = [
  { time: "9:00 AM", job: "Office Cleaning - Tech Corp", team: "Jane D., Mike S.", status: "in-progress" },
  { time: "11:30 AM", job: "Apartment Complex", team: "Tom B., Lisa M.", status: "scheduled" },
  { time: "1:00 PM", job: "Medical Office", team: "David R., Emma T.", status: "scheduled" },
  { time: "3:30 PM", job: "Retail Store", team: "Jane D., Mike S.", status: "scheduled" },
  { time: "5:00 PM", job: "Restaurant Kitchen", team: "Tom B., Lisa M.", status: "scheduled" },
];

export default function ManagerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["manager"]}>
      <ManagerDashboardContent />
    </ProtectedRoute>
  );
}

function ManagerDashboardContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTeamFilter, setSelectedTeamFilter] = useState("all");
  
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
          <h1 className="text-2xl font-bold tracking-tight">Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Good morning, {profile?.full_name || "Manager"}! Here's your team's status for today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => router.push("/jobs/new")}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Assign Job
          </Button>
          <Button 
            variant="outline" 
            className="border-pink-200"
            onClick={() => router.push("/schedule")}
          >
            <Calendar className="mr-2 h-4 w-4" /> Schedule
          </Button>
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Jobs
            </CardTitle>
            <Calendar className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">3 completed</span>
              <span className="text-xs text-muted-foreground ml-1">• 2 in progress</span>
            </div>
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
            <div className="text-2xl font-bold">8/12</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-blue-500 font-medium">4 on jobs</span>
              <span className="text-xs text-muted-foreground ml-1">• 0 off duty</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+2%</span>
              <span className="text-xs text-muted-foreground ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Team Rating
            </CardTitle>
            <Star className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.7/5</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-emerald-500 font-medium">+0.1</span>
              <span className="text-xs text-muted-foreground ml-1">this week</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="scheduling">Job Scheduling</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
            {/* Today's Jobs */}
            <Card className="md:col-span-4 backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Today's Jobs</CardTitle>
                <CardDescription>
                  Current job status and assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {todaysJobs.map((job) => (
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
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{job.time}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{job.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Badge className={
                            job.priority === "high" ? "bg-red-500" : 
                            job.priority === "medium" ? "bg-amber-500" : 
                            "bg-green-500"
                          }>
                            {job.priority}
                          </Badge>
                          <Badge className={
                            job.status === "completed" ? "bg-green-500" : 
                            job.status === "in-progress" ? "bg-blue-500" : 
                            "bg-amber-500"
                          }>
                            {job.status === "completed" ? "Done" : 
                             job.status === "in-progress" ? "Active" : 
                             "Pending"}
                          </Badge>
                        </div>
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
            
            {/* Team Location Overview */}
            <Card className="md:col-span-3 backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Team Locations</CardTitle>
                <CardDescription>
                  Real-time team member locations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {teamPerformance.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-pink-100 text-pink-500 text-xs">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">{member.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {member.currentJob || "Available"}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={
                        member.status === "on-job" ? "bg-blue-500" : 
                        member.status === "available" ? "bg-green-500" : 
                        "bg-gray-500"
                      }>
                        {member.status === "on-job" ? "On Job" : 
                         member.status === "available" ? "Available" : 
                         "Off Duty"}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-pink-500 hover:text-pink-600 hover:bg-pink-50 p-1"
                        onClick={() => router.push("/map")}
                      >
                        <MapPin className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push("/map")}
                >
                  View Team Map
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Quick Actions */}
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common management tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center justify-center gap-2 py-4 border-pink-200 hover:bg-pink-50"
                  onClick={() => router.push("/jobs/new")}
                >
                  <Plus className="h-5 w-5 text-pink-500" />
                  <span>Assign Job</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto flex flex-col items-center justify-center gap-2 py-4 border-pink-200 hover:bg-pink-50"
                  onClick={() => setActiveTab("team")}
                >
                  <UserCheck className="h-5 w-5 text-pink-500" />
                  <span>Check Team</span>
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
                  onClick={() => setActiveTab("scheduling")}
                >
                  <Calendar className="h-5 w-5 text-pink-500" />
                  <span>Schedule</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Team Performance</h3>
              <p className="text-sm text-muted-foreground">Monitor and manage your team's performance</p>
            </div>
            <Select value={selectedTeamFilter} onValueChange={setSelectedTeamFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Team Members</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="on-job">On Job</SelectItem>
                <SelectItem value="off-duty">Off Duty</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardContent className="p-6">
              <div className="space-y-6">
                {teamPerformance.map((member) => (
                  <div key={member.id} className="flex items-center justify-between border-b border-pink-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback className="bg-pink-100 text-pink-500">
                          {member.name.split(" ").map(n => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {member.currentJob || "Available for assignment"}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-green-500" />
                            <span className="text-xs text-muted-foreground">{member.completedToday} jobs today</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs text-muted-foreground">{member.rating} rating</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Efficiency</div>
                        <div className="text-xs text-muted-foreground">{member.efficiency}%</div>
                        <Progress value={member.efficiency} className="w-20 h-2 mt-1 bg-pink-100" indicatorClassName="bg-pink-500" />
                      </div>
                      <Badge className={
                        member.status === "on-job" ? "bg-blue-500" : 
                        member.status === "available" ? "bg-green-500" : 
                        "bg-gray-500"
                      }>
                        {member.status === "on-job" ? "On Job" : 
                         member.status === "available" ? "Available" : 
                         "Off Duty"}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                        onClick={() => router.push(`/team/${member.id}`)}
                      >
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Team Efficiency</CardTitle>
                <CardDescription>
                  Average team performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">91%</div>
                <Progress value={91} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                <p className="text-xs text-muted-foreground mt-2">Above target of 85%</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Jobs Completed</CardTitle>
                <CardDescription>
                  Today's completion count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">9/12</div>
                <Progress value={75} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                <p className="text-xs text-muted-foreground mt-2">3 jobs remaining</p>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Customer Rating</CardTitle>
                <CardDescription>
                  Average team rating
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold mb-2">4.7/5</div>
                <Progress value={94} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                <p className="text-xs text-muted-foreground mt-2">Excellent performance</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="scheduling" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>
                  Upcoming jobs and assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingSchedule.map((item, index) => (
                    <div key={index} className="flex items-center justify-between border-b border-pink-100 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-pink-600 min-w-[60px]">
                          {item.time}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{item.job}</div>
                          <div className="text-xs text-muted-foreground">{item.team}</div>
                        </div>
                      </div>
                      <Badge className={
                        item.status === "completed" ? "bg-green-500" : 
                        item.status === "in-progress" ? "bg-blue-500" : 
                        "bg-amber-500"
                      }>
                        {item.status === "completed" ? "Done" : 
                         item.status === "in-progress" ? "Active" : 
                         "Pending"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="ghost" 
                  className="w-full text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push("/schedule")}
                >
                  View Full Schedule
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Scheduling Tools</CardTitle>
                <CardDescription>
                  Quick scheduling actions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={() => router.push("/jobs/new")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Job
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push("/schedule/optimize")}
                >
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Optimize Routes
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push("/team/assign")}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Assign Teams
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push("/schedule/calendar")}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Calendar View
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader>
              <CardTitle>Schedule Optimization</CardTitle>
              <CardDescription>
                Recommendations for better scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-amber-800">Route Optimization Available</div>
                    <div className="text-xs text-amber-700">You can save 45 minutes by optimizing routes for afternoon jobs.</div>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100">
                    Optimize
                  </Button>
                </div>
                
                <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <ClipboardList className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <div className="text-sm font-medium text-blue-800">Team Availability</div>
                    <div className="text-xs text-blue-700">Tom Brown and Lisa Martinez are available for additional assignments.</div>
                  </div>
                  <Button size="sm" variant="outline" className="ml-auto border-blue-300 text-blue-700 hover:bg-blue-100">
                    Assign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}