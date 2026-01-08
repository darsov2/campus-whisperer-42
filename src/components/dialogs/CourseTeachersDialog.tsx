import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Search } from "lucide-react";
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

  useEffect(() => {
    setTeachers(initialTeachers);
    setSearchQuery("");
  }, [initialTeachers, open]);

  const addTeacher = (teacherId: string, name: string) => {
    if (teachers.some((t) => t.id === teacherId)) return;

    const newTeacher: CourseTeacher = {
      id: teacherId,
      name,
      role: teachers.length === 0 ? "coordinator" : "lecturer",
    };
    setTeachers([...teachers, newTeacher]);
    setSearchQuery("");
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

  const filteredAvailable = availableTeachers.filter(
    (t) =>
      !teachers.some((assigned) => assigned.id === t.id) &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Manage Teachers - {courseCode}
          </DialogTitle>
          <DialogDescription>
            Assign teachers and their roles for <strong>{courseName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assigned Teachers */}
          <div className="space-y-2">
            <Label>Assigned Teachers</Label>
            {teachers.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">
                  No teachers assigned
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center gap-3 p-3 bg-card border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{teacher.name}</p>
                    </div>
                    <Select
                      value={teacher.role}
                      onValueChange={(value: CourseTeacher["role"]) =>
                        updateRole(teacher.id, value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coordinator">
                          Course Coordinator
                        </SelectItem>
                        <SelectItem value="lecturer">Lecturer</SelectItem>
                        <SelectItem value="assistant">
                          Teaching Assistant
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge className={cn("text-xs", roleColors[teacher.role])}>
                      {roleLabels[teacher.role]}
                    </Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeacher(teacher.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Teacher */}
          <div className="space-y-2">
            <Label>Add Teacher</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchQuery && filteredAvailable.length > 0 && (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {filteredAvailable.slice(0, 5).map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => addTeacher(teacher.id, teacher.name)}
                  >
                    <div>
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.title}
                      </p>
                    </div>
                    <Button type="button" variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {searchQuery && filteredAvailable.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No matching teachers found
              </p>
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
