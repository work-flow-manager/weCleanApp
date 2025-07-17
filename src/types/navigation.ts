import { ReactNode } from "react";

export interface NavigationItem {
  name: string;
  href: string;
  icon: ReactNode;
  badge?: number;
  roles?: string[];
}