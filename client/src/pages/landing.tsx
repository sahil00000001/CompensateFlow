import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Landing() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Increment Process Automation System
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Performance Management & Review System
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Please sign in to access your dashboard
              </p>
              <Button 
                className="w-full" 
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Sign In
              </Button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-border">
              <div className="grid grid-cols-2 gap-4 text-center text-sm text-muted-foreground">
                <div>
                  <div className="font-semibold text-foreground">📊</div>
                  <div>Analytics</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">🔄</div>
                  <div>360° Feedback</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">📝</div>
                  <div>Self Assessment</div>
                </div>
                <div>
                  <div className="font-semibold text-foreground">👥</div>
                  <div>Team Reviews</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
