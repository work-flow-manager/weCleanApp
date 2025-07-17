import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Manager Dashboard - We-Clean.app",
  description: "Manager dashboard for We-Clean platform",
}

export default function ManagerDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manager Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card">
          <h3 className="text-lg font-medium">Today's Jobs</h3>
          <p className="mt-2 text-3xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">3 completed, 9 remaining</p>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-medium">Team Members</h3>
          <p className="mt-2 text-3xl font-bold">8</p>
          <p className="text-sm text-muted-foreground">6 active today</p>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-medium">Customer Satisfaction</h3>
          <p className="mt-2 text-3xl font-bold">4.8/5</p>
          <p className="text-sm text-muted-foreground">Based on 45 reviews</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card">
          <h3 className="text-lg font-medium mb-4">Today's Schedule</h3>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">Job #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">123 Main St, Apt {i+1}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{9 + i}:00 AM</p>
                  <p className="text-sm text-muted-foreground">Team {(i % 3) + 1}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-primary hover:underline">
            View full schedule
          </button>
        </div>
        
        <div className="glass-card">
          <h3 className="text-lg font-medium mb-4">Team Status</h3>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary"></div>
                  <div>
                    <p className="font-medium">Team Member {i + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      {i % 2 === 0 ? "On job #10" + (i+1) : "Available"}
                    </p>
                  </div>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                  i % 2 === 0 ? "bg-accent" : "bg-primary text-white"
                }`}>
                  {i % 2 === 0 ? "Busy" : "Available"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}