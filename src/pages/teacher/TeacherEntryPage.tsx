import { useMemo, useState } from "react";
import { Upload, Save, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Tabs, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  semesters, subjects, examSessions, applicationsForSubject,
  examApplications, getStudentByIndex,
} from "@/data/teacher-portal-data";
import { BulkImportWizard, ParsedImportRow } from "@/components/teacher/BulkImportWizard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Props {
  mode: "regular" | "conditional";
  kind: "grade" | "signature";
  baseHref: string;
}

const signatureValues = ["granted", "refused", "pending"] as const;
type SignatureValue = typeof signatureValues[number];

export function TeacherEntryPage({ mode, kind, baseHref }: Props) {
  const [subjectId, setSubject] = useState(subjects[0].id);
  const [semesterId, setSemester] = useState(semesters[0].id);
  const [examSessionId, setSession] = useState<string | "all">(examSessions[0].id);
  const [appliedFilter, setApplied] = useState<"yes" | "no" | "all">(
    mode === "conditional" ? "no" : "all"
  );
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [wizardOpen, setWizardOpen] = useState(false);

  const rows = useMemo(() => {
    const session = examSessionId === "all" ? undefined : examSessionId;
    const base = applicationsForSubject(subjectId, semesterId, session);
    // If filter wants only people who haven't applied (conditional), synthesize from enrolled subject list.
    if (appliedFilter === "no") {
      // We approximate: students who have a grade row but no application
      const appliedIds = new Set(base.map(b => b.student.id));
      const all = applicationsForSubject(subjectId, semesterId).map(a => a.student.id);
      const notApplied = Array.from(new Set(all)).filter(id => !appliedIds.has(id));
      return notApplied.map((id) => ({
        application: undefined,
        student: base[0]?.student ?? { id, index: id, firstName: "", lastName: "", programme: "", year: 0, status: "active" as const, email: "", programmeCode: "" },
        grade: undefined,
      })).slice(0, 6); // small mock
    }
    if (appliedFilter === "yes") return base;
    return base;
  }, [subjectId, semesterId, examSessionId, appliedFilter]);

  const titleNoun = kind === "grade" ? "Grade" : "Signature";
  const titlePrefix = mode === "conditional" ? "Conditional " : "";

  const save = () => {
    const n = Object.keys(edits).length;
    if (n === 0) return toast.info("No edits to save.");
    toast.success(`Saved ${n} ${titleNoun.toLowerCase()}${n === 1 ? "" : "s"}${mode === "conditional" ? " (conditional)" : ""}.`);
    setEdits({});
  };

  const validate = (raw: Record<string, any>): Omit<ParsedImportRow, "raw"> => {
    const studentIndex = (raw.student_index || raw.index || raw.student || "").toString().trim();
    const valueRaw = (raw[kind] || raw.value || "").toString().trim();
    const reasons: string[] = [];
    let outcome: ParsedImportRow["outcome"] = "ok";
    if (!studentIndex) { reasons.push("Missing student index"); outcome = "error"; }
    const student = studentIndex ? getStudentByIndex(studentIndex) : undefined;
    if (studentIndex && !student) { reasons.push("Unknown student"); outcome = "error"; }
    if (kind === "grade") {
      const n = Number(valueRaw);
      if (!valueRaw || isNaN(n) || n < 5 || n > 10) { reasons.push("Invalid grade (5–10)"); outcome = "error"; }
    } else {
      if (!signatureValues.includes(valueRaw as SignatureValue)) {
        reasons.push("Invalid signature value");
        outcome = "error";
      }
    }
    if (student) {
      const hasApp = examApplications.some(a => a.studentId === student.id && a.subjectId === subjectId);
      if (!hasApp && mode === "regular") {
        reasons.push("No exam application");
        outcome = outcome === "error" ? "error" : "warning";
      }
    }
    return { studentIndex, value: valueRaw, outcome, reasons };
  };

  const submit = async (parsed: ParsedImportRow[]) => {
    const details = parsed.map((p) => ({
      index: p.studentIndex,
      outcome: p.outcome,
      reason: p.outcome === "ok" ? "Saved" : p.reasons.join("; ") || "—",
    }));
    return {
      success: parsed.filter(p => p.outcome === "ok").length,
      failed: parsed.filter(p => p.outcome !== "ok").length,
      details,
    };
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{titlePrefix}{titleNoun} Entry</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "conditional"
              ? `Enter ${titleNoun.toLowerCase()}s for students who have not yet submitted an exam application. These are tracked separately.`
              : `Enter and bulk-import ${titleNoun.toLowerCase()}s for students assigned to your subjects.`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setWizardOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Bulk import
          </Button>
          <Button onClick={save}>
            <Save className="h-4 w-4 mr-2" /> Save changes
          </Button>
        </div>
      </div>

      <Tabs value={mode}>
        <TabsList>
          <TabsTrigger value="regular" asChild>
            <a href={`${baseHref}`}>Regular</a>
          </TabsTrigger>
          <TabsTrigger value="conditional" asChild>
            <a href={`${baseHref}/conditional`}>Conditional</a>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="p-4 flex flex-wrap items-end gap-3">
          <Field label="Subject">
            <Select value={subjectId} onValueChange={setSubject}>
              <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Semester">
            <Select value={semesterId} onValueChange={setSemester}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {semesters.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Exam session">
            <Select value={examSessionId} onValueChange={(v) => setSession(v as any)}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sessions</SelectItem>
                {examSessions.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Has applied">
            <Select value={appliedFilter} onValueChange={(v) => setApplied(v as any)}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="ml-auto text-sm text-muted-foreground">{rows.length} students</div>
        </CardContent>
      </Card>

      {mode === "conditional" && (
        <div className="flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-xs text-warning-foreground">
          <AlertCircle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
          <p>These entries are flagged as <strong>conditional</strong>. They will be activated once the student submits an application for this exam session.</p>
        </div>
      )}

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Programme</TableHead>
              <TableHead>Application</TableHead>
              <TableHead>Current</TableHead>
              <TableHead>New {titleNoun.toLowerCase()}</TableHead>
              <TableHead>Exam date</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-12 text-sm text-muted-foreground">No students for these filters.</TableCell></TableRow>
            ) : rows.map((r, i) => {
              const editKey = `${r.student.id}-${subjectId}-${semesterId}`;
              const v = edits[editKey] ?? "";
              const hasApp = !!r.application;
              return (
                <TableRow key={i}>
                  <TableCell>
                    <p className="font-medium">{r.student.firstName} {r.student.lastName}</p>
                    <p className="text-xs text-muted-foreground font-mono">{r.student.index}</p>
                  </TableCell>
                  <TableCell className="text-xs">{r.student.programme}</TableCell>
                  <TableCell>
                    {hasApp
                      ? <Badge variant="outline" className="bg-success/10 text-success border-success/30">Applied</Badge>
                      : <Badge variant="outline" className="bg-muted text-muted-foreground">No application</Badge>}
                  </TableCell>
                  <TableCell>
                    {kind === "grade"
                      ? (r.grade?.grade
                          ? <Badge variant="outline" className={r.grade.grade >= 6 ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"}>{r.grade.grade}</Badge>
                          : <span className="text-muted-foreground">—</span>)
                      : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>
                    {kind === "grade" ? (
                      <Input
                        type="number" min={5} max={10}
                        value={v}
                        onChange={(e) => setEdits({ ...edits, [editKey]: e.target.value })}
                        className="h-8 w-20"
                      />
                    ) : (
                      <Select value={v} onValueChange={(val) => setEdits({ ...edits, [editKey]: val })}>
                        <SelectTrigger className="h-8 w-[140px]"><SelectValue placeholder="—" /></SelectTrigger>
                        <SelectContent>
                          {signatureValues.map(sv => <SelectItem key={sv} value={sv} className="capitalize">{sv}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input type="date" className="h-8 w-36" defaultValue={r.grade?.examDate ?? ""} />
                  </TableCell>
                  <TableCell><Input className="h-8" placeholder="Optional" /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      <BulkImportWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        title={`${titlePrefix}${titleNoun} bulk import`}
        valueLabel={titleNoun}
        templateColumns={["student_index", kind]}
        validate={validate}
        onSubmit={submit}
      />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}
