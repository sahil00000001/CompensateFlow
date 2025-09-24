import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface TopHeaderProps {
  title: string;
}

export default function TopHeader({ title }: TopHeaderProps) {
  const { user } = useAuth();

  const initials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : 'U';

  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-foreground" data-testid="text-page-title">
            {title}
          </h2>
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Review Cycle:</span>
            <span className="font-medium text-foreground">Annual 2024</span>
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Active
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="w-64 pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              data-testid="input-search"
            />
          </div>
          
          {/* Notifications */}
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg" data-testid="button-notifications">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
            </svg>
            <span className="absolute top-1 right-1 h-2 w-2 bg-destructive rounded-full"></span>
          </button>
          
          {/* Quick Actions */}
          <Button className="px-4 py-2 text-sm font-medium" data-testid="button-quick-action">
            Quick Action
          </Button>
          
          {/* User Menu */}
          <button 
            className="flex items-center gap-2 p-2 hover:bg-accent rounded-lg"
            onClick={() => window.location.href = '/api/logout'}
            data-testid="button-user-menu"
          >
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-medium text-primary">
                {initials}
              </span>
            </div>
            <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
