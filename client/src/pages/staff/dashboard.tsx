import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useTimetable, useStudents, useMarkAttendance } from "@/hooks/use-resources";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useLocation } from "wouter";
import { Clock, Users, ArrowRight } from "lucide-react";

export default function StaffDashboard() {
  const { user } = useAuth();
  const today = format(new Date(), "EEEE"); // "Monday", etc.
  
  // In a real app we'd get the staffId from the user relation
  // For demo, we assume the staff is linked correctly
  const { data: timetable } = useTimetable({ 
    day: today,
    staffId: user?.id // Ideally this should be staff.id, but using user.id for simplicity/demo
  });

  const [location, setLocation] = useLocation();

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name}. Here's your schedule for {today}.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold text-primary">{format(new Date(), "HH:mm")}</p>
          <p className="text-sm text-muted-foreground">{format(new Date(), "MMMM d, yyyy")}</p>
        </div>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-semibold">Today's Classes</h2>
        
        {timetable?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">No classes scheduled for today.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {timetable?.map((entry: any) => (
              <Card key={entry.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-base font-medium">
                      {entry.subject.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {entry.startTime} - {entry.endTime}
                    </p>
                  </div>
                  <Badge variant={entry.subject.isLab ? "secondary" : "outline"}>
                    {entry.subject.isLab ? "Lab" : "Theory"}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Users className="h-4 w-4" />
                    <span>Section {entry.section}</span>
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => setLocation(`/staff/attendance/${entry.id}`)}
                  >
                    Mark Attendance
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
