"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ColorPicker } from '@/components/ui/color-picker';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Form validation schema
const brandingSchema = z.object({
  business_name: z.string().min(1, 'Business name is required'),
  tagline: z.string().optional(),
  primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color'),
  secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color'),
  accent_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color'),
  website_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Must be a valid email').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
  business_description: z.string().optional(),
});

type BrandingFormValues = z.infer<typeof brandingSchema>;

export function BrandingCustomizer() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Initialize form with default values
  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingSchema),
    defaultValues: {
      business_name: '',
      tagline: '',
      primary_color: '#EC4899', // Pink-500
      secondary_color: '#0EA5E9', // Sky-500
      accent_color: '#10B981', // Emerald-500
      website_url: '',
      contact_email: '',
      contact_phone: '',
      business_description: '',
    },
  });
  
  // Load branding data
  useEffect(() => {
    const loadBrandingData = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        // Use the user ID as the business ID
        const businessId = user.id;
        
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single();
        
        if (error) {
          console.error('Error loading branding data:', error);
          return;
        }
        
        if (data) {
          // Update form values
          form.reset({
            business_name: data.business_name || '',
            tagline: data.tagline || '',
            primary_color: data.primary_color || '#EC4899',
            secondary_color: data.secondary_color || '#0EA5E9',
            accent_color: data.accent_color || '#10B981',
            website_url: data.website_url || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            business_description: data.business_description || '',
          });
          
          // Set logo URL if available
          if (data.logo_url) {
            setLogoUrl(data.logo_url);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load branding data',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBrandingData();
  }, [user, supabase, form, toast]);
  
  // Handle logo file selection
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: 'Error',
          description: 'Logo file size must be less than 2MB',
          variant: 'destructive',
        });
        return;
      }
      
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
        toast({
          title: 'Error',
          description: 'Logo must be a JPEG, PNG, or SVG file',
          variant: 'destructive',
        });
        return;
      }
      
      setLogoFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Upload logo to storage
  const uploadLogo = async () => {
    if (!logoFile || !user?.id) return;
    
    try {
      setIsUploading(true);
      
      // Use the user ID as the business ID
      const businessId = user.id;
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${businessId}/logo-${Date.now()}.${fileExt}`;
      const filePath = `business-logos/${fileName}`;
      
      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('business-assets')
        .upload(filePath, logoFile);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get public URL
      const { data } = supabase.storage
        .from('business-assets')
        .getPublicUrl(filePath);
      
      // Update logo URL in database
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ logo_url: data.publicUrl })
        .eq('id', businessId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Update state
      setLogoUrl(data.publicUrl);
      setLogoFile(null);
      
      toast({
        title: 'Success',
        description: 'Logo uploaded successfully',
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to upload logo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Remove logo
  const removeLogo = async () => {
    if (!user?.id || !logoUrl) return;
    
    try {
      setIsUploading(true);
      
      // Use the user ID as the business ID
      const businessId = user.id;
      
      // Update database to remove logo URL
      const { error } = await supabase
        .from('businesses')
        .update({ logo_url: null })
        .eq('id', businessId);
      
      if (error) {
        throw error;
      }
      
      // Update state
      setLogoUrl(null);
      setPreviewUrl(null);
      
      toast({
        title: 'Success',
        description: 'Logo removed successfully',
      });
    } catch (error) {
      console.error('Error removing logo:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove logo',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: BrandingFormValues) => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      
      // Use the user ID as the business ID
      const businessId = user.id;
      
      // Update business data
      const { error } = await supabase
        .from('businesses')
        .upsert({
          id: businessId,
          business_name: data.business_name,
          tagline: data.tagline,
          primary_color: data.primary_color,
          secondary_color: data.secondary_color,
          accent_color: data.accent_color,
          website_url: data.website_url,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone,
          business_description: data.business_description,
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        throw error;
      }
      
      // Upload logo if selected
      if (logoFile) {
        await uploadLogo();
      }
      
      toast({
        title: 'Success',
        description: 'Branding settings saved successfully',
      });
      
      // Refresh the page to apply changes
      router.refresh();
    } catch (error) {
      console.error('Error saving branding settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save branding settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading branding settings...</span>
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Branding Customization</CardTitle>
        <CardDescription>
          Customize your business branding and appearance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="contact">Contact Info</TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="general" className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="business_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="tagline"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tagline</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          A short slogan or tagline for your business
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="business_description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>
                          A brief description of your business
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="space-y-2">
                    <Label>Business Logo</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-24 w-24 rounded-md border flex items-center justify-center overflow-hidden bg-gray-50">
                        {(logoUrl || previewUrl) ? (
                          <img 
                            src={previewUrl || logoUrl || ''} 
                            alt="Business Logo" 
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm text-center p-2">
                            No logo uploaded
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="relative"
                            disabled={isUploading}
                          >
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={handleLogoChange}
                              accept="image/jpeg,image/png,image/svg+xml"
                            />
                            <Upload className="h-4 w-4 mr-2" />
                            Select Logo
                          </Button>
                          
                          {logoUrl && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={removeLogo}
                              disabled={isUploading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          Recommended size: 512x512px. Max 2MB. JPEG, PNG, or SVG.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="colors" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="primary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                          <ColorPicker
                            color={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Main brand color
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="secondary_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <FormControl>
                          <ColorPicker
                            color={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Supporting brand color
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="accent_color"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent Color</FormLabel>
                        <FormControl>
                          <ColorPicker
                            color={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormDescription>
                          Highlight color for buttons and actions
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="mt-6 p-4 rounded-md border">
                  <h3 className="font-medium mb-2">Color Preview</h3>
                  <div className="flex gap-2">
                    <div 
                      className="h-12 w-12 rounded-md" 
                      style={{ backgroundColor: form.watch('primary_color') }}
                    />
                    <div 
                      className="h-12 w-12 rounded-md" 
                      style={{ backgroundColor: form.watch('secondary_color') }}
                    />
                    <div 
                      className="h-12 w-12 rounded-md" 
                      style={{ backgroundColor: form.watch('accent_color') }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    These colors will be applied to your customer-facing interfaces
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4">
                <FormField
                  control={form.control}
                  name="website_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://yourwebsite.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact_email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="contact@yourcompany.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contact_phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="(555) 123-4567" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSaving || isUploading}
                >
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}