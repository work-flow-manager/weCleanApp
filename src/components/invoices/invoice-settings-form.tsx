"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoices } from '@/hooks/useInvoices';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Save, Upload } from 'lucide-react';

interface InvoiceSettingsFormProps {
  initialSettings: any;
  company: any;
}

export function InvoiceSettingsForm({ initialSettings, company }: InvoiceSettingsFormProps) {
  const router = useRouter();
  const { updateInvoiceSettings, loading } = useInvoices();
  
  // Form state
  const [settings, setSettings] = useState({
    default_tax_rate: initialSettings.default_tax_rate || 0,
    default_payment_terms: initialSettings.default_payment_terms || 'Due within 30 days',
    invoice_prefix: initialSettings.invoice_prefix || '',
    invoice_footer: initialSettings.invoice_footer || '',
    next_invoice_number: initialSettings.next_invoice_number || 1,
    logo_url: initialSettings.logo_url || company?.logo || ''
  });
  
  // Handle input change
  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await updateInvoiceSettings(settings);
    if (result) {
      router.refresh();
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h1 className="text-2xl font-bold">Invoice Settings</h1>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Numbering</CardTitle>
              <CardDescription>Configure how invoice numbers are generated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice_prefix">Invoice Prefix (Optional)</Label>
                  <Input
                    id="invoice_prefix"
                    placeholder="e.g., INV-"
                    value={settings.invoice_prefix}
                    onChange={(e) => handleChange('invoice_prefix', e.target.value)}
                    maxLength={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    A prefix that will appear before the invoice number
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="next_invoice_number">Next Invoice Number</Label>
                  <Input
                    id="next_invoice_number"
                    type="number"
                    min="1"
                    step="1"
                    value={settings.next_invoice_number}
                    onChange={(e) => handleChange('next_invoice_number', parseInt(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    The next number to be used for new invoices
                  </p>
                </div>
              </div>
              
              <div className="pt-2">
                <Label>Preview</Label>
                <div className="mt-1 p-2 border rounded-md bg-muted/50">
                  <p className="font-mono">
                    {settings.invoice_prefix}{String(settings.next_invoice_number).padStart(6, '0')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Default Values</CardTitle>
              <CardDescription>Set default values for new invoices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_tax_rate">Default Tax Rate (%)</Label>
                  <Input
                    id="default_tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={settings.default_tax_rate}
                    onChange={(e) => handleChange('default_tax_rate', parseFloat(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="default_payment_terms">Default Payment Terms</Label>
                  <Input
                    id="default_payment_terms"
                    value={settings.default_payment_terms}
                    onChange={(e) => handleChange('default_payment_terms', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Appearance</CardTitle>
              <CardDescription>Customize how your invoices look</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logo_url">Company Logo URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="logo_url"
                    placeholder="https://example.com/logo.png"
                    value={settings.logo_url}
                    onChange={(e) => handleChange('logo_url', e.target.value)}
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter a URL to your company logo or upload a new one
                </p>
              </div>
              
              {settings.logo_url && (
                <div className="mt-4">
                  <Label>Logo Preview</Label>
                  <div className="mt-2 p-4 border rounded-md flex items-center justify-center bg-white">
                    <img 
                      src={settings.logo_url} 
                      alt="Company Logo" 
                      className="max-h-20 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x100?text=Invalid+Image+URL';
                      }}
                    />
                  </div>
                </div>
              )}
              
              <Separator className="my-4" />
              
              <div className="space-y-2">
                <Label htmlFor="invoice_footer">Invoice Footer</Label>
                <Textarea
                  id="invoice_footer"
                  placeholder="Enter text to appear at the bottom of all invoices"
                  value={settings.invoice_footer}
                  onChange={(e) => handleChange('invoice_footer', e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This text will appear at the bottom of all invoices (e.g., payment instructions, terms and conditions)
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </form>
  );
}