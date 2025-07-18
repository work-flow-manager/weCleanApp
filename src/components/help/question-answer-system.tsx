import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Search } from 'lucide-react';

// FAQ data structure
interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

// Sample FAQ data
const faqs: FAQ[] = [
  {
    id: '1',
    question: 'How do I create a new cleaning job?',
    answer: 'To create a new job, navigate to the Jobs section and click on "Create New Job". Fill in the required information including customer details, service type, date, time, and location. Once all information is entered, click "Create Job" to save it.',
    category: 'jobs',
  },
  {
    id: '2',
    question: 'How do I upload verification photos?',
    answer: 'To upload verification photos, open the job details page for the job you\'re working on. Click on "Upload Photos" and select whether they are "before" or "after" photos. You can take photos directly with your device camera or upload existing photos from your gallery.',
    category: 'photos',
  },
  {
    id: '3',
    question: 'How do I view my team\'s location?',
    answer: 'To view your team\'s location, go to the Map section in the sidebar. The map will display the current location of all active team members. You can click on a team member\'s marker to see more details about their current job and status.',
    category: 'tracking',
  },
  {
    id: '4',
    question: 'How do I generate an invoice?',
    answer: 'Invoices are automatically generated when a job is marked as complete. To manually generate an invoice, go to the job details page and click on "Generate Invoice". You can then review the invoice details before finalizing it.',
    category: 'invoices',
  },
  {
    id: '5',
    question: 'How do I change the platform language?',
    answer: 'To change the language, click on the language selector in the top-right corner of any page. You can choose from English, Spanish, or Portuguese. Your language preference will be saved for future sessions.',
    category: 'settings',
  },
  {
    id: '6',
    question: 'How do I customize the platform appearance?',
    answer: 'To customize the platform appearance, go to Settings > Customization. There you can change the color scheme, upload your company logo, and adjust other branding elements to match your business identity.',
    category: 'settings',
  },
  {
    id: '7',
    question: 'How do I assign team members to a job?',
    answer: 'To assign team members to a job, open the job details page and click on "Assign Team". You can select one or more team members from the list and specify their roles for this particular job. Team members will be notified of their new assignment.',
    category: 'jobs',
  },
  {
    id: '8',
    question: 'How do I view customer reviews?',
    answer: 'To view customer reviews, go to the Reviews section in the sidebar. You can see all reviews sorted by date, filter by rating, and respond to reviews if needed. Individual team member reviews can be viewed on their profile pages.',
    category: 'reviews',
  },
  {
    id: '9',
    question: 'How do I export reports?',
    answer: 'To export reports, go to the Analytics section and select the report you want to export. Click on the "Export" button and choose your preferred format (PDF, CSV, or Excel). The report will be downloaded to your device.',
    category: 'analytics',
  },
  {
    id: '10',
    question: 'How do I set up notifications?',
    answer: 'To set up notifications, go to Settings > Notifications. You can choose which types of notifications you want to receive (email, push, or SMS) and for which events. You can also set quiet hours during which you won\'t receive notifications.',
    category: 'settings',
  },
];

// Categories for filtering
const categories = [
  { id: 'all', name: 'All Questions' },
  { id: 'jobs', name: 'Jobs' },
  { id: 'photos', name: 'Photos' },
  { id: 'tracking', name: 'Location Tracking' },
  { id: 'invoices', name: 'Invoices' },
  { id: 'settings', name: 'Settings' },
  { id: 'reviews', name: 'Reviews' },
  { id: 'analytics', name: 'Analytics' },
];

export function QuestionAnswerSystem() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Filter FAQs based on search query and selected category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Auto-expand all items when searching
    if (e.target.value) {
      setExpandedItems(filteredFaqs.map(faq => faq.id));
    } else {
      setExpandedItems([]);
    }
  };

  // Handle category selection
  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setExpandedItems([]);
  };

  // Handle accordion item toggle
  const toggleAccordionItem = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  return (
    <Card className="w-full shadow-sm border-pink-100">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100/50">
        <CardTitle className="text-xl font-semibold text-gray-800">Frequently Asked Questions</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4">
        {/* Search input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 border-pink-200 focus-visible:ring-pink-500"
          />
        </div>
        
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category.id)}
              className={selectedCategory === category.id 
                ? "bg-pink-500 hover:bg-pink-600" 
                : "border-pink-200 hover:bg-pink-50"
              }
            >
              {category.name}
            </Button>
          ))}
        </div>
        
        {/* FAQ accordion */}
        {filteredFaqs.length > 0 ? (
          <Accordion type="multiple" value={expandedItems} className="w-full">
            {filteredFaqs.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id}>
                <AccordionTrigger 
                  onClick={() => toggleAccordionItem(faq.id)}
                  className="hover:text-pink-700"
                >
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-2 text-gray-700">
                    {faq.answer}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No questions found matching your search.</p>
            <p className="mt-2 text-sm">Try adjusting your search terms or category filter.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="bg-gray-50 border-t border-pink-100 p-4">
        <p className="text-sm text-gray-500">
          Can't find what you're looking for? Contact support or use the interactive assistant for more help.
        </p>
      </CardFooter>
    </Card>
  );
}

export default QuestionAnswerSystem;