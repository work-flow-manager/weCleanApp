"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ArrowUpIcon,
  ArrowDownIcon,
  Users,
  Calendar,
  DollarSign,
  Star,
  Clock,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
};

type StatCardsProps = {
  role?: "admin" | "manager" | "team" | "customer";
  className?: string;
};

const StatCard = ({
  title,
  value,
  description,
  icon,
  trend,
  className,
}: StatCardProps) => {
  return (
    <Card
      className={cn(
        "overflow-hidden bg-white/20 backdrop-blur-md border border-pink-200/50 shadow-md",
        className,
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-baseline">
              <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
              {trend && (
                <span
                  className={cn(
                    "ml-2 flex items-center text-xs font-medium",
                    trend.isPositive ? "text-green-600" : "text-red-600",
                  )}
                >
                  {trend.isPositive ? (
                    <ArrowUpIcon className="mr-1 h-3 w-3" />
                  ) : (
                    <ArrowDownIcon className="mr-1 h-3 w-3" />
                  )}
                  {trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-xs text-gray-500">{description}</p>
            )}
          </div>
          <div className="rounded-full bg-pink-100 p-3">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

const StatCards = ({ role = "admin", className }: StatCardsProps) => {
  // Default stats for when no role is provided or role doesn't match
  let stats: StatCardProps[] = [
    {
      title: "Total Jobs",
      value: "0",
      icon: <Calendar className="h-5 w-5 text-pink-500" />,
      description: "All time",
    },
    {
      title: "Active Jobs",
      value: "0",
      icon: <Clock className="h-5 w-5 text-pink-500" />,
      description: "In progress",
    },
    {
      title: "Team Members",
      value: "0",
      icon: <Users className="h-5 w-5 text-pink-500" />,
      description: "Currently active",
    },
    {
      title: "Revenue",
      value: "$0",
      icon: <DollarSign className="h-5 w-5 text-pink-500" />,
      description: "This month",
    },
  ];

  // Role-specific stats
  switch (role) {
    case "admin":
      stats = [
        {
          title: "Total Revenue",
          value: "$24,567",
          icon: <DollarSign className="h-5 w-5 text-pink-500" />,
          trend: { value: 12, isPositive: true },
          description: "This month",
        },
        {
          title: "Active Jobs",
          value: "42",
          icon: <Calendar className="h-5 w-5 text-pink-500" />,
          trend: { value: 8, isPositive: true },
          description: "Currently in progress",
        },
        {
          title: "Team Members",
          value: "18",
          icon: <Users className="h-5 w-5 text-pink-500" />,
          description: "Across all locations",
        },
        {
          title: "Customer Satisfaction",
          value: "4.8",
          icon: <Star className="h-5 w-5 text-amber-400" />,
          trend: { value: 3, isPositive: true },
          description: "Average rating",
        },
      ];
      break;

    case "manager":
      stats = [
        {
          title: "Team Performance",
          value: "92%",
          icon: <CheckCircle className="h-5 w-5 text-pink-500" />,
          trend: { value: 5, isPositive: true },
          description: "Completion rate",
        },
        {
          title: "Scheduled Jobs",
          value: "28",
          icon: <Calendar className="h-5 w-5 text-pink-500" />,
          description: "Next 7 days",
        },
        {
          title: "Team Availability",
          value: "8/12",
          icon: <Users className="h-5 w-5 text-pink-500" />,
          description: "Available today",
        },
        {
          title: "Issues Reported",
          value: "3",
          icon: <AlertTriangle className="h-5 w-5 text-amber-400" />,
          trend: { value: 2, isPositive: false },
          description: "Needs attention",
        },
      ];
      break;

    case "team":
      stats = [
        {
          title: "Today's Jobs",
          value: "4",
          icon: <Calendar className="h-5 w-5 text-pink-500" />,
          description: "2 completed, 2 remaining",
        },
        {
          title: "Performance Score",
          value: "95%",
          icon: <CheckCircle className="h-5 w-5 text-pink-500" />,
          trend: { value: 3, isPositive: true },
          description: "Last 30 days",
        },
        {
          title: "Customer Ratings",
          value: "4.9",
          icon: <Star className="h-5 w-5 text-amber-400" />,
          description: "From 28 reviews",
        },
        {
          title: "Hours Logged",
          value: "32.5",
          icon: <Clock className="h-5 w-5 text-pink-500" />,
          description: "This week",
        },
      ];
      break;

    case "customer":
      stats = [
        {
          title: "Scheduled Cleanings",
          value: "2",
          icon: <Calendar className="h-5 w-5 text-pink-500" />,
          description: "Upcoming appointments",
        },
        {
          title: "Total Spent",
          value: "$450",
          icon: <DollarSign className="h-5 w-5 text-pink-500" />,
          description: "Last 3 months",
        },
        {
          title: "Service History",
          value: "8",
          icon: <CheckCircle className="h-5 w-5 text-pink-500" />,
          description: "Completed cleanings",
        },
        {
          title: "Loyalty Points",
          value: "240",
          icon: <Star className="h-5 w-5 text-amber-400" />,
          description: "Redeem for discounts",
        },
      ];
      break;
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className,
      )}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

export default StatCards;
