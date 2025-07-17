import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Team - We-Clean.app",
  description: "Manage your cleaning team",
}

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <button className="glass-button">
          <span>Add Team Member</span>
        </button>
      </div>
      <div className="glass-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Role</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Jobs Today</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="px-4 py-2">Team Member {i + 1}</td>
                  <td className="px-4 py-2">Cleaner</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-accent px-2 py-1 text-xs font-medium">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-2">{i + 1}</td>
                  <td className="px-4 py-2 text-right">
                    <button className="text-sm text-primary hover:underline">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}