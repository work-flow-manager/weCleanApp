"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn("grid items-start gap-8", className)}>
      {children}
    </div>
  );
}