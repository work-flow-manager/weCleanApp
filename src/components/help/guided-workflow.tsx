import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Workflow step interface
interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

// Workflow interface
interface Workflow {
  id: string;
  title: string;
  description: string;
  steps: WorkflowStep[];
}

// Props interface
interface GuidedWorkflowProps {
  workflow: Workflow;
  onComplete?: () => void;
  className?: string;
}

export function GuidedWorkflow({ workflow, onComplete, className }: GuidedWorkflowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  
  const currentStep = workflow.steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === workflow.steps.length - 1;
  const progress = ((currentStepIndex + 1) / workflow.steps.length) * 100;
  
  // Navigate to previous step
  const goToPreviousStep = () => {
    if (!isFirstStep) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  // Navigate to next step
  const goToNextStep = () => {
    if (!isLastStep) {
      // Mark current step as completed
      if (!completedSteps.includes(currentStep.id)) {
        setCompletedSteps([...completedSteps, currentStep.id]);
      }
      
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      // Complete the workflow
      if (!completedSteps.includes(currentStep.id)) {
        setCompletedSteps([...completedSteps, currentStep.id]);
      }
      
      if (onComplete) {
        onComplete();
      }
    }
  };
  
  return (
    <Card className={cn("w-full shadow-sm border-pink-100", className)}>
      <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100/50">
        <CardTitle className="text-xl font-semibold text-gray-800">{workflow.title}</CardTitle>
        <Progress value={progress} className="h-2 bg-gray-200" />
        <div className="text-sm text-gray-500 mt-1">
          Step {currentStepIndex + 1} of {workflow.steps.length}
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800">{currentStep.title}</h3>
          
          {currentStep.imageUrl && (
            <div className="rounded-md overflow-hidden border border-gray-200 my-4">
              <img 
                src={currentStep.imageUrl} 
                alt={currentStep.title} 
                className="w-full h-auto object-cover"
              />
            </div>
          )}
          
          <p className="text-gray-700">{currentStep.description}</p>
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-pink-100 p-4 bg-gray-50">
        <Button
          variant="outline"
          onClick={goToPreviousStep}
          disabled={isFirstStep}
          className="border-pink-200 hover:bg-pink-50"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Previous
        </Button>
        
        <Button
          onClick={goToNextStep}
          className="bg-pink-500 hover:bg-pink-600"
        >
          {isLastStep ? (
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
      </CardFooter>
    </Card>
  );
}

// Example workflow data
export const exampleWorkflows: Workflow[] = [
  {
    id: 'create-job',
    title: 'How to Create a New Job',
    description: 'Learn how to create a new cleaning job in the system',
    steps: [
      {
        id: 'step1',
        title: 'Navigate to Jobs Section',
        description: 'Start by clicking on the "Jobs" item in the sidebar navigation. This will take you to the jobs management page where you can view and create jobs.',
        imageUrl: '/images/help/create-job-1.jpg',
      },
      {
        id: 'step2',
        title: 'Click Create New Job',
        description: 'Look for the "Create New Job" button in the top-right corner of the jobs page and click on it. This will open the job creation form.',
        imageUrl: '/images/help/create-job-2.jpg',
      },
      {
        id: 'step3',
        title: 'Enter Customer Information',
        description: 'In the first section of the form, enter customer details. You can select an existing customer from the dropdown or create a new one by filling in their information.',
        imageUrl: '/images/help/create-job-3.jpg',
      },
      {
        id: 'step4',
        title: 'Select Service Type',
        description: 'Choose the appropriate service type from the dropdown menu. This will determine the default duration and pricing for the job.',
        imageUrl: '/images/help/create-job-4.jpg',
      },
      {
        id: 'step5',
        title: 'Schedule the Job',
        description: 'Select the date and time for the job using the calendar and time picker. Make sure to check team availability before confirming.',
        imageUrl: '/images/help/create-job-5.jpg',
      },
      {
        id: 'step6',
        title: 'Add Job Details',
        description: 'Enter a descriptive title for the job and any additional details or special instructions in the provided fields.',
        imageUrl: '/images/help/create-job-6.jpg',
      },
      {
        id: 'step7',
        title: 'Review and Create',
        description: 'Review all the information you\'ve entered to ensure it\'s correct, then click the "Create Job" button at the bottom of the form to save the new job.',
        imageUrl: '/images/help/create-job-7.jpg',
      },
    ],
  },
  {
    id: 'complete-job',
    title: 'How to Complete a Job with Verification',
    description: 'Learn how to properly complete a job with photo verification',
    steps: [
      {
        id: 'step1',
        title: 'Access Your Assigned Job',
        description: 'From your dashboard, find the job you want to complete in your assigned jobs list and click on it to view the details.',
      },
      {
        id: 'step2',
        title: 'Start the Job',
        description: 'When you arrive at the job location, click the "Start Job" button to change the status to "In Progress".',
      },
      {
        id: 'step3',
        title: 'Take Before Photos',
        description: 'Before beginning work, click "Upload Photos" and select "Before" to document the initial state of the areas to be cleaned.',
      },
      {
        id: 'step4',
        title: 'Perform the Cleaning',
        description: 'Complete all required cleaning tasks according to the job specifications and service type requirements.',
      },
      {
        id: 'step5',
        title: 'Take After Photos',
        description: 'Once cleaning is complete, click "Upload Photos" again and select "After" to document the results of your work.',
      },
      {
        id: 'step6',
        title: 'Add Notes (Optional)',
        description: 'Add any relevant notes about the job, such as areas that needed special attention or any issues encountered.',
      },
      {
        id: 'step7',
        title: 'Complete the Job',
        description: 'Click the "Mark as Complete" button to finalize the job. This will notify the customer and generate an invoice if applicable.',
      },
    ],
  },
];

export default GuidedWorkflow;