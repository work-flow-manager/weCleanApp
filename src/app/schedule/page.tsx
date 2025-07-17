"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DatePickerWithRange from "@/components/ui/date-picker-with-range";
import { createJob, getServiceTypes, ServiceType } from "@/lib/supabase";
import {
  Calendar,
  MapPin,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";

interface ScheduleFormData {
  serviceTypeId: string;
  title: string;
  serviceAddress: string;
  scheduledDate: string;
  scheduledTime: string;
  description: string;
  specialInstructions: string;
  customerName: string;
  customerEmail: string;
}

export default function SchedulePage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ScheduleFormData>({
    serviceTypeId: "",
    title: "",
    serviceAddress: "",
    scheduledDate: "",
    scheduledTime: "",
    description: "",
    specialInstructions: "",
    customerName: "",
    customerEmail: "",
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    } else if (!loading && profile && profile.role !== "customer") {
      router.push(`/dashboard/${profile.role}`);
    }
  }, [user, profile, loading, router]);

  useEffect(() => {
    const loadServiceTypes = async () => {
      try {
        const types = await getServiceTypes();
        setServiceTypes(types || []);
      } catch (error) {
        console.error("Error loading service types:", error);
      }
    };

    loadServiceTypes();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData((prev) => ({
        ...prev,
        customerName: profile.full_name || "",
        customerEmail: profile.email || "",
      }));
    }
  }, [profile]);

  const handleInputChange = (field: keyof ScheduleFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSubmitStatus("idle");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSubmitStatus("idle");

    try {
      // Validate required fields
      if (
        !formData.serviceTypeId ||
        !formData.title ||
        !formData.serviceAddress ||
        !formData.scheduledDate ||
        !formData.scheduledTime ||
        !formData.customerName
      ) {
        throw new Error("Please fill in all required fields");
      }

      await createJob({
        title: formData.title,
        service_address: formData.serviceAddress,
        scheduled_date: formData.scheduledDate,
        scheduled_time: formData.scheduledTime,
        customer_name: formData.customerName,
        customer_email: formData.customerEmail,
        service_type_id: formData.serviceTypeId,
        description: formData.description,
        special_instructions: formData.specialInstructions,
      });

      setSubmitStatus("success");

      // Reset form after success
      setTimeout(() => {
        setFormData({
          serviceTypeId: "",
          title: "",
          serviceAddress: "",
          scheduledDate: "",
          scheduledTime: "",
          description: "",
          specialInstructions: "",
          customerName: profile?.full_name || "",
          customerEmail: profile?.email || "",
        });
        setSubmitStatus("idle");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Failed to schedule cleaning service");
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-pink-500" />
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || !profile || profile.role !== "customer") {
    return null;
  }

  return (
    <DashboardLayout
      userRole={profile.role}
      userName={profile.full_name}
      userAvatar={profile.avatar_url}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Calendar className="h-8 w-8 text-pink-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Schedule Cleaning Service
            </h1>
            <p className="text-gray-600">
              Book a professional cleaning service for your location
            </p>
          </div>
        </div>

        {submitStatus === "success" && (
          <Card className="backdrop-blur-sm bg-green-50/80 border border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">
                    Cleaning service scheduled successfully!
                  </p>
                  <p className="text-sm text-green-600">
                    You will receive a confirmation email shortly.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card className="backdrop-blur-sm bg-red-50/80 border border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <p className="font-medium text-red-800">Error</p>
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-pink-500" />
              Service Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type *</Label>
                  <Select
                    value={formData.serviceTypeId}
                    onValueChange={(value) =>
                      handleInputChange("serviceTypeId", value)
                    }
                  >
                    <SelectTrigger className="bg-white/60 border-pink-200">
                      <SelectValue placeholder="Select a service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{type.name}</span>
                            {type.description && (
                              <span className="text-sm text-gray-500">
                                {type.description}
                              </span>
                            )}
                            {type.base_price && (
                              <span className="text-sm text-pink-600">
                                Starting at ${type.base_price}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Service Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Weekly House Cleaning"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    className="bg-white/60 border-pink-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="serviceAddress">Service Address *</Label>
                <Input
                  id="serviceAddress"
                  placeholder="Enter the full address where cleaning is needed"
                  value={formData.serviceAddress}
                  onChange={(e) =>
                    handleInputChange("serviceAddress", e.target.value)
                  }
                  className="bg-white/60 border-pink-200"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">Preferred Date *</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      handleInputChange("scheduledDate", e.target.value)
                    }
                    className="bg-white/60 border-pink-200"
                    min={format(new Date(), "yyyy-MM-dd")}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">Preferred Time *</Label>
                  <Select
                    value={formData.scheduledTime}
                    onValueChange={(value) =>
                      handleInputChange("scheduledTime", value)
                    }
                  >
                    <SelectTrigger className="bg-white/60 border-pink-200">
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "08:00",
                        "09:00",
                        "10:00",
                        "11:00",
                        "12:00",
                        "13:00",
                        "14:00",
                        "15:00",
                        "16:00",
                        "17:00",
                      ].map((time) => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what areas need cleaning or any specific requirements"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="bg-white/60 border-pink-200 min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">
                  Special Instructions
                </Label>
                <Textarea
                  id="specialInstructions"
                  placeholder="Any special instructions, access codes, or notes for the cleaning team"
                  value={formData.specialInstructions}
                  onChange={(e) =>
                    handleInputChange("specialInstructions", e.target.value)
                  }
                  className="bg-white/60 border-pink-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Your Name *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    className="bg-white/60 border-pink-200"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      handleInputChange("customerEmail", e.target.value)
                    }
                    className="bg-white/60 border-pink-200"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  className="bg-pink-500 hover:bg-pink-600 text-white flex-1 md:flex-none"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Service
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  onClick={() => router.push(`/dashboard/${profile.role}`)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm bg-white/40 border border-pink-200/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-pink-500" />
              What Happens Next?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-pink-600">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">
                    Confirmation & Review
                  </p>
                  <p className="text-sm text-gray-600">
                    Our team will review your request and send a confirmation
                    email within 2 hours.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-pink-600">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Team Assignment</p>
                  <p className="text-sm text-gray-600">
                    We'll assign the best available cleaning team based on your
                    location and requirements.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-pink-600">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Service Day</p>
                  <p className="text-sm text-gray-600">
                    Track your cleaning team's arrival in real-time and receive
                    updates throughout the service.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
