import { Layout } from "@/components/layout";
import { useTimetable, useStudents, useMarkAttendance } from "@/hooks/use-resources";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function MarkAttendancePage() {
  const [, params] = useRoute("/staff/attendance/:timetableId");
  const timetableId = params ? parseInt(params.timetableId) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Fetch timetable entry to get class details
  const { data: timetableEntries } = useTimetable();
  const entry = timetableEntries?.find((t: any) => t.id === timetableId);

  // Fetch students for this section
  const { data: students } = useStudents({ 
    section: entry?.section,
    // department: entry?.subject.department // Optional filtering
  });

  const markAttendanceMutation = useMarkAttendance();
  const [attendanceState, setAttendanceState] = useState<Record<number, boolean>>({});

  // Initialize all students as present by default when they load
  useEffect(() => {
    if (students) {
      const initial: Record<number, boolean> = {};
      students.forEach((s: any) => {
        initial[s.id] = true;
      });
      setAttendanceState(initial);
    }
  }, [students]);

  const handleSubmit = () => {
    if (!entry || !students) return;

    const records = Object.entries(attendanceState).map(([studentId, isPresent]) => ({
      studentId: parseInt(studentId),
      status: isPresent ? "present" as const : "absent" as const
    }));

    markAttendanceMutation.mutate({
      date: format(new Date(), "yyyy-MM-dd"),
      period: entry.period,
      subjectId: entry.subjectId,
      records
    }, {
      onSuccess: () => {
        setLocation("/staff/dashboard");
      }
    });
  };

  if (!entry) return <div>Loading class details...</div>;

  return (
    <Layout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/staff/dashboard")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Mark Attendance</h1>
          <p className="text-muted-foreground">
            {entry.subject.name} • Section {entry.section} • {format(new Date(), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg">Student List ({students?.length || 0})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              const allPresent: Record<number, boolean> = {};
              students?.forEach((s: any) => allPresent[s.id] = true);
              setAttendanceState(allPresent);
            }}>
              Mark All Present
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={markAttendanceMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {markAttendanceMutation.isPending ? "Saving..." : "Submit Attendance"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {students?.map((student: any) => (
              <div 
                key={student.id} 
                className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                  attendanceState[student.id] 
                    ? "bg-green-50/50 border-green-100" 
                    : "bg-red-50/50 border-red-100"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    attendanceState[student.id] ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {student.user.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{student.user.name}</p>
                    <p className="text-xs text-muted-foreground">{student.department} • {student.year} Year</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${attendanceState[student.id] ? "text-green-600" : "text-red-600"}`}>
                    {attendanceState[student.id] ? "Present" : "Absent"}
                  </span>
                  <Switch 
                    checked={attendanceState[student.id]}
                    onCheckedChange={(checked) => 
                      setAttendanceState(prev => ({ ...prev, [student.id]: checked }))
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}
