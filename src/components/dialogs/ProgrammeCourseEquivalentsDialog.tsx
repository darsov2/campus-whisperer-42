import { useEffect, useMemo, useState } from "react";
import { Search, Plus, X, Link2 } from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface EquivalentCourseRef {
  id: string;
  code: string;
  name: string;
  ects: number;
}

interface ProgrammeCourseEquivalentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseCode: string;
  courseName: string;
  ects: number;
  equivalents: EquivalentCourseRef[];
  catalog: EquivalentCourseRef[];
  onSave: (equivalents: EquivalentCourseRef[]) => void;
}

export function ProgrammeCourseEquivalentsDialog({
  open,
  onOpenChange,
  courseCode,
  courseName,
  ects,
  equivalents,
  catalog,
  onSave,
}: ProgrammeCourseEquivalentsDialogProps) {
  const [selected, setSelected] = useState<EquivalentCourseRef[]>(equivalents);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setSelected(equivalents);
      setSearch("");
    }
  }, [open, equivalents]);

  const selectedIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return catalog.filter(
      (c) =>
        !selectedIds.has(c.id) &&
        (!q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)),
    );
  }, [catalog, selectedIds, search]);

  const add = (c: EquivalentCourseRef) => setSelected((s) => [...s, c]);
  const remove = (id: string) => setSelected((s) => s.filter((c) => c.id !== id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-accent" />
            Equivalent Courses
          </DialogTitle>
          <DialogDescription>
            Define which courses from the catalog are considered equivalent to{" "}
            <span className="font-medium text-foreground">{courseCode} – {courseName}</span> ({ects} ECTS).
            Used during student programme transfers to auto-match passed exams.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Selected */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-sm font-medium">Equivalents</span>
              <Badge variant="secondary">{selected.length}</Badge>
            </div>
            <ScrollArea className="h-[340px]">
              <div className="p-2 space-y-1.5">
                {selected.length === 0 && (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    No equivalents yet.
                    <br />
                    Pick courses from the catalog →
                  </div>
                )}
                {selected.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-2 rounded-md border p-2 bg-card"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                        <span className="text-xs text-muted-foreground">· {c.ects} ECTS</span>
                      </div>
                      <p className="text-sm truncate">{c.name}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => remove(c.id)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Catalog */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b bg-muted/30">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search catalog…"
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>
            <ScrollArea className="h-[340px]">
              <div className="p-2 space-y-1.5">
                {filtered.length === 0 && (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    No courses match.
                  </div>
                )}
                {filtered.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => add(c)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 rounded-md border p-2 text-left",
                      "hover:border-primary/50 hover:bg-accent/40 transition-colors",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                        <span className="text-xs text-muted-foreground">· {c.ects} ECTS</span>
                      </div>
                      <p className="text-sm truncate">{c.name}</p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              onSave(selected);
              onOpenChange(false);
              toast.success(`Equivalents updated for ${courseCode}`);
            }}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
