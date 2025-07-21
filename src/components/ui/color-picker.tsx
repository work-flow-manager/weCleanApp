"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(color);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Update input value when color prop changes
  useEffect(() => {
    setInputValue(color);
  }, [color]);
  
  // Handle color input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Validate hex color
    if (/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(value)) {
      onChange(value);
    }
  };
  
  // Handle color picker change
  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onChange(value);
  };
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-8 h-8 rounded-md border border-input flex items-center justify-center"
            style={{ backgroundColor: color }}
            aria-label="Pick a color"
          >
            <span className="sr-only">Pick a color</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3" align="start">
          <div className="flex flex-col gap-2">
            <input
              type="color"
              value={inputValue}
              onChange={handleColorPickerChange}
              className="w-32 h-32 cursor-pointer"
            />
          </div>
        </PopoverContent>
      </Popover>
      
      <Input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className="w-24 font-mono"
        maxLength={7}
      />
    </div>
  );
}