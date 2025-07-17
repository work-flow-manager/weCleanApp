"use client";

import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, X, Download, ZoomIn, ZoomOut } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  type: string;
  caption?: string;
}

interface PhotoGalleryProps {
  photos: Photo[];
  className?: string;
}

export function PhotoGallery({ photos, className }: PhotoGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
    setZoom(1);
  };

  const closeLightbox = () => {
    setSelectedPhoto(null);
    setZoom(1);
  };

  const goToPrevious = () => {
    const newIndex = (currentIndex - 1 + photos.length) % photos.length;
    setSelectedPhoto(photos[newIndex]);
    setCurrentIndex(newIndex);
    setZoom(1);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % photos.length;
    setSelectedPhoto(photos[newIndex]);
    setCurrentIndex(newIndex);
    setZoom(1);
  };

  const handleDownload = () => {
    if (!selectedPhoto) return;
    
    // Create a temporary anchor element
    const a = document.createElement("a");
    a.href = selectedPhoto.url;
    a.download = `job-photo-${selectedPhoto.type}-${selectedPhoto.id}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5));
  };

  // Group photos by type
  const photosByType = photos.reduce((acc, photo) => {
    if (!acc[photo.type]) {
      acc[photo.type] = [];
    }
    acc[photo.type].push(photo);
    return acc;
  }, {} as Record<string, Photo[]>);

  // Sort types in a logical order
  const typeOrder = ["before", "in-progress", "after", "issue", "other"];
  const sortedTypes = Object.keys(photosByType).sort(
    (a, b) => typeOrder.indexOf(a) - typeOrder.indexOf(b)
  );

  const typeColors: Record<string, string> = {
    before: "bg-blue-100 text-blue-800 border-blue-200",
    "in-progress": "bg-amber-100 text-amber-800 border-amber-200",
    after: "bg-green-100 text-green-800 border-green-200",
    issue: "bg-red-100 text-red-800 border-red-200",
    other: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <div className={className}>
      {sortedTypes.map(type => (
        <div key={type} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Badge className={typeColors[type] || "bg-gray-100"}>
              {type.charAt(0).toUpperCase() + type.slice(1)} Photos
            </Badge>
            <span className="text-sm text-gray-500">
              ({photosByType[type].length} {photosByType[type].length === 1 ? "photo" : "photos"})
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {photosByType[type].map((photo, index) => (
              <div 
                key={photo.id} 
                className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-pink-100"
                onClick={() => openLightbox(photo, photos.indexOf(photo))}
              >
                <img 
                  src={photo.url} 
                  alt={photo.caption || `${type} photo`} 
                  className="object-cover w-full h-full"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Lightbox */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => closeLightbox()}>
        <DialogContent className="max-w-4xl w-[90vw] h-[80vh] p-0 bg-black/95 border-none">
          <div className="relative w-full h-full flex flex-col">
            {/* Lightbox header */}
            <div className="flex justify-between items-center p-4 text-white">
              <div>
                {selectedPhoto && (
                  <div className="flex items-center gap-2">
                    <Badge className={typeColors[selectedPhoto.type] || "bg-gray-100"}>
                      {selectedPhoto.type.charAt(0).toUpperCase() + selectedPhoto.type.slice(1)}
                    </Badge>
                    <span className="text-sm">
                      {currentIndex + 1} of {photos.length}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={handleZoomOut} className="text-white hover:bg-white/10">
                  <ZoomOut className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleZoomIn} className="text-white hover:bg-white/10">
                  <ZoomIn className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleDownload} className="text-white hover:bg-white/10">
                  <Download className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={closeLightbox} className="text-white hover:bg-white/10">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Lightbox content */}
            <div className="flex-1 flex items-center justify-center overflow-hidden">
              {selectedPhoto && (
                <div 
                  className="relative w-full h-full flex items-center justify-center overflow-auto"
                  style={{ padding: zoom > 1 ? '2rem' : '0' }}
                >
                  <img 
                    src={selectedPhoto.url} 
                    alt={selectedPhoto.caption || "Photo"} 
                    className="max-h-full transition-transform duration-200"
                    style={{ 
                      transform: `scale(${zoom})`,
                      cursor: zoom > 1 ? 'move' : 'default'
                    }}
                  />
                </div>
              )}
            </div>
            
            {/* Navigation buttons */}
            <div className="absolute inset-y-0 left-0 flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
                className="h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50 ml-4"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className="h-12 w-12 rounded-full bg-black/30 text-white hover:bg-black/50 mr-4"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </div>
            
            {/* Caption */}
            {selectedPhoto?.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4">
                <p>{selectedPhoto.caption}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}