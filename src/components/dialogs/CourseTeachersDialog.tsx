import { useState, useEffect } from "react";
import { Users, Trash2, Search, Check } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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

const roleLabels = {
  coordinator: "Course Coordinator",
  lecturer: "Lecturer",
  assistant: "Teaching Assistant",
};

const roleColors = {
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setTeachers(initialTeachers);
    setSearchQuery("");
    setSelectedIds(new Set());
  }, [initialTeachers, open]);

  const toggleSelection = (teacherId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(teacherId)) {
        next.delete(teacherId);
      } else {
        next.add(teacherId);
      }
      return next;
    });
  };

  const addSelected = () => {
    const newTeachers: CourseTeacher[] = [];
    selectedIds.forEach((id) => {
      if (!teachers.some((t) => t.id === id)) {
        const teacher = availableTeachers.find((t) => t.id === id);
        if (teacher) {
          newTeachers.push({
            id: teacher.id,
            name: teacher.name,
            role: teachers.length === 0 && newTeachers.length === 0 ? "coordinator" : "lecturer",
          });
        }
      }
    });
    setTeachers([...teachers, ...newTeachers]);
    setSelectedIds(new Set());
  };

  const updateRole = (teacherId: string, role: CourseTeacher["role"]) => {
    setTeachers(
      teachers.map((t) => (t.id === teacherId ? { ...t, role } : t))
    );
  };

  const removeTeacher = (teacherId: string) => {
    setTeachers(teachers.filter((t) => t.id !== teacherId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(teachers);
    onOpenChange(false);
  };

  const unassigned = availableTeachers.filter(
    (t) =>
      !teachers.some((assigned) => assigned.id === t.id) &&
      (searchQuery === "" ||
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Manage Teachers - {courseCode}
          </DialogTitle>
          <DialogDescription>
            Assign teachers and their roles for <strong>{courseName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Assigned Teachers */}
          <div className="space-y-2">
            <Label>Assigned Teachers ({teachers.length})</Label>
            {teachers.length === 0 ? (
              <div className="text-center py-4 border border-dashed rounded-lg bg-muted/20">
                <Users className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                <p className="text-muted-foreground text-sm">
                  No teachers assigned — select from the list below
                </p>
              </div>
            ) : (
              <ScrollArea className="max-h-48">
                <div className="space-y-2 pr-3">
                  {teachers.map((teacher) => (
                    <div
                      key={teacher.id}
                      className="flex items-center gap-2 p-2.5 bg-card border rounded-lg"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{teacher.name}</p>
                      </div>
                      <Select
                        value={teacher.role}
                        onValueChange={(value: CourseTeacher["role"]) =>
                          updateRole(teacher.id, value)
                        }
                      >
                        <SelectTrigger className="w-[150px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="coordinator">Coordinator</SelectItem>
                          <SelectItem value="lecturer">Lecturer</SelectItem>
                          <SelectItem value="assistant">Assistant</SelectItem>
                        </SelectContent>
                      </Select>
                      <Badge className={cn("text-xs shrink-0", roleColors[teacher.role])}>
                        {roleLabels[teacher.role]}
                      </Badge>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeTeacher(teacher.id)}
                        className="text-destructive hover:text-destructive h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Available Teachers */}
          <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between">
              <Label>Available Teachers ({unassigned.length})</Label>
              {selectedIds.size > 0 && (
                <Button
                  type="button"
                  size="sm"
                  onClick={addSelected}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground h-7 text-xs"
                >
                  <Check className="h-3.5 w-3.5 mr-1" />
                  Add {selectedIds.size} selected
                </Button>
              )}
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9"
              />
            </div>

            <ScrollArea className="flex-1 border rounded-lg">
              {unassigned.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">
                  {searchQuery ? "No matching teachers found" : "All teachers are assigned"}
                </p>
              ) : (
                <div>
                  {unassigned.map((teacher) => (
                    <div
                      key={teacher.id}
                      className={cn(
                        "flex items-center gap-3 p-3 cursor-pointer transition-colors border-b last:border-b-0",
                        selectedIds.has(teacher.id)
                          ? "bg-accent/10"
                          : "hover:bg-muted/50"
                      )}
                      onClick={() => toggleSelection(teacher.id)}
                    >
                      <Checkbox
                        checked={selectedIds.has(teacher.id)}
                        onCheckedChange={() => toggleSelection(teacher.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{teacher.name}</p>
                        <p className="text-xs text-muted-foreground">{teacher.title}</p>
                      </div>
                      {selectedIds.has(teacher.id) && (
                        <Check className="h-4 w-4 text-accent shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
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
