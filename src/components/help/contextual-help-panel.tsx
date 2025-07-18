"use client"

import React, { useState, useEffect } from 'react';
import { HelpTopic, HelpContext } from '@/types/help';
import { HelpService } from '@/lib/services/help-service';
import { HelpSearch } from './help-search';
import { HelpTopicView } from './help-topic-view';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Loader2, HelpCircle, Search, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualHelpPanelProps {
  context: HelpContext;
  className?: string;
}

export function ContextualHelpPanel({ context, className }: ContextualHelpPanelProps) {
  const [activeTab, setActiveTab] = useState('contextual');
  const [contextualTopics, setContextualTopics] = useState<HelpTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch contextual help topics
  useEffect(() => {
    const fetchContextualHelp = async () => {
      setIsLoading(true);
      
      try {
        const topics = await HelpService.getContextualHelp({
          context,
          limit: 5
        });
        
        setContextualTopics(topics);
      } catch (error) {
        console.error('Error fetching contextual help:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchContextualHelp();
  }, [context]);
  
  // Handle topic selection
  const handleSelectTopic = (topic: HelpTopic) => {
    setSelectedTopic(topic);
  };
  
  // Handle back from topic view
  const handleBack = () => {
    setSelectedTopic(null);
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <HelpCircle className="h-5 w-5 mr-2" />
          Help Center
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {selectedTopic ? (
          <HelpTopicView topic={selectedTopic} onBack={handleBack} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 pb-2 border-b">
              <TabsList className="w-full">
                <TabsTrigger value="contextual" className="flex-1">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Contextual Help
                </TabsTrigger>
                <TabsTrigger value="search" className="flex-1">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="contextual" className="m-0">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : contextualTopics.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No help topics available for this page.
                    </p>
                    <Button onClick={() => setActiveTab('search')}>
                      <Search className="h-4 w-4 mr-2" />
                      Search for help
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Help topics related to this page:
                    </p>
                    
                    <div className="space-y-2">
                      {contextualTopics.map(topic => (
                        <Card
                          key={topic.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleSelectTopic(topic)}
                        >
                          <CardContent className="p-4">
                            <h3 className="font-medium">{topic.title}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {topic.content.substring(0, 100)}
                              {topic.content.length > 100 ? '...' : ''}
                            </p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="search" className="m-0">
                <HelpSearch
                  context={context}
                  onSelectTopic={handleSelectTopic}
                />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}