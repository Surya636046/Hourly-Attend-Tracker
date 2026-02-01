import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth, hashPassword } from "./auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Passport Auth
  setupAuth(app);

  // --- API Routes ---

  // Users
  app.post(api.users.create.path, async (req, res) => {
    try {
      const input = api.users.create.input.parse(req.body);
      const hashedPassword = await hashPassword(input.password);
      const user = await storage.createUser({
        username: input.username,
        password: hashedPassword,
        role: input.role as any,
        name: input.name,
      });

      if (input.role === 'staff') {
        await storage.createStaff({
            userId: user.id,
            department: input.department || 'General'
        });
      } else if (input.role === 'student') {
        await storage.createStudent({
            userId: user.id,
            department: input.department || 'General',
            year: input.year || 1,
            section: input.section || 'A'
        });
      }

      res.status(201).json(user);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal Server Error" });
    }
  });

  app.get(api.users.listStaff.path, async (req, res) => {
    const staff = await storage.getAllStaff();
    res.json(staff);
  });

  app.get(api.users.listStudents.path, async (req, res) => {
    // Parse filters
    const students = await storage.getAllStudents(req.query as any);
    res.json(students);
  });

  // Subjects
  app.get(api.subjects.list.path, async (req, res) => {
    const subjects = await storage.getAllSubjects();
    res.json(subjects);
  });

  app.post(api.subjects.create.path, async (req, res) => {
    const input = api.subjects.create.input.parse(req.body);
    const subject = await storage.createSubject(input);
    res.status(201).json(subject);
  });

  // Timetable
  app.get(api.timetable.list.path, async (req, res) => {
    const { day, staffId, section } = req.query as any;
    const tt = await storage.getTimetable(day, staffId ? Number(staffId) : undefined, section);
    res.json(tt);
  });

  app.post(api.timetable.create.path, async (req, res) => {
    const input = api.timetable.create.input.parse(req.body);
    const entry = await storage.createTimetableEntry(input);
    res.status(201).json(entry);
  });

  // Attendance
  app.post(api.attendance.mark.path, async (req, res) => {
    const { date, period, subjectId, records } = api.attendance.mark.input.parse(req.body);
    
    // Prepare rows
    const rows = records.map(r => ({
        date,
        period,
        subjectId,
        studentId: r.studentId,
        status: r.status as "present" | "absent"
    }));

    await storage.markAttendance(rows);
    res.json({ message: "Attendance marked successfully", count: rows.length });
  });

  app.get(api.attendance.report.path, async (req, res) => {
    // If student is requesting, use their ID. If admin, use query param.
    // For now, assuming logged in user context or explicit param
    let studentId = req.query.studentId ? Number(req.query.studentId) : undefined;
    
    // If authenticated student, force their ID
    if (req.user?.role === 'student') {
        const student = await storage.getStudentByUserId(req.user.id);
        if (student) studentId = student.id;
    }

    if (!studentId) return res.status(400).json({ message: "Student ID required" });

    const report = await storage.getAttendanceReport(studentId, req.query.subjectId ? Number(req.query.subjectId) : undefined);
    res.json(report);
  });

  await seed();

  return httpServer;
}

async function seed() {
  const existingUser = await storage.getUserByUsername("admin");
  if (existingUser) return;

  const adminPassword = await hashPassword("admin123");
  await storage.createUser({
    username: "admin",
    password: adminPassword,
    role: "admin",
    name: "System Admin"
  });

  const staffPassword = await hashPassword("staff123");
  const staffUser = await storage.createUser({
    username: "raj",
    password: staffPassword,
    role: "staff",
    name: "Mr. Raj"
  });
  const staffRecord = await storage.createStaff({
    userId: staffUser.id,
    department: "CSE"
  });

  const studentPassword = await hashPassword("student123");
  const studentUser = await storage.createUser({
    username: "stu1",
    password: studentPassword,
    role: "student",
    name: "John Doe"
  });
  const studentRecord = await storage.createStudent({
    userId: studentUser.id,
    department: "CSE",
    year: 1,
    section: "A"
  });

  const dbms = await storage.createSubject({
    name: "DBMS",
    code: "CS101",
    department: "CSE",
    isLab: false
  });

  const os = await storage.createSubject({
    name: "OS",
    code: "CS102",
    department: "CSE",
    isLab: false
  });

  const dbmsLab = await storage.createSubject({
    name: "DBMS Lab",
    code: "CS101L",
    department: "CSE",
    isLab: true
  });

  // Timetable for Monday
  await storage.createTimetableEntry({
    day: "Monday",
    period: 1,
    subjectId: dbms.id,
    staffId: staffRecord.id,
    section: "A",
    startTime: "09:00",
    endTime: "10:00"
  });

  await storage.createTimetableEntry({
    day: "Monday",
    period: 2,
    subjectId: os.id,
    staffId: staffRecord.id,
    section: "A",
    startTime: "10:00",
    endTime: "11:00"
  });

  // Lab 3 hours
  for (let p = 3; p <= 5; p++) {
    await storage.createTimetableEntry({
        day: "Monday",
        period: p,
        subjectId: dbmsLab.id,
        staffId: staffRecord.id,
        section: "A",
        startTime: `${p + 8}:00`, // 11:00, 12:00, 13:00 (approx logic)
        endTime: `${p + 9}:00`
      });
  }

  console.log("Database seeded!");
}
