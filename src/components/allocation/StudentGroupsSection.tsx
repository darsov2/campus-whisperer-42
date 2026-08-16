import { useMemo, useState } from "react";
import { Plus, Trash2, Users, Filter, UserCog, X, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/ui/multi-select";
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

interface ProgrammeSelection {
  programme: string;
  rule: SelectionRule;
}

interface StudentGroup {
  id: string;
  name: string;
  programmes: ProgrammeSelection[];
}

type ClassType = "lectures" | "auditory";

const CLASS_TYPES: ClassType[] = ["lectures", "auditory"];
const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  lectures: "Lectures",
  auditory: "Auditory exercises",
};

type GroupAssignment = Partial<Record<ClassType, string[]>>;

/** 1.5 → "1.5", 2 → "2" */
const fmtLoad = (n: number) => (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/0$/, ""));


const newId = () => Math.random().toString(36).slice(2, 10);



const emptyRule = (): SelectionRule => ({
  id: newId(),
  property: "lastName",
  from: "",
  to: "",
});

const enrolledIn = (programme: string) =>
  allocStudents.filter((s) => s.programme === programme).length;

const matchedIn = (programme: string, rule: SelectionRule) => {
  const pool = allocStudents.filter((s) => s.programme === programme);
  if (!rule.from && !rule.to) return pool.length;
  return pool.filter((s) => matchesRule(s, rule)).length;
};

const groupTotal = (g: StudentGroup) =>
  g.programmes.reduce((sum, p) => sum + matchedIn(p.programme, p.rule), 0);

