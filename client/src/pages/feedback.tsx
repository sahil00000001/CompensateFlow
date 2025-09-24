import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopHeader from "@/components/layout/top-header";
import FeedbackForm from "@/components/forms/feedback-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function Feedback() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Query for available feedback targets (team members for 360-feedback)
  const { data: feedbackTargets, isLoading: targetsLoading } = useQuery({
    queryKey: ['/api/feedback/targets'],
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

  if (isLoading || !isAuthenticated || targetsLoading) {
    return <div className="min-h-screen bg-background"></div>;
  }

  const handleFormSubmit = () => {
    toast({
      title: "Success",
      description: "Feedback submitted successfully!",
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
        <TopHeader title="360° Feedback" />
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

          {feedbackTargets && (feedbackTargets as any[])?.length > 0 ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    360° Feedback - Provide Feedback
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Provide constructive feedback for your team members. This helps create a comprehensive view of performance.
                  </p>
                </CardHeader>
              </Card>

              {(feedbackTargets as any[]).map((target: any, index: number) => (
                <Card key={target.reviewId} data-testid={`feedback-target-${index}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Feedback for {target.employeeName}
                    </CardTitle>
                    <p className="text-muted-foreground">
                      {target.employeeRole} • {target.department}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <FeedbackForm
                      reviewId={target.reviewId}
                      employeeName={target.employeeName}
                      employeeRole={target.employeeRole}
                      existingFeedback={target.existingFeedback}
                      onSubmit={handleFormSubmit}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground">
                    No feedback requests available
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    You currently have no pending 360° feedback requests to complete.
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