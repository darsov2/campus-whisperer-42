import { useState, useEffect } from "react";
import {
  GraduationCap,
  Users,
  Search,
  ChevronRight,
  ChevronsRight,
  ChevronLeft,
  ChevronsLeft,
  PanelRightClose,
  PanelRightOpen,
  X,
  CheckCheck,
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
import { cn } from "@/lib/utils";

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

/** Format "Dr. John Smith" → "J. Smith" */
function shortName(fullName: string): string {
  const parts = fullName.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, "").trim().split(/\s+/);
  if (parts.length < 2) return fullName;
  return `${parts[0][0]}. ${parts.slice(1).join(" ")}`;
}

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
  const [panelOpen, setPanelOpen] = useState(true);

  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  useEffect(() => {
    const mapped = programmes.map((p) => {
      const existing = initialAssignments.find((a) => a.programmeId === p.id);
      return existing || {
        programmeId: p.id,
        programmeName: p.name,
        programmeCode: p.code,
        teachers: [],
      };
    });
    setAssignments(mapped);
    setSelectedProgrammeIds(new Set());
    setActiveProgrammeId(null);
    setPanelOpen(true);
    setLeftSearch("");
    setRightSearch("");
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [initialAssignments, programmes, open]);

  const isBulkMode = selectedProgrammeIds.size > 1;
  const allSelected = selectedProgrammeIds.size === programmes.length;

  const currentTeachers: ProgrammeTeacher[] = (() => {
    if (isBulkMode) return [];
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
      prev.map((a) => (a.programmeId === programmeId ? { ...a, teachers } : a))
    );
  };

  const updateTeachers = (teachers: ProgrammeTeacher[]) => {
    if (!activeProgrammeId || isBulkMode) return;
    updateTeachersForProgramme(activeProgrammeId, teachers);
  };

  const bulkAddTeachers = (teachersToAdd: { id: string; name: string }[]) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (!selectedProgrammeIds.has(a.programmeId)) return a;
        const newTeachers = teachersToAdd
          .filter((t) => !a.teachers.some((ct) => ct.id === t.id))
          .map((t) => ({
            id: t.id,
            name: t.name,
            role: "lecturer" as ProgrammeTeacher["role"],
          }));
        return { ...a, teachers: [...a.teachers, ...newTeachers] };
      })
    );
  };

  const removeTeacherFromProgramme = (programmeId: string, teacherId: string) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.programmeId === programmeId
          ? { ...a, teachers: a.teachers.filter((t) => t.id !== teacherId) }
          : a
      )
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
      updateTeachers([...currentTeachers, { id: t.id, name: t.name, role: "lecturer" }]);
    }
    setSelectedLeft(null);
  };

  const addAll = () => {
    if (isBulkMode) {
      bulkAddTeachers(available.map((t) => ({ id: t.id, name: t.name })));
    } else {
      const newTeachers = available.map((t) => ({
        id: t.id,
        name: t.name,
        role: "lecturer" as ProgrammeTeacher["role"],
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

  const toggleProgrammeSelection = (programmeId: string) => {
    setSelectedProgrammeIds((prev) => {
      const next = new Set(prev);
      if (next.has(programmeId)) next.delete(programmeId);
      else next.add(programmeId);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedProgrammeIds(new Set());
    } else {
      setSelectedProgrammeIds(new Set(programmes.map((p) => p.id)));
    }
  };

  const handleRowClick = (programmeId: string) => {
    setActiveProgrammeId(programmeId);
    if (selectedProgrammeIds.size <= 1) {
      setSelectedProgrammeIds(new Set([programmeId]));
    }
    if (!panelOpen) setPanelOpen(true);
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
  const showPanel = panelOpen && (activeProgrammeId || isBulkMode);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-h-[85vh] overflow-hidden flex flex-col p-0",
        showPanel ? "sm:max-w-[1050px]" : "sm:max-w-[600px]"
      )}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b bg-muted/20">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="flex items-center gap-2.5 text-lg">
              <div className="h-8 w-8 rounded-lg bg-accent/15 flex items-center justify-center">
                <GraduationCap className="h-4.5 w-4.5 text-accent" />
              </div>
              Programme Teachers — {courseCode}
            </DialogTitle>
            <DialogDescription className="flex items-center gap-2">
              Assign teachers to <strong>{courseName}</strong> per study programme.
              <Badge variant="outline" className="text-[10px] font-medium">
                <CheckCheck className="h-3 w-3 mr-1" />
                {assignedCount}/{programmes.length} staffed
              </Badge>
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col">
          <div className="flex gap-0 flex-1 overflow-hidden min-h-[400px]">
            {/* Programme list */}
            <div className={cn(
              "flex flex-col border-r overflow-hidden shrink-0",
              showPanel ? "w-[380px]" : "flex-1"
            )}>
              <div className="px-4 py-3 border-b bg-muted/10 flex items-center justify-between">
                <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Programmes ({programmes.length})
                </Label>
                <div className="flex items-center gap-2">
                  {selectedProgrammeIds.size > 1 && (
                    <Badge className="bg-accent/15 text-accent border-accent/30 text-[10px] font-medium">
                      {selectedProgrammeIds.size} selected
                    </Badge>
                  )}
                  {(activeProgrammeId || isBulkMode) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setPanelOpen(!panelOpen)}
                      title={panelOpen ? "Close assignment panel" : "Open assignment panel"}
                    >
                      {panelOpen ? (
                        <PanelRightClose className="h-3.5 w-3.5" />
                      ) : (
                        <PanelRightOpen className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="text-xs">
                  {/* Header row */}
                  <div className="grid grid-cols-[28px_1fr] gap-1 px-4 py-2 border-b bg-muted/5 font-semibold text-muted-foreground items-center sticky top-0">
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleSelectAll}
                        className="h-3.5 w-3.5"
                      />
                    </div>
                    <span>Programme / Assigned Teachers</span>
                  </div>
                  {assignments.map((a) => (
                    <div
                      key={a.programmeId}
                      className={cn(
                        "grid grid-cols-[28px_1fr] gap-1 px-4 py-3 border-b last:border-b-0 cursor-pointer transition-all items-start",
                        activeProgrammeId === a.programmeId
                          ? "bg-accent/10 border-l-[3px] border-l-accent"
                          : "hover:bg-muted/40 border-l-[3px] border-l-transparent"
                      )}
                      onClick={() => handleRowClick(a.programmeId)}
                    >
                      <div onClick={(e) => e.stopPropagation()} className="pt-0.5">
                        <Checkbox
                          checked={selectedProgrammeIds.has(a.programmeId)}
                          onCheckedChange={() => toggleProgrammeSelection(a.programmeId)}
                          className="h-3.5 w-3.5"
                        />
                      </div>
                      <div className="min-w-0 space-y-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-semibold text-[10px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded">
                            {a.programmeCode}
                          </span>
                          <span className="font-medium truncate text-[12px]">{a.programmeName}</span>
                        </div>
                        {a.teachers.length === 0 ? (
                          <span className="text-muted-foreground/60 text-[10px] italic">No teachers assigned</span>
                        ) : (
                          <div className="flex items-center gap-1 flex-wrap">
                            {a.teachers.map((t) => (
                              <Badge
                                key={t.id}
                                variant="secondary"
                                className="text-[10px] pl-1.5 pr-1 py-0 gap-0.5 font-normal cursor-pointer hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30 transition-colors group"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeTeacherFromProgramme(a.programmeId, t.id);
                                }}
                              >
                                {t.name}
                                <X className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Teacher dual-list builder */}
            {showPanel && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="px-4 py-3 border-b bg-muted/10">
                  {isBulkMode ? (
                    <p className="text-xs font-medium text-accent">
                      Bulk mode — adding to {selectedProgrammeIds.size} programmes
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Assign teachers to{" "}
                      <strong className="text-foreground">
                        {assignments.find((a) => a.programmeId === activeProgrammeId)?.programmeName}
                      </strong>
                    </p>
                  )}
                </div>
                <div className="flex gap-0 flex-1 overflow-hidden">
                  {/* Available */}
                  <div className="flex-1 flex flex-col border-r overflow-hidden">
                    <div className="px-3 py-2.5 border-b bg-muted/5">
                      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Available ({available.length})
                      </Label>
                      <div className="relative mt-1.5">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input
                          placeholder="Filter teachers..."
                          value={leftSearch}
                          onChange={(e) => setLeftSearch(e.target.value)}
                          className="pl-7 h-7 text-xs"
                        />
                      </div>
                    </div>
                    <ScrollArea className="flex-1">
                      {available.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">
                          {leftSearch ? "No matches" : "All teachers assigned"}
                        </p>
                      ) : (
                        available.map((t) => (
                          <div
                            key={t.id}
                            className={cn(
                              "px-3 py-2 cursor-pointer border-b last:border-b-0 transition-colors",
                              selectedLeft === t.id
                                ? "bg-accent/10 border-l-2 border-l-accent"
                                : "hover:bg-muted/40 border-l-2 border-l-transparent"
                            )}
                            onClick={() => setSelectedLeft(t.id)}
                            onDoubleClick={addOne}
                          >
                            <p className="text-xs font-medium">{t.name}</p>
                            <p className="text-[10px] text-muted-foreground">{t.title}</p>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </div>

                  {/* Center controls */}
                  <div className="flex flex-col items-center justify-center gap-1.5 px-2 py-4 bg-muted/5">
                    <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={addAll} disabled={available.length === 0} title="Add all">
                      <ChevronsRight className="h-3.5 w-3.5" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={addOne} disabled={!selectedLeft} title="Add selected">
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                    {!isBulkMode && (
                      <>
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={removeOne} disabled={!selectedRight} title="Remove selected">
                          <ChevronLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button type="button" variant="outline" size="icon" className="h-7 w-7" onClick={removeAll} disabled={currentTeachers.length === 0} title="Remove all">
                          <ChevronsLeft className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Assigned / Bulk */}
                  <div className="flex-[1.2] flex flex-col overflow-hidden">
                    <div className="px-3 py-2.5 border-b bg-muted/5">
                      <Label className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
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
                          <div className="text-center py-3">
                            <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-2.5">
                              <Users className="h-5 w-5 text-accent" />
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              Select teachers on the left and click the arrow to add them to all{" "}
                              <strong className="text-foreground">{selectedProgrammeIds.size}</strong> selected programmes.
                            </p>
                          </div>
                          <div className="space-y-1">
                            {Array.from(selectedProgrammeIds).map((pid) => {
                              const a = assignments.find((x) => x.programmeId === pid);
                              if (!a) return null;
                              return (
                                <div key={pid} className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-md text-xs">
                                  <span className="font-mono font-medium text-[10px]">{a.programmeCode}</span>
                                  <Badge variant="outline" className="text-[10px]">
                                    {a.teachers.length} teacher{a.teachers.length !== 1 && "s"}
                                  </Badge>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : currentTeachers.length === 0 ? (
                        <div className="text-center py-10">
                          <Users className="h-7 w-7 mx-auto text-muted-foreground/30 mb-2" />
                          <p className="text-xs text-muted-foreground/60">No teachers assigned</p>
                          <p className="text-[10px] text-muted-foreground/40 mt-0.5">Double-click or use arrows</p>
                        </div>
                      ) : filteredAssigned.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-8">No matches</p>
                      ) : (
                        filteredAssigned.map((t) => (
                          <div
                            key={t.id}
                            className={cn(
                              "px-3 py-2 cursor-pointer border-b last:border-b-0 transition-colors",
                              selectedRight === t.id
                                ? "bg-accent/10 border-l-2 border-l-accent"
                                : "hover:bg-muted/40 border-l-2 border-l-transparent"
                            )}
                            onClick={() => setSelectedRight(t.id)}
                            onDoubleClick={removeOne}
                          >
                            <span className="text-xs font-medium">{t.name}</span>
                          </div>
                        ))
                      )}
                    </ScrollArea>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <DialogFooter className="px-6 py-4 border-t bg-muted/10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              Save Teachers
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}