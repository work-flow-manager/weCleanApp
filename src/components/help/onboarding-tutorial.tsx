import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, ChevronRight, X, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/supabase';

// Tutorial step interface
interface TutorialStep {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  elementSelector?: string; // For highlighting UI elements
  position?: 'top' | 'right' | 'bottom' | 'left'; // For tooltip positioning
}

// Tutorial interface
interface Tutorial {
  id: string;
  title: string;
  description: string;
  role: UserRole | 'all';
  duration: string; // e.g., "5 min"
  steps: TutorialStep[];
  tags: string[];
}

// Props interface
interface OnboardingTutorialProps {
  userRole: UserRole;
  onComplete?: (tutorialId: string) => void;
  completedTutorials?: string[];
  className?: string;
}

export function OnboardingTutorial({ 
  userRole, 
  onComplete, 
  completedTutorials = [], 
  className 
}: OnboardingTutorialProps) {
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('recommended');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Filter tutorials based on user role
  const filteredTutorials = tutorials.filter(tutorial => 
    tutorial.role === 'all' || tutorial.role === userRole
  );
  
  // Separate tutorials into recommended and all categories
  const recommendedTutorials = filteredTutorials.filter(tutorial => 
    !completedTutorials.includes(tutorial.id)
  ).slice(0, 5); // Show top 5 uncompleted tutorials
  
  const allTutorials = filteredTutorials;
  
  // Get current step if a tutorial is selected
  const currentStep = selectedTutorial?.steps[currentStepIndex];
  const progress = selectedTutorial 
    ? ((currentStepIndex + 1) / selectedTutorial.steps.length) * 100 
    : 0;
  
  // Start a tutorial
  const startTutorial = (tutorial: Tutorial) => {
    setSelectedTutorial(tutorial);
    setCurrentStepIndex(0);
    setIsDialogOpen(true);
    setIsVideoPlaying(false);
  };
  
  // Navigate to next step
  const goToNextStep = () => {
    if (!selectedTutorial) return;
    
    if (currentStepIndex < selectedTutorial.steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
      setIsVideoPlaying(false);
    } else {
      // Tutorial completed
      if (onComplete && selectedTutorial) {
        onComplete(selectedTutorial.id);
      }
      setIsDialogOpen(false);
    }
  };
  
  // Navigate to previous step
  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
      setIsVideoPlaying(false);
    }
  };
  
  // Close tutorial dialog
  const closeTutorial = () => {
    setIsDialogOpen(false);
    setSelectedTutorial(null);
    setCurrentStepIndex(0);
    setIsVideoPlaying(false);
  };
  
  // Toggle video playback
  const toggleVideo = () => {
    setIsVideoPlaying(!isVideoPlaying);
  };
  
  // Check if tutorial is completed
  const isTutorialCompleted = (tutorialId: string) => {
    return completedTutorials.includes(tutorialId);
  };
  
  return (
    <div className={className}>
      <Card className="shadow-sm border-pink-100">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100/50">
          <CardTitle className="text-xl font-semibold text-gray-800">Onboarding Tutorials</CardTitle>
        </CardHeader>
        
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="recommended" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                Recommended
              </TabsTrigger>
              <TabsTrigger value="all" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                All Tutorials
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recommended" className="mt-0">
              {recommendedTutorials.length > 0 ? (
                <div className="space-y-3">
                  {recommendedTutorials.map((tutorial) => (
                    <TutorialCard
                      key={tutorial.id}
                      tutorial={tutorial}
                      isCompleted={isTutorialCompleted(tutorial.id)}
                      onClick={() => startTutorial(tutorial)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>You've completed all recommended tutorials!</p>
                  <p className="mt-2 text-sm">Check the "All Tutorials" tab to review any tutorial.</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all" className="mt-0">
              <div className="space-y-3">
                {allTutorials.map((tutorial) => (
                  <TutorialCard
                    key={tutorial.id}
                    tutorial={tutorial}
                    isCompleted={isTutorialCompleted(tutorial.id)}
                    onClick={() => startTutorial(tutorial)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Tutorial Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTutorial?.title}</DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={closeTutorial}
              className="absolute right-4 top-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          
          {currentStep && (
            <div className="space-y-4">
              <Progress value={progress} className="h-2 bg-gray-200" />
              
              <div className="text-sm text-gray-500">
                Step {currentStepIndex + 1} of {selectedTutorial?.steps.length}
              </div>
              
              <h3 className="text-lg font-medium text-gray-800">{currentStep.title}</h3>
              
              <p className="text-gray-700">{currentStep.description}</p>
              
              {currentStep.imageUrl && (
                <div className="rounded-md overflow-hidden border border-gray-200 my-4">
                  <img 
                    src={currentStep.imageUrl} 
                    alt={currentStep.title} 
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              {currentStep.videoUrl && (
                <div className="rounded-md overflow-hidden border border-gray-200 my-4 relative">
                  <video
                    src={currentStep.videoUrl}
                    className="w-full h-auto"
                    controls={false}
                    autoPlay={isVideoPlaying}
                    loop={false}
                    muted={false}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleVideo}
                    className="absolute bottom-4 right-4 bg-white/80 hover:bg-white"
                  >
                    {isVideoPlaying ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between mt-4">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={currentStepIndex === 0}
              className="border-pink-200 hover:bg-pink-50"
            >
              Previous
            </Button>
            
            <Button
              onClick={goToNextStep}
              className="bg-pink-500 hover:bg-pink-600"
            >
              {currentStepIndex === (selectedTutorial?.steps.length || 1) - 1 ? (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Complete
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Tutorial Card Component
interface TutorialCardProps {
  tutorial: Tutorial;
  isCompleted: boolean;
  onClick: () => void;
}

function TutorialCard({ tutorial, isCompleted, onClick }: TutorialCardProps) {
  return (
    <div 
      className={cn(
        "flex justify-between items-center p-3 rounded-md border cursor-pointer hover:bg-gray-50 transition-colors",
        isCompleted ? "border-green-200" : "border-pink-200"
      )}
      onClick={onClick}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-800">{tutorial.title}</h3>
          {isCompleted && (
            <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
              Completed
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 mt-1">{tutorial.description}</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">{tutorial.duration}</span>
          {tutorial.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-gray-100">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-pink-500 hover:text-pink-600 hover:bg-pink-50"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// Sample tutorial data
export const tutorials: Tutorial[] = [
  {
    id: 'admin-getting-started',
    title: 'Admin: Getting Started',
    description: 'Learn the basics of managing your cleaning business with We-Clean',
    role: 'admin',
    duration: '10 min',
    tags: ['Admin', 'Basics'],
    steps: [
      {
        id: 'admin-step-1',
        title: 'Welcome to We-Clean',
        description: 'Welcome to We-Clean! This tutorial will guide you through the basics of managing your cleaning business using our platform. As an admin, you have access to all features and can manage your entire business operations.',
        imageUrl: '/images/tutorials/admin-welcome.jpg',
      },
      {
        id: 'admin-step-2',
        title: 'Navigating Your Dashboard',
        description: 'Your admin dashboard provides a comprehensive overview of your business. You can see key metrics, upcoming jobs, team performance, and quick access to important functions.',
        imageUrl: '/images/tutorials/admin-dashboard.jpg',
        elementSelector: '.dashboard-overview',
      },
      {
        id: 'admin-step-3',
        title: 'Managing Your Team',
        description: 'The Team Management section allows you to add new team members, assign roles, track performance, and manage schedules. Click on any team member to view their details and job history.',
        imageUrl: '/images/tutorials/admin-team.jpg',
        elementSelector: '.team-management',
      },
      {
        id: 'admin-step-4',
        title: 'Creating and Assigning Jobs',
        description: 'Learn how to create new cleaning jobs, assign them to team members, and track their progress from start to finish.',
        videoUrl: '/videos/tutorials/admin-jobs.mp4',
      },
      {
        id: 'admin-step-5',
        title: 'Customizing Your Platform',
        description: 'Make We-Clean your own by customizing the platform with your business branding. Upload your logo, set your color scheme, and configure other branding elements.',
        imageUrl: '/images/tutorials/admin-customization.jpg',
      },
    ],
  },
  {
    id: 'manager-getting-started',
    title: 'Manager: Getting Started',
    description: 'Learn how to effectively manage your cleaning teams',
    role: 'manager',
    duration: '8 min',
    tags: ['Manager', 'Basics'],
    steps: [
      {
        id: 'manager-step-1',
        title: 'Welcome to We-Clean',
        description: 'Welcome to We-Clean! This tutorial will guide you through the basics of managing your cleaning teams using our platform. As a manager, you can oversee team operations, assign jobs, and ensure quality service.',
        imageUrl: '/images/tutorials/manager-welcome.jpg',
      },
      {
        id: 'manager-step-2',
        title: 'Your Manager Dashboard',
        description: 'Your manager dashboard provides an overview of your team\'s performance, upcoming jobs, and important notifications. You can quickly access all the tools you need to manage daily operations.',
        imageUrl: '/images/tutorials/manager-dashboard.jpg',
      },
      {
        id: 'manager-step-3',
        title: 'Assigning Jobs to Team Members',
        description: 'Learn how to efficiently assign jobs to your team members based on their skills, availability, and location.',
        videoUrl: '/videos/tutorials/manager-assign.mp4',
      },
      {
        id: 'manager-step-4',
        title: 'Tracking Team Location',
        description: 'Use the map view to track your team\'s location in real-time, optimize routes, and ensure efficient job completion.',
        imageUrl: '/images/tutorials/manager-tracking.jpg',
      },
      {
        id: 'manager-step-5',
        title: 'Reviewing Job Completion',
        description: 'Learn how to review completed jobs, verify photo evidence, and provide feedback to your team members.',
        imageUrl: '/images/tutorials/manager-review.jpg',
      },
    ],
  },
  {
    id: 'team-getting-started',
    title: 'Team Member: Getting Started',
    description: 'Learn how to use We-Clean for your daily cleaning tasks',
    role: 'team',
    duration: '6 min',
    tags: ['Team', 'Basics'],
    steps: [
      {
        id: 'team-step-1',
        title: 'Welcome to We-Clean',
        description: 'Welcome to We-Clean! This tutorial will show you how to use our platform for your daily cleaning tasks. You\'ll learn how to view your schedule, navigate to job locations, and document your work.',
        imageUrl: '/images/tutorials/team-welcome.jpg',
      },
      {
        id: 'team-step-2',
        title: 'Your Team Dashboard',
        description: 'Your dashboard shows your daily schedule, assigned jobs, and important notifications. You can easily see what\'s coming up and access all the tools you need.',
        imageUrl: '/images/tutorials/team-dashboard.jpg',
      },
      {
        id: 'team-step-3',
        title: 'Navigating to Job Locations',
        description: 'Learn how to use the map feature to find your assigned job locations and get directions.',
        videoUrl: '/videos/tutorials/team-navigation.mp4',
      },
      {
        id: 'team-step-4',
        title: 'Taking Verification Photos',
        description: 'Documenting your work with before and after photos is essential. This step shows you how to take and upload verification photos properly.',
        imageUrl: '/images/tutorials/team-photos.jpg',
      },
      {
        id: 'team-step-5',
        title: 'Completing Jobs',
        description: 'Learn the proper procedure for marking jobs as complete and ensuring all requirements are met.',
        imageUrl: '/images/tutorials/team-complete.jpg',
      },
    ],
  },
  {
    id: 'customer-getting-started',
    title: 'Customer: Getting Started',
    description: 'Learn how to book and manage your cleaning services',
    role: 'customer',
    duration: '5 min',
    tags: ['Customer', 'Basics'],
    steps: [
      {
        id: 'customer-step-1',
        title: 'Welcome to We-Clean',
        description: 'Welcome to We-Clean! This tutorial will show you how to book and manage your cleaning services. You\'ll learn how to schedule appointments, view service history, and make payments.',
        imageUrl: '/images/tutorials/customer-welcome.jpg',
      },
      {
        id: 'customer-step-2',
        title: 'Your Customer Dashboard',
        description: 'Your dashboard provides an overview of your upcoming services, service history, and account information. You can easily manage all aspects of your cleaning services from here.',
        imageUrl: '/images/tutorials/customer-dashboard.jpg',
      },
      {
        id: 'customer-step-3',
        title: 'Booking a Cleaning Service',
        description: 'Learn how to book a new cleaning service, select service types, and schedule a convenient time.',
        videoUrl: '/videos/tutorials/customer-booking.mp4',
      },
      {
        id: 'customer-step-4',
        title: 'Viewing Service Results',
        description: 'After your cleaning service is complete, you can view before and after photos to see the results.',
        imageUrl: '/images/tutorials/customer-results.jpg',
      },
      {
        id: 'customer-step-5',
        title: 'Managing Payments and Invoices',
        description: 'Learn how to view invoices, make payments, and manage your billing information.',
        imageUrl: '/images/tutorials/customer-payments.jpg',
      },
    ],
  },
  {
    id: 'using-map-features',
    title: 'Using Map Features',
    description: 'Learn how to use the map for location tracking and navigation',
    role: 'all',
    duration: '4 min',
    tags: ['Maps', 'Navigation'],
    steps: [
      {
        id: 'map-step-1',
        title: 'Introduction to Map Features',
        description: 'We-Clean includes powerful map features for location tracking, navigation, and job visualization. This tutorial will show you how to use these features effectively.',
        imageUrl: '/images/tutorials/map-intro.jpg',
      },
      {
        id: 'map-step-2',
        title: 'Accessing the Map View',
        description: 'Learn how to access the map view from different parts of the application and understand the map interface.',
        imageUrl: '/images/tutorials/map-access.jpg',
      },
      {
        id: 'map-step-3',
        title: 'Understanding Map Markers',
        description: 'The map uses different markers to represent jobs, team members, and other points of interest. Learn what each marker means and how to interact with them.',
        imageUrl: '/images/tutorials/map-markers.jpg',
      },
      {
        id: 'map-step-4',
        title: 'Route Planning and Navigation',
        description: 'Learn how to plan efficient routes between multiple locations and get turn-by-turn navigation.',
        videoUrl: '/videos/tutorials/map-navigation.mp4',
      },
    ],
  },
];

export default OnboardingTutorial;