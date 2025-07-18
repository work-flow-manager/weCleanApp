"use client"

import React, { useState, useEffect } from 'react';
import { HelpTopic } from '@/types/help';
import { HelpService } from '@/lib/services/help-service';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ThumbsUp, ThumbsDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpTopicViewProps {
  topic: HelpTopic;
  onBack?: () => void;
  className?: string;
}

export function HelpTopicView({ topic, onBack, className }: HelpTopicViewProps) {
  const [relatedTopics, setRelatedTopics] = useState<HelpTopic[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<'helpful' | 'not_helpful' | null>(null);
  
  // Fetch related topics
  useEffect(() => {
    const fetchRelatedTopics = async () => {
      if (!topic.relatedTopics || topic.relatedTopics.length === 0) {
        return;
      }
      
      setIsLoading(true);
      
      try {
        const topics = await Promise.all(
          topic.relatedTopics.map(id => HelpService.getTopicById(id))
        );
        
        setRelatedTopics(topics.filter(Boolean) as HelpTopic[]);
      } catch (error) {
        console.error('Error fetching related topics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRelatedTopics();
    
    // Mark topic as viewed
    HelpService.markTopicViewed(topic.id);
  }, [topic]);
  
  // Handle feedback
  const handleFeedback = (value: 'helpful' | 'not_helpful') => {
    setFeedback(value);
    
    // In a real implementation, this would send feedback to the server
    console.log(`User found topic ${topic.id} ${value}`);
  };
  
  // Format content with Markdown-like syntax
  const formatContent = (content: string) => {
    // Replace headings
    let formatted = content
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-medium mt-6 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-6 mb-3">$1</h1>');
    
    // Replace lists
    formatted = formatted
      .replace(/^\s*\*\s(.*)$/gm, '<li class="ml-6 list-disc">$1</li>')
      .replace(/^\s*\d+\.\s(.*)$/gm, '<li class="ml-6 list-decimal">$1</li>');
    
    // Replace paragraphs
    formatted = formatted
      .replace(/^(?!<h|<li)(.*$)/gm, '<p class="mb-3">$1</p>');
    
    // Replace links
    formatted = formatted
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary hover:underline">$1</a>');
    
    // Replace bold and italic
    formatted = formatted
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    return formatted;
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{topic.title}</CardTitle>
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: formatContent(topic.content) }}
        />
        
        {topic.tags && topic.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-6">
            {topic.tags.map(tag => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        
        {relatedTopics.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Related Topics</h3>
            <ul className="space-y-1">
              {relatedTopics.map(relatedTopic => (
                <li key={relatedTopic.id}>
                  <Button
                    variant="link"
                    className="p-0 h-auto text-sm"
                    onClick={() => onBack && onBack()}
                  >
                    {relatedTopic.title}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-xs text-muted-foreground">
          {topic.lastUpdated && (
            <>Last updated: {new Date(topic.lastUpdated).toLocaleDateString()}</>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm mr-2">Was this helpful?</span>
          <Button
            variant={feedback === 'helpful' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedback('helpful')}
            disabled={feedback !== null}
          >
            <ThumbsUp className="h-4 w-4 mr-1" />
            Yes
          </Button>
          <Button
            variant={feedback === 'not_helpful' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleFeedback('not_helpful')}
            disabled={feedback !== null}
          >
            <ThumbsDown className="h-4 w-4 mr-1" />
            No
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}