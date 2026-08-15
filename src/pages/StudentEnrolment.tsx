import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  GraduationCap,
  Info,
  Lock,
  Plus,
  Repeat2,
  Search,
  Sparkles,
  X,

} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {

  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getStudentProfile } from "@/data/students-data";
import {
  additionalSubjects,
  enrolmentContext,
  enrolmentSlots,
  isEligible,
  MAX_SEMESTER_ECTS,
  replacementSubjects,
  RequirementCheck,
  Subject,
} from "@/data/student-enrolment-data";

/* ------------------------------- status badge -------------------------------- */

type Tone = "muted" | "accent" | "warning" | "danger" | "success";

const toneStyles: Record<Tone, string> = {
  muted: "bg-muted text-muted-foreground border-border",
  accent: "bg-accent/15 text-accent border-accent/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/10 text-destructive border-destructive/30",
  success: "bg-success/15 text-success border-success/30",
};

function StatusBadge({
  tone = "muted",
  icon: Icon,
  children,
}: {
  tone?: Tone;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <Badge variant="outline" className={cn("text-[11px] font-medium", toneStyles[tone])}>
      {Icon && <Icon className="h-3 w-3 mr-1" />}
      {children}
    </Badge>
  );
}

/* ----------------------------- requirement list ------------------------------ */

