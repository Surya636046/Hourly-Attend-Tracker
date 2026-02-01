import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import LoginPage from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import ManageStaff from "@/pages/admin/manage-staff";
import StaffDashboard from "@/pages/staff/dashboard";
import MarkAttendancePage from "@/pages/staff/mark-attendance";
import StudentDashboard from "@/pages/student/dashboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/staff" component={ManageStaff} />
      {/* Add more admin routes here as needed (Students, Subjects, etc.) */}
      
      {/* Staff Routes */}
      <Route path="/staff/dashboard" component={StaffDashboard} />
      <Route path="/staff/attendance/:timetableId" component={MarkAttendancePage} />
      
      {/* Student Routes */}
      <Route path="/student/dashboard" component={StudentDashboard} />
      
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
