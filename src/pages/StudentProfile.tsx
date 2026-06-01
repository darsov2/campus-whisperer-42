import { useNavigate, useParams } from "react-router-dom";
import {
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  ClipboardList,
  Award,
  Bell,
  FileCheck,
  Download,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  CalendarClock,
  Wallet,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getStudentProfile, StudentStatus } from "@/data/students-data";

const statusStyles: Record<StudentStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  suspended: "bg-destructive/15 text-destructive border-destructive/30",
  graduated: "bg-accent/15 text-accent border-accent/30",
  withdrawn: "bg-muted text-muted-foreground border-border",
};

function Ring({ value, label, sub }: { value: number; label: string; sub: string }) {
  const r = 32;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-20 w-20">
        <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r={r} strokeWidth="6" className="stroke-white/15 fill-none" />
          <circle
            cx="40" cy="40" r={r}
            strokeWidth="6" strokeLinecap="round"
            className="stroke-accent fill-none transition-all duration-700"
            strokeDasharray={c} strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{value}%</span>
        </div>
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-wider opacity-70">{label}</p>
        <p className="text-sm font-medium">{sub}</p>
      </div>
    </div>
  );
}

const announcements = [
  { id: "1", title: "January exam schedule published", date: "May 28", tag: "Exams", tagClass: "bg-accent/15 text-accent" },
  { id: "2", title: "Tuition installment due June 15", date: "May 20", tag: "Finance", tagClass: "bg-warning/15 text-warning" },
  { id: "3", title: "Fall enrollment opens June 1", date: "May 15", tag: "Enrollment", tagClass: "bg-info/15 text-info" },
];

const upcoming = [
  { title: "Software Engineering — Final exam", when: "Jun 12 · 10:00", where: "Hall A201" },
  { title: "Database Systems — Lab submission", when: "Jun 8 · 23:59", where: "Online" },
  { title: "Tuition — Installment 2", when: "Jun 15", where: "Finance office" },
];

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const student = id ? getStudentProfile(id) : undefined;

  if (!student) return <p className="text-muted-foreground">Student not found.</p>;

  const ectsPct = Math.min(100, Math.round((student.totalEcts / student.targetEcts) * 100));
  const gradePct = Math.round((student.averageGrade / 10) * 100);

  const tiles = [
    { label: "Profile", icon: User, count: "View", to: `/students/${student.id}/profile` },
    { label: "Semesters", icon: Calendar, count: student.counts.semesters, to: `/students/${student.id}/semesters` },
    { label: "Courses", icon: BookOpen, count: student.counts.courses, to: `/students/${student.id}/courses` },
    { label: "Exams", icon: ClipboardList, count: student.counts.exams, to: `/students/${student.id}/exams` },
    { label: "Grades", icon: Award, count: student.counts.grades, to: `/students/${student.id}/grades` },
    { label: "Documents", icon: FileText, count: student.counts.documents, to: `/students/${student.id}/documents` },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(222_47%_14%)] via-[hsl(222_47%_20%)] to-[hsl(222_47%_28%)] text-primary-foreground shadow-[var(--shadow-lg)]">
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 80% 60%, white 1px, transparent 1px)",
          backgroundSize: "40px 40px, 60px 60px"
        }} />
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />

        <div className="relative p-6 md:p-8 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="flex items-center gap-2 text-xs text-white/60 uppercase tracking-[0.18em]">
              <Sparkles className="h-3 w-3 text-accent" />
              {student.academicYear} · {student.faculty}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mt-3 tracking-tight">
              Welcome back, {student.firstName}.
            </h1>
            <p className="text-white/70 mt-2 max-w-xl">
              {student.programme} · Year {Math.ceil(student.currentSemester / 2)} · Semester {student.currentSemester}.
              You've completed <span className="text-accent font-medium">{student.totalEcts} of {student.targetEcts} ECTS</span>.
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-5">
              <Badge variant="outline" className={cn("capitalize border", statusStyles[student.status])}>{student.status}</Badge>
              <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5"><span className="font-mono">{student.studentId}</span></Badge>
              <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5">{student.studyMode}</Badge>
              <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5">Expected graduation · {student.expectedGraduation}</Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 lg:gap-10">
            <Ring value={ectsPct} label="ECTS progress" sub={`${student.totalEcts} / ${student.targetEcts}`} />
            <Ring value={gradePct} label="Average grade" sub={student.averageGrade.toFixed(2)} />
          </div>
        </div>
      </div>

      {/* Quick tiles -> separate pages */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tiles.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => navigate(c.to)}
              className="group text-left rounded-xl border bg-card p-4 hover:border-accent/50 hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-2xl font-bold mt-3">{c.count}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </button>
          );
        })}
      </div>

      {/* Dashboard widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-accent" />Announcements</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs">View all</Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded", a.tagClass)}>{a.tag}</span>
                    <span className="text-[11px] text-muted-foreground">{a.date}</span>
                  </div>
                  <p className="text-sm font-medium">{a.title}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-4 w-4 text-accent" />Upcoming</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcoming.map((u, i) => (
              <div key={i} className="flex gap-3 pb-3 last:pb-0 last:border-0 border-b">
                <div className="h-9 w-9 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <CalendarClock className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{u.title}</p>
                  <p className="text-xs text-muted-foreground">{u.when} · {u.where}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" />Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Average grade</span><span className="font-semibold">{student.averageGrade.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">ECTS this year</span><span className="font-semibold">52</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Passed exams</span><span className="font-semibold">{student.counts.exams}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Standing</span><span className="font-semibold text-success">Good</span></div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/students/${student.id}/semesters`)}>
              <Calendar className="h-4 w-4 mr-2" />Go to semesters
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/students/${student.id}/exams`)}>
              <ClipboardList className="h-4 w-4 mr-2" />Apply for exam
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/students/${student.id}/documents`)}>
              <Download className="h-4 w-4 mr-2" />Request transcript
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)] bg-gradient-to-br from-accent/10 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" />Tip</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-foreground/80">
            Stay on track for graduation — you need <span className="font-semibold text-foreground">{student.targetEcts - student.totalEcts} ECTS</span> more.
            Enroll in fall semester courses when registration opens on June 1.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
