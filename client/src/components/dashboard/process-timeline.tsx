import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProcessTimeline() {
  const timelineItems = [
    {
      title: "Self Assessment",
      period: "Jan 15 - Feb 15",
      status: "completed",
    },
    {
      title: "360° Feedback",
      period: "Feb 16 - Mar 15",
      status: "completed",
    },
    {
      title: "Manager Reviews",
      period: "Mar 16 - Apr 15",
      status: "in-progress",
      progress: "76%",
    },
    {
      title: "1:1 Meetings",
      period: "Apr 16 - May 15",
      status: "upcoming",
    },
    {
      title: "Final Approvals",
      period: "May 16 - Jun 15",
      status: "pending",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Timeline</CardTitle>
        <p className="text-sm text-muted-foreground">2024 Annual Cycle</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineItems.map((item, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className={`h-6 w-6 rounded-full flex items-center justify-center mt-1 ${
                item.status === 'completed' 
                  ? 'bg-green-500' 
                  : item.status === 'in-progress'
                  ? 'bg-primary'
                  : 'bg-muted border-2 border-border'
              }`}>
                {item.status === 'completed' ? (
                  <svg className="h-3 w-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                ) : item.status === 'in-progress' ? (
                  <div className="h-2 w-2 bg-white rounded-full"></div>
                ) : (
                  <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                )}
              </div>
              <div className="flex-1" data-testid={`timeline-item-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>
                <p className={`font-medium ${
                  item.status === 'pending' || item.status === 'upcoming' 
                    ? 'text-muted-foreground' 
                    : 'text-foreground'
                }`}>
                  {item.title}
                </p>
                <p className="text-sm text-muted-foreground">{item.period}</p>
                <p className={`text-xs mt-1 ${
                  item.status === 'completed' 
                    ? 'text-green-600' 
                    : item.status === 'in-progress'
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}>
                  {item.status === 'completed' && 'Completed'}
                  {item.status === 'in-progress' && `In Progress (${item.progress})`}
                  {item.status === 'upcoming' && 'Upcoming'}
                  {item.status === 'pending' && 'Pending'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
