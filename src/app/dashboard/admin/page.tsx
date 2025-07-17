import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Dashboard - We-Clean.app",
  description: "Admin dashboard for We-Clean platform",
}

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card">
          <h3 className="text-lg font-medium">Total Jobs</h3>
          <p className="mt-2 text-3xl font-bold">248</p>
          <p className="text-sm text-muted-foreground">+12% from last month</p>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-medium">Active Teams</h3>
          <p className="mt-2 text-3xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">+2 new this month</p>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-medium">Customers</h3>
          <p className="mt-2 text-3xl font-bold">156</p>
          <p className="text-sm text-muted-foreground">+8 new this month</p>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-medium">Revenue</h3>
          <p className="mt-2 text-3xl font-bold">$24,500</p>
          <p className="text-sm text-muted-foreground">+18% from last month</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card">
          <h3 className="text-lg font-medium mb-4">Recent Jobs</h3>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">Job #{1000 + i}</p>
                  <p className="text-sm text-muted-foreground">123 Main St, Apt {i+1}</p>
                </div>
                <span className="rounded-full bg-accent px-2 py-1 text-xs font-medium">
                  {i % 2 === 0 ? "Completed" : "Scheduled"}
                </span>
              </div>
            ))}
          </div>
          <button className="mt-4 text-sm text-primary hover:underline">
            View all jobs
          </button>
        </div>
        
        <div className="glass-card">
          <h3 className="text-lg font-medium mb-4">Team Performance</h3>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary"></div>
                  <p>Team {i + 1}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-gray-200">
                    <div 
                      className="h-2 rounded-full bg-primary" 
                      style={{ width: `${(5-i) * 20}%` }}
                    ></div>
                  </div>
                  <span>{(5-i) * 20}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}