/**
 * Photo Upload Service
 * 
 * This service provides utilities for capturing, uploading, and optimizing photos.
 */

import { supabase } from '@/lib/supabase/client';

export type PhotoCategory = 'before' | 'after' | 'issue' | 'other';

export interface PhotoUploadOptions {
  jobId: string;
  category: PhotoCategory;
  caption?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export interface PhotoUploadResult {
  id: string;
  url: string;
  category: PhotoCategory;
  caption?: string;
  createdAt: string;
}

/**
 * Optimize an image by resizing and compressing it
 * @param file Image file to optimize
 * @param maxWidth Maximum width of the optimized image
 * @param maxHeight Maximum height of the optimized image
 * @param quality JPEG quality (0-1)
 * @returns Optimized image as a Blob
 */
export async function optimizeImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // Create an image element to load the file
    const img = new Image();
    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }
      
      // Create a canvas to resize the image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      // Draw the image on the canvas
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert the canvas to a Blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Could not create blob from canvas'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Could not load image'));
    };
    
    // Load the image from the file
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Upload a photo to Supabase storage
 * @param file Photo file to upload
 * @param options Upload options
 * @returns Upload result
 */
export async function uploadPhoto(
  file: File,
  options: PhotoUploadOptions
): Promise<PhotoUploadResult> {
  try {
    // Optimize the image
    const optimizedImage = await optimizeImage(
      file,
      options.maxWidth || 1920,
      options.maxHeight || 1080,
      options.quality || 0.8
    );
    
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const fileExt = file.name.split('.').pop();
    const fileName = `${options.jobId}/${options.category}_${timestamp}.${fileExt}`;
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from('job-photos')
      .upload(fileName, optimizedImage, {
        contentType: `image/${fileExt === 'png' ? 'png' : 'jpeg'}`,
        upsert: false
      });
    
    if (error) {
      console.error('Error uploading photo:', error);
      throw new Error(`Failed to upload photo: ${error.message}`);
    }
    
    // Get the public URL
    const { data: publicUrlData } = supabase.storage
      .from('job-photos')
      .getPublicUrl(data.path);
    
    // Create a record in the job_photos table
    const { data: photoRecord, error: recordError } = await supabase
      .from('job_photos')
      .insert({
        job_id: options.jobId,
        url: publicUrlData.publicUrl,
        type: options.category,
        caption: options.caption || null
      })
      .select()
      .single();
    
    if (recordError) {
      console.error('Error creating photo record:', recordError);
      throw new Error(`Failed to create photo record: ${recordError.message}`);
    }
    
    return {
      id: photoRecord.id,
      url: publicUrlData.publicUrl,
      category: options.category,
      caption: options.caption,
      createdAt: photoRecord.created_at
    };
  } catch (error) {
    console.error('Error in uploadPhoto:', error);
    throw error;
  }
}

/**
 * Get photos for a job
 * @param jobId Job ID
 * @param category Optional category filter
 * @returns Array of photos
 */
export async function getJobPhotos(
  jobId: string,
  category?: PhotoCategory
): Promise<PhotoUploadResult[]> {
  try {
    let query = supabase
      .from('job_photos')
      .select('*')
      .eq('job_id', jobId);
    
    if (category) {
      query = query.eq('type', category);
    }
    
    const { data, error } = await query.order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error getting job photos:', error);
      throw new Error(`Failed to get job photos: ${error.message}`);
    }
    
    return data.map(photo => ({
      id: photo.id,
      url: photo.url,
      category: photo.type as PhotoCategory,
      caption: photo.caption,
      createdAt: photo.created_at
    }));
  } catch (error) {
    console.error('Error in getJobPhotos:', error);
    throw error;
  }
}

/**
 * Delete a photo
 * @param photoId Photo ID
 * @returns Success status
 */
export async function deletePhoto(photoId: string): Promise<boolean> {
  try {
    // Get the photo record to get the URL
    const { data: photo, error: getError } = await supabase
      .from('job_photos')
      .select('url')
      .eq('id', photoId)
      .single();
    
    if (getError) {
      console.error('Error getting photo record:', getError);
      throw new Error(`Failed to get photo record: ${getError.message}`);
    }
    
    // Extract the path from the URL
    const url = new URL(photo.url);
    const path = url.pathname.split('/').slice(-2).join('/');
    
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('job-photos')
      .remove([path]);
    
    if (storageError) {
      console.error('Error deleting photo from storage:', storageError);
      // Continue despite storage error, as the record is more important
    }
    
    // Delete the record
    const { error: recordError } = await supabase
      .from('job_photos')
      .delete()
      .eq('id', photoId);
    
    if (recordError) {
      console.error('Error deleting photo record:', recordError);
      throw new Error(`Failed to delete photo record: ${recordError.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error in deletePhoto:', error);
    throw error;
  }
}