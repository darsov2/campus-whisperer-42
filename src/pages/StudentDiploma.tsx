import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  GraduationCap,
  FileText,
  Users,
  CheckCircle2,
  Circle,
  XCircle,
  Wallet,
  Package,
  FileCheck,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getStudentProfile } from "@/data/students-data";
import { getDiplomaThesis, getThesisStatus, getDiplomaFees, ThesisStatus } from "@/data/diploma-thesis-data";

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
  const defended = status === "defended";
  const [fees, setFees] = useState(() => getDiplomaFees(id!));
  const [paying, setPaying] = useState(false);
  const totalDue = fees.filter((f) => !f.paid).reduce((s, f) => s + f.amount, 0);

  const handlePayAll = () => {
    setPaying(true);
    // Placeholder — to be wired to the payment backend.
    setTimeout(() => {
      setFees((prev) => prev.map((f) => ({ ...f, paid: true })));
      setPaying(false);
      toast.success("Payment successful", { description: "Your diploma fees have been paid." });
    }, 1200);
  };

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

      <div className={cn("grid gap-6", defended && "lg:grid-cols-[1fr_340px] items-start")}>
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
          </CardContent>
        </Card>

        {/* Payment — only after defence */}
        {defended && (
          <Card className="border-0 shadow-[var(--shadow-card)] lg:sticky lg:top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Wallet className="h-4 w-4 text-accent" />
                Diploma fees
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {fees.map((fee) => (
                  <div key={fee.id} className="flex items-start gap-3 rounded-lg border p-3">
                    <div className="h-8 w-8 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
                      {fee.id === "diploma-pack" ? (
                        <Package className="h-4 w-4 text-accent" />
                      ) : (
                        <FileCheck className="h-4 w-4 text-accent" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{fee.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{fee.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">
                        {fee.amount.toFixed(2)} {fee.currency}
                      </p>
                      {fee.paid && (
                        <Badge className="border-0 bg-emerald-500/10 text-emerald-600 text-[10px] mt-1">Paid</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Total due</p>
                  <p className="text-base font-bold">{totalDue.toFixed(2)} EUR</p>
                </div>
                {totalDue > 0 ? (
                  <Button className="w-full" onClick={handlePayAll} disabled={paying}>
                    {paying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {paying ? "Processing…" : `Pay ${totalDue.toFixed(2)} EUR`}
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 text-emerald-600 px-3 py-2.5 text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    All fees paid
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
