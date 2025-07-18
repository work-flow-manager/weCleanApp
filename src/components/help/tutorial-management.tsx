import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Plus, Eye, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/lib/supabase';
import { tutorials } from './onboarding-tutorial';

// Tutorial progress interface
interface TutorialProgress {
  tutorialId: string;
  userId: string;
  completed: boolean;
  completedAt?: string;
  progress?: number; // 0-100
}

// Props interface
interface TutorialManagementProps {
  userRole: UserRole;
  className?: string;
}

export function TutorialManagement({ userRole, className }: TutorialManagementProps) {
  const [activeTab, setActiveTab] = useState('all-tutorials');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isStatsDialogOpen, setIsStatsDialogOpen] = useState(false);
  const [selectedTutorial, setSelectedTutorial] = useState<typeof tutorials[0] | null>(null);
  
  // Sample tutorial progress data
  const [tutorialProgress, setTutorialProgress] = useState<TutorialProgress[]>([
    { tutorialId: 'admin-getting-started', userId: 'user1', completed: true, completedAt: '2023-06-15T10:30:00Z', progress: 100 },
    { tutorialId: 'manager-getting-started', userId: 'user2', completed: false, progress: 60 },
    { tutorialId: 'team-getting-started', userId: 'user3', completed: true, completedAt: '2023-06-18T14:45:00Z', progress: 100 },
    { tutorialId: 'customer-getting-started', userId: 'user4', completed: false, progress: 20 },
    { tutorialId: 'using-map-features', userId: 'user1', completed: false, progress: 75 },
  ]);
  
  // Filter tutorials based on active tab
  const filteredTutorials = tutorials.filter(tutorial => {
    if (activeTab === 'all-tutorials') return true;
    if (activeTab === 'role-specific') return tutorial.role !== 'all';
    if (activeTab === 'general') return tutorial.role === 'all';
    return true;
  });
  
  // Open edit dialog
  const openEditDialog = (tutorial: typeof tutorials[0]) => {
    setSelectedTutorial(tutorial);
    setIsEditDialogOpen(true);
  };
  
  // Open delete dialog
  const openDeleteDialog = (tutorial: typeof tutorials[0]) => {
    setSelectedTutorial(tutorial);
    setIsDeleteDialogOpen(true);
  };
  
  // Open stats dialog
  const openStatsDialog = (tutorial: typeof tutorials[0]) => {
    setSelectedTutorial(tutorial);
    setIsStatsDialogOpen(true);
  };
  
  // Handle tutorial deletion
  const handleDeleteTutorial = () => {
    // In a real app, this would call an API to delete the tutorial
    console.log(`Deleting tutorial: ${selectedTutorial?.id}`);
    setIsDeleteDialogOpen(false);
  };
  
  // Calculate tutorial statistics
  const calculateTutorialStats = (tutorialId: string) => {
    const totalUsers = tutorialProgress.filter(p => p.tutorialId === tutorialId).length;
    const completedUsers = tutorialProgress.filter(p => p.tutorialId === tutorialId && p.completed).length;
    const completionRate = totalUsers > 0 ? (completedUsers / totalUsers) * 100 : 0;
    
    const averageProgress = tutorialProgress
      .filter(p => p.tutorialId === tutorialId)
      .reduce((sum, p) => sum + (p.progress || 0), 0) / (totalUsers || 1);
    
    return {
      totalUsers,
      completedUsers,
      completionRate,
      averageProgress,
    };
  };
  
  // Check if user has admin access
  const hasAdminAccess = userRole === 'admin';
  
  return (
    <div className={className}>
      <Card className="shadow-sm border-pink-100">
        <CardHeader className="bg-gradient-to-r from-pink-50 to-pink-100/50 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold text-gray-800">Tutorial Management</CardTitle>
          {hasAdminAccess && (
            <Button className="bg-pink-500 hover:bg-pink-600">
              <Plus className="mr-2 h-4 w-4" />
              New Tutorial
            </Button>
          )}
        </CardHeader>
        
        <CardContent className="p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all-tutorials" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                All Tutorials
              </TabsTrigger>
              <TabsTrigger value="role-specific" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                Role-Specific
              </TabsTrigger>
              <TabsTrigger value="general" className="data-[state=active]:bg-pink-500 data-[state=active]:text-white">
                General
              </TabsTrigger>
            </TabsList>
            
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Steps</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTutorials.map((tutorial) => {
                  const stats = calculateTutorialStats(tutorial.id);
                  
                  return (
                    <TableRow key={tutorial.id}>
                      <TableCell className="font-medium">
                        <div>
                          {tutorial.title}
                          <div className="text-xs text-gray-500 mt-1">{tutorial.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            tutorial.role === 'admin' ? "border-blue-500 text-blue-600" :
                            tutorial.role === 'manager' ? "border-green-500 text-green-600" :
                            tutorial.role === 'team' ? "border-amber-500 text-amber-600" :
                            tutorial.role === 'customer' ? "border-purple-500 text-purple-600" :
                            "border-gray-500 text-gray-600"
                          )}
                        >
                          {tutorial.role === 'all' ? 'All Roles' : tutorial.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{tutorial.duration}</TableCell>
                      <TableCell>{tutorial.steps.length}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openStatsDialog(tutorial)}
                            className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          >
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {hasAdminAccess && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openEditDialog(tutorial)}
                                className="h-8 w-8 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openDeleteDialog(tutorial)}
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Edit Tutorial Dialog */}
      {selectedTutorial && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Tutorial: {selectedTutorial.title}</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Title
                </Label>
                <Input
                  id="title"
                  defaultValue={selectedTutorial.title}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  defaultValue={selectedTutorial.description}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select defaultValue={selectedTutorial.role}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="team">Team Member</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration
                </Label>
                <Input
                  id="duration"
                  defaultValue={selectedTutorial.duration}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Active
                </Label>
                <div className="flex items-center space-x-2 col-span-3">
                  <Switch id="active" defaultChecked />
                  <Label htmlFor="active">Tutorial is active and visible to users</Label>
                </div>
              </div>
              
              <Separator className="my-2" />
              
              <h3 className="font-medium text-gray-800">Tutorial Steps</h3>
              
              {selectedTutorial.steps.map((step, index) => (
                <div key={step.id} className="border rounded-md p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Step {index + 1}: {step.title}</h4>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{step.description.substring(0, 100)}...</p>
                </div>
              ))}
              
              <Button variant="outline" className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-pink-500 hover:bg-pink-600">
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Delete Tutorial Dialog */}
      {selectedTutorial && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Delete Tutorial</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="text-gray-700">
                Are you sure you want to delete the tutorial "{selectedTutorial.title}"? This action cannot be undone.
              </p>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTutorial}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Tutorial Statistics Dialog */}
      {selectedTutorial && (
        <Dialog open={isStatsDialogOpen} onOpenChange={setIsStatsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Tutorial Statistics: {selectedTutorial.title}</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              {(() => {
                const stats = calculateTutorialStats(selectedTutorial.id);
                
                return (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4 border-pink-100">
                        <div className="text-sm text-gray-500">Completion Rate</div>
                        <div className="text-2xl font-bold text-pink-600">
                          {stats.completionRate.toFixed(1)}%
                        </div>
                      </Card>
                      
                      <Card className="p-4 border-pink-100">
                        <div className="text-sm text-gray-500">Average Progress</div>
                        <div className="text-2xl font-bold text-pink-600">
                          {stats.averageProgress.toFixed(1)}%
                        </div>
                      </Card>
                    </div>
                    
                    <Card className="p-4 border-pink-100">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-gray-500">User Completion</div>
                        <div className="text-sm font-medium">
                          {stats.completedUsers} / {stats.totalUsers} users
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-pink-500 h-2.5 rounded-full" 
                          style={{ width: `${stats.completionRate}%` }}
                        ></div>
                      </div>
                    </Card>
                    
                    <h3 className="font-medium text-gray-800 mt-4">User Progress</h3>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Progress</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {tutorialProgress
                          .filter(p => p.tutorialId === selectedTutorial.id)
                          .map((progress) => (
                            <TableRow key={progress.userId}>
                              <TableCell className="font-medium">User {progress.userId}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className="bg-pink-500 h-2 rounded-full" 
                                      style={{ width: `${progress.progress || 0}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs">{progress.progress}%</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                {progress.completed ? (
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    Completed
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="border-amber-500 text-amber-600">
                                    In Progress
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                );
              })()}
            </div>
            
            <DialogFooter>
              <Button onClick={() => setIsStatsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default TutorialManagement;