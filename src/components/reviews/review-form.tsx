"use client"

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { 
  MAX_RATING, 
  MIN_RATING, 
  MAX_REVIEW_TEXT_LENGTH, 
  MAX_PHOTOS, 
  ALLOWED_PHOTO_TYPES, 
  MAX_PHOTO_SIZE 
} from '@/types/review';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { StarRating } from '@/components/ui/star-rating';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Camera, CheckCircle, Image, Loader2, Send, Trash2, Upload, X } from 'lucide-react';

// Define form schema with zod
const reviewFormSchema = z.object({
  rating: z.number().min(MIN_RATING).max(MAX_RATING),
  review_text: z.string().max(MAX_REVIEW_TEXT_LENGTH).optional(),
  photos: z.array(z.string()).max(MAX_PHOTOS).optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  jobId: string;
  jobTitle?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({ jobId, jobTitle, onSuccess, onCancel }: ReviewFormProps) {
  const router = useRouter();
  
  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [uploadedPhotos, setUploadedPhotos] = useState<{ url: string; file: File }[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  
  // Initialize form
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 0,
      review_text: '',
      photos: [],
    },
  });
  
  // Handle photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Clear previous errors
    setPhotoError(null);
    
    // Check if we've reached the maximum number of photos
    if (uploadedPhotos.length + files.length > MAX_PHOTOS) {
      setPhotoError(`You can only upload up to ${MAX_PHOTOS} photos`);
      return;
    }
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        setPhotoError('Only JPEG, PNG, and WebP images are allowed');
        continue;
      }
      
      // Validate file size
      if (file.size > MAX_PHOTO_SIZE) {
        setPhotoError('Each photo must be less than 5MB');
        continue;
      }
      
      // Start upload
      setUploadingPhoto(true);
      
      try {
        // In a real implementation, this would upload to a storage service
        // For now, we'll just create a local URL
        const url = URL.createObjectURL(file);
        
        // Add to uploaded photos
        setUploadedPhotos(prev => [...prev, { url, file }]);
        
        // Update form value
        const currentPhotos = form.getValues('photos') || [];
        form.setValue('photos', [...currentPhotos, url]);
      } catch (error) {
        console.error('Error uploading photo:', error);
        setPhotoError('Failed to upload photo. Please try again.');
      } finally {
        setUploadingPhoto(false);
      }
    }
    
    // Reset the input
    e.target.value = '';
  };
  
  // Handle photo removal
  const handleRemovePhoto = (index: number) => {
    // Remove from uploaded photos
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index));
    
    // Update form value
    const currentPhotos = form.getValues('photos') || [];
    form.setValue('photos', currentPhotos.filter((_, i) => i !== index));
  };
  
  // Handle form submission
  const onSubmit = async (values: ReviewFormValues) => {
    // Validate rating
    if (values.rating < MIN_RATING) {
      form.setError('rating', {
        type: 'manual',
        message: 'Please select a rating',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call an API endpoint
      // For now, we'll just simulate a successful submission
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show confirmation dialog
      setShowConfirmation(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle confirmation dialog close
  const handleConfirmationClose = () => {
    setShowConfirmation(false);
    
    // Redirect to job details page
    router.push(`/jobs/${jobId}`);
    router.refresh();
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Leave a Review</CardTitle>
          <CardDescription>
            {jobTitle ? (
              <>Share your experience with <span className="font-medium">{jobTitle}</span></>
            ) : (
              <>Share your experience with this service</>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Rating */}
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                      <div className="flex flex-col gap-2">
                        <StarRating
                          rating={field.value}
                          onChange={field.onChange}
                          size="lg"
                        />
                        {field.value > 0 && (
                          <p className="text-sm font-medium">
                            {field.value === 1 && 'Poor'}
                            {field.value === 2 && 'Fair'}
                            {field.value === 3 && 'Good'}
                            {field.value === 4 && 'Very Good'}
                            {field.value === 5 && 'Excellent'}
                          </p>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Review Text */}
              <FormField
                control={form.control}
                name="review_text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your experience with this service..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      {field.value?.length || 0}/{MAX_REVIEW_TEXT_LENGTH} characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Photos */}
              <FormField
                control={form.control}
                name="photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photos (Optional)</FormLabel>
                    <FormControl>
                      <div className="space-y-4">
                        {/* Photo upload button */}
                        <div className="flex items-center gap-4">
                          <Label
                            htmlFor="photo-upload"
                            className="flex h-10 cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Photos
                          </Label>
                          <Input
                            id="photo-upload"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            className="hidden"
                            onChange={handlePhotoUpload}
                            disabled={uploadingPhoto || uploadedPhotos.length >= MAX_PHOTOS}
                          />
                          
                          {uploadingPhoto && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </div>
                          )}
                        </div>
                        
                        {/* Photo error */}
                        {photoError && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{photoError}</AlertDescription>
                          </Alert>
                        )}
                        
                        {/* Photo preview */}
                        {uploadedPhotos.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {uploadedPhotos.map((photo, index) => (
                              <div key={index} className="relative group">
                                <div className="aspect-square rounded-md overflow-hidden border">
                                  <img
                                    src={photo.url}
                                    alt={`Review photo ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleRemovePhoto(index)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <FormDescription>
                          Upload up to {MAX_PHOTOS} photos (JPEG, PNG, WebP, max 5MB each)
                        </FormDescription>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Review
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center">Thank You for Your Review!</DialogTitle>
            <DialogDescription className="text-center">
              Your feedback helps us improve our services and helps other customers make informed decisions.
            </DialogDescription>
          </DialogHeader>
          <Separator />
          <div className="space-y-3">
            <div className="flex justify-center">
              <StarRating rating={form.getValues('rating')} readOnly size="lg" />
            </div>
            {form.getValues('review_text') && (
              <p className="text-center text-muted-foreground">
                "{form.getValues('review_text')}"
              </p>
            )}
          </div>
          <DialogFooter>
            <Button onClick={handleConfirmationClose} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}