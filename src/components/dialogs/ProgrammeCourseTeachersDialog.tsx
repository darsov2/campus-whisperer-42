import { useState, useEffect } from "react";
import {
  GraduationCap,
  Users,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Types
export interface ProgrammeTeacher {
  id: string;
  name: string;
  role: "coordinator" | "lecturer" | "assistant";
}

export interface ProgrammeCourseTeacherAssignment {
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  teachers: ProgrammeTeacher[];
}

interface ProgrammeCourseTeachersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  courseCode: string;
  programmes: { id: string; name: string; code: string }[];
  availableTeachers: { id: string; name: string; title: string }[];
  assignments: ProgrammeCourseTeacherAssignment[];
  onSave: (assignments: ProgrammeCourseTeacherAssignment[]) => void;
}

const roleLabels: Record<ProgrammeTeacher["role"], string> = {
  coordinator: "Coord.",
  lecturer: "Lect.",
  assistant: "Asst.",
};

const roleColors: Record<ProgrammeTeacher["role"], string> = {
  coordinator: "bg-accent text-accent-foreground",
  lecturer: "bg-info/20 text-info",
  assistant: "bg-muted text-muted-foreground",
};

export function ProgrammeCourseTeachersDialog({
  open,
  onOpenChange,
  courseName,
  courseCode,
  programmes,
  availableTeachers,
  assignments: initialAssignments,
  onSave,
}: ProgrammeCourseTeachersDialogProps) {
  const [assignments, setAssignments] = useState<ProgrammeCourseTeacherAssignment[]>([]);
  const [selectedProgrammeIds, setSelectedProgrammeIds] = useState<Set<string>>(new Set());
  const [activeProgrammeId, setActiveProgrammeId] = useState<string | null>(null);

  // Teacher dual-list state
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  useEffect(() => {
    const mapped = programmes.map((p) => {
      const existing = initialAssignments.find((a) => a.programmeId === p.id);
      return (
        existing || {
          programmeId: p.id,
          programmeName: p.name,
          programmeCode: p.code,
          teachers: [],
        }
      );
    });
    setAssignments(mapped);
    setSelectedProgrammeIds(new Set());
    setActiveProgrammeId(null);
    setLeftSearch("");
    setRightSearch("");
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [initialAssignments, programmes, open]);

  const isBulkMode = selectedProgrammeIds.size > 1;

  // In bulk mode, show the intersection of teachers across selected programmes
  // In single mode, show the active programme's teachers
  const currentTeachers: ProgrammeTeacher[] = (() => {
    if (isBulkMode) return []; // Bulk mode uses additive approach
    const active = assignments.find((a) => a.programmeId === activeProgrammeId);
    return active?.teachers || [];
  })();

  const available = availableTeachers.filter(
    (t) =>
      !currentTeachers.some((ct) => ct.id === t.id) &&
      (leftSearch === "" ||
        t.name.toLowerCase().includes(leftSearch.toLowerCase()) ||
        t.title.toLowerCase().includes(leftSearch.toLowerCase()))
  );

  const filteredAssigned = currentTeachers.filter(
    (t) =>
      rightSearch === "" ||
      t.name.toLowerCase().includes(rightSearch.toLowerCase())
  );

  const updateTeachersForProgramme = (programmeId: string, teachers: ProgrammeTeacher[]) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.programmeId === programmeId ? { ...a, teachers } : a
      )
    );
  };

  const updateTeachers = (teachers: ProgrammeTeacher[]) => {
    if (!activeProgrammeId || isBulkMode) return;
    updateTeachersForProgramme(activeProgrammeId, teachers);
  };

  // Bulk add: add teachers to all selected programmes
  const bulkAddTeachers = (teachersToAdd: { id: string; name: string }[]) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (!selectedProgrammeIds.has(a.programmeId)) return a;
        const newTeachers = teachersToAdd
          .filter((t) => !a.teachers.some((ct) => ct.id === t.id))
          .map((t) => ({
            id: t.id,
            name: t.name,
            role: (a.teachers.length === 0 ? "coordinator" : "lecturer") as ProgrammeTeacher["role"],
          }));
        return { ...a, teachers: [...a.teachers, ...newTeachers] };
      })
    );
  };

  const addOne = () => {
    if (!selectedLeft) return;
    const t = availableTeachers.find((x) => x.id === selectedLeft);
    if (!t) return;

    if (isBulkMode) {
      bulkAddTeachers([{ id: t.id, name: t.name }]);
    } else {
      if (currentTeachers.some((ct) => ct.id === t.id)) return;
      updateTeachers([
        ...currentTeachers,
        {
          id: t.id,
          name: t.name,
          role: currentTeachers.length === 0 ? "coordinator" : "lecturer",
        },
      ]);
    }
    setSelectedLeft(null);
  };

  const addAll = () => {
    if (isBulkMode) {
      bulkAddTeachers(available.map((t) => ({ id: t.id, name: t.name })));
    } else {
      const newTeachers = available.map((t, i) => ({
        id: t.id,
        name: t.name,
        role: (currentTeachers.length === 0 && i === 0
          ? "coordinator"
          : "lecturer") as ProgrammeTeacher["role"],
      }));
      updateTeachers([...currentTeachers, ...newTeachers]);
    }
    setSelectedLeft(null);
  };

  const removeOne = () => {
    if (!selectedRight || isBulkMode) return;
    updateTeachers(currentTeachers.filter((t) => t.id !== selectedRight));
    setSelectedRight(null);
  };

  const removeAll = () => {
    if (isBulkMode) return;
    updateTeachers([]);
    setSelectedRight(null);
  };

  const updateRole = (teacherId: string, role: ProgrammeTeacher["role"]) => {
    if (isBulkMode) return;
    updateTeachers(
      currentTeachers.map((t) => (t.id === teacherId ? { ...t, role } : t))
    );
  };

  const toggleProgrammeSelection = (programmeId: string) => {
    setSelectedProgrammeIds((prev) => {
      const next = new Set(prev);
      if (next.has(programmeId)) {
        next.delete(programmeId);
      } else {
        next.add(programmeId);
      }
      return next;
    });
  };

  const handleRowClick = (programmeId: string) => {
    setActiveProgrammeId(programmeId);
    // If not in bulk mode, clear multi-selection
    if (selectedProgrammeIds.size <= 1) {
      setSelectedProgrammeIds(new Set([programmeId]));
    }
    setLeftSearch("");
    setRightSearch("");
    setSelectedLeft(null);
    setSelectedRight(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(assignments);
    onOpenChange(false);
  };

  const assignedCount = assignments.filter((a) => a.teachers.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            Programme Teachers — {courseCode}
          </DialogTitle>
          <DialogDescription>
            Assign teachers to <strong>{courseName}</strong> per study programme.
            Select multiple programmes to bulk-assign.{" "}
            <Badge variant="outline" className="ml-1">
              {assignedCount}/{programmes.length} staffed
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-hidden flex flex-col gap-3"
        >
          <div className="flex gap-3 flex-1 overflow-hidden min-h-[380px]">
            {/* Programme list */}
            <div className="w-[340px] flex flex-col border rounded-lg overflow-hidden shrink-0">
              <div className="p-3 border-b bg-muted/30 flex items-center justify-between">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Programmes ({programmes.length})
                </Label>
                {selectedProgrammeIds.size > 1 && (
                  <Badge className="bg-accent text-accent-foreground text-[10px]">
                    {selectedProgrammeIds.size} selected — bulk mode
                  </Badge>
                )}
              </div>
              <ScrollArea className="flex-1">
                <div className="text-xs">
                  {/* Header */}
                  <div className="grid grid-cols-[28px_1fr_auto] gap-1 px-3 py-2 border-b bg-muted/20 font-semibold text-muted-foreground items-center">
                    <span></span>
                    <span>Programme</span>
                    <span className="text-center w-[160px]">Teachers</span>
                  </div>
                  {assignments.map((a) => (
                    <div
                      key={a.programmeId}
                      className={cn(
                        "grid grid-cols-[28px_1fr_auto] gap-1 px-3 py-2.5 border-b last:border-b-0 cursor-pointer transition-colors items-center",
                        activeProgrammeId === a.programmeId
                          ? "bg-accent/15 border-l-2 border-l-accent"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => handleRowClick(a.programmeId)}
                    >
                      <div
                        className="flex items-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={selectedProgrammeIds.has(a.programmeId)}
                          onCheckedChange={() =>
                            toggleProgrammeSelection(a.programmeId)
                          }
                          className="h-3.5 w-3.5"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-medium text-[11px] bg-muted px-1 py-0.5 rounded">
                            {a.programmeCode}
                          </span>
                          <span className="font-medium truncate">
                            {a.programmeName}
                          </span>
                        </div>
                      </div>
                      <div className="w-[160px]">
                        {a.teachers.length === 0 ? (
                          <span className="text-muted-foreground text-[10px]">
                            No teachers
                          </span>
                        ) : (
                          <div className="flex items-center gap-1 flex-wrap">
                            {a.teachers.slice(0, 2).map((t) => (
                              <Badge
                                key={t.id}
                                variant="outline"
                                className={cn(
                                  "text-[9px] px-1 py-0",
                                  t.role === "coordinator" && "border-accent/50 text-accent"
                                )}
                              >
                                {t.name.split(" ").pop()}
                                {t.role === "coordinator" && " ★"}
                              </Badge>
                            ))}
                            {a.teachers.length > 2 && (
                              <span className="text-[10px] text-muted-foreground">
                                +{a.teachers.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Teacher dual-list builder */}
            {activeProgrammeId || isBulkMode ? (
              <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                <div className="px-1">
                  {isBulkMode ? (
                    <p className="text-xs text-muted-foreground">
                      <strong>Bulk mode:</strong> Adding teachers to{" "}
                      <strong>{selectedProgrammeIds.size} programmes</strong> at once.
                      Teachers are added to each programme that doesn't already have them.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Teachers for{" "}
                      <strong>
                        {assignments.find((a) => a.programmeId === activeProgrammeId)?.programmeName}
                      </strong>
                    </p>
                  )}
                </div>
                <div className="flex gap-2 flex-1 overflow-hidden">
                  {/* Available */}
                  <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
                    <div className="p-2 border-b bg-muted/30">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Available ({available.length})
                      </Label>
                      <div className="relative mt-1.5">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input
                          placeholder="Filter..."
                          value={leftSearch}
                          onChange={(e) => setLeftSearch(e.target.value)}
                          className="pl-7 h-7 text-xs"
                        />
                      </div>
                    </div>
                    <ScrollArea className="flex-1">
                      {available.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          {leftSearch ? "No matches" : "All assigned"}
                        </p>
                      ) : (
                        available.map((t) => (
                          <div
                            key={t.id}
                            className={cn(
                              "px-2 py-2 cursor-pointer border-b last:border-b-0 transition-colors",
                              selectedLeft === t.id
                                ? "bg-accent/15 border-l-2 border-l-accent"
                                : "hover:bg-muted/50"
                            )}
                            onClick={() => setSelectedLeft(t.id)}
                            onDoubleClick={addOne}
                          >
                            <p className="text-xs font-medium">{t.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {t.title}
                            </p>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </div>

                  {/* Center controls */}
                  <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={addAll}
                      disabled={available.length === 0}
                      title={isBulkMode ? "Add all to selected programmes" : "Add all"}
                    >
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      onClick={addOne}
                      disabled={!selectedLeft}
                      title={isBulkMode ? "Add to selected programmes" : "Add selected"}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    {!isBulkMode && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={removeOne}
                          disabled={!selectedRight}
                          title="Remove selected"
                        >
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-7 w-7"
                          onClick={removeAll}
                          disabled={currentTeachers.length === 0}
                          title="Remove all"
                        >
                          <ChevronsLeft className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Assigned / Bulk confirmation */}
                  <div className="flex-[1.2] flex flex-col border rounded-lg overflow-hidden">
                    <div className="p-2 border-b bg-muted/30">
                      <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {isBulkMode ? "Bulk Assignment" : `Assigned (${currentTeachers.length})`}
                      </Label>
                      {!isBulkMode && (
                        <div className="relative mt-1.5">
                          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                          <Input
                            placeholder="Filter..."
                            value={rightSearch}
                            onChange={(e) => setRightSearch(e.target.value)}
                            className="pl-7 h-7 text-xs"
                          />
                        </div>
                      )}
                    </div>
                    <ScrollArea className="flex-1">
                      {isBulkMode ? (
                        <div className="p-4 space-y-3">
                          <div className="text-center py-2">
                            <Users className="h-6 w-6 mx-auto text-accent mb-2" />
                            <p className="text-xs text-muted-foreground">
                              Select teachers on the left and click the arrow to add them to all{" "}
                              <strong>{selectedProgrammeIds.size}</strong> selected programmes.
                            </p>
                          </div>
                          <div className="space-y-1.5">
                            {Array.from(selectedProgrammeIds).map((pid) => {
                              const a = assignments.find((x) => x.programmeId === pid);
                              if (!a) return null;
                              return (
                                <div
                                  key={pid}
                                  className="flex items-center justify-between px-2 py-1.5 bg-muted/30 rounded text-xs"
                                >
                                  <span className="font-medium">{a.programmeCode}</span>
                                  <span className="text-muted-foreground">
                                    {a.teachers.length} teacher{a.teachers.length !== 1 && "s"}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : currentTeachers.length === 0 ? (
                        <div className="text-center py-6">
                          <Users className="h-6 w-6 mx-auto text-muted-foreground mb-1.5 opacity-50" />
                          <p className="text-xs text-muted-foreground">No teachers</p>
                        </div>
                      ) : filteredAssigned.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6">
                          No matches
                        </p>
                      ) : (
                        filteredAssigned.map((t) => (
                          <div
                            key={t.id}
                            className={cn(
                              "px-2 py-1.5 cursor-pointer border-b last:border-b-0 transition-colors",
                              selectedRight === t.id
                                ? "bg-accent/15 border-l-2 border-l-accent"
                                : "hover:bg-muted/50"
                            )}
                            onClick={() => setSelectedRight(t.id)}
                            onDoubleClick={removeOne}
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-medium flex-1 truncate">
                                {t.name}
                              </span>
                              <Select
                                value={t.role}
                                onValueChange={(v: ProgrammeTeacher["role"]) =>
                                  updateRole(t.id, v)
                                }
                              >
                                <SelectTrigger
                                  className="w-[100px] h-6 text-[10px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-popover">
                                  <SelectItem value="coordinator">Coordinator</SelectItem>
                                  <SelectItem value="lecturer">Lecturer</SelectItem>
                                  <SelectItem value="assistant">Assistant</SelectItem>
                                </SelectContent>
                              </Select>
                              <Badge
                                className={cn(
                                  "text-[9px] shrink-0 px-1",
                                  roleColors[t.role]
                                )}
                              >
                                {roleLabels[t.role]}
                              </Badge>
                            </div>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center border rounded-lg bg-muted/10">
                <div className="text-center text-muted-foreground">
                  <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a programme to manage teachers</p>
                  <p className="text-xs mt-1">
                    Or check multiple programmes for bulk assignment
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              Save Teachers
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
