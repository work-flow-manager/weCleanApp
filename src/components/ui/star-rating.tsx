"use client"

import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating?: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  className?: string;
}

export function StarRating({
  rating = 0,
  maxRating = 5,
  size = 'md',
  color = 'text-amber-400',
  onChange,
  readOnly = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);
  
  // Determine star size based on the size prop
  const starSizeClass = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  }[size];
  
  // Handle mouse enter on a star
  const handleMouseEnter = (index: number) => {
    if (readOnly) return;
    setHoverRating(index);
  };
  
  // Handle mouse leave from the rating component
  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoverRating(0);
  };
  
  // Handle click on a star
  const handleClick = (index: number) => {
    if (readOnly) return;
    
    // If clicking the same star that's already selected, unselect it
    const newRating = rating === index ? 0 : index;
    
    if (onChange) {
      onChange(newRating);
    }
  };
  
  // Generate stars
  const stars = Array.from({ length: maxRating }, (_, i) => {
    const starIndex = i + 1;
    const isFilled = (hoverRating || rating) >= starIndex;
    
    return (
      <Star
        key={i}
        className={cn(
          starSizeClass,
          'transition-all',
          isFilled ? color : 'text-gray-300',
          !readOnly && 'cursor-pointer hover:scale-110'
        )}
        fill={isFilled ? 'currentColor' : 'none'}
        onMouseEnter={() => handleMouseEnter(starIndex)}
        onClick={() => handleClick(starIndex)}
      />
    );
  });
  
  return (
    <div 
      className={cn('flex items-center gap-1', className)}
      onMouseLeave={handleMouseLeave}
    >
      {stars}
    </div>
  );
}