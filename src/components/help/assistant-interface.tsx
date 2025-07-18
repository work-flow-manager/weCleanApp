import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Bot, Send, X, Minimize2, Maximize2, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define message types
type MessageType = 'user' | 'assistant' | 'system';

interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

// Common assistant responses for demo purposes
const assistantResponses = {
  greeting: "Hello! I'm your We-Clean assistant. How can I help you today?",
  notUnderstood: "I'm not sure I understand. Could you please rephrase your question?",
  jobCreation: "To create a new job, go to the Jobs section and click on 'Create New Job'. You'll need to fill in details like customer information, service type, date, and time.",
  photoUpload: "You can upload job verification photos by going to the job details page and clicking on 'Upload Photos'. Make sure to take clear before and after photos.",
  scheduleHelp: "To view your schedule, go to the Dashboard and check the 'Upcoming Jobs' section. You can also view the full calendar by clicking on 'Calendar View'.",
  invoiceHelp: "Invoices are automatically generated when a job is marked as complete. You can view and manage all invoices in the 'Invoices' section.",
  teamLocation: "You can track your team's location in real-time from the Map view. This helps you monitor progress and optimize routes.",
  customization: "To customize your platform appearance, go to Settings > Customization. There you can change colors, upload your logo, and adjust other branding elements.",
  languageChange: "You can change your language preference by clicking on the language selector in the top-right corner of any page.",
};

// Predefined workflows for common tasks
const guidedWorkflows = [
  { id: 'create-job', title: 'Create a new job' },
  { id: 'complete-job', title: 'Complete a job with verification' },
  { id: 'track-team', title: 'Track team location' },
  { id: 'generate-invoice', title: 'Generate and send an invoice' },
  { id: 'customize-platform', title: 'Customize platform appearance' },
];

// Troubleshooting topics
const troubleshootingTopics = [
  { id: 'login-issues', title: 'Login issues' },
  { id: 'photo-upload-problems', title: 'Photo upload problems' },
  { id: 'missing-notifications', title: 'Missing notifications' },
  { id: 'payment-failures', title: 'Payment processing failures' },
  { id: 'location-tracking-issues', title: 'Location tracking issues' },
];

