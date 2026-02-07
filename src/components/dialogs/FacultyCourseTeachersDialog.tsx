import { useState, useEffect } from "react";
import { Building2, Users, Plus, Trash2, Search } from "lucide-react";
import { NativeModal } from "@/components/ui/native-modal";
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

export interface FacultyCourseTeacher {
  id: string;
  name: string;
  faculty: string;
  role: "coordinator" | "lecturer" | "assistant";
}

interface FacultyCourseTeachersDialogProps {
  open: boolean;
  onClose: () => void;
  courseName: string;
  courseCode: string;
  faculties: string[];
  teachers: FacultyCourseTeacher[];
  availableTeachers: { id: string; name: string; title: string; faculty: string }[];
  onSave: (teachers: FacultyCourseTeacher[]) => void;
}

const roleLabels = {
  coordinator: "Coordinator",
  lecturer: "Lecturer",
  assistant: "Assistant",
};

const roleColors = {
  coordinator: "bg-accent text-accent-foreground",
  lecturer: "bg-info/20 text-info",
  assistant: "bg-muted text-muted-foreground",
};

export function FacultyCourseTeachersDialog({
  open,
  onClose,
  courseName,
  courseCode,
  faculties,
  teachers: initialTeachers,
  availableTeachers,
  onSave,
}: FacultyCourseTeachersDialogProps) {
  const [teachers, setTeachers] = useState<FacultyCourseTeacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");

  useEffect(() => {
    if (open) {
      setTeachers(initialTeachers);
      setSearchQuery("");
      setFacultyFilter("all");
    }
  }, [initialTeachers, open]);

  const addTeacher = (teacher: { id: string; name: string; faculty: string }) => {
    if (teachers.some((t) => t.id === teacher.id && t.faculty === teacher.faculty)) return;
    setTeachers([...teachers, { id: teacher.id, name: teacher.name, faculty: teacher.faculty, role: "lecturer" }]);
    setSearchQuery("");
  };

  const updateRole = (teacherId: string, faculty: string, role: FacultyCourseTeacher["role"]) => {
    setTeachers(teachers.map((t) => (t.id === teacherId && t.faculty === faculty ? { ...t, role } : t)));
  };

  const removeTeacher = (teacherId: string, faculty: string) => {
    setTeachers(teachers.filter((t) => !(t.id === teacherId && t.faculty === faculty)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(teachers);
    onClose();
  };

  const filteredAvailable = availableTeachers.filter(
    (t) =>
      !teachers.some((assigned) => assigned.id === t.id && assigned.faculty === t.faculty) &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.title.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (facultyFilter === "all" || t.faculty === facultyFilter)
  );

  const teachersByFaculty = faculties.reduce((acc, fac) => {
    const facTeachers = teachers.filter((t) => t.faculty === fac);
    if (facTeachers.length > 0) acc[fac] = facTeachers;
    return acc;
  }, {} as Record<string, FacultyCourseTeacher[]>);

  return (
    <NativeModal
      open={open}
      onClose={onClose}
      title={`Faculty Teachers - ${courseCode}`}
      description={`Assign which teachers teach ${courseName} at each faculty. This is independent from programme-level assignments.`}
      icon={<Building2 className="h-5 w-5 text-accent" />}
      className="max-w-[700px] max-h-[85vh]"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        {/* Assigned Teachers by Faculty */}
        <div className="space-y-3">
          <Label>Assigned Teachers</Label>
          {Object.keys(teachersByFaculty).length === 0 ? (
            <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground text-sm">No faculty-level teachers assigned</p>
            </div>
          ) : (
            Object.entries(teachersByFaculty).map(([fac, facTeachers]) => (
              <div key={fac} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">{fac}</span>
                </div>
                {facTeachers.map((teacher) => (
                  <div key={`${teacher.id}-${teacher.faculty}`} className="flex items-center gap-3 p-3 bg-card border rounded-lg ml-5">
                    <div className="flex-1"><p className="font-medium text-sm">{teacher.name}</p></div>
                    <Select value={teacher.role} onValueChange={(value: FacultyCourseTeacher["role"]) => updateRole(teacher.id, teacher.faculty, value)}>
                      <SelectTrigger className="w-[150px] h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="coordinator">Coordinator</SelectItem>
                        <SelectItem value="lecturer">Lecturer</SelectItem>
                        <SelectItem value="assistant">Assistant</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge className={cn("text-xs", roleColors[teacher.role])}>{roleLabels[teacher.role]}</Badge>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeTeacher(teacher.id, teacher.faculty)} className="text-destructive hover:text-destructive h-7 w-7 p-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Add Teacher */}
        <div className="space-y-2">
          <Label>Add Teacher</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search teachers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder="All faculties" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {faculties.map((f) => (<SelectItem key={f} value={f}>{f}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          {searchQuery && filteredAvailable.length > 0 && (
            <div className="border rounded-lg max-h-48 overflow-y-auto">
              {filteredAvailable.slice(0, 8).map((teacher) => (
                <div key={`${teacher.id}-${teacher.faculty}`} className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0" onClick={() => addTeacher({ id: teacher.id, name: teacher.name, faculty: teacher.faculty })}>
                  <div>
                    <p className="font-medium text-sm">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground">{teacher.title} • {teacher.faculty}</p>
                  </div>
                  <Button type="button" variant="ghost" size="sm"><Plus className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
          {searchQuery && filteredAvailable.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-3">No matching teachers found</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Faculty Teachers</Button>
        </div>
      </form>
    </NativeModal>
  );
}
