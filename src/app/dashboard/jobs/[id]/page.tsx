"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Helmet } from "react-helmet";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { MapPin, Calendar, Clock, User, Phone, Mail, FileText, MapIcon, Camera, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MapView from "@/components/map/MapView";
import JobLocationMarker from "@/components/map/JobLocationMarker";
import JobGeofence from "@/components/map/JobGeofence";
import TeamLocationTracker from "@/components/map/TeamLocationTracker";

// This would come from your API in a real implementation
const getJobDetails = async (id: string) => {
  // Simulate API call
  return {
    id,
    title: "Deep Clean - Smith Residence",
    description: "Complete deep cleaning of 3-bedroom house including kitchen appliances and bathroom sanitization.",
    status: "scheduled",
    scheduledStart: "2025-07-20T09:00:00Z",
    scheduledEnd: "2025-07-20T12:00:00Z",
    customer: {
      id: "cust123",
      name: "John Smith",
      phone: "555-123-4567",
      email: "john.smith@example.com"
    },
    location: {
      address: "123 Main St, Anytown, CA 12345",
      coordinates: {
        latitude: 37.7749,
        longitude: -122.4194
      }
    },
    team: [
      { id: "team1", name: "Alice Johnson" },
      { id: "team2", name: "Bob Williams" }
    ],
    services: [
      { id: "svc1", name: "Deep Cleaning", price: 150 },
      { id: "svc2", name: "Appliance Cleaning", price: 75 }
    ],
    notes: "Customer has a dog. Gate code is 1234.",
    history: [
      { timestamp: "2025-07-15T14:30:00Z", action: "Job created", user: "Admin" },
      { timestamp: "2025-07-16T09:15:00Z", action: "Team assigned", user: "Manager" }
    ]
  };
};

export default function JobDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const loadJob = async () => {
      try {
        setLoading(true);
        const jobData = await getJobDetails(id as string);
        setJob(jobData);
      } catch (error) {
        console.error("Error loading job:", error);
        toast({
          title: "Error",
          description: "Failed to load job details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadJob();
    }
  }, [id]);

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-center">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!job) {
    return (
      <DashboardShell>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-2">Job Not Found</h2>
          <p className="text-muted-foreground">The requested job could not be found.</p>
          <Button className="mt-4" variant="outline" onClick={() => window.history.back()}>
            Go Back
          </Button>
        </div>
      </DashboardShell>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "in-progress":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "issue":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <Helmet>
        <title>{job.title} | We-Clean.app</title>
      </Helmet>
      
      <DashboardShell>
        <DashboardHeader
          heading={job.title}
          text={job.description}
        >
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(job.status)}`}>
              {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
            </Badge>
            {user?.role === "team" && (
              <Button variant="outline" size="sm">
                Update Status
              </Button>
            )}
            {(user?.role === "admin" || user?.role === "manager") && (
              <Button variant="outline" size="sm">
                Edit Job
              </Button>
            )}
          </div>
        </DashboardHeader>
        
        <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="location">Location</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-pink-500" />
                    Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Date</div>
                    <div className="font-medium">{formatDate(job.scheduledStart)}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Start Time</div>
                      <div className="font-medium">{formatTime(job.scheduledStart)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">End Time</div>
                      <div className="font-medium">{formatTime(job.scheduledEnd)}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Duration</div>
                    <div className="font-medium">3 hours</div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-pink-500" />
                    Customer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="font-medium">{job.customer.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Contact</div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{job.customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span>{job.customer.email}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-pink-500" />
                    Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {job.services.map((service: any) => (
                      <div key={service.id} className="flex justify-between items-center">
                        <div className="font-medium">{service.name}</div>
                        <div>${service.price.toFixed(2)}</div>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-bold">
                      <div>Total</div>
                      <div>${job.services.reduce((sum: number, svc: any) => sum + svc.price, 0).toFixed(2)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {job.notes && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Notes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>{job.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="location" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-pink-500" />
                  Job Location
                </CardTitle>
                <CardDescription>{job.location.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] rounded-md overflow-hidden">
                  <MapView
                    center={[job.location.coordinates.longitude, job.location.coordinates.latitude]}
                    zoom={15}
                    style={{ height: "100%" }}
                  >
                    <JobLocationMarker
                      jobId={job.id}
                      title={job.title}
                      address={job.location.address}
                      date={formatDate(job.scheduledStart)}
                      time={formatTime(job.scheduledStart)}
                      status={job.status}
                      customer={job.customer.name}
                      longitude={job.location.coordinates.longitude}
                      latitude={job.location.coordinates.latitude}
                    />
                    
                    {/* Add geofence if user is admin or manager */}
                    {(user?.role === "admin" || user?.role === "manager") && (
                      <JobGeofence
                        jobId={job.id}
                        longitude={job.location.coordinates.longitude}
                        latitude={job.location.coordinates.latitude}
                        editable={true}
                      />
                    )}
                  </MapView>
                </div>
              </CardContent>
            </Card>
            
            {/* Location tracking for team members */}
            {user?.role === "team" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapIcon className="h-5 w-5 text-pink-500" />
                    Location Tracking
                  </CardTitle>
                  <CardDescription>
                    Enable location tracking to help coordinate with your team
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TeamLocationTracker 
                    enabled={false}
                    showControls={true}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assigned Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.team.map((member: any) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-800 font-medium">
                          {member.name.split(" ").map((n: string) => n[0]).join("")}
                        </div>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">Team Member</div>
                        </div>
                      </div>
                      {(user?.role === "admin" || user?.role === "manager") && (
                        <Button variant="outline" size="sm">Contact</Button>
                      )}
                    </div>
                  ))}
                </div>
                
                {(user?.role === "admin" || user?.role === "manager") && (
                  <div className="mt-6">
                    <Button variant="outline" className="w-full">
                      Manage Team Assignment
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-pink-500" />
                  Job History
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {job.history.map((item: any, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-pink-500 mt-2"></div>
                      <div className="flex-1">
                        <div className="font-medium">{item.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()} by {item.user}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {(user?.role === "admin" || user?.role === "manager") && (
              <Card>
                <CardHeader>
                  <CardTitle>Add History Entry</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Add Note to History
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </>
  );
}