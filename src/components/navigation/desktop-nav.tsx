"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { UserRole } from "@/lib/supabase";
import { NavigationItem } from "@/types/navigation";

interface DesktopNavProps {
  items: NavigationItem[];
  userRole: UserRole;
  onSignOut: () => void;
  roleColor: string;
}

export function DesktopNav({
  items,
  userRole,
  onSignOut,
  roleColor,
}: DesktopNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <aside 
      className={cn(
        "hidden md:flex flex-col bg-white bg-opacity-70 backdrop-blur-md border-r border-pink-200 shadow-sm transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      <div className={cn("p-6", collapsed && "p-4")}>
        <div className={cn("flex items-center", collapsed ? "justify-center" : "gap-2")}>
          <div
            className={`w-8 h-8 rounded-full ${roleColor} flex items-center justify-center text-white font-bold`}
          >
            WC
          </div>
          {!collapsed && (
            <h1 className="text-xl font-bold text-gray-800">We-Clean</h1>
          )}
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="sm" 
        className="absolute top-6 -right-3 h-6 w-6 rounded-full bg-white border border-pink-200 p-0 shadow-sm"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
      
      <Separator className="bg-pink-100" />
      
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              <TooltipProvider disableHoverableContent={!collapsed}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={item.href}>
                      <div
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors relative",
                          pathname === item.href
                            ? "bg-pink-100 text-pink-600"
                            : "text-gray-700 hover:bg-pink-50 hover:text-pink-500",
                          collapsed && "justify-center px-2"
                        )}
                      >
                        {item.icon}
                        {!collapsed && item.name}
                        
                        {item.badge && (
                          <Badge 
                            className={cn(
                              "bg-pink-500 hover:bg-pink-600 text-white", 
                              collapsed ? "absolute -top-1 -right-1" : "ml-auto"
                            )}
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  </TooltipTrigger>
                  {collapsed && (
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
        <TooltipProvider disableHoverableContent={!collapsed}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={onSignOut}
                className={cn(
                  "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-500 cursor-pointer",
                  collapsed && "justify-center px-2"
                )}
              >
                <LogOut className="h-5 w-5" />
                {!collapsed && "Sign Out"}
              </div>
            </TooltipTrigger>
            {collapsed && (
              <TooltipContent side="right">
                Sign Out
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </div>
    </aside>
  );
}