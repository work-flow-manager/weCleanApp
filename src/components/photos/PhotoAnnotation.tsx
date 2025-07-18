"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Maximize2, X, Save, Trash2, Plus, Edit, Check } from "lucide-react";

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
}

interface PhotoAnnotationProps {
  imageUrl: string;
  initialAnnotations?: Annotation[];
  onSave?: (annotations: Annotation[]) => void;
  readOnly?: boolean;
  className?: string;
}

export default function PhotoAnnotation({
  imageUrl,
  initialAnnotations = [],
  onSave,
  readOnly = false,
  className = "",
}: PhotoAnnotationProps) {
  const [annotations, setAnnotations] = useState<Annotation[]>(initialAnnotations);
  const [selectedAnnotation, setSelectedAnnotation] = useState<string | null>(null);
  const [editingAnnotation, setEditingAnnotation] = useState<string | null>(null);
  const [annotationText, setAnnotationText] = useState<string>("");
  const [fullscreen, setFullscreen] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Load image and set dimensions
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setIsLoaded(true);
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Reset changes flag when annotations change externally
  useEffect(() => {
    setAnnotations(initialAnnotations);
    setHasChanges(false);
  }, [initialAnnotations]);

  // Handle image click to add annotation
  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (readOnly) return;
    
    // Get click position relative to the image
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Create new annotation
    const newAnnotation: Annotation = {
      id: `annotation-${Date.now()}`,
      x,
      y,
      text: "",
    };
    
    setAnnotations([...annotations, newAnnotation]);
    setSelectedAnnotation(newAnnotation.id);
    setEditingAnnotation(newAnnotation.id);
    setAnnotationText("");
    setHasChanges(true);
  };

  // Handle annotation click
  const handleAnnotationClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSelectedAnnotation(id === selectedAnnotation ? null : id);
  };

  // Handle annotation edit
  const handleEditAnnotation = (id: string) => {
    const annotation = annotations.find(a => a.id === id);
    if (annotation) {
      setEditingAnnotation(id);
      setAnnotationText(annotation.text);
    }
  };

  // Handle annotation save
  const handleSaveAnnotation = () => {
    if (!editingAnnotation) return;
    
    setAnnotations(annotations.map(a => 
      a.id === editingAnnotation ? { ...a, text: annotationText } : a
    ));
    
    setEditingAnnotation(null);
    setHasChanges(true);
  };

  // Handle annotation delete
  const handleDeleteAnnotation = (id: string) => {
    setAnnotations(annotations.filter(a => a.id !== id));
    setSelectedAnnotation(null);
    setEditingAnnotation(null);
    setHasChanges(true);
  };

  // Handle save all annotations
  const handleSaveAll = () => {
    if (onSave) {
      onSave(annotations);
      setHasChanges(false);
      
      toast({
        title: "Annotations Saved",
        description: "Your annotations have been saved successfully.",
      });
    }
  };

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Photo Annotations</span>
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
          <div
            ref={containerRef}
            className="relative w-full h-[300px] overflow-hidden rounded-md cursor-crosshair"
            onClick={handleImageClick}
          >
            {!isLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            )}
            
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Annotated image"
              className="w-full h-full object-contain"
            />
            
            {/* Annotations */}
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className={`absolute w-6 h-6 -ml-3 -mt-3 rounded-full flex items-center justify-center cursor-pointer ${
                  selectedAnnotation === annotation.id
                    ? "bg-pink-500 text-white"
                    : "bg-white text-pink-500 border-2 border-pink-500"
                }`}
                style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                onClick={(e) => handleAnnotationClick(e, annotation.id)}
              >
                {annotation.text ? (
                  <span className="text-xs font-bold">{annotations.indexOf(annotation) + 1}</span>
                ) : (
                  <Plus className="h-3 w-3" />
                )}
              </div>
            ))}
          </div>
          
          {/* Annotation details */}
          {selectedAnnotation && (
            <div className="mt-4 p-3 border rounded-md">
              {editingAnnotation === selectedAnnotation ? (
                <div className="space-y-2">
                  <Label htmlFor="annotation-text">Annotation Text</Label>
                  <div className="flex gap-2">
                    <Input
                      id="annotation-text"
                      value={annotationText}
                      onChange={(e) => setAnnotationText(e.target.value)}
                      placeholder="Enter annotation text..."
                      autoFocus
                    />
                    <Button
                      size="icon"
                      onClick={handleSaveAnnotation}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">
                      Annotation {annotations.findIndex(a => a.id === selectedAnnotation) + 1}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {annotations.find(a => a.id === selectedAnnotation)?.text || "No text"}
                    </div>
                  </div>
                  
                  {!readOnly && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAnnotation(selectedAnnotation)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAnnotation(selectedAnnotation)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {!selectedAnnotation && annotations.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              Click on a marker to view or edit its annotation.
              {!readOnly && " Click anywhere on the image to add a new annotation."}
            </div>
          )}
          
          {annotations.length === 0 && (
            <div className="mt-4 text-sm text-muted-foreground text-center">
              {readOnly
                ? "No annotations have been added to this image."
                : "Click anywhere on the image to add an annotation."}
            </div>
          )}
        </CardContent>
        
        {!readOnly && onSave && (
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleSaveAll}
              disabled={!hasChanges}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Annotations
            </Button>
          </CardFooter>
        )}
      </Card>
      
      {/* Fullscreen dialog */}
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="sm:max-w-4xl p-0">
          <DialogHeader className="p-4 flex flex-row items-center justify-between">
            <DialogTitle>Photo Annotations</DialogTitle>
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
              <div
                className="relative w-full h-[500px] overflow-hidden rounded-md cursor-crosshair"
                onClick={handleImageClick}
              >
                <img
                  src={imageUrl}
                  alt="Annotated image"
                  className="w-full h-full object-contain"
                />
                
                {/* Annotations */}
                {annotations.map((annotation) => (
                  <div
                    key={annotation.id}
                    className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center cursor-pointer ${
                      selectedAnnotation === annotation.id
                        ? "bg-pink-500 text-white"
                        : "bg-white text-pink-500 border-2 border-pink-500"
                    }`}
                    style={{ left: `${annotation.x}%`, top: `${annotation.y}%` }}
                    onClick={(e) => handleAnnotationClick(e, annotation.id)}
                  >
                    {annotation.text ? (
                      <span className="text-sm font-bold">{annotations.indexOf(annotation) + 1}</span>
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </div>
                ))}
              </div>
              
              {/* Annotation details */}
              {selectedAnnotation && (
                <div className="p-4 border rounded-md">
                  {editingAnnotation === selectedAnnotation ? (
                    <div className="space-y-2">
                      <Label htmlFor="fullscreen-annotation-text">Annotation Text</Label>
                      <div className="flex gap-2">
                        <Input
                          id="fullscreen-annotation-text"
                          value={annotationText}
                          onChange={(e) => setAnnotationText(e.target.value)}
                          placeholder="Enter annotation text..."
                          autoFocus
                        />
                        <Button
                          onClick={handleSaveAnnotation}
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-medium">
                          Annotation {annotations.findIndex(a => a.id === selectedAnnotation) + 1}
                        </div>
                        <div className="text-muted-foreground mt-1">
                          {annotations.find(a => a.id === selectedAnnotation)?.text || "No text"}
                        </div>
                      </div>
                      
                      {!readOnly && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditAnnotation(selectedAnnotation)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteAnnotation(selectedAnnotation)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {!readOnly && onSave && (
                <div className="flex justify-end">
                  <Button
                    onClick={handleSaveAll}
                    disabled={!hasChanges}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Annotations
                  </Button>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}