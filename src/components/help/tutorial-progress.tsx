import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/supabase';
import { tutorials } from './onboarding-tutorial';

// Tutorial progress interface
interface TutorialProgressData {
  tutorialId: string;
  userId: string;
  currentStep: number;
  totalSteps: number;
  lastAccessedAt: string;
  completed: boolean;
  completedAt?: string;
}

// Props interface
interface TutorialProgressProps {
  userRole: UserRole;
  userId: string;
  onContinueTutorial?: (tutorialId: string) => void;
  className?: string;
}

export function TutorialProgress({ 
  userRole, 
  userId, 
  onContinueTutorial,
  className 
}: TutorialProgressProps) {
  // Sample tutorial progress data
  const tutorialProgressData: TutorialProgressData[] = [
    {
      tutorialId: 'admin-getting-started',
      userId,
      currentStep: 3,
      totalSteps: 5,
      lastAccessedAt: '2023-06-15T10:30:00Z',
      completed: false,
    },
    {
      tutorialId: 'using-map-features',
      userId,
      currentStep: 4,
      totalSteps: 4,
      lastAccessedAt: '2023-06-18T14:45:00Z',
      completed: true,
      completedAt: '2023-06-18T14:45:00Z',
    },
  ];
  
  // Filter tutorials based on user role
  const userTutorials = tutorials.filter(tutorial => 
    tutorial.role === 'all' || tutorial.role === userRole
  );
  
  // Get progress for each tutorial
  const tutorialsWithProgress = userTutorials.map(tutorial => {
    const progress = tutorialProgressData.find(p => p.tutorialId === tutorial.id);
    
    return {
      ...tutorial,
      progress: progress ? (progress.currentStep / progress.totalSteps) * 100 : 0,
      currentStep: progress?.currentStep || 0,
      totalSteps: tutorial.steps.length,
      completed: progress?.completed || false,
      lastAccessedAt: progress?.lastAccessedAt,
      completedAt: progress?.completedAt,
    };
  });
  
  // Sort tutorials: in-progress first, then not started, then completed
  const sortedTutorials = [...tutorialsWithProgress].sort((a, b) => {
    if (a.progress > 0 && a.progress < 100 && (b.progress === 0 || b.progress === 100)) return -1;
    if (b.progress > 0 && b.progress < 100 && (a.progress === 0 || a.progress === 100)) return 1;
    if (a.progress === 0 && b.progress === 100) return -1;
    if (b.progress === 0 && a.progress === 100) return 1;
    return 0;
  });
  
  // Calculate overall progress
  const completedTutorials = tutorialsWithProgress.filter(t => t.completed).length;
  const totalTutorials = tutorialsWithProgress.length;
  const overallProgress = totalTutorials > 0 
    ? (completedTutorials / totalTutorials) * 100 
    : 0;
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Handle continue tutorial
  const handleContinueTutorial = (tutorialId: string) => {
    if (onContinueTutorial) {
      onContinueTutorial(tutorialId);
    }
  };
  
  return (
    <Card className={cn("shadow-sm border-pink-100", className)}>
      <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100/50">
        <CardTitle className="text-xl font-semibold text-gray-800">Your Tutorial Progress</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="space-y-6">
          {/* Overall progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Overall Progress</span>
              <span className="text-sm text-gray-500">
                {completedTutorials} of {totalTutorials} completed
              </span>
            </div>
            <Progress value={overallProgress} className="h-2 bg-gray-200" />
          </div>
          
          {/* Tutorial list */}
          <div className="space-y-4">
            {sortedTutorials.map((tutorial) => (
              <div 
                key={tutorial.id} 
                className={cn(
                  "border rounded-md p-3 transition-colors",
                  tutorial.completed 
                    ? "border-green-200 bg-green-50/50" 
                    : tutorial.progress > 0 
                      ? "border-amber-200 bg-amber-50/50" 
                      : "border-gray-200"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-800">{tutorial.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">{tutorial.description}</p>
                  </div>
                  
                  {tutorial.completed ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Completed
                    </Badge>
                  ) : tutorial.progress > 0 ? (
                    <Badge variant="outline" className="border-amber-500 text-amber-600">
                      <Clock className="mr-1 h-3 w-3" />
                      In Progress
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-500 text-gray-600">
                      Not Started
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {tutorial.progress > 0 && !tutorial.completed 
                        ? `Step ${tutorial.currentStep} of ${tutorial.totalSteps}` 
                        : `${tutorial.totalSteps} steps`}
                    </span>
                    <span>{tutorial.duration}</span>
                  </div>
                  
                  <Progress 
                    value={tutorial.progress} 
                    className={`h-1.5 bg-gray-200 ${tutorial.completed ? "[&>div]:bg-green-500" : "[&>div]:bg-pink-500"}`}
                  />
                </div>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="text-xs text-gray-500">
                    {tutorial.completed 
                      ? `Completed on ${formatDate(tutorial.completedAt)}` 
                      : tutorial.lastAccessedAt 
                        ? `Last accessed on ${formatDate(tutorial.lastAccessedAt)}` 
                        : ''}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleContinueTutorial(tutorial.id)}
                    className={cn(
                      "text-xs",
                      tutorial.completed 
                        ? "border-green-200 text-green-700 hover:bg-green-50" 
                        : "border-pink-200 text-pink-700 hover:bg-pink-50"
                    )}
                  >
                    {tutorial.completed ? (
                      <>Review</>
                    ) : tutorial.progress > 0 ? (
                      <>Continue</>
                    ) : (
                      <>
                        <Play className="mr-1 h-3 w-3" />
                        Start
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TutorialProgress;