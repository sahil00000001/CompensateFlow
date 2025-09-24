import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopHeader from "@/components/layout/top-header";
import StatsOverview from "@/components/dashboard/stats-overview";
import PendingActions from "@/components/dashboard/pending-actions";
import ProcessTimeline from "@/components/dashboard/process-timeline";
import RatingDistribution from "@/components/dashboard/rating-distribution";
import DepartmentPerformance from "@/components/dashboard/department-performance";
import RecentActivity from "@/components/dashboard/recent-activity";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-background"></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 min-h-screen bg-background">
        <TopHeader title="Dashboard" />
        <div className="p-6 space-y-6">
          <StatsOverview />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <PendingActions />
            </div>
            <div>
              <ProcessTimeline />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RatingDistribution />
            <DepartmentPerformance />
          </div>

          <RecentActivity />
        </div>
      </main>
    </div>
  );
}
