"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { PhotoUploadResult } from "@/lib/services/photoUpload";

interface PhotoLightboxProps {
  photos: PhotoUploadResult[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PhotoLightbox({
  photos,
  initialIndex = 0,
  open,
  onOpenChange,
}: PhotoLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // Reset zoom and rotation when photo changes
  const resetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  // Navigate to previous photo
  const prevPhoto = () => {
    resetView();
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  // Navigate to next photo
  const nextPhoto = () => {
    resetView();
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  // Zoom in
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  };

  // Zoom out
  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  };

  // Rotate image
  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  // Download image
  const downloadImage = () => {
    if (photos.length === 0) return;
    
    const photo = photos[currentIndex];
    
    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = `photo_${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download Started",
      description: "Your photo download has started.",
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        prevPhoto();
        break;
      case "ArrowRight":
        nextPhoto();
        break;
      case "Escape":
        onOpenChange(false);
        break;
      default:
        break;
    }
  };

  // Current photo
  const currentPhoto = photos.length > 0 ? photos[currentIndex] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[90vw] h-[90vh] p-0 bg-black/90 border-gray-800"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="p-4 flex flex-row items-center justify-between bg-black/50 absolute top-0 left-0 right-0 z-10">
          <DialogTitle className="text-white">
            {currentPhoto?.caption || `Photo ${currentIndex + 1} of ${photos.length}`}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="flex items-center justify-center h-full">
          {photos.length === 0 ? (
            <div className="text-white">No photos to display</div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Image */}
              <div
                className="flex items-center justify-center w-full h-full overflow-hidden"
                style={{ cursor: zoomLevel > 1 ? "move" : "default" }}
              >
                <img
                  src={currentPhoto?.url}
                  alt={currentPhoto?.caption || "Photo"}
                  className="max-w-full max-h-full object-contain transition-transform duration-200"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  }}
                />
              </div>
              
              {/* Navigation buttons */}
              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                    onClick={prevPhoto}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20 h-12 w-12"
                    onClick={nextPhoto}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                </>
              )}
              
              {/* Controls */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/50 rounded-full px-4 py-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={zoomOut}
                  disabled={zoomLevel <= 0.5}
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <div className="text-white text-sm w-12 text-center">
                  {Math.round(zoomLevel * 100)}%
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={zoomIn}
                  disabled={zoomLevel >= 3}
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <div className="w-px h-6 bg-white/20 mx-2"></div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={rotateImage}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={downloadImage}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Photo info */}
              {currentPhoto?.category && (
                <div className="absolute top-16 right-4 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full">
                  {currentPhoto.category}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}