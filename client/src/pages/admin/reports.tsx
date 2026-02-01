import { Layout } from "@/components/layout";
import { useStudents, useSubjects } from "@/hooks/use-resources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Users, AlertTriangle, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function ReportsPage() {
  const { data: students } = useStudents();
  const { data: subjects } = useSubjects();
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);

  const { data: report } = useQuery({
    queryKey: [api.attendance.report.path, selectedStudent],
    queryFn: async () => {
      if (!selectedStudent) return [];
      const res = await fetch(`${api.attendance.report.path}?studentId=${selectedStudent}`);
      if (!res.ok) return [];
      return api.attendance.report.responses[200].parse(await res.json());
    },
    enabled: !!selectedStudent,
  });

  const lowAttendanceStudents = students?.filter((s: any) => {
    return false;
  }) || [];

  const chartData = report?.map((r: any) => ({
    name: r.subjectName.length > 10 ? r.subjectName.slice(0, 10) + "..." : r.subjectName,
    percentage: r.percentage,
    fill: r.percentage < 75 ? "#ef4444" : "#22c55e",
  })) || [];

  return (
    <Layout>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Attendance Reports</h1>
        <p className="text-muted-foreground">View attendance analytics and generate reports.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{students?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Subjects</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subjects?.length || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Good Standing</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{students?.length || 0}</div>
            <p className="text-xs text-green-600">75%+ attendance</p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Low Attendance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">0</div>
            <p className="text-xs text-red-600">Below 75%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance Report</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Select Student</Label>
              <Select onValueChange={setSelectedStudent}>
                <SelectTrigger data-testid="select-report-student">
                  <SelectValue placeholder="Choose a student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.user?.name} - {s.department} {s.year}{s.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedStudent && report && report.length > 0 ? (
              <div className="space-y-4 mt-4">
                {report.map((r: any) => (
                  <div key={r.subjectName} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{r.subjectName}</span>
                      <span className={r.percentage < 75 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                        {r.percentage}%
                      </span>
                    </div>
                    <Progress value={r.percentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {r.attendedClasses} / {r.totalClasses} classes attended
                    </p>
                  </div>
                ))}
              </div>
            ) : selectedStudent ? (
              <p className="text-center py-8 text-muted-foreground">No attendance records found.</p>
            ) : (
              <p className="text-center py-8 text-muted-foreground">Select a student to view their report.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Chart</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="percentage" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Select a student to view chart
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
