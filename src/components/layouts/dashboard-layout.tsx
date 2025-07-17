'use client'

import { useState } from 'react'
import { Bell, Menu, Search } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { UserRole } from '@/lib/supabase'

interface DashboardLayoutProps {
  children: React.ReactNode
  userRole?: UserRole
}

export function DashboardLayout({
  children,
  userRole = 'admin',
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={cn(
          "fixed inset-y-0 z-50 transition-all lg:relative",
          sidebarOpen ? "left-0" : "-left-64"
        )}
      >
        <Sidebar userRole={userRole} />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="glass-navbar flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
            <div className="relative hidden md:flex">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="glass-input w-64 rounded-full pl-8 text-sm"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary"></span>
              <span className="sr-only">Notifications</span>
            </Button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}