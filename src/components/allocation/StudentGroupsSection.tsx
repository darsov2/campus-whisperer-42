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
  studentsMatchingRules,
  describeRule,
  PROPERTY_LABELS,
  type SelectionRule,
  type StudentProperty,
} from "@/data/student-allocation-data";

interface StudentGroup {
  id: string;
  name: string;
  rules: SelectionRule[];
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
    { id: "sg1", name: "Group 1", rules: [{ id: newId(), property: "lastName", from: "A", to: "K" }] },
    { id: "sg2", name: "Group 2", rules: [{ id: newId(), property: "lastName", from: "L", to: "Z" }] },
  ]);
  const [draftName, setDraftName] = useState("");
  const [draftRules, setDraftRules] = useState<SelectionRule[]>([emptyRule()]);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});

  const countFor = (rules: SelectionRule[]) =>
    studentsMatchingRules(allocStudents, rules.filter((r) => r.from || r.to)).length;

  const draftCount = useMemo(() => countFor(draftRules), [draftRules]);

  const updateDraftRule = (id: string, patch: Partial<SelectionRule>) =>
    setDraftRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  const addGroup = () => {
    if (!draftName.trim()) {
      toast.error("Enter a group name");
      return;
    }
    setGroups((g) => [
      ...g,
      { id: newId(), name: draftName.trim(), rules: draftRules.filter((r) => r.from || r.to) },
    ]);
    setDraftName("");
    setDraftRules([emptyRule()]);
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

      {/* ── Define groups ── */}
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
            <Label className="text-xs">Student matching rules</Label>
            {draftRules.map((rule) => (
              <div key={rule.id} className="flex flex-wrap items-center gap-2">
                <Select
                  value={rule.property}
                  onValueChange={(v: StudentProperty) => updateDraftRule(rule.id, { property: v })}
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
                  value={rule.from}
                  onChange={(e) => updateDraftRule(rule.id, { from: e.target.value })}
                  placeholder="From"
                  className="h-8 w-24 text-xs"
                />
                <span className="text-xs text-muted-foreground">→</span>
                <Input
                  value={rule.to}
                  onChange={(e) => updateDraftRule(rule.id, { to: e.target.value })}
                  placeholder="To"
                  className="h-8 w-24 text-xs"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-destructive"
                  onClick={() => setDraftRules((rs) => (rs.length > 1 ? rs.filter((r) => r.id !== rule.id) : rs))}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-8"
              onClick={() => setDraftRules((rs) => [...rs, emptyRule()])}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add rule
            </Button>
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
                    {countFor(g.rules)} students
                  </Badge>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {g.rules.length === 0 ? (
                    <span className="text-xs text-muted-foreground">No rules</span>
                  ) : (
                    g.rules.map((r) => (
                      <Badge key={r.id} variant="outline" className="text-[11px] font-normal">
                        {describeRule(r)}
                      </Badge>
                    ))
                  )}
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
                      (sum, gid) => sum + countFor(groups.find((g) => g.id === gid)?.rules ?? []),
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
