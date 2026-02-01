import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";

// ============================================
// USERS (Staff & Students)
// ============================================
export function useCreateUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.users.create.input>) => {
      const res = await fetch(api.users.create.path, {
        method: api.users.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create user");
      return api.users.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.users.listStaff.path] });
      queryClient.invalidateQueries({ queryKey: [api.users.listStudents.path] });
      toast({ title: "Success", description: "User created successfully" });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });
}

export function useStaff() {
  return useQuery({
    queryKey: [api.users.listStaff.path],
    queryFn: async () => {
      const res = await fetch(api.users.listStaff.path);
      if (!res.ok) throw new Error("Failed to fetch staff");
      return api.users.listStaff.responses[200].parse(await res.json());
    },
  });
}

export function useStudents(params?: z.infer<typeof api.users.listStudents.input>) {
  return useQuery({
    queryKey: [api.users.listStudents.path, params],
    queryFn: async () => {
      const url = buildUrl(api.users.listStudents.path);
      const searchParams = new URLSearchParams();
      if (params?.department) searchParams.set("department", params.department);
      if (params?.year) searchParams.set("year", String(params.year));
      if (params?.section) searchParams.set("section", params.section);
      
      const res = await fetch(`${url}?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch students");
      return api.users.listStudents.responses[200].parse(await res.json());
    },
  });
}

// ============================================
// SUBJECTS
// ============================================
export function useSubjects() {
  return useQuery({
    queryKey: [api.subjects.list.path],
    queryFn: async () => {
      const res = await fetch(api.subjects.list.path);
      if (!res.ok) throw new Error("Failed to fetch subjects");
      return api.subjects.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.subjects.create.input>) => {
      const res = await fetch(api.subjects.create.path, {
        method: api.subjects.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create subject");
      return api.subjects.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.subjects.list.path] });
      toast({ title: "Success", description: "Subject added" });
    },
  });
}

// ============================================
// TIMETABLE
// ============================================
export function useTimetable(params?: z.infer<typeof api.timetable.list.input>) {
  return useQuery({
    queryKey: [api.timetable.list.path, params],
    queryFn: async () => {
      const url = buildUrl(api.timetable.list.path);
      const searchParams = new URLSearchParams();
      if (params?.day) searchParams.set("day", params.day);
      if (params?.staffId) searchParams.set("staffId", String(params.staffId));
      if (params?.section) searchParams.set("section", params.section);

      const res = await fetch(`${url}?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch timetable");
      return api.timetable.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateTimetableEntry() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.timetable.create.input>) => {
      const res = await fetch(api.timetable.create.path, {
        method: api.timetable.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create timetable entry");
      return api.timetable.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.timetable.list.path] });
      toast({ title: "Success", description: "Class assigned" });
    },
  });
}

// ============================================
// ATTENDANCE
// ============================================
export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: z.infer<typeof api.attendance.mark.input>) => {
      const res = await fetch(api.attendance.mark.path, {
        method: api.attendance.mark.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to mark attendance");
      return api.attendance.mark.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.report.path] });
      toast({ title: "Success", description: "Attendance recorded" });
    },
  });
}

export function useAttendanceReport(params?: z.infer<typeof api.attendance.report.input>) {
  return useQuery({
    queryKey: [api.attendance.report.path, params],
    queryFn: async () => {
      const url = buildUrl(api.attendance.report.path);
      const searchParams = new URLSearchParams();
      if (params?.studentId) searchParams.set("studentId", String(params.studentId));
      if (params?.subjectId) searchParams.set("subjectId", String(params.subjectId));

      const res = await fetch(`${url}?${searchParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch report");
      return api.attendance.report.responses[200].parse(await res.json());
    },
  });
}
