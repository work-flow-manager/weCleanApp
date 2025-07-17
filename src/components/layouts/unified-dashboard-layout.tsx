"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { DesktopNav, Header } from "@/components/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  LogOut,
  Menu,
  MapPin,
  BarChart3,
  MessageSquare,
  Bell,
  Globe,
  Search,
  ClipboardList,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { UserRole } from "@/lib/supabase";
import { NavigationItem } from "@/types/navigation";

interface UnifiedDashboardLayoutProps {
  children: React.ReactNode;
  userRole?: UserRole;
}

export function UnifiedDashboardLayout({
  children,
  userRole = "admin",
}: UnifiedDashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [language, setLanguage] = useState("en");
  const [notificationCount, setNotificationCount] = useState(3);
  
  // Set language from profile if available
  useEffect(() => {
    if (profile?.language) {
      setLanguage(profile.language);
    }
  }, [profile]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Navigation items based on user role
  const navigationItems = {
    admin: [
      {
        name: "Dashboard",
        href: "/dashboard/admin",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      { 
        name: "Jobs", 
        href: "/jobs", 
        icon: <ClipboardList className="h-5 w-5" /> 
      },
      { 
        name: "Schedule", 
        href: "/schedule", 
        icon: <Calendar className="h-5 w-5" /> 
      },
      { 
        name: "Team", 
        href: "/team", 
        icon: <Users className="h-5 w-5" /> 
      },
      {
        name: "Map",
        href: "/map",
        icon: <MapPin className="h-5 w-5" />,
      },
      {
        name: "Analytics",
        href: "/analytics",
        icon: <BarChart3 className="h-5 w-5" />,
      },
      {
        name: "Chat",
        href: "/chat",
        icon: <MessageSquare className="h-5 w-5" />,
        badge: 2,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: <User className="h-5 w-5" />,
      },
      {
        name: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
      },
    ],
    manager: [
      {
        name: "Dashboard",
        href: "/dashboard/manager",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      { 
        name: "Jobs", 
        href: "/jobs", 
        icon: <ClipboardList className="h-5 w-5" /> 
      },
      { 
        name: "Schedule", 
        href: "/schedule", 
        icon: <Calendar className="h-5 w-5" /> 
      },
      { 
        name: "Team", 
        href: "/team", 
        icon: <Users className="h-5 w-5" /> 
      },
      {
        name: "Map",
        href: "/map",
        icon: <MapPin className="h-5 w-5" />,
      },
      {
        name: "Chat",
        href: "/chat",
        icon: <MessageSquare className="h-5 w-5" />,
        badge: 2,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: <User className="h-5 w-5" />,
      },
      {
        name: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
      },
    ],
    team: [
      {
        name: "Dashboard",
        href: "/dashboard/team",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        name: "My Jobs",
        href: "/jobs",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      { 
        name: "Schedule", 
        href: "/schedule", 
        icon: <Calendar className="h-5 w-5" /> 
      },
      { 
        name: "Map", 
        href: "/map", 
        icon: <MapPin className="h-5 w-5" /> 
      },
      {
        name: "Chat",
        href: "/chat",
        icon: <MessageSquare className="h-5 w-5" />,
        badge: 2,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: <User className="h-5 w-5" />,
      },
      {
        name: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
      },
    ],
    customer: [
      {
        name: "Dashboard",
        href: "/dashboard/customer",
        icon: <LayoutDashboard className="h-5 w-5" />,
      },
      {
        name: "Schedule",
        href: "/schedule",
        icon: <Calendar className="h-5 w-5" />,
      },
      { 
        name: "Track", 
        href: "/map", 
        icon: <MapPin className="h-5 w-5" /> 
      },
      {
        name: "History",
        href: "/jobs",
        icon: <ClipboardList className="h-5 w-5" />,
      },
      {
        name: "Chat",
        href: "/chat",
        icon: <MessageSquare className="h-5 w-5" />,
        badge: 2,
      },
      {
        name: "Profile",
        href: "/profile",
        icon: <User className="h-5 w-5" />,
      },
      {
        name: "Settings",
        href: "/settings",
        icon: <Settings className="h-5 w-5" />,
      },
    ],
  };

  const currentNavItems = navigationItems[userRole] || [];

  const roleColors = {
    admin: "bg-pink-500",
    manager: "bg-pink-400",
    team: "bg-amber-400",
    customer: "bg-pink-300",
  };
  
  const userName = profile?.full_name || "User";
  const userAvatar = profile?.avatar_url || "";
  
  return (
    <div className="min-h-screen bg-pink-50/50 flex">
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex flex-col bg-white bg-opacity-70 backdrop-blur-md border-r border-pink-200 shadow-sm transition-all duration-300",
          sidebarCollapsed ? "w-20" : "w-64"
        )}
      >
        <div className={cn("p-6", sidebarCollapsed && "p-4")}>
          <div className={cn("flex items-center", sidebarCollapsed ? "justify-center" : "gap-2")}>
            <div
              className={`w-8 h-8 rounded-full ${roleColors[userRole]} flex items-center justify-center text-white font-bold`}
            >
              WC
            </div>
            {!sidebarCollapsed && (
              <h1 className="text-xl font-bold text-gray-800">We-Clean</h1>
            )}
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-6 -right-3 h-6 w-6 rounded-full bg-white border border-pink-200 p-0 shadow-sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
        
        <Separator className="bg-pink-100" />
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {currentNavItems.map((item) => (
              <li key={item.name}>
                <TooltipProvider disableHoverableContent={!sidebarCollapsed}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href={item.href}>
                        <div
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative",
                            pathname === item.href
                              ? "bg-pink-100 text-pink-600"
                              : "text-gray-700 hover:bg-pink-50 hover:text-pink-500",
                            sidebarCollapsed && "justify-center px-2"
                          )}
                        >
                          {item.icon}
                          {!sidebarCollapsed && item.name}
                          
                          {item.badge && (
                            <Badge 
                              className={cn(
                                "bg-pink-500 hover:bg-pink-600 text-white", 
                                sidebarCollapsed ? "absolute -top-1 -right-1" : "ml-auto"
                              )}
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      </Link>
                    </TooltipTrigger>
                    {sidebarCollapsed && (
                      <TooltipContent side="right">
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </li>
            ))}
          </ul>
        </nav>
        
        <div className="p-4 mt-auto">
          <Separator className="bg-pink-100 mb-4" />
          <TooltipProvider disableHoverableContent={!sidebarCollapsed}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={handleSignOut}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-500 cursor-pointer",
                    sidebarCollapsed && "justify-center px-2"
                  )}
                >
                  <LogOut className="h-5 w-5" />
                  {!sidebarCollapsed && "Sign Out"}
                </div>
              </TooltipTrigger>
              {sidebarCollapsed && (
                <TooltipContent side="right">
                  Sign Out
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </aside>

      {/* Mobile Navigation */}
      <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
        <SheetContent
          side="left"
          className="w-64 bg-white bg-opacity-90 backdrop-blur-md border-r border-pink-200 p-0"
        >
          <div className="p-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full ${roleColors[userRole]} flex items-center justify-center text-white font-bold`}
              >
                WC
              </div>
              <h1 className="text-xl font-bold text-gray-800">We-Clean.app</h1>
            </div>
          </div>
          <Separator className="bg-pink-100" />
          <nav className="flex-1 p-4">
            <ul className="space-y-1">
              {currentNavItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <div
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                        pathname === item.href
                          ? "bg-pink-100 text-pink-600"
                          : "text-gray-700 hover:bg-pink-50 hover:text-pink-500",
                      )}
                    >
                      {item.icon}
                      {item.name}
                      
                      {item.badge && (
                        <Badge className="bg-pink-500 hover:bg-pink-600 text-white ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 mt-auto">
            <Separator className="bg-pink-100 mb-4" />
            <div 
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-500 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white bg-opacity-70 backdrop-blur-md border-b border-pink-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileNavOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <h2 className="text-lg font-medium text-gray-800 hidden sm:block">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative hidden md:flex">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-64 rounded-full pl-8 text-sm border border-pink-200 bg-white bg-opacity-70 focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
              />
            </div>
            
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[110px] border-pink-200 bg-white bg-opacity-70">
                <SelectValue>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {language === "en"
                      ? "English"
                      : language === "es"
                        ? "Español"
                        : "Português"}
                  </div>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="pt">Português</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
              )}
            </Button>

            <Link href="/profile" className="flex items-center gap-3 ml-2">
              <Avatar>
                <AvatarImage src={userAvatar} alt={userName} />
                <AvatarFallback className="bg-pink-100 text-pink-500">
                  {userName
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-gray-800">{userName}</p>
                <p className="text-xs text-gray-500 capitalize">{userRole}</p>
              </div>
            </Link>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gradient-to-br from-pink-50/50 to-white">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}