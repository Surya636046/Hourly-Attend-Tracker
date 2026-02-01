import { Layout } from "@/components/layout";
import { useSubjects, useCreateSubject } from "@/hooks/use-resources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function ManageSubjects() {
  const { data: subjects, isLoading } = useSubjects();
  const createSubject = useCreateSubject();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      code: "",
      department: "CSE",
      isLab: false,
    },
  });

  const onSubmit = (data: any) => {
    createSubject.mutate(data, {
      onSuccess: () => { setOpen(false); form.reset(); }
    });
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Subjects</h1>
          <p className="text-muted-foreground">Add and configure course subjects.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-subject">
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Name</Label>
                <Input {...form.register("name")} placeholder="Data Structures" data-testid="input-subject-name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Subject Code</Label>
                  <Input {...form.register("code")} placeholder="CS201" data-testid="input-subject-code" />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select onValueChange={(v) => form.setValue("department", v)} defaultValue="CSE">
                    <SelectTrigger data-testid="select-subject-department">
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
              </div>
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label>Lab Subject</Label>
                  <p className="text-xs text-muted-foreground">Enable if this is a lab/practical subject</p>
                </div>
                <Switch
                  checked={form.watch("isLab")}
                  onCheckedChange={(v) => form.setValue("isLab", v)}
                  data-testid="switch-is-lab"
                />
              </div>
              <Button type="submit" className="w-full" disabled={createSubject.isPending} data-testid="button-submit-subject">
                {createSubject.isPending ? "Adding..." : "Add Subject"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            All Subjects ({subjects?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8 text-muted-foreground">Loading...</p>
          ) : subjects?.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No subjects added yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects?.map((subject: any) => (
                  <TableRow key={subject.id} data-testid={`row-subject-${subject.id}`}>
                    <TableCell className="font-medium">{subject.name}</TableCell>
                    <TableCell>{subject.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{subject.department}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={subject.isLab ? "secondary" : "default"}>
                        {subject.isLab ? "Lab" : "Theory"}
                      </Badge>
                    </TableCell>
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
