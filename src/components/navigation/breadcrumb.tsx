"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  className?: string;
  homeHref?: string;
  separator?: React.ReactNode;
}

export function Breadcrumb({
  className,
  homeHref = "/",
  separator = <ChevronRight className="h-4 w-4 text-muted-foreground" />,
}: BreadcrumbProps) {
  const pathname = usePathname();
  
  // Skip rendering breadcrumbs on the home page
  if (pathname === "/") return null;
  
  // Generate breadcrumb segments
  const segments = pathname
    .split("/")
    .filter(Boolean)
    .map((segment, index, array) => {
      // Build the href for this segment
      const href = `/${array.slice(0, index + 1).join("/")}`;
      
      // Format the segment name
      const name = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());
      
      return { name, href };
    });
  
  return (
    <nav
      className={cn(
        "flex items-center text-sm text-muted-foreground",
        className
      )}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href={homeHref}
            className="flex items-center hover:text-foreground transition-colors"
          >
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        
        {segments.map((segment, index) => (
          <Fragment key={segment.href}>
            <li className="flex items-center">
              {separator}
            </li>
            <li>
              {index === segments.length - 1 ? (
                <span className="font-medium text-foreground">
                  {segment.name}
                </span>
              ) : (
                <Link
                  href={segment.href}
                  className="hover:text-foreground transition-colors"
                >
                  {segment.name}
                </Link>
              )}
            </li>
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}