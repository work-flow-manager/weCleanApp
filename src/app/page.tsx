"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/lib/supabase";
import {
  ArrowRight,
  CheckCircle,
  Globe,
  MapPin,
  Calendar,
  Users,
  Loader2,
} from "lucide-react";

export default function LandingPage() {
  const { user, profile, loading, signIn, signUp } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "customer" as UserRole,
  });
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);

  useEffect(() => {
    if (user && profile) {
      // Add a small delay for better UX
      const timer = setTimeout(() => {
        router.push(`/dashboard/${profile.role}`);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [user, profile, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signIn(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsCreatingAccount(true);
    setError(null);

    try {
      const result = await signUp(
        formData.email,
        formData.password,
        formData.name,
        "customer", // Always create as customer
      );

      if (result?.user) {
        // Show success animation
        setTimeout(() => {
          // Redirect will happen automatically via useEffect when user/profile state updates
          setIsCreatingAccount(false);
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setIsCreatingAccount(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  return (
    <div className="min-h-screen bg-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-sm bg-pink-50/80 border-b border-pink-500/20">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-pink-500 p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M3 7v10c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V7" />
                <path d="M16 2H8a2 2 0 0 0-2 2v3h12V4a2 2 0 0 0-2-2Z" />
                <path d="M11 14h2" />
                <path d="M11 18h2" />
                <path d="M12 14v4" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">
              We-Clean.app
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-gray-800 hover:text-pink-500 transition-colors"
            >
              Features
            </Link>
            <Link
              href="#roles"
              className="text-gray-800 hover:text-pink-500 transition-colors"
            >
              Roles
            </Link>
            <Link
              href="#testimonials"
              className="text-gray-800 hover:text-pink-500 transition-colors"
            >
              Testimonials
            </Link>
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-gray-500" />
              <select className="bg-transparent text-sm text-gray-800 focus:outline-none">
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="pt">PT</option>
              </select>
            </div>
          </nav>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              className="hidden sm:flex border-pink-500/20 text-pink-500 hover:bg-pink-500/10"
            >
              Log In
            </Button>
            <Button className="bg-pink-500 hover:bg-pink-600 text-white">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container pt-20 pb-16">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight">
              Modern Cleaning Service{" "}
              <span className="text-pink-500">Management</span> Platform
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Streamline your cleaning business operations with our all-in-one
              platform. Schedule jobs, track teams, and delight customers with
              real-time updates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-pink-500/20 text-pink-500 hover:bg-pink-500/10"
              >
                Book a Demo
              </Button>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-pink-50 bg-pink-100 flex items-center justify-center"
                  >
                    <span className="text-xs font-medium text-pink-500">
                      {i}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-600">
                <span className="font-medium">500+</span> cleaning businesses
                trust us
              </p>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-amber-400/20 rounded-3xl blur-3xl -z-10" />
            <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl animate-fade-in-scale">
              <Tabs defaultValue="login" className="w-full max-w-md mx-auto">
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/20 backdrop-blur-sm">
                  <TabsTrigger
                    value="login"
                    className="data-[state=active]:bg-white/40 data-[state=active]:backdrop-blur-sm"
                  >
                    Log In
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="data-[state=active]:bg-white/40 data-[state=active]:backdrop-blur-sm"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>

                {error && (
                  <div className="mb-4 p-3 bg-red-100/80 backdrop-blur-sm border border-red-200 rounded-lg text-red-700 text-sm animate-shake">
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      {error}
                    </div>
                  </div>
                )}

                {isCreatingAccount && (
                  <div className="mb-4 p-3 bg-green-100/80 backdrop-blur-sm border border-green-200 rounded-lg text-green-700 text-sm animate-pulse">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      <span>Setting up your customer account...</span>
                    </div>
                  </div>
                )}

                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="bg-white/40 backdrop-blur-sm border-white/30 placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-gray-700">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="bg-white/40 backdrop-blur-sm border-white/30 placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white transition-all duration-300 transform hover:scale-105 group"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="animate-pulse">
                            Signing you in...
                          </span>
                        </>
                      ) : (
                        <span className="flex items-center justify-center">
                          Log In
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </form>
                  <div className="text-center text-sm text-gray-600">
                    <Link href="#" className="text-pink-500 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                </TabsContent>

                <TabsContent value="register" className="space-y-4">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-as" className="text-gray-700">
                        Account Type
                      </Label>
                      <div className="flex h-9 w-full rounded-md border border-white/30 bg-white/40 backdrop-blur-sm px-3 py-1 text-sm shadow-sm items-center">
                        <span className="text-gray-700">Customer Account</span>
                        <span className="ml-auto text-xs text-gray-500">
                          (Default)
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">
                        All accounts start as customers. Managers can promote
                        you to team member later.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={(e) =>
                          handleInputChange("name", e.target.value)
                        }
                        className="bg-white/40 backdrop-blur-sm border-white/30 placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-700">
                        Email
                      </Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="bg-white/40 backdrop-blur-sm border-white/30 placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="register-password"
                        className="text-gray-700"
                      >
                        Password
                      </Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={(e) =>
                          handleInputChange("password", e.target.value)
                        }
                        className="bg-white/40 backdrop-blur-sm border-white/30 placeholder:text-gray-500"
                        required
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-pink-500 hover:bg-pink-600 text-white transition-all duration-300 transform hover:scale-105"
                      disabled={isLoading || isCreatingAccount}
                    >
                      {isCreatingAccount ? (
                        <>
                          <div className="mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="animate-pulse">
                            Creating your account...
                          </span>
                        </>
                      ) : isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <span className="flex items-center justify-center">
                          Create Account
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </span>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-b from-pink-50 to-white"
      >
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Powerful Features for Your Cleaning Business
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your cleaning service operations
              efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Job Scheduling",
                description:
                  "Easily schedule and manage cleaning jobs with an intuitive calendar interface",
                icon: <Calendar className="h-6 w-6 text-pink-500" />,
              },
              {
                title: "GPS Tracking",
                description:
                  "Track your cleaning team's location in real-time and optimize routes",
                icon: <MapPin className="h-6 w-6 text-pink-500" />,
              },
              {
                title: "Team Management",
                description:
                  "Assign jobs to team members based on availability and performance",
                icon: <Users className="h-6 w-6 text-pink-500" />,
              },
              {
                title: "Photo Verification",
                description:
                  "Capture before and after photos to verify job completion and quality",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-pink-500"
                  >
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                ),
              },
              {
                title: "White-label Branding",
                description:
                  "Customize the platform with your own branding and company information",
                icon: (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-6 w-6 text-pink-500"
                  >
                    <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" />
                    <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
                    <path d="M12 2v2" />
                    <path d="M12 22v-2" />
                    <path d="m17 20.66-1-1.73" />
                    <path d="M11 10.27 7 3.34" />
                    <path d="m20.66 17-1.73-1" />
                    <path d="m3.34 7 1.73 1" />
                    <path d="M14 12h8" />
                    <path d="M2 12h2" />
                    <path d="m20.66 7-1.73 1" />
                    <path d="m3.34 17 1.73-1" />
                    <path d="m17 3.34-1 1.73" />
                    <path d="m11 13.73-4 6.93" />
                  </svg>
                ),
              },
              {
                title: "Multi-language Support",
                description:
                  "Reach more customers with support for English, Spanish, and Portuguese",
                icon: <Globe className="h-6 w-6 text-pink-500" />,
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="backdrop-blur-sm bg-white/40 border border-pink-500/10 hover:border-pink-500/30 transition-all hover:shadow-md"
              >
                <CardContent className="p-6">
                  <div className="h-12 w-12 rounded-lg bg-pink-100 flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20 bg-white">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Tailored Dashboards for Every Role
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Specialized interfaces designed for different user roles in your
              cleaning business
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: "Admin Dashboard",
                description:
                  "Complete control over your business with comprehensive analytics, user management, and white-label settings",
                image:
                  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
                features: [
                  "Company-wide statistics",
                  "User management",
                  "White-label customization",
                  "Language settings",
                ],
              },
              {
                title: "Manager Dashboard",
                description:
                  "Efficiently manage your cleaning teams and jobs with powerful scheduling and assignment tools",
                image:
                  "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80",
                features: [
                  "Team performance metrics",
                  "Job creation and scheduling",
                  "Team assignment",
                  "Job progress tracking",
                ],
              },
              {
                title: "Team Dashboard",
                description:
                  "Streamlined interface for cleaning staff to manage their daily tasks and report job status",
                image:
                  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
                features: [
                  "Job list view",
                  "Status updates",
                  "GPS check-in",
                  "Photo verification upload",
                ],
              },
              {
                title: "Customer Dashboard",
                description:
                  "User-friendly interface for customers to schedule cleanings and track service progress",
                image:
                  "https://images.unsplash.com/photo-1586282391129-76a6df230234?w=800&q=80",
                features: [
                  "Service scheduling",
                  "Real-time cleaner tracking",
                  "Job history",
                  "Ratings and reviews",
                ],
              },
            ].map((role, index) => (
              <Card
                key={index}
                className="overflow-hidden backdrop-blur-sm bg-white/40 border border-pink-500/10 hover:border-pink-500/30 transition-all hover:shadow-md"
              >
                <div className="aspect-video relative">
                  <Image
                    src={role.image}
                    alt={role.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                    <h3 className="text-2xl font-bold text-white p-6">
                      {role.title}
                    </h3>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-4">{role.description}</p>
                  <ul className="space-y-2">
                    {role.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-pink-500" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button className="bg-pink-500 hover:bg-pink-600 text-white">
              <span>Explore All Features</span>
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-500/10 to-amber-400/10">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Ready to Transform Your Cleaning Business?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join hundreds of cleaning businesses already using We-Clean.app to
              streamline operations and delight customers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-pink-500 hover:bg-pink-600 text-white"
              >
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-pink-500/20 text-pink-500 hover:bg-pink-500/10"
              >
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-pink-500/10 py-12">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Integrations
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Updates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Community
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Webinars
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Security
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-gray-600 hover:text-pink-500">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-pink-500/10 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="rounded-full bg-pink-500 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5 text-white"
                >
                  <path d="M3 7v10c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V7" />
                  <path d="M16 2H8a2 2 0 0 0-2 2v3h12V4a2 2 0 0 0-2-2Z" />
                  <path d="M11 14h2" />
                  <path d="M11 18h2" />
                  <path d="M12 14v4" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-800">
                We-Clean.app
              </span>
            </div>
            <p className="text-sm text-gray-600">
              © {new Date().getFullYear()} We-Clean.app. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <Link href="#" className="text-gray-600 hover:text-pink-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-pink-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-pink-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </Link>
              <Link href="#" className="text-gray-600 hover:text-pink-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
