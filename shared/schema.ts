import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Enums
export const roleEnum = pgEnum("role", ["founder", "l1_manager", "l2_manager", "l3_manager", "peer"]);
export const categoryEnum = pgEnum("category", ["software_developer", "ml_engineer", "qa_engineer", "ui_ux_developer"]);
export const reviewStatusEnum = pgEnum("review_status", ["not_started", "self_assessment", "feedback_collection", "manager_review", "meeting_scheduled", "completed", "appeal_requested", "appeal_completed"]);
export const ratingEnum = pgEnum("rating", ["1", "2", "3", "4", "5"]);
export const appealStatusEnum = pgEnum("appeal_status", ["pending", "accepted", "rejected", "completed"]);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: roleEnum("role").notNull().default("peer"),
  category: categoryEnum("category"),
  managerId: varchar("manager_id").references(() => users.id),
  department: varchar("department"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Review cycles
export const reviewCycles = pgTable("review_cycles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  selfAssessmentDeadline: timestamp("self_assessment_deadline").notNull(),
  feedbackDeadline: timestamp("feedback_deadline").notNull(),
  reviewDeadline: timestamp("review_deadline").notNull(),
  meetingDeadline: timestamp("meeting_deadline").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Employee reviews
export const employeeReviews = pgTable("employee_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: varchar("employee_id").notNull().references(() => users.id),
  cycleId: varchar("cycle_id").notNull().references(() => reviewCycles.id),
  status: reviewStatusEnum("status").default("not_started"),
  selfAssessmentData: jsonb("self_assessment_data"),
  currentCtc: decimal("current_ctc"),
  expectedCtc: decimal("expected_ctc"),
  expectedIncrementPercentage: decimal("expected_increment_percentage"),
  finalRating: ratingEnum("final_rating"),
  finalIncrementPercentage: decimal("final_increment_percentage"),
  l3Comments: text("l3_comments"),
  l2Comments: text("l2_comments"),
  l1Comments: text("l1_comments"),
  founderComments: text("founder_comments"),
  meetingNotes: text("meeting_notes"),
  appealUsed: boolean("appeal_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 360-degree feedback
export const feedback = pgTable("feedback", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull().references(() => employeeReviews.id),
  feedbackFromId: varchar("feedback_from_id").notNull().references(() => users.id),
  technicalCompetence: ratingEnum("technical_competence"),
  communicationSkills: ratingEnum("communication_skills"),
  teamCollaboration: ratingEnum("team_collaboration"),
  problemSolving: ratingEnum("problem_solving"),
  leadershipPotential: ratingEnum("leadership_potential"),
  reliability: ratingEnum("reliability"),
  innovation: ratingEnum("innovation"),
  overallFeedback: text("overall_feedback"),
  strengths: text("strengths"),
  improvements: text("improvements"),
  isAnonymous: boolean("is_anonymous").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meeting schedules
export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull().references(() => employeeReviews.id),
  managerId: varchar("manager_id").notNull().references(() => users.id),
  employeeId: varchar("employee_id").notNull().references(() => users.id),
  scheduledAt: timestamp("scheduled_at").notNull(),
  duration: integer("duration").default(45), // minutes
  meetingLink: varchar("meeting_link"),
  status: varchar("status").default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Appeals
export const appeals = pgTable("appeals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  reviewId: varchar("review_id").notNull().references(() => employeeReviews.id),
  employeeId: varchar("employee_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  supportingDocuments: jsonb("supporting_documents"),
  desiredOutcome: text("desired_outcome"),
  status: appealStatusEnum("status").default("pending"),
  managerId: varchar("manager_id").references(() => users.id),
  managerResponse: text("manager_response"),
  finalRating: ratingEnum("final_rating"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Activity logs
export const activityLogs = pgTable("activity_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: varchar("action").notNull(),
  description: text("description"),
  relatedEntityType: varchar("related_entity_type"), // review, appeal, meeting, etc.
  relatedEntityId: varchar("related_entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  manager: one(users, {
    fields: [users.managerId],
    references: [users.id],
  }),
  directReports: many(users),
  employeeReviews: many(employeeReviews),
  givenFeedback: many(feedback, { relationName: "givenFeedback" }),
  meetings: many(meetings),
  appeals: many(appeals),
  activityLogs: many(activityLogs),
}));

export const reviewCyclesRelations = relations(reviewCycles, ({ many }) => ({
  employeeReviews: many(employeeReviews),
}));

export const employeeReviewsRelations = relations(employeeReviews, ({ one, many }) => ({
  employee: one(users, {
    fields: [employeeReviews.employeeId],
    references: [users.id],
  }),
  cycle: one(reviewCycles, {
    fields: [employeeReviews.cycleId],
    references: [reviewCycles.id],
  }),
  feedback: many(feedback),
  meetings: many(meetings),
  appeals: many(appeals),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  review: one(employeeReviews, {
    fields: [feedback.reviewId],
    references: [employeeReviews.id],
  }),
  feedbackFrom: one(users, {
    fields: [feedback.feedbackFromId],
    references: [users.id],
  }),
}));

export const meetingsRelations = relations(meetings, ({ one }) => ({
  review: one(employeeReviews, {
    fields: [meetings.reviewId],
    references: [employeeReviews.id],
  }),
  manager: one(users, {
    fields: [meetings.managerId],
    references: [users.id],
  }),
  employee: one(users, {
    fields: [meetings.employeeId],
    references: [users.id],
  }),
}));

export const appealsRelations = relations(appeals, ({ one }) => ({
  review: one(employeeReviews, {
    fields: [appeals.reviewId],
    references: [employeeReviews.id],
  }),
  employee: one(users, {
    fields: [appeals.employeeId],
    references: [users.id],
  }),
  manager: one(users, {
    fields: [appeals.managerId],
    references: [users.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReviewCycleSchema = createInsertSchema(reviewCycles).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeReviewSchema = createInsertSchema(employeeReviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
});

export const insertAppealSchema = createInsertSchema(appeals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivityLogSchema = createInsertSchema(activityLogs).omit({
  id: true,
  createdAt: true,
});

// Upsert schema for Replit Auth
export const upsertUserSchema = insertUserSchema.partial().extend({
  id: z.string(),
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type ReviewCycle = typeof reviewCycles.$inferSelect;
export type InsertReviewCycle = z.infer<typeof insertReviewCycleSchema>;
export type EmployeeReview = typeof employeeReviews.$inferSelect;
export type InsertEmployeeReview = z.infer<typeof insertEmployeeReviewSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Appeal = typeof appeals.$inferSelect;
export type InsertAppeal = z.infer<typeof insertAppealSchema>;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;
