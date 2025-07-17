"use client";

import React, { useState } from "react";
import { X, Check, ChevronDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";

interface FilterOptions {
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
  teamMembers: string[];
  serviceTypes: string[];
}

interface TeamMember {
  id: string;
  name: string;
}

interface ServiceType {
  id: string;
  name: string;
}

interface JobsFilterPanelProps {
  onFilterChange: (filters: FilterOptions) => void;
  teamMembers: TeamMember[];
  serviceTypes: ServiceType[];
  activeFilters: FilterOptions;
}

export default function JobsFilterPanel({
  onFilterChange,
  teamMembers,
  serviceTypes,
  activeFilters,
}: JobsFilterPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(activeFilters);

  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
  };

  const applyFilters = () => {
    onFilterChange(filters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const emptyFilters: FilterOptions = {
      status: [],
      dateRange: { start: "", end: "" },
      teamMembers: [],
      serviceTypes: [],
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setIsOpen(false);
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.teamMembers.length > 0) count++;
    if (filters.serviceTypes.length > 0) count++;
    return count;
  };

  const toggleStatus = (status: string) => {
    if (filters.status.includes(status)) {
      handleFilterChange({
        status: filters.status.filter((s) => s !== status),
      });
    } else {
      handleFilterChange({
        status: [...filters.status, status],
      });
    }
  };

  const toggleTeamMember = (id: string) => {
    if (filters.teamMembers.includes(id)) {
      handleFilterChange({
        teamMembers: filters.teamMembers.filter((m) => m !== id),
      });
    } else {
      handleFilterChange({
        teamMembers: [...filters.teamMembers, id],
      });
    }
  };

  const toggleServiceType = (id: string) => {
    if (filters.serviceTypes.includes(id)) {
      handleFilterChange({
        serviceTypes: filters.serviceTypes.filter((s) => s !== id),
      });
    } else {
      handleFilterChange({
        serviceTypes: [...filters.serviceTypes, id],
      });
    }
  };

  return (
    <div>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="border-pink-200/50 hover:bg-pink-50 flex items-center"
          >
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
            {getActiveFilterCount() > 0 && (
              <Badge className="ml-2 bg-pink-500 text-white">
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 border-b border-pink-100">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Filter Jobs</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="h-8 text-gray-500 hover:text-gray-700"
              >
                Reset
              </Button>
            </div>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="status">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  Status
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {["scheduled", "in-progress", "completed", "cancelled", "issue"].map(
                      (status) => (
                        <div
                          key={status}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`status-${status}`}
                            checked={filters.status.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                          />
                          <Label
                            htmlFor={`status-${status}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {status.charAt(0).toUpperCase() +
                              status.slice(1).replace("-", " ")}
                          </Label>
                        </div>
                      )
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="date">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  Date Range
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3">
                    <div className="grid gap-2">
                      <Label htmlFor="start-date" className="text-sm">
                        Start Date
                      </Label>
                      <Input
                        id="start-date"
                        type="date"
                        className="border-pink-200/50"
                        value={filters.dateRange.start}
                        onChange={(e) =>
                          handleFilterChange({
                            dateRange: {
                              ...filters.dateRange,
                              start: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end-date" className="text-sm">
                        End Date
                      </Label>
                      <Input
                        id="end-date"
                        type="date"
                        className="border-pink-200/50"
                        value={filters.dateRange.end}
                        onChange={(e) =>
                          handleFilterChange({
                            dateRange: {
                              ...filters.dateRange,
                              end: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="team">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  Team Members
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`team-${member.id}`}
                          checked={filters.teamMembers.includes(member.id)}
                          onCheckedChange={() => toggleTeamMember(member.id)}
                        />
                        <Label
                          htmlFor={`team-${member.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {member.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="service">
                <AccordionTrigger className="py-2 text-sm font-medium">
                  Service Types
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    {serviceTypes.map((service) => (
                      <div
                        key={service.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`service-${service.id}`}
                          checked={filters.serviceTypes.includes(service.id)}
                          onCheckedChange={() => toggleServiceType(service.id)}
                        />
                        <Label
                          htmlFor={`service-${service.id}`}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {service.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="p-4 border-t border-pink-100 flex justify-end">
            <Button
              className="bg-pink-500 hover:bg-pink-600 text-white"
              onClick={applyFilters}
            >
              Apply Filters
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {getActiveFilterCount() > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {filters.status.length > 0 && (
            <Badge className="bg-pink-100 text-pink-800 border-pink-200 flex items-center gap-1">
              Status: {filters.status.length}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange({ status: [] })}
              />
            </Badge>
          )}
          
          {(filters.dateRange.start || filters.dateRange.end) && (
            <Badge className="bg-pink-100 text-pink-800 border-pink-200 flex items-center gap-1">
              Date Range
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() =>
                  handleFilterChange({
                    dateRange: { start: "", end: "" },
                  })
                }
              />
            </Badge>
          )}
          
          {filters.teamMembers.length > 0 && (
            <Badge className="bg-pink-100 text-pink-800 border-pink-200 flex items-center gap-1">
              Team: {filters.teamMembers.length}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange({ teamMembers: [] })}
              />
            </Badge>
          )}
          
          {filters.serviceTypes.length > 0 && (
            <Badge className="bg-pink-100 text-pink-800 border-pink-200 flex items-center gap-1">
              Services: {filters.serviceTypes.length}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => handleFilterChange({ serviceTypes: [] })}
              />
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-6 text-xs text-gray-500 hover:text-gray-700 px-2"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}