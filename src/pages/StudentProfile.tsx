import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  ClipboardList,
  Award,
  Mail,
  Phone,
  MapPin,
  Bell,
  User,
  FileCheck,
  Download,
  TrendingUp,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  CalendarClock,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getStudentProfile, StudentStatus } from "@/data/students-data";

const statusStyles: Record<StudentStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  suspended: "bg-destructive/15 text-destructive border-destructive/30",
  graduated: "bg-accent/15 text-accent border-accent/30",
  withdrawn: "bg-muted text-muted-foreground border-border",
};

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
      <p className="text-sm text-foreground">{value ?? <span className="text-muted-foreground">—</span>}</p>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-accent/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-accent" />
        </div>
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5 pl-9">{children}</div>
    </div>
  );
}

// Progress ring
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
            cx="40"
            cy="40"
            r={r}
            strokeWidth="6"
            strokeLinecap="round"
            className="stroke-accent fill-none transition-all duration-700"
            strokeDasharray={c}
            strokeDashoffset={offset}
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
  const [tab, setTab] = useState("overview");

  if (!student) {
    return <p className="text-muted-foreground">Student not found.</p>;
  }

  const ectsPct = Math.min(100, Math.round((student.totalEcts / student.targetEcts) * 100));
  const gradePct = Math.round((student.averageGrade / 10) * 100);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[hsl(222_47%_14%)] via-[hsl(222_47%_20%)] to-[hsl(222_47%_28%)] text-primary-foreground shadow-[var(--shadow-lg)]">
        {/* decorative */}
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
              <Badge variant="outline" className={cn("capitalize border", statusStyles[student.status])}>
                {student.status}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5">
                <span className="font-mono">{student.studentId}</span>
              </Badge>
              <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5">
                {student.studyMode}
              </Badge>
              <Badge variant="outline" className="border-white/20 text-white/80 bg-white/5">
                Expected graduation · {student.expectedGraduation}
              </Badge>
            </div>
          </div>

          <div className="flex flex-wrap gap-8 lg:gap-10">
            <Ring value={ectsPct} label="ECTS progress" sub={`${student.totalEcts} / ${student.targetEcts}`} />
            <Ring value={gradePct} label="Average grade" sub={student.averageGrade.toFixed(2)} />
          </div>
        </div>
      </div>

      {/* Quick tiles */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Semesters", icon: Calendar, count: student.counts.semesters, to: `/students/${student.id}/semesters` },
          { label: "Courses", icon: BookOpen, count: student.counts.courses },
          { label: "Exams", icon: ClipboardList, count: student.counts.exams },
          { label: "Grades", icon: Award, count: student.counts.grades },
          { label: "Documents", icon: FileText, count: student.counts.documents },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => c.to && navigate(c.to)}
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

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="border-b">
          <TabsList className="h-auto p-0 bg-transparent gap-1 flex-wrap justify-start">
            {[
              { v: "overview", l: "Overview", I: Bell },
              { v: "profile", l: "Profile", I: User },
              { v: "academic", l: "Academic record", I: GraduationCap },
              { v: "finance", l: "Finance", I: Wallet },
              { v: "documents", l: "Documents", I: FileText },
              { v: "edocs", l: "E-Documents", I: FileCheck },
            ].map(({ v, l, I }) => (
              <TabsTrigger
                key={v}
                value={v}
                className="data-[state=active]:bg-transparent data-[state=active]:text-accent data-[state=active]:shadow-none rounded-none border-b-2 border-transparent data-[state=active]:border-accent px-4 py-2.5 gap-2"
              >
                <I className="h-3.5 w-3.5" />
                {l}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 border-0 shadow-[var(--shadow-card)]">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-accent" />Announcements
                </CardTitle>
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
                <CardTitle className="text-base flex items-center gap-2">
                  <CalendarClock className="h-4 w-4 text-accent" />Upcoming
                </CardTitle>
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
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <ClipboardList className="h-4 w-4 mr-2" />Apply for exam
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
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
        </TabsContent>

        {/* PROFILE */}
        <TabsContent value="profile" className="mt-6">
          <Card className="border-0 shadow-[var(--shadow-card)]">
            <CardContent className="pt-6 space-y-8">
              <Section title="Basic" icon={User}>
                <Field label="Full name" value={`${student.firstName} ${student.lastName}`} />
                <Field label="Student ID" value={<span className="font-mono">{student.studentId}</span>} />
                <Field label="Programme" value={`${student.programme} (${student.programmeCode})`} />
                <Field label="Faculty" value={student.faculty} />
                <Field label="Current semester" value={student.currentSemester} />
                <Field label="Status" value={<span className="capitalize">{student.status}</span>} />
              </Section>

              <Section title="Birth" icon={Calendar}>
                <Field label="Date of birth" value={student.dateOfBirth} />
                <Field label="Place of birth" value={student.placeOfBirth} />
                <Field label="Country" value={student.countryOfBirth} />
                <Field label="Gender" value={student.gender} />
                <Field label="Nationality" value={student.nationality} />
                <Field label="Citizenship" value={student.citizenship} />
              </Section>

              <Section title="Previous education" icon={GraduationCap}>
                <Field label="High school" value={student.highSchoolName} />
                <Field label="Country" value={student.highSchoolCountry} />
                <Field label="Graduation year" value={student.highSchoolGraduationYear} />
                <Field label="GPA" value={student.highSchoolGpa} />
                <Field label="Prior university" value={student.priorUniversity} />
                <Field label="Transferred credits" value={student.priorCredits ? `${student.priorCredits} ECTS` : undefined} />
              </Section>

              <Section title="University enrollment" icon={Award}>
                <Field label="Start year" value={student.enrolledYear} />
                <Field label="Enrollment date" value={student.enrollmentDate} />
                <Field label="Type" value={student.enrollmentType} />
                <Field label="Study mode" value={student.studyMode} />
                <Field label="Academic year" value={student.academicYear} />
                <Field label="Expected graduation" value={student.expectedGraduation} />
              </Section>

              <Section title="Contact" icon={Mail}>
                <Field label="Email" value={<span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{student.email}</span>} />
                <Field label="Phone" value={<span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{student.phone}</span>} />
                <Field label="Permanent address" value={<span className="inline-flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />{student.permanentAddress}</span>} />
                <Field label="Current address" value={<span className="inline-flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />{student.currentAddress}</span>} />
                <Field label="Emergency contact" value={student.emergencyContactName} />
                <Field label="Emergency phone" value={student.emergencyContactPhone} />
              </Section>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="academic" className="mt-6">
          <Card className="border-0 shadow-[var(--shadow-card)]">
            <CardContent className="py-10 text-center space-y-3">
              <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">Full academic record — semesters, courses, exams and grades.</p>
              <Button onClick={() => navigate(`/students/${student.id}/semesters`)}>Open semesters</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="finance" className="mt-6">
          <Card className="border-0 shadow-[var(--shadow-card)]"><CardContent className="py-10 text-center text-sm text-muted-foreground">Tuition, payments and balances — coming soon.</CardContent></Card>
        </TabsContent>
        <TabsContent value="documents" className="mt-6">
          <Card className="border-0 shadow-[var(--shadow-card)]"><CardContent className="py-10 text-center text-sm text-muted-foreground">Documents library — coming soon.</CardContent></Card>
        </TabsContent>
        <TabsContent value="edocs" className="mt-6">
          <Card className="border-0 shadow-[var(--shadow-card)]"><CardContent className="py-10 text-center text-sm text-muted-foreground">E-Documents (transcripts, certificates) — coming soon.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
