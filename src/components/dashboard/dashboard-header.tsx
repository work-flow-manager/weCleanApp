"use client";

import React from "react";
import { cn } from "@/lib/utils";
import LanguageSelector from "@/components/language-selector";

interface DashboardHeaderProps {
  heading: string;
  text?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function DashboardHeader({
  heading,
  text,
  children,
  icon,
  className,
}: DashboardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between pb-4", className)}>
      <div className="grid gap-1">
        <div className="flex items-center gap-2">
          {icon && <div className="flex items-center">{icon}</div>}
          <h1 className="text-2xl font-bold tracking-tight">{heading}</h1>
        </div>
        {text && <p className="text-muted-foreground">{text}</p>}
      </div>
      <div className="flex items-center gap-2">
        <LanguageSelector />
        {children}
      </div>
    </div>
  );
}