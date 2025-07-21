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
  Star, 
  CreditCard,
  MessageSquare,
  Camera,
  Plus,
  Eye,
  Download,
  Phone,
  Mail
} from "lucide-react";
import { ProtectedRoute } from "@/components/protected-route";

// Mock data for the customer dashboard
const upcomingServices = [
  { 
    id: "service-1", 
    title: "Weekly Office Cleaning", 
    date: "Tomorrow, Dec 17",
    time: "9:00 AM - 11:00 AM",
    team: ["Jane D.", "Mike S."],
    status: "confirmed",
    price: 150,
    address: "123 Business Ave, Downtown"
  },
  { 
    id: "service-2", 
    title: "Deep Clean Service", 
    date: "Dec 20, 2024",
    time: "1:00 PM - 4:00 PM",
    team: ["Sarah L.", "Tom B."],
    status: "scheduled",
    price: 280,
    address: "456 Home Street, Suburbs"
  },
];

const serviceHistory = [
  { 
    id: "history-1", 
    title: "Weekly Office Cleaning", 
    date: "Dec 10, 2024",
    time: "9:00 AM - 11:00 AM",
    team: ["Jane D.", "Mike S."],
    status: "completed",
    price: 150,
    rating: 5,
    photos: 4,
    invoice: "INV-001"
  },
  { 
    id: "history-2", 
    title: "Monthly Deep Clean", 
    date: "Nov 28, 2024",
    time: "10:00 AM - 2:00 PM",
    team: ["Sarah L.", "Tom B.", "David R."],
    status: "completed",
    price: 320,
    rating: 5,
    photos: 8,
    invoice: "INV-002"
  },
  { 
    id: "history-3", 
    title: "Post-Event Cleanup", 
    date: "Nov 15, 2024",
    time: "6:00 PM - 9:00 PM",
    team: ["Emma T.", "Lisa M."],
    status: "completed",
    price: 200,
    rating: 4,
    photos: 6,
    invoice: "INV-003"
  },
];

const invoices = [
  {
    id: "INV-001",
    date: "Dec 10, 2024",
    service: "Weekly Office Cleaning",
    amount: 150,
    status: "paid",
    dueDate: "Dec 17, 2024"
  },
  {
    id: "INV-002",
    date: "Nov 28, 2024",
    service: "Monthly Deep Clean",
    amount: 320,
    status: "paid",
    dueDate: "Dec 5, 2024"
  },
  {
    id: "INV-003",
    date: "Nov 15, 2024",
    service: "Post-Event Cleanup",
    amount: 200,
    status: "overdue",
    dueDate: "Nov 22, 2024"
  },
];

const currentService = {
  id: "current-1",
  title: "Weekly Office Cleaning",
  team: ["Jane D.", "Mike S."],
  status: "on-the-way",
  eta: "15 minutes",
  startTime: "9:00 AM",
  address: "123 Business Ave, Downtown",
  phone: "+1 (555) 123-4567"
};

export default function CustomerDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["customer"]}>
      <CustomerDashboardContent />
    </ProtectedRoute>
  );
}

