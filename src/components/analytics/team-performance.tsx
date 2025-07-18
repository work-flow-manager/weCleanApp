"use client"

import React from 'react';
import { TeamPerformanceAnalytics } from '@/types/analytics';
import { MetricCard } from './metric-card';
import { ChartCard } from './chart-card';
import { Users, CheckCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/utils';

interface TeamPerformanceProps {
  data?: TeamPerformanceAnalytics;
  isLoading?: boolean;
  className?: string;
}

export function TeamPerformance({ data, isLoading = false, className }: TeamPerformanceProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 border rounded-lg">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40 mt-3" />
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="border rounded-lg p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-[300px] w-full" />
          </div>
          <div className="border rounded-lg p-6">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className={className}>
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MetricCard 
          metric={data.average_rating} 
          icon={<Users className="h-5 w-5 text-primary" />} 
        />
        <MetricCard 
          metric={data.jobs_completed} 
          icon={<CheckCircle className="h-5 w-5 text-primary" />} 
        />
        <MetricCard 
          metric={data.on_time_percentage} 
          icon={<Clock className="h-5 w-5 text-primary" />} 
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <ChartCard 
          title="Team Efficiency Over Time" 
          chartData={data.efficiency_chart} 
          chartType="line" 
        />
        
        <Card>
          <CardHeader>
            <CardTitle>Team Member Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.team_members.map((member) => (
                <div key={member.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{member.jobs_completed} jobs</span>
                          <span>•</span>
                          <span>{formatCurrency(member.revenue_generated)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{member.average_rating.toFixed(1)}</p>
                      <p className="text-sm text-muted-foreground">Rating</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>On-time rate</span>
                      <span>{member.on_time_percentage.toFixed(0)}%</span>
                    </div>
                    <Progress value={member.on_time_percentage} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}