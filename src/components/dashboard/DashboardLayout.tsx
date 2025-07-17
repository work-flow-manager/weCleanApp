"use client";

import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
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
} from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userRole?: "admin" | "manager" | "team" | "customer";
  userName?: string;
  userAvatar?: string;
}

export default function DashboardLayout({
  children,
  userRole = "admin",
  userName = "Jane Doe",
  userAvatar = "",
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [language, setLanguage] = useState("en");

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
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
      { name: "Jobs", href: "/jobs", icon: <Calendar className="h-5 w-5" /> },
      { name: "Team", href: "/team", icon: <Users className="h-5 w-5" /> },
      {
        name: "Analytics",
        href: "/analytics",
        icon: <BarChart3 className="h-5 w-5" />,
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
      { name: "Jobs", href: "/jobs", icon: <Calendar className="h-5 w-5" /> },
      { name: "Team", href: "/team", icon: <Users className="h-5 w-5" /> },
      {
        name: "Analytics",
        href: "/analytics",
        icon: <BarChart3 className="h-5 w-5" />,
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
        icon: <Calendar className="h-5 w-5" />,
      },
      { name: "Map", href: "/map", icon: <MapPin className="h-5 w-5" /> },
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
      { name: "Track", href: "/track", icon: <MapPin className="h-5 w-5" /> },
      {
        name: "History",
        href: "/history",
        icon: <BarChart3 className="h-5 w-5" />,
      },
      {
        name: "Messages",
        href: "/messages",
        icon: <MessageSquare className="h-5 w-5" />,
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

  return (
    <div className="min-h-screen bg-pink-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white bg-opacity-70 backdrop-blur-md border-r border-pink-200 shadow-sm">
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
                <Link href={item.href}>
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
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="p-4 mt-auto">
            <Separator className="bg-pink-100 mb-4" />
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-500 cursor-pointer">
              <LogOut className="h-5 w-5" />
              Sign Out
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white bg-opacity-70 backdrop-blur-md border-b border-pink-200 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileNavOpen(true)}
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
            </Sheet>
            <h2 className="text-lg font-medium text-gray-800 hidden sm:block">
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)} Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-2">
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
              <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></span>
            </Button>

            <div className="flex items-center gap-3 ml-2">
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
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-gradient-to-br from-pink-50 to-white">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
