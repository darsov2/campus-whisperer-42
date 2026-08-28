import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Lock,
  MapPin,
  Repeat2,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getStudentProfile } from "@/data/students-data";
import { formatEUR } from "@/data/quotas-data";
import {
  ExamApplication,
  ExamCourse,
  examCourses,
  examFees,
  examSessions,
  existingApplications,
  getCourse,
} from "@/data/student-exams-data";

/* -------------------------------- status badge ------------------------------- */

type Tone = "muted" | "accent" | "warning" | "danger" | "success";

const toneStyles: Record<Tone, string> = {
  muted: "bg-muted text-muted-foreground border-border",
  accent: "bg-accent/15 text-accent border-accent/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  success: "bg-success/15 text-success border-success/30",
};

function StatusBadge({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium", toneStyles[tone], className)}>
      {children}
    </Badge>
  );
}

/* --------------------------------- fee panel --------------------------------- */

function FeeSummary({
  count,
  late,
  compact,
}: {
  count: number;
  late: boolean;
  compact?: boolean;
}) {
  const application = count * examFees.applicationFeePerExam;
  const lateTotal = late ? count * examFees.lateFeePerExam : 0;
  const total = count > 0 ? application + lateTotal + examFees.administrativeFee : 0;

  return (
    <div className={cn("rounded-lg border bg-muted/30 p-4 space-y-3", compact && "p-3")}>
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Payment summary
        </p>
        {late && <StatusBadge tone="warning">Late application</StatusBadge>}
      </div>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Application fee ({count} × {formatEUR(examFees.applicationFeePerExam)})
          </span>
          <span className="font-medium">{formatEUR(application)}</span>
        </div>
        {late && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">
              Late fee ({count} × {formatEUR(examFees.lateFeePerExam)})
            </span>
            <span className="font-medium text-warning">{formatEUR(lateTotal)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Administrative fee</span>
          <span className="font-medium">
            {formatEUR(count > 0 ? examFees.administrativeFee : 0)}
          </span>
        </div>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        <span className="font-medium">Total</span>
        <span className="text-lg font-semibold">{formatEUR(total)}</span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Fee values are placeholders and will be linked to the faculty and university configuration.
      </p>
    </div>
  );
}

/* -------------------------------- course card -------------------------------- */

function CourseRow({
  course,
  sessionId,
  applied,
  professorId,
  alreadySubmitted,
  onProfessorChange,
  onToggle,
}: {
  course: ExamCourse;
  sessionId: string;
  applied: boolean;
  professorId: string;
  alreadySubmitted: boolean;
  onProfessorChange: (professorId: string) => void;
  onToggle: () => void;
}) {
  const blocked = !course.signatureObtained;
  const schedule = course.schedule[sessionId];

  return (
    <Card
      className={cn(
        "transition-colors",
        applied && "border-accent/50 bg-accent/[0.03]",
        blocked && "opacity-70"
      )}
    >
      <CardContent className="p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-medium">{course.name}</p>
              <span className="font-mono text-[11px] text-muted-foreground">{course.code}</span>
              {applied && <StatusBadge tone="accent">Applied</StatusBadge>}
              {alreadySubmitted && <StatusBadge tone="muted">Submitted</StatusBadge>}
              {blocked && <StatusBadge tone="danger">Signature missing</StatusBadge>}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>{course.ects} ECTS</span>
              <span>Semester {course.semester}</span>
              {course.signatureObtained ? (
                <span className="flex items-center gap-1 text-success">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Signature obtained
                </span>
              ) : (
                <span className="flex items-center gap-1 text-destructive">
                  <X className="h-3.5 w-3.5" /> Signature not obtained
                </span>
              )}
              {course.attempts > 0 && (
                <span className="flex items-center gap-1">
                  <Repeat2 className="h-3.5 w-3.5" />
                  {course.attempts} previous {course.attempts === 1 ? "attempt" : "attempts"}
                </span>
              )}
            </div>
          </div>

          <Button
            size="sm"
            variant={applied ? "outline" : "default"}
            disabled={blocked || alreadySubmitted}
            onClick={onToggle}
            className="shrink-0"
          >
            {blocked ? (
              <>
                <Lock className="h-3.5 w-3.5" /> Not available
              </>
            ) : applied ? (
              <>
                <X className="h-3.5 w-3.5" /> Remove
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> Apply
              </>
            )}
          </Button>
        </div>

        {!blocked && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Professor
              </label>
              <Select
                value={professorId}
                onValueChange={onProfessorChange}
                disabled={alreadySubmitted}
              >
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {course.professors.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex flex-col text-left">
                        <span>{p.name}</span>
                        <span className="text-[11px] text-muted-foreground">{p.title}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Exam term
              </p>
              <div className="flex h-9 items-center gap-4 rounded-md border bg-muted/30 px-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" /> {schedule?.date ?? "TBD"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {schedule?.time ?? "—"}
                </span>
                <span className="flex items-center gap-1.5 truncate">
                  <MapPin className="h-3.5 w-3.5 shrink-0" /> {schedule?.hall ?? "—"}
                </span>
              </div>
            </div>
          </div>
        )}

        {blocked && (
          <p className="mt-3 flex items-start gap-2 rounded-md bg-destructive/5 p-2.5 text-xs text-destructive">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            You cannot apply for this exam until the professor confirms your signature for the
            course.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

/* ----------------------------------- page ----------------------------------- */

type Filter = "all" | "eligible" | "applied";

export default function StudentExams() {
  const { id } = useParams<{ id: string }>();
  const student = id ? getStudentProfile(id) : undefined;

  const [sessionId, setSessionId] = useState(examSessions[0].id);
  const [applications, setApplications] = useState<ExamApplication[]>(existingApplications);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [professors, setProfessors] = useState<Record<string, string>>(() =>
    Object.fromEntries(examCourses.map((c) => [c.id, c.defaultProfessorId]))
  );
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(true);

  const session = examSessions.find((s) => s.id === sessionId)!;
  const isLate = !session.isCurrent;

  const submittedCourseIds = useMemo(
    () =>
      new Set(
        applications
          .filter((a) => a.sessionId === sessionId && a.status !== "withdrawn")
          .map((a) => a.courseId)
      ),
    [applications, sessionId]
  );

  const selectedIds = Object.keys(selected).filter((cid) => selected[cid] === sessionId);

  const visibleCourses = examCourses.filter((c) => {
    const q = query.trim().toLowerCase();
    if (q && !c.name.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false;
    if (filter === "eligible") return c.signatureObtained && !submittedCourseIds.has(c.id);
    if (filter === "applied") return selectedIds.includes(c.id);
    return true;
  });

  const sessionHistory = applications.filter((a) => a.sessionId === sessionId);

  const toggle = (courseId: string) =>
    setSelected((prev) => {
      const next = { ...prev };
      if (next[courseId] === sessionId) delete next[courseId];
      else next[courseId] = sessionId;
      return next;
    });

  const submit = () => {
    const created: ExamApplication[] = selectedIds.map((cid) => ({
      id: `app-${cid}-${sessionId}`,
      sessionId,
      courseId: cid,
      professorId: professors[cid],
      status: "submitted",
      submittedOn: "today",
    }));
    setApplications((prev) => [...created, ...prev]);
    setSelected((prev) => {
      const next = { ...prev };
      selectedIds.forEach((cid) => delete next[cid]);
      return next;
    });
    setConfirmOpen(false);
    toast({
      title: "Exam applications submitted",
      description: `${created.length} exam${created.length === 1 ? "" : "s"} applied for ${session.label}.`,
    });
  };

  const withdraw = (appId: string) =>
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: "withdrawn" as const } : a))
    );

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
            <ClipboardList className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Exam Applications</h1>
            <p className="text-sm text-muted-foreground">
              {student ? `${student.firstName} ${student.lastName} · ` : ""}
              Apply for exams in the open session, or for a previous session with a late fee.
            </p>
          </div>
        </div>

        {/* session switcher */}
        <div className="mt-4 flex flex-wrap gap-2">
          {examSessions.map((s) => {
            const active = s.id === sessionId;
            return (
              <button
                key={s.id}
                onClick={() => setSessionId(s.id)}
                className={cn(
                  "rounded-lg border px-3.5 py-2 text-left transition-colors",
                  active
                    ? "border-accent/50 bg-accent/10"
                    : "bg-card hover:bg-muted/60"
                )}
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  {s.label}
                  {s.isCurrent ? (
                    <StatusBadge tone="success">Open</StatusBadge>
                  ) : (
                    <StatusBadge tone="warning">
                      Late · {formatEUR(examFees.lateFeePerExam)}/exam
                    </StatusBadge>
                  )}
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">
                  {s.period} · {s.isCurrent ? `apply until ${s.deadline}` : s.deadline}
                </span>
              </button>
            );
          })}
        </div>

        {isLate && (
          <p className="mt-3 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-xs text-warning">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            This session is closed for regular applications. You may still apply, but a late
            application fee of {formatEUR(examFees.lateFeePerExam)} is charged for each exam.
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* left: courses */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-9 pl-9"
              />
            </div>
            <div className="flex gap-1 rounded-md border bg-card p-1">
              {(["all", "eligible", "applied"] as Filter[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs capitalize transition-colors",
                    filter === f ? "bg-accent/15 text-accent" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {visibleCourses.length === 0 && (
            <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
              No courses match your filters.
            </p>
          )}

          {visibleCourses.map((c) => (
            <CourseRow
              key={c.id}
              course={c}
              sessionId={sessionId}
              applied={selected[c.id] === sessionId}
              alreadySubmitted={submittedCourseIds.has(c.id)}
              professorId={professors[c.id]}
              onProfessorChange={(pid) => setProfessors((p) => ({ ...p, [c.id]: pid }))}
              onToggle={() => toggle(c.id)}
            />
          ))}

          {/* history */}
          <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
            <Card>
              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left">
                <span className="text-sm font-medium">
                  Applications in {session.label}
                  <span className="ml-2 text-xs text-muted-foreground">
                    {sessionHistory.length} record{sessionHistory.length === 1 ? "" : "s"}
                  </span>
                </span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    historyOpen && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="divide-y border-t">
                  {sessionHistory.length === 0 && (
                    <p className="p-4 text-sm text-muted-foreground">
                      No applications submitted for this session yet.
                    </p>
                  )}
                  {sessionHistory.map((a) => {
                    const course = getCourse(a.courseId);
                    const professor = course?.professors.find((p) => p.id === a.professorId);
                    return (
                      <div
                        key={a.id}
                        className="flex flex-wrap items-center justify-between gap-3 p-4"
                      >
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">{course?.name}</p>
                            {a.status === "submitted" && (
                              <StatusBadge tone="muted">Submitted</StatusBadge>
                            )}
                            {a.status === "withdrawn" && (
                              <StatusBadge tone="danger">Withdrawn</StatusBadge>
                            )}
                            {a.status === "graded" && (
                              <StatusBadge tone="success">Graded · {a.grade}</StatusBadge>
                            )}
                          </div>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {professor?.name} · {course?.schedule[a.sessionId]?.date} · applied{" "}
                            {a.submittedOn}
                          </p>
                        </div>
                        {a.status === "submitted" && session.isCurrent && (
                          <Button variant="ghost" size="sm" onClick={() => withdraw(a.id)}>
                            Withdraw
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </div>

        {/* right: review */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <Card>
            <CardContent className="space-y-4 p-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Review
                </p>
                <p className="mt-1 text-sm font-medium">{session.label}</p>
                <p className="text-xs text-muted-foreground">
                  {selectedIds.length} exam{selectedIds.length === 1 ? "" : "s"} selected
                </p>
              </div>

              <div className="rounded-lg border divide-y">
                {selectedIds.length === 0 && (
                  <p className="p-3 text-xs text-muted-foreground">
                    Select the exams you want to apply for.
                  </p>
                )}
                {selectedIds.map((cid) => {
                  const course = getCourse(cid)!;
                  const professor = course.professors.find((p) => p.id === professors[cid]);
                  return (
                    <div key={cid} className="flex items-start justify-between gap-2 p-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{course.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {professor?.name} · {course.schedule[sessionId]?.date}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => toggle(cid)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>

              <FeeSummary count={selectedIds.length} late={isLate} />

              <Button
                className="w-full"
                disabled={selectedIds.length === 0}
                onClick={() => setConfirmOpen(true)}
              >
                Submit applications
              </Button>
              {selectedIds.length === 0 && (
                <p className="text-center text-[11px] text-muted-foreground">
                  Add at least one exam to continue.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm exam applications</DialogTitle>
            <DialogDescription>
              {session.label}
              {isLate ? " — late application, fees apply per exam." : " — open session."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="divide-y rounded-lg border">
              {selectedIds.map((cid) => {
                const course = getCourse(cid)!;
                const professor = course.professors.find((p) => p.id === professors[cid]);
                return (
                  <div key={cid} className="p-3">
                    <p className="text-sm font-medium">{course.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {professor?.name} · {course.schedule[sessionId]?.date}{" "}
                      {course.schedule[sessionId]?.time} · {course.schedule[sessionId]?.hall}
                    </p>
                  </div>
                );
              })}
            </div>
            <FeeSummary count={selectedIds.length} late={isLate} compact />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submit}>Confirm and submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
