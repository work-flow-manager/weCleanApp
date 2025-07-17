import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings - We-Clean.app",
  description: "Manage your account settings",
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="glass-card">
          <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                type="text"
                className="glass-input w-full"
                defaultValue="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="glass-input w-full"
                defaultValue="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                className="glass-input w-full"
                defaultValue="(555) 123-4567"
              />
            </div>
            <button className="glass-button">Save Changes</button>
          </div>
        </div>
        <div className="glass-card">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select className="glass-input w-full">
                <option>System</option>
                <option>Light</option>
                <option>Dark</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Notifications
              </label>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="email-notifications" defaultChecked />
                <label htmlFor="email-notifications">Email notifications</label>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="sms-notifications" defaultChecked />
                <label htmlFor="sms-notifications">SMS notifications</label>
              </div>
            </div>
          </div>
        </div>
        <div className="glass-card md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Current Password
              </label>
              <input type="password" className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input type="password" className="glass-input w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <input type="password" className="glass-input w-full" />
            </div>
            <button className="glass-button">Update Password</button>
          </div>
        </div>
      </div>
    </div>
  )
}