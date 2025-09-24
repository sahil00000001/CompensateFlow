import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PendingActions() {
  const { data: pendingActions, isLoading } = useQuery({
    queryKey: ['/api/dashboard/pending-actions'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted/50 rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Pending Actions</CardTitle>
          <span className="text-sm text-muted-foreground">
            {pendingActions?.length || 0} urgent items
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!pendingActions || pendingActions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="text-sm">No pending actions</p>
                <p className="text-xs mt-1">All caught up!</p>
              </div>
            </div>
          ) : (
            pendingActions.map((action: any, index: number) => (
              <div 
                key={index} 
                className={`flex items-center justify-between p-4 bg-muted/50 rounded-lg border-l-4 ${
                  action.type === 'appeal' ? 'border-l-destructive' : 'border-l-orange-500'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                    action.type === 'appeal' ? 'bg-red-100' : 'bg-orange-100'
                  }`}>
                    <span className={`text-sm font-medium ${
                      action.type === 'appeal' ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {action.data.employee?.firstName?.[0] || 'U'}
                      {action.data.employee?.lastName?.[0] || 'S'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {action.data.employee?.firstName} {action.data.employee?.lastName} - 
                      {action.type === 'appeal' ? ' Appeal Request' : ' Review Pending'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {action.data.employee?.category?.replace('_', ' ').split(' ').map((word: string) => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')} • 
                      {action.type === 'appeal' ? 'Requires response' : 'Awaiting approval'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    action.type === 'appeal' 
                      ? 'bg-destructive/10 text-destructive' 
                      : 'bg-orange-100 text-orange-600'
                  }`}>
                    {action.type === 'appeal' ? 'Urgent' : 'Pending'}
                  </span>
                  <Button 
                    size="sm" 
                    variant="default"
                    data-testid={`button-action-${action.type}-${index}`}
                  >
                    {action.type === 'appeal' ? 'Review' : 'View'}
                  </Button>
                </div>
              </div>
            ))
          )}
          
          {pendingActions && pendingActions.length > 0 && (
            <div className="pt-4 border-t border-border">
              <Button 
                variant="ghost" 
                className="w-full text-sm text-primary hover:text-primary/80"
                data-testid="button-view-all-actions"
              >
                View All Pending Actions
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
