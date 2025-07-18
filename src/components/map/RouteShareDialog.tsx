"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Loader2, Share2, Check, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
}

interface RouteShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: any;
  teamMembers: TeamMember[];
  onShare?: (result: { success: boolean; message: string }) => void;
}

export default function RouteShareDialog({
  open,
  onOpenChange,
  route,
  teamMembers,
  onShare,
}: RouteShareDialogProps) {
  const [name, setName] = useState<string>(`Route ${new Date().toLocaleDateString()}`);
  const [description, setDescription] = useState<string>("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isSharing, setIsSharing] = useState<boolean>(false);

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setName(`Route ${new Date().toLocaleDateString()}`);
      setDescription("");
      setSelectedMembers([]);
    }
  }, [open]);

  // Toggle team member selection
  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // Select all team members
  const selectAll = () => {
    setSelectedMembers(teamMembers.map(member => member.id));
  };

  // Deselect all team members
  const deselectAll = () => {
    setSelectedMembers([]);
  };

  // Share route
  const shareRoute = async () => {
    if (selectedMembers.length === 0) {
      toast({
        title: "No team members selected",
        description: "Please select at least one team member to share the route with.",
        variant: "destructive",
      });
      return;
    }

    setIsSharing(true);

    try {
      const response = await fetch("/api/routes/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route,
          teamMemberIds: selectedMembers,
          name,
          description,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to share route");
      }

      const data = await response.json();

      toast({
        title: "Route Shared",
        description: `Route shared with ${selectedMembers.length} team member${selectedMembers.length > 1 ? 's' : ''}.`,
      });

      if (onShare) {
        onShare({
          success: true,
          message: `Route shared with ${selectedMembers.length} team member${selectedMembers.length > 1 ? 's' : ''}.`,
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error sharing route:", error);
      toast({
        title: "Error",
        description: "Failed to share route. Please try again.",
        variant: "destructive",
      });

      if (onShare) {
        onShare({
          success: false,
          message: "Failed to share route. Please try again.",
        });
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-pink-500" />
            Share Route
          </DialogTitle>
          <DialogDescription>
            Share this route with team members
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="route-name">Route Name</Label>
            <Input
              id="route-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a name for this route"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="route-description">Description (Optional)</Label>
            <Textarea
              id="route-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add notes or instructions for team members"
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Select Team Members</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAll}
                  className="h-8 px-2 text-xs"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAll}
                  className="h-8 px-2 text-xs"
                >
                  Deselect All
                </Button>
              </div>
            </div>
            
            <ScrollArea className="h-[200px] border rounded-md p-2">
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md"
                  >
                    <Checkbox
                      id={`member-${member.id}`}
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => toggleMember(member.id)}
                    />
                    <Label
                      htmlFor={`member-${member.id}`}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      <Avatar className="h-8 w-8">
                        {member.avatar ? (
                          <AvatarImage src={member.avatar} alt={member.name} />
                        ) : (
                          <AvatarFallback className="bg-pink-100 text-pink-800">
                            {member.name.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <span>{member.name}</span>
                    </Label>
                  </div>
                ))}
                
                {teamMembers.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No team members available
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="text-xs text-muted-foreground">
              {selectedMembers.length} of {teamMembers.length} team members selected
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSharing}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={shareRoute}
            disabled={isSharing || selectedMembers.length === 0}
          >
            {isSharing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sharing...
              </>
            ) : (
              <>
                <Share2 className="mr-2 h-4 w-4" />
                Share Route
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}