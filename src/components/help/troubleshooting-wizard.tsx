import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, ArrowRight, RotateCcw, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// Troubleshooting step interface
interface TroubleshootingStep {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    nextStepId: string;
  }[];
}

// Solution interface
interface Solution {
  id: string;
  title: string;
  description: string;
  steps?: string[];
  isSuccess: boolean;
  linkText?: string;
  linkUrl?: string;
}

// Troubleshooting topic interface
interface TroubleshootingTopic {
  id: string;
  title: string;
  description: string;
  initialStepId: string;
  steps: TroubleshootingStep[];
  solutions: Solution[];
}

// Props interface
interface TroubleshootingWizardProps {
  topic: TroubleshootingTopic;
  onClose?: () => void;
  className?: string;
}

export function TroubleshootingWizard({ topic, onClose, className }: TroubleshootingWizardProps) {
  const [currentStepId, setCurrentStepId] = useState<string>(topic.initialStepId);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [currentSolution, setCurrentSolution] = useState<Solution | null>(null);
  
  // Find current step or solution
  const currentStep = topic.steps.find(step => step.id === currentStepId);
  
  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };
  
  // Handle next step
  const handleNext = () => {
    if (!currentStep || !selectedOption) return;
    
    const selectedOptionObj = currentStep.options.find(option => option.id === selectedOption);
    if (!selectedOptionObj) return;
    
    const nextStepId = selectedOptionObj.nextStepId;
    
    // Check if next step is a solution
    if (nextStepId.startsWith('solution-')) {
      const solutionId = nextStepId.replace('solution-', '');
      const solution = topic.solutions.find(sol => sol.id === solutionId);
      
      if (solution) {
        setCurrentSolution(solution);
      }
    } else {
      // Move to next question
      setCurrentStepId(nextStepId);
      setSelectedOption('');
    }
  };
  
  // Handle restart
  const handleRestart = () => {
    setCurrentStepId(topic.initialStepId);
    setSelectedOption('');
    setCurrentSolution(null);
  };
  
  return (
    <Card className={cn("w-full shadow-sm border-pink-100", className)}>
      <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100/50">
        <CardTitle className="text-xl font-semibold text-gray-800">
          {currentSolution ? 'Solution' : topic.title}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        {currentSolution ? (
          // Display solution
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              {currentSolution.isSuccess ? (
                <CheckCircle className="h-6 w-6 text-green-500" />
              ) : (
                <AlertCircle className="h-6 w-6 text-amber-500" />
              )}
              <h3 className="text-lg font-medium text-gray-800">{currentSolution.title}</h3>
            </div>
            
            <p className="text-gray-700">{currentSolution.description}</p>
            
            {currentSolution.steps && currentSolution.steps.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-800 mb-2">Follow these steps:</h4>
                <ol className="list-decimal pl-5 space-y-2">
                  {currentSolution.steps.map((step, index) => (
                    <li key={index} className="text-gray-700">{step}</li>
                  ))}
                </ol>
              </div>
            )}
            
            {currentSolution.linkText && currentSolution.linkUrl && (
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 border-pink-200 hover:bg-pink-50"
                  asChild
                >
                  <a href={currentSolution.linkUrl} target="_blank" rel="noopener noreferrer">
                    {currentSolution.linkText}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        ) : (
          // Display current step
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-800">{currentStep?.question}</h3>
            
            <RadioGroup value={selectedOption} onValueChange={handleOptionSelect}>
              <div className="space-y-3">
                {currentStep?.options.map((option) => (
                  <div
                    key={option.id}
                    className={cn(
                      "flex items-center space-x-2 rounded-md border p-3",
                      selectedOption === option.id
                        ? "border-pink-500 bg-pink-50"
                        : "border-gray-200"
                    )}
                  >
                    <RadioGroupItem
                      value={option.id}
                      id={option.id}
                      className="border-pink-500 text-pink-500"
                    />
                    <Label
                      htmlFor={option.id}
                      className="flex-1 cursor-pointer font-normal"
                    >
                      {option.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t border-pink-100 p-4 bg-gray-50">
        <Button
          variant="outline"
          onClick={handleRestart}
          className="border-pink-200 hover:bg-pink-50"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart
        </Button>
        
        {!currentSolution && (
          <Button
            onClick={handleNext}
            disabled={!selectedOption}
            className="bg-pink-500 hover:bg-pink-600"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {currentSolution && onClose && (
          <Button
            onClick={onClose}
            className="bg-pink-500 hover:bg-pink-600"
          >
            Close
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

// Example troubleshooting topic data
export const loginTroubleshootingTopic: TroubleshootingTopic = {
  id: 'login-issues',
  title: 'Login Issues Troubleshooter',
  description: 'Solve common login problems',
  initialStepId: 'login-step-1',
  steps: [
    {
      id: 'login-step-1',
      question: 'What happens when you try to log in?',
      options: [
        { id: 'option-1-1', text: 'I get an "Incorrect email or password" error', nextStepId: 'login-step-2' },
        { id: 'option-1-2', text: 'I get a "Your account is locked" message', nextStepId: 'solution-account-locked' },
        { id: 'option-1-3', text: 'The page just refreshes without any error', nextStepId: 'login-step-3' },
        { id: 'option-1-4', text: 'The login button doesn\'t do anything when clicked', nextStepId: 'login-step-4' },
      ],
    },
    {
      id: 'login-step-2',
      question: 'Have you tried resetting your password?',
      options: [
        { id: 'option-2-1', text: 'Yes, but I didn\'t receive the reset email', nextStepId: 'solution-no-reset-email' },
        { id: 'option-2-2', text: 'Yes, but the new password still doesn\'t work', nextStepId: 'solution-contact-support' },
        { id: 'option-2-3', text: 'No, I haven\'t tried that yet', nextStepId: 'solution-try-password-reset' },
      ],
    },
    {
      id: 'login-step-3',
      question: 'Have you tried clearing your browser cache and cookies?',
      options: [
        { id: 'option-3-1', text: 'Yes, but it didn\'t help', nextStepId: 'solution-try-different-browser' },
        { id: 'option-3-2', text: 'No, I haven\'t tried that yet', nextStepId: 'solution-clear-cache' },
      ],
    },
    {
      id: 'login-step-4',
      question: 'What browser are you using?',
      options: [
        { id: 'option-4-1', text: 'Internet Explorer', nextStepId: 'solution-outdated-browser' },
        { id: 'option-4-2', text: 'Chrome, Firefox, Safari, or Edge', nextStepId: 'solution-javascript-issue' },
        { id: 'option-4-3', text: 'A mobile browser', nextStepId: 'solution-try-desktop' },
      ],
    },
  ],
  solutions: [
    {
      id: 'try-password-reset',
      title: 'Try Resetting Your Password',
      description: 'It sounds like you might have forgotten your password or it may have been changed.',
      steps: [
        'Click on the "Forgot Password" link on the login page',
        'Enter your email address and submit the form',
        'Check your email inbox for a password reset link',
        'Click the link and create a new password',
        'Try logging in with your new password',
      ],
      isSuccess: true,
    },
    {
      id: 'account-locked',
      title: 'Your Account is Locked',
      description: 'Your account has been locked due to multiple failed login attempts or by an administrator.',
      steps: [
        'Wait for 30 minutes before trying again',
        'If you still can\'t log in, contact your administrator or our support team',
      ],
      isSuccess: false,
      linkText: 'Contact Support',
      linkUrl: '/support',
    },
    {
      id: 'no-reset-email',
      title: 'Reset Email Not Received',
      description: 'If you didn\'t receive the password reset email, try these steps:',
      steps: [
        'Check your spam or junk folder',
        'Make sure you entered the correct email address',
        'Add noreply@weclean.app to your contacts',
        'Try requesting another reset email',
        'If you still don\'t receive it, contact support',
      ],
      isSuccess: false,
      linkText: 'Contact Support',
      linkUrl: '/support',
    },
    {
      id: 'clear-cache',
      title: 'Clear Your Browser Cache',
      description: 'Clearing your browser cache and cookies can resolve many login issues.',
      steps: [
        'Open your browser settings',
        'Find the privacy or history section',
        'Select the option to clear browsing data',
        'Make sure to include cookies and cached files',
        'After clearing, restart your browser and try logging in again',
      ],
      isSuccess: true,
    },
    {
      id: 'try-different-browser',
      title: 'Try a Different Browser',
      description: 'If clearing your cache didn\'t work, the issue might be browser-specific.',
      steps: [
        'Try logging in using a different browser (Chrome, Firefox, Edge, or Safari)',
        'If you can log in with a different browser, your original browser might need updating or have conflicting extensions',
      ],
      isSuccess: true,
    },
    {
      id: 'outdated-browser',
      title: 'Upgrade Your Browser',
      description: 'Internet Explorer is no longer supported. Our platform requires a modern browser.',
      steps: [
        'Download and install a modern browser like Chrome, Firefox, Edge, or Safari',
        'Open the new browser and navigate to our login page',
        'Try logging in again',
      ],
      isSuccess: true,
      linkText: 'Download Chrome',
      linkUrl: 'https://www.google.com/chrome/',
    },
    {
      id: 'javascript-issue',
      title: 'JavaScript May Be Disabled',
      description: 'Our login system requires JavaScript to be enabled in your browser.',
      steps: [
        'Check if JavaScript is enabled in your browser settings',
        'If it\'s disabled, enable it and refresh the page',
        'If JavaScript is already enabled, try disabling browser extensions that might be interfering',
      ],
      isSuccess: true,
    },
    {
      id: 'try-desktop',
      title: 'Try a Desktop Browser',
      description: 'Some mobile browsers might have compatibility issues with our platform.',
      steps: [
        'If possible, try logging in using a desktop or laptop computer',
        'If you must use a mobile device, make sure you\'re using the latest version of Chrome or Safari',
        'Try using our mobile app instead of the browser version',
      ],
      isSuccess: true,
      linkText: 'Download Our App',
      linkUrl: '/download-app',
    },
    {
      id: 'contact-support',
      title: 'Contact Support',
      description: 'We\'re sorry you\'re still having trouble logging in. Our support team can help you resolve this issue.',
      steps: [
        'Email us at support@weclean.app',
        'Include your username/email and a description of the issue',
        'If possible, include screenshots of any error messages',
        'Our team will respond within 24 hours',
      ],
      isSuccess: false,
      linkText: 'Contact Support',
      linkUrl: '/support',
    },
  ],
};

export default TroubleshootingWizard;