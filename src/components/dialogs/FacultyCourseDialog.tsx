import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  LayoutGrid,
  List,
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
import { Switch } from "@/components/ui/switch";
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
export interface FacultyTeacher {
  id: string;
  name: string;
  role: "coordinator" | "lecturer" | "assistant";
}

export interface FacultyCourseAssignment {
  facultyId: string;
  facultyName: string;
  facultyCode: string;
  winter: boolean;
  summer: boolean;
  teachers: FacultyTeacher[];
}

interface FacultyCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  courseCode: string;
  faculties: { id: string; name: string; code: string }[];
  availableTeachers: { id: string; name: string; title: string }[];
  assignments: FacultyCourseAssignment[];
  onSave: (assignments: FacultyCourseAssignment[]) => void;
}

const roleLabels: Record<FacultyTeacher["role"], string> = {
  coordinator: "Coord.",
  lecturer: "Lect.",
  assistant: "Asst.",
};

const roleColors: Record<FacultyTeacher["role"], string> = {
  coordinator: "bg-accent text-accent-foreground",
  lecturer: "bg-info/20 text-info",
  assistant: "bg-muted text-muted-foreground",
};

export function FacultyCourseDialog({
  open,
  onOpenChange,
  courseName,
  courseCode,
  faculties,
  availableTeachers,
  assignments: initialAssignments,
  onSave,
}: FacultyCourseDialogProps) {
  const [assignments, setAssignments] = useState<FacultyCourseAssignment[]>([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "panel">("table");

  // Teacher dual-list state
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  useEffect(() => {
    // Initialize all faculties with existing assignments or defaults
    const mapped = faculties.map((f) => {
      const existing = initialAssignments.find((a) => a.facultyId === f.id);
      return (
        existing || {
          facultyId: f.id,
          facultyName: f.name,
          facultyCode: f.code,
          winter: false,
          summer: false,
          teachers: [],
        }
      );
    });
    setAssignments(mapped);
    setSelectedFacultyId(null);
    setLeftSearch("");
    setRightSearch("");
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [initialAssignments, faculties, open]);

  const selectedAssignment = assignments.find(
    (a) => a.facultyId === selectedFacultyId
  );

  const isEnabled = (fId: string) => {
    const a = assignments.find((x) => x.facultyId === fId);
    return a ? a.winter || a.summer : false;
  };

  const toggleSemester = (
    facultyId: string,
    semester: "winter" | "summer",
    value: boolean
  ) => {
    setAssignments((prev) =>
      prev.map((a) =>
        a.facultyId === facultyId ? { ...a, [semester]: value } : a
      )
    );
  };

  // Teacher list builder helpers
  const currentTeachers = selectedAssignment?.teachers || [];

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

  const updateTeachers = (teachers: FacultyTeacher[]) => {
    if (!selectedFacultyId) return;
    setAssignments((prev) =>
      prev.map((a) =>
        a.facultyId === selectedFacultyId ? { ...a, teachers } : a
      )
    );
  };

  const addOne = () => {
    if (!selectedLeft) return;
    const t = availableTeachers.find((x) => x.id === selectedLeft);
    if (!t || currentTeachers.some((ct) => ct.id === t.id)) return;
    updateTeachers([
      ...currentTeachers,
      {
        id: t.id,
        name: t.name,
        role: currentTeachers.length === 0 ? "coordinator" : "lecturer",
      },
    ]);
    setSelectedLeft(null);
  };

  const addAll = () => {
    const newTeachers = available.map((t, i) => ({
      id: t.id,
      name: t.name,
      role: (currentTeachers.length === 0 && i === 0
        ? "coordinator"
        : "lecturer") as FacultyTeacher["role"],
    }));
    updateTeachers([...currentTeachers, ...newTeachers]);
    setSelectedLeft(null);
  };

  const removeOne = () => {
    if (!selectedRight) return;
    updateTeachers(currentTeachers.filter((t) => t.id !== selectedRight));
    setSelectedRight(null);
  };

  const removeAll = () => {
    updateTeachers([]);
    setSelectedRight(null);
  };

  const updateRole = (teacherId: string, role: FacultyTeacher["role"]) => {
    updateTeachers(
      currentTeachers.map((t) => (t.id === teacherId ? { ...t, role } : t))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Only save faculties that have at least one semester enabled
    onSave(assignments.filter((a) => a.winter || a.summer));
    onOpenChange(false);
  };

  const enabledCount = assignments.filter((a) => a.winter || a.summer).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[950px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-accent" />
              Faculty Availability — {courseCode}
            </DialogTitle>
            <div className="flex items-center border rounded-md mr-8">
              <Button
                type="button"
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className="rounded-r-none h-7 text-xs"
              >
                <List className="h-3.5 w-3.5 mr-1" />
                Table
              </Button>
              <Button
                type="button"
                variant={viewMode === "panel" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("panel")}
                className="rounded-l-none h-7 text-xs"
              >
                <LayoutGrid className="h-3.5 w-3.5 mr-1" />
                Panel
              </Button>
            </div>
          </div>
          <DialogDescription>
            Configure which faculties offer <strong>{courseName}</strong> and
            assign teachers per faculty.{" "}
            <Badge variant="outline" className="ml-1">
              {enabledCount} active
            </Badge>
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-hidden flex flex-col gap-3"
        >
          {viewMode === "table" ? (
            <TableView
              assignments={assignments}
              selectedFacultyId={selectedFacultyId}
              onSelectFaculty={setSelectedFacultyId}
              onToggleSemester={toggleSemester}
              availableTeachers={availableTeachers}
              // Teacher builder props
              leftSearch={leftSearch}
              setLeftSearch={setLeftSearch}
              rightSearch={rightSearch}
              setRightSearch={setRightSearch}
              selectedLeft={selectedLeft}
              setSelectedLeft={setSelectedLeft}
              selectedRight={selectedRight}
              setSelectedRight={setSelectedRight}
              available={available}
              filteredAssigned={filteredAssigned}
              currentTeachers={currentTeachers}
              addOne={addOne}
              addAll={addAll}
              removeOne={removeOne}
              removeAll={removeAll}
              updateRole={updateRole}
            />
          ) : (
            <PanelView
              assignments={assignments}
              selectedFacultyId={selectedFacultyId}
              onSelectFaculty={setSelectedFacultyId}
              onToggleSemester={toggleSemester}
              availableTeachers={availableTeachers}
              leftSearch={leftSearch}
              setLeftSearch={setLeftSearch}
              rightSearch={rightSearch}
              setRightSearch={setRightSearch}
              selectedLeft={selectedLeft}
              setSelectedLeft={setSelectedLeft}
              selectedRight={selectedRight}
              setSelectedRight={setSelectedRight}
              available={available}
              filteredAssigned={filteredAssigned}
              currentTeachers={currentTeachers}
              addOne={addOne}
              addAll={addAll}
              removeOne={removeOne}
              removeAll={removeAll}
              updateRole={updateRole}
            />
          )}

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
              Save Configuration
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Table View ─────────────────────────────────────────
interface ViewProps {
  assignments: FacultyCourseAssignment[];
  selectedFacultyId: string | null;
  onSelectFaculty: (id: string | null) => void;
  onToggleSemester: (fId: string, sem: "winter" | "summer", val: boolean) => void;
  availableTeachers: { id: string; name: string; title: string }[];
  leftSearch: string;
  setLeftSearch: (v: string) => void;
  rightSearch: string;
  setRightSearch: (v: string) => void;
  selectedLeft: string | null;
  setSelectedLeft: (v: string | null) => void;
  selectedRight: string | null;
  setSelectedRight: (v: string | null) => void;
  available: { id: string; name: string; title: string }[];
  filteredAssigned: FacultyTeacher[];
  currentTeachers: FacultyTeacher[];
  addOne: () => void;
  addAll: () => void;
  removeOne: () => void;
  removeAll: () => void;
  updateRole: (id: string, role: FacultyTeacher["role"]) => void;
}

function TableView({
  assignments,
  selectedFacultyId,
  onSelectFaculty,
  onToggleSemester,
  ...teacherProps
}: ViewProps) {
  return (
    <div className="flex gap-3 flex-1 overflow-hidden min-h-[380px]">
      {/* Faculty table */}
      <div className="w-[320px] flex flex-col border rounded-lg overflow-hidden shrink-0">
        <div className="p-3 border-b bg-muted/30">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Faculties
          </Label>
        </div>
        <ScrollArea className="flex-1">
          <div className="text-xs">
            {/* Header */}
            <div className="grid grid-cols-[1fr_60px_60px_60px] gap-1 px-3 py-2 border-b bg-muted/20 font-semibold text-muted-foreground">
              <span>Faculty</span>
              <span className="text-center">Win.</span>
              <span className="text-center">Sum.</span>
              <span className="text-center">Staff</span>
            </div>
            {assignments.map((a) => {
              const active = a.winter || a.summer;
              return (
                <div
                  key={a.facultyId}
                  className={cn(
                    "grid grid-cols-[1fr_60px_60px_60px] gap-1 px-3 py-2 border-b last:border-b-0 cursor-pointer transition-colors items-center",
                    selectedFacultyId === a.facultyId
                      ? "bg-accent/15 border-l-2 border-l-accent"
                      : "hover:bg-muted/50",
                    !active && "opacity-60"
                  )}
                  onClick={() => onSelectFaculty(a.facultyId)}
                >
                  <div>
                    <span className="font-medium">{a.facultyCode}</span>
                    <span className="text-muted-foreground ml-1 hidden sm:inline">
                      {a.facultyName.replace("Faculty of ", "")}
                    </span>
                  </div>
                  <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={a.winter}
                      onCheckedChange={(v) =>
                        onToggleSemester(a.facultyId, "winter", v)
                      }
                      className="scale-75"
                    />
                  </div>
                  <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                    <Switch
                      checked={a.summer}
                      onCheckedChange={(v) =>
                        onToggleSemester(a.facultyId, "summer", v)
                      }
                      className="scale-75"
                    />
                  </div>
                  <div className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] px-1.5",
                        a.teachers.length > 0 && "border-accent/50 text-accent"
                      )}
                    >
                      {a.teachers.length}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>

      {/* Teacher dual-list builder */}
      {selectedFacultyId ? (
        <TeacherDualList
          facultyName={
            assignments.find((a) => a.facultyId === selectedFacultyId)
              ?.facultyName || ""
          }
          {...teacherProps}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center border rounded-lg bg-muted/10">
          <div className="text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a faculty to manage teachers</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Panel View ─────────────────────────────────────────
function PanelView({
  assignments,
  selectedFacultyId,
  onSelectFaculty,
  onToggleSemester,
  ...teacherProps
}: ViewProps) {
  return (
    <div className="flex gap-3 flex-1 overflow-hidden min-h-[380px]">
      {/* Faculty list */}
      <div className="w-[220px] flex flex-col border rounded-lg overflow-hidden shrink-0">
        <div className="p-3 border-b bg-muted/30">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Faculties
          </Label>
        </div>
        <ScrollArea className="flex-1">
          {assignments.map((a) => {
            const active = a.winter || a.summer;
            return (
              <div
                key={a.facultyId}
                className={cn(
                  "px-3 py-3 cursor-pointer border-b last:border-b-0 transition-colors",
                  selectedFacultyId === a.facultyId
                    ? "bg-accent/15 border-l-2 border-l-accent"
                    : "hover:bg-muted/50",
                  !active && "opacity-50"
                )}
                onClick={() => onSelectFaculty(a.facultyId)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{a.facultyCode}</p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {a.facultyName.replace("Faculty of ", "")}
                    </p>
                  </div>
                  {active && (
                    <Badge className="bg-accent/20 text-accent text-[10px] px-1">
                      {a.teachers.length}
                    </Badge>
                  )}
                </div>
                <div
                  className="flex gap-3 mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                    <Switch
                      checked={a.winter}
                      onCheckedChange={(v) =>
                        onToggleSemester(a.facultyId, "winter", v)
                      }
                      className="scale-[0.65]"
                    />
                    Win
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground cursor-pointer">
                    <Switch
                      checked={a.summer}
                      onCheckedChange={(v) =>
                        onToggleSemester(a.facultyId, "summer", v)
                      }
                      className="scale-[0.65]"
                    />
                    Sum
                  </label>
                </div>
              </div>
            );
          })}
        </ScrollArea>
      </div>

      {/* Teacher dual-list builder */}
      {selectedFacultyId ? (
        <TeacherDualList
          facultyName={
            assignments.find((a) => a.facultyId === selectedFacultyId)
              ?.facultyName || ""
          }
          {...teacherProps}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center border rounded-lg bg-muted/10">
          <div className="text-center text-muted-foreground">
            <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Select a faculty to manage teachers</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Teacher Dual-List Builder ──────────────────────────
interface TeacherDualListProps {
  facultyName: string;
  leftSearch: string;
  setLeftSearch: (v: string) => void;
  rightSearch: string;
  setRightSearch: (v: string) => void;
  selectedLeft: string | null;
  setSelectedLeft: (v: string | null) => void;
  selectedRight: string | null;
  setSelectedRight: (v: string | null) => void;
  available: { id: string; name: string; title: string }[];
  filteredAssigned: FacultyTeacher[];
  currentTeachers: FacultyTeacher[];
  addOne: () => void;
  addAll: () => void;
  removeOne: () => void;
  removeAll: () => void;
  updateRole: (id: string, role: FacultyTeacher["role"]) => void;
}

function TeacherDualList({
  facultyName,
  leftSearch,
  setLeftSearch,
  rightSearch,
  setRightSearch,
  selectedLeft,
  setSelectedLeft,
  selectedRight,
  setSelectedRight,
  available,
  filteredAssigned,
  currentTeachers,
  addOne,
  addAll,
  removeOne,
  removeAll,
  updateRole,
}: TeacherDualListProps) {
  return (
    <div className="flex-1 flex flex-col gap-2 overflow-hidden">
      <div className="px-1">
        <p className="text-xs text-muted-foreground">
          Teachers for <strong>{facultyName}</strong>
        </p>
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
                  onDoubleClick={() => {
                    const newT: FacultyTeacher = {
                      id: t.id,
                      name: t.name,
                      role: currentTeachers.length === 0 ? "coordinator" : "lecturer",
                    };
                    // We need to call addOne indirectly — set selection then add
                    setSelectedLeft(t.id);
                    // Direct add via props isn't clean, so use double-click handler
                  }}
                >
                  <p className="text-xs font-medium">{t.name}</p>
                  <p className="text-[10px] text-muted-foreground">{t.title}</p>
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
            title="Add all"
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
            title="Add selected"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
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
        </div>

        {/* Assigned */}
        <div className="flex-[1.2] flex flex-col border rounded-lg overflow-hidden">
          <div className="p-2 border-b bg-muted/30">
            <Label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Assigned ({currentTeachers.length})
            </Label>
            <div className="relative mt-1.5">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Filter..."
                value={rightSearch}
                onChange={(e) => setRightSearch(e.target.value)}
                className="pl-7 h-7 text-xs"
              />
            </div>
          </div>
          <ScrollArea className="flex-1">
            {currentTeachers.length === 0 ? (
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
                  onDoubleClick={() => {
                    removeOne();
                  }}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium flex-1 truncate">
                      {t.name}
                    </span>
                    <Select
                      value={t.role}
                      onValueChange={(v: FacultyTeacher["role"]) =>
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
  );
}
