import { useState, useEffect } from "react";
import {
  Users,
  Trash2,
  Search,
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export interface CourseTeacher {
  id: string;
  name: string;
  role: "coordinator" | "lecturer" | "assistant";
}

interface CourseTeachersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  courseCode: string;
  teachers: CourseTeacher[];
  availableTeachers: { id: string; name: string; title: string }[];
  onSave: (teachers: CourseTeacher[]) => void;
}

const roleLabels: Record<CourseTeacher["role"], string> = {
  coordinator: "Coordinator",
  lecturer: "Lecturer",
  assistant: "Assistant",
};

const roleColors: Record<CourseTeacher["role"], string> = {
  coordinator: "bg-accent text-accent-foreground",
  lecturer: "bg-info/20 text-info",
  assistant: "bg-muted text-muted-foreground",
};

export function CourseTeachersDialog({
  open,
  onOpenChange,
  courseName,
  courseCode,
  teachers: initialTeachers,
  availableTeachers,
  onSave,
}: CourseTeachersDialogProps) {
  const [teachers, setTeachers] = useState<CourseTeacher[]>([]);
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);

  useEffect(() => {
    setTeachers(initialTeachers);
    setLeftSearch("");
    setRightSearch("");
    setSelectedLeft(null);
    setSelectedRight(null);
  }, [initialTeachers, open]);

  // Available = not yet assigned
  const available = availableTeachers.filter(
    (t) =>
      !teachers.some((assigned) => assigned.id === t.id) &&
      (leftSearch === "" ||
        t.name.toLowerCase().includes(leftSearch.toLowerCase()) ||
        t.title.toLowerCase().includes(leftSearch.toLowerCase()))
  );

  const filteredAssigned = teachers.filter(
    (t) =>
      rightSearch === "" ||
      t.name.toLowerCase().includes(rightSearch.toLowerCase())
  );

  const addOne = () => {
    if (!selectedLeft) return;
    const teacher = availableTeachers.find((t) => t.id === selectedLeft);
    if (!teacher || teachers.some((t) => t.id === teacher.id)) return;
    setTeachers([
      ...teachers,
      {
        id: teacher.id,
        name: teacher.name,
        role: teachers.length === 0 ? "coordinator" : "lecturer",
      },
    ]);
    setSelectedLeft(null);
  };

  const addAll = () => {
    const newTeachers = available.map((t, i) => ({
      id: t.id,
      name: t.name,
      role: (teachers.length === 0 && i === 0 ? "coordinator" : "lecturer") as CourseTeacher["role"],
    }));
    setTeachers([...teachers, ...newTeachers]);
    setSelectedLeft(null);
  };

  const removeOne = () => {
    if (!selectedRight) return;
    setTeachers(teachers.filter((t) => t.id !== selectedRight));
    setSelectedRight(null);
  };

  const removeAll = () => {
    setTeachers([]);
    setSelectedRight(null);
  };

  const updateRole = (teacherId: string, role: CourseTeacher["role"]) => {
    setTeachers(teachers.map((t) => (t.id === teacherId ? { ...t, role } : t)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(teachers);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Manage Teachers - {courseCode}
          </DialogTitle>
          <DialogDescription>
            Assign teachers and their roles for <strong>{courseName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col gap-4">
          <div className="flex-1 flex gap-3 overflow-hidden min-h-[350px]">
            {/* Left: Available */}
            <div className="flex-1 flex flex-col border rounded-lg overflow-hidden">
              <div className="p-3 border-b bg-muted/30">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Available ({available.length})
                </Label>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter..."
                    value={leftSearch}
                    onChange={(e) => setLeftSearch(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {available.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    {leftSearch ? "No matches" : "All teachers assigned"}
                  </p>
                ) : (
                  available.map((teacher) => (
                    <div
                      key={teacher.id}
                      className={cn(
                        "px-3 py-2.5 cursor-pointer border-b last:border-b-0 transition-colors",
                        selectedLeft === teacher.id
                          ? "bg-accent/15 border-l-2 border-l-accent"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedLeft(teacher.id)}
                      onDoubleClick={() => {
                        setTeachers([
                          ...teachers,
                          {
                            id: teacher.id,
                            name: teacher.name,
                            role: teachers.length === 0 ? "coordinator" : "lecturer",
                          },
                        ]);
                      }}
                    >
                      <p className="text-sm font-medium">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground">{teacher.title}</p>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>

            {/* Center: Controls */}
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={addAll}
                disabled={available.length === 0}
                title="Add all"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={addOne}
                disabled={!selectedLeft}
                title="Add selected"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={removeOne}
                disabled={!selectedRight}
                title="Remove selected"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                onClick={removeAll}
                disabled={teachers.length === 0}
                title="Remove all"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
            </div>

            {/* Right: Assigned */}
            <div className="flex-[1.3] flex flex-col border rounded-lg overflow-hidden">
              <div className="p-3 border-b bg-muted/30">
                <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Assigned ({teachers.length})
                </Label>
                <div className="relative mt-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Filter..."
                    value={rightSearch}
                    onChange={(e) => setRightSearch(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                {teachers.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No teachers assigned</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select from the left or double-click to add
                    </p>
                  </div>
                ) : filteredAssigned.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No matches</p>
                ) : (
                  filteredAssigned.map((teacher) => (
                    <div
                      key={teacher.id}
                      className={cn(
                        "px-3 py-2 cursor-pointer border-b last:border-b-0 transition-colors",
                        selectedRight === teacher.id
                          ? "bg-accent/15 border-l-2 border-l-accent"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => setSelectedRight(teacher.id)}
                      onDoubleClick={() => {
                        setTeachers(teachers.filter((t) => t.id !== teacher.id));
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium flex-1 truncate">
                          {teacher.name}
                        </span>
                        <Select
                          value={teacher.role}
                          onValueChange={(v: CourseTeacher["role"]) =>
                            updateRole(teacher.id, v)
                          }
                        >
                          <SelectTrigger
                            className="w-[120px] h-7 text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="coordinator">Coordinator</SelectItem>
                            <SelectItem value="lecturer">Lecturer</SelectItem>
                            <SelectItem value="assistant">Assistant</SelectItem>
                          </SelectContent>
                        </Select>
                        <Badge className={cn("text-[10px] shrink-0 px-1.5", roleColors[teacher.role])}>
                          {roleLabels[teacher.role]}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
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
