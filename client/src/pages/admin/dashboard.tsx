import { Layout } from "@/components/layout";
import { StatsCard } from "@/components/stats-card";
import { useStaff, useStudents, useSubjects } from "@/hooks/use-resources";
import { Users, GraduationCap, BookOpen, Clock } from "lucide-react";

export default function AdminDashboard() {
  const { data: staff } = useStaff();
  const { data: students } = useStudents();
  const { data: subjects } = useSubjects();

  return (
    <Layout>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of university metrics and quick actions.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Students" 
          value={students?.length || 0} 
          icon={GraduationCap}
          description="Active enrollments"
        />
        <StatsCard 
          title="Total Staff" 
          value={staff?.length || 0} 
          icon={Users}
          description="Faculty members"
        />
        <StatsCard 
          title="Subjects" 
          value={subjects?.length || 0} 
          icon={BookOpen}
          description="Across all departments"
        />
        <StatsCard 
          title="Avg Attendance" 
          value="87%" 
          icon={Clock}
          description="Last 30 days"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-display font-semibold text-lg mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors border border-primary/10">
              <p className="font-medium text-primary">Add Student</p>
              <p className="text-xs text-muted-foreground mt-1">Register new enrollment</p>
            </div>
            <div className="p-4 rounded-lg bg-accent/5 hover:bg-accent/10 cursor-pointer transition-colors border border-accent/10">
              <p className="font-medium text-accent">Create Timetable</p>
              <p className="text-xs text-muted-foreground mt-1">Assign classes</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-display font-semibold text-lg mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Database Status</span>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">Operational</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Backup</span>
              <span className="text-sm font-medium">2 hours ago</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Sessions</span>
              <span className="text-sm font-medium">24</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
