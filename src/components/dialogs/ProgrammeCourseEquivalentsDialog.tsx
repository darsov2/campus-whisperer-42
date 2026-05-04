import { useEffect, useMemo, useState } from "react";
import { Search, Plus, X, Link2, Layers, ArrowRight } from "lucide-react";
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

// A group = one alternative way to fulfil this programme course.
// 1 course in the group = simple 1:1 equivalence.
// >1 course in the group = combined equivalence (those courses TOGETHER are equivalent).
export interface EquivalentGroup {
  id: string;
  courses: EquivalentCourseRef[];
}

interface ProgrammeCourseEquivalentsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseCode: string;
  courseName: string;
  ects: number;
  equivalents: EquivalentGroup[];
  catalog: EquivalentCourseRef[];
  onSave: (equivalents: EquivalentGroup[]) => void;
}

function newGroupId() {
  return `eg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
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
  const [groups, setGroups] = useState<EquivalentGroup[]>(equivalents);
  const [search, setSearch] = useState("");
  const [activeGroupId, setActiveGroupId] = useState<string | null>(
    equivalents[0]?.id ?? null,
  );

  useEffect(() => {
    if (open) {
      setGroups(equivalents);
      setSearch("");
      setActiveGroupId(equivalents[0]?.id ?? null);
    }
  }, [open, equivalents]);

  const activeGroup = groups.find((g) => g.id === activeGroupId) ?? null;

  // Courses already used in the active group cannot be added again to it.
  const usedInActiveGroup = useMemo(
    () => new Set(activeGroup?.courses.map((c) => c.id) ?? []),
    [activeGroup],
  );

  const filteredCatalog = useMemo(() => {
    const q = search.toLowerCase();
    return catalog.filter(
      (c) =>
        !usedInActiveGroup.has(c.id) &&
        (!q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)),
    );
  }, [catalog, usedInActiveGroup, search]);

  const addGroup = () => {
    const g: EquivalentGroup = { id: newGroupId(), courses: [] };
    setGroups((prev) => [...prev, g]);
    setActiveGroupId(g.id);
  };

  const removeGroup = (id: string) => {
    setGroups((prev) => {
      const next = prev.filter((g) => g.id !== id);
      if (activeGroupId === id) setActiveGroupId(next[0]?.id ?? null);
      return next;
    });
  };

  const addCourseToActive = (c: EquivalentCourseRef) => {
    if (!activeGroup) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroup.id ? { ...g, courses: [...g.courses, c] } : g,
      ),
    );
  };

  const removeCourseFromGroup = (groupId: string, courseId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, courses: g.courses.filter((c) => c.id !== courseId) } : g,
      ),
    );
  };

  const totalGroupEcts = (g: EquivalentGroup) => g.courses.reduce((s, c) => s + c.ects, 0);

  const handleSave = () => {
    const cleaned = groups.filter((g) => g.courses.length > 0);
    onSave(cleaned);
    onOpenChange(false);
    toast.success(`Equivalents updated for ${courseCode}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-accent" />
            Equivalent Courses
          </DialogTitle>
          <DialogDescription>
            Define equivalence options for{" "}
            <span className="font-medium text-foreground">
              {courseCode} – {courseName}
            </span>{" "}
            ({ects} ECTS). Each <span className="font-medium text-foreground">group</span> is one
            alternative — a single course, or multiple courses that <em>together</em> fulfil this
            programme course.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-4">
          {/* Groups list */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Equivalence groups
              </span>
              <Badge variant="secondary">{groups.length}</Badge>
            </div>
            <ScrollArea className="h-[380px]">
              <div className="p-2 space-y-1.5">
                {groups.length === 0 && (
                  <div className="text-center py-10 text-xs text-muted-foreground">
                    No groups yet.
                  </div>
                )}
                {groups.map((g, i) => {
                  const isActive = g.id === activeGroupId;
                  const ectsSum = totalGroupEcts(g);
                  const ectsTone =
                    ectsSum === 0
                      ? "text-muted-foreground"
                      : ectsSum < ects
                      ? "text-warning"
                      : "text-success";
                  return (
                    <button
                      key={g.id}
                      onClick={() => setActiveGroupId(g.id)}
                      className={cn(
                        "w-full text-left rounded-md border p-2.5 transition-colors",
                        isActive
                          ? "border-primary/60 bg-primary/5"
                          : "hover:border-primary/30 hover:bg-accent/40",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-[10px]">
                            {i + 1}
                          </span>
                          {g.courses.length === 0
                            ? "Empty group"
                            : g.courses.length === 1
                            ? "Single course"
                            : `${g.courses.length} courses · combined`}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeGroup(g.id);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className={cn("text-[11px] mt-1", ectsTone)}>
                        {ectsSum} / {ects} ECTS
                      </div>
                      {g.courses.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {g.courses.map((c) => (
                            <span
                              key={c.id}
                              className="text-[10px] font-mono bg-background border rounded px-1.5 py-0.5"
                            >
                              {c.code}
                            </span>
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="p-2 border-t">
              <Button variant="outline" size="sm" className="w-full" onClick={addGroup}>
                <Plus className="h-3.5 w-3.5" />
                Add equivalence group
              </Button>
            </div>
          </div>

          {/* Group editor */}
          <div className="border rounded-lg overflow-hidden flex flex-col">
            {!activeGroup ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-sm text-muted-foreground p-8 gap-2">
                <Layers className="h-8 w-8 opacity-40" />
                <p>Add or pick an equivalence group to start.</p>
              </div>
            ) : (
              <>
                <div className="px-3 py-2 border-b bg-muted/30">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Group contents</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{courseCode}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {activeGroup.courses.length <= 1
                      ? "Add a second course to mark this as a combined equivalence."
                      : "All listed courses are required together."}
                  </p>
                </div>

                {/* Selected courses in group */}
                <div className="p-3 border-b min-h-[90px]">
                  {activeGroup.courses.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-4">
                      Pick courses from the catalog below.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {activeGroup.courses.map((c, i) => (
                        <div
                          key={c.id}
                          className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs"
                        >
                          {i > 0 && (
                            <span className="text-[10px] uppercase font-semibold text-accent mr-0.5">
                              + and
                            </span>
                          )}
                          <span className="font-mono text-muted-foreground">{c.code}</span>
                          <span>{c.name}</span>
                          <span className="text-muted-foreground">· {c.ects} ECTS</span>
                          <button
                            onClick={() => removeCourseFromGroup(activeGroup.id, c.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Catalog picker */}
                <div className="px-3 py-2 border-b">
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
                <ScrollArea className="h-[180px]">
                  <div className="p-2 space-y-1">
                    {filteredCatalog.length === 0 && (
                      <div className="text-center py-8 text-xs text-muted-foreground">
                        No courses match.
                      </div>
                    )}
                    {filteredCatalog.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => addCourseToActive(c)}
                        className="w-full flex items-center justify-between gap-2 rounded-md border p-2 text-left hover:border-primary/50 hover:bg-accent/40"
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
              </>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
