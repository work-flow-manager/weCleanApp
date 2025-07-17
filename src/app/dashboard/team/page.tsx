import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Team Dashboard - We-Clean.app",
  description: "Team member dashboard for We-Clean platform",
}

export default function TeamDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Team Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card">
          <h3 className="text-lg font-medium">Today's Jobs</h3>
          <p className="mt-2 text-3xl font-bold">4</p>
          <p className="text-sm text-muted-foreground">1 completed, 3 remaining</p>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-medium">Current Status</h3>
          <p className="mt-2 text-3xl font-bold text-accent">Available</p>
          <p className="text-sm text-muted-foreground">Next job at 2:00 PM</p>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-medium">Performance</h3>
          <p className="mt-2 text-3xl font-bold">98%</p>
          <p className="text-sm text-muted-foreground">Based on 32 jobs</p>
        </div>
      </div>
      
      <div className="glass-card">
        <h3 className="text-lg font-medium mb-4">Today's Schedule</h3>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  i === 0 ? "bg-primary text-white" : "glass"
                }`}>
                  {9 + i * 2}:00
                </div>
                <div>
                  <p className="font-medium">Job #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">123 Main St, Apt {i+1}</p>
                </div>
              </div>
              <div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  i === 0 ? "bg-primary text-white" : "glass"
                }`}>
                  {i === 0 ? "Completed" : i === 1 ? "Next" : "Upcoming"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="glass-card">
        <h3 className="text-lg font-medium mb-4">Job Details</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
                <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
                <path d="M12 3v6" />
              </svg>
            </div>
            <p className="font-medium">Standard Cleaning</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <p className="font-medium">123 Main Street, Apt 2</p>
              <p className="text-sm text-muted-foreground">15 minutes away</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Special Instructions</p>
              <p className="text-sm text-muted-foreground">Please focus on kitchen and bathrooms</p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex gap-4">
          <button className="glass-button flex-1">Start Job</button>
          <button className="glass-button flex-1">Navigate</button>
        </div>
      </div>
    </div>
  )
}