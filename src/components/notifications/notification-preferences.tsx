import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Mail, MessageSquare, AlertTriangle, Loader2 } from 'lucide-react';
import { useNotifications } from '@/contexts/notification-context';
import { getUserSettings, updateUserSettings } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

interface NotificationPreferencesProps {
  className?: string;
}

export function NotificationPreferences({ className }: NotificationPreferencesProps) {
  const { user } = useAuth();
  const { hasPermission, requestPermission } = useNotifications();
  const { toast } = useToast();
  
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: false,
    sms_notifications: false,
    job_assignments: true,
    job_updates: true,
    review_notifications: true,
    payment_notifications: true,
    system_notifications: true,
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Fetch user notification preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const settings = await getUserSettings(user.id);
        
        if (settings) {
          setPreferences(prev => ({
            ...prev,
            email_notifications: settings.email_notifications,
            push_notifications: settings.push_notifications,
            sms_notifications: settings.sms_notifications,
            // Additional preferences would be loaded from database
          }));
        }
      } catch (error) {
        console.error('Error fetching notification preferences:', error);
        toast({
          title: 'Error',
          description: 'Failed to load notification preferences',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPreferences();
  }, [user, toast]);
  
  // Handle preference change
  const handlePreferenceChange = (key: keyof typeof preferences) => (checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: checked,
    }));
  };
  
  // Handle push notification permission request
  const handleRequestPushPermission = async () => {
    if (hasPermission) return;
    
    const granted = await requestPermission();
    
    if (granted) {
      setPreferences(prev => ({
        ...prev,
        push_notifications: true,
      }));
      
      toast({
        title: 'Success',
        description: 'Push notifications have been enabled',
      });
    } else {
      toast({
        title: 'Permission Denied',
        description: 'Please enable notifications in your browser settings',
        variant: 'destructive',
      });
    }
  };
  
  // Save preferences
  const savePreferences = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      
      await updateUserSettings(user.id, {
        email_notifications: preferences.email_notifications,
        push_notifications: preferences.push_notifications,
        sms_notifications: preferences.sms_notifications,
      });
      
      // Additional preferences would be saved to database
      
      toast({
        title: 'Success',
        description: 'Notification preferences saved',
      });
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to save notification preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>
          Choose how and when you want to be notified
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Notification channels */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Channels</h3>
              
              <div className="grid gap-4">
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-5 w-5 text-gray-500" />
                    <Label htmlFor="email-notifications" className="flex-1">
                      <div>Email Notifications</div>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </Label>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={preferences.email_notifications}
                    onCheckedChange={handlePreferenceChange('email_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <Bell className="h-5 w-5 text-gray-500" />
                    <Label htmlFor="push-notifications" className="flex-1">
                      <div>Push Notifications</div>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications in your browser
                      </p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!hasPermission && preferences.push_notifications && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRequestPushPermission}
                      >
                        Allow
                      </Button>
                    )}
                    <Switch
                      id="push-notifications"
                      checked={preferences.push_notifications}
                      onCheckedChange={handlePreferenceChange('push_notifications')}
                    />
                  </div>
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                    <Label htmlFor="sms-notifications" className="flex-1">
                      <div>SMS Notifications</div>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via SMS
                      </p>
                    </Label>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={preferences.sms_notifications}
                    onCheckedChange={handlePreferenceChange('sms_notifications')}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Notification types */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Types</h3>
              
              <div className="grid gap-4">
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="job-assignments" className="flex-1">
                    Job assignments
                  </Label>
                  <Switch
                    id="job-assignments"
                    checked={preferences.job_assignments}
                    onCheckedChange={handlePreferenceChange('job_assignments')}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="job-updates" className="flex-1">
                    Job status updates
                  </Label>
                  <Switch
                    id="job-updates"
                    checked={preferences.job_updates}
                    onCheckedChange={handlePreferenceChange('job_updates')}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="review-notifications" className="flex-1">
                    Reviews and ratings
                  </Label>
                  <Switch
                    id="review-notifications"
                    checked={preferences.review_notifications}
                    onCheckedChange={handlePreferenceChange('review_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="payment-notifications" className="flex-1">
                    Payment notifications
                  </Label>
                  <Switch
                    id="payment-notifications"
                    checked={preferences.payment_notifications}
                    onCheckedChange={handlePreferenceChange('payment_notifications')}
                  />
                </div>
                
                <div className="flex items-center justify-between space-x-2">
                  <Label htmlFor="system-notifications" className="flex-1">
                    System notifications
                  </Label>
                  <Switch
                    id="system-notifications"
                    checked={preferences.system_notifications}
                    onCheckedChange={handlePreferenceChange('system_notifications')}
                  />
                </div>
              </div>
            </div>
            
            <Separator />
            
            {/* Quiet hours */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Quiet Hours</h3>
              <p className="text-sm text-muted-foreground">
                During quiet hours, you'll only receive critical notifications
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quiet-hours-start">Start Time</Label>
                  <select
                    id="quiet-hours-start"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Not set</option>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="quiet-hours-end">End Time</Label>
                  <select
                    id="quiet-hours-end"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Not set</option>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Important</p>
                <p>
                  Critical notifications about account security and service disruptions will always be sent regardless of your preferences.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-end">
        <Button
          onClick={savePreferences}
          disabled={loading || saving}
          className="bg-pink-500 hover:bg-pink-600"
        >
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Preferences
        </Button>
      </CardFooter>
    </Card>
  );
}

export default NotificationPreferences;