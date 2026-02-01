import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useAttendanceReport } from "@/hooks/use-resources"; // Note: Assuming useAttendanceReport is properly exported
import { useQuery } from "@tanstack/react-query"; // Fallback if hook not exported
import { api } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth(); // We need current user to get student ID
  
  // In real app, /api/user would return student details too, or we fetch student profile
  // For now assuming we can fetch report without ID (backend infers from session)
  const { data: report } = useQuery({
    queryKey: [api.attendance.report.path],
    queryFn: async () => {
      const res = await fetch(api.attendance.report.path);
      if (!res.ok) throw new Error("Failed");
      return api.attendance.report.responses[200].parse(await res.json());
    }
  });

  const overallPercentage = report 
    ? Math.round(report.reduce((acc: number, curr: any) => acc + curr.percentage, 0) / report.length) 
    : 0;

  return (
    <Layout>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">My Attendance</h1>
        <p className="text-muted-foreground">Track your academic progress and attendance records.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Subject Wise Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {report?.map((subject: any) => (
              <div key={subject.subjectName} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{subject.subjectName}</span>
                  <span className={subject.percentage < 75 ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
                    {subject.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={subject.percentage} 
                  className="h-2" 
                  indicatorClassName={subject.percentage < 75 ? "bg-red-500" : "bg-green-500"}
                />
                <p className="text-xs text-muted-foreground">
                  Attended {subject.attendedClasses} / {subject.totalClasses} classes
                </p>
              </div>
            ))}
            
            {(!report || report.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No attendance records found.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className={overallPercentage < 75 ? "bg-red-50 border-red-100" : "bg-green-50 border-green-100"}>
            <CardHeader>
              <CardTitle>Overall Attendance</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-6">
              <div className="relative flex items-center justify-center h-32 w-32 rounded-full border-8 border-white shadow-sm mb-4">
                 <span className={`text-3xl font-bold ${overallPercentage < 75 ? "text-red-600" : "text-green-600"}`}>
                   {overallPercentage}%
                 </span>
              </div>
              <p className="text-center text-sm font-medium">
                {overallPercentage < 75 ? "Warning: Low Attendance" : "Good Standing"}
              </p>
            </CardContent>
          </Card>

          {overallPercentage < 75 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Action Required</AlertTitle>
              <AlertDescription>
                Your overall attendance is below 75%. Please contact your class advisor.
              </AlertDescription>
            </Alert>
          )}

          {overallPercentage >= 75 && (
            <Alert className="border-green-200 bg-green-50 text-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>Keep it up!</AlertTitle>
              <AlertDescription>
                You are maintaining good attendance across your subjects.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </Layout>
  );
}
