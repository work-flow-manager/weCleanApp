"use client"

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FilterBar, ExportButton, BusinessOverview, TeamPerformance } from '@/components/analytics';
import { AnalyticsFilters, AnalyticsData } from '@/types/analytics';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { useToast } from '@/components/ui/use-toast';
import { format, subDays } from 'date-fns';

export default function AnalyticsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [businessId, setBusinessId] = useState<string>('sample-business-id'); // In a real app, get this from auth context
  
  // Default filters (last 30 days)
  const defaultStartDate = subDays(new Date(), 30);
  const defaultEndDate = new Date();
  
  const [filters, setFilters] = useState<AnalyticsFilters>({
    timeframe: {
      start_date: format(defaultStartDate, 'yyyy-MM-dd'),
      end_date: format(defaultEndDate, 'yyyy-MM-dd')
    }
  });
  
  // Sample team members and service types for the filter bar
  const teamMembers = [
    { id: 'team1', name: 'John Doe' },
    { id: 'team2', name: 'Jane Smith' },
    { id: 'team3', name: 'Mike Johnson' }
  ];
  
  const serviceTypes = [
    { id: 'service1', name: 'Regular Cleaning' },
    { id: 'service2', name: 'Deep Cleaning' },
    { id: 'service3', name: 'Move-out Cleaning' }
  ];
  
  // Fetch analytics data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      try {
        const data = await AnalyticsService.getAnalyticsData(businessId, filters);
        setAnalyticsData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load analytics data. Please try again.',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [businessId, filters, toast]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters: AnalyticsFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">
            Track your business performance and make data-driven decisions
          </p>
        </div>
        
        <ExportButton 
          businessId={businessId} 
          filters={filters} 
        />
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
          <CardDescription>
            Select a date range and filters to analyze your data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FilterBar 
            onFilterChange={handleFilterChange}
            teamMembers={teamMembers}
            serviceTypes={serviceTypes}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="overview">Business Overview</TabsTrigger>
          <TabsTrigger value="team">Team Performance</TabsTrigger>
          <TabsTrigger value="customers">Customer Analytics</TabsTrigger>
          <TabsTrigger value="jobs">Job Analytics</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <BusinessOverview 
            data={analyticsData?.business_overview} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="team">
          <TeamPerformance 
            data={analyticsData?.team_performance} 
            isLoading={isLoading} 
          />
        </TabsContent>
        
        <TabsContent value="customers">
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">Customer analytics coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="jobs">
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">Job analytics coming soon</p>
          </div>
        </TabsContent>
        
        <TabsContent value="financial">
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">Financial analytics coming soon</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}