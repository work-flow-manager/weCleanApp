"use client"

import React, { useState, useEffect } from 'react';
import { HelpContext, HelpTooltip as HelpTooltipType, HelpTour as HelpTourType } from '@/types/help';
import { HelpService } from '@/lib/services/help-service';
import { ContextualHelpPanel } from './contextual-help-panel';
import { HelpTooltip } from './help-tooltip';
import { HelpTour } from './help-tour';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpButtonProps {
  context: HelpContext;
  className?: string;
}

export function HelpButton({ context, className }: HelpButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltips, setTooltips] = useState<HelpTooltipType[]>([]);
  const [tour, setTour] = useState<HelpTourType | null>(null);
  
  // Fetch tooltips and tour
  useEffect(() => {
    const fetchHelpContent = async () => {
      try {
        // Fetch tooltips
        const tooltips = await HelpService.getTooltips({
          page: context.page,
          section: context.section,
          role: context.role
        });
        
        setTooltips(tooltips);
        
        // Fetch tour
        const tour = await HelpService.getTour(context.page, context.role);
        setTour(tour);
      } catch (error) {
        console.error('Error fetching help content:', error);
      }
    };
    
    fetchHelpContent();
  }, [context]);
  
  // Handle tooltip dismiss
  const handleTooltipDismiss = (tooltipId: string) => {
    setTooltips(tooltips.filter(t => t.id !== tooltipId));
  };
  
  // Handle tour complete
  const handleTourComplete = () => {
    setTour(null);
  };
  
  // Handle tour skip
  const handleTourSkip = () => {
    setTour(null);
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn("rounded-full", className)}
            aria-label="Help"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="sm:max-w-md">
          <ContextualHelpPanel context={context} />
        </SheetContent>
      </Sheet>
      
      {/* Render tooltips */}
      {tooltips.map(tooltip => (
        <HelpTooltip
          key={tooltip.id}
          tooltip={tooltip}
          onDismiss={handleTooltipDismiss}
        />
      ))}
      
      {/* Render tour */}
      {tour && (
        <HelpTour
          tour={tour}
          onComplete={handleTourComplete}
          onSkip={handleTourSkip}
        />
      )}
    </>
  );
}