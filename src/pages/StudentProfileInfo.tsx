import { useParams } from "react-router-dom";
import { User, Calendar, GraduationCap, Award, Mail, Phone, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getStudentProfile } from "@/data/students-data";

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

export default function StudentProfileInfo() {
  const { id } = useParams<{ id: string }>();
  const student = id ? getStudentProfile(id) : undefined;
  if (!student) return <p className="text-muted-foreground">Student not found.</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Personal, academic and contact information on file.</p>
      </div>

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
    </div>
  );
}
