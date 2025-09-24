import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";
import { 
  insertEmployeeReviewSchema,
  insertFeedbackSchema,
  insertMeetingSchema,
  insertAppealSchema,
  insertReviewCycleSchema 
} from "@shared/schema";
import { sendReviewNotification, sendMeetingInvitation, sendAppealNotification } from "./emailService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const cycle = await storage.getActiveReviewCycle();
      if (!cycle) {
        return res.json({ totalEmployees: 0, completedReviews: 0, pendingApprovals: 0, averageRating: 0 });
      }

      const stats = await storage.getReviewStats(cycle.id);
      const pendingApprovals = await storage.getPendingApprovals(req.user.claims.sub);
      
      res.json({
        ...stats,
        pendingApprovals: pendingApprovals.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get('/api/dashboard/pending-actions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const pendingActions = [];

      // Get pending approvals for managers
      if (user.role === 'l1_manager' || user.role === 'l2_manager') {
        const pendingApprovals = await storage.getPendingApprovals(userId);
        pendingActions.push(...pendingApprovals.map(review => ({
          type: 'approval',
          data: review,
        })));
      }

      // Get pending appeals
      if (user.role === 'l2_manager' || user.role === 'founder') {
        const pendingAppeals = await storage.getAppealsByManager(userId);
        pendingActions.push(...pendingAppeals.filter(appeal => appeal.status === 'pending').map(appeal => ({
          type: 'appeal',
          data: appeal,
        })));
      }

      res.json(pendingActions);
    } catch (error) {
      console.error("Error fetching pending actions:", error);
      res.status(500).json({ message: "Failed to fetch pending actions" });
    }
  });

  app.get('/api/dashboard/recent-activities', isAuthenticated, async (req: any, res) => {
    try {
      const activities = await storage.getRecentActivities(10);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });

  app.get('/api/dashboard/analytics/rating-distribution', isAuthenticated, async (req: any, res) => {
    try {
      const cycle = await storage.getActiveReviewCycle();
      if (!cycle) {
        return res.json([]);
      }

      const distribution = await storage.getRatingDistribution(cycle.id);
      res.json(distribution);
    } catch (error) {
      console.error("Error fetching rating distribution:", error);
      res.status(500).json({ message: "Failed to fetch rating distribution" });
    }
  });

  app.get('/api/dashboard/analytics/department-performance', isAuthenticated, async (req: any, res) => {
    try {
      const cycle = await storage.getActiveReviewCycle();
      if (!cycle) {
        return res.json([]);
      }

      const performance = await storage.getDepartmentPerformance(cycle.id);
      res.json(performance);
    } catch (error) {
      console.error("Error fetching department performance:", error);
      res.status(500).json({ message: "Failed to fetch department performance" });
    }
  });

  // Review cycle management
  app.post('/api/review-cycles', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.role !== 'founder') {
        return res.status(403).json({ message: "Only founder can create review cycles" });
      }

      const cycleData = insertReviewCycleSchema.parse(req.body);
      const cycle = await storage.createReviewCycle(cycleData);
      
      res.status(201).json(cycle);
    } catch (error) {
      console.error("Error creating review cycle:", error);
      res.status(500).json({ message: "Failed to create review cycle" });
    }
  });

  app.get('/api/review-cycles/active', isAuthenticated, async (req: any, res) => {
    try {
      const cycle = await storage.getActiveReviewCycle();
      res.json(cycle);
    } catch (error) {
      console.error("Error fetching active review cycle:", error);
      res.status(500).json({ message: "Failed to fetch active review cycle" });
    }
  });

  // Employee review management
  app.get('/api/reviews/my-review', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cycle = await storage.getActiveReviewCycle();
      
      if (!cycle) {
        return res.status(404).json({ message: "No active review cycle" });
      }

      const review = await storage.getEmployeeReview(userId, cycle.id);
      res.json(review);
    } catch (error) {
      console.error("Error fetching employee review:", error);
      res.status(500).json({ message: "Failed to fetch employee review" });
    }
  });

  app.post('/api/reviews/self-assessment', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cycle = await storage.getActiveReviewCycle();
      
      if (!cycle) {
        return res.status(404).json({ message: "No active review cycle" });
      }

      let review = await storage.getEmployeeReview(userId, cycle.id);
      
      if (!review) {
        // Create new review if it doesn't exist
        review = await storage.createEmployeeReview({
          employeeId: userId,
          cycleId: cycle.id,
          status: 'self_assessment',
        });
      }

      const updatedReview = await storage.updateEmployeeReview(review.id, {
        selfAssessmentData: req.body,
        status: 'feedback_collection',
      });

      // Log activity
      await storage.logActivity({
        userId,
        action: 'self_assessment_completed',
        description: 'Completed self-assessment',
        relatedEntityType: 'review',
        relatedEntityId: review.id,
      });

      res.json(updatedReview);
    } catch (error) {
      console.error("Error saving self-assessment:", error);
      res.status(500).json({ message: "Failed to save self-assessment" });
    }
  });

  // 360-degree feedback
  app.post('/api/feedback', isAuthenticated, async (req: any, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        feedbackFromId: req.user.claims.sub,
      });

      const feedback = await storage.createFeedback(feedbackData);

      // Log activity
      await storage.logActivity({
        userId: req.user.claims.sub,
        action: 'feedback_submitted',
        description: 'Submitted 360-degree feedback',
        relatedEntityType: 'feedback',
        relatedEntityId: feedback.id,
      });

      res.status(201).json(feedback);
    } catch (error) {
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  app.get('/api/feedback/pending', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cycle = await storage.getActiveReviewCycle();
      
      if (!cycle) {
        return res.json([]);
      }

      const givenFeedback = await storage.getFeedbackByUser(userId, cycle.id);
      // TODO: Implement logic to find pending feedback requests
      
      res.json([]);
    } catch (error) {
      console.error("Error fetching pending feedback:", error);
      res.status(500).json({ message: "Failed to fetch pending feedback" });
    }
  });

  // Meeting management
  app.post('/api/meetings', isAuthenticated, async (req: any, res) => {
    try {
      const meetingData = insertMeetingSchema.parse({
        ...req.body,
        managerId: req.user.claims.sub,
      });

      const meeting = await storage.createMeeting(meetingData);

      // Send meeting invitation
      const employee = await storage.getUser(meeting.employeeId);
      const manager = await storage.getUser(meeting.managerId);
      
      if (employee?.email && manager) {
        await sendMeetingInvitation(
          employee.email,
          `${employee.firstName} ${employee.lastName}`,
          `${manager.firstName} ${manager.lastName}`,
          meeting.scheduledAt.toISOString(),
          meeting.meetingLink || undefined
        );
      }

      // Log activity
      await storage.logActivity({
        userId: req.user.claims.sub,
        action: 'meeting_scheduled',
        description: `Scheduled 1:1 meeting with ${employee?.firstName} ${employee?.lastName}`,
        relatedEntityType: 'meeting',
        relatedEntityId: meeting.id,
      });

      res.status(201).json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ message: "Failed to create meeting" });
    }
  });

  app.get('/api/meetings/my-meetings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let meetings;
      if (user.role === 'peer') {
        meetings = await storage.getMeetingsByEmployee(userId);
      } else {
        meetings = await storage.getMeetingsByManager(userId);
      }

      res.json(meetings);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      res.status(500).json({ message: "Failed to fetch meetings" });
    }
  });

  // Appeal management
  app.post('/api/appeals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cycle = await storage.getActiveReviewCycle();
      
      if (!cycle) {
        return res.status(404).json({ message: "No active review cycle" });
      }

      const review = await storage.getEmployeeReview(userId, cycle.id);
      
      if (!review) {
        return res.status(404).json({ message: "Review not found" });
      }

      if (review.appealUsed) {
        return res.status(400).json({ message: "Appeal already used for this review" });
      }

      const appealData = insertAppealSchema.parse({
        ...req.body,
        reviewId: review.id,
        employeeId: userId,
      });

      const appeal = await storage.createAppeal(appealData);

      // Mark appeal as used
      await storage.updateEmployeeReview(review.id, {
        appealUsed: true,
        status: 'appeal_requested',
      });

      // Send notification to manager
      const employee = await storage.getUser(userId);
      const manager = await storage.getUser(employee?.managerId || '');
      
      if (manager?.email && employee) {
        await sendAppealNotification(
          manager.email,
          `${employee.firstName} ${employee.lastName}`,
          `${manager.firstName} ${manager.lastName}`,
          appeal.reason
        );
      }

      // Log activity
      await storage.logActivity({
        userId,
        action: 'appeal_submitted',
        description: 'Submitted appeal request',
        relatedEntityType: 'appeal',
        relatedEntityId: appeal.id,
      });

      res.status(201).json(appeal);
    } catch (error) {
      console.error("Error creating appeal:", error);
      res.status(500).json({ message: "Failed to create appeal" });
    }
  });

  app.put('/api/appeals/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);

      if (user?.role !== 'l2_manager' && user?.role !== 'founder') {
        return res.status(403).json({ message: "Not authorized to handle appeals" });
      }

      const appeal = await storage.updateAppeal(id, {
        ...req.body,
        managerId: userId,
      });

      // Log activity
      await storage.logActivity({
        userId,
        action: 'appeal_processed',
        description: `Processed appeal: ${appeal.status}`,
        relatedEntityType: 'appeal',
        relatedEntityId: appeal.id,
      });

      res.json(appeal);
    } catch (error) {
      console.error("Error updating appeal:", error);
      res.status(500).json({ message: "Failed to update appeal" });
    }
  });

  // User management
  app.get('/api/users/team', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let team = [];

      if (user.role === 'founder') {
        team = await storage.getUsersByRole('l1_manager');
      } else if (user.role === 'l1_manager') {
        team = await storage.getUsersByRole('l2_manager');
      } else if (user.role === 'l2_manager') {
        team = await storage.getUsersByRole('l3_manager');
        const peers = await storage.getUsersByRole('peer');
        team = [...team, ...peers];
      } else if (user.role === 'l3_manager') {
        team = await storage.getDirectReports(userId);
      }

      res.json(team);
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
