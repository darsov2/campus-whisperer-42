import { useMemo, useState } from "react";
import { Award, FileText, Search, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  existingApplications, getCourse, getProfessor, examSessions,
} from "@/data/student-exams-data";
import { cn } from "@/lib/utils";

const gradeBadge = (grade: number) =>
  grade >= 6
    ? "bg-success/10 text-success border-success/30"
    : "bg-destructive/10 text-destructive border-destructive/30";

export default function StudentGrades() {
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [paperFilter, setPaperFilter] = useState("all");

  const passed = useMemo(
    () =>
      existingApplications
        .filter((a) => a.status === "graded" && a.grade !== undefined && a.grade >= 6)
        .map((a) => ({
          app: a,
          course: getCourse(a.courseId),
          session: examSessions.find((s) => s.id === a.sessionId),
        }))
        .filter((r) => r.course),
    []
  );

  const semesters = useMemo(
    () => Array.from(new Set(passed.map((r) => r.course!.semester))).sort((a, b) => a - b),
    [passed]
  );
  const usedSessions = useMemo(
    () => examSessions.filter((s) => passed.some((r) => r.app.sessionId === s.id)),
    [passed]
  );

  const filtered = useMemo(() => {
    return passed.filter(({ app, course, session }) => {
      if (
        search &&
        !`${course!.name} ${course!.code}`.toLowerCase().includes(search.toLowerCase())
      )
        return false;
      if (semesterFilter !== "all" && course!.semester !== Number(semesterFilter)) return false;
      if (sessionFilter !== "all" && app.sessionId !== sessionFilter) return false;
      if (typeFilter !== "all" && course!.courseType !== typeFilter) return false;
      if (paperFilter === "yes" && !app.paperApplication) return false;
      if (paperFilter === "no" && app.paperApplication) return false;
      return true;
    });
  }, [passed, search, semesterFilter, sessionFilter, typeFilter, paperFilter]);

  const totalEcts = passed.reduce((s, r) => s + r.course!.ects, 0);
  const avgGrade =
    passed.length > 0
      ? (passed.reduce((s, r) => s + (r.app.grade ?? 0), 0) / passed.length).toFixed(2)
      : "—";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Grades</h1>
        <p className="text-sm text-muted-foreground mt-1">
          All passed exams with session details, ECTS, and application records.
        </p>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Passed exams</p>
              <p className="text-lg font-semibold">{passed.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">ECTS acquired</p>
              <p className="text-lg font-semibold">{totalEcts}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-info/10 text-info flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Average grade</p>
              <p className="text-lg font-semibold">{avgGrade}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-56">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by course name or code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={semesterFilter} onValueChange={setSemesterFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Semester" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All semesters</SelectItem>
            {semesters.map((s) => (
              <SelectItem key={s} value={String(s)}>Semester {s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={sessionFilter} onValueChange={setSessionFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Session" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sessions</SelectItem>
            {usedSessions.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="mandatory">Mandatory</SelectItem>
            <SelectItem value="elective">Elective</SelectItem>
          </SelectContent>
        </Select>
        <Select value={paperFilter} onValueChange={setPaperFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Paper form" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Paper form: all</SelectItem>
            <SelectItem value="yes">Paper form submitted</SelectItem>
            <SelectItem value="no">Paper form missing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Exam date</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>ECTS</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Professor</TableHead>
                <TableHead>Paper form</TableHead>
                <TableHead className="text-right">Grade</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                    No passed exams match the current filters.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map(({ app, course, session }) => {
                const prof = getProfessor(course!, app.professorId);
                return (
                  <TableRow key={app.id}>
                    <TableCell>
                      <p className="font-medium">{course!.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{course!.code}</p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{session?.label}</p>
                      <p className="text-xs text-muted-foreground">{session?.academicYear}</p>
                    </TableCell>
                    <TableCell className="text-sm">{app.examDate ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Sem {course!.semester}</Badge>
                    </TableCell>
                    <TableCell>{course!.ects}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          "capitalize",
                          course!.courseType === "mandatory"
                            ? "bg-info/10 text-info border-info/30"
                            : "bg-warning/10 text-warning border-warning/30"
                        )}
                      >
                        {course!.courseType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{prof?.name ?? "—"}</TableCell>
                    <TableCell>
                      {app.paperApplication ? (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                          <FileText className="h-3 w-3 mr-1" /> Submitted
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                          <XCircle className="h-3 w-3 mr-1" /> Missing
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className={gradeBadge(app.grade!)}>
                        {app.grade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
