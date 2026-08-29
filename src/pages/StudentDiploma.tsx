import { useParams } from "react-router-dom";
import {
  GraduationCap,
  FileText,
  Users,
  CalendarRange,
  Stamp,
  Printer,
  CheckCircle2,
  Circle,
  XCircle,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStudentProfile } from "@/data/students-data";
import { getDiplomaThesis, getThesisStatus, ThesisStatus } from "@/data/diploma-thesis-data";

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

const statusConfig: Record<ThesisStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
  applied: { label: "Applied", className: "bg-blue-500/10 text-blue-600" },
  "in-progress": { label: "In progress", className: "bg-amber-500/10 text-amber-600" },
  submitted: { label: "Submitted", className: "bg-blue-500/10 text-blue-600" },
  defended: { label: "Defended", className: "bg-emerald-500/10 text-emerald-600" },
  discarded: { label: "Discarded", className: "bg-destructive/10 text-destructive" },
};

const timelineSteps = [
  { key: "applicationDate", label: "Application" },
  { key: "submissionDate", label: "Submission" },
  { key: "presentationDate", label: "Defence" },
] as const;

export default function StudentDiploma() {
  const { id } = useParams<{ id: string }>();
  const student = id ? getStudentProfile(id) : undefined;
  const thesis = id ? getDiplomaThesis(id) : undefined;

  if (!student) return <p className="text-muted-foreground">Student not found.</p>;

  if (!thesis) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diploma Thesis</h1>
          <p className="text-sm text-muted-foreground mt-1">Your diploma thesis record.</p>
        </div>
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardContent className="py-20 text-center space-y-3">
            <div className="h-14 w-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
              <GraduationCap className="h-6 w-6" />
            </div>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              No diploma thesis has been registered for you yet. Once your application is approved by the faculty, it
              will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = getThesisStatus(thesis);
  const cfg = statusConfig[status];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diploma Thesis</h1>
          <p className="text-sm text-muted-foreground mt-1">Read-only overview of your diploma thesis record.</p>
        </div>
        <Badge className={cn("border-0 text-xs px-3 py-1", cfg.className)}>{cfg.label}</Badge>
      </div>

      {/* Thesis header card */}
      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="min-w-0 space-y-1">
              <p className="text-xs font-mono text-muted-foreground">{thesis.thesisNo}</p>
              <h2 className="text-lg font-semibold leading-snug">{thesis.name}</h2>
              <p className="text-sm text-muted-foreground">
                {student.programme} ({student.programmeCode}) · {thesis.credits} ECTS
                {thesis.grade != null && (
                  <>
                    {" · Grade "}
                    <span className="font-semibold text-foreground">{thesis.grade}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {thesis.description && (
            <div className="rounded-lg bg-muted/40 p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Abstract</p>
              <p className="text-sm leading-relaxed text-foreground/90">{thesis.description}</p>
            </div>
          )}

          {/* Progress timeline */}
          {!thesis.discarded && (
            <div className="flex items-center gap-0 pt-2">
              {timelineSteps.map((step, i) => {
                const date = thesis[step.key];
                const done = !!date;
                return (
                  <div key={step.key} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground/40" />
                      )}
                      <div className="text-center">
                        <p className={cn("text-xs font-medium", done ? "text-foreground" : "text-muted-foreground")}>
                          {step.label}
                        </p>
                        <p className="text-[11px] text-muted-foreground">{date ?? "—"}</p>
                      </div>
                    </div>
                    {i < timelineSteps.length - 1 && (
                      <div className={cn("flex-1 h-px mx-3 mb-7", done && thesis[timelineSteps[i + 1].key] ? "bg-emerald-500/50" : "bg-border")} />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {thesis.discarded && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 text-destructive px-4 py-3 text-sm">
              <XCircle className="h-4 w-4 shrink-0" />
              This thesis application has been discarded. Contact your faculty administration for details.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Details */}
      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="pt-6 space-y-8">
          <Section title="Thesis" icon={FileText}>
            <Field label="Thesis number" value={<span className="font-mono">{thesis.thesisNo}</span>} />
            <Field label="Credits" value={`${thesis.credits} ECTS`} />
            <Field
              label="Grade"
              value={
                thesis.grade != null ? (
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-accent/10 text-accent font-semibold">
                    {thesis.grade}
                  </span>
                ) : undefined
              }
            />
          </Section>

          <Section title="Committee" icon={Users}>
            <Field label="Mentor" value={thesis.mentor} />
            <Field label="Committee member 1" value={thesis.member1} />
            <Field label="Committee member 2" value={thesis.member2} />
          </Section>

          <Section title="Important dates" icon={CalendarRange}>
            <Field label="Application date" value={thesis.applicationDate} />
            <Field label="Submission date" value={thesis.submissionDate} />
            <Field label="Presentation (defence) date" value={thesis.presentationDate} />
          </Section>

          <Section title="Official records" icon={Stamp}>
            <Field label="Master diploma book No." value={thesis.masterDiplomaBookNo && <span className="font-mono">{thesis.masterDiplomaBookNo}</span>} />
            <Field label="Supplement No." value={thesis.supplementNo && <span className="font-mono">{thesis.supplementNo}</span>} />
            <Field label="Supplement date" value={thesis.supplementDate} />
            <Field
              label="Sent for print"
              value={
                thesis.isSentForPrint == null ? undefined : (
                  <span className="inline-flex items-center gap-1.5">
                    <Printer className="h-3.5 w-3.5 text-muted-foreground" />
                    {thesis.isSentForPrint ? "Yes" : "No"}
                  </span>
                )
              }
            />
          </Section>
        </CardContent>
      </Card>
    </div>
  );
}
