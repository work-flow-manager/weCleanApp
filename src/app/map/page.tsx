import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Map - We-Clean.app",
  description: "View job locations on a map",
}

export default function MapPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Map View</h1>
        <div className="flex gap-2">
          <button className="glass-button">
            <span>Today</span>
          </button>
          <button className="glass-button">
            <span>This Week</span>
          </button>
        </div>
      </div>
      <div className="glass-card h-[600px] flex items-center justify-center">
        <p className="text-muted-foreground">Map will be loaded here using MapLibre GL</p>
      </div>
    </div>
  )
}