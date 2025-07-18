"use client"

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AnalyticsMetric } from '@/types/analytics';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  metric: AnalyticsMetric;
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ metric, icon, className }: MetricCardProps) {
  // Determine trend color
  const getTrendColor = () => {
    if (!metric.trend) return 'text-muted-foreground';
    
    switch (metric.trend) {
      case 'up':
        return 'text-emerald-500';
      case 'down':
        return 'text-rose-500';
      default:
        return 'text-muted-foreground';
    }
  };
  
  // Determine trend icon
  const getTrendIcon = () => {
    if (!metric.trend) return <MinusIcon className="h-4 w-4" />;
    
    switch (metric.trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4" />;
      default:
        return <MinusIcon className="h-4 w-4" />;
    }
  };
  
  // Format change value
  const formatChange = () => {
    if (metric.change === undefined) return '';
    return `${metric.change > 0 ? '+' : ''}${metric.change}%`;
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {metric.name}
            </p>
            <h3 className="text-2xl font-bold mt-1">
              {metric.value}
            </h3>
          </div>
          
          {icon && (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        
        {metric.change !== undefined && (
          <div className={cn("flex items-center mt-3 text-sm", getTrendColor())}>
            {getTrendIcon()}
            <span className="ml-1">{formatChange()}</span>
            <span className="ml-1 text-muted-foreground">vs. previous period</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}