import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ClipboardEdit, BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { subjects, enrolledCourses, semesters, getSemester } from "@/data/teacher-portal-data";
import { cn } from "@/lib/utils";

export default function TeacherCourses() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [semesterId, setSemesterId] = useState<string>("all");

  const rows = useMemo(() => {
    return subjects
      .filter((s) => semesterId === "all" || s.semesterIds.includes(semesterId))
      .flatMap((s) => {
        const sems = semesterId === "all" ? s.semesterIds : [semesterId];
        return sems.map((semId) => ({
          subject: s,
          semesterId: semId,
          students: enrolledCourses.filter(
            (e) => e.subjectId === s.id && e.semesterId === semId,
          ).length,
        }));
      });
  }, [semesterId]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Subjects you are assigned to. Filter by semester to narrow the list.
        </p>
      </div>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Semester</p>
            <Select value={semesterId} onValueChange={setSemesterId}>
              <SelectTrigger className="w-[240px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All semesters</SelectItem>
                {semesters.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">
            {rows.length} course{rows.length === 1 ? "" : "s"}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead className="text-right">ECTS</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Students</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">
                  No courses for this semester.
                </TableCell>
              </TableRow>
            ) : rows.map((r, i) => (
              <TableRow key={`${r.subject.id}-${r.semesterId}-${i}`}>
                <TableCell className="font-mono text-xs">{r.subject.code}</TableCell>
                <TableCell className="font-medium">{r.subject.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {getSemester(r.semesterId)?.label}
                </TableCell>
                <TableCell className="text-right">{r.subject.ects}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn(
                    "capitalize",
                    r.subject.role === "coordinator" && "bg-accent/10 text-accent border-accent/30",
                  )}>{r.subject.role}</Badge>
                </TableCell>
                <TableCell className="text-right tabular-nums">{r.students}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button size="sm" variant="outline"
                      onClick={() => navigate(`/teachers/${id}/grades`)}>
                      <ClipboardEdit className="h-3.5 w-3.5 mr-1" /> Grades
                    </Button>
                    <Button size="sm" variant="ghost"
                      onClick={() => navigate(`/teachers/${id}/reports/enrolled`)}>
                      <BarChart3 className="h-3.5 w-3.5 mr-1" /> Report
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