function RequirementList({ requirements }: { requirements: RequirementCheck[] }) {
  return (
    <ul className="space-y-1.5">
      {requirements.map((r) => (
        <li key={r.label} className="flex items-start gap-2 text-sm">
          {r.fulfilled ? (
            <Check className="h-4 w-4 mt-0.5 shrink-0 text-success" />
          ) : (
            <X className="h-4 w-4 mt-0.5 shrink-0 text-destructive" />
          )}
          <span className={cn(r.fulfilled ? "text-muted-foreground" : "text-foreground")}>
            {r.label}
            {r.detail && (
              <span className="block text-xs text-muted-foreground">{r.detail}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RequirementsDisclosure({
  requirements,
  label = "View requirements",
}: {
  requirements: RequirementCheck[];
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2 text-xs">
          {label}
          <ChevronDown className={cn("h-3.5 w-3.5 ml-1 transition-transform", open && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pt-2">
        <div className="rounded-md border bg-muted/40 p-3">
          <RequirementList requirements={requirements} />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

/* -------------------------------- subject row -------------------------------- */

function SubjectLine({ subject }: { subject: Subject }) {
  return (
    <div className="min-w-0">
      <p className="font-medium text-sm truncate">{subject.name}</p>
      <p className="text-xs text-muted-foreground">
        {subject.ects} ECTS · {subject.code}
      </p>
    </div>
  );
}

/* ------------------------------- picker dialog ------------------------------- */

interface SubjectGroup {
  id: string;
  label: string;
  subjects: Subject[];
}

interface PickerProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description: string;
  subjects?: Subject[];
  groups?: SubjectGroup[];
  defaultGroupId?: string;
  remainingEcts: number;
  onSelect: (s: Subject, justification?: string) => void;
  requireJustification?: boolean;
  confirmLabel?: string;
}

function SubjectPicker({
  open,
  onOpenChange,
  title,
  description,
  subjects,
  groups,
  defaultGroupId,
  remainingEcts,
  onSelect,
  requireJustification,
  confirmLabel = "Select",
}: PickerProps) {
  const [chosen, setChosen] = useState<Subject | null>(null);
  const [justification, setJustification] = useState("");
  const [showUnavailable, setShowUnavailable] = useState(false);
  const [query, setQuery] = useState("");
  const [groupId, setGroupId] = useState<string>(defaultGroupId ?? "all");

  const pool = useMemo(() => {
    if (!groups) return subjects ?? [];
    if (groupId === "all") return groups.flatMap((g) => g.subjects);
    return groups.find((g) => g.id === groupId)?.subjects ?? [];
  }, [groups, subjects, groupId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pool;
    return pool.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
    );
  }, [pool, query]);

  const available = filtered.filter(isEligible);
  const unavailable = filtered.filter((s) => !isEligible(s));

  const close = () => {
    setChosen(null);
    setJustification("");
    setQuery("");
    setGroupId(defaultGroupId ?? "all");
    onOpenChange(false);
  };

  const pick = (s: Subject) => {
    if (requireJustification) {
      setChosen(s);
      return;
    }
    onSelect(s);
    close();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by subject name or code"
              className="pl-8"
            />
          </div>
          {groups && groups.length > 0 && (
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger className="sm:w-56">
                <SelectValue placeholder="All groups" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All groups</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="max-h-[50vh] overflow-y-auto -mx-1 px-1 space-y-4">
          <div className="space-y-2">
            {available.map((s) => {
              const overload = s.ects > remainingEcts;
              const selected = chosen?.id === s.id;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "rounded-lg border p-3 flex items-start gap-3",
                    selected && "border-accent bg-accent/5",
                    overload && "opacity-70",
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <SubjectLine subject={s} />
                    <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-success">
                      <Check className="h-3.5 w-3.5" /> Prerequisites fulfilled
                    </p>
                    {overload && (
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        This subject cannot be added because it would increase your semester
                        workload to {MAX_SEMESTER_ECTS - remainingEcts + s.ects} ECTS. The maximum
                        allowed workload is {MAX_SEMESTER_ECTS} ECTS.
                      </p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    disabled={overload}
                    onClick={() => pick(s)}
                  >
                    {selected ? "Chosen" : confirmLabel}
                  </Button>
                </div>
              );
            })}
            {available.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No subjects match your search for this requirement.
              </p>
            )}
          </div>

          {unavailable.length > 0 && (
            <Collapsible open={showUnavailable} onOpenChange={setShowUnavailable}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 px-2 -ml-2 text-xs">
                  Unavailable subjects ({unavailable.length})
                  <ChevronDown
                    className={cn("h-3.5 w-3.5 ml-1 transition-transform", showUnavailable && "rotate-180")}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 space-y-2">
                {unavailable.map((s) => (
                  <div key={s.id} className="rounded-lg border border-dashed bg-muted/30 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <SubjectLine subject={s} />
                      <StatusBadge tone="danger" icon={Lock}>
                        Not eligible
                      </StatusBadge>
                    </div>
                    <div className="mt-2">
                      <RequirementList requirements={s.requirements} />
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        {requireJustification && (
          <div className="space-y-2">
            <Label htmlFor="justification" className="text-xs">
              Justification (optional)
            </Label>
            <Textarea
              id="justification"
              rows={3}
              placeholder="Briefly explain why you would like to enrol in this additional subject."
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </div>
        )}

        {requireJustification && (
          <DialogFooter>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              disabled={!chosen}
              onClick={() => {
                if (chosen) onSelect(chosen, justification.trim() || undefined);
                close();
              }}
            >
              Submit request
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}


/* --------------------------------- section ----------------------------------- */

function Section({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-start gap-2.5">
        <div className="h-8 w-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/* ---------------------------------- page ------------------------------------- */

type AdditionalStatus = "added" | "pending" | "approved" | "rejected";

interface AdditionalEntry {
  subject: Subject;
  status: AdditionalStatus;
  justification?: string;
}

function ConfirmGroup({
  title,
  items,
  muted,
}: {
  title: string;
  items: { subject: Subject; note?: string }[];
  muted?: boolean;
}) {
  if (items.length === 0) return null;
  const total = items.reduce((a, i) => a + i.subject.ects, 0);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </p>
        <span className="text-xs text-muted-foreground">{total} ECTS</span>
      </div>
      <div className={cn("rounded-lg border divide-y", muted && "border-dashed bg-muted/30")}>
        {items.map((i) => (
          <div key={i.subject.id} className="flex items-start justify-between gap-3 p-3">
            <div className="min-w-0">
              <SubjectLine subject={i.subject} />
              {i.note && <p className="mt-1 text-xs text-muted-foreground">{i.note}</p>}
            </div>
            <span className="text-xs text-muted-foreground shrink-0">{i.subject.ects} ECTS</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StudentEnrolment() {

  const { id } = useParams<{ id: string }>();
  const student = id ? getStudentProfile(id) : undefined;

  const [highGpa, setHighGpa] = useState(true);
  const gpa = highGpa ? enrolmentContext.gpa : enrolmentContext.lowGpa;

  const [electiveChoices, setElectiveChoices] = useState<Record<string, Subject>>({});
  const [replacements, setReplacements] = useState<Record<string, Subject>>({});
  const [additional, setAdditional] = useState<AdditionalEntry[]>([]);
  const [pickerSlot, setPickerSlot] = useState<string | null>(null);
  const [replaceSlot, setReplaceSlot] = useState<string | null>(null);
  const [additionalOpen, setAdditionalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);


  const reenrolled = enrolmentSlots.filter((s) => s.kind === "reenrolled");
  const mandatory = enrolmentSlots.filter((s) => s.kind === "mandatory");
  const electives = enrolmentSlots.filter((s) => s.kind === "elective");

  const confirmedEcts = useMemo(() => {
    let total = 0;
    // Re-enrolled subjects always occupy their credits (a replacement is mutually
    // exclusive with the repeated subject, so it is never double-counted).
    reenrolled.forEach((s) => (total += s.subject?.ects ?? 0));
    mandatory.forEach((s) => {
      if (!s.blocked) total += s.subject?.ects ?? 0;
    });
    Object.values(electiveChoices).forEach((s) => (total += s.ects));
    additional.filter((a) => a.status === "added" || a.status === "approved").forEach((a) => (total += a.subject.ects));
    return total;
  }, [reenrolled, mandatory, electiveChoices, additional]);

  const conditionalEcts = Object.values(replacements).reduce((a, s) => a + s.ects, 0);
  const pendingEcts = additional
    .filter((a) => a.status === "pending")
    .reduce((a, e) => a + e.subject.ects, 0);

  const remaining = MAX_SEMESTER_ECTS - confirmedEcts;
  const pct = Math.min(100, Math.round((confirmedEcts / MAX_SEMESTER_ECTS) * 100));

  const unfilledElectives = electives.filter((s) => !electiveChoices[s.id]).length;
  const canSubmit = unfilledElectives === 0;

  const takenIds = new Set([
    ...enrolmentSlots.map((s) => s.subject?.name).filter(Boolean),
    ...Object.values(electiveChoices).map((s) => s.name),
    ...additional.map((a) => a.subject.name),
  ]);

  const activePicker = electives.find((s) => s.id === pickerSlot);
  const activeReplace = reenrolled.find((s) => s.id === replaceSlot);

  const confirmedList: Subject[] = [
    ...reenrolled.map((s) => s.subject!),
    ...mandatory.filter((s) => !s.blocked).map((s) => s.subject!),
    ...Object.values(electiveChoices),
    ...additional
      .filter((a) => a.status === "added" || a.status === "approved")
      .map((a) => a.subject),
  ];


  return (
    <div className="space-y-6">
      {/* ------------------------------ header ------------------------------- */}
      <div className="rounded-xl bg-[hsl(222_47%_11%)] text-primary-foreground p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Enrolment</p>
            <h1 className="text-xl font-semibold mt-1">Subject Enrolment</h1>
            <p className="text-sm text-white/70">{enrolmentContext.semesterLabel}</p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
            <Label htmlFor="gpa-preview" className="text-xs text-white/70">
              Preview low-GPA state
            </Label>
            <Switch id="gpa-preview" checked={!highGpa} onCheckedChange={(v) => setHighGpa(!v)} />
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50">Study programme</p>
            <p className="text-sm font-medium">
              {student?.programme ?? enrolmentContext.programme}
            </p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50">Current semester</p>
            <p className="text-sm font-medium">Semester {enrolmentContext.semesterNumber}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50">GPA</p>
            <p className="text-sm font-medium">{gpa.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider text-white/50">Semester workload</p>
            <p className="text-sm font-medium">
              {confirmedEcts} / {MAX_SEMESTER_ECTS} ECTS
            </p>
            <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {!canSubmit && (
        <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm">
          <AlertCircle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
          <p>
            {unfilledElectives} elective {unfilledElectives === 1 ? "requirement" : "requirements"}{" "}
            still need your choice before you can submit the enrolment.
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] items-start">
        <div className="space-y-8">
          <div className="space-y-8 lg:hidden">

          {/* --------------------------- re-enrolled -------------------------- */}
          {reenrolled.length > 0 && (
            <Section
              title="Re-enrolled subjects"
              description="Previously failed mandatory subjects, added automatically."
              icon={Repeat2}
            >
              {reenrolled.map((slot) => {
                const rep = replacements[slot.id];
                return (
                  <Card key={slot.id}>
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <SubjectLine subject={slot.subject!} />
                        <div className="flex items-center gap-1.5">
                          <StatusBadge tone="muted" icon={Repeat2}>
                            Re-enrolled
                          </StatusBadge>
                        </div>
                      </div>

                      {rep ? (
                        <div className="relative ml-3 border-l-2 border-dashed pl-4 pt-1">
                          <div className="flex items-start justify-between gap-3 rounded-lg border border-dashed bg-muted/30 p-3">
                            <div>
                              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                Replacement
                              </p>
                              <SubjectLine subject={rep} />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <StatusBadge tone="accent">Replacement selected</StatusBadge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={() =>
                                  setReplacements((p) => {
                                    const n = { ...p };
                                    delete n[slot.id];
                                    return n;
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            These two subjects are conditional alternatives — only one of them
                            will be active.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            Previously failed mandatory subject. It cannot be removed from this
                            semester.
                          </p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 -mr-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setReplaceSlot(slot.id)}
                          >
                            <Repeat2 className="h-3.5 w-3.5 mr-1.5" /> Pick replacement
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Section>
          )}

          {/* ---------------------------- mandatory --------------------------- */}
          {mandatory.length > 0 && (
            <Section
              title="Mandatory subjects"
              description="Enrolled automatically when their requirements are fulfilled."
              icon={BookOpen}
            >
              {mandatory.map((slot) => (
                <Card key={slot.id} className={cn(slot.blocked && "border-destructive/30")}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <SubjectLine subject={slot.subject!} />
                      {slot.blocked ? (
                        <StatusBadge tone="danger" icon={AlertCircle}>
                          Requirements not fulfilled
                        </StatusBadge>
                      ) : (
                        <StatusBadge tone="success" icon={CheckCircle2}>
                          Automatically enrolled
                        </StatusBadge>
                      )}
                    </div>
                    {slot.blocked && (
                      <RequirementsDisclosure requirements={slot.subject!.requirements} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </Section>
          )}

          {/* ---------------------------- electives --------------------------- */}
          {electives.length > 0 && (
            <Section
              title="Electives"
              description="Choose one subject for each remaining programme requirement."
              icon={Sparkles}
            >
              {electives.map((slot) => {
                const chosen = electiveChoices[slot.id];
                return (
                  <Card key={slot.id} className={cn(!chosen && "border-dashed")}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                            {slot.title}
                          </p>
                          {chosen ? (
                            <div className="mt-1">
                              <SubjectLine subject={chosen} />
                            </div>
                          ) : (
                            <p className="mt-1 text-sm text-muted-foreground">
                              Subject selection required
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {chosen ? (
                            <>
                              <StatusBadge tone="accent" icon={Check}>
                                Selected
                              </StatusBadge>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={() => setPickerSlot(slot.id)}
                              >
                                Change
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={() =>
                                  setElectiveChoices((p) => {
                                    const n = { ...p };
                                    delete n[slot.id];
                                    return n;
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </>
                          ) : (
                            <>
                              <StatusBadge tone="warning" icon={AlertCircle}>
                                Action required
                              </StatusBadge>
                              <Button size="sm" onClick={() => setPickerSlot(slot.id)}>
                                Choose subject
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </Section>
          )}
          </div>

          {/* --------------------- desktop two-panel planner ------------------ */}
          <div className="hidden lg:grid grid-cols-[minmax(0,340px)_minmax(0,1fr)] gap-4 items-start">
            <div className="rounded-xl border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold">Programme slots</p>
                <p className="text-xs text-muted-foreground">
                  Grouped by the semester each slot belongs to
                </p>
              </div>
              <div className="max-h-[70vh] overflow-y-auto">
                {semesterGroups.map((group) => {
                  const open = group.slots.filter(
                    (s) => s.kind === "elective" && !electiveChoices[s.id],
                  ).length;
                  return (
                    <div key={group.semester}>
                      <div className="sticky top-0 z-10 flex items-center justify-between gap-2 border-y bg-muted/70 px-4 py-1.5 backdrop-blur">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Semester {group.semester}
                          {group.semester < enrolmentContext.semesterNumber && (
                            <span className="ml-1.5 font-normal normal-case tracking-normal">
                              carried over
                            </span>
                          )}
                        </p>
                        {open > 0 && (
                          <span className="text-[11px] font-medium text-warning">
                            {open} to fill
                          </span>
                        )}
                      </div>
                      {group.slots.map((slot) => {
                        const status = slotStatus(slot);
                        const chosen =
                          slot.kind === "elective" ? electiveChoices[slot.id] : slot.subject;
                        const active = slot.id === selectedSlotId;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={cn(
                              "w-full border-b border-l-2 border-l-transparent px-4 py-3 text-left transition-colors hover:bg-muted/50",
                              active && "border-l-primary bg-muted/60",
                            )}
                          >
                            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                              {slot.title}
                            </p>
                            <p
                              className={cn(
                                "mt-0.5 truncate text-sm font-medium",
                                !chosen && "font-normal text-muted-foreground",
                              )}
                            >
                              {chosen ? chosen.name : "Subject selection required"}
                            </p>
                            <div className="mt-1.5 flex items-center gap-2">
                              <StatusBadge tone={status.tone} icon={status.icon}>
                                {status.label}
                              </StatusBadge>
                              {chosen && (
                                <span className="text-[11px] text-muted-foreground">
                                  {chosen.ects} ECTS
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ------------------------- detail panel ------------------------- */}
            <Card className="min-h-[420px]">
              <CardContent className="p-5 space-y-4">
                {!selectedSlot ? (
                  <p className="text-sm text-muted-foreground">
                    Select a slot on the left to see its details.
                  </p>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                          Semester {selectedSlot.semester} · {selectedSlot.title}
                        </p>
                        <h2 className="mt-0.5 text-base font-semibold">
                          {selectedSlot.kind === "elective"
                            ? electiveChoices[selectedSlot.id]?.name ?? "Choose a subject"
                            : selectedSlot.subject?.name}
                        </h2>
                      </div>
                      <StatusBadge
                        tone={slotStatus(selectedSlot).tone}
                        icon={slotStatus(selectedSlot).icon}
                      >
                        {slotStatus(selectedSlot).label}
                      </StatusBadge>
                    </div>

                    <Separator />

                    {selectedSlot.kind === "reenrolled" && (
                      <div className="space-y-3">
                        <SubjectLine subject={selectedSlot.subject!} />
                        <p className="text-xs text-muted-foreground">
                          Previously failed mandatory subject. It cannot be removed from this
                          semester.
                        </p>
                        {replacements[selectedSlot.id] ? (
                          <div className="rounded-lg border border-dashed bg-muted/30 p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                                  Replacement
                                </p>
                                <SubjectLine subject={replacements[selectedSlot.id]} />
                              </div>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs"
                                onClick={() =>
                                  setReplacements((p) => {
                                    const n = { ...p };
                                    delete n[selectedSlot.id];
                                    return n;
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">
                              Only one of these two subjects will be active.
                            </p>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 -ml-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => setReplaceSlot(selectedSlot.id)}
                          >
                            <Repeat2 className="h-3.5 w-3.5 mr-1.5" /> Pick replacement
                          </Button>
                        )}
                      </div>
                    )}

                    {selectedSlot.kind === "mandatory" && (
                      <div className="space-y-3">
                        <SubjectLine subject={selectedSlot.subject!} />
                        <div className="rounded-md border bg-muted/40 p-3">
                          <RequirementList requirements={selectedSlot.subject!.requirements} />
                        </div>
                        {!selectedSlot.blocked && (
                          <p className="text-xs text-muted-foreground">
                            This subject is enrolled automatically — no action needed.
                          </p>
                        )}
                      </div>
                    )}

                    {selectedSlot.kind === "elective" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              value={detailQuery}
                              onChange={(e) => setDetailQuery(e.target.value)}
                              placeholder="Search subjects for this slot"
                              className="pl-8"
                            />
                          </div>
                          {electiveChoices[selectedSlot.id] && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setElectiveChoices((p) => {
                                  const n = { ...p };
                                  delete n[selectedSlot.id];
                                  return n;
                                })
                              }
                            >
                              Clear selection
                            </Button>
                          )}
                        </div>

                        <div className="max-h-[46vh] space-y-2 overflow-y-auto pr-1">
                          {detailOptions.eligible.map((s) => {
                            const isChosen = electiveChoices[selectedSlot.id]?.id === s.id;
                            const overload =
                              !isChosen &&
                              s.ects >
                                remaining + (electiveChoices[selectedSlot.id]?.ects ?? 0);
                            return (
                              <div
                                key={s.id}
                                className={cn(
                                  "flex items-start gap-3 rounded-lg border p-3",
                                  isChosen && "border-accent bg-accent/5",
                                  overload && "opacity-70",
                                )}
                              >
                                <div className="min-w-0 flex-1">
                                  <SubjectLine subject={s} />
                                  <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-success">
                                    <Check className="h-3.5 w-3.5" /> Prerequisites fulfilled
                                  </p>
                                  {overload && (
                                    <p className="mt-1.5 text-xs text-muted-foreground">
                                      Adding this subject would exceed the maximum workload of{" "}
                                      {MAX_SEMESTER_ECTS} ECTS.
                                    </p>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant={isChosen ? "default" : "outline"}
                                  disabled={overload}
                                  onClick={() =>
                                    setElectiveChoices((p) => ({ ...p, [selectedSlot.id]: s }))
                                  }
                                >
                                  {isChosen ? "Selected" : "Select"}
                                </Button>
                              </div>
                            );
                          })}
                          {detailOptions.eligible.length === 0 && (
                            <p className="text-sm text-muted-foreground">
                              No available subjects match your search.
                            </p>
                          )}

                          {detailOptions.blocked.length > 0 && (
                            <div className="space-y-2 pt-1">
                              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                Unavailable ({detailOptions.blocked.length})
                              </p>
                              {detailOptions.blocked.map((s) => (
                                <div
                                  key={s.id}
                                  className="rounded-lg border border-dashed bg-muted/30 p-3"
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <SubjectLine subject={s} />
                                    <StatusBadge tone="danger" icon={Lock}>
                                      Not eligible
                                    </StatusBadge>
                                  </div>
                                  <div className="mt-2">
                                    <RequirementList requirements={s.requirements} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* -------------------------- additional ---------------------------- */}

          {unfilledElectives === 0 && (
            <Section
              title="Additional subjects"
              description="Optional subjects beyond your regular programme requirements."
              icon={GraduationCap}
            >
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm">
                    You currently have{" "}
                    <span className="font-medium">
                      {confirmedEcts} / {MAX_SEMESTER_ECTS} ECTS
                    </span>
                    .{" "}
                    {gpa >= enrolmentContext.gpaThreshold
                      ? `Because your GPA is ${gpa.toFixed(2)}, you may enrol in an additional subject directly.`
                      : `Because your GPA is ${gpa.toFixed(2)}, an additional subject requires Vice Dean approval.`}
                  </p>

                  {additional.map((entry, i) => (
                    <div
                      key={entry.subject.id}
                      className={cn(
                        "rounded-lg border p-3 flex items-start justify-between gap-3",
                        entry.status === "pending" && "border-dashed bg-muted/30",
                      )}
                    >
                      <div className="min-w-0">
                        <SubjectLine subject={entry.subject} />
                        {entry.justification && (
                          <p className="mt-1 text-xs text-muted-foreground italic">
                            “{entry.justification}”
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        {entry.status === "added" && (
                          <StatusBadge tone="accent">Additional subject</StatusBadge>
                        )}
                        {entry.status === "pending" && (
                          <StatusBadge tone="warning" icon={Clock}>
                            Pending Vice Dean approval
                          </StatusBadge>
                        )}
                        {entry.status === "approved" && (
                          <StatusBadge tone="success" icon={CheckCircle2}>
                            Approved
                          </StatusBadge>
                        )}
                        {entry.status === "rejected" && (
                          <StatusBadge tone="danger" icon={X}>
                            Rejected
                          </StatusBadge>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs"
                          onClick={() => setAdditional((p) => p.filter((_, idx) => idx !== i))}
                        >
                          {entry.status === "pending" ? "Withdraw" : "Remove"}
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={remaining <= 0}
                    onClick={() => setAdditionalOpen(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1.5" />
                    {gpa >= enrolmentContext.gpaThreshold
                      ? "Add additional subject"
                      : "Request additional subject"}
                  </Button>
                  {remaining <= 0 && (
                    <p className="text-xs text-muted-foreground">
                      You have reached the maximum workload of {MAX_SEMESTER_ECTS} ECTS.
                    </p>
                  )}
                </CardContent>
              </Card>
            </Section>
          )}
        </div>

        {/* ------------------------------ review ------------------------------ */}
        <Card className="lg:sticky lg:top-6">
          <CardContent className="p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold">Review</h2>
              <p className="text-xs text-muted-foreground">
                Check your semester before submitting.
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Confirmed workload</span>
                <span className="font-medium">{confirmedEcts} ECTS</span>
              </div>
              {conditionalEcts > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Conditional replacement</span>
                  <span className="font-medium">{conditionalEcts} ECTS</span>
                </div>
              )}
              {pendingEcts > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Pending approval</span>
                  <span className="font-medium">{pendingEcts} ECTS</span>
                </div>
              )}
            </div>

            <Progress value={pct} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {confirmedEcts} of {MAX_SEMESTER_ECTS} ECTS used · {Math.max(0, remaining)} ECTS
              remaining
            </p>

            <Separator />

            <div className="space-y-1.5 text-xs">
              <p className="font-medium text-foreground">Confirmed enrolments</p>
              <ul className="space-y-1 text-muted-foreground">
                {[
                  ...reenrolled.map((s) => s.subject!),
                  ...mandatory.filter((s) => !s.blocked).map((s) => s.subject!),
                  ...Object.values(electiveChoices),
                  ...additional
                    .filter((a) => a.status === "added" || a.status === "approved")
                    .map((a) => a.subject),
                ].map((s) => (
                  <li key={s.id} className="flex justify-between gap-2">
                    <span className="truncate">{s.name}</span>
                    <span className="shrink-0">{s.ects}</span>
                  </li>
                ))}
              </ul>
            </div>

            {conditionalEcts > 0 && (
              <div className="space-y-1.5 text-xs">
                <p className="font-medium text-foreground">Conditional replacements</p>
                <ul className="space-y-1 text-muted-foreground">
                  {Object.values(replacements).map((s) => (
                    <li key={s.id} className="flex justify-between gap-2">
                      <span className="truncate">{s.name}</span>
                      <span className="shrink-0">{s.ects}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pendingEcts > 0 && (
              <div className="space-y-1.5 text-xs">
                <p className="font-medium text-foreground">Approval requests</p>
                <ul className="space-y-1 text-muted-foreground">
                  {additional
                    .filter((a) => a.status === "pending")
                    .map((a) => (
                      <li key={a.subject.id} className="flex justify-between gap-2">
                        <span className="truncate">{a.subject.name}</span>
                        <span className="shrink-0">{a.subject.ects}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <Button
              className="w-full"
              disabled={!canSubmit}
              onClick={() => setConfirmOpen(true)}
            >
              Review & submit
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Button>

            {!canSubmit && (
              <p className="text-xs text-muted-foreground text-center">
                Complete all elective choices first.
              </p>
            )}
            {submitted && canSubmit && (
              <p className="inline-flex items-center gap-1.5 text-xs text-success">
                <Info className="h-3.5 w-3.5" /> Submitted — you can still adjust until the deadline.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------- dialogs ------------------------------ */}
      {activePicker && (
        <SubjectPicker
          open
          onOpenChange={(v) => !v && setPickerSlot(null)}
          title={activePicker.title}
          description="Choose one subject that fulfils this programme requirement."
          groups={electives.map((slot) => ({
            id: slot.id,
            label: slot.title,
            subjects: (slot.groupSubjects ?? []).filter(
              (s) => !takenIds.has(s.name) || electiveChoices[activePicker.id]?.name === s.name,
            ),
          }))}
          defaultGroupId={activePicker.id}
          remainingEcts={remaining + (electiveChoices[activePicker.id]?.ects ?? 0)}
          onSelect={(s) => {
            setElectiveChoices((p) => ({ ...p, [activePicker.id]: s }));
            setPickerSlot(null);
          }}
        />
      )}


      {activeReplace && (
        <SubjectPicker
          open
          onOpenChange={(v) => !v && setReplaceSlot(null)}
          title="Choose replacement subject"
          description="This subject will only become active if a passing grade is entered for the repeated subject."
          subjects={replacementSubjects.filter((s) => !takenIds.has(s.name))}
          remainingEcts={activeReplace.subject?.ects ?? 0}
          onSelect={(s) => {
            setReplacements((p) => ({ ...p, [activeReplace.id]: s }));
            setReplaceSlot(null);
          }}
        />
      )}

      <SubjectPicker
        open={additionalOpen}
        onOpenChange={setAdditionalOpen}
        title={
          gpa >= enrolmentContext.gpaThreshold
            ? "Add an additional subject"
            : "Request an additional subject"
        }
        description={
          gpa >= enrolmentContext.gpaThreshold
            ? "Choose a subject from another programme requirement. Your workload must stay within the maximum."
            : "Choose a subject and submit it for Vice Dean approval. It will not be enrolled until approved."
        }
        subjects={additionalSubjects.filter((s) => !takenIds.has(s.name))}
        remainingEcts={remaining}
        requireJustification={gpa < enrolmentContext.gpaThreshold}
        onSelect={(s, justification) =>
          setAdditional((p) => [
            ...p,
            {
              subject: s,
              status: gpa >= enrolmentContext.gpaThreshold ? "added" : "pending",
              justification,
            },
          ])
        }
      />

      {/* --------------------------- confirmation step --------------------------- */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Confirm your enrolment</DialogTitle>
            <DialogDescription>
              Review everything below before submitting your enrolment for{" "}
              {enrolmentContext.semesterLabel}.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-[55vh] overflow-y-auto -mx-1 px-1 space-y-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Confirmed workload
                </p>
                <p className="text-lg font-semibold">
                  {confirmedEcts} / {MAX_SEMESTER_ECTS} ECTS
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Subjects
                </p>
                <p className="text-lg font-semibold">{confirmedList.length}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  Study programme
                </p>
                <p className="text-sm font-medium">
                  {student?.programme ?? enrolmentContext.programme}
                </p>
              </div>
            </div>

            <ConfirmGroup
              title="Repeated subjects"
              items={reenrolled.map((s) => ({
                subject: s.subject!,
                note: replacements[s.id]
                  ? `Replacement if passed: ${replacements[s.id].name}`
                  : undefined,
              }))}
            />
            <ConfirmGroup
              title="Mandatory subjects"
              items={mandatory
                .filter((s) => !s.blocked)
                .map((s) => ({ subject: s.subject! }))}
            />
            <ConfirmGroup
              title="Electives"
              items={electives
                .filter((s) => electiveChoices[s.id])
                .map((s) => ({ subject: electiveChoices[s.id], note: s.title }))}
            />
            <ConfirmGroup
              title="Additional subjects"
              items={additional
                .filter((a) => a.status === "added" || a.status === "approved")
                .map((a) => ({ subject: a.subject, note: a.justification }))}
            />
            <ConfirmGroup
              title="Awaiting Vice Dean approval"
              items={additional
                .filter((a) => a.status === "pending")
                .map((a) => ({ subject: a.subject, note: a.justification }))}
              muted
            />
            {mandatory.some((s) => s.blocked) && (
              <div className="flex items-start gap-2.5 rounded-lg border border-warning/30 bg-warning/10 p-3 text-xs">
                <AlertCircle className="h-4 w-4 mt-0.5 text-warning shrink-0" />
                <p>
                  {mandatory.filter((s) => s.blocked).length} mandatory subject(s) cannot be
                  enrolled this semester and are not included in this submission.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Back to editing
            </Button>
            <Button
              onClick={() => {
                setSubmitted(true);
                setConfirmOpen(false);
                toast({
                  title: "Enrolment submitted",
                  description: `${confirmedEcts} ECTS confirmed for ${enrolmentContext.semesterLabel}.`,
                });
              }}
            >
              Confirm & submit
              <Check className="h-4 w-4 ml-1.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
