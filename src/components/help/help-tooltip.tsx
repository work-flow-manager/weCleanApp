"use client"

import React, { useState, useEffect, useRef } from 'react';
import { HelpTooltip as HelpTooltipType } from '@/types/help';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpTooltipProps {
  tooltip: HelpTooltipType;
  onDismiss?: (tooltipId: string) => void;
  className?: string;
}

export function HelpTooltip({ tooltip, onDismiss, className }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const targetRef = useRef<HTMLElement | null>(null);
  
  // Find the target element
  useEffect(() => {
    const findTarget = () => {
      const target = document.querySelector(tooltip.targetElement);
      if (target instanceof HTMLElement) {
        targetRef.current = target;
        setIsVisible(true);
        
        // Show tooltip after delay if specified
        if (tooltip.showDelay) {
          setTimeout(() => {
            setIsOpen(true);
          }, tooltip.showDelay);
        }
      } else {
        // Target not found, retry after a short delay
        setTimeout(findTarget, 500);
      }
    };
    
    findTarget();
    
    return () => {
      setIsVisible(false);
    };
  }, [tooltip.targetElement, tooltip.showDelay]);
  
  // Handle dismiss
  const handleDismiss = () => {
    setIsOpen(false);
    if (onDismiss) {
      onDismiss(tooltip.id);
    }
  };
  
  // If target element not found, don't render anything
  if (!isVisible || !targetRef.current) {
    return null;
  }
  
  // Create a portal to render the tooltip
  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <div className={cn("help-tooltip", className)}>
          <TooltipTrigger asChild>
            <div className="absolute inset-0 pointer-events-none" />
          </TooltipTrigger>
          <TooltipContent
            side={tooltip.position || 'top'}
            className="p-4 max-w-xs"
          >
            {tooltip.title && (
              <div className="font-medium mb-1">{tooltip.title}</div>
            )}
            <div className="text-sm">{tooltip.content}</div>
            
            {tooltip.dismissable !== false && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1 right-1 h-6 w-6 p-0"
                onClick={handleDismiss}
              >
                <X className="h-3 w-3" />
                <span className="sr-only">Dismiss</span>
              </Button>
            )}
          </TooltipContent>
        </div>
      </Tooltip>
    </TooltipProvider>
  );
}