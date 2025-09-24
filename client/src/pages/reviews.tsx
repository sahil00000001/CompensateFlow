import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import TopHeader from "@/components/layout/top-header";

export default function Reviews() {
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
        <TopHeader title="Reviews" />
        <div className="p-6">
          <div className="text-center py-20">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Review Management</h2>
            <p className="text-muted-foreground">Review management features coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
