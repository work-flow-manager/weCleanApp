"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Calendar,
  ClipboardList,
  Home,
  LayoutDashboard,
  Map,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

type SidebarProps = {
  userRole?: "admin" | "manager" | "team" | "customer"
}

export function Sidebar({ userRole = "admin" }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    {
      title: "Dashboard",
      href: `/dashboard/${userRole}`,
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["admin", "manager", "team", "customer"],
    },
    {
      title: "Jobs",
      href: "/jobs",
      icon: <ClipboardList className="h-5 w-5" />,
      roles: ["admin", "manager", "team", "customer"],
    },
    {
      title: "Schedule",
      href: "/schedule",
      icon: <Calendar className="h-5 w-5" />,
      roles: ["admin", "manager", "team", "customer"],
    },
    {
      title: "Map",
      href: "/map",
      icon: <Map className="h-5 w-5" />,
      roles: ["admin", "manager", "team"],
    },
    {
      title: "Team",
      href: "/team",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin", "manager"],
    },
    {
      title: "Chat",
      href: "/chat",
      icon: <MessageSquare className="h-5 w-5" />,
      roles: ["admin", "manager", "team", "customer"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin", "manager", "team", "customer"],
    },
  ]

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  )

  return (
    <div
      className={cn(
        "glass-sidebar flex h-screen flex-col justify-between transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4">
          {!collapsed && (
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-full bg-primary p-1">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">We-Clean</span>
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="mx-auto">
              <div className="rounded-full bg-primary p-1">
                <Home className="h-5 w-5 text-white" />
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={() => setCollapsed(!collapsed)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={cn(
                "h-4 w-4 transition-all",
                collapsed ? "rotate-180" : "rotate-0"
              )}
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Button>
        </div>
        <div className="mt-8 flex flex-col gap-2 px-2">
          {filteredNavItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant={pathname === item.href ? "default" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : ""
                )}
              >
                {item.icon}
                {!collapsed && <span className="ml-2">{item.title}</span>}
              </Button>
            </Link>
          ))}
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary"></div>
              <div>
                <p className="text-sm font-medium">User Name</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}