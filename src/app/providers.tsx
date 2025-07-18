"use client";

import React from "react";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { RealtimeProvider } from "@/contexts/realtime-context";
import { NotificationProvider } from "@/contexts/notification-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <RealtimeProvider>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </RealtimeProvider>
    </ThemeProvider>
  );
}