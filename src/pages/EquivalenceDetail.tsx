import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Plus,
  X,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  Search,
  Lock,
  CheckCircle2,
  Edit3,
  StickyNote,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  EQUIVALENCE_REQUESTS,
  EQUIVALENCE_STATUS_LABEL,
  EQUIVALENCE_STATUS_TONE,
  computeMappedEcts,
  totalSlotEcts,
  computedGrade,
  getPipelineActions,
  type EquivalenceRequest,
  type EquivalenceStatus,
  type SlotMapping,
  type TargetSlot,
  type PassedExam,
  type PipelineAction,
} from "@/data/equivalence-data";

const STATUS_TONE_CLASS: Record<string, string> = {
  info: "bg-info/10 text-info border-info/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  success: "bg-success/10 text-success border-success/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  muted: "bg-muted text-muted-foreground border-border",
};

function StatusPill({ status }: { status: EquivalenceStatus }) {
  const tone = EQUIVALENCE_STATUS_TONE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium",
        STATUS_TONE_CLASS[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {EQUIVALENCE_STATUS_LABEL[status]}
    </span>
  );
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("");
}

const STATUS_ORDER: EquivalenceStatus[] = [
  "REQUESTED",
  "GRADES_IMPORTED",
  "EQUIVALENCE_DONE",
  "PENDING_COMMENT",
  "FINISHED",
  "IKNOW_IMPORTED",
];

