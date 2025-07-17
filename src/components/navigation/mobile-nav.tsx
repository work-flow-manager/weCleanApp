"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Menu, LogOut } from "lucide-react";
import { UserRole } from "@/lib/supabase";
import { NavigationItem } from "@/types/navigation";

interface MobileNavProps {
  items: NavigationItem[];
  userRole: UserRole;
  onSignOut: () => void;
  roleColor: string;
}

export function MobileNav({
  items,
  userRole,
  onSignOut,
  roleColor,
}: MobileNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="w-64 bg-white bg-opacity-90 backdrop-blur-md border-r border-pink-200 p-0"
      >
        <div className="p-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full ${roleColor} flex items-center justify-center text-white font-bold`}
            >
              WC
            </div>
            <h1 className="text-xl font-bold text-gray-800">We-Clean.app</h1>
          </div>
        </div>
        
        <Separator className="bg-pink-100" />
        
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
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
            onClick={() => {
              onSignOut();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-pink-50 hover:text-pink-500 cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}