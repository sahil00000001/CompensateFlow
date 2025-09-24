import { z } from 'zod';

// Form validation schemas
export const selfAssessmentSchema = z.object({
  currentCtc: z.string().min(1, 'Current CTC is required'),
  expectedCtc: z.string().min(1, 'Expected CTC is required'),
  expectedIncrementPercentage: z.string().min(1, 'Expected increment percentage is required'),
  careerGoals: z.string().min(10, 'Career goals must be at least 10 characters'),
  trainingNeeds: z.string().optional(),
  workFromHomePreference: z.enum(['yes', 'no', 'hybrid']),
  projectContributions: z.string().min(10, 'Project contributions must be at least 10 characters'),
  teamCollaboration: z.enum(['1', '2', '3', '4', '5']),
  initiatives: z.string().min(10, 'Initiative examples must be at least 10 characters'),
  challenges: z.string().min(10, 'Challenges and solutions must be at least 10 characters'),
  areasOfImprovement: z.string().min(10, 'Areas of improvement must be at least 10 characters'),
  categorySpecificFields: z.record(z.string()).optional(),
  additionalComments: z.string().optional(),
});

export const feedbackSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  technicalCompetence: z.enum(['1', '2', '3', '4', '5']),
  communicationSkills: z.enum(['1', '2', '3', '4', '5']),
  teamCollaboration: z.enum(['1', '2', '3', '4', '5']),
  problemSolving: z.enum(['1', '2', '3', '4', '5']),
  leadershipPotential: z.enum(['1', '2', '3', '4', '5']),
  reliability: z.enum(['1', '2', '3', '4', '5']),
  innovation: z.enum(['1', '2', '3', '4', '5']),
  overallFeedback: z.string().min(50, 'Overall feedback must be at least 50 characters'),
  strengths: z.string().min(10, 'Strengths must be at least 10 characters'),
  improvements: z.string().optional(),
  isAnonymous: z.boolean().default(true),
});

export const reviewSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  l3Comments: z.string().optional(),
  l2Comments: z.string().optional(),
  l1Comments: z.string().optional(),
  founderComments: z.string().optional(),
  finalRating: z.enum(['1', '2', '3', '4', '5']).optional(),
  finalIncrementPercentage: z.string().optional(),
});

export const appealSchema = z.object({
  reason: z.string().min(50, 'Reason must be at least 50 characters'),
  desiredOutcome: z.string().min(20, 'Desired outcome must be at least 20 characters'),
  supportingDocuments: z.array(z.string()).optional(),
});

export const meetingSchema = z.object({
  reviewId: z.string().min(1, 'Review ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  scheduledAt: z.date(),
  duration: z.number().min(15).max(180),
  meetingLink: z.string().url().optional(),
  notes: z.string().optional(),
});

// Type exports
export type SelfAssessmentData = z.infer<typeof selfAssessmentSchema>;
export type FeedbackData = z.infer<typeof feedbackSchema>;
export type ReviewData = z.infer<typeof reviewSchema>;
export type AppealData = z.infer<typeof appealSchema>;
export type MeetingData = z.infer<typeof meetingSchema>;

// UI component types
export interface DashboardStats {
  totalEmployees: number;
  completedReviews: number;
  pendingApprovals: number;
  averageRating: number;
}

export interface PendingAction {
  type: 'approval' | 'appeal' | 'feedback' | 'meeting';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    category: string;
  };
  data: any;
  deadline?: string;
}

export interface TimelineItem {
  title: string;
  period: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'pending';
  progress?: string;
}

export interface RatingDistribution {
  rating: string;
  count: number;
  percentage: number;
}

export interface DepartmentPerformance {
  department: string;
  averageRating: number;
  employeeCount: number;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  description: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
}

// Form field configurations
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'radio' | 'checkbox';
  required: boolean;
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
  validation?: any;
}

export interface CategoryFormConfig {
  title: string;
  description: string;
  fields: FormField[];
}

// API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

// Filter and search types
export interface SearchFilters {
  query?: string;
  department?: string;
  role?: string;
  status?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

// Chart data types
export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
}

// Meeting types
export interface MeetingSlot {
  date: Date;
  time: string;
  available: boolean;
  duration: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: 'meeting' | 'deadline' | 'reminder';
  attendees?: string[];
}
