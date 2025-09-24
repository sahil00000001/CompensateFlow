import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { selfAssessmentSchema, type SelfAssessmentData } from '@/lib/types';
import { EMPLOYEE_CATEGORIES, SELF_ASSESSMENT_FIELDS, RATING_SCALE } from '@/lib/constants';

interface SelfAssessmentFormProps {
  employeeCategory: keyof typeof EMPLOYEE_CATEGORIES;
  existingData?: any;
  onSubmit?: () => void;
}

export default function SelfAssessmentForm({ 
  employeeCategory, 
  existingData, 
  onSubmit 
}: SelfAssessmentFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const form = useForm<SelfAssessmentData>({
    resolver: zodResolver(selfAssessmentSchema),
    defaultValues: {
      currentCtc: existingData?.currentCtc || '',
      expectedCtc: existingData?.expectedCtc || '',
      expectedIncrementPercentage: existingData?.expectedIncrementPercentage || '',
      careerGoals: existingData?.careerGoals || '',
      trainingNeeds: existingData?.trainingNeeds || '',
      workFromHomePreference: existingData?.workFromHomePreference || 'hybrid',
      projectContributions: existingData?.projectContributions || '',
      teamCollaboration: existingData?.teamCollaboration || '3',
      initiatives: existingData?.initiatives || '',
      challenges: existingData?.challenges || '',
      areasOfImprovement: existingData?.areasOfImprovement || '',
      categorySpecificFields: existingData?.categorySpecificFields || {},
      additionalComments: existingData?.additionalComments || '',
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: SelfAssessmentData) => {
      const response = await apiRequest('POST', '/api/reviews/self-assessment', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Self-assessment submitted successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/my-review'] });
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
        description: 'Failed to submit self-assessment',
        variant: 'destructive',
      });
    },
  });

  const onFormSubmit = (data: SelfAssessmentData) => {
    mutation.mutate(data);
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(step);
    const isValid = await form.trigger(fieldsToValidate as any);
    
    if (isValid && step < totalSteps) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const getFieldsForStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return ['currentCtc', 'expectedCtc', 'expectedIncrementPercentage'];
      case 2:
        return ['careerGoals', 'trainingNeeds', 'workFromHomePreference'];
      case 3:
        return ['projectContributions', 'teamCollaboration', 'initiatives'];
      case 4:
        return ['challenges', 'areasOfImprovement'];
      default:
        return [];
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Compensation & Expectations</h3>
              <p className="text-sm text-muted-foreground">
                Please provide your current compensation details and expectations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="currentCtc">Current CTC *</Label>
                <Input
                  id="currentCtc"
                  type="number"
                  placeholder="e.g., 1200000"
                  {...form.register('currentCtc')}
                  data-testid="input-current-ctc"
                />
                {form.formState.errors.currentCtc && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.currentCtc.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="expectedCtc">Expected CTC *</Label>
                <Input
                  id="expectedCtc"
                  type="number"
                  placeholder="e.g., 1400000"
                  {...form.register('expectedCtc')}
                  data-testid="input-expected-ctc"
                />
                {form.formState.errors.expectedCtc && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.expectedCtc.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="expectedIncrementPercentage">Expected Increment Percentage *</Label>
              <Input
                id="expectedIncrementPercentage"
                type="number"
                placeholder="e.g., 20"
                {...form.register('expectedIncrementPercentage')}
                data-testid="input-expected-increment"
              />
              {form.formState.errors.expectedIncrementPercentage && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.expectedIncrementPercentage.message}
                </p>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Career Development</h3>
              <p className="text-sm text-muted-foreground">
                Share your career aspirations and development needs
              </p>
            </div>

            <div>
              <Label htmlFor="careerGoals">Career Goals *</Label>
              <Textarea
                id="careerGoals"
                placeholder="Describe your short-term and long-term career goals..."
                {...form.register('careerGoals')}
                rows={4}
                data-testid="textarea-career-goals"
              />
              {form.formState.errors.careerGoals && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.careerGoals.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="trainingNeeds">Training Needs</Label>
              <Textarea
                id="trainingNeeds"
                placeholder="What training or skill development would help you grow?"
                {...form.register('trainingNeeds')}
                rows={3}
                data-testid="textarea-training-needs"
              />
            </div>

            <div>
              <Label>Work From Home Preference</Label>
              <RadioGroup
                value={form.watch('workFromHomePreference')}
                onValueChange={(value) => form.setValue('workFromHomePreference', value as any)}
                className="mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="wfh-yes" data-testid="radio-wfh-yes" />
                  <Label htmlFor="wfh-yes">Yes, prefer remote work</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="wfh-no" data-testid="radio-wfh-no" />
                  <Label htmlFor="wfh-no">No, prefer office work</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hybrid" id="wfh-hybrid" data-testid="radio-wfh-hybrid" />
                  <Label htmlFor="wfh-hybrid">Hybrid (mix of both)</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Performance & Contributions</h3>
              <p className="text-sm text-muted-foreground">
                Highlight your key contributions and collaborative efforts
              </p>
            </div>

            <div>
              <Label htmlFor="projectContributions">Project Contributions *</Label>
              <Textarea
                id="projectContributions"
                placeholder="Describe your key project contributions this year..."
                {...form.register('projectContributions')}
                rows={4}
                data-testid="textarea-project-contributions"
              />
              {form.formState.errors.projectContributions && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.projectContributions.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="teamCollaboration">Team Collaboration Rating (1-5) *</Label>
              <Select
                value={form.watch('teamCollaboration')}
                onValueChange={(value) => form.setValue('teamCollaboration', value as any)}
              >
                <SelectTrigger data-testid="select-team-collaboration">
                  <SelectValue />
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
              <Label htmlFor="initiatives">Initiative and Ownership Examples *</Label>
              <Textarea
                id="initiatives"
                placeholder="Share examples of initiatives you took or leadership you demonstrated..."
                {...form.register('initiatives')}
                rows={4}
                data-testid="textarea-initiatives"
              />
              {form.formState.errors.initiatives && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.initiatives.message}
                </p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-foreground">Reflection & Growth</h3>
              <p className="text-sm text-muted-foreground">
                Reflect on challenges and areas for improvement
              </p>
            </div>

            <div>
              <Label htmlFor="challenges">Challenges Faced and Solutions *</Label>
              <Textarea
                id="challenges"
                placeholder="Describe key challenges you faced and how you addressed them..."
                {...form.register('challenges')}
                rows={4}
                data-testid="textarea-challenges"
              />
              {form.formState.errors.challenges && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.challenges.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="areasOfImprovement">Areas of Improvement (Self-identified) *</Label>
              <Textarea
                id="areasOfImprovement"
                placeholder="What areas do you think you can improve on?"
                {...form.register('areasOfImprovement')}
                rows={4}
                data-testid="textarea-areas-improvement"
              />
              {form.formState.errors.areasOfImprovement && (
                <p className="text-sm text-destructive mt-1">
                  {form.formState.errors.areasOfImprovement.message}
                </p>
              )}
            </div>

            {/* Category-specific fields */}
            <div>
              <Label className="text-base font-semibold">
                {EMPLOYEE_CATEGORIES[employeeCategory]} Specific Assessment
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Please rate yourself on the following criteria specific to your role:
              </p>
              
              <div className="space-y-4">
                {SELF_ASSESSMENT_FIELDS[employeeCategory].map((field, index) => (
                  <div key={index} className="p-4 border border-border rounded-lg">
                    <Label className="text-sm font-medium">{field}</Label>
                    <Select
                      value={form.watch('categorySpecificFields')?.[field] || ''}
                      onValueChange={(value) => {
                        const current = form.watch('categorySpecificFields') || {};
                        form.setValue('categorySpecificFields', {
                          ...current,
                          [field]: value,
                        });
                      }}
                    >
                      <SelectTrigger className="mt-2" data-testid={`select-category-${index}`}>
                        <SelectValue placeholder="Select rating" />
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
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="additionalComments">Additional Comments</Label>
              <Textarea
                id="additionalComments"
                placeholder="Any additional comments or information you'd like to share..."
                {...form.register('additionalComments')}
                rows={3}
                data-testid="textarea-additional-comments"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Self Assessment - {EMPLOYEE_CATEGORIES[employeeCategory]}</span>
          <span className="text-sm text-muted-foreground">
            Step {step} of {totalSteps}
          </span>
        </CardTitle>
        
        {/* Progress indicator */}
        <div className="w-full bg-muted rounded-full h-2 mt-4">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onFormSubmit)}>
          {renderStep()}

          <div className="flex justify-between mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              data-testid="button-previous-step"
            >
              Previous
            </Button>

            <div className="flex gap-2">
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  data-testid="button-next-step"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  data-testid="button-submit-assessment"
                >
                  {mutation.isPending ? 'Submitting...' : 'Submit Assessment'}
                </Button>
              )}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
