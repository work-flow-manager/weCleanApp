"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Bell, Globe, Search } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";
import { MobileNav } from "./mobile-nav";
import { NavigationItem } from "@/types/navigation";
import { UserRole } from "@/lib/supabase";

interface HeaderProps {
  userRole: UserRole;
  userName: string;
  userAvatar?: string;
  navItems: NavigationItem[];
  onSignOut: () => void;
  roleColor: string;
  notificationCount?: number;
  language?: string;
  onLanguageChange?: (value: string) => void;
}

export function Header({
  userRole,
  userName,
  userAvatar,
  navItems,
  onSignOut,
  roleColor,
  notificationCount = 0,
  language = "en",
  onLanguageChange,
}: HeaderProps) {
  const handleLanguageChange = (value: string) => {
    if (onLanguageChange) {
      onLanguageChange(value);
    }
  };
  
  return (
    <header className="h-16 bg-white bg-opacity-70 backdrop-blur-md border-b border-pink-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <MobileNav 
          items={navItems} 
          userRole={userRole} 
          onSignOut={onSignOut} 
          roleColor={roleColor}
        />
        
        <div className="hidden sm:block">
          <Breadcrumb homeHref={`/dashboard/${userRole}`} />
        </div>
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
        
        <Select value={language} onValueChange={handleLanguageChange}>
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
  );
}