function CustomerDashboardContent() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");
  const [hasActiveService, setHasActiveService] = useState(true);
  
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
          <h1 className="text-2xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {profile?.full_name || "Customer"}! Manage your cleaning services here.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => router.push("/schedule")}
            className="bg-pink-500 hover:bg-pink-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" /> Book Service
          </Button>
          <Button 
            variant="outline" 
            className="border-pink-200"
            onClick={() => router.push("/chat")}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Support
          </Button>
        </div>
      </div>
      
      {/* Service Status Alert */}
      {hasActiveService && (
        <Card className="backdrop-blur-sm bg-blue-50/40 border border-blue-200/50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-blue-800">Your cleaning team is on the way!</div>
                <div className="text-sm text-blue-700">{currentService.title}</div>
                <div className="text-xs text-blue-600 mt-1">
                  ETA: {currentService.eta} • Team: {currentService.team.join(", ")}
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  onClick={() => router.push("/map")}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Track
                </Button>
                <Button 
                  size="sm" 
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Service
            </CardTitle>
            <Calendar className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">Tomorrow</div>
            <p className="text-xs text-muted-foreground">
              9:00 AM - Office Cleaning
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Services This Month
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              6 completed, 2 upcoming
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Spent
            </CardTitle>
            <CreditCard className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,240</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Satisfaction
            </CardTitle>
            <Star className="h-4 w-4 text-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9/5</div>
            <p className="text-xs text-muted-foreground">
              Average rating given
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Services</TabsTrigger>
          <TabsTrigger value="history">Service History</TabsTrigger>
          <TabsTrigger value="billing">Billing & Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
            {/* Upcoming Services */}
            <Card className="md:col-span-4 backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Upcoming Services</CardTitle>
                <CardDescription>
                  Your scheduled cleaning services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingServices.slice(0, 3).map((service) => (
                    <div key={service.id} className="flex items-center justify-between border-b border-pink-100 pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <div className="w-2 h-2 mt-2 rounded-full bg-pink-500" />
                        <div>
                          <div className="font-medium">{service.title}</div>
                          <div className="text-sm text-muted-foreground">{service.date} • {service.time}</div>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">{service.address}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge className={
                          service.status === "confirmed" ? "bg-green-500" : "bg-amber-500"
                        }>
                          {service.status === "confirmed" ? "Confirmed" : "Scheduled"}
                        </Badge>
                        <div className="text-sm font-medium">${service.price}</div>
                        <div className="flex -space-x-2">
                          {service.team.map((member, i) => (
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
                  onClick={() => setActiveTab("upcoming")}
                >
                  View All Upcoming Services
                </Button>
              </CardFooter>
            </Card>
            
            {/* Quick Actions */}
            <Card className="md:col-span-3 backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks and services
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={() => router.push("/schedule")}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Book New Service
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push("/map")}
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Track Current Service
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => setActiveTab("history")}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Service Photos
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push("/chat")}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Recent Activity */}
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest service completions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceHistory.slice(0, 3).map((service) => (
                  <div key={service.id} className="flex items-center justify-between border-b border-pink-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">{service.title}</div>
                        <div className="text-sm text-muted-foreground">{service.date} • {service.time}</div>
                        <div className="flex items-center gap-4 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                            <span className="text-xs text-muted-foreground">{service.rating}/5 rating</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Camera className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{service.photos} photos</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-sm font-medium">${service.price}</div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-pink-200 text-pink-600 hover:bg-pink-50"
                        onClick={() => router.push(`/services/${service.id}`)}
                      >
                        View Details
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
                onClick={() => setActiveTab("history")}
              >
                View Complete History
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="upcoming" className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Services</CardTitle>
                <CardDescription>
                  All your scheduled cleaning services
                </CardDescription>
              </div>
              <Button 
                className="bg-pink-500 hover:bg-pink-600 text-white"
                onClick={() => router.push("/schedule")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Book Service
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {upcomingServices.map((service) => (
                  <div key={service.id} className="border border-pink-100 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{service.title}</h3>
                        <div className="text-sm text-muted-foreground">{service.date} • {service.time}</div>
                      </div>
                      <Badge className={
                        service.status === "confirmed" ? "bg-green-500" : "bg-amber-500"
                      }>
                        {service.status === "confirmed" ? "Confirmed" : "Scheduled"}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{service.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">${service.price}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Team:</span>
                        <div className="flex -space-x-2">
                          {service.team.map((member, i) => (
                            <Avatar key={i} className="border-2 border-white h-6 w-6">
                              <AvatarFallback className="text-[10px]">
                                {member.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                        <span className="text-sm text-muted-foreground">{service.team.join(", ")}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                        >
                          Reschedule
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history" className="space-y-4">
          <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
            <CardHeader>
              <CardTitle>Service History</CardTitle>
              <CardDescription>
                Your completed cleaning services and reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {serviceHistory.map((service) => (
                  <div key={service.id} className="border border-pink-100 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{service.title}</h3>
                        <div className="text-sm text-muted-foreground">{service.date} • {service.time}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500">Completed</Badge>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`h-3 w-3 ${i < service.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">${service.price}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{service.photos} photos</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">Invoice: {service.invoice}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Team:</span>
                        <span className="text-sm">{service.team.join(", ")}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                          onClick={() => router.push(`/photos/${service.id}`)}
                        >
                          <Camera className="h-3 w-3 mr-1" />
                          Photos
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                          onClick={() => router.push(`/invoices/${service.invoice}`)}
                        >
                          <Download className="h-3 w-3 mr-1" />
                          Invoice
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-pink-500 hover:bg-pink-600 text-white"
                          onClick={() => router.push("/schedule")}
                        >
                          Book Again
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>
                  Your billing history and payment status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between border-b border-pink-100 pb-4 last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium">{invoice.id}</div>
                        <div className="text-sm text-muted-foreground">{invoice.service}</div>
                        <div className="text-xs text-muted-foreground">Due: {invoice.dueDate}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-medium">${invoice.amount}</div>
                          <Badge className={
                            invoice.status === "paid" ? "bg-green-500" : 
                            invoice.status === "overdue" ? "bg-red-500" : 
                            "bg-amber-500"
                          }>
                            {invoice.status}
                          </Badge>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="border-pink-200 text-pink-600 hover:bg-pink-50"
                          onClick={() => router.push(`/invoices/${invoice.id}`)}
                        >
                          <Download className="h-3 w-3" />
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
                  onClick={() => router.push("/invoices")}
                >
                  View All Invoices
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
                <CardDescription>
                  Your spending overview
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">This Month</div>
                    <div className="text-sm font-medium">$1,240</div>
                  </div>
                  <Progress value={75} className="h-2 bg-pink-100" />
                  <div className="text-xs text-muted-foreground">8 services completed</div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Outstanding Balance</div>
                    <div className="text-sm font-medium text-red-600">$200</div>
                  </div>
                  <div className="text-xs text-muted-foreground">1 overdue invoice</div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Total Spent (All Time)</div>
                    <div className="text-sm font-medium">$8,450</div>
                  </div>
                  <div className="text-xs text-muted-foreground">Since joining in Jan 2024</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white"
                  onClick={() => router.push("/payment")}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  Make Payment
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}