function PipelineProgress({ status }: { status: EquivalenceStatus }) {
  const idx = STATUS_ORDER.indexOf(status);
  const isClosed = status === "CANCELLED" || status === "ARCHIVED";

  return (
    <div className="flex items-center gap-1">
      {STATUS_ORDER.map((s, i) => {
        const reached = !isClosed && i <= idx;
        const current = !isClosed && i === idx;
        return (
          <div key={s} className="flex items-center gap-1">
            <div
              className={cn(
                "h-2 w-8 rounded-full transition-colors",
                reached ? (current ? "bg-primary" : "bg-success") : "bg-muted",
              )}
              title={EQUIVALENCE_STATUS_LABEL[s]}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function EquivalenceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initial = EQUIVALENCE_REQUESTS.find((r) => r.id === id);
  const [request, setRequest] = useState<EquivalenceRequest | undefined>(
    initial ? structuredClone(initial) : undefined,
  );
  const [examSearch, setExamSearch] = useState("");
  const [pickerSlot, setPickerSlot] = useState<TargetSlot | null>(null);
  const [editingMapping, setEditingMapping] = useState<{ slot: TargetSlot; mapping: SlotMapping } | null>(null);
  const [confirmAction, setConfirmAction] = useState<PipelineAction | null>(null);

  if (!request) {
    return (
      <div className="space-y-6">
        <PageHeader title="Equivalence not found" />
        <Button variant="outline" onClick={() => navigate("/equivalences")}>
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Button>
      </div>
    );
  }

  const readOnly =
    request.status === "FINISHED" ||
    request.status === "IKNOW_IMPORTED" ||
    request.status === "ARCHIVED" ||
    request.status === "CANCELLED";
  const editable = !readOnly;

  // exam id -> slotId where it's used
  const examToSlot = useMemo(() => {
    const map = new Map<string, string>();
    request.mappings.forEach((m) => m.passedExamIds.forEach((e) => map.set(e, m.slotId)));
    return map;
  }, [request]);

  const semesters = useMemo(() => {
    const grouped = new Map<number, TargetSlot[]>();
    request.targetSlots.forEach((s) => {
      const arr = grouped.get(s.semester) ?? [];
      arr.push(s);
      grouped.set(s.semester, arr);
    });
    return Array.from(grouped.entries())
      .sort(([a], [b]) => a - b)
      .map(([sem, slots]) => ({ sem, slots: slots.sort((a, b) => a.position - b.position) }));
  }, [request]);

  const mappedEcts = computeMappedEcts(request);
  const totalEcts = totalSlotEcts(request);
  const coverage = totalEcts ? Math.round((mappedEcts / totalEcts) * 100) : 0;

  const filteredExams = request.passedExams.filter((e) => {
    if (!examSearch) return true;
    const q = examSearch.toLowerCase();
    return (
      e.courseName.toLowerCase().includes(q) ||
      e.courseCode.toLowerCase().includes(q)
    );
  });

  const getMapping = (slotId: string): SlotMapping => {
    return (
      request.mappings.find((m) => m.slotId === slotId) ?? {
        slotId,
        passedExamIds: [],
      }
    );
  };

  const updateMapping = (slotId: string, updater: (m: SlotMapping) => SlotMapping) => {
    setRequest((prev) => {
      if (!prev) return prev;
      const exists = prev.mappings.some((m) => m.slotId === slotId);
      const newMappings = exists
        ? prev.mappings.map((m) => (m.slotId === slotId ? updater(m) : m))
        : [...prev.mappings, updater({ slotId, passedExamIds: [] })];
      return { ...prev, mappings: newMappings };
    });
  };

  const assignExamToSlot = (slotId: string, examId: string) => {
    // Remove from any previous slot first (1 exam -> 1 slot rule)
    setRequest((prev) => {
      if (!prev) return prev;
      const cleaned = prev.mappings.map((m) => ({
        ...m,
        passedExamIds: m.passedExamIds.filter((e) => e !== examId),
      }));
      const exists = cleaned.some((m) => m.slotId === slotId);
      const next = exists
        ? cleaned.map((m) =>
            m.slotId === slotId ? { ...m, passedExamIds: [...m.passedExamIds, examId], confirmed: false } : m,
          )
        : [...cleaned, { slotId, passedExamIds: [examId], confirmed: false }];
      return { ...prev, mappings: next };
    });
  };

  const removeExamFromSlot = (slotId: string, examId: string) => {
    updateMapping(slotId, (m) => ({
      ...m,
      passedExamIds: m.passedExamIds.filter((e) => e !== examId),
      confirmed: false,
    }));
  };

  const toggleSlotConfirmed = (slotId: string) => {
    updateMapping(slotId, (m) => ({ ...m, confirmed: !m.confirmed }));
  };

  const runAutoEquivalence = () => {
    // Mock: simple name-similarity assignment for unmapped slots
    setRequest((prev) => {
      if (!prev) return prev;
      const used = new Set<string>();
      prev.mappings.forEach((m) => m.passedExamIds.forEach((e) => used.add(e)));
      const newMappings = [...prev.mappings];

      prev.targetSlots.forEach((slot) => {
        if (slot.type === "optional") return;
        const existing = newMappings.find((m) => m.slotId === slot.id);
        if (existing && existing.passedExamIds.length > 0) return;
        // find best by ECTS proximity & name token overlap
        const slotTokens = slot.courseName.toLowerCase().split(/\W+/).filter((t) => t.length > 3);
        const candidate = prev.passedExams
          .filter((e) => !used.has(e.id))
          .map((e) => {
            const eTokens = e.courseName.toLowerCase().split(/\W+/);
            const overlap = slotTokens.filter((t) => eTokens.some((x) => x.includes(t) || t.includes(x))).length;
            const ectsDelta = Math.abs(slot.ects - e.ects);
            return { e, score: overlap * 10 - ectsDelta };
          })
          .sort((a, b) => b.score - a.score)[0];
        if (candidate && candidate.score > 0) {
          used.add(candidate.e.id);
          if (existing) {
            existing.passedExamIds = [candidate.e.id];
          } else {
            newMappings.push({ slotId: slot.id, passedExamIds: [candidate.e.id] });
          }
        }
      });

      return { ...prev, mappings: newMappings, status: "EQUIVALENCE_DONE" };
    });
    toast.success("Auto-equivalence completed");
  };

  const performAction = (action: PipelineAction) => {
    if (action.id === "auto") {
      runAutoEquivalence();
      return;
    }
    setRequest((prev) => (prev ? { ...prev, status: action.toStatus } : prev));
    toast.success(`Status changed to "${EQUIVALENCE_STATUS_LABEL[action.toStatus]}"`);
  };

  const actions = getPipelineActions(request.status);
  const dangerous = ["cancel", "archive"];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button onClick={() => navigate("/equivalences")} className="hover:text-foreground inline-flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Equivalences
            </button>
            <span>/</span>
            <span className="font-mono text-foreground">{request.id}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {initials(request.studentName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-semibold">{request.studentName}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                  <span>#{request.studentIndex}</span>
                  <span>·</span>
                  <span>{request.facultyName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {actions.map((a) => (
                <Button
                  key={a.id}
                  variant={a.variant === "destructive" ? "outline" : a.variant ?? "default"}
                  className={cn(
                    a.variant === "destructive" && "border-destructive/30 text-destructive hover:bg-destructive/10",
                  )}
                  onClick={() => (dangerous.includes(a.id) ? setConfirmAction(a) : performAction(a))}
                >
                  {a.id === "auto" && <Sparkles className="h-4 w-4" />}
                  {a.id === "confirm" && <CheckCircle2 className="h-4 w-4" />}
                  {a.id === "cancel" && <X className="h-4 w-4" />}
                  {a.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Programme transfer + pipeline */}
          <Card className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr_auto] items-center gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">From</p>
                <p className="font-medium mt-1">{request.fromProgrammeName}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground hidden lg:block" />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">To</p>
                <p className="font-medium mt-1">{request.toProgrammeName}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusPill status={request.status} />
                <PipelineProgress status={request.status} />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Coverage</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-xl font-semibold">{coverage}%</p>
                  <p className="text-xs text-muted-foreground">{mappedEcts}/{totalEcts} ECTS</p>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-2">
                  <div
                    className={cn("h-full rounded-full", coverage === 100 ? "bg-success" : "bg-info")}
                    style={{ width: `${coverage}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Slots Mapped</p>
                <p className="text-xl font-semibold mt-1">
                  {request.mappings.filter((m) => m.passedExamIds.length > 0).length}
                  <span className="text-sm font-normal text-muted-foreground"> / {request.targetSlots.length}</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Exams Used</p>
                <p className="text-xl font-semibold mt-1">
                  {examToSlot.size}
                  <span className="text-sm font-normal text-muted-foreground"> / {request.passedExams.length}</span>
                </p>
              </div>
            </div>

            {request.comment && (
              <div className="mt-4 pt-4 border-t flex gap-2 text-sm">
                <StickyNote className="h-4 w-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground italic">{request.comment}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Two-column workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
          {/* LEFT — target programme slots */}
          <div className="space-y-6">
            {request.passedExams.length === 0 && (
              <Card className="p-8 text-center">
                <AlertTriangle className="h-8 w-8 text-warning mx-auto mb-3" />
                <h3 className="font-medium">No grades imported yet</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Import the student's passed exams to begin equivalence.
                </p>
              </Card>
            )}

            {semesters.map(({ sem, slots }) => (
              <Card key={sem} className="overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">Semester {sem}</h3>
                  </div>
                  <span className="text-xs text-muted-foreground">{slots.length} slots</span>
                </div>
                <div className="divide-y">
                  {slots.map((slot) => {
                    const mapping = getMapping(slot.id);
                    const assigned = mapping.passedExamIds
                      .map((id) => request.passedExams.find((e) => e.id === id))
                      .filter(Boolean) as PassedExam[];
                    const grade = computedGrade(request, mapping);
                    const assignedEcts = assigned.reduce((s, e) => s + e.ects, 0);
                    const ectsMismatch = assigned.length > 0 && assignedEcts < slot.ects;

                    return (
                      <div key={slot.id} className="p-4 flex flex-col md:flex-row md:items-start gap-3">
                        {/* Slot info */}
                        <div className="md:w-64 flex-shrink-0">
                          <div className="flex items-center gap-2">
                            {slot.type === "mandatory" ? (
                              <Badge variant="secondary" className="text-[10px] uppercase">Mandatory</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] uppercase">Elective</Badge>
                            )}
                            {slot.courseCode && (
                              <span className="text-xs font-mono text-muted-foreground">{slot.courseCode}</span>
                            )}
                          </div>
                          <p className="font-medium text-sm mt-1">{slot.courseName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{slot.ects} ECTS</p>
                        </div>

                        {/* Assignment area */}
                        <div className="flex-1 min-w-0">
                          {assigned.length === 0 ? (
                            <button
                              disabled={!editable || request.passedExams.length === 0}
                              onClick={() => setPickerSlot(slot)}
                              className={cn(
                                "w-full text-left rounded-lg border-2 border-dashed px-3 py-2.5 text-sm transition-colors",
                                editable
                                  ? "border-border hover:border-primary/50 hover:bg-accent/50 text-muted-foreground"
                                  : "border-border bg-muted/30 text-muted-foreground cursor-not-allowed",
                              )}
                            >
                              <span className="inline-flex items-center gap-2">
                                <Plus className="h-3.5 w-3.5" />
                                Assign passed exam…
                              </span>
                            </button>
                          ) : (
                            <div
                              className={cn(
                                "rounded-lg border p-3 space-y-2",
                                mapping.confirmed
                                  ? "border-success/30 bg-success/5"
                                  : "border-info/30 bg-info/5",
                              )}
                            >
                              <div className="flex flex-wrap gap-2">
                                {assigned.map((exam) => (
                                  <div
                                    key={exam.id}
                                    className="inline-flex items-center gap-2 rounded-full bg-background border px-2.5 py-1 text-xs"
                                  >
                                    <span className="font-mono text-muted-foreground">{exam.courseCode}</span>
                                    <span className="font-medium">{exam.courseName}</span>
                                    <span className="text-muted-foreground">·</span>
                                    <span className="text-muted-foreground">{exam.ects} ECTS</span>
                                    <span className="text-muted-foreground">·</span>
                                    <span className="font-medium text-foreground">{exam.grade}</span>
                                    {editable && (
                                      <button
                                        onClick={() => removeExamFromSlot(slot.id, exam.id)}
                                        className="ml-0.5 text-muted-foreground hover:text-destructive"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {editable && (
                                  <button
                                    onClick={() => setPickerSlot(slot)}
                                    className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                  >
                                    <Plus className="h-3 w-3" />
                                    Merge another
                                  </button>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs gap-3 flex-wrap">
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground">
                                    Resulting grade: <span className="font-semibold text-foreground">{grade ?? "—"}</span>
                                    {mapping.grade !== undefined && (
                                      <Badge variant="outline" className="ml-1.5 text-[10px]">manual</Badge>
                                    )}
                                  </span>
                                  {ectsMismatch && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="inline-flex items-center gap-1 text-warning">
                                          <AlertTriangle className="h-3 w-3" />
                                          {assignedEcts}/{slot.ects} ECTS
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        Combined ECTS lower than slot requirement.
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                  {mapping.note && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <StickyNote className="h-3 w-3 text-muted-foreground" />
                                      </TooltipTrigger>
                                      <TooltipContent className="max-w-xs">{mapping.note}</TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                {editable && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7"
                                      onClick={() => setEditingMapping({ slot, mapping })}
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant={mapping.confirmed ? "default" : "outline"}
                                      className="h-7"
                                      onClick={() => toggleSlotConfirmed(slot.id)}
                                    >
                                      <Check className="h-3 w-3" />
                                      {mapping.confirmed ? "Confirmed" : "Confirm"}
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>

          {/* RIGHT — passed exams pool */}
          <div className="xl:sticky xl:top-4 self-start">
            <Card className="overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/30">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Passed Exams</h3>
                  <span className="text-xs text-muted-foreground">
                    {request.passedExams.length - examToSlot.size} unused
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {request.passedExams[0]?.originProgrammeName ?? "—"}
                </p>
              </div>
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    value={examSearch}
                    onChange={(e) => setExamSearch(e.target.value)}
                    placeholder="Search exams…"
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>
              <div className="max-h-[70vh] overflow-y-auto divide-y">
                {filteredExams.length === 0 && (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No exams match.
                  </div>
                )}
                {filteredExams.map((exam) => {
                  const usedIn = examToSlot.get(exam.id);
                  const usedSlot = usedIn ? request.targetSlots.find((s) => s.id === usedIn) : null;
                  return (
                    <div
                      key={exam.id}
                      className={cn(
                        "p-3 transition-colors",
                        usedIn && "bg-muted/30 opacity-70",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-mono text-muted-foreground">{exam.courseCode}</span>
                            <span className="text-xs text-muted-foreground">· S{exam.semester}</span>
                          </div>
                          <p className="text-sm font-medium truncate">{exam.courseName}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <span>{exam.ects} ECTS</span>
                            <span>·</span>
                            <span>Grade <span className="text-foreground font-medium">{exam.grade}</span></span>
                          </div>
                        </div>
                        {usedIn && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-1" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Used in: {usedSlot?.courseName}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>

        {/* Exam picker dialog */}
        <Dialog open={!!pickerSlot} onOpenChange={(o) => !o && setPickerSlot(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Assign exam to slot</DialogTitle>
              <DialogDescription>
                {pickerSlot && (
                  <>
                    Pick a passed exam to map onto{" "}
                    <span className="font-medium text-foreground">{pickerSlot.courseName}</span> ({pickerSlot.ects} ECTS).
                    Multiple exams can be merged into one slot.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto -mx-2 px-2 space-y-1">
              {request.passedExams.map((exam) => {
                const usedIn = examToSlot.get(exam.id);
                const usedHere = usedIn === pickerSlot?.id;
                const disabled = !!usedIn && !usedHere;
                return (
                  <button
                    key={exam.id}
                    disabled={disabled || usedHere}
                    onClick={() => {
                      if (pickerSlot) {
                        assignExamToSlot(pickerSlot.id, exam.id);
                        setPickerSlot(null);
                      }
                    }}
                    className={cn(
                      "w-full text-left rounded-md border p-3 text-sm transition-colors",
                      usedHere
                        ? "border-success/30 bg-success/5"
                        : disabled
                        ? "opacity-50 cursor-not-allowed bg-muted/30"
                        : "hover:border-primary/50 hover:bg-accent/50",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-muted-foreground">{exam.courseCode}</span>
                          <span className="font-medium">{exam.courseName}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {exam.ects} ECTS · Grade {exam.grade} · S{exam.semester} · {exam.academicYear}
                        </p>
                      </div>
                      {usedHere && <Badge className="bg-success/15 text-success border-success/20">Already in slot</Badge>}
                      {disabled && <span className="text-xs text-muted-foreground">In use</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPickerSlot(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit mapping dialog (manual grade + note) */}
        <Dialog open={!!editingMapping} onOpenChange={(o) => !o && setEditingMapping(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit equivalence</DialogTitle>
              <DialogDescription>
                {editingMapping && <>Override the resulting grade or attach a note for "{editingMapping.slot.courseName}".</>}
              </DialogDescription>
            </DialogHeader>
            {editingMapping && (
              <EditMappingForm
                request={request}
                slot={editingMapping.slot}
                mapping={editingMapping.mapping}
                onSave={(grade, note) => {
                  updateMapping(editingMapping.slot.id, (m) => ({
                    ...m,
                    grade,
                    note,
                  }));
                  setEditingMapping(null);
                  toast.success("Equivalence updated");
                }}
                onCancel={() => setEditingMapping(null)}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Confirm destructive action */}
        <Dialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm action</DialogTitle>
              <DialogDescription>
                {confirmAction && (
                  <>
                    This will set the request status to{" "}
                    <span className="font-medium text-foreground">
                      {EQUIVALENCE_STATUS_LABEL[confirmAction.toStatus]}
                    </span>
                    . This action cannot be easily undone.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmAction(null)}>
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  if (confirmAction) performAction(confirmAction);
                  setConfirmAction(null);
                }}
              >
                {confirmAction?.label}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

function EditMappingForm({
  request,
  slot,
  mapping,
  onSave,
  onCancel,
}: {
  request: EquivalenceRequest;
  slot: TargetSlot;
  mapping: SlotMapping;
  onSave: (grade: number | undefined, note: string | undefined) => void;
  onCancel: () => void;
}) {
  const computed = computedGrade(request, { ...mapping, grade: undefined });
  const [grade, setGrade] = useState<string>(mapping.grade?.toString() ?? "");
  const [note, setNote] = useState<string>(mapping.note ?? "");

  return (
    <div className="space-y-4">
      <div className="rounded-md bg-muted/40 p-3 text-sm">
        <p className="text-xs text-muted-foreground uppercase tracking-wide">Computed grade</p>
        <p className="font-semibold mt-0.5">{computed ?? "—"}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Weighted by ECTS across {mapping.passedExamIds.length} exam(s).
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="grade">Manual grade override</Label>
        <Input
          id="grade"
          type="number"
          min={6}
          max={10}
          step={1}
          placeholder={computed?.toString() ?? ""}
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">Leave empty to use the computed grade.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="note">Note</Label>
        <Textarea
          id="note"
          rows={3}
          placeholder="Reason for override, comments for the commission…"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button
          onClick={() => {
            const g = grade.trim() === "" ? undefined : Number(grade);
            onSave(g, note.trim() === "" ? undefined : note);
          }}
        >
          Save
        </Button>
      </DialogFooter>
    </div>
  );
}
