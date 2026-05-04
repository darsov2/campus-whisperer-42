import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Plus,
  Sparkles,
  AlertTriangle,
  GraduationCap,
  Search,
  Lock,
  CheckCircle2,
  StickyNote,
  GripVertical,
  Inbox,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
          <div
            key={s}
            className={cn(
              "h-2 w-8 rounded-full transition-colors",
              reached ? (current ? "bg-primary" : "bg-success") : "bg-muted",
            )}
            title={EQUIVALENCE_STATUS_LABEL[s]}
          />
        );
      })}
    </div>
  );
}

const DRAG_MIME = "application/x-passed-exam";

export default function EquivalenceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const initial = EQUIVALENCE_REQUESTS.find((r) => r.id === id);
  const [request, setRequest] = useState<EquivalenceRequest | undefined>(
    initial ? structuredClone(initial) : undefined,
  );
  const [examSearch, setExamSearch] = useState("");
  const [confirmAction, setConfirmAction] = useState<PipelineAction | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const [draggingExamId, setDraggingExamId] = useState<string | null>(null);
  const [pickerSlot, setPickerSlot] = useState<TargetSlot | null>(null);

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
    return e.courseName.toLowerCase().includes(q) || e.courseCode.toLowerCase().includes(q);
  });

  const getMapping = (slotId: string): SlotMapping =>
    request.mappings.find((m) => m.slotId === slotId) ?? { slotId, passedExamIds: [] };

  const moveExamToSlot = (examId: string, targetSlotId: string | null) => {
    setRequest((prev) => {
      if (!prev) return prev;
      const cleaned = prev.mappings.map((m) => ({
        ...m,
        passedExamIds: m.passedExamIds.filter((e) => e !== examId),
        confirmed: m.passedExamIds.includes(examId) ? false : m.confirmed,
      }));
      if (!targetSlotId) {
        return { ...prev, mappings: cleaned.filter((m) => m.passedExamIds.length > 0 || m.note) };
      }
      const exists = cleaned.some((m) => m.slotId === targetSlotId);
      const next = exists
        ? cleaned.map((m) =>
            m.slotId === targetSlotId
              ? { ...m, passedExamIds: [...m.passedExamIds, examId], confirmed: false }
              : m,
          )
        : [...cleaned, { slotId: targetSlotId, passedExamIds: [examId], confirmed: false }];
      return { ...prev, mappings: next };
    });
  };

  const removeExamFromSlot = (slotId: string, examId: string) => moveExamToSlot(examId, null);

  const toggleSlotConfirmed = (slotId: string) => {
    setRequest((prev) => {
      if (!prev) return prev;
      const exists = prev.mappings.some((m) => m.slotId === slotId);
      const newMappings = exists
        ? prev.mappings.map((m) => (m.slotId === slotId ? { ...m, confirmed: !m.confirmed } : m))
        : prev.mappings;
      return { ...prev, mappings: newMappings };
    });
  };

  const runAutoEquivalence = () => {
    setRequest((prev) => {
      if (!prev) return prev;
      const used = new Set<string>();
      prev.mappings.forEach((m) => m.passedExamIds.forEach((e) => used.add(e)));
      const newMappings = [...prev.mappings];

      prev.targetSlots.forEach((slot) => {
        if (slot.type === "optional") return;
        const existing = newMappings.find((m) => m.slotId === slot.id);
        if (existing && existing.passedExamIds.length > 0) return;
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
          if (existing) existing.passedExamIds = [candidate.e.id];
          else newMappings.push({ slotId: slot.id, passedExamIds: [candidate.e.id] });
        }
      });

      return { ...prev, mappings: newMappings, status: "EQUIVALENCE_DONE" };
    });
    toast.success("Auto-equivalence completed");
  };

  const performAction = (action: PipelineAction) => {
    if (action.id === "auto") return runAutoEquivalence();
    setRequest((prev) => (prev ? { ...prev, status: action.toStatus } : prev));
    toast.success(`Status changed to "${EQUIVALENCE_STATUS_LABEL[action.toStatus]}"`);
  };

  const actions = getPipelineActions(request.status);
  const dangerous = ["cancel", "archive"];

  // Drag handlers
  const handleDragStart = (examId: string) => (e: React.DragEvent) => {
    if (!editable) return;
    e.dataTransfer.setData(DRAG_MIME, examId);
    e.dataTransfer.effectAllowed = "move";
    setDraggingExamId(examId);
  };
  const handleDragEnd = () => {
    setDraggingExamId(null);
    setDragOverSlot(null);
  };
  const handleSlotDragOver = (slotId: string) => (e: React.DragEvent) => {
    if (!editable) return;
    if (e.dataTransfer.types.includes(DRAG_MIME)) {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverSlot(slotId);
    }
  };
  const handleSlotDragLeave = () => setDragOverSlot(null);
  const handleSlotDrop = (slotId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    const examId = e.dataTransfer.getData(DRAG_MIME);
    if (examId) moveExamToSlot(examId, slotId);
    setDragOverSlot(null);
    setDraggingExamId(null);
  };
  const handlePoolDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const examId = e.dataTransfer.getData(DRAG_MIME);
    if (examId && examToSlot.has(examId)) moveExamToSlot(examId, null);
    setDraggingExamId(null);
  };
  const handlePoolDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes(DRAG_MIME)) e.preventDefault();
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button
              onClick={() => navigate("/equivalences")}
              className="hover:text-foreground inline-flex items-center gap-1"
            >
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

          {editable && request.passedExams.length > 0 && (
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <GripVertical className="h-3.5 w-3.5" />
              Drag passed exams from the right panel onto a target slot. Multiple exams can be merged into one slot.
            </div>
          )}
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
                    const isOver = dragOverSlot === slot.id;

                    return (
                      <div
                        key={slot.id}
                        onDragOver={handleSlotDragOver(slot.id)}
                        onDragLeave={handleSlotDragLeave}
                        onDrop={handleSlotDrop(slot.id)}
                        className={cn(
                          "p-4 flex flex-col md:flex-row md:items-start gap-3 transition-colors",
                          isOver && "bg-primary/5 ring-2 ring-inset ring-primary/40",
                        )}
                      >
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
                            <div
                              className={cn(
                                "rounded-lg border-2 border-dashed px-3 py-3 text-sm text-center transition-colors",
                                isOver
                                  ? "border-primary bg-primary/10 text-primary"
                                  : editable
                                  ? "border-border text-muted-foreground"
                                  : "border-border bg-muted/30 text-muted-foreground",
                              )}
                            >
                              {editable
                                ? isOver
                                  ? "Drop to assign"
                                  : "Drop a passed exam here"
                                : "No equivalence"}
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "rounded-lg border p-3 space-y-2 transition-colors",
                                mapping.confirmed
                                  ? "border-success/30 bg-success/5"
                                  : "border-info/30 bg-info/5",
                                isOver && "ring-2 ring-primary/40",
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
                                  <span className="inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1 text-xs text-muted-foreground">
                                    Drop to merge
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center justify-between text-xs gap-3 flex-wrap">
                                <div className="flex items-center gap-3">
                                  <span className="text-muted-foreground">
                                    Resulting grade:{" "}
                                    <span className="font-semibold text-foreground">{grade ?? "—"}</span>
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
                                </div>
                                {editable && (
                                  <Button
                                    size="sm"
                                    variant={mapping.confirmed ? "default" : "outline"}
                                    className="h-7"
                                    onClick={() => toggleSlotConfirmed(slot.id)}
                                  >
                                    <Check className="h-3 w-3" />
                                    {mapping.confirmed ? "Confirmed" : "Confirm"}
                                  </Button>
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
            <Card
              className="overflow-hidden"
              onDragOver={handlePoolDragOver}
              onDrop={handlePoolDrop}
            >
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
                  <div className="p-6 text-center text-sm text-muted-foreground">No exams match.</div>
                )}
                {filteredExams.map((exam) => {
                  const usedIn = examToSlot.get(exam.id);
                  const usedSlot = usedIn ? request.targetSlots.find((s) => s.id === usedIn) : null;
                  const isDragging = draggingExamId === exam.id;
                  return (
                    <div
                      key={exam.id}
                      draggable={editable}
                      onDragStart={handleDragStart(exam.id)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "p-3 transition-all flex items-start gap-2",
                        editable && "cursor-grab active:cursor-grabbing hover:bg-accent/50",
                        usedIn && "bg-muted/30 opacity-70",
                        isDragging && "opacity-40",
                      )}
                    >
                      {editable && (
                        <GripVertical className="h-3.5 w-3.5 text-muted-foreground/60 flex-shrink-0 mt-1" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-mono text-muted-foreground">{exam.courseCode}</span>
                          <span className="text-xs text-muted-foreground">· S{exam.semester}</span>
                        </div>
                        <p className="text-sm font-medium truncate">{exam.courseName}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{exam.ects} ECTS</span>
                          <span>·</span>
                          <span>
                            Grade <span className="text-foreground font-medium">{exam.grade}</span>
                          </span>
                        </div>
                      </div>
                      {usedIn && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Lock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 mt-1" />
                          </TooltipTrigger>
                          <TooltipContent>Used in: {usedSlot?.courseName}</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  );
                })}
              </div>
              {editable && (
                <div className="px-3 py-2 border-t bg-muted/20 flex items-center gap-2 text-xs text-muted-foreground">
                  <Inbox className="h-3.5 w-3.5" />
                  Drop here to unassign an exam.
                </div>
              )}
            </Card>
          </div>
        </div>

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
