import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Enums
export const userRoles = ["admin", "staff", "student"] as const;
export const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
export const attendanceStatus = ["present", "absent"] as const;

// Users Table (Base for all roles)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: userRoles }).notNull(),
  name: text("name").notNull(),
});

// Staff Details
export const staff = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  department: text("department").notNull(),
});

// Student Details
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  department: text("department").notNull(),
  year: integer("year").notNull(),
  section: text("section").notNull(), // e.g., 'A', 'B'
});

// Subjects
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull(),
  isLab: boolean("is_lab").default(false).notNull(),
  department: text("department").notNull(),
});

// Timetable
export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  day: text("day", { enum: daysOfWeek }).notNull(),
  period: integer("period").notNull(), // 1-7
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  staffId: integer("staff_id").references(() => staff.id).notNull(),
  section: text("section").notNull(), // e.g., 'A', 'B' - Class/Section
  startTime: text("start_time").notNull(), // HH:mm
  endTime: text("end_time").notNull(), // HH:mm
});

// Attendance
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD
  period: integer("period").notNull(),
  subjectId: integer("subject_id").references(() => subjects.id).notNull(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  status: text("status", { enum: attendanceStatus }).notNull(),
});

// RELATIONS
export const staffRelations = relations(staff, ({ one }) => ({
  user: one(users, {
    fields: [staff.userId],
    references: [users.id],
  }),
}));

export const studentRelations = relations(students, ({ one }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
}));

export const timetableRelations = relations(timetable, ({ one }) => ({
  subject: one(subjects, {
    fields: [timetable.subjectId],
    references: [subjects.id],
  }),
  staff: one(staff, {
    fields: [timetable.staffId],
    references: [staff.id],
  }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, {
    fields: [attendance.studentId],
    references: [students.id],
  }),
  subject: one(subjects, {
    fields: [attendance.subjectId],
    references: [subjects.id],
  }),
}));

// SCHEMAS
export const insertUserSchema = createInsertSchema(users);
export const insertStaffSchema = createInsertSchema(staff);
export const insertStudentSchema = createInsertSchema(students);
export const insertSubjectSchema = createInsertSchema(subjects);
export const insertTimetableSchema = createInsertSchema(timetable);
export const insertAttendanceSchema = createInsertSchema(attendance);

// TYPES
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Staff = typeof staff.$inferSelect;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Student = typeof students.$inferSelect;
export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Subject = typeof subjects.$inferSelect;
export type Timetable = typeof timetable.$inferSelect;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = z.infer<typeof insertAttendanceSchema>;

// API TYPES
export type CreateUserRequest = InsertUser & {
  staffDetails?: Omit<InsertStaff, "userId">;
  studentDetails?: Omit<InsertStudent, "userId">;
};

// Complex response types
export type StaffWithUser = Staff & { user: User };
export type StudentWithUser = Student & { user: User };
export type TimetableWithDetails = Timetable & { subject: Subject; staff: StaffWithUser };
