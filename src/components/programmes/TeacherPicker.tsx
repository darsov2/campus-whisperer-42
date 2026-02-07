import { useState } from "react";
import { Users, Search, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface ProgrammeCourseTeacher {
  id: string;
  name: string;
  role: "coordinator" | "lecturer" | "assistant";
}

export interface AvailableTeacher {
  id: string;
  name: string;
  title: string;
}

const roleLabels: Record<ProgrammeCourseTeacher["role"], string> = {
  coordinator: "Coordinator",
  lecturer: "Lecturer",
  assistant: "Assistant",
};

const roleColors: Record<ProgrammeCourseTeacher["role"], string> = {
  coordinator: "bg-accent text-accent-foreground",
  lecturer: "bg-info/20 text-info",
  assistant: "bg-muted text-muted-foreground",
};

interface TeacherPickerProps {
  teachers: ProgrammeCourseTeacher[];
  availableTeachers: AvailableTeacher[];
  onChange: (teachers: ProgrammeCourseTeacher[]) => void;
}

export function TeacherPicker({
  teachers,
  availableTeachers,
  onChange,
}: TeacherPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const addTeacher = (teacher: AvailableTeacher) => {
    if (teachers.some((t) => t.id === teacher.id)) return;
    onChange([
      ...teachers,
      {
        id: teacher.id,
        name: teacher.name,
        role: teachers.length === 0 ? "coordinator" : "lecturer",
      },
    ]);
    setSearchQuery("");
  };

  const updateRole = (teacherId: string, role: ProgrammeCourseTeacher["role"]) => {
    onChange(teachers.map((t) => (t.id === teacherId ? { ...t, role } : t)));
  };

  const removeTeacher = (teacherId: string) => {
    onChange(teachers.filter((t) => t.id !== teacherId));
  };

  const filteredAvailable = availableTeachers.filter(
    (t) =>
      !teachers.some((assigned) => assigned.id === t.id) &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        Teachers
      </Label>

      {/* Assigned teachers */}
      {teachers.length > 0 && (
        <div className="space-y-2">
          {teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="flex items-center gap-2 p-2 bg-card border rounded-lg"
            >
              <span className="flex-1 text-sm font-medium truncate">
                {teacher.name}
              </span>
              <Select
                value={teacher.role}
                onValueChange={(v: ProgrammeCourseTeacher["role"]) =>
                  updateRole(teacher.id, v)
                }
              >
                <SelectTrigger className="w-[130px] h-8 text-xs">
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
      )}

      {/* Search & add */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search teachers to add..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-9"
        />
      </div>

      {searchQuery && filteredAvailable.length > 0 && (
        <div className="border rounded-lg max-h-36 overflow-y-auto">
          {filteredAvailable.slice(0, 5).map((teacher) => (
            <div
              key={teacher.id}
              className="flex items-center justify-between p-2.5 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0"
              onClick={() => addTeacher(teacher)}
            >
              <div>
                <p className="text-sm font-medium">{teacher.name}</p>
                <p className="text-xs text-muted-foreground">{teacher.title}</p>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
      {searchQuery && filteredAvailable.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-2">
          No matching teachers found
        </p>
      )}

      {teachers.length === 0 && !searchQuery && (
        <p className="text-xs text-muted-foreground">
          Search above to assign teachers to this course
        </p>
      )}
    </div>
  );
}
