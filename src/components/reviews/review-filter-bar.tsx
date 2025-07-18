"use client"

import React, { useState } from 'react';
import { ReviewFilters } from '@/types/review';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { CalendarIcon, Filter, Star, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReviewFilterBarProps {
  filters: ReviewFilters;
  onFilterChange: (filters: ReviewFilters) => void;
  className?: string;
}

export function ReviewFilterBar({ 
  filters, 
  onFilterChange,
  className 
}: ReviewFilterBarProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    filters.start_date && filters.end_date
      ? {
          from: new Date(filters.start_date),
          to: new Date(filters.end_date),
        }
      : undefined
  );
  
  // Handle rating filter change
  const handleRatingChange = (value: string) => {
    if (value === 'all') {
      onFilterChange({
        ...filters,
        min_rating: undefined,
        max_rating: undefined,
      });
    } else {
      const rating = parseInt(value, 10);
      onFilterChange({
        ...filters,
        min_rating: rating,
        max_rating: rating,
      });
    }
  };
  
  // Handle response filter change
  const handleResponseChange = (value: string) => {
    if (value === 'all') {
      onFilterChange({
        ...filters,
        has_response: undefined,
      });
    } else {
      onFilterChange({
        ...filters,
        has_response: value === 'with_response',
      });
    }
  };
  
  // Handle date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    
    if (range?.from) {
      onFilterChange({
        ...filters,
        start_date: format(range.from, 'yyyy-MM-dd'),
        end_date: range.to ? format(range.to, 'yyyy-MM-dd') : undefined,
      });
    } else {
      onFilterChange({
        ...filters,
        start_date: undefined,
        end_date: undefined,
      });
    }
  };
  
  // Clear all filters
  const clearFilters = () => {
    setDateRange(undefined);
    onFilterChange({
      job_id: filters.job_id, // Preserve job_id filter if it was set initially
      customer_id: filters.customer_id, // Preserve customer_id filter if it was set initially
    });
  };
  
  // Check if any filters are active
  const hasActiveFilters = 
    filters.min_rating !== undefined || 
    filters.has_response !== undefined || 
    filters.start_date !== undefined;
  
  // Get current rating filter value
  const getRatingFilterValue = () => {
    if (filters.min_rating === undefined) return 'all';
    return filters.min_rating.toString();
  };
  
  // Get current response filter value
  const getResponseFilterValue = () => {
    if (filters.has_response === undefined) return 'all';
    return filters.has_response ? 'with_response' : 'without_response';
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {/* Rating Filter */}
      <div>
        <Select
          value={getRatingFilterValue()}
          onValueChange={handleRatingChange}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All Ratings" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Ratings</SelectItem>
            <SelectItem value="5">
              <div className="flex items-center">
                <span>5</span>
                <Star className="h-3 w-3 ml-1 fill-amber-400 text-amber-400" />
                <span className="ml-1">only</span>
              </div>
            </SelectItem>
            <SelectItem value="4">
              <div className="flex items-center">
                <span>4</span>
                <Star className="h-3 w-3 ml-1 fill-amber-400 text-amber-400" />
                <span className="ml-1">only</span>
              </div>
            </SelectItem>
            <SelectItem value="3">
              <div className="flex items-center">
                <span>3</span>
                <Star className="h-3 w-3 ml-1 fill-amber-400 text-amber-400" />
                <span className="ml-1">only</span>
              </div>
            </SelectItem>
            <SelectItem value="2">
              <div className="flex items-center">
                <span>2</span>
                <Star className="h-3 w-3 ml-1 fill-amber-400 text-amber-400" />
                <span className="ml-1">only</span>
              </div>
            </SelectItem>
            <SelectItem value="1">
              <div className="flex items-center">
                <span>1</span>
                <Star className="h-3 w-3 ml-1 fill-amber-400 text-amber-400" />
                <span className="ml-1">only</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Response Filter */}
      <div>
        <Select
          value={getResponseFilterValue()}
          onValueChange={handleResponseChange}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Reviews" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reviews</SelectItem>
            <SelectItem value="with_response">With Responses</SelectItem>
            <SelectItem value="without_response">Without Responses</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Date Range Filter */}
      <div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[240px] justify-start text-left font-normal",
                !dateRange && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Select date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9"
        >
          <X className="h-4 w-4 mr-1" />
          Clear filters
        </Button>
      )}
    </div>
  );
}