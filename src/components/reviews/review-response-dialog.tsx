"use client"

import React, { useState } from 'react';
import { Review } from '@/types/review';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { StarRating } from '@/components/ui/star-rating';
import { formatDistanceToNow } from 'date-fns';

interface ReviewResponseDialogProps {
  review: Review;
  open: boolean;
  onClose: () => void;
  onSubmit: (responseText: string) => void;
}

export function ReviewResponseDialog({
  review,
  open,
  onClose,
  onSubmit
}: ReviewResponseDialogProps) {
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Format date as relative time (e.g., "2 days ago")
  const formattedDate = formatDistanceToNow(new Date(review.created_at), { addSuffix: true });
  
  // Get customer name
  const customerName = review.customers?.profiles?.full_name || 'Anonymous';
  
  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResponseText(e.target.value);
  };
  
  // Handle submit
  const handleSubmit = async () => {
    if (!responseText.trim()) return;
    
    setIsSubmitting(true);
    await onSubmit(responseText);
    setIsSubmitting(false);
    setResponseText('');
  };
  
  // Handle dialog close
  const handleClose = () => {
    if (!isSubmitting) {
      setResponseText('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Respond to Review</DialogTitle>
        </DialogHeader>
        
        {/* Original Review */}
        <div className="border rounded-md p-4 bg-muted/30 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-medium">{customerName}</p>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} readOnly size="sm" />
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
            </div>
          </div>
          
          {review.review_text ? (
            <p className="text-sm">{review.review_text}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No written review provided</p>
          )}
        </div>
        
        {/* Response Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="response">Your Response</Label>
            <Textarea
              id="response"
              placeholder="Write your response to this review..."
              value={responseText}
              onChange={handleTextChange}
              rows={5}
              className="resize-none"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Your response will be publicly visible to all users.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!responseText.trim() || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Response'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}