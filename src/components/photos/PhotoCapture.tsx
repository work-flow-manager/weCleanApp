"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { Camera, Image, RefreshCw, X, Check, Upload } from "lucide-react";

interface PhotoCaptureProps {
  onCapture: (file: File) => void;
  onCancel?: () => void;
  aspectRatio?: "square" | "4:3" | "16:9";
  facingMode?: "user" | "environment";
  allowUpload?: boolean;
  className?: string;
}

export default function PhotoCapture({
  onCapture,
  onCancel,
  aspectRatio = "4:3",
  facingMode = "environment",
  allowUpload = true,
  className = "",
}: PhotoCaptureProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate dimensions based on aspect ratio
  const getDimensions = () => {
    switch (aspectRatio) {
      case "square":
        return { width: 480, height: 480 };
      case "16:9":
        return { width: 640, height: 360 };
      case "4:3":
      default:
        return { width: 640, height: 480 };
    }
  };

  const { width, height } = getDimensions();

  // Initialize camera
  const initializeCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      
      // Get new stream
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height }
        },
        audio: false
      });
      
      setStream(newStream);
      
      // Set video source
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access camera. Please ensure you have granted camera permissions.");
    } finally {
      setIsLoading(false);
    }
  };

  // Switch camera
  const switchCamera = () => {
    const newFacingMode = facingMode === "user" ? "environment" : "user";
    facingMode = newFacingMode;
    initializeCamera();
  };

  // Capture photo
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(dataUrl);
      
      // Stop the stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  // Retake photo
  const retakePhoto = () => {
    setCapturedImage(null);
    initializeCamera();
  };

  // Confirm photo
  const confirmPhoto = () => {
    if (!capturedImage || !canvasRef.current) return;
    
    // Convert data URL to File
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: "image/jpeg" });
        onCapture(file);
      } else {
        toast({
          title: "Error",
          description: "Failed to process the captured image.",
          variant: "destructive",
        });
      }
    }, "image/jpeg", 0.8);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB.",
        variant: "destructive",
      });
      return;
    }
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCapturedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
    
    // Pass the file to the parent
    onCapture(file);
  };

  // Initialize camera on mount
  useEffect(() => {
    initializeCamera();
    
    // Clean up on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative">
          {/* Video preview */}
          {!capturedImage && (
            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto"
                style={{ aspectRatio: aspectRatio === "square" ? "1/1" : aspectRatio === "16:9" ? "16/9" : "4/3" }}
              />
              
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                </div>
              )}
              
              {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 p-4">
                  <p className="text-white text-center mb-4">{error}</p>
                  <Button onClick={initializeCamera}>
                    Retry
                  </Button>
                </div>
              )}
            </div>
          )}
          
          {/* Captured image preview */}
          {capturedImage && (
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-auto"
                style={{ aspectRatio: aspectRatio === "square" ? "1/1" : aspectRatio === "16:9" ? "16/9" : "4/3" }}
              />
            </div>
          )}
          
          {/* Canvas for capturing (hidden) */}
          <canvas
            ref={canvasRef}
            className="hidden"
            width={width}
            height={height}
          />
          
          {/* File input for upload (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          
          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center gap-4 bg-gradient-to-t from-black/70 to-transparent">
            {!capturedImage ? (
              <>
                {/* Camera controls */}
                {onCancel && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/20 hover:bg-white/40 backdrop-blur-sm border-white/20"
                    onClick={onCancel}
                  >
                    <X className="h-5 w-5 text-white" />
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/20 hover:bg-white/40 backdrop-blur-sm border-white/20"
                  onClick={capturePhoto}
                  disabled={isLoading || !!error}
                >
                  <Camera className="h-5 w-5 text-white" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/20 hover:bg-white/40 backdrop-blur-sm border-white/20"
                  onClick={switchCamera}
                  disabled={isLoading || !!error}
                >
                  <RefreshCw className="h-5 w-5 text-white" />
                </Button>
                
                {allowUpload && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="bg-white/20 hover:bg-white/40 backdrop-blur-sm border-white/20"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                  >
                    <Upload className="h-5 w-5 text-white" />
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* Image preview controls */}
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/20 hover:bg-white/40 backdrop-blur-sm border-white/20"
                  onClick={retakePhoto}
                >
                  <X className="h-5 w-5 text-white" />
                </Button>
                
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-white/20 hover:bg-white/40 backdrop-blur-sm border-white/20"
                  onClick={confirmPhoto}
                >
                  <Check className="h-5 w-5 text-white" />
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}