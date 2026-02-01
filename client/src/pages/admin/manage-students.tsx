import { Layout } from "@/components/layout";
import { useStudents, useCreateUser } from "@/hooks/use-resources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, GraduationCap } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ManageStudents() {
  const { data: students, isLoading } = useStudents();
  const createUser = useCreateUser();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
      name: "",
      department: "CSE",
      year: 1,
      section: "A",
    },
  });

  const onSubmit = (data: any) => {
    createUser.mutate(
      { ...data, role: "student" },
      { onSuccess: () => { setOpen(false); form.reset(); } }
    );
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Students</h1>
          <p className="text-muted-foreground">Add and manage student enrollments.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-student">
              <Plus className="mr-2 h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input {...form.register("name")} placeholder="John Doe" data-testid="input-student-name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input {...form.register("username")} placeholder="john123" data-testid="input-student-username" />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" {...form.register("password")} data-testid="input-student-password" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select onValueChange={(v) => form.setValue("department", v)} defaultValue="CSE">
                    <SelectTrigger data-testid="select-student-department">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CSE">CSE</SelectItem>
                      <SelectItem value="ECE">ECE</SelectItem>
                      <SelectItem value="MECH">MECH</SelectItem>
                      <SelectItem value="EEE">EEE</SelectItem>
                      <SelectItem value="CIVIL">CIVIL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Select onValueChange={(v) => form.setValue("year", parseInt(v))} defaultValue="1">
                    <SelectTrigger data-testid="select-student-year">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Year</SelectItem>
                      <SelectItem value="2">2nd Year</SelectItem>
                      <SelectItem value="3">3rd Year</SelectItem>
                      <SelectItem value="4">4th Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select onValueChange={(v) => form.setValue("section", v)} defaultValue="A">
                    <SelectTrigger data-testid="select-student-section">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createUser.isPending} data-testid="button-submit-student">
                {createUser.isPending ? "Adding..." : "Add Student"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            All Students ({students?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : students?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No students added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Year</TableHead>
                  <TableHead>Section</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students?.map((student: any) => (
                  <TableRow key={student.id} data-testid={`row-student-${student.id}`}>
                    <TableCell className="font-medium">{student.user?.name}</TableCell>
                    <TableCell>{student.user?.username}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{student.department}</Badge>
                    </TableCell>
                    <TableCell>{student.year}</TableCell>
                    <TableCell>{student.section}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </Layout>
  );
}
