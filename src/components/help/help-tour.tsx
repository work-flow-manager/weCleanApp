"use client"

import React, { useState, useEffect } from 'react';
import { HelpTour as HelpTourType } from '@/types/help';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { HelpService } from '@/lib/services/help-service';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface HelpTourProps {
  tour: HelpTourType;
  onComplete?: () => void;
  onSkip?: () => void;
}

export function HelpTour({ tour, onComplete, onSkip }: HelpTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(true);
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);
  
  const step = tour.steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tour.steps.length - 1;
  
  // Find the target element for the current step
  useEffect(() => {
    const findTarget = () => {
      const target = document.querySelector(step.targetElement);
      if (target instanceof HTMLElement) {
        setTargetElement(target);
      } else {
        // Target not found, retry after a short delay
        setTimeout(findTarget, 500);
      }
    };
    
    findTarget();
    
    return () => {
      setTargetElement(null);
    };
  }, [step.targetElement]);
  
  // Handle next step
  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };
  
  // Handle previous step
  const handlePrevious = () => {
    if (isFirstStep) return;
    setCurrentStep(currentStep - 1);
  };
  
  // Handle skip
  const handleSkip = () => {
    setIsOpen(false);
    if (onSkip) {
      onSkip();
    }
  };
  
  // Handle complete
  const handleComplete = async () => {
    setIsOpen(false);
    
    // Mark tour as completed
    await HelpService.markTourCompleted(tour.id);
    
    if (onComplete) {
      onComplete();
    }
  };
  
  // Position the dialog near the target element
  const getDialogStyle = () => {
    if (!targetElement) return {};
    
    const rect = targetElement.getBoundingClientRect();
    const position = step.position || 'bottom';
    
    switch (position) {
      case 'top':
        return {
          position: 'absolute',
          top: `${rect.top - 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)'
        };
      case 'right':
        return {
          position: 'absolute',
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.right + 10}px`,
          transform: 'translateY(-50%)'
        };
      case 'bottom':
        return {
          position: 'absolute',
          top: `${rect.bottom + 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translateX(-50%)'
        };
      case 'left':
        return {
          position: 'absolute',
          top: `${rect.top + rect.height / 2}px`,
          left: `${rect.left - 10}px`,
          transform: 'translate(-100%, -50%)'
        };
      default:
        return {};
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-md"
        style={getDialogStyle()}
      >
        <DialogHeader>
          <DialogTitle>{step.title}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-sm text-muted-foreground">{step.content}</p>
        </div>
        
        <DialogFooter className="flex justify-between">
          <div>
            {(step.showSkip !== false || isFirstStep) && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip
              </Button>
            )}
          </div>
          
          <div className="flex space-x-2">
            {(step.showPrev !== false && !isFirstStep) && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
            )}
            
            {(step.showNext !== false || !isLastStep) && (
              <Button onClick={handleNext}>
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ChevronRight className="ml-1 h-4 w-4" />}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}