import {
  users,
  reviewCycles,
  employeeReviews,
  feedback,
  meetings,
  appeals,
  activityLogs,
  type User,
  type UpsertUser,
  type InsertUser,
  type ReviewCycle,
  type InsertReviewCycle,
  type EmployeeReview,
  type InsertEmployeeReview,
  type Feedback,
  type InsertFeedback,
  type Meeting,
  type InsertMeeting,
  type Appeal,
  type InsertAppeal,
  type ActivityLog,
  type InsertActivityLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, count, avg } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<InsertUser>): Promise<User>;
  getUsersByRole(role: string): Promise<User[]>;
  getUsersByManager(managerId: string): Promise<User[]>;
  getDirectReports(managerId: string): Promise<User[]>;
  
  // Review cycle management
  createReviewCycle(cycle: InsertReviewCycle): Promise<ReviewCycle>;
  getActiveReviewCycle(): Promise<ReviewCycle | undefined>;
  getAllReviewCycles(): Promise<ReviewCycle[]>;
  updateReviewCycle(id: string, data: Partial<InsertReviewCycle>): Promise<ReviewCycle>;
  
  // Employee review management
  createEmployeeReview(review: InsertEmployeeReview): Promise<EmployeeReview>;
  getEmployeeReview(employeeId: string, cycleId: string): Promise<EmployeeReview | undefined>;
  getEmployeeReviewById(id: string): Promise<EmployeeReview | undefined>;
  updateEmployeeReview(id: string, data: Partial<InsertEmployeeReview>): Promise<EmployeeReview>;
  getReviewsByManager(managerId: string, cycleId: string): Promise<EmployeeReview[]>;
  getReviewsByStatus(status: string, cycleId: string): Promise<EmployeeReview[]>;
  getPendingApprovals(managerId: string): Promise<EmployeeReview[]>;
  
  // 360-degree feedback
  createFeedback(feedbackData: InsertFeedback): Promise<Feedback>;
  getFeedbackForReview(reviewId: string): Promise<Feedback[]>;
  getFeedbackByUser(userId: string, cycleId: string): Promise<Feedback[]>;
  
  // Meeting management
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  getMeetingsByEmployee(employeeId: string): Promise<Meeting[]>;
  getMeetingsByManager(managerId: string): Promise<Meeting[]>;
  updateMeeting(id: string, data: Partial<InsertMeeting>): Promise<Meeting>;
  
  // Appeal management
  createAppeal(appeal: InsertAppeal): Promise<Appeal>;
  getAppealsByEmployee(employeeId: string): Promise<Appeal[]>;
  getAppealsByManager(managerId: string): Promise<Appeal[]>;
  updateAppeal(id: string, data: Partial<InsertAppeal>): Promise<Appeal>;
  
  // Activity logging
  logActivity(activity: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivities(limit?: number): Promise<ActivityLog[]>;
  getActivitiesByUser(userId: string): Promise<ActivityLog[]>;
  
  // Analytics
  getReviewStats(cycleId: string): Promise<any>;
  getRatingDistribution(cycleId: string): Promise<any>;
  getDepartmentPerformance(cycleId: string): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User management
  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, role as any));
  }

  async getUsersByManager(managerId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.managerId, managerId));
  }

  async getDirectReports(managerId: string): Promise<User[]> {
    return await db.select().from(users).where(eq(users.managerId, managerId));
  }

  // Review cycle management
  async createReviewCycle(cycleData: InsertReviewCycle): Promise<ReviewCycle> {
    const [cycle] = await db.insert(reviewCycles).values(cycleData).returning();
    return cycle;
  }

  async getActiveReviewCycle(): Promise<ReviewCycle | undefined> {
    const [cycle] = await db
      .select()
      .from(reviewCycles)
      .where(eq(reviewCycles.isActive, true));
    return cycle;
  }

  async getAllReviewCycles(): Promise<ReviewCycle[]> {
    return await db.select().from(reviewCycles).orderBy(desc(reviewCycles.createdAt));
  }

  async updateReviewCycle(id: string, data: Partial<InsertReviewCycle>): Promise<ReviewCycle> {
    const [cycle] = await db
      .update(reviewCycles)
      .set(data)
      .where(eq(reviewCycles.id, id))
      .returning();
    return cycle;
  }

  // Employee review management
  async createEmployeeReview(reviewData: InsertEmployeeReview): Promise<EmployeeReview> {
    const [review] = await db.insert(employeeReviews).values(reviewData).returning();
    return review;
  }

  async getEmployeeReview(employeeId: string, cycleId: string): Promise<EmployeeReview | undefined> {
    const [review] = await db
      .select()
      .from(employeeReviews)
      .where(
        and(
          eq(employeeReviews.employeeId, employeeId),
          eq(employeeReviews.cycleId, cycleId)
        )
      );
    return review;
  }

  async getEmployeeReviewById(id: string): Promise<EmployeeReview | undefined> {
    const [review] = await db
      .select()
      .from(employeeReviews)
      .where(eq(employeeReviews.id, id));
    return review;
  }

  async updateEmployeeReview(id: string, data: Partial<InsertEmployeeReview>): Promise<EmployeeReview> {
    const [review] = await db
      .update(employeeReviews)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employeeReviews.id, id))
      .returning();
    return review;
  }

  async getReviewsByManager(managerId: string, cycleId: string): Promise<EmployeeReview[]> {
    return await db
      .select()
      .from(employeeReviews)
      .innerJoin(users, eq(employeeReviews.employeeId, users.id))
      .where(
        and(
          eq(users.managerId, managerId),
          eq(employeeReviews.cycleId, cycleId)
        )
      );
  }

  async getReviewsByStatus(status: string, cycleId: string): Promise<EmployeeReview[]> {
    return await db
      .select()
      .from(employeeReviews)
      .where(
        and(
          eq(employeeReviews.status, status as any),
          eq(employeeReviews.cycleId, cycleId)
        )
      );
  }

  async getPendingApprovals(managerId: string): Promise<EmployeeReview[]> {
    return await db
      .select()
      .from(employeeReviews)
      .innerJoin(users, eq(employeeReviews.employeeId, users.id))
      .where(
        and(
          eq(users.managerId, managerId),
          or(
            eq(employeeReviews.status, "manager_review"),
            eq(employeeReviews.status, "meeting_scheduled")
          )
        )
      );
  }

  // 360-degree feedback
  async createFeedback(feedbackData: InsertFeedback): Promise<Feedback> {
    const [feedbackRecord] = await db.insert(feedback).values(feedbackData).returning();
    return feedbackRecord;
  }

  async getFeedbackForReview(reviewId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .where(eq(feedback.reviewId, reviewId));
  }

  async getFeedbackByUser(userId: string, cycleId: string): Promise<Feedback[]> {
    return await db
      .select()
      .from(feedback)
      .innerJoin(employeeReviews, eq(feedback.reviewId, employeeReviews.id))
      .where(
        and(
          eq(feedback.feedbackFromId, userId),
          eq(employeeReviews.cycleId, cycleId)
        )
      );
  }

  // Meeting management
  async createMeeting(meetingData: InsertMeeting): Promise<Meeting> {
    const [meeting] = await db.insert(meetings).values(meetingData).returning();
    return meeting;
  }

  async getMeetingsByEmployee(employeeId: string): Promise<Meeting[]> {
    return await db
      .select()
      .from(meetings)
      .where(eq(meetings.employeeId, employeeId))
      .orderBy(desc(meetings.scheduledAt));
  }

  async getMeetingsByManager(managerId: string): Promise<Meeting[]> {
    return await db
      .select()
      .from(meetings)
      .where(eq(meetings.managerId, managerId))
      .orderBy(desc(meetings.scheduledAt));
  }

  async updateMeeting(id: string, data: Partial<InsertMeeting>): Promise<Meeting> {
    const [meeting] = await db
      .update(meetings)
      .set(data)
      .where(eq(meetings.id, id))
      .returning();
    return meeting;
  }

  // Appeal management
  async createAppeal(appealData: InsertAppeal): Promise<Appeal> {
    const [appeal] = await db.insert(appeals).values(appealData).returning();
    return appeal;
  }

  async getAppealsByEmployee(employeeId: string): Promise<Appeal[]> {
    return await db
      .select()
      .from(appeals)
      .where(eq(appeals.employeeId, employeeId))
      .orderBy(desc(appeals.createdAt));
  }

  async getAppealsByManager(managerId: string): Promise<Appeal[]> {
    return await db
      .select()
      .from(appeals)
      .where(eq(appeals.managerId, managerId))
      .orderBy(desc(appeals.createdAt));
  }

  async updateAppeal(id: string, data: Partial<InsertAppeal>): Promise<Appeal> {
    const [appeal] = await db
      .update(appeals)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(appeals.id, id))
      .returning();
    return appeal;
  }

  // Activity logging
  async logActivity(activityData: InsertActivityLog): Promise<ActivityLog> {
    const [activity] = await db.insert(activityLogs).values(activityData).returning();
    return activity;
  }

  async getRecentActivities(limit: number = 10): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .orderBy(desc(activityLogs.createdAt))
      .limit(limit);
  }

  async getActivitiesByUser(userId: string): Promise<ActivityLog[]> {
    return await db
      .select()
      .from(activityLogs)
      .where(eq(activityLogs.userId, userId))
      .orderBy(desc(activityLogs.createdAt));
  }

  // Analytics
  async getReviewStats(cycleId: string): Promise<any> {
    const totalEmployees = await db
      .select({ count: count() })
      .from(employeeReviews)
      .where(eq(employeeReviews.cycleId, cycleId));

    const completedReviews = await db
      .select({ count: count() })
      .from(employeeReviews)
      .where(
        and(
          eq(employeeReviews.cycleId, cycleId),
          eq(employeeReviews.status, "completed")
        )
      );

    const averageRating = await db
      .select({ avg: avg(employeeReviews.finalRating) })
      .from(employeeReviews)
      .where(
        and(
          eq(employeeReviews.cycleId, cycleId),
          eq(employeeReviews.status, "completed")
        )
      );

    return {
      totalEmployees: totalEmployees[0]?.count || 0,
      completedReviews: completedReviews[0]?.count || 0,
      averageRating: averageRating[0]?.avg || 0,
    };
  }

  async getRatingDistribution(cycleId: string): Promise<any> {
    return await db
      .select({
        rating: employeeReviews.finalRating,
        count: count(),
      })
      .from(employeeReviews)
      .where(
        and(
          eq(employeeReviews.cycleId, cycleId),
          eq(employeeReviews.status, "completed")
        )
      )
      .groupBy(employeeReviews.finalRating);
  }

  async getDepartmentPerformance(cycleId: string): Promise<any> {
    return await db
      .select({
        department: users.department,
        averageRating: avg(employeeReviews.finalRating),
        employeeCount: count(),
      })
      .from(employeeReviews)
      .innerJoin(users, eq(employeeReviews.employeeId, users.id))
      .where(
        and(
          eq(employeeReviews.cycleId, cycleId),
          eq(employeeReviews.status, "completed")
        )
      )
      .groupBy(users.department);
  }
}

export const storage = new DatabaseStorage();
