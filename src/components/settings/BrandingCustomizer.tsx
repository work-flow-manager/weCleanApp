"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  Check, 
  Building, 
  Upload, 
  Globe, 
  Mail,
  Trash2,
  ImageIcon
} from "lucide-react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useAuth } from "@/contexts/AuthContext";

interface BrandingCustomizerProps {
  className?: string;
}

interface BrandingSettings {
  businessName: string;
  logoUrl: string | null;
  customDomain: string | null;
  emailHeader: string;
  emailFooter: string;
  emailSignature: string;
}

export default function BrandingCustomizer({ className = "" }: BrandingCustomizerProps) {
  const { user } = useAuth();
  const supabase = createClientComponentClient();
  
  const [activeTab, setActiveTab] = useState<string>("general");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  
  const [branding, setBranding] = useState<BrandingSettings>({
    businessName: "",
    logoUrl: null,
    customDomain: null,
    emailHeader: "",
    emailFooter: "",
    emailSignature: "",
  });
  
  // Load branding settings
  useEffect(() => {
    const loadBrandingSettings = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        
        const businessId = user.business_id || user.id;
        
        const { data, error } = await supabase
          .from('businesses')
          .select('*')
          .eq('id', businessId)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setBranding({
            businessName: data.name || "",
            logoUrl: data.logo_url || null,
            customDomain: data.custom_domain || null,
            emailHeader: data.email_header || "",
            emailFooter: data.email_footer || "",
            emailSignature: data.email_signature || "",
          });
          
          if (data.logo_url) {
            setLogoPreview(data.logo_url);
          }
        }
      } catch (error) {
        console.error("Error loading branding settings:", error);
        toast({
          title: "Error",
          description: "Failed to load branding settings.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadBrandingSettings();
  }, [user?.id]);
  
  // Handle logo file selection
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Logo image must be less than 2MB.",
        variant: "destructive",
      });
      return;
    }
    
    setLogoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  // Upload logo
  const uploadLogo = async () => {
    if (!logoFile || !user?.id) return;
    
    try {
      setIsUploading(true);
      
      const businessId = user.business_id || user.id;
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${businessId}/logo-${Date.now()}.${fileExt}`;
      const filePath = `business-logos/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase
        .storage
        .from('business-assets')
        .upload(filePath, logoFile);
        
      if (uploadError) throw uploadError;
      
      // Get public URL
      const { data: publicUrlData } = supabase
        .storage
        .from('business-assets')
        .getPublicUrl(filePath);
        
      const logoUrl = publicUrlData.publicUrl;
      
      // Update business record
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ logo_url: logoUrl })
        .eq('id', businessId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setBranding({
        ...branding,
        logoUrl,
      });
      
      toast({
        title: "Logo Uploaded",
        description: "Your business logo has been updated.",
      });
      
      // Clear file input
      setLogoFile(null);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Remove logo
  const removeLogo = async () => {
    if (!user?.id || !branding.logoUrl) return;
    
    try {
      setIsUploading(true);
      
      const businessId = user.business_id || user.id;
      
      // Update business record
      const { error: updateError } = await supabase
        .from('businesses')
        .update({ logo_url: null })
        .eq('id', businessId);
        
      if (updateError) throw updateError;
      
      // Update local state
      setBranding({
        ...branding,
        logoUrl: null,
      });
      
      setLogoPreview(null);
      
      toast({
        title: "Logo Removed",
        description: "Your business logo has been removed.",
      });
    } catch (error) {
      console.error("Error removing logo:", error);
      toast({
        title: "Error",
        description: "Failed to remove logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Save branding settings
  const saveBrandingSettings = async () => {
    if (!user?.id) return;
    
    try {
      setIsSaving(true);
      
      const businessId = user.business_id || user.id;
      
      // Update business record
      const { error } = await supabase
        .from('businesses')
        .update({
          name: branding.businessName,
          custom_domain: branding.customDomain,
          email_header: branding.emailHeader,
          email_footer: branding.emailFooter,
          email_signature: branding.emailSignature,
          updated_at: new Date().toISOString(),
        })
        .eq('id', businessId);
        
      if (error) throw error;
      
      toast({
        title: "Settings Saved",
        description: "Your branding settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving branding settings:", error);
      toast({
        title: "Error",
        description: "Failed to save branding settings.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5 text-pink-500" />
          Branding Customization
        </CardTitle>
        <CardDescription>
          Customize your business branding and appearance
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="domain">Domain</TabsTrigger>
              <TabsTrigger value="email">Email Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Business Name</Label>
                  <Input
                    id="business-name"
                    placeholder="Your Business Name"
                    value={branding.businessName}
                    onChange={(e) => setBranding({ ...branding, businessName: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    This name will appear throughout the application and in customer communications.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Business Logo</Label>
                  
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-24 h-24 border rounded-md flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: logoPreview ? "transparent" : "#f3f4f6" }}
                    >
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Business Logo" 
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoChange}
                        className="max-w-xs"
                      />
                      
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={uploadLogo}
                          disabled={!logoFile || isUploading}
                        >
                          {isUploading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Logo
                            </>
                          )}
                        </Button>
                        
                        {logoPreview && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={removeLogo}
                            disabled={isUploading}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    Upload a logo image (PNG or JPG, max 2MB). Recommended size: 512x512 pixels.
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="domain" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="custom-domain">Custom Domain</Label>
                <Input
                  id="custom-domain"
                  placeholder="app.yourbusiness.com"
                  value={branding.customDomain || ""}
                  onChange={(e) => setBranding({ ...branding, customDomain: e.target.value || null })}
                />
                <p className="text-sm text-muted-foreground">
                  Enter your custom domain to use instead of the default we-clean.app domain.
                  You'll need to configure DNS settings with your domain provider.
                </p>
              </div>
              
              <div className="mt-4 p-4 border rounded-md bg-muted/50">
                <h4 className="font-medium mb-2">DNS Configuration</h4>
                <p className="text-sm mb-2">
                  To use your custom domain, add the following DNS records with your domain provider:
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="grid grid-cols-3 gap-2 font-medium">
                    <div>Type</div>
                    <div>Name</div>
                    <div>Value</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>CNAME</div>
                    <div>app</div>
                    <div>cname.we-clean.app</div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    <div>TXT</div>
                    <div>_we-clean-verification</div>
                    <div>verify:{user?.business_id || user?.id}</div>
                  </div>
                </div>
                
                <p className="text-sm mt-4">
                  After adding these records, it may take up to 48 hours for DNS changes to propagate.
                  Once verified, your custom domain will be activated automatically.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="email" className="space-y-4 pt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-header">Email Header</Label>
                  <Input
                    id="email-header"
                    placeholder="Welcome to {business_name}!"
                    value={branding.emailHeader}
                    onChange={(e) => setBranding({ ...branding, emailHeader: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    This text will appear at the top of all emails sent to customers.
                    Use {'{business_name}'} to insert your business name.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-footer">Email Footer</Label>
                  <Input
                    id="email-footer"
                    placeholder="Thank you for choosing {business_name}!"
                    value={branding.emailFooter}
                    onChange={(e) => setBranding({ ...branding, emailFooter: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    This text will appear at the bottom of all emails sent to customers.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email-signature">Email Signature</Label>
                  <Input
                    id="email-signature"
                    placeholder="The {business_name} Team"
                    value={branding.emailSignature}
                    onChange={(e) => setBranding({ ...branding, emailSignature: e.target.value })}
                  />
                  <p className="text-sm text-muted-foreground">
                    This signature will be added to the end of all emails.
                  </p>
                </div>
                
                <div className="mt-4 p-4 border rounded-md bg-muted/50">
                  <h4 className="font-medium mb-2">Email Preview</h4>
                  <div className="space-y-4 p-4 bg-white rounded-md border">
                    <div className="text-sm font-medium">
                      {branding.emailHeader.replace('{business_name}', branding.businessName)}
                    </div>
                    
                    <div className="text-sm">
                      <p>Hello Customer,</p>
                      <p className="mt-2">This is a sample email content to demonstrate how your emails will look.</p>
                      <p className="mt-2">Best regards,</p>
                    </div>
                    
                    <div className="text-sm">
                      {branding.emailSignature.replace('{business_name}', branding.businessName)}
                    </div>
                    
                    <div className="text-xs text-muted-foreground mt-4 pt-4 border-t">
                      {branding.emailFooter.replace('{business_name}', branding.businessName)}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={saveBrandingSettings}
          disabled={isLoading || isSaving}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}