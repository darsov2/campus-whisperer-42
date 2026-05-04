import { useEffect, useMemo, useState } from "react";
import { Search, Plus, X, Link2, Layers, ArrowLeft } from "lucide-react";
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
// 1 course in the group = simple 1:1 equivalence (the default).
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

type Mode =
  | { kind: "list" }
  | { kind: "pickSingle" }
  | { kind: "editGroup"; groupId: string };

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
  const [mode, setMode] = useState<Mode>({ kind: "list" });
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (open) {
      setGroups(equivalents);
      setMode({ kind: "list" });
      setSearch("");
    }
  }, [open, equivalents]);

  const activeGroup =
    mode.kind === "editGroup" ? groups.find((g) => g.id === mode.groupId) ?? null : null;

  // For "pick single" we don't allow already-used single courses to be re-picked.
  const usedSingleIds = useMemo(() => {
    const s = new Set<string>();
    groups.forEach((g) => {
      if (g.courses.length === 1) s.add(g.courses[0].id);
    });
    return s;
  }, [groups]);

  const usedInActiveGroup = useMemo(
    () => new Set(activeGroup?.courses.map((c) => c.id) ?? []),
    [activeGroup],
  );

  const filteredForSingle = useMemo(() => {
    const q = search.toLowerCase();
    return catalog.filter(
      (c) =>
        !usedSingleIds.has(c.id) &&
        (!q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)),
    );
  }, [catalog, usedSingleIds, search]);

  const filteredForGroup = useMemo(() => {
    const q = search.toLowerCase();
    return catalog.filter(
      (c) =>
        !usedInActiveGroup.has(c.id) &&
        (!q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)),
    );
  }, [catalog, usedInActiveGroup, search]);

  const addSingle = (c: EquivalentCourseRef) => {
    setGroups((prev) => [...prev, { id: newGroupId(), courses: [c] }]);
    setMode({ kind: "list" });
    setSearch("");
  };

  const startCombined = () => {
    const g: EquivalentGroup = { id: newGroupId(), courses: [] };
    setGroups((prev) => [...prev, g]);
    setMode({ kind: "editGroup", groupId: g.id });
    setSearch("");
  };

  const removeGroup = (id: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== id));
  };

  const removeCourseFromGroup = (groupId: string, courseId: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, courses: g.courses.filter((c) => c.id !== courseId) }
          : g,
      ),
    );
  };

  const addCourseToActive = (c: EquivalentCourseRef) => {
    if (!activeGroup) return;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === activeGroup.id ? { ...g, courses: [...g.courses, c] } : g,
      ),
    );
  };

  const promoteToCombined = (groupId: string) => {
    setMode({ kind: "editGroup", groupId });
    setSearch("");
  };

  const totalGroupEcts = (g: EquivalentGroup) => g.courses.reduce((s, c) => s + c.ects, 0);

  const handleSave = () => {
    const cleaned = groups.filter((g) => g.courses.length > 0);
    onSave(cleaned);
    onOpenChange(false);
    toast.success(`Equivalents updated for ${courseCode}`);
  };

  const singleAlternatives = groups.filter((g) => g.courses.length === 1);
  const combinedAlternatives = groups.filter((g) => g.courses.length !== 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-accent" />
            Equivalent Courses
          </DialogTitle>
          <DialogDescription>
            Define equivalents for{" "}
            <span className="font-medium text-foreground">
              {courseCode} – {courseName}
            </span>{" "}
            ({ects} ECTS). Each entry is one alternative that fulfils this course.
          </DialogDescription>
        </DialogHeader>

        {/* LIST MODE */}
        {mode.kind === "list" && (
          <div className="space-y-4">
            {/* Single equivalents */}
            <div className="border rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
                <span className="text-sm font-medium">Equivalent courses</span>
                <Badge variant="secondary">{singleAlternatives.length}</Badge>
              </div>
              <div className="p-3 min-h-[80px]">
                {singleAlternatives.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No equivalents yet. Add one below.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {singleAlternatives.map((g) => {
                      const c = g.courses[0];
                      return (
                        <div
                          key={g.id}
                          className="inline-flex items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs"
                        >
                          <span className="font-mono text-muted-foreground">{c.code}</span>
                          <span>{c.name}</span>
                          <span className="text-muted-foreground">· {c.ects} ECTS</span>
                          <button
                            onClick={() => removeGroup(g.id)}
                            className="text-muted-foreground hover:text-destructive ml-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="p-2 border-t bg-muted/10">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setMode({ kind: "pickSingle" });
                    setSearch("");
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add equivalent course
                </Button>
              </div>
            </div>

            {/* Combined equivalents (advanced) */}
            <div className="border rounded-lg overflow-hidden">
              <div className="px-3 py-2 border-b bg-muted/30 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Layers className="h-3.5 w-3.5" />
                  Combined equivalents
                  <span className="text-[10px] font-normal text-muted-foreground ml-1">
                    (multiple courses together)
                  </span>
                </div>
                <Badge variant="secondary">{combinedAlternatives.length}</Badge>
              </div>
              <div className="p-3 space-y-2">
                {combinedAlternatives.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-2">
                    Use this only when two or more courses together count as one equivalent.
                  </p>
                ) : (
                  combinedAlternatives.map((g, i) => {
                    const sum = totalGroupEcts(g);
                    const tone =
                      sum === 0
                        ? "text-muted-foreground"
                        : sum < ects
                        ? "text-warning"
                        : "text-success";
                    return (
                      <div
                        key={g.id}
                        className="rounded-md border p-2.5 hover:border-primary/40 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-muted text-[10px]">
                              {i + 1}
                            </span>
                            {g.courses.length === 0
                              ? "Empty group"
                              : `${g.courses.length} courses · combined`}
                            <span className={cn("text-[11px]", tone)}>
                              · {sum} / {ects} ECTS
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-xs"
                              onClick={() =>
                                setMode({ kind: "editGroup", groupId: g.id })
                              }
                            >
                              Edit
                            </Button>
                            <button
                              onClick={() => removeGroup(g.id)}
                              className="text-muted-foreground hover:text-destructive p-1"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                        {g.courses.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {g.courses.map((c, idx) => (
                              <span
                                key={c.id}
                                className="inline-flex items-center gap-1 rounded border bg-background px-1.5 py-0.5 text-[11px]"
                              >
                                {idx > 0 && (
                                  <span className="text-[9px] uppercase font-semibold text-accent">
                                    + and
                                  </span>
                                )}
                                <span className="font-mono text-muted-foreground">
                                  {c.code}
                                </span>
                                <span>{c.name}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              <div className="p-2 border-t bg-muted/10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={startCombined}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add combined equivalence
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* PICK SINGLE MODE */}
        {mode.kind === "pickSingle" && (
          <div className="border rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b bg-muted/30 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => setMode({ kind: "list" })}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <span className="text-sm font-medium">Pick an equivalent course</span>
            </div>
            <div className="px-3 py-2 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search catalog…"
                  className="pl-8 h-8 text-sm"
                  autoFocus
                />
              </div>
            </div>
            <ScrollArea className="h-[320px]">
              <div className="p-2 space-y-1">
                {filteredForSingle.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No courses match.
                  </div>
                )}
                {filteredForSingle.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => addSingle(c)}
                    className="w-full flex items-center justify-between gap-2 rounded-md border p-2 text-left hover:border-primary/50 hover:bg-accent/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {c.code}
                        </span>
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
        )}

        {/* EDIT GROUP MODE */}
        {mode.kind === "editGroup" && activeGroup && (
          <div className="border rounded-lg overflow-hidden">
            <div className="px-3 py-2 border-b bg-muted/30 flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2"
                onClick={() => setMode({ kind: "list" })}
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <span className="text-sm font-medium">Combined equivalence</span>
              <span className="text-[11px] text-muted-foreground ml-auto">
                {totalGroupEcts(activeGroup)} / {ects} ECTS
              </span>
            </div>
            <div className="p-3 border-b min-h-[70px]">
              {activeGroup.courses.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-3">
                  Pick two or more courses below that together fulfil {courseCode}.
                </p>
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
            <ScrollArea className="h-[220px]">
              <div className="p-2 space-y-1">
                {filteredForGroup.length === 0 && (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    No courses match.
                  </div>
                )}
                {filteredForGroup.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => addCourseToActive(c)}
                    className="w-full flex items-center justify-between gap-2 rounded-md border p-2 text-left hover:border-primary/50 hover:bg-accent/40"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-muted-foreground">
                          {c.code}
                        </span>
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
        )}

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
