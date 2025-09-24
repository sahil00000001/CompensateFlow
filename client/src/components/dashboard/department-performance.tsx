import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DepartmentPerformance() {
  const { data: performance, isLoading } = useQuery({
    queryKey: ['/api/dashboard/analytics/department-performance'],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-muted/50 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const departmentIcons = {
    Engineering: (
      <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
      </svg>
    ),
    Design: (
      <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M11 7h3v3M15 11l4-4"></path>
      </svg>
    ),
    QA: (
      <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
      </svg>
    ),
    'Data Science': (
      <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
      </svg>
    ),
  };

  const departmentColors = {
    Engineering: 'bg-blue-100',
    Design: 'bg-purple-100', 
    QA: 'bg-green-100',
    'Data Science': 'bg-orange-100',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Department Performance</CardTitle>
        <p className="text-sm text-muted-foreground">Average ratings by department</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!performance || performance.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground">
                <svg className="h-12 w-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
                <p className="text-sm">No department data available</p>
              </div>
            </div>
          ) : (
            performance.map((dept: any, index: number) => {
              const averageRating = parseFloat(dept.averageRating || 0).toFixed(1);
              const progressWidth = (parseFloat(averageRating) / 5) * 100;
              const departmentName = dept.department || 'Unknown';
              
              return (
                <div key={index} className="flex items-center justify-between" data-testid={`department-${departmentName.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 ${departmentColors[departmentName as keyof typeof departmentColors] || 'bg-gray-100'} rounded-lg flex items-center justify-center`}>
                      {departmentIcons[departmentName as keyof typeof departmentIcons] || (
                        <svg className="h-4 w-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{departmentName}</p>
                      <p className="text-sm text-muted-foreground">{dept.employeeCount} employees</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">{averageRating}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-16 h-2 bg-muted rounded-full">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressWidth}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
}
