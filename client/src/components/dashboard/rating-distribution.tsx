import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RatingDistribution() {
  const { data: distribution, isLoading } = useQuery({
    queryKey: ['/api/dashboard/analytics/rating-distribution'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rating Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-muted/30 rounded-lg animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  // Calculate distribution percentages
  const total = distribution?.reduce((sum: number, item: any) => sum + parseInt(item.count), 0) || 0;
  const distributionData = [
    { rating: "1", count: 0, color: "bg-red-500" },
    { rating: "2", count: 0, color: "bg-orange-500" },
    { rating: "3", count: 0, color: "bg-blue-500" },
    { rating: "4", count: 0, color: "bg-green-500" },
    { rating: "5", count: 0, color: "bg-emerald-500" },
  ];

  // Update with actual data
  distribution?.forEach((item: any) => {
    const index = distributionData.findIndex(d => d.rating === item.rating);
    if (index !== -1) {
      distributionData[index].count = parseInt(item.count);
    }
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Rating Distribution</CardTitle>
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="design">Design</SelectItem>
              <SelectItem value="qa">QA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center mb-4">
          <div className="text-center text-muted-foreground">
            <svg className="h-12 w-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <p className="text-sm">Rating Distribution Chart</p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-5 gap-2 text-center">
          {distributionData.map((item) => {
            const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
            return (
              <div key={item.rating} data-testid={`rating-distribution-${item.rating}`}>
                <div className={`h-2 w-full ${item.color} rounded mb-1`}></div>
                <p className="text-xs text-muted-foreground">
                  {item.rating} ({percentage}%)
                </p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
