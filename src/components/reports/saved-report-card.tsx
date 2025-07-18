"use client"

import React from 'react';
import { SavedReport } from '@/types/report';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { FileText, MoreVertical, Download, Trash2, Calendar } from 'lucide-react';
import { formatDistanceToNow, isAfter } from 'date-fns';
import { formatBytes } from '@/lib/utils';

interface SavedReportCardProps {
  report: SavedReport;
  onDownload: (report: SavedReport) => void;
  onDelete: (reportId: string) => void;
}

export function SavedReportCard({
  report,
  onDownload,
  onDelete
}: SavedReportCardProps) {
  // Format date as relative time (e.g., "2 days ago")
  const formattedDate = formatDistanceToNow(new Date(report.generated_at), { addSuffix: true });
  
  // Check if report is expired
  const isExpired = report.expires_at && isAfter(new Date(), new Date(report.expires_at));
  
  // Format file size
  const formattedSize = formatBytes(report.size);
  
  // Get format badge color
  const getFormatColor = () => {
    switch (report.format) {
      case 'pdf':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'csv':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'excel':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{report.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onDownload(report)} disabled={isExpired}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(report.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="text-sm text-muted-foreground">
          Generated {formattedDate}
        </div>
      </CardHeader>
      <CardContent>
        {report.description && (
          <p className="text-sm text-muted-foreground mb-4">
            {report.description}
          </p>
        )}
        
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getFormatColor()}>
            {report.format.toUpperCase()}
          </Badge>
          
          <Badge variant="outline">
            {formattedSize}
          </Badge>
          
          {isExpired && (
            <Badge variant="outline" className="bg-amber-100 text-amber-800">
              Expired
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={() => onDownload(report)}
          disabled={isExpired}
        >
          <Download className="mr-2 h-4 w-4" />
          Download Report
        </Button>
      </CardFooter>
    </Card>
  );
}