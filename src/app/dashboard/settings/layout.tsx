"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { 
  Paintbrush, 
  Building, 
  Globe, 
  User, 
  Bell, 
  Lock, 
  Settings as SettingsIcon 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  
  // Check if user is admin
  const isAdmin = user?.role === "admin";
  
  const navItems = [
    {
      title: "Account",
      href: "/dashboard/settings/account",
      icon: <User className="h-4 w-4" />,
      active: pathname === "/dashboard/settings/account",
    },
    {
      title: "Theme",
      href: "/dashboard/settings/theme",
      icon: <Paintbrush className="h-4 w-4" />,
      active: pathname === "/dashboard/settings/theme",
    },
    {
      title: "Branding",
      href: "/dashboard/settings/branding",
      icon: <Building className="h-4 w-4" />,
      active: pathname === "/dashboard/settings/branding",
      adminOnly: true,
    },
    {
      title: "Language",
      href: "/dashboard/settings/language",
      icon: <Globe className="h-4 w-4" />,
      active: pathname === "/dashboard/settings/language",
    },
    {
      title: "Notifications",
      href: "/dashboard/settings/notifications",
      icon: <Bell className="h-4 w-4" />,
      active: pathname === "/dashboard/settings/notifications",
    },
    {
      title: "Security",
      href: "/dashboard/settings/security",
      icon: <Lock className="h-4 w-4" />,
      active: pathname === "/dashboard/settings/security",
    },
    {
      title: "General",
      href: "/dashboard/settings/general",
      icon: <SettingsIcon className="h-4 w-4" />,
      active: pathname === "/dashboard/settings/general",
    },
  ];

  return (
    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[250px_1fr]">
      <aside className="hidden w-[200px] flex-col md:flex lg:w-[250px]">
        <nav className="grid items-start gap-2">
          {navItems.map((item) => {
            // Skip admin-only items for non-admin users
            if (item.adminOnly && !isAdmin) return null;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  item.active
                    ? "bg-muted hover:bg-muted"
                    : "hover:bg-transparent hover:underline",
                  "justify-start"
                )}
              >
                {item.icon}
                <span className="ml-2">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}