import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { getStudentProfile, StudentStatus } from "@/data/students-data";

const statusColors: Record<StudentStatus, string> = {
  active: "bg-success/15 text-success border-success/30",
  suspended: "bg-destructive/15 text-destructive border-destructive/30",
  graduated: "bg-accent/15 text-accent border-accent/30",
  withdrawn: "bg-muted text-muted-foreground border-border",
};

function initials(first: string, last: string) {
  return `${first[0] ?? ""}${last[0] ?? ""}`.toUpperCase();
}

function Field({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium text-sm">{value ?? <span className="text-muted-foreground">—</span>}</p>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider border-b pb-2">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">{children}</div>
    </div>
  );
}

// Mock announcements
const announcements = [
  {
    id: "1",
    title: "Exam schedule for January session published",
    date: "2026-05-28",
    type: "exam",
    summary: "The schedule for the January exam session is now available. Check the Exams tab for details.",
  },
  {
    id: "2",
    title: "Tuition payment reminder",
    date: "2026-05-20",
    type: "finance",
    summary: "Second installment of tuition is due by June 15. Please check your finance section.",
  },
  {
    id: "3",
    title: "Course enrollment for fall semester opens June 1",
    date: "2026-05-15",
    type: "enrollment",
    summary: "Enrollment for the upcoming semester opens next week. Make sure your prior obligations are settled.",
  },
];

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const student = id ? getStudentProfile(id) : undefined;
  const [tab, setTab] = useState("overview");

  if (!student) {
    return (
      <div className="page-container">
        <p className="text-muted-foreground">Student not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/students")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
        </Button>
      </div>
    );
  }

  const ectsPct = Math.min(100, Math.round((student.totalEcts / student.targetEcts) * 100));

  return (
    <div className="page-container space-y-4">
      <Button variant="ghost" size="sm" onClick={() => navigate("/students")} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
      </Button>

      {/* Compact identity bar (legacy-inspired) */}
      <div className="rounded-xl bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-elevated">
        <div className="flex flex-col md:flex-row md:items-center gap-4 p-4 md:p-5">
          <Avatar className="h-14 w-14 ring-2 ring-primary-foreground/30">
            {student.photoUrl && <AvatarImage src={student.photoUrl} />}
            <AvatarFallback className="bg-primary-foreground/15 text-primary-foreground font-semibold">
              {initials(student.firstName, student.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-mono text-sm opacity-80">{student.studentId}</span>
              <h1 className="text-lg md:text-xl font-semibold truncate">
                {student.firstName} {student.lastName}
              </h1>
              <Badge variant="outline" className={cn("capitalize border-0", statusColors[student.status])}>
                {student.status}
              </Badge>
            </div>
            <p className="text-sm opacity-90 mt-0.5 truncate">
              <GraduationCap className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
              {student.programme} • Year {Math.ceil(student.currentSemester / 2)} • Sem {student.currentSemester} • {student.academicYear}
            </p>
          </div>

          <div className="flex gap-6 md:gap-8 md:border-l md:border-primary-foreground/20 md:pl-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-70">ECTS</p>
              <p className="text-2xl font-bold leading-tight">{student.totalEcts}</p>
              <p className="text-[11px] opacity-70">of {student.targetEcts}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider opacity-70">Average</p>
              <p className="text-2xl font-bold leading-tight">{student.averageGrade.toFixed(2)}</p>
              <p className="text-[11px] opacity-70">grade</p>
            </div>
            <div className="hidden sm:block">
              <p className="text-[10px] uppercase tracking-wider opacity-70">Progress</p>
              <p className="text-2xl font-bold leading-tight">{ectsPct}%</p>
              <p className="text-[11px] opacity-70">completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/60 overflow-x-auto flex-nowrap">
          <TabsTrigger value="overview" className="gap-1.5"><Bell className="h-3.5 w-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="profile" className="gap-1.5"><User className="h-3.5 w-3.5" />Profile</TabsTrigger>
          <TabsTrigger value="semesters" className="gap-1.5"><Calendar className="h-3.5 w-3.5" />Semesters</TabsTrigger>
          <TabsTrigger value="courses" className="gap-1.5"><BookOpen className="h-3.5 w-3.5" />Courses</TabsTrigger>
          <TabsTrigger value="exams" className="gap-1.5"><ClipboardList className="h-3.5 w-3.5" />Exams</TabsTrigger>
          <TabsTrigger value="grades" className="gap-1.5"><Award className="h-3.5 w-3.5" />Grades</TabsTrigger>
          <TabsTrigger value="documents" className="gap-1.5"><FileText className="h-3.5 w-3.5" />Documents</TabsTrigger>
          <TabsTrigger value="edocs" className="gap-1.5"><FileCheck className="h-3.5 w-3.5" />E-Documents</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="mt-4 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2"><Bell className="h-4 w-4 text-accent" />Announcements</CardTitle>
                <Badge variant="secondary">{announcements.length} new</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.map((a) => (
                  <div key={a.id} className="border-l-2 border-accent/60 bg-muted/30 hover:bg-muted/50 transition-colors rounded-r-md p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{a.summary}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground whitespace-nowrap">{a.date}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4 text-accent" />Academic snapshot</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Semesters</span><span className="font-medium">{student.counts.semesters}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Courses</span><span className="font-medium">{student.counts.courses}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Exams passed</span><span className="font-medium">{student.counts.exams}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Documents</span><span className="font-medium">{student.counts.documents}</span></div>
                  <div className="pt-2 border-t flex justify-between"><span className="text-muted-foreground">Expected graduation</span><span className="font-medium">{student.expectedGraduation}</span></div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" />Quick actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => navigate(`/students/${student.id}/semesters`)}>
                    <Calendar className="h-4 w-4 mr-2" />Go to semesters
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setTab("exams")}>
                    <ClipboardList className="h-4 w-4 mr-2" />Apply for exam
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setTab("edocs")}>
                    <Download className="h-4 w-4 mr-2" />Request transcript
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* PROFILE */}
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <InfoBlock title="Basic">
                <Field label="Full name" value={`${student.firstName} ${student.lastName}`} />
                <Field label="Student ID" value={student.studentId} />
                <Field label="Programme" value={`${student.programme} (${student.programmeCode})`} />
                <Field label="Faculty" value={student.faculty} />
                <Field label="Current semester" value={student.currentSemester} />
                <Field label="Status" value={<span className="capitalize">{student.status}</span>} />
              </InfoBlock>

              <InfoBlock title="Birth">
                <Field label="Date of birth" value={student.dateOfBirth} />
                <Field label="Place of birth" value={student.placeOfBirth} />
                <Field label="Country of birth" value={student.countryOfBirth} />
                <Field label="Gender" value={student.gender} />
                <Field label="Nationality" value={student.nationality} />
                <Field label="Citizenship" value={student.citizenship} />
              </InfoBlock>

              <InfoBlock title="Previous education">
                <Field label="High school" value={student.highSchoolName} />
                <Field label="Country" value={student.highSchoolCountry} />
                <Field label="Graduation year" value={student.highSchoolGraduationYear} />
                <Field label="GPA" value={student.highSchoolGpa} />
                <Field label="Prior university" value={student.priorUniversity} />
                <Field label="Transferred credits" value={student.priorCredits ? `${student.priorCredits} ECTS` : undefined} />
              </InfoBlock>

              <InfoBlock title="University enrollment">
                <Field label="Start year" value={student.enrolledYear} />
                <Field label="Enrollment date" value={student.enrollmentDate} />
                <Field label="Enrollment type" value={student.enrollmentType} />
                <Field label="Study mode" value={student.studyMode} />
                <Field label="Academic year" value={student.academicYear} />
                <Field label="Expected graduation" value={student.expectedGraduation} />
              </InfoBlock>

              <InfoBlock title="Contact">
                <Field label="Email" value={<span className="inline-flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" />{student.email}</span>} />
                <Field label="Phone" value={<span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" />{student.phone}</span>} />
                <Field label="Permanent address" value={<span className="inline-flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />{student.permanentAddress}</span>} />
                <Field label="Current address" value={<span className="inline-flex items-start gap-1.5"><MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />{student.currentAddress}</span>} />
                <Field label="Emergency contact" value={student.emergencyContactName} />
                <Field label="Emergency phone" value={student.emergencyContactPhone} />
              </InfoBlock>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Placeholder tabs */}
        <TabsContent value="semesters" className="mt-4">
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <Calendar className="h-10 w-10 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground">View detailed semester data, financial breakdown and enrolled courses.</p>
              <Button onClick={() => navigate(`/students/${student.id}/semesters`)}>Open semesters</Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="courses" className="mt-4">
          <Card><CardContent className="pt-6 text-center text-sm text-muted-foreground">Course list coming soon.</CardContent></Card>
        </TabsContent>
        <TabsContent value="exams" className="mt-4">
          <Card><CardContent className="pt-6 text-center text-sm text-muted-foreground">Exam applications and schedule coming soon.</CardContent></Card>
        </TabsContent>
        <TabsContent value="grades" className="mt-4">
          <Card><CardContent className="pt-6 text-center text-sm text-muted-foreground">Grade book coming soon.</CardContent></Card>
        </TabsContent>
        <TabsContent value="documents" className="mt-4">
          <Card><CardContent className="pt-6 text-center text-sm text-muted-foreground">Documents library coming soon.</CardContent></Card>
        </TabsContent>
        <TabsContent value="edocs" className="mt-4">
          <Card><CardContent className="pt-6 text-center text-sm text-muted-foreground">E-Documents (transcripts, certificates) coming soon.</CardContent></Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
