"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, ArrowRight, Maximize2, X } from "lucide-react";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeCaption?: string;
  afterCaption?: string;
  className?: string;
}

export default function BeforeAfterSlider({
  beforeImage,
  afterImage,
  beforeCaption = "Before",
  afterCaption = "After",
  className = "",
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);
  const [containerHeight, setContainerHeight] = useState<number>(0);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Update container dimensions when images load or window resizes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    // Create image elements to get dimensions
    const beforeImg = new Image();
    const afterImg = new Image();
    let loadedCount = 0;

    const onImageLoad = () => {
      loadedCount++;
      if (loadedCount === 2) {
        setIsLoaded(true);
        updateDimensions();
      }
    };

    beforeImg.onload = onImageLoad;
    afterImg.onload = onImageLoad;

    beforeImg.src = beforeImage;
    afterImg.src = afterImage;

    // Add resize listener
    window.addEventListener("resize", updateDimensions);

    // Clean up
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, [beforeImage, afterImage]);

  // Handle slider change
  const handleSliderChange = (value: number[]) => {
    setSliderPosition(value[0]);
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Before & After Comparison</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFullscreen(true)}
            >
              <Maximize2 className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-4">
            <div
              ref={containerRef}
              className="relative w-full h-[300px] overflow-hidden rounded-md"
            >
              {!isLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
                </div>
              )}
              
              {/* After image (full width) */}
              <div className="absolute inset-0">
                <img
                  src={afterImage}
                  alt={afterCaption}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Before image (clipped by slider) */}
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPosition}%` }}
              >
                <img
                  src={beforeImage}
                  alt={beforeCaption}
                  className="w-full h-full object-cover"
                  style={{ width: containerWidth > 0 ? (100 / sliderPosition) * 100 + "%" : "200%" }}
                />
              </div>
              
              {/* Slider line */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                style={{ left: `${sliderPosition}%` }}
              ></div>
              
              {/* Slider handle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-ew-resize"
                style={{ left: `${sliderPosition}%`, transform: "translate(-50%, -50%)" }}
              >
                <div className="flex items-center">
                  <ArrowLeft className="h-3 w-3 text-gray-600" />
                  <ArrowRight className="h-3 w-3 text-gray-600" />
                </div>
              </div>
              
              {/* Labels */}
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {beforeCaption}
              </div>
              <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {afterCaption}
              </div>
            </div>
            
            <Slider
              value={[sliderPosition]}
              min={0}
              max={100}
              step={1}
              onValueChange={handleSliderChange}
            />
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>{beforeCaption}</div>
              <div>{afterCaption}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Fullscreen dialog */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="sm:max-w-4xl p-0">
          <DialogHeader className="p-4 flex flex-row items-center justify-between">
            <DialogTitle>Before & After Comparison</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFullscreen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          <div className="p-4">
            <div className="space-y-4">
              <div className="relative w-full h-[500px] overflow-hidden rounded-md">
                {/* After image (full width) */}
                <div className="absolute inset-0">
                  <img
                    src={afterImage}
                    alt={afterCaption}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Before image (clipped by slider) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPosition}%` }}
                >
                  <img
                    src={beforeImage}
                    alt={beforeCaption}
                    className="w-full h-full object-cover"
                    style={{ width: "200%" }}
                  />
                </div>
                
                {/* Slider line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_5px_rgba(0,0,0,0.5)]"
                  style={{ left: `${sliderPosition}%` }}
                ></div>
                
                {/* Slider handle */}
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-[0_0_5px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-ew-resize"
                  style={{ left: `${sliderPosition}%`, transform: "translate(-50%, -50%)" }}
                >
                  <div className="flex items-center">
                    <ArrowLeft className="h-3 w-3 text-gray-600" />
                    <ArrowRight className="h-3 w-3 text-gray-600" />
                  </div>
                </div>
                
                {/* Labels */}
                <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1.5 rounded-full">
                  {beforeCaption}
                </div>
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1.5 rounded-full">
                  {afterCaption}
                </div>
              </div>
              
              <Slider
                value={[sliderPosition]}
                min={0}
                max={100}
                step={1}
                onValueChange={handleSliderChange}
              />
              
              <div className="flex justify-between text-sm text-muted-foreground">
                <div>{beforeCaption}</div>
                <div>{afterCaption}</div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}