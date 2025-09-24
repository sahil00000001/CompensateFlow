import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { reviewSchema, type ReviewData } from '@/lib/types';
import { RATING_SCALE, RATING_WEIGHTS } from '@/lib/constants';

interface ReviewFormProps {
  employeeId: string;
  userRole: 'l1_manager' | 'l2_manager' | 'l3_manager' | 'founder';
  existingReview?: any;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function ReviewForm({ 
  employeeId, 
  userRole, 
  existingReview, 
  onSubmit, 
  onCancel 
}: ReviewFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch employee review data
  const { data: reviewData, isLoading } = useQuery({
    queryKey: ['/api/reviews', employeeId],
    enabled: !!employeeId,
  });

  // Fetch feedback data
  const { data: feedbackData } = useQuery({
    queryKey: ['/api/feedback/review', reviewData?.id],
    enabled: !!reviewData?.id,
  });

  const form = useForm<ReviewData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      employeeId,
      l3Comments: existingReview?.l3Comments || '',
      l2Comments: existingReview?.l2Comments || '',
      l1Comments: existingReview?.l1Comments || '',
      founderComments: existingReview?.founderComments || '',
      finalRating: existingReview?.finalRating || undefined,
      finalIncrementPercentage: existingReview?.finalIncrementPercentage || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: ReviewData) => {
      const response = await apiRequest('PUT', `/api/reviews/${reviewData?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Review updated successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      onSubmit?.();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: 'Unauthorized',
          description: 'You are logged out. Logging in again...',
          variant: 'destructive',
        });
        setTimeout(() => {
          window.location.href = '/api/login';
        }, 500);
        return;
      }
      toast({
        title: 'Error',
        description: 'Failed to update review',
        variant: 'destructive',
      });
    },
  });

  const onFormSubmit = (data: ReviewData) => {
    mutation.mutate(data);
  };

  const calculateWeightedRating = () => {
    if (!reviewData || !feedbackData) return 0;

    const selfAssessmentAvg = reviewData.selfAssessmentData ? 3.5 : 0; // Placeholder calculation
    const feedbackAvg = feedbackData.length > 0 
      ? feedbackData.reduce((sum: number, fb: any) => sum + parseFloat(fb.technicalCompetence || 3), 0) / feedbackData.length
      : 0;
    const l3Rating = reviewData.l3Rating || 3;
    const kraRating = 3; // Placeholder

    return (
      selfAssessmentAvg * RATING_WEIGHTS.self_assessment +
      feedbackAvg * RATING_WEIGHTS.feedback_360 +
      l3Rating * RATING_WEIGHTS.l3_input +
      kraRating * RATING_WEIGHTS.kra_achievement
    ).toFixed(1);
  };

  if (isLoading) {
    return (
      <Card className="max-w-6xl mx-auto">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted/50 rounded w-1/3"></div>
            <div className="h-32 bg-muted/50 rounded"></div>
            <div className="h-32 bg-muted/50 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const employee = reviewData?.employee;
  const canEditRating = userRole === 'l2_manager' || userRole === 'founder';
  const commentField = {
    l3_manager: 'l3Comments',
    l2_manager: 'l2Comments', 
    l1_manager: 'l1Comments',
    founder: 'founderComments',
  }[userRole];

  return (
    <Card className="max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Performance Review</CardTitle>
            {employee && (
              <div className="text-sm text-muted-foreground mt-2">
                <p><strong>Employee:</strong> {employee.firstName} {employee.lastName}</p>
                <p><strong>Role:</strong> {employee.category?.replace('_', ' ')}</p>
                <p><strong>Department:</strong> {employee.department}</p>
              </div>
            )}
          </div>
          <div className="text-right">
            <Badge variant={reviewData?.status === 'completed' ? 'default' : 'secondary'}>
              {reviewData?.status?.replace('_', ' ')}
            </Badge>
            {reviewData?.finalRating && (
              <div className="mt-2">
                <span className="text-2xl font-bold text-primary">
                  {reviewData.finalRating}
                </span>
                <span className="text-sm text-muted-foreground">/5</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="feedback" data-testid="tab-feedback">360° Feedback</TabsTrigger>
            <TabsTrigger value="assessment" data-testid="tab-assessment">Self Assessment</TabsTrigger>
            <TabsTrigger value="review" data-testid="tab-review">Review & Rating</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground">Review Progress</h4>
                  <Progress value={75} className="mt-2" />
                  <p className="text-sm text-muted-foreground mt-2">75% Complete</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground">Feedback Received</h4>
                  <p className="text-2xl font-bold text-primary">{feedbackData?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">responses</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground">Weighted Rating</h4>
                  <p className="text-2xl font-bold text-primary">{calculateWeightedRating()}</p>
                  <p className="text-sm text-muted-foreground">calculated score</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-3">Rating Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Self Assessment ({Math.round(RATING_WEIGHTS.self_assessment * 100)}%)</span>
                      <span className="font-medium">3.5/5</span>
                    </div>
                    <div className="flex justify-between">
                      <span>360° Feedback ({Math.round(RATING_WEIGHTS.feedback_360 * 100)}%)</span>
                      <span className="font-medium">{feedbackData?.length > 0 ? '3.8/5' : 'Pending'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>L3 Input ({Math.round(RATING_WEIGHTS.l3_input * 100)}%)</span>
                      <span className="font-medium">{reviewData?.l3Rating ? `${reviewData.l3Rating}/5` : 'Pending'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>KRA Achievement ({Math.round(RATING_WEIGHTS.kra_achievement * 100)}%)</span>
                      <span className="font-medium">3.0/5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h4 className="font-semibold text-foreground mb-3">Timeline Status</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Self Assessment - Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">360° Feedback - Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-primary rounded-full"></div>
                      <span className="text-sm">Manager Review - In Progress</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 bg-muted rounded-full border-2 border-border"></div>
                      <span className="text-sm">1:1 Meeting - Pending</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">360° Feedback Summary</h3>
              {feedbackData && feedbackData.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {feedbackData.map((feedback: any, index: number) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium">
                            {feedback.isAnonymous ? 'Anonymous Feedback' : feedback.feedbackFrom?.firstName}
                          </h4>
                          <Badge variant="outline">
                            Avg: {(
                              (parseInt(feedback.technicalCompetence) +
                               parseInt(feedback.communicationSkills) +
                               parseInt(feedback.teamCollaboration) +
                               parseInt(feedback.problemSolving)) / 4
                            ).toFixed(1)}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Technical:</span>
                            <span>{feedback.technicalCompetence}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Communication:</span>
                            <span>{feedback.communicationSkills}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Collaboration:</span>
                            <span>{feedback.teamCollaboration}/5</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Problem Solving:</span>
                            <span>{feedback.problemSolving}/5</span>
                          </div>
                        </div>

                        {feedback.strengths && (
                          <div className="mt-3">
                            <p className="text-xs font-medium text-muted-foreground">Strengths:</p>
                            <p className="text-sm">{feedback.strengths}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No feedback received yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Self Assessment</h3>
              {reviewData?.selfAssessmentData ? (
                <div className="space-y-4">
                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Career Goals</h4>
                      <p className="text-sm text-muted-foreground">
                        {reviewData.selfAssessmentData.careerGoals || 'Not provided'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Project Contributions</h4>
                      <p className="text-sm text-muted-foreground">
                        {reviewData.selfAssessmentData.projectContributions || 'Not provided'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-2">Key Initiatives</h4>
                      <p className="text-sm text-muted-foreground">
                        {reviewData.selfAssessmentData.initiatives || 'Not provided'}
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Current CTC</h4>
                        <p className="text-lg font-semibold text-primary">
                          ₹{parseInt(reviewData.selfAssessmentData.currentCtc || '0').toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Expected CTC</h4>
                        <p className="text-lg font-semibold text-primary">
                          ₹{parseInt(reviewData.selfAssessmentData.expectedCtc || '0').toLocaleString()}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Self assessment not completed yet</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="review">
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">Manager Review</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={commentField}>
                      {userRole === 'l3_manager' && 'L3 Manager Comments'}
                      {userRole === 'l2_manager' && 'L2 Manager Comments'}
                      {userRole === 'l1_manager' && 'L1 Manager Comments'}
                      {userRole === 'founder' && 'Founder Comments'}
                    </Label>
                    <Textarea
                      id={commentField}
                      placeholder="Provide your detailed review and feedback..."
                      {...form.register(commentField as keyof ReviewData)}
                      rows={6}
                      data-testid={`textarea-${commentField}`}
                    />
                  </div>

                  {canEditRating && (
                    <>
                      <div>
                        <Label htmlFor="finalRating">Final Rating</Label>
                        <Select
                          value={form.watch('finalRating') || ''}
                          onValueChange={(value) => form.setValue('finalRating', value as any)}
                        >
                          <SelectTrigger data-testid="select-final-rating">
                            <SelectValue placeholder="Select final rating" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(RATING_SCALE).map(([value, label]) => (
                              <SelectItem key={value} value={value}>
                                {value} - {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="finalIncrementPercentage">Final Increment Percentage</Label>
                        <Input
                          id="finalIncrementPercentage"
                          type="number"
                          placeholder="e.g., 15"
                          {...form.register('finalIncrementPercentage')}
                          data-testid="input-final-increment"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    data-testid="button-cancel-review"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  data-testid="button-submit-review"
                >
                  {mutation.isPending ? 'Saving...' : 'Save Review'}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
