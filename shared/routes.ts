import { z } from 'zod';
import { 
  insertUserSchema, 
  insertSubjectSchema, 
  insertTimetableSchema, 
  insertAttendanceSchema,
  users,
  subjects,
  timetable,
  attendance,
  students,
  staff
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// Custom Input Schemas
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const createFullUserSchema = insertUserSchema.extend({
  department: z.string().optional(), // For staff/student
  year: z.coerce.number().optional(), // For student
  section: z.string().optional(), // For student
});

const markAttendanceSchema = z.object({
  date: z.string(),
  period: z.coerce.number(),
  subjectId: z.coerce.number(),
  records: z.array(z.object({
    studentId: z.coerce.number(),
    status: z.enum(["present", "absent"]),
  })),
});

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: loginSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
  },
  users: {
    create: {
      method: 'POST' as const,
      path: '/api/users',
      input: createFullUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    listStaff: {
      method: 'GET' as const,
      path: '/api/staff',
      responses: {
        200: z.array(z.any()), // StaffWithUser
      },
    },
    listStudents: {
      method: 'GET' as const,
      path: '/api/students',
      input: z.object({
        department: z.string().optional(),
        year: z.coerce.number().optional(),
        section: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()), // StudentWithUser
      },
    },
  },
  subjects: {
    list: {
      method: 'GET' as const,
      path: '/api/subjects',
      responses: {
        200: z.array(z.custom<typeof subjects.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/subjects',
      input: insertSubjectSchema,
      responses: {
        201: z.custom<typeof subjects.$inferSelect>(),
      },
    },
  },
  timetable: {
    list: {
      method: 'GET' as const,
      path: '/api/timetable',
      input: z.object({
        day: z.string().optional(),
        staffId: z.coerce.number().optional(),
        section: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.any()), // TimetableWithDetails
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/timetable',
      input: insertTimetableSchema,
      responses: {
        201: z.custom<typeof timetable.$inferSelect>(),
      },
    },
  },
  attendance: {
    mark: {
      method: 'POST' as const,
      path: '/api/attendance',
      input: markAttendanceSchema,
      responses: {
        200: z.object({ message: z.string(), count: z.number() }),
      },
    },
    report: {
      method: 'GET' as const,
      path: '/api/attendance/report',
      input: z.object({
        studentId: z.coerce.number().optional(),
        subjectId: z.coerce.number().optional(),
      }).optional(),
      responses: {
        200: z.array(z.object({
          subjectName: z.string(),
          totalClasses: z.number(),
          attendedClasses: z.number(),
          percentage: z.number(),
        })),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
