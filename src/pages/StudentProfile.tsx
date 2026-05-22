import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  FileText,
  GraduationCap,
  ClipboardList,
  Award,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
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

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</CardContent>
    </Card>
  );
}

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const student = id ? getStudentProfile(id) : undefined;

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

  const quickCards = [
    { label: "Semesters", icon: Calendar, count: student.counts.semesters, to: `/students/${student.id}/semesters` },
    { label: "Courses", icon: BookOpen, count: student.counts.courses, to: `/students/${student.id}/courses` },
    { label: "Exams", icon: ClipboardList, count: student.counts.exams, to: `/students/${student.id}/exams` },
    { label: "Grades", icon: Award, count: student.counts.grades, to: `/students/${student.id}/grades` },
    { label: "Documents", icon: FileText, count: student.counts.documents, to: `/students/${student.id}/documents` },
  ];

  return (
    <div className="page-container space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate("/students")} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
      </Button>

      {/* Header */}
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5" />
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-6 -mt-12">
            <Avatar className="h-24 w-24 ring-4 ring-background shadow-md">
              {student.photoUrl && <AvatarImage src={student.photoUrl} alt={`${student.firstName} ${student.lastName}`} />}
              <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                {initials(student.firstName, student.lastName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 pt-12 md:pt-14">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold">
                  {student.firstName} {student.lastName}
                </h1>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{student.studentId}</span>
                <Badge variant="outline" className={cn("capitalize", statusColors[student.status])}>
                  {student.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                <GraduationCap className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />
                {student.programme} ({student.programmeCode}) • Year {Math.ceil(student.currentSemester / 2)} • Semester{" "}
                {student.currentSemester}
              </p>

              {/* Stat tiles */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-5">
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Average grade</p>
                  <p className="text-xl font-semibold">{student.averageGrade.toFixed(2)}</p>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-xs text-muted-foreground">ECTS acquired</p>
                  <p className="text-xl font-semibold">
                    {student.totalEcts}
                    <span className="text-sm text-muted-foreground font-normal"> / {student.targetEcts}</span>
                  </p>
                  <Progress value={ectsPct} className="h-1 mt-1.5" />
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Programme</p>
                  <p className="text-sm font-semibold truncate">{student.programme}</p>
                  <p className="text-xs text-muted-foreground">{student.programmeCode}</p>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="text-sm font-semibold capitalize">{student.status}</p>
                  <p className="text-xs text-muted-foreground">{student.studyMode}</p>
                </div>
                <div className="rounded-lg border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Enrolled</p>
                  <p className="text-xl font-semibold">{student.enrolledYear}</p>
                  <p className="text-xs text-muted-foreground">{student.academicYear}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick-access cards (always visible) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {quickCards.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.label}
              to={c.to}
              className="group rounded-lg border bg-card p-4 hover:shadow-elevated hover:border-accent/40 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-md bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <p className="text-sm font-medium mt-3">{c.label}</p>
              <p className="text-xs text-muted-foreground">{c.count} records</p>
            </Link>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="birth">Birth</TabsTrigger>
          <TabsTrigger value="education">Prev. Education</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4">
          <InfoCard title="Basic Information">
            <Field label="Full name" value={`${student.firstName} ${student.lastName}`} />
            <Field label="Student ID" value={student.studentId} />
            <Field label="Programme" value={`${student.programme} (${student.programmeCode})`} />
            <Field label="Faculty" value={student.faculty} />
            <Field label="Current semester" value={student.currentSemester} />
            <Field label="Status" value={<span className="capitalize">{student.status}</span>} />
            <Field label="Enrollment date" value={student.enrollmentDate} />
            <Field label="Expected graduation" value={student.expectedGraduation} />
          </InfoCard>
        </TabsContent>

        <TabsContent value="birth" className="mt-4">
          <InfoCard title="Birth Information">
            <Field label="Date of birth" value={student.dateOfBirth} />
            <Field label="Place of birth" value={student.placeOfBirth} />
            <Field label="Country of birth" value={student.countryOfBirth} />
            <Field label="Gender" value={student.gender} />
            <Field label="Nationality" value={student.nationality} />
            <Field label="Citizenship" value={student.citizenship} />
          </InfoCard>
        </TabsContent>

        <TabsContent value="education" className="mt-4">
          <InfoCard title="Previous Education">
            <Field label="High school" value={student.highSchoolName} />
            <Field label="Country" value={student.highSchoolCountry} />
            <Field label="Graduation year" value={student.highSchoolGraduationYear} />
            <Field label="GPA" value={student.highSchoolGpa} />
            <Field label="Prior university" value={student.priorUniversity} />
            <Field label="Transferred credits" value={student.priorCredits ? `${student.priorCredits} ECTS` : undefined} />
          </InfoCard>
        </TabsContent>

        <TabsContent value="enrollment" className="mt-4">
          <InfoCard title="University Enrollment">
            <Field label="Start year" value={student.enrolledYear} />
            <Field label="Programme" value={`${student.programme} (${student.programmeCode})`} />
            <Field label="Faculty" value={student.faculty} />
            <Field label="Enrollment type" value={student.enrollmentType} />
            <Field label="Study mode" value={student.studyMode} />
            <Field label="Academic year" value={student.academicYear} />
            <Field label="Current semester" value={student.currentSemester} />
            <Field label="Expected graduation" value={student.expectedGraduation} />
          </InfoCard>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <InfoCard title="Contact Information">
            <Field
              label="Email"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" /> {student.email}
                </span>
              }
            />
            <Field
              label="Phone"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" /> {student.phone}
                </span>
              }
            />
            <Field
              label="Permanent address"
              value={
                <span className="inline-flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" /> {student.permanentAddress}
                </span>
              }
            />
            <Field
              label="Current address"
              value={
                <span className="inline-flex items-start gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5" /> {student.currentAddress}
                </span>
              }
            />
            <Field label="Emergency contact" value={student.emergencyContactName} />
            <Field label="Emergency phone" value={student.emergencyContactPhone} />
          </InfoCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
