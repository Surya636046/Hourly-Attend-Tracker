import { Layout } from "@/components/layout";
import { useTimetable, useCreateTimetableEntry, useSubjects, useStaff } from "@/hooks/use-resources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, CalendarDays, Clock } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [
  { period: 1, time: "9:00 - 10:00" },
  { period: 2, time: "10:00 - 11:00" },
  { period: 3, time: "11:00 - 12:00" },
  { period: 4, time: "12:00 - 1:00" },
  { period: 5, time: "2:00 - 3:00" },
  { period: 6, time: "3:00 - 4:00" },
  { period: 7, time: "4:00 - 5:00" },
];

export default function TimetablePage() {
  const [selectedDay, setSelectedDay] = useState("Monday");
  const { data: timetable, isLoading } = useTimetable({ day: selectedDay });
  const { data: subjects } = useSubjects();
  const { data: staffList } = useStaff();
  const createEntry = useCreateTimetableEntry();
  const [open, setOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      day: "Monday",
      period: 1,
      subjectId: "",
      staffId: "",
      section: "A",
      startTime: "09:00",
      endTime: "10:00",
    },
  });

  const onSubmit = (data: any) => {
    createEntry.mutate(
      {
        ...data,
        subjectId: parseInt(data.subjectId),
        staffId: parseInt(data.staffId),
        period: parseInt(data.period),
      },
      { onSuccess: () => { setOpen(false); form.reset(); } }
    );
  };

  const getEntryForPeriod = (period: number) => {
    return timetable?.find((entry: any) => entry.period === period);
  };

  return (
    <Layout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Timetable Management</h1>
          <p className="text-muted-foreground">Configure class schedules and assign staff.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-class">
              <Plus className="mr-2 h-4 w-4" />
              Assign Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Assign Class to Period</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Day</Label>
                  <Select onValueChange={(v) => form.setValue("day", v)} defaultValue="Monday">
                    <SelectTrigger data-testid="select-day">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select onValueChange={(v) => form.setValue("period", parseInt(v))} defaultValue="1">
                    <SelectTrigger data-testid="select-period">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map(p => (
                        <SelectItem key={p.period} value={String(p.period)}>
                          Period {p.period} ({p.time})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select onValueChange={(v) => form.setValue("subjectId", v)}>
                  <SelectTrigger data-testid="select-subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects?.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name} ({s.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Staff</Label>
                <Select onValueChange={(v) => form.setValue("staffId", v)}>
                  <SelectTrigger data-testid="select-staff">
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {staffList?.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.user?.name} ({s.department})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Section</Label>
                  <Select onValueChange={(v) => form.setValue("section", v)} defaultValue="A">
                    <SelectTrigger data-testid="select-section">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input type="time" {...form.register("startTime")} data-testid="input-start-time" />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input type="time" {...form.register("endTime")} data-testid="input-end-time" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createEntry.isPending} data-testid="button-submit-class">
                {createEntry.isPending ? "Assigning..." : "Assign Class"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDay} onValueChange={setSelectedDay}>
            <TabsList className="grid grid-cols-6 mb-6">
              {DAYS.map(day => (
                <TabsTrigger key={day} value={day} data-testid={`tab-${day.toLowerCase()}`}>
                  {day.slice(0, 3)}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value={selectedDay}>
              <div className="grid gap-3">
                {PERIODS.map(({ period, time }) => {
                  const entry = getEntryForPeriod(period);
                  return (
                    <div
                      key={period}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        entry ? "bg-primary/5 border-primary/20" : "bg-muted/30 border-dashed"
                      }`}
                      data-testid={`period-${period}`}
                    >
                      <div className="flex items-center gap-2 w-32 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {time}
                      </div>
                      <div className="flex-1">
                        {entry ? (
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{entry.subject?.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {entry.staff?.user?.name} - Section {entry.section}
                              </p>
                            </div>
                            <Badge variant={entry.subject?.isLab ? "secondary" : "outline"}>
                              {entry.subject?.isLab ? "Lab" : "Theory"}
                            </Badge>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No class assigned</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </Layout>
  );
}
