import { useMemo, useState } from "react";
import { Plus, Trash2, Users, Filter, UserCog, X } from "lucide-react";
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
import { toast } from "sonner";
import {
  allocStudents,
  allocTeachers,
  allocProgrammes,
  matchesRule,
  describeRule,
  PROPERTY_LABELS,
  type SelectionRule,
  type StudentProperty,
} from "@/data/student-allocation-data";

interface StudentGroup {
  id: string;
  name: string;
  programmes: string[];
  rule: SelectionRule;
}

const newId = () => Math.random().toString(36).slice(2, 10);

const emptyRule = (): SelectionRule => ({
  id: newId(),
  property: "lastName",
  from: "",
  to: "",
});

export function StudentGroupsSection({ courseLabel }: { courseLabel?: string }) {
  const [groups, setGroups] = useState<StudentGroup[]>([
    {
      id: "sg1",
      name: "Group 1",
      programmes: [allocProgrammes[0]],
      rule: { id: newId(), property: "lastName", from: "A", to: "K" },
    },
    {
      id: "sg2",
      name: "Group 2",
      programmes: [allocProgrammes[0]],
      rule: { id: newId(), property: "lastName", from: "L", to: "Z" },
    },
  ]);
  const [draftName, setDraftName] = useState("");
  const [draftProgrammes, setDraftProgrammes] = useState<string[]>([]);
  const [draftRule, setDraftRule] = useState<SelectionRule>(emptyRule());
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});

  /** Students matched by a rule, restricted to the given programmes. */
  const matchedStudents = (programmes: string[], rule?: SelectionRule) => {
    if (!programmes.length) return [];
    const pool = allocStudents.filter((s) => programmes.includes(s.programme));
    if (!rule || (!rule.from && !rule.to)) return pool;
    return pool.filter((s) => matchesRule(s, rule));
  };

  const countFor = (programmes: string[], rule?: SelectionRule) =>
    matchedStudents(programmes, rule).length;

  const perProgramme = (programmes: string[], rule?: SelectionRule) =>
    programmes.map((p) => ({
      programme: p,
      enrolled: allocStudents.filter((s) => s.programme === p).length,
      matched: matchedStudents([p], rule).length,
    }));

  const draftPreview = useMemo(
    () => perProgramme(draftProgrammes, draftRule),
    [draftProgrammes, draftRule]
  );
  const draftCount = draftPreview.reduce((s, p) => s + p.matched, 0);

  const toggleDraftProgramme = (p: string) =>
    setDraftProgrammes((cur) =>
      cur.includes(p) ? cur.filter((x) => x !== p) : [...cur, p]
    );

  const updateDraftRule = (patch: Partial<SelectionRule>) =>
    setDraftRule((r) => ({ ...r, ...patch }));

  const addGroup = () => {
    if (!draftName.trim()) {
      toast.error("Enter a group name");
      return;
    }
    if (!draftProgrammes.length) {
      toast.error("Select at least one programme");
      return;
    }
    if (!draftRule.from && !draftRule.to) {
      toast.error("Enter a matching rule");
      return;
    }
    setGroups((g) => [
      ...g,
      { id: newId(), name: draftName.trim(), programmes: draftProgrammes, rule: draftRule },
    ]);
    setDraftName("");
    setDraftProgrammes([]);
    setDraftRule(emptyRule());
    toast.success("Group created");
  };

  const removeGroup = (id: string) => {
    setGroups((g) => g.filter((x) => x.id !== id));
    setAssignments((a) =>
      Object.fromEntries(Object.entries(a).map(([t, ids]) => [t, ids.filter((x) => x !== id)]))
    );
  };

  const toggleAssignment = (teacherId: string, groupId: string) =>
    setAssignments((a) => {
      const cur = a[teacherId] ?? [];
      return {
        ...a,
        [teacherId]: cur.includes(groupId) ? cur.filter((g) => g !== groupId) : [...cur, groupId],
      };
    });

  return (
    <div className="data-card p-4 space-y-6">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Student Groups</h3>
        {courseLabel && (
          <span className="text-xs text-muted-foreground truncate">· {courseLabel}</span>
        )}
      </div>

      {/* ── Define group ── */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border/60 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Define group
            </span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Group name</Label>
            <Input
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="e.g. Group 3"
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Programmes</Label>
            <div className="flex flex-wrap gap-1.5">
              {allocProgrammes.map((p) => {
                const on = draftProgrammes.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => toggleDraftProgramme(p)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                      on
                        ? "bg-accent text-accent-foreground border-transparent"
                        : "bg-background hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {p}
                    {on ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Student matching rule (within selected programmes)</Label>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={draftRule.property}
                onValueChange={(v: StudentProperty) => updateDraftRule({ property: v })}
              >
                <SelectTrigger className="h-8 w-[130px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PROPERTY_LABELS).map(([k, label]) => (
                    <SelectItem key={k} value={k}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                value={draftRule.from}
                onChange={(e) => updateDraftRule({ from: e.target.value })}
                placeholder="From"
                className="h-8 w-24 text-xs"
              />
              <span className="text-xs text-muted-foreground">→</span>
              <Input
                value={draftRule.to}
                onChange={(e) => updateDraftRule({ to: e.target.value })}
                placeholder="To"
                className="h-8 w-24 text-xs"
              />
            </div>
          </div>

          {/* Per-programme preview */}
          <div className="rounded-md border border-border/60 divide-y">
            {draftPreview.length === 0 ? (
              <p className="p-3 text-xs text-muted-foreground text-center">
                Select programmes to preview matched students
              </p>
            ) : (
              draftPreview.map((p) => (
                <div key={p.programme} className="flex items-center justify-between px-3 py-2">
                  <span className="text-xs truncate">{p.programme}</span>
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    <span className="font-semibold text-foreground">{p.matched}</span> / {p.enrolled} enrolled
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground tabular-nums">{draftCount}</span> students matched
            </span>
            <Button size="sm" onClick={addGroup}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Create group
            </Button>
          </div>
        </div>

        {/* ── Existing groups ── */}
        <div className="rounded-lg border border-border/60 divide-y">
          {groups.length === 0 && (
            <p className="p-4 text-xs text-muted-foreground text-center">No groups defined yet</p>
          )}
          {groups.map((g) => (
            <div key={g.id} className="p-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{g.name}</span>
                  <Badge variant="secondary" className="text-xs tabular-nums">
                    {countFor(g.programmes, g.rule)} students
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[11px] font-normal">
                    {describeRule(g.rule)}
                  </Badge>
                  {g.programmes.map((p) => (
                    <Badge key={p} variant="outline" className="text-[11px] font-normal">
                      {p}
                    </Badge>
                  ))}
                </div>
                <div className="mt-1.5 space-y-0.5">
                  {perProgramme(g.programmes, g.rule).map((p) => (
                    <div key={p.programme} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="truncate">{p.programme}</span>
                      <span className="tabular-nums shrink-0">
                        {p.matched} / {p.enrolled} enrolled
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-destructive shrink-0"
                onClick={() => removeGroup(g.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* ── Assign groups to teachers ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Assign groups to teachers
          </span>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {allocTeachers.map((t) => {
            const assigned = assignments[t.id] ?? [];
            return (
              <div key={t.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{t.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{t.title}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs tabular-nums shrink-0">
                    {assigned.reduce(
                      (sum, gid) => sum + countFor(groups.find((g) => g.id === gid)?.rule),
                      0
                    )}{" "}
                    students
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {groups.map((g) => {
                    const on = assigned.includes(g.id);
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => toggleAssignment(t.id, g.id)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors",
                          on
                            ? "bg-accent text-accent-foreground border-transparent"
                            : "bg-background hover:bg-muted text-muted-foreground"
                        )}
                      >
                        {g.name}
                        {on ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                      </button>
                    );
                  })}
                  {groups.length === 0 && (
                    <span className="text-xs text-muted-foreground">Create a group first</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StudentGroupsSection;
