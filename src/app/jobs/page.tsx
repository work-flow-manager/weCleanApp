import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Jobs - We-Clean.app",
  description: "Manage your cleaning jobs",
}

export default function JobsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Jobs</h1>
        <button className="glass-button">
          <span>New Job</span>
        </button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass-card">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Job #{i + 1001}</h3>
              <span className="rounded-full bg-accent px-2 py-1 text-xs font-medium">
                Scheduled
              </span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              123 Main Street, Apt {i + 1}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm">July {i + 20}, 2025</span>
              <button className="text-sm text-primary hover:underline">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}