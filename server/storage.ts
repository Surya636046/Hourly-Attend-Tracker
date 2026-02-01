import { 
  User, InsertUser, 
  Staff, InsertStaff,
  Student, InsertStudent,
  Subject,
  Timetable,
  Attendance,
  users, staff, students, subjects, timetable, attendance
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Staff & Students
  createStaff(details: InsertStaff): Promise<Staff>;
  createStudent(details: InsertStudent): Promise<Student>;
  getStaffByUserId(userId: number): Promise<Staff | undefined>;
  getStudentByUserId(userId: number): Promise<Student | undefined>;
  getAllStaff(): Promise<(Staff & { user: User })[]>;
  getAllStudents(filters?: { department?: string; year?: number; section?: string }): Promise<(Student & { user: User })[]>;
  getStudentsBySection(section: string, department: string, year: number): Promise<Student[]>;

  // Subjects
  createSubject(subject: typeof subjects.$inferInsert): Promise<Subject>;
  getAllSubjects(): Promise<Subject[]>;
  
  // Timetable
  createTimetableEntry(entry: typeof timetable.$inferInsert): Promise<Timetable>;
  getTimetable(day?: string, staffId?: number, section?: string): Promise<(Timetable & { subject: Subject; staff: Staff & { user: User } })[]>;
  
  // Attendance
  markAttendance(records: typeof attendance.$inferInsert[]): Promise<void>;
  getAttendanceReport(studentId: number, subjectId?: number): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createStaff(details: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(details).returning();
    return newStaff;
  }

  async createStudent(details: InsertStudent): Promise<Student> {
    const [newStudent] = await db.insert(students).values(details).returning();
    return newStudent;
  }

  async getStaffByUserId(userId: number): Promise<Staff | undefined> {
    const [s] = await db.select().from(staff).where(eq(staff.userId, userId));
    return s;
  }

  async getStudentByUserId(userId: number): Promise<Student | undefined> {
    const [s] = await db.select().from(students).where(eq(students.userId, userId));
    return s;
  }

  async getAllStaff(): Promise<(Staff & { user: User })[]> {
    const result = await db.select().from(staff).innerJoin(users, eq(staff.userId, users.id));
    return result.map(({ staff, users }) => ({ ...staff, user: users }));
  }

  async getAllStudents(filters?: { department?: string; year?: number; section?: string }): Promise<(Student & { user: User })[]> {
    let query = db.select().from(students).innerJoin(users, eq(students.userId, users.id));
    
    if (filters?.department) query.where(eq(students.department, filters.department));
    // Add other filters as needed logic (using and())
    
    const result = await query;
    // Simple in-memory filter for now if query composition gets complex, but strictly should be SQL
    let filtered = result.map(({ students, users }) => ({ ...students, user: users }));
    
    if (filters?.year) filtered = filtered.filter(s => s.year === filters.year);
    if (filters?.section) filtered = filtered.filter(s => s.section === filters.section);
    
    return filtered;
  }
  
  async getStudentsBySection(section: string, department: string, year: number): Promise<Student[]> {
      // In a real app we'd filter strictly. For this demo, assuming section is unique enough or we filter properly.
      const result = await db.select().from(students)
        .where(and(
            eq(students.section, section),
            eq(students.department, department),
            eq(students.year, year)
        ));
      return result;
  }

  async createSubject(subject: typeof subjects.$inferInsert): Promise<Subject> {
    const [s] = await db.insert(subjects).values(subject).returning();
    return s;
  }

  async getAllSubjects(): Promise<Subject[]> {
    return await db.select().from(subjects);
  }

  async createTimetableEntry(entry: typeof timetable.$inferInsert): Promise<Timetable> {
    const [t] = await db.insert(timetable).values(entry).returning();
    return t;
  }

  async getTimetable(day?: string, staffId?: number, section?: string): Promise<(Timetable & { subject: Subject; staff: Staff & { user: User } })[]> {
    let conditions = [];
    if (day) conditions.push(eq(timetable.day, day));
    if (staffId) conditions.push(eq(timetable.staffId, staffId));
    if (section) conditions.push(eq(timetable.section, section));

    const result = await db.select()
      .from(timetable)
      .innerJoin(subjects, eq(timetable.subjectId, subjects.id))
      .innerJoin(staff, eq(timetable.staffId, staff.id))
      .innerJoin(users, eq(staff.userId, users.id))
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(timetable.period);
      
    return result.map(row => ({
      ...row.timetable,
      subject: row.subjects,
      staff: { ...row.staff, user: row.users }
    }));
  }

  async markAttendance(records: typeof attendance.$inferInsert[]): Promise<void> {
    if (records.length === 0) return;
    await db.insert(attendance).values(records);
  }

  async getAttendanceReport(studentId: number, subjectId?: number): Promise<any[]> {
    // This is a simplified report logic.
    // 1. Get all subjects the student is enrolled in (via section/year/dept matches in timetable)
    // For MVP, we'll just query attendance table directly and group by subject.
    
    const conditions = [eq(attendance.studentId, studentId)];
    if (subjectId) conditions.push(eq(attendance.subjectId, subjectId));
    
    const records = await db.select({
        subjectName: subjects.name,
        status: attendance.status,
        subjectId: subjects.id
    })
    .from(attendance)
    .innerJoin(subjects, eq(attendance.subjectId, subjects.id))
    .where(and(...conditions));
    
    // Aggregate
    const stats = new Map<string, { total: number, present: number }>();
    
    records.forEach(r => {
        const key = r.subjectName;
        if (!stats.has(key)) stats.set(key, { total: 0, present: 0 });
        const s = stats.get(key)!;
        s.total++;
        if (r.status === 'present') s.present++;
    });
    
    return Array.from(stats.entries()).map(([subjectName, s]) => ({
        subjectName,
        totalClasses: s.total,
        attendedClasses: s.present,
        percentage: Math.round((s.present / s.total) * 100)
    }));
  }
}

export const storage = new DatabaseStorage();
