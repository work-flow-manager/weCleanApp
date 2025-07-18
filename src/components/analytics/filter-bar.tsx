"use client"

import React, { useState } from 'react';
import { DateRangePicker } from './date-range-picker';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRange } from 'react-day-picker';
import { AnalyticsFilters } from '@/types/analytics';
import { FilterIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  onFilterChange: (filters: AnalyticsFilters) => void;
  teamMembers?: { id: string; name: string }[];
  serviceTypes?: { id: string; name: string }[];
  locations?: { id: string; name: string }[];
  isLoading?: boolean;
  className?: string;
}

export function FilterBar({
  onFilterChange,
  teamMembers = [],
  serviceTypes = [],
  locations = [],
  isLoading = false,
  className
}: FilterBarProps) {
  // Default to last 30 days
  const defaultStartDate = new Date();
  defaultStartDate.setDate(defaultStartDate.getDate() - 30);
  
  const [dateRange, setDateRange] = useState<DateRange>({
    from: defaultStartDate,
    to: new Date()
  });
  
  const [teamMemberId, setTeamMemberId] = useState<string>('all');
  const [serviceTypeId, setServiceTypeId] = useState<string>('all');
  const [locationId, setLocationId] = useState<string>('all');
  
  // Apply filters
  const applyFilters = () => {
    if (!dateRange.from || !dateRange.to) return;
    
    const filters: AnalyticsFilters = {
      timeframe: {
        start_date: format(dateRange.from, 'yyyy-MM-dd'),
        end_date: format(dateRange.to, 'yyyy-MM-dd')
      }
    };
    
    // Add team member filter
    if (teamMemberId !== 'all') {
      filters.team_member_ids = [teamMemberId];
    }
    
    // Add service type filter
    if (serviceTypeId !== 'all') {
      filters.service_type_ids = [serviceTypeId];
    }
    
    // Add location filter
    if (locationId !== 'all') {
      filters.location_ids = [locationId];
    }
    
    onFilterChange(filters);
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row gap-4">
        <DateRangePicker onChange={handleDateRangeChange} />
        
        <div className="flex flex-1 flex-col sm:flex-row gap-2">
          {teamMembers.length > 0 && (
            <Select value={teamMemberId} onValueChange={setTeamMemberId}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Team Members" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Team Members</SelectItem>
                {teamMembers.map(member => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {serviceTypes.length > 0 && (
            <Select value={serviceTypeId} onValueChange={setServiceTypeId}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Service Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Service Types</SelectItem>
                {serviceTypes.map(service => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {locations.length > 0 && (
            <Select value={locationId} onValueChange={setLocationId}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="All Locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location.id} value={location.id}>
                    {location.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          <Button 
            className="w-full sm:w-auto sm:ml-auto" 
            onClick={applyFilters}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FilterIcon className="mr-2 h-4 w-4" />
            )}
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}