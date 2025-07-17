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
  Calendar, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  MapPin, 
  Camera, 
  Star, 
  Navigation,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Upload,
  MessageSquare
} from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";

// Mock data for the team dashboard
const myJobs = [
  { 
    id: "job-1", 
    title: "Office Cleaning - Tech Corp", 
    customer: "Tech Corp", 
    status: "in-progress", 
    time: "9:00 AM - 11:00 AM",
    location: "123 Business Ave, Downtown",
    priority: "high",
    description: "Deep clean of office spaces, conference rooms, and kitchen area",
    checklist: [
      { task: "Vacuum all carpeted areas", completed: true },
      { task: "Clean and sanitize restrooms", completed: true },
      { task: "Empty trash bins", completed: true },
      { task: "Clean conference room", completed: false },
      { task: "Kitchen deep clean", completed: false }
    ]
  },
  { 
    id: "job-2", 
    title: "Residential Deep Clean", 
    customer: "Sarah Johnson", 
    status: "scheduled", 
    time: "1:00 PM - 3:00 PM",
    location: "456 Maple Street, Suburbs",
    priority: "medium",
    description: "Complete house cleaning including bedrooms, bathrooms, and living areas",
    checklist: [
      { task: "Clean all bedrooms", completed: false },
      { task: "Deep clean bathrooms", completed: false },
      { task: "Vacuum and mop floors", completed: false },
      { task: "Kitchen cleaning", completed: false },
      { task: "Living room dusting", completed: false }
    ]
  },
  { 
    id: "job-3", 
    title: "Restaurant Post-Service Clean", 
    customer: "Tasty Bites", 
    status: "scheduled", 
    time: "6:00 PM - 8:00 PM",
    location: "789 Food Court, City Center",
    priority: "high",
    description: "Kitchen deep clean and dining area sanitization",
    checklist: [
      { task: "Kitchen equipment cleaning", completed: false },
      { task: "Floor mopping and sanitizing", completed: false },
      { task: "Dining area tables and chairs", completed: false },
      { task: "Restroom maintenance", completed: false }
    ]
  },
];

const todayStats = {
  jobsCompleted: 2,
  jobsRemaining: 3,
  hoursWorked: 6.5,
  customerRating: 4.8,
  efficiency: 92
};

const recentPhotos = [
  { id: 1, jobTitle: "Office Cleaning", type: "before", timestamp: "2 hours ago" },
  { id: 2, jobTitle: "Office Cleaning", type: "after", timestamp: "2 hours ago" },
  { id: 3, jobTitle: "Residential Clean", type: "before", timestamp: "4 hours ago" },
  { id: 4, jobTitle: "Residential Clean", type: "after", timestamp: "4 hours ago" },
];

export default function TeamDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["team"]}>
      <TeamDashboardContent />
    </ProtectedRoute>
  );
}

function TeamDashboardContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("jobs");
  const [currentJob, setCurrentJob] = useState(myJobs.find(job => job.status === "in-progress"));
  const [isOnBreak, setIsOnBreak] = useState(false);
  
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
      </div>
    );
  }
  
  const handleStartJob = (jobId: string) => {
    // Logic to start a job
    console.log("Starting job:", jobId);
  };
  
  const handleCompleteTask = (jobId: string, taskIndex: number) => {
    // Logic to complete a task
    console.log("Completing task:", jobId, taskIndex);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">
            Good morning, {profile?.full_name || "Team Member"}! Here are your jobs for today.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant={isOnBreak ? "default" : "outline"}
            onClick={() => setIsOnBreak(!isOnBreak)}
            className={isOnBreak ? "bg-amber-500 hover:bg-amber-600 text-white" : "border-pink-200"}
          >
            {isOnBreak ? <PlayCircle className="mr-2 h-4 w-4" /> : <PauseCircle className="mr-2 h-4 w-4" />}
            {isOnBreak ? "Resume Work" : "Take Break"}
          </Button>
          <Button 
            className="bg-pink-500 hover:bg-pink-600 text-white"
            onClick={() => router.push("/map")}
          >
            <Navigation className="mr-2 h-4 w-4" /> Navigate
          </Button>
        </div>
      </div>
      
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Jobs Today
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.jobsCompleted}/{todayStats.jobsCompleted + todayStats.jobsRemaining}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.jobsRemaining} remaining
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Hours Worked
            </CardTitle>
            <Clock className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.hoursWorked}h</div>
            <p className="text-xs text-muted-foreground">
              Target: 8h
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Customer Rating
            </CardTitle>
            <Star className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.customerRating}/5</div>
            <p className="text-xs text-muted-foreground">
              Excellent work!
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Efficiency
            </CardTitle>
            <Calendar className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.efficiency}%</div>
            <p className="text-xs text-muted-foreground">
              Above average
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Status
            </CardTitle>
            <MapPin className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {currentJob ? "On Job" : isOnBreak ? "On Break" : "Available"}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentJob ? currentJob.customer : "Ready for assignment"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Current Job Alert */}
      {currentJob && (
        <Card className="backdrop-blur-sm bg-blue-50/40 border border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-blue-800">Current Job in Progress</div>
                <div className="text-sm text-blue-700">{currentJob.title} - {currentJob.customer}</div>
                <div className="text-xs text-blue-600 mt-1">
                  <MapPin className="h-3 w-3 inline mr-1" />
                  {currentJob.location}
                </div>
              </div>
              <Button 
                size="sm" 
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={() => setActiveTab("current")}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="jobs" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="jobs">My Jobs</TabsTrigger>
          {currentJob && <TabsTrigger value="current">Current Job</TabsTrigger>}
          <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
          <TabsTrigger value="photos">Photo Gallery</TabsTrigger>
        </TabsList>
        
        <TabsContent value="jobs" className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader>
              <CardTitle>Assigned Jobs</CardTitle>
              <CardDescription>
                Your jobs for today and upcoming assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myJobs.map((job) => (
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
                        <div className="text-xs text-muted-foreground mt-1">
                          {job.description}
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
                      <div className="flex gap-1">
                        {job.status === "scheduled" && (
                          <Button 
                            size="sm" 
                            className="bg-pink-500 hover:bg-pink-600 text-white"
                            onClick={() => handleStartJob(job.id)}
                          >
                            Start
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                          onClick={() => router.push(`/jobs/${job.id}`)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {currentJob && (
          <TabsContent value="current" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader>
                  <CardTitle>{currentJob.title}</CardTitle>
                  <CardDescription>
                    {currentJob.customer} • {currentJob.time}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentJob.location}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="ml-auto border-pink-200 text-pink-600 hover:bg-pink-50"
                      onClick={() => router.push("/map")}
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      Navigate
                    </Button>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Job Description</h4>
                    <p className="text-sm text-muted-foreground">{currentJob.description}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1 bg-pink-500 hover:bg-pink-600 text-white"
                      onClick={() => router.push("/photos/upload")}
                    >
                      <Camera className="mr-2 h-4 w-4" />
                      Take Photos
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-pink-200 text-pink-600 hover:bg-pink-50"
                      onClick={() => router.push("/chat")}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
                <CardHeader>
                  <CardTitle>Task Checklist</CardTitle>
                  <CardDescription>
                    Complete all tasks to finish the job
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {currentJob.checklist.map((task, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Button
                          size="sm"
                          variant={task.completed ? "default" : "outline"}
                          className={task.completed ? "bg-green-500 hover:bg-green-600 text-white" : "border-pink-200"}
                          onClick={() => handleCompleteTask(currentJob.id, index)}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                        </Button>
                        <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                          {task.task}
                        </span>
                      </div>
                    ))}
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{currentJob.checklist.filter(t => t.completed).length}/{currentJob.checklist.length}</span>
                    </div>
                    <Progress 
                      value={(currentJob.checklist.filter(t => t.completed).length / currentJob.checklist.length) * 100} 
                      className="h-2 bg-pink-100" 
                      indicatorClassName="bg-pink-500" 
                    />
                  </div>
                  
                  {currentJob.checklist.every(t => t.completed) && (
                    <Button 
                      className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white"
                      onClick={() => router.push("/jobs/complete")}
                    >
                      Complete Job
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
        
        <TabsContent value="schedule" className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader>
              <CardTitle>Daily Schedule</CardTitle>
              <CardDescription>
                Your complete schedule for today
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myJobs.map((job, index) => (
                  <div key={job.id} className="flex items-center gap-4 border-b border-pink-100 pb-4 last:border-0 last:pb-0">
                    <div className="text-sm font-medium text-pink-600 min-w-[100px]">
                      {job.time}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground">{job.customer}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{job.location}</span>
                      </div>
                    </div>
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
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                onClick={() => router.push("/schedule")}
              >
                View Full Calendar
              </Button>
            </CardFooter>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Today's Summary</CardTitle>
                <CardDescription>
                  Your performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Jobs Completed</div>
                    <div className="text-sm font-medium">{todayStats.jobsCompleted}/{todayStats.jobsCompleted + todayStats.jobsRemaining}</div>
                  </div>
                  <Progress value={(todayStats.jobsCompleted / (todayStats.jobsCompleted + todayStats.jobsRemaining)) * 100} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Hours Worked</div>
                    <div className="text-sm font-medium">{todayStats.hoursWorked}/8h</div>
                  </div>
                  <Progress value={(todayStats.hoursWorked / 8) * 100} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Efficiency</div>
                    <div className="text-sm font-medium">{todayStats.efficiency}%</div>
                  </div>
                  <Progress value={todayStats.efficiency} className="h-2 bg-pink-100" indicatorClassName="bg-pink-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and tools
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={() => router.push("/photos/upload")}
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photos
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push("/map")}
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  Navigation
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push("/chat")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Manager
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="photos" className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Photo Gallery</CardTitle>
                <CardDescription>
                  Recent job completion photos
                </CardDescription>
              </div>
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => router.push("/photos/upload")}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Photos
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recentPhotos.map((photo) => (
                  <div key={photo.id} className="space-y-2">
                    <div className="aspect-square bg-pink-100 rounded-lg flex items-center justify-center">
                      <Camera className="h-8 w-8 text-pink-300" />
                    </div>
                    <div className="text-xs">
                      <div className="font-medium">{photo.jobTitle}</div>
                      <div className="text-muted-foreground">{photo.type} • {photo.timestamp}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="ghost" 
                className="w-full text-pink-500 hover:text-pink-600 hover:bg-pink-50"
                onClick={() => router.push("/photos")}
              >
                View All Photos
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}