export function AssistantInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: assistantResponses.greeting,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [workflowStep, setWorkflowStep] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle user message submission
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newUserMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');

    // Process the message and generate a response
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const newAssistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newAssistantMessage]);
    }, 500);
  };

  // Simple response generation based on keywords
  const generateResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('hello') || input.includes('hi') || input.includes('hey')) {
      return assistantResponses.greeting;
    } else if (input.includes('job') && (input.includes('create') || input.includes('new') || input.includes('add'))) {
      return assistantResponses.jobCreation;
    } else if (input.includes('photo') || input.includes('picture') || input.includes('image')) {
      return assistantResponses.photoUpload;
    } else if (input.includes('schedule') || input.includes('calendar')) {
      return assistantResponses.scheduleHelp;
    } else if (input.includes('invoice') || input.includes('payment') || input.includes('bill')) {
      return assistantResponses.invoiceHelp;
    } else if (input.includes('team') && input.includes('location')) {
      return assistantResponses.teamLocation;
    } else if (input.includes('customize') || input.includes('brand') || input.includes('logo')) {
      return assistantResponses.customization;
    } else if (input.includes('language') || input.includes('translate')) {
      return assistantResponses.languageChange;
    } else {
      return assistantResponses.notUnderstood;
    }
  };

  // Start a guided workflow
  const startWorkflow = (workflowId: string) => {
    setActiveWorkflow(workflowId);
    setWorkflowStep(0);
    
    // Add system message to indicate workflow start
    const workflowTitle = guidedWorkflows.find(w => w.id === workflowId)?.title || '';
    
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `Starting guided workflow: ${workflowTitle}`,
      timestamp: new Date(),
    };
    
    // Add first step message
    const firstStepMessage = getWorkflowStep(workflowId, 0);
    
    setMessages(prev => [...prev, systemMessage, firstStepMessage]);
  };

  // Get workflow step content
  const getWorkflowStep = (workflowId: string, step: number): Message => {
    let content = '';
    
    // Define workflow steps based on workflow ID
    switch (workflowId) {
      case 'create-job':
        const createJobSteps = [
          "Let's create a new job. First, navigate to the Jobs section in the sidebar.",
          "Click on the 'Create New Job' button in the top-right corner.",
          "Fill in the customer information. You can select an existing customer or create a new one.",
          "Select the service type and enter job details like title and description.",
          "Choose the scheduled date and time for the job.",
          "Add any special instructions if needed.",
          "Review all information and click 'Create Job' to finish.",
          "Great! You've successfully created a new job. It will now appear in your job list and be assigned to team members."
        ];
        content = createJobSteps[step] || "Workflow completed!";
        break;
        
      case 'complete-job':
        const completeJobSteps = [
          "Let's complete a job with verification. First, go to your assigned jobs list.",
          "Find the job you want to complete and click on it to view details.",
          "When you arrive at the job site, click 'Start Job' to change its status to in-progress.",
          "After completing the cleaning work, click on 'Upload Verification Photos'.",
          "Take or upload 'before' and 'after' photos of the cleaned areas.",
          "Add any notes about the job completion if necessary.",
          "Click 'Mark as Complete' to finalize the job.",
          "The customer will be notified and can now leave a review. Great job!"
        ];
        content = completeJobSteps[step] || "Workflow completed!";
        break;
        
      // Add other workflows as needed
      default:
        content = "This workflow is not yet available. Please check back later.";
    }
    
    return {
      id: Date.now().toString(),
      type: 'assistant',
      content,
      timestamp: new Date(),
    };
  };

  // Advance to next workflow step
  const nextWorkflowStep = () => {
    if (!activeWorkflow) return;
    
    const nextStep = workflowStep + 1;
    setWorkflowStep(nextStep);
    
    // Check if workflow is complete
    const isLastStep = (activeWorkflow === 'create-job' && nextStep >= 8) || 
                      (activeWorkflow === 'complete-job' && nextStep >= 8);
    
    if (isLastStep) {
      // End workflow
      const systemMessage: Message = {
        id: Date.now().toString(),
        type: 'system',
        content: 'Workflow completed! Is there anything else you need help with?',
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, systemMessage]);
      setActiveWorkflow(null);
    } else {
      // Add next step message
      const stepMessage = getWorkflowStep(activeWorkflow, nextStep);
      setMessages(prev => [...prev, stepMessage]);
    }
  };

  // Start troubleshooting wizard
  const startTroubleshooting = (topicId: string) => {
    const topicTitle = troubleshootingTopics.find(t => t.id === topicId)?.title || '';
    
    // Add system message
    const systemMessage: Message = {
      id: Date.now().toString(),
      type: 'system',
      content: `Troubleshooting: ${topicTitle}`,
      timestamp: new Date(),
    };
    
    // Add troubleshooting content based on topic
    let troubleshootingContent = '';
    
    switch (topicId) {
      case 'login-issues':
        troubleshootingContent = "If you're having trouble logging in:\n\n1. Make sure you're using the correct email address\n2. Check if your password is correct (case sensitive)\n3. Try resetting your password using the 'Forgot Password' link\n4. Clear your browser cache and cookies\n5. Try using a different browser\n\nIf you still can't log in, please contact support.";
        break;
      case 'photo-upload-problems':
        troubleshootingContent = "If you're having issues uploading photos:\n\n1. Check your internet connection\n2. Make sure the photo size is under 10MB\n3. Try using a different photo\n4. Ensure you're using a supported format (JPG, PNG)\n5. If on mobile, try giving the app camera permissions\n\nStill having issues? Contact technical support.";
        break;
      // Add other troubleshooting topics
      default:
        troubleshootingContent = "Troubleshooting information for this topic is being updated. Please check back later or contact support for immediate assistance.";
    }
    
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: troubleshootingContent,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, systemMessage, assistantMessage]);
  };

  return (
    <>
      {/* Floating button for collapsed state */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full p-3 bg-pink-500 hover:bg-pink-600 shadow-lg"
          aria-label="Open assistant"
        >
          <HelpCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Assistant drawer */}
      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className={cn(
          "fixed bottom-0 right-0 w-full sm:w-[400px] rounded-t-lg border border-pink-200 bg-white/80 backdrop-blur-lg",
          isExpanded ? "h-[80vh]" : "h-[500px]"
        )}>
          <DrawerHeader className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-pink-100/50 flex justify-between items-center">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2 bg-pink-500">
                <Bot className="h-5 w-5 text-white" />
              </Avatar>
              <DrawerTitle>We-Clean Assistant</DrawerTitle>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8"
              >
                {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DrawerHeader>

          <div className="flex flex-col h-full">
            {/* Messages area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      message.type === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    {message.type === 'system' ? (
                      <div className="w-full text-center my-2">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          {message.content}
                        </span>
                      </div>
                    ) : (
                      <div
                        className={cn(
                          "max-w-[80%] rounded-lg p-3",
                          message.type === 'user'
                            ? "bg-pink-500 text-white ml-auto"
                            : "bg-gray-100 text-gray-800"
                        )}
                      >
                        {message.content}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Guided workflows section */}
            {!activeWorkflow && messages.length < 3 && (
              <div className="px-4 py-2 border-t border-pink-100">
                <h4 className="text-sm font-medium mb-2">Guided Workflows</h4>
                <div className="flex flex-wrap gap-2 mb-2">
                  {guidedWorkflows.slice(0, 3).map((workflow) => (
                    <Button
                      key={workflow.id}
                      variant="outline"
                      size="sm"
                      className="text-xs border-pink-200 hover:bg-pink-50"
                      onClick={() => startWorkflow(workflow.id)}
                    >
                      {workflow.title}
                    </Button>
                  ))}
                </div>
                <h4 className="text-sm font-medium mb-2">Troubleshooting</h4>
                <div className="flex flex-wrap gap-2">
                  {troubleshootingTopics.slice(0, 3).map((topic) => (
                    <Button
                      key={topic.id}
                      variant="outline"
                      size="sm"
                      className="text-xs border-pink-200 hover:bg-pink-50"
                      onClick={() => startTroubleshooting(topic.id)}
                    >
                      {topic.title}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Workflow navigation */}
            {activeWorkflow && (
              <div className="px-4 py-2 border-t border-pink-100 flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Step {workflowStep + 1} of {activeWorkflow === 'create-job' ? 8 : 8}
                </span>
                <Button 
                  size="sm" 
                  onClick={nextWorkflowStep}
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  Next Step
                </Button>
              </div>
            )}

            {/* Input area */}
            <div className="p-4 border-t border-pink-100">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 border-pink-200 focus-visible:ring-pink-500"
                />
                <Button 
                  type="submit" 
                  size="icon"
                  className="bg-pink-500 hover:bg-pink-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default AssistantInterface;