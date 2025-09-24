import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopHeader from "@/components/layout/top-header";
import SelfAssessmentForm from "@/components/forms/self-assessment-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function SelfAssessment() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Query for current review data
  const { data: reviewData, isLoading: reviewLoading } = useQuery({
    queryKey: ['/api/reviews/current'],
    enabled: !!user && isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading || !isAuthenticated || reviewLoading) {
    return <div className="min-h-screen bg-background"></div>;
  }

  const handleFormSubmit = () => {
    toast({
      title: "Success",
      description: "Self-assessment submitted successfully!",
    });
    setLocation('/');
  };

  const handleBack = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen bg-background">
        <TopHeader title="Self Assessment" />
        <div className="p-6">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={handleBack}
              className="mb-4"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {reviewData ? (
            <Card>
              <CardHeader>
                <CardTitle>Self Assessment - {(reviewData as any)?.cycleName || '2024 Annual Review'}</CardTitle>
                <p className="text-muted-foreground">
                  Complete your self-assessment to provide insights into your performance, goals, and development needs.
                </p>
              </CardHeader>
              <CardContent>
                <SelfAssessmentForm
                  employeeCategory={(user as any)?.category || 'software_developer'}
                  existingData={(reviewData as any)?.selfAssessmentData}
                  onSubmit={handleFormSubmit}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium text-muted-foreground">
                    No active review cycle found
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Please check with your manager about the current review process.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}