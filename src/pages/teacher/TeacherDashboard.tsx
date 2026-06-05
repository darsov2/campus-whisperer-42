import { useNavigate, useParams } from "react-router-dom";
import {
  Users, BookOpen, ClipboardEdit, PenLine, BarChart3, Mail, CalendarRange,
  Sparkles, ChevronRight, TrendingUp, AlertTriangle, CalendarClock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  teacherProfile, subjects, students, examSessions, enrolledCourses, examApplications,
} from "@/data/teacher-portal-data";

export default function TeacherDashboard() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = teacherProfile;

  const myStudents = new Set(enrolledCourses.filter(e => subjects.some(s => s.id === e.subjectId)).map(e => e.studentId)).size;
  const pendingGrades = enrolledCourses.filter(e => e.status === "in_progress").length;
  const upcomingSessions = examSessions.slice(0, 2);

  const tiles = [
    { label: "My Courses",      icon: BookOpen,     count: subjects.length,      to: `/teachers/${id}/courses` },
    { label: "Student Lookup",  icon: Users,        count: students.length,      to: `/teachers/${id}/lookup` },
    { label: "Grade Entry",     icon: ClipboardEdit, count: pendingGrades,       to: `/teachers/${id}/grades` },
    { label: "Signatures",      icon: PenLine,      count: pendingGrades,        to: `/teachers/${id}/signatures` },
    { label: "Reports",         icon: BarChart3,    count: 3,                    to: `/teachers/${id}/reports` },
    { label: "Email Students",  icon: Mail,         count: myStudents,           to: `/teachers/${id}/email` },
  ];

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(222_47%_14%)] via-[hsl(222_47%_20%)] to-[hsl(222_47%_28%)] text-primary-foreground shadow-[var(--shadow-lg)]">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative p-6 md:p-8">
          <div className="flex items-center gap-2 text-xs text-white/60 uppercase tracking-[0.18em]">
            <Sparkles className="h-3 w-3 text-accent" /> {t.faculty} · {t.department}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mt-3 tracking-tight">Welcome, {t.firstName}.</h1>
          <p className="text-white/70 mt-2 max-w-2xl">
            You are coordinating <span className="text-accent font-medium">{subjects.filter(s => s.role === "coordinator").length}</span> course{subjects.filter(s => s.role === "coordinator").length === 1 ? "" : "s"} and
            lecturing on <span className="text-accent font-medium">{subjects.filter(s => s.role === "lecturer").length}</span> more this academic year.
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-5">
            <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5">{t.title}</Badge>
            <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5 font-mono">{t.staffId}</Badge>
            <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5">Office · {t.office}</Badge>
          </div>
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="h-4 w-4 text-accent" /> Courses this term</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => navigate(`/teachers/${id}/courses`)}>View all</Button>
          </CardHeader>
          <CardContent className="divide-y">
            {subjects.map((s) => {
              const enrolled = enrolledCourses.filter(e => e.subjectId === s.id).length;
              return (
                <div key={s.id} className="flex items-center gap-3 py-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-mono text-xs">
                    {s.code}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.ects} ECTS · {enrolled} students · role: {s.role}</p>
                  </div>
                  <Badge variant="outline" className={cn(
                    "capitalize",
                    s.role === "coordinator" && "bg-accent/10 text-accent border-accent/30",
                  )}>{s.role}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2"><CalendarClock className="h-4 w-4 text-accent" /> Upcoming sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingSessions.map((s) => (
              <div key={s.id} className="flex gap-3 pb-3 last:pb-0 last:border-0 border-b">
                <div className="h-9 w-9 rounded-md bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <CalendarRange className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{s.label}</p>
                  <p className="text-xs text-muted-foreground">{s.startDate} → {s.endDate}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" /> This term</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Courses</span><span className="font-semibold">{subjects.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Students reached</span><span className="font-semibold">{myStudents}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pending grades</span><span className="font-semibold">{pendingGrades}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Exam applications</span><span className="font-semibold">{examApplications.length}</span></div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-warning" /> Needs attention</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• {pendingGrades} students are awaiting grade entry for January session.</p>
            <p>• 3 exam applications missing professor confirmation.</p>
            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => navigate(`/teachers/${id}/grades`)}>Go to Grade Entry</Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[var(--shadow-card)] bg-gradient-to-br from-accent/10 to-accent/5">
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Sparkles className="h-4 w-4 text-accent" /> Quick actions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/teachers/${id}/lookup`)}>
              <Users className="h-4 w-4 mr-2" /> Look up a student
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/teachers/${id}/email`)}>
              <Mail className="h-4 w-4 mr-2" /> Email a class
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/teachers/${id}/reports`)}>
              <BarChart3 className="h-4 w-4 mr-2" /> Open reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
