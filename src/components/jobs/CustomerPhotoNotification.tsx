"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { BeforeAfterSlider } from "@/components/photos";
import { Loader2, Mail, CheckCircle2, Image } from "lucide-react";
import { PhotoUploadResult } from "@/lib/services/photoUpload";

interface CustomerPhotoNotificationProps {
  jobId: string;
  customerName: string;
  customerEmail: string;
  photos: PhotoUploadResult[];
  isLoading?: boolean;
  onSend?: (data: CustomerNotificationData) => Promise<boolean>;
  className?: string;
}

export interface CustomerNotificationData {
  jobId: string;
  includePhotos: boolean;
  includeBeforeAfter: boolean;
  message: string;
}

export default function CustomerPhotoNotification({
  jobId,
  customerName,
  customerEmail,
  photos,
  isLoading = false,
  onSend,
  className = "",
}: CustomerPhotoNotificationProps) {
  const [includePhotos, setIncludePhotos] = useState<boolean>(true);
  const [includeBeforeAfter, setIncludeBeforeAfter] = useState<boolean>(true);
  const [message, setMessage] = useState<string>(
    `Dear ${customerName},\n\nWe've completed the cleaning service at your property. Please find attached before and after photos showing the results of our work.\n\nIf you have any questions or feedback, please don't hesitate to contact us.\n\nThank you for choosing our services.`
  );
  const [isSending, setIsSending] = useState<boolean>(false);

  // Get before and after photos
  const beforePhotos = photos.filter(photo => photo.category === "before");
  const afterPhotos = photos.filter(photo => photo.category === "after");

  // Check if we have photos to send
  const hasBeforePhotos = beforePhotos.length > 0;
  const hasAfterPhotos = afterPhotos.length > 0;
  const hasPhotos = photos.length > 0;
  const hasBeforeAfterPair = hasBeforePhotos && hasAfterPhotos;

  // Handle send notification
  const handleSend = async () => {
    if (!message.trim()) {
      toast({
        title: "Message Required",
        description: "Please enter a message to send to the customer.",
        variant: "destructive",
      });
      return;
    }
    
    if (includePhotos && !hasPhotos) {
      toast({
        title: "No Photos Available",
        description: "There are no photos available to include in the notification.",
        variant: "destructive",
      });
      return;
    }
    
    if (includeBeforeAfter && !hasBeforeAfterPair) {
      toast({
        title: "No Before/After Pairs",
        description: "There are no before/after photo pairs available to include in the notification.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      if (onSend) {
        const success = await onSend({
          jobId,
          includePhotos,
          includeBeforeAfter,
          message,
        });
        
        if (success) {
          toast({
            title: "Notification Sent",
            description: `Notification sent to ${customerEmail}`,
          });
        } else {
          throw new Error("Failed to send notification");
        }
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-pink-500" />
          Customer Photo Notification
        </CardTitle>
        <CardDescription>
          Send a notification with job completion photos to the customer
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : (
          <>
            {/* Customer info */}
            <div className="p-4 rounded-md bg-blue-50 border border-blue-100">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Notification Recipient</h4>
                  <p className="text-sm text-blue-700">
                    {customerName} ({customerEmail})
                  </p>
                </div>
              </div>
            </div>
            
            {/* Photo options */}
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="include-photos"
                  checked={includePhotos}
                  onCheckedChange={(checked) => setIncludePhotos(checked === true)}
                  disabled={!hasPhotos}
                />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="include-photos"
                    className="font-medium"
                  >
                    Include all photos ({photos.length})
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Attach all job photos to the notification email.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="include-before-after"
                  checked={includeBeforeAfter}
                  onCheckedChange={(checked) => setIncludeBeforeAfter(checked === true)}
                  disabled={!hasBeforeAfterPair}
                />
                <div className="grid gap-1.5">
                  <Label
                    htmlFor="include-before-after"
                    className="font-medium"
                  >
                    Include before/after comparison
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Include a before/after comparison image in the email body.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Before/After preview */}
            {hasBeforeAfterPair && includeBeforeAfter && (
              <div className="space-y-2">
                <Label>Before/After Comparison Preview</Label>
                <BeforeAfterSlider
                  beforeImage={beforePhotos[0].url}
                  afterImage={afterPhotos[0].url}
                  beforeCaption={beforePhotos[0].caption || "Before"}
                  afterCaption={afterPhotos[0].caption || "After"}
                />
              </div>
            )}
            
            {/* Message */}
            <div className="space-y-2">
              <Label htmlFor="notification-message">Message</Label>
              <Textarea
                id="notification-message"
                placeholder="Enter a message to send to the customer..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
              />
            </div>
            
            {/* No photos warning */}
            {!hasPhotos && (
              <div className="p-4 rounded-md bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-3">
                  <Image className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800">No Photos Available</h4>
                    <p className="text-sm text-amber-700">
                      There are no photos available to include in the notification.
                      Please upload photos before sending the notification.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSend}
          disabled={isLoading || isSending || (includePhotos && !hasPhotos) || (includeBeforeAfter && !hasBeforeAfterPair)}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Mail className="mr-2 h-4 w-4" />
              Send Notification
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}