import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Chat - We-Clean.app",
  description: "Chat with your team and customers",
}

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Chat</h1>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="glass-card md:col-span-1">
          <div className="mb-4">
            <input
              type="search"
              placeholder="Search conversations..."
              className="glass-input w-full"
            />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 cursor-pointer ${
                  i === 0 ? "bg-primary bg-opacity-10" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Contact {i + 1}</p>
                      <span className="text-xs text-muted-foreground">
                        {i === 0 ? "Just now" : `${i}h ago`}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      Latest message preview...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-card flex flex-col h-[600px] md:col-span-2">
          <div className="border-b p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary"></div>
              <div>
                <p className="font-medium">Contact 1</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="flex justify-end">
              <div className="rounded-lg bg-primary p-3 text-white max-w-[80%]">
                <p>Hello! How can I help you today?</p>
                <p className="text-xs text-right mt-1 opacity-70">10:30 AM</p>
              </div>
            </div>
            <div className="flex justify-start">
              <div className="rounded-lg glass max-w-[80%] p-3">
                <p>I have a question about my scheduled cleaning.</p>
                <p className="text-xs text-right mt-1 opacity-70">10:32 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="rounded-lg bg-primary p-3 text-white max-w-[80%]">
                <p>Of course! What would you like to know?</p>
                <p className="text-xs text-right mt-1 opacity-70">10:33 AM</p>
              </div>
            </div>
          </div>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="glass-input flex-1"
              />
              <button className="glass-button">Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}