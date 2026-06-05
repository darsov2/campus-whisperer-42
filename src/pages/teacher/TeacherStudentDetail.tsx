import { useMemo, useState } from "react";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, GraduationCap, AlertTriangle, Lock, Save, Search, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  getStudent, enrolledCourses, grades, violations, subjects,
  getSubject, getSemester, examSessions,
} from "@/data/teacher-portal-data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  suspended: "bg-destructive/15 text-destructive border-destructive/30",
  graduated: "bg-accent/15 text-accent border-accent/30",
  withdrawn: "bg-muted text-muted-foreground border-border",
  in_progress: "bg-info/15 text-info border-info/30",
  passed: "bg-success/15 text-success border-success/30",
  failed: "bg-destructive/15 text-destructive border-destructive/30",
};

const sevStyles: Record<string, string> = {
  low: "bg-info/15 text-info border-info/30",
  medium: "bg-warning/15 text-warning border-warning/30",
  high: "bg-destructive/15 text-destructive border-destructive/30",
};

type Tab = "courses" | "grades" | "violations";

export default function TeacherStudentDetail({ tab }: { tab: Tab }) {
  const { id, studentId } = useParams<{ id: string; studentId: string }>();
  const navigate = useNavigate();
  const student = studentId ? getStudent(studentId) : undefined;

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-muted-foreground">Student not found.</p>
        <Link to={`/teachers/${id}/lookup`} className="text-accent text-sm">Back to lookup</Link>
      </div>
    );
  }

  const tabs = [
    { key: "courses", label: "Enrolled Courses", icon: BookOpen },
    { key: "grades", label: "Grades", icon: GraduationCap },
    { key: "violations", label: "Disciplinary", icon: AlertTriangle },
  ] as const;

  const studentEnrollments = enrolledCourses.filter(e => e.studentId === student.id);
  const studentGrades = grades.filter(g => g.studentId === student.id);
  const studentViolations = violations.filter(v => v.studentId === student.id);

  return (
    <div className="space-y-5">
      <Link to={`/teachers/${id}/lookup`} className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3 w-3 mr-1" /> Back to search
      </Link>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="p-5 flex items-center gap-4">
          <div className="h-14 w-14 rounded-full bg-accent/10 text-accent flex items-center justify-center text-lg font-semibold">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-semibold">{student.firstName} {student.lastName}</p>
            <p className="text-xs text-muted-foreground font-mono">{student.index}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{student.programme} · Year {student.year} · {student.email}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="outline" className={cn("capitalize", statusStyles[student.status])}>{student.status}</Badge>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" onClick={() => navigate(`/teachers/${id}/email`)}>
                <Mail className="h-3.5 w-3.5 mr-1" /> Email
              </Button>
              <Button size="sm" variant="outline" onClick={() => navigate(`/teachers/${id}/lookup`)}>
                <Search className="h-3.5 w-3.5 mr-1" /> Search another
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border-b">
        <nav className="flex gap-1">
          {tabs.map((t) => (
            <NavLink
              key={t.key}
              to={`/teachers/${id}/lookup/${student.id}/${t.key}`}
              className={({ isActive }) =>
                cn(
                  "px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2",
                  isActive
                    ? "border-accent text-accent"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )
              }
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {t.key === "violations" && studentViolations.length > 0 && (
                <Badge variant="outline" className="h-5 ml-1 px-1.5 bg-destructive/10 text-destructive border-destructive/30">
                  {studentViolations.length}
                </Badge>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {tab === "courses" && <CoursesTab enrollments={studentEnrollments} />}
      {tab === "grades" && <GradesTab studentGrades={studentGrades} />}
      {tab === "violations" && <ViolationsTab list={studentViolations} />}
    </div>
  );
}

function CoursesTab({ enrollments }: { enrollments: typeof enrolledCourses }) {
  const bySem = new Map<string, typeof enrolledCourses>();
  enrollments.forEach(e => {
    const arr = bySem.get(e.semesterId) ?? [];
    arr.push(e);
    bySem.set(e.semesterId, arr);
  });

  if (enrollments.length === 0) {
    return <Card className="border-dashed"><CardContent className="py-12 text-center text-sm text-muted-foreground">No enrollments on record.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      {Array.from(bySem.entries()).map(([semId, rows]) => (
        <Card key={semId} className="border-0 shadow-[var(--shadow-card)]">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <p className="text-sm font-semibold">{getSemester(semId)?.label}</p>
              <Badge variant="outline">{rows.length} courses</Badge>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>ECTS</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((e, i) => {
                  const sub = getSubject(e.subjectId);
                  return (
                    <TableRow key={i}>
                      <TableCell>
                        <p className="font-medium">{sub?.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{sub?.code}</p>
                      </TableCell>
                      <TableCell>{sub?.ects}</TableCell>
                      <TableCell className="capitalize">{e.type}</TableCell>
                      <TableCell>{e.teacherName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={cn("capitalize", statusStyles[e.status])}>
                          {e.status.replace("_", " ")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function GradesTab({ studentGrades }: { studentGrades: typeof grades }) {
  // Teacher can edit only subjects they're assigned to (all of `subjects` in mock data).
  const editableSubjects = new Set(subjects.map(s => s.id));
  const [edits, setEdits] = useState<Record<string, { grade: string; date: string; note: string }>>({});

  const setField = (id: string, field: "grade" | "date" | "note", value: string) => {
    setEdits((e) => ({ ...e, [id]: { grade: "", date: "", note: "", ...e[id], [field]: value } }));
  };

  const save = () => {
    const n = Object.keys(edits).length;
    if (n === 0) return toast.info("No edits to save.");
    toast.success(`Saved ${n} grade change${n === 1 ? "" : "s"}.`);
    setEdits({});
  };

  if (studentGrades.length === 0) {
    return <Card className="border-dashed"><CardContent className="py-12 text-center text-sm text-muted-foreground">No grades on record.</CardContent></Card>;
  }

  return (
    <Card className="border-0 shadow-[var(--shadow-card)]">
      <CardContent className="p-0">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Editable rows are subjects you are assigned to as a teacher.
          </p>
          <Button size="sm" onClick={save}><Save className="h-3.5 w-3.5 mr-1" /> Save changes</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Semester</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>New grade</TableHead>
              <TableHead>Exam date</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentGrades.map((g) => {
              const sub = getSubject(g.subjectId);
              const editable = editableSubjects.has(g.subjectId);
              const ed = edits[g.id];
              return (
                <TableRow key={g.id} className={cn(!editable && "opacity-75")}>
                  <TableCell>
                    <p className="font-medium">{sub?.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{sub?.code}</p>
                  </TableCell>
                  <TableCell className="text-xs">{getSemester(g.semesterId)?.label}</TableCell>
                  <TableCell>
                    {g.grade ? (
                      <Badge variant="outline" className={g.grade >= 6 ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"}>
                        {g.grade}
                      </Badge>
                    ) : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <Input type="number" min={5} max={10} placeholder={g.grade?.toString() ?? "—"}
                        value={ed?.grade ?? ""} onChange={(e) => setField(g.id, "grade", e.target.value)}
                        className="h-8 w-20" />
                    ) : <Lock className="h-3 w-3 text-muted-foreground" />}
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <Input type="date" value={ed?.date ?? g.examDate ?? ""} onChange={(e) => setField(g.id, "date", e.target.value)} className="h-8 w-36" />
                    ) : <span className="text-xs text-muted-foreground">{g.examDate ?? "—"}</span>}
                  </TableCell>
                  <TableCell>
                    {editable ? (
                      <Input value={ed?.note ?? ""} onChange={(e) => setField(g.id, "note", e.target.value)} className="h-8" placeholder="Optional" />
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{!editable && <Lock className="h-3.5 w-3.5 text-muted-foreground" />}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function ViolationsTab({ list }: { list: typeof violations }) {
  const [open, setOpen] = useState<typeof violations[number] | null>(null);

  if (list.length === 0) {
    return <Card className="border-dashed"><CardContent className="py-12 text-center text-sm text-muted-foreground">No disciplinary violations on record.</CardContent></Card>;
  }

  return (
    <>
      <Card className="border-0 shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Severity</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Reported by</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((v) => (
              <TableRow key={v.id} className="cursor-pointer" onClick={() => setOpen(v)}>
                <TableCell className="text-xs">{v.date}</TableCell>
                <TableCell>{v.subjectId ? getSubject(v.subjectId)?.code : <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell className="capitalize">{v.type.replace("_", " ")}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("capitalize", sevStyles[v.severity])}>{v.severity}</Badge>
                </TableCell>
                <TableCell className="max-w-md truncate text-sm">{v.description}</TableCell>
                <TableCell className="text-xs">{v.reportedBy}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent className="sm:max-w-lg">
          {open && (
            <>
              <SheetHeader>
                <SheetTitle className="capitalize">{open.type.replace("_", " ")}</SheetTitle>
                <SheetDescription>{open.date} · reported by {open.reportedBy}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 mt-6 text-sm">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Severity</p>
                  <Badge variant="outline" className={cn("capitalize", sevStyles[open.severity])}>{open.severity}</Badge>
                </div>
                {open.subjectId && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Subject</p>
                    <p>{getSubject(open.subjectId)?.code} — {getSubject(open.subjectId)?.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Description</p>
                  <p>{open.description}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Decision</p>
                  <p>{open.decision}</p>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