export function StudentGroupsSection({ courseLabel }: { courseLabel?: string }) {
  const [groups, setGroups] = useState<StudentGroup[]>([
    {
      id: "sg1",
      name: "Group 1",
      programmes: [
        {
          programme: allocProgrammes[0],
          rule: { id: newId(), property: "lastName", from: "A", to: "K" },
        },
      ],
    },
    {
      id: "sg2",
      name: "Group 2",
      programmes: [
        {
          programme: allocProgrammes[0],
          rule: { id: newId(), property: "lastName", from: "L", to: "Z" },
        },
      ],
    },
  ]);
  const [draftName, setDraftName] = useState("");
  const [draftProgrammes, setDraftProgrammes] = useState<ProgrammeSelection[]>([]);
  const [assignments, setAssignments] = useState<Record<string, GroupAssignment>>({});
  const [maxGroups, setMaxGroups] = useState(3);


  const programmeStats = useMemo(
    () =>
      allocProgrammes.map((p) => ({ programme: p, enrolled: enrolledIn(p) })),
    []
  );

  const draftCount = draftProgrammes.reduce(
    (sum, p) => sum + matchedIn(p.programme, p.rule),
    0
  );

  const toggleDraftProgramme = (programme: string) =>
    setDraftProgrammes((cur) =>
      cur.some((p) => p.programme === programme)
        ? cur.filter((p) => p.programme !== programme)
        : [...cur, { programme, rule: emptyRule() }]
    );

  const updateDraftRule = (programme: string, patch: Partial<SelectionRule>) =>
    setDraftProgrammes((cur) =>
      cur.map((p) =>
        p.programme === programme ? { ...p, rule: { ...p.rule, ...patch } } : p
      )
    );

  const addGroup = () => {
    if (!draftName.trim()) {
      toast.error("Enter a group name");
      return;
    }
    if (!draftProgrammes.length) {
      toast.error("Select at least one programme");
      return;
    }
    if (draftProgrammes.some((p) => !p.rule.from && !p.rule.to)) {
      toast.error("Enter a matching rule for every selected programme");
      return;
    }
    setGroups((g) => [
      ...g,
      { id: newId(), name: draftName.trim(), programmes: draftProgrammes },
    ]);
    setDraftName("");
    setDraftProgrammes([]);
    toast.success("Group created");
  };

  const removeGroup = (id: string) => {
    setGroups((g) => g.filter((x) => x.id !== id));
    setAssignments((a) => {
      const next = { ...a };
      delete next[id];
      return next;
    });
  };

  const setTeachers = (groupId: string, type: ClassType, teacherIds: string[]) =>
    setAssignments((a) => ({
      ...a,
      [groupId]: {
        ...(a[groupId] ?? {}),
        [type]: teacherIds,
      },
    }));

  /**
   * How many groups each teacher carries. When several teachers share a class
   * type of a group, the group counts as a fraction (1 / number of teachers).
   */
  const teacherLoad = useMemo(() => {
    const load: Record<string, { lectures: number; auditory: number; total: number }> = {};
    for (const t of allocTeachers) load[t.id] = { lectures: 0, auditory: 0, total: 0 };
    for (const g of groups) {
      const a = assignments[g.id];
      if (!a) continue;
      for (const type of CLASS_TYPES) {
        const ids = a[type] ?? [];
        if (!ids.length) continue;
        const share = 1 / ids.length;
        for (const tid of ids) {
          if (!load[tid]) continue;
          load[tid][type] += share;
          load[tid].total += share;
        }
      }
    }
    return load;
  }, [groups, assignments]);

  const issues = useMemo(() => {
    const list: string[] = [];
    for (const g of groups) {
      const a = assignments[g.id] ?? {};
      const missing = CLASS_TYPES.filter((t) => !(a[t]?.length)).map((t) => CLASS_TYPE_LABELS[t]);
      if (missing.length) list.push(`${g.name}: no teacher for ${missing.join(" & ")}`);
    }
    for (const t of allocTeachers) {
      const load = teacherLoad[t.id];
      if (load && load.total > maxGroups) {
        list.push(`${t.name} is assigned ${fmtLoad(load.total)} groups (limit ${maxGroups})`);
      }
    }
    return list;
  }, [groups, assignments, teacherLoad, maxGroups]);



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

          {/* Programme multi-select with enrolled counts */}
          <div className="space-y-1.5">
            <Label className="text-xs">Programmes</Label>
            <div className="rounded-md border border-border/60 divide-y">
              {programmeStats.map((p) => {
                const on = draftProgrammes.some((d) => d.programme === p.programme);
                return (
                  <button
                    key={p.programme}
                    type="button"
                    onClick={() => toggleDraftProgramme(p.programme)}
                    className={cn(
                      "w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors",
                      on ? "bg-accent/50" : "hover:bg-muted/60"
                    )}
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span
                        className={cn(
                          "flex h-4 w-4 items-center justify-center rounded border shrink-0",
                          on ? "bg-primary border-primary text-primary-foreground" : "bg-background"
                        )}
                      >
                        {on && <X className="h-3 w-3" />}
                      </span>
                      <span className="text-xs truncate">{p.programme}</span>
                    </span>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {p.enrolled} enrolled
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Per-programme rules + preview */}
          <div className="space-y-2">
            <Label className="text-xs">Matching rule per programme</Label>
            {draftProgrammes.length === 0 ? (
              <p className="rounded-md border border-dashed border-border/60 p-3 text-xs text-muted-foreground text-center">
                Select a programme to set its rule
              </p>
            ) : (
              <div className="space-y-2">
                {draftProgrammes.map((p) => (
                  <div key={p.programme} className="rounded-md border border-border/60 p-2.5 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium truncate">{p.programme}</span>
                      <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                        <span className="font-semibold text-foreground">
                          {matchedIn(p.programme, p.rule)}
                        </span>{" "}
                        / {enrolledIn(p.programme)} matched
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Select
                        value={p.rule.property}
                        onValueChange={(v: StudentProperty) =>
                          updateDraftRule(p.programme, { property: v })
                        }
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
                        value={p.rule.from}
                        onChange={(e) => updateDraftRule(p.programme, { from: e.target.value })}
                        placeholder="From"
                        className="h-8 w-24 text-xs"
                      />
                      <span className="text-xs text-muted-foreground">→</span>
                      <Input
                        value={p.rule.to}
                        onChange={(e) => updateDraftRule(p.programme, { to: e.target.value })}
                        placeholder="To"
                        className="h-8 w-24 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
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
        <div className="rounded-lg border border-border/60 divide-y self-start">
          {groups.length === 0 && (
            <p className="p-4 text-xs text-muted-foreground text-center">No groups defined yet</p>
          )}
          {groups.map((g) => (
            <div key={g.id} className="p-3 flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{g.name}</span>
                  <Badge variant="secondary" className="text-xs tabular-nums">
                    {groupTotal(g)} students
                  </Badge>
                </div>
                <div className="space-y-1">
                  {g.programmes.map((p) => (
                    <div key={p.programme} className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[11px] font-normal">
                        {p.programme}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {describeRule(p.rule)}
                      </span>
                      <span className="text-[11px] text-muted-foreground tabular-nums">
                        · {matchedIn(p.programme, p.rule)} / {enrolledIn(p.programme)}
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

      {/* ── Assign teachers to groups ── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UserCog className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assign teachers to groups
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">Max groups per teacher</Label>
            <Input
              type="number"
              min={1}
              value={maxGroups}
              onChange={(e) => setMaxGroups(Math.max(1, Number(e.target.value) || 1))}
              className="h-8 w-16 text-xs"
            />
          </div>
        </div>

        {issues.length > 0 && (
          <div className="rounded-md border border-destructive/40 bg-destructive/5 p-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-medium text-destructive">
              <AlertTriangle className="h-3.5 w-3.5" />
              {issues.length} issue{issues.length > 1 ? "s" : ""} to resolve
            </div>
            <ul className="ml-5 list-disc space-y-0.5 text-xs text-muted-foreground">
              {issues.map((i) => (
                <li key={i}>{i}</li>
              ))}
            </ul>
          </div>
        )}

        {groups.length === 0 ? (
          <p className="rounded-md border border-dashed border-border/60 p-4 text-xs text-muted-foreground text-center">
            Create a group first
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {groups.map((g) => {
              const a = assignments[g.id] ?? {};
              return (
                <div key={g.id} className="rounded-lg border border-border/60 p-3 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{g.name}</span>
                    <Badge variant="secondary" className="text-xs tabular-nums shrink-0">
                      {groupTotal(g)} students
                    </Badge>
                  </div>
                  {CLASS_TYPES.map((type) => {
                    const ids = a[type] ?? [];
                    const share = ids.length ? 1 / ids.length : 0;
                    return (
                      <div key={type} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <Label className="text-xs text-muted-foreground">
                            {CLASS_TYPE_LABELS[type]}
                          </Label>
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {ids.length
                              ? `${ids.length} teacher${ids.length > 1 ? "s" : ""} · ${fmtLoad(share)} each`
                              : "not assigned"}
                          </span>
                        </div>
                        <MultiSelect
                          options={allocTeachers.map((t) => ({
                            value: t.id,
                            label: t.name,
                            secondary: t.title,
                          }))}
                          selected={ids}
                          onChange={(values) => setTeachers(g.id, type, values)}
                          placeholder="Select teachers..."
                          searchPlaceholder="Search teachers..."
                          badgeLimit={2}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Teacher load overview */}
        <div className="rounded-lg border border-border/60 divide-y">
          {allocTeachers.map((t) => {
            const load = teacherLoad[t.id];
            const over = load.total > maxGroups;
            return (
              <div key={t.id} className="flex items-center justify-between gap-3 px-3 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium truncate">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{t.title}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {fmtLoad(load.lectures)} lec · {fmtLoad(load.auditory)} aud
                  </span>
                  <Badge
                    variant={over ? "destructive" : "secondary"}
                    className="text-[11px] tabular-nums"
                  >
                    {fmtLoad(load.total)}/{maxGroups} groups
                  </Badge>
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
