"use client"

import React, { useState } from 'react';
import { HelpTopic, HelpSearchResult, HelpContext } from '@/types/help';
import { HelpService } from '@/lib/services/help-service';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HelpSearchProps {
  context?: HelpContext;
  onSelectTopic?: (topic: HelpTopic) => void;
  className?: string;
}

export function HelpSearch({ context, onSelectTopic, className }: HelpSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HelpSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  // Handle search
  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const searchResults = await HelpService.searchTopics({
        query: query.trim(),
        context,
        limit: 10
      });
      
      setResults(searchResults);
    } catch (error) {
      console.error('Error searching help topics:', error);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Handle clear search
  const handleClear = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
  };
  
  // Handle select topic
  const handleSelectTopic = (topic: HelpTopic) => {
    if (onSelectTopic) {
      onSelectTopic(topic);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            placeholder="Search for help..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pr-8"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={handleClear}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
        <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          <span className="ml-2">Search</span>
        </Button>
      </div>
      
      {hasSearched && (
        <div>
          {results.length === 0 ? (
            <div className="text-center py-8 border rounded-md">
              <p className="text-muted-foreground">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                {results.length} result{results.length !== 1 ? 's' : ''} found
              </p>
              
              <div className="space-y-2">
                {results.map((result) => (
                  <Card
                    key={result.topic.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleSelectTopic(result.topic)}
                  >
                    <CardContent className="p-4">
                      <h3 className="font-medium">{result.topic.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.topic.content.substring(0, 100)}
                        {result.topic.content.length > 100 ? '...' : ''}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}