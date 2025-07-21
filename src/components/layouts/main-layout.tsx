'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sidebar } from '@/components/sidebar'
import { UserRole } from '@/lib/supabase'

interface MainLayoutProps {
  children: React.ReactNode
  userRole?: UserRole
}

export function MainLayout({
  children,
  userRole = 'admin',
}: MainLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  // Check if the current page is an auth page
  const isAuthPage = pathname.startsWith('/auth')

  // If it's an auth page, don't show the sidebar
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <div
        className={`fixed inset-y-0 z-50 transition-all lg:relative ${
          sidebarOpen ? 'left-0' : '-left-64'
        }`}
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
            <div className="text-lg font-semibold">
              {(() => {
                const lastSegment = pathname.split('/').pop() || '';
                return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1) : 'Dashboard';
              })()}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  )
}