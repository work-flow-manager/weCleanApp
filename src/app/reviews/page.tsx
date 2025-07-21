"use client"

import React, { useState } from 'react';
import { ReviewList } from '@/components/reviews/review-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewFilters } from '@/types/review';

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [pendingFilters] = useState<ReviewFilters>({ has_response: false });
  const [respondedFilters] = useState<ReviewFilters>({ has_response: true });
  
  return (
    <div className="container py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-2">Reviews</h1>
      <p className="text-muted-foreground mb-6">
        View and manage customer reviews for your business.
      </p>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="pending">Pending Response</TabsTrigger>
          <TabsTrigger value="responded">Responded</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Reviews</CardTitle>
              <CardDescription>
                View all customer reviews for your business.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewList 
                showFilters={true}
                showRatingSummary={true}
                allowResponses={true}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Response</CardTitle>
              <CardDescription>
                Reviews that need your response.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewList 
                showFilters={true}
                showRatingSummary={false}
                allowResponses={true}
                emptyMessage="No reviews pending response"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="responded">
          <Card>
            <CardHeader>
              <CardTitle>Responded Reviews</CardTitle>
              <CardDescription>
                Reviews you've already responded to.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ReviewList 
                showFilters={true}
                showRatingSummary={false}
                allowResponses={false}
                emptyMessage="No responded reviews"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}