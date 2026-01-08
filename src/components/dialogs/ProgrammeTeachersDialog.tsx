import { useState, useEffect } from "react";
import { Users, Plus, Trash2, Search, Check } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ProgrammeTeacher {
  id: string;
  name: string;
  title: string;
}

interface ProgrammeTeachersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programmeName: string;
  programmeCode: string;
  teachers: ProgrammeTeacher[];
  availableTeachers: { id: string; name: string; title: string }[];
  onSave: (teachers: ProgrammeTeacher[]) => void;
}

export function ProgrammeTeachersDialog({
  open,
  onOpenChange,
  programmeName,
  programmeCode,
  teachers: initialTeachers,
  availableTeachers,
  onSave,
}: ProgrammeTeachersDialogProps) {
  const [teachers, setTeachers] = useState<ProgrammeTeacher[]>([]);
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

  const addSelectedTeachers = () => {
    const newTeachers: ProgrammeTeacher[] = [];
    selectedIds.forEach((id) => {
      if (!teachers.some((t) => t.id === id)) {
        const teacher = availableTeachers.find((t) => t.id === id);
        if (teacher) {
          newTeachers.push({
            id: teacher.id,
            name: teacher.name,
            title: teacher.title,
          });
        }
      }
    });
    setTeachers([...teachers, ...newTeachers]);
    setSelectedIds(new Set());
    setSearchQuery("");
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
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            Manage Programme Teachers - {programmeCode}
          </DialogTitle>
          <DialogDescription>
            Assign teachers to <strong>{programmeName}</strong>. Select multiple teachers to add them at once.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Assigned Teachers */}
          <div className="space-y-2">
            <Label>Assigned Teachers ({teachers.length})</Label>
            {teachers.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm">
                  No teachers assigned to this programme
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex items-center justify-between p-2 bg-card border rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{teacher.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {teacher.title}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTeacher(teacher.id)}
                      className="text-destructive hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Teachers - Bulk Selection */}
          <div className="space-y-2">
            <Label>Add Teachers (select multiple)</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teachers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between p-2 bg-accent/10 border border-accent/30 rounded-lg">
                <span className="text-sm text-accent font-medium">
                  {selectedIds.size} teacher{selectedIds.size !== 1 && "s"} selected
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={addSelectedTeachers}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Selected
                </Button>
              </div>
            )}

            <div className="border rounded-lg max-h-64 overflow-y-auto">
              {filteredAvailable.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery ? "No matching teachers found" : "All teachers are assigned"}
                </p>
              ) : (
                filteredAvailable.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={cn(
                      "flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0",
                      selectedIds.has(teacher.id) && "bg-accent/5"
                    )}
                    onClick={() => toggleSelection(teacher.id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(teacher.id)}
                      onCheckedChange={() => toggleSelection(teacher.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {teacher.title}
                      </p>
                    </div>
                    {selectedIds.has(teacher.id) && (
                      <Check className="h-4 w-4 text-accent" />
                    )}
                  </div>
                ))
              )}
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
