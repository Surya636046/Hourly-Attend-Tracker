import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useAuth } from "@/hooks/use-auth";

import LoginPage from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import ManageStaff from "@/pages/admin/manage-staff";
import ManageStudents from "@/pages/admin/manage-students";
import ManageSubjects from "@/pages/admin/manage-subjects";
import TimetablePage from "@/pages/admin/timetable";
import ReportsPage from "@/pages/admin/reports";
import StaffDashboard from "@/pages/staff/dashboard";
import MarkAttendancePage from "@/pages/staff/mark-attendance";
import StudentDashboard from "@/pages/student/dashboard";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType; allowedRoles: string[] }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    setLocation("/login");
    return null;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === "admin") setLocation("/admin/dashboard");
    else if (user.role === "staff") setLocation("/staff/dashboard");
    else if (user.role === "student") setLocation("/student/dashboard");
    return null;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/staff">
        {() => <ProtectedRoute component={ManageStaff} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/students">
        {() => <ProtectedRoute component={ManageStudents} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/subjects">
        {() => <ProtectedRoute component={ManageSubjects} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/timetable">
        {() => <ProtectedRoute component={TimetablePage} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/reports">
        {() => <ProtectedRoute component={ReportsPage} allowedRoles={["admin"]} />}
      </Route>
      
      {/* Staff Routes */}
      <Route path="/staff/dashboard">
        {() => <ProtectedRoute component={StaffDashboard} allowedRoles={["staff"]} />}
      </Route>
      <Route path="/staff/attendance/:timetableId">
        {() => <ProtectedRoute component={MarkAttendancePage} allowedRoles={["staff"]} />}
      </Route>
      
      {/* Student Routes */}
      <Route path="/student/dashboard">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
