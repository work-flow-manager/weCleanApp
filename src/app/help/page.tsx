"use client"

import React, { useState, useEffect } from 'react';
import { HelpTopic, HelpCategory } from '@/types/help';
import { HelpService } from '@/lib/services/help-service';
import { HelpSearch } from '@/components/help/help-search';
import { HelpTopicView } from '@/components/help/help-topic-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Loader2, Search, BookOpen, HelpCircle } from 'lucide-react';

export default function HelpCenterPage() {
  const [activeTab, setActiveTab] = useState('browse');
  const [categories, setCategories] = useState<HelpCategory[]>([]);
  const [topics, setTopics] = useState<HelpTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch help content
  useEffect(() => {
    const fetchHelpContent = async () => {
      setIsLoading(true);
      
      try {
        // Fetch categories and topics
        const [categories, topics] = await Promise.all([
          HelpService.getAllCategories(),
          HelpService.getAllTopics()
        ]);
        
        setCategories(categories);
        setTopics(topics);
      } catch (error) {
        console.error('Error fetching help content:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHelpContent();
  }, []);
  
  // Handle topic selection
  const handleSelectTopic = (topic: HelpTopic) => {
    setSelectedTopic(topic);
  };
  
  // Handle back from topic view
  const handleBack = () => {
    setSelectedTopic(null);
  };
  
  // Get topics for a category
  const getTopicsForCategory = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return [];
    
    return topics.filter(topic => category.topics.includes(topic.id));
  };

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center mb-6">
        <HelpCircle className="h-8 w-8 mr-3 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground">
            Find answers to your questions and learn how to use the platform
          </p>
        </div>
      </div>
      
      {selectedTopic ? (
        <HelpTopicView topic={selectedTopic} onBack={handleBack} />
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="browse">
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Topics
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              Search
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <p className="text-muted-foreground">
                  No help categories available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categories.map(category => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {category.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {category.description}
                        </p>
                      )}
                      
                      <Accordion type="single" collapsible>
                        {getTopicsForCategory(category.id).map(topic => (
                          <AccordionItem key={topic.id} value={topic.id}>
                            <AccordionTrigger>{topic.title}</AccordionTrigger>
                            <AccordionContent>
                              <p className="text-sm text-muted-foreground mb-2">
                                {topic.content.substring(0, 150)}
                                {topic.content.length > 150 ? '...' : ''}
                              </p>
                              <button
                                className="text-sm text-primary hover:underline"
                                onClick={() => handleSelectTopic(topic)}
                              >
                                Read more
                              </button>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="search">
            <Card>
              <CardContent className="p-6">
                <HelpSearch onSelectTopic={handleSelectTopic} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}