import { useState } from "react";
import { useParams } from "react-router-dom";
import { User, Calendar, GraduationCap, Award, Mail, Phone, MapPin, Pencil, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getStudentProfile, updateStudentProfile } from "@/data/students-data";

const editSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  phone: z.string().trim().min(5, "Phone is too short").max(30),
  permanentAddress: z.string().trim().min(3, "Address is required").max(200),
  currentAddress: z.string().trim().min(3, "Address is required").max(200),
  emergencyContactName: z.string().trim().min(2, "Contact name is required").max(100),
  emergencyContactPhone: z.string().trim().min(5, "Phone is too short").max(30),
  placeOfBirth: z.string().trim().min(2, "Place of birth is required").max(100),
  countryOfBirth: z.string().trim().min(2, "Country is required").max(100),
  nationality: z.string().trim().min(2, "Nationality is required").max(100),
  citizenship: z.string().trim().min(2, "Citizenship is required").max(100),
});
type EditForm = z.infer<typeof editSchema>;

interface StepDef {
  id: string;
  title: string;
  description: string;
  fields: { key: keyof EditForm; label: string; span?: boolean }[];
}

const steps: StepDef[] = [
  {
    id: "contact",
    title: "Contact details",
    description: "How the university can reach you.",
    fields: [
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "permanentAddress", label: "Permanent address", span: true },
      { key: "currentAddress", label: "Current address", span: true },
    ],
  },
  {
    id: "emergency",
    title: "Emergency contact",
    description: "Person to contact in case of emergency.",
    fields: [
      { key: "emergencyContactName", label: "Contact name" },
      { key: "emergencyContactPhone", label: "Contact phone" },
    ],
  },
  {
    id: "birth",
    title: "Birth & nationality",
    description: "Personal details as stated in your documents.",
    fields: [
      { key: "placeOfBirth", label: "Place of birth" },
      { key: "countryOfBirth", label: "Country of birth" },
      { key: "nationality", label: "Nationality" },
      { key: "citizenship", label: "Citizenship" },
    ],
  },
];

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
  const [version, setVersion] = useState(0);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<EditForm | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof EditForm, string>>>({});

  const student = id ? getStudentProfile(id) : undefined;
  if (!student) return <p className="text-muted-foreground">Student not found.</p>;
  void version;

  const openEdit = () => {
    setForm({
      email: student.email,
      phone: student.phone,
      permanentAddress: student.permanentAddress,
      currentAddress: student.currentAddress,
      emergencyContactName: student.emergencyContactName,
      emergencyContactPhone: student.emergencyContactPhone,
      placeOfBirth: student.placeOfBirth,
      countryOfBirth: student.countryOfBirth,
      nationality: student.nationality,
      citizenship: student.citizenship,
    });
    setErrors({});
    setStep(0);
    setOpen(true);
  };

  const validateStep = (stepIndex: number): boolean => {
    if (!form) return false;
    const keys = steps[stepIndex].fields.map((f) => f.key);
    const subset = Object.fromEntries(keys.map((k) => [k, form[k]]));
    const shape = Object.fromEntries(keys.map((k) => [k, editSchema.shape[k]]));
    const result = z.object(shape).safeParse(subset);
    if (result.success) {
      setErrors({});
      return true;
    }
    const fieldErrors: Partial<Record<keyof EditForm, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0] as keyof EditForm;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    setErrors(fieldErrors);
    return false;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const back = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const save = () => {
    if (!form) return;
    if (!validateStep(step)) return;
    const result = editSchema.safeParse(form);
    if (!result.success) return;
    updateStudentProfile(student.id, result.data);
    setVersion((v) => v + 1);
    setOpen(false);
    toast.success("Profile updated", { description: "Your personal information has been saved." });
  };

  const isLast = step === steps.length - 1;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Personal, academic and contact information on file.</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 shrink-0" onClick={openEdit}>
          <Pencil className="h-3.5 w-3.5" />
          Edit personal info
        </Button>
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

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit personal info</DialogTitle>
            <DialogDescription>
              {steps[step].description} Academic records are managed by student services.
            </DialogDescription>
          </DialogHeader>

          {/* Stepper */}
          <div className="flex items-center gap-1 py-1">
            {steps.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1 flex-1 last:flex-none">
                <div className="flex items-center gap-2">
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0 transition-colors ${
                      i < step
                        ? "bg-success text-success-foreground"
                        : i === step
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {i < step ? <Check className="h-3 w-3" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      i === step ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
                {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-success" : "bg-border"}`} />}
              </div>
            ))}
          </div>

          {form && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2 min-h-[180px] content-start">
              {steps[step].fields.map((f) => (
                <div key={f.key} className={`space-y-1.5 ${f.span ? "sm:col-span-2" : ""}`}>
                  <Label htmlFor={`edit-${f.key}`}>{f.label}</Label>
                  <Input
                    id={`edit-${f.key}`}
                    value={form[f.key]}
                    onChange={(e) => {
                      setForm({ ...form, [f.key]: e.target.value });
                      setErrors((prev) => ({ ...prev, [f.key]: undefined }));
                    }}
                    className={errors[f.key] ? "border-destructive" : undefined}
                  />
                  {errors[f.key] && <p className="text-xs text-destructive">{errors[f.key]}</p>}
                </div>
              ))}
            </div>
          )}

          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <div className="flex gap-2">
              {step > 0 && (
                <Button variant="outline" className="gap-1.5" onClick={back}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Back
                </Button>
              )}
              {isLast ? (
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={save}>
                  Save changes
                </Button>
              ) : (
                <Button className="bg-accent hover:bg-accent/90 text-accent-foreground gap-1.5" onClick={next}>
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
