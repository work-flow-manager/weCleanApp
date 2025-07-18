"use client"

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Review } from '@/types/review';
import { StarRating } from '@/components/ui/star-rating';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, ThumbsUp, Image } from 'lucide-react';

interface ReviewCardProps {
  review: Review;
  showJobDetails?: boolean;
  onReply?: (reviewId: string) => void;
}

export function ReviewCard({ review, showJobDetails = false, onReply }: ReviewCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  
  // Format date as relative time (e.g., "2 days ago")
  const formattedDate = formatDistanceToNow(new Date(review.created_at), { addSuffix: true });
  
  // Get customer name
  const customerName = review.customers?.profiles?.full_name || 'Anonymous';
  
  // Get customer avatar
  const customerAvatar = review.customers?.profiles?.avatar_url || '';
  
  // Get customer initials for avatar fallback
  const customerInitials = customerName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
  
  // Handle image click
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };
  
  // Handle reply button click
  const handleReplyClick = () => {
    if (onReply) {
      onReply(review.id);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={customerAvatar} alt={customerName} />
              <AvatarFallback>{customerInitials}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{customerName}</p>
              <div className="flex items-center gap-2">
                <StarRating rating={review.rating} readOnly size="sm" />
                <span className="text-xs text-muted-foreground">{formattedDate}</span>
              </div>
            </div>
          </div>
          
          {showJobDetails && review.jobs && (
            <Badge variant="outline" className="text-xs">
              {review.jobs.title || `Job #${review.job_id.substring(0, 8)}`}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {review.review_text ? (
          <p className="text-sm">{review.review_text}</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">No written review provided</p>
        )}
        
        {/* Review photos */}
        {review.photos && review.photos.length > 0 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {review.photos.map((photo, index) => (
              <Dialog key={index}>
                <DialogTrigger asChild>
                  <button
                    className="h-16 w-16 rounded-md overflow-hidden border flex-shrink-0 hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(index)}
                  >
                    <img
                      src={photo}
                      alt={`Review photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-xl">
                  <div className="aspect-square w-full overflow-hidden rounded-md">
                    <img
                      src={review.photos![selectedImageIndex || 0]}
                      alt={`Review photo ${(selectedImageIndex || 0) + 1}`}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="flex justify-center gap-2 mt-2">
                    {review.photos.map((_, photoIndex) => (
                      <button
                        key={photoIndex}
                        className={`h-2 w-2 rounded-full ${
                          photoIndex === selectedImageIndex ? 'bg-primary' : 'bg-muted'
                        }`}
                        onClick={() => setSelectedImageIndex(photoIndex)}
                      />
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            ))}
          </div>
        )}
        
        {/* Review response */}
        {review.response && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-muted">Response</Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.response.created_at), { addSuffix: true })}
              </span>
            </div>
            <p className="text-sm">{review.response.response_text}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex justify-between w-full">
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" className="h-8 px-2">
              <ThumbsUp className="h-4 w-4 mr-1" />
              <span className="text-xs">Helpful</span>
            </Button>
            {review.photos && review.photos.length > 0 && (
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Image className="h-4 w-4 mr-1" />
                <span className="text-xs">{review.photos.length} Photo{review.photos.length !== 1 ? 's' : ''}</span>
              </Button>
            )}
          </div>
          
          {!review.response && onReply && (
            <Button variant="outline" size="sm" className="h-8" onClick={handleReplyClick}>
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-xs">Reply</span>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}