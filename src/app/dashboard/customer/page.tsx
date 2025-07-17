import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Customer Dashboard - We-Clean.app",
  description: "Customer dashboard for We-Clean platform",
}

export default function CustomerDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Customer Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="glass-card">
          <h3 className="text-lg font-medium">Next Cleaning</h3>
          <p className="mt-2 text-3xl font-bold">Jul 20</p>
          <p className="text-sm text-muted-foreground">10:00 AM - Standard Cleaning</p>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-medium">Total Cleanings</h3>
          <p className="mt-2 text-3xl font-bold">12</p>
          <p className="text-sm text-muted-foreground">Since January 2025</p>
        </div>
        <div className="glass-card">
          <h3 className="text-lg font-medium">Subscription</h3>
          <p className="mt-2 text-3xl font-bold">Active</p>
          <p className="text-sm text-muted-foreground">Monthly Plan</p>
        </div>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Upcoming Cleanings</h3>
            <button className="glass-button">
              <span>Book New</span>
            </button>
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">
                    {new Date(2025, 6, 20 + i * 7).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">10:00 AM - Standard Cleaning</p>
                </div>
                <div className="flex gap-2">
                  <button className="text-sm text-primary hover:underline">
                    Edit
                  </button>
                  <button className="text-sm text-muted hover:underline">
                    Cancel
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="glass-card">
          <h3 className="text-lg font-medium mb-4">Recent Cleanings</h3>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b pb-2 last:border-0">
                <div>
                  <p className="font-medium">
                    {new Date(2025, 6, 13 - i * 7).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                  <p className="text-sm text-muted-foreground">Standard Cleaning</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg
                      key={j}
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill={j < 5 - i * 0.5 ? "currentColor" : "none"}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-accent"
                    >
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="glass-card">
        <h3 className="text-lg font-medium mb-4">My Properties</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <p className="font-medium">123 Main Street, Apt 2</p>
                <p className="text-sm text-muted-foreground">Primary Residence</p>
              </div>
            </div>
            <button className="glass-button">
              <span>Edit</span>
            </button>
          </div>
        </div>
        <button className="mt-4 flex items-center gap-2 text-sm text-primary hover:underline">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
          Add another property
        </button>
      </div>
    </div>
  )
}