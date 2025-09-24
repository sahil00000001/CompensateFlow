import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { feedbackSchema, type FeedbackData } from '@/lib/types';
import { FEEDBACK_CRITERIA, RATING_SCALE } from '@/lib/constants';

interface FeedbackFormProps {
  reviewId: string;
  employeeName: string;
  employeeRole: string;
  existingFeedback?: any;
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function FeedbackForm({ 
  reviewId, 
  employeeName, 
  employeeRole, 
  existingFeedback, 
  onSubmit, 
  onCancel 
}: FeedbackFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FeedbackData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      reviewId,
      technicalCompetence: existingFeedback?.technicalCompetence || '3',
      communicationSkills: existingFeedback?.communicationSkills || '3',
      teamCollaboration: existingFeedback?.teamCollaboration || '3',
      problemSolving: existingFeedback?.problemSolving || '3',
      leadershipPotential: existingFeedback?.leadershipPotential || '3',
      reliability: existingFeedback?.reliability || '3',
      innovation: existingFeedback?.innovation || '3',
      overallFeedback: existingFeedback?.overallFeedback || '',
      strengths: existingFeedback?.strengths || '',
      improvements: existingFeedback?.improvements || '',
      isAnonymous: existingFeedback?.isAnonymous ?? true,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FeedbackData) => {
      const response = await apiRequest('POST', '/api/feedback', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Feedback submitted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/feedback'] });
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
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
    },
  });

  const onFormSubmit = (data: FeedbackData) => {
    mutation.mutate(data);
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>360° Feedback</CardTitle>
        <div className="text-sm text-muted-foreground">
          <p><strong>Employee:</strong> {employeeName}</p>
          <p><strong>Role:</strong> {employeeRole}</p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Rating Criteria */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Performance Ratings</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Please rate the employee on the following criteria using a scale of 1-5:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {FEEDBACK_CRITERIA.map((criterion) => (
                <div key={criterion.key} className="space-y-2">
                  <Label htmlFor={criterion.key}>{criterion.label}</Label>
                  <Select
                    value={form.watch(criterion.key as keyof FeedbackData) as string}
                    onValueChange={(value) => form.setValue(criterion.key as keyof FeedbackData, value as any)}
                  >
                    <SelectTrigger data-testid={`select-${criterion.key}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RATING_SCALE).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {value} - {label.split(' (')[0]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors[criterion.key as keyof FeedbackData] && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors[criterion.key as keyof FeedbackData]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Overall Feedback */}
          <div>
            <Label htmlFor="overallFeedback">Overall Feedback *</Label>
            <Textarea
              id="overallFeedback"
              placeholder="Please provide detailed feedback about the employee's performance, contributions, and overall impact... (minimum 50 characters)"
              {...form.register('overallFeedback')}
              rows={6}
              data-testid="textarea-overall-feedback"
            />
            {form.formState.errors.overallFeedback && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.overallFeedback.message}
              </p>
            )}
          </div>

          {/* Strengths */}
          <div>
            <Label htmlFor="strengths">Key Strengths *</Label>
            <Textarea
              id="strengths"
              placeholder="What are this person's key strengths and positive qualities?"
              {...form.register('strengths')}
              rows={4}
              data-testid="textarea-strengths"
            />
            {form.formState.errors.strengths && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.strengths.message}
              </p>
            )}
          </div>

          {/* Areas for Improvement */}
          <div>
            <Label htmlFor="improvements">Areas for Improvement (Optional)</Label>
            <Textarea
              id="improvements"
              placeholder="Are there any areas where this person could improve? Please be constructive."
              {...form.register('improvements')}
              rows={4}
              data-testid="textarea-improvements"
            />
          </div>

          {/* Anonymous Feedback Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAnonymous"
              checked={form.watch('isAnonymous')}
              onCheckedChange={(checked) => form.setValue('isAnonymous', !!checked)}
              data-testid="checkbox-anonymous"
            />
            <Label htmlFor="isAnonymous" className="text-sm">
              Submit this feedback anonymously
            </Label>
          </div>

          {/* Information Notice */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Important Notice</p>
                <ul className="space-y-1">
                  <li>• Your feedback will be aggregated with others to provide a comprehensive view</li>
                  <li>• Anonymous feedback cannot be edited once submitted</li>
                  <li>• Please be honest, constructive, and professional in your feedback</li>
                  <li>• Focus on specific behaviors and examples rather than personal characteristics</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                data-testid="button-cancel-feedback"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={mutation.isPending}
              data-testid="button-submit-feedback"
            >
              {mutation.isPending ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
