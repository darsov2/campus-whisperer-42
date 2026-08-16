import { useMemo, useState } from "react";
import {
  Users,
  Search,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  Wand2,
  Layers,
  GraduationCap,
  UserCheck,
  Split,
  ClipboardCheck,
  ArrowUpDown,
  Filter,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
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
  allocGroups,
  allocCourseGroups,
  allocTeachers,
  autoDistribute,
  describeRule,
  matchesRule,
  PROPERTY_LABELS,
  studentsMatchingRules,
  type AllocStudent,
  type SelectionRule,
  type StudentProperty,
} from "@/data/student-allocation-data";

// ─── Stepper ─────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: "Students", icon: Users },
  { id: 2, label: "Assignment", icon: Layers },
  { id: 3, label: "Teachers", icon: GraduationCap },
  { id: 4, label: "Distribution", icon: Split },
  { id: 5, label: "Review", icon: ClipboardCheck },
] as const;

function Stepper({
  step,
  maxStep,
  summaries,
  onSelect,
}: {
  step: number;
  maxStep: number;
  summaries: Record<number, string>;
  onSelect: (n: number) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-5">
      {STEPS.map((s) => {
        const done = s.id < maxStep;
        const active = s.id === step;
        const reachable = s.id <= maxStep;
        const Icon = s.icon;
        return (
          <button
            key={s.id}
            type="button"
            disabled={!reachable}
            onClick={() => reachable && onSelect(s.id)}
            className={cn(
              "text-left rounded-lg border p-3 transition-all",
              active
                ? "border-primary bg-primary/5 shadow-[var(--shadow-md)]"
                : reachable
                ? "bg-card hover:border-primary/40"
                : "bg-muted/40 opacity-60 cursor-not-allowed"
            )}
          >
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "h-6 w-6 shrink-0 rounded-full flex items-center justify-center text-xs font-semibold",
                  active
                    ? "bg-primary text-primary-foreground"
                    : done
                    ? "bg-success/15 text-success"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : s.id}
              </span>
              <span className="text-sm font-medium flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                {s.label}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground truncate pl-8">
              {summaries[s.id] || "Not configured"}
            </p>
          </button>
        );
      })}
    </div>
  );
}

// ─── Rule builder ────────────────────────────────────────────

function RuleBuilder({
  rules,
  onAdd,
  onRemove,
  matchCount,
  compact,
  title = "Selection rules",
  hint,
}: {
  rules: SelectionRule[];
  onAdd: (r: Omit<SelectionRule, "id">) => void;
  onRemove: (id: string) => void;
  matchCount: number;
  compact?: boolean;
  title?: string;
  hint?: string;
}) {
  const [property, setProperty] = useState<StudentProperty>("lastName");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const apply = () => {
    if (!from.trim() && !to.trim()) {
      toast.error("Enter at least a start or an end value");
      return;
    }
    onAdd({ property, from: from.trim(), to: to.trim() });
    setFrom("");
    setTo("");
  };

  return (
    <div className="space-y-3">
      <div className={cn("grid gap-3", compact ? "sm:grid-cols-4" : "sm:grid-cols-4")}>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Student property</Label>
          <Select value={property} onValueChange={(v) => setProperty(v as StudentProperty)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(PROPERTY_LABELS) as StudentProperty[]).map((p) => (
                <SelectItem key={p} value={p}>
                  {PROPERTY_LABELS[p]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder={property === "index" ? "221001" : "A"}
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder={property === "index" ? "221250" : "S"}
            onKeyDown={(e) => e.key === "Enter" && apply()}
          />
        </div>
        <div className="flex items-end">
          <Button className="w-full" onClick={apply}>
            <Wand2 className="h-4 w-4 mr-2" /> Apply rule
          </Button>
        </div>
      </div>

      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}

      {rules.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
          <div className="flex flex-wrap gap-2">
            {rules.map((r) => (
              <span
                key={r.id}
                className="group inline-flex items-center gap-2 rounded-full border bg-secondary/60 pl-3 pr-1.5 py-1.5 text-sm"
              >
                <span className="font-medium">{describeRule(r)}</span>
                <button
                  type="button"
                  onClick={() => onRemove(r.id)}
                  className="h-5 w-5 rounded-full flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Remove rule"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{matchCount}</span> students match
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────

type SortKey = "index" | "firstName" | "lastName";

export default function StudentAllocation() {
  const [step, setStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1);

  // Step 1 — students
  const [query, setQuery] = useState("");
  const [programme, setProgramme] = useState("all");
  const [year, setYear] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("index");
  const [sortAsc, setSortAsc] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rules, setRules] = useState<SelectionRule[]>([]);

  // Step 2 — assignment
  const [groupId, setGroupId] = useState<string>("");
  const [courseGroupId, setCourseGroupId] = useState<string>("none");

  // Step 3 — teachers
  const [assignTeachers, setAssignTeachers] = useState(true);
  const [teacherIds, setTeacherIds] = useState<string[]>([]);

  // Step 4 — distribution
  const [distMode, setDistMode] = useState<"auto" | "rules">("auto");
  const [teacherRules, setTeacherRules] = useState<Record<string, SelectionRule[]>>({});

  const programmes = useMemo(
    () => Array.from(new Set(allocStudents.map((s) => s.programme))),
    []
  );

  const visibleStudents = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = allocStudents.filter((s) => {
      const matchesQuery =
        !q ||
        s.index.includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        s.lastName.toLowerCase().includes(q);
      const matchesProgramme = programme === "all" || s.programme === programme;
      const matchesYear = year === "all" || String(s.year) === year;
      return matchesQuery && matchesProgramme && matchesYear;
    });
    return [...list].sort((a, b) => {
      const cmp = String(a[sortKey]).localeCompare(String(b[sortKey]), undefined, {
        numeric: true,
      });
      return sortAsc ? cmp : -cmp;
    });
  }, [query, programme, year, sortKey, sortAsc]);

  const ruleMatches = useMemo(
    () => studentsMatchingRules(allocStudents, rules),
    [rules]
  );

  const selectedStudents = useMemo(() => {
    const ids = new Set(selectedIds);
    ruleMatches.forEach((s) => ids.add(s.id));
    return allocStudents.filter((s) => ids.has(s.id));
  }, [selectedIds, ruleMatches]);

  const selectedTeachers = assignTeachers
    ? allocTeachers.filter((t) => teacherIds.includes(t.id))
    : [];

  const autoCounts = autoDistribute(selectedStudents.length, selectedTeachers.length);

  const teacherBuckets = useMemo(() => {
    if (distMode === "auto") {
      return selectedTeachers.map((t, i) => ({
        teacher: t,
        count: autoCounts[i] ?? 0,
        students: [] as AllocStudent[],
      }));
    }
    const taken = new Set<string>();
    return selectedTeachers.map((t) => {
      const trules = teacherRules[t.id] ?? [];
      const students = selectedStudents.filter(
        (s) => !taken.has(s.id) && trules.some((r) => matchesRule(s, r))
      );
      students.forEach((s) => taken.add(s.id));
      return { teacher: t, count: students.length, students };
    });
  }, [distMode, selectedTeachers, autoCounts, teacherRules, selectedStudents]);

  const assignedTotal = teacherBuckets.reduce((sum, b) => sum + b.count, 0);
  const unassigned = selectedStudents.length - assignedTotal;
  const evenDistribution =
    autoCounts.length > 0 && new Set(autoCounts).size === 1;

  const group = allocGroups.find((g) => g.id === groupId);
  const courseGroup = allocCourseGroups.find((c) => c.id === courseGroupId);

  const summaries: Record<number, string> = {
    1: selectedStudents.length ? `${selectedStudents.length} students selected` : "",
    2: group ? `${group.year} — ${group.name}` : "",
    3: assignTeachers
      ? selectedTeachers.length
        ? `${selectedTeachers.length} teachers`
        : ""
      : "No teachers",
    4: !assignTeachers
      ? "Not applicable"
      : distMode === "auto"
      ? "Automatic"
      : "Custom rules",
    5: "",
  };

  const canContinue = () => {
    if (step === 1) return selectedStudents.length > 0;
    if (step === 2) return !!groupId;
    if (step === 3) return !assignTeachers || selectedTeachers.length > 0;
    return true;
  };

  const goTo = (n: number) => {
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
  };

  const next = () => {
    if (!canContinue()) {
      toast.error(
        step === 1
          ? "Select at least one student"
          : step === 2
          ? "Choose a group"
          : "Select at least one teacher"
      );
      return;
    }
    // Skip distribution when no teachers are assigned
    if (step === 3 && !assignTeachers) return goTo(5);
    goTo(Math.min(step + 1, 5));
  };

  const back = () => {
    if (step === 5 && !assignTeachers) return setStep(3);
    setStep((s) => Math.max(1, s - 1));
  };

  const reset = () => {
    setStep(1);
    setMaxStep(1);
    setSelectedIds([]);
    setRules([]);
    setGroupId("");
    setCourseGroupId("none");
    setAssignTeachers(true);
    setTeacherIds([]);
    setDistMode("auto");
    setTeacherRules({});
  };

  const confirm = () => {
    toast.success(
      `${selectedStudents.length} students allocated to ${group?.year} — ${group?.name}`
    );
    reset();
  };

  const allVisibleSelected =
    visibleStudents.length > 0 &&
    visibleStudents.every((s) => selectedIds.includes(s.id));

  const toggleAllVisible = () => {
    setSelectedIds((prev) =>
      allVisibleSelected
        ? prev.filter((id) => !visibleStudents.some((s) => s.id === id))
        : Array.from(new Set([...prev, ...visibleStudents.map((s) => s.id)]))
    );
  };

  const sortBy = (key: SortKey) => {
    if (key === sortKey) setSortAsc((a) => !a);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Student Allocation"
        description="Select students, assign them to a group and distribute them between teachers."
        actions={
          <Button variant="outline" onClick={reset}>
            Start over
          </Button>
        }
      />

      <Stepper step={step} maxStep={maxStep} summaries={summaries} onSelect={setStep} />

      {/* ── Step 1 ───────────────────────────────────────── */}
      {step === 1 && (
        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2 border-0 shadow-[var(--shadow-card)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" /> Select students
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search students…"
                    className="pl-9"
                  />
                </div>
                <Select value={programme} onValueChange={setProgramme}>
                  <SelectTrigger className="sm:w-[190px]">
                    <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All programmes</SelectItem>
                    {programmes.map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={year} onValueChange={setYear}>
                  <SelectTrigger className="sm:w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All years</SelectItem>
                    {[1, 2, 3, 4].map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        Year {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border overflow-hidden">
                <div className="max-h-[420px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 sticky top-0 z-10">
                      <tr className="text-left">
                        <th className="w-10 px-3 py-2">
                          <Checkbox
                            checked={allVisibleSelected}
                            onCheckedChange={toggleAllVisible}
                            aria-label="Select all"
                          />
                        </th>
                        {(
                          [
                            ["index", "Index"],
                            ["firstName", "First Name"],
                            ["lastName", "Last Name"],
                          ] as [SortKey, string][]
                        ).map(([key, label]) => (
                          <th key={key} className="px-3 py-2 font-medium">
                            <button
                              className="inline-flex items-center gap-1 hover:text-primary"
                              onClick={() => sortBy(key)}
                            >
                              {label}
                              <ArrowUpDown className="h-3 w-3 opacity-60" />
                            </button>
                          </th>
                        ))}
                        <th className="px-3 py-2 font-medium hidden md:table-cell">
                          Programme
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleStudents.map((s) => {
                        const byRule = ruleMatches.some((r) => r.id === s.id);
                        const checked = selectedIds.includes(s.id) || byRule;
                        return (
                          <tr
                            key={s.id}
                            className={cn(
                              "border-t hover:bg-muted/40 transition-colors",
                              checked && "bg-primary/5"
                            )}
                          >
                            <td className="px-3 py-2">
                              <Checkbox
                                checked={checked}
                                disabled={byRule}
                                onCheckedChange={(v) =>
                                  setSelectedIds((prev) =>
                                    v ? [...prev, s.id] : prev.filter((id) => id !== s.id)
                                  )
                                }
                                aria-label={`Select ${s.firstName} ${s.lastName}`}
                              />
                            </td>
                            <td className="px-3 py-2 font-mono text-xs">{s.index}</td>
                            <td className="px-3 py-2">{s.firstName}</td>
                            <td className="px-3 py-2">
                              {s.lastName}
                              {byRule && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 text-[10px] border-primary/30 text-primary"
                                >
                                  rule
                                </Badge>
                              )}
                            </td>
                            <td className="px-3 py-2 text-muted-foreground hidden md:table-cell">
                              {s.programme}
                            </td>
                          </tr>
                        );
                      })}
                      {visibleStudents.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-10 text-center text-muted-foreground">
                            No students match your search.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Showing {visibleStudents.length} of {allocStudents.length}
                </span>
                <span className="font-medium">
                  {selectedStudents.length} students selected
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-[var(--shadow-card)] h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-accent" /> Select by rule
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RuleBuilder
                rules={rules}
                matchCount={ruleMatches.length}
                hint="Rules add students on top of your manual picks. Ranges are inclusive."
                onAdd={(r) =>
                  setRules((prev) => [...prev, { ...r, id: crypto.randomUUID() }])
                }
                onRemove={(id) => setRules((prev) => prev.filter((r) => r.id !== id))}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Step 2 ───────────────────────────────────────── */}
      {step === 2 && (
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Assign{" "}
              {selectedStudents.length} selected students
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Group</Label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a group" />
                </SelectTrigger>
                <SelectContent>
                  {allocGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.year} — {g.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                The student's main study group for the academic year. Required.
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                Course Group
                <Badge variant="outline" className="text-[10px]">
                  optional
                </Badge>
              </Label>
              <Select value={courseGroupId} onValueChange={setCourseGroupId}>
                <SelectTrigger>
                  <SelectValue placeholder="No course group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No course group</SelectItem>
                  {allocCourseGroups.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.course} — {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                A working group inside a single course (lab / exercise group).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Step 3 ───────────────────────────────────────── */}
      {step === 3 && (
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" /> Teacher assignment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <RadioGroup
              value={assignTeachers ? "yes" : "no"}
              onValueChange={(v) => setAssignTeachers(v === "yes")}
              className="grid gap-2 sm:grid-cols-2"
            >
              {[
                { v: "yes", label: "Assign teachers", desc: "Distribute students between teachers" },
                { v: "no", label: "Do not assign teachers", desc: "Only place students into the group" },
              ].map((o) => (
                <Label
                  key={o.v}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                    (o.v === "yes") === assignTeachers && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value={o.v} className="mt-0.5" />
                  <span>
                    <span className="block text-sm font-medium">{o.label}</span>
                    <span className="block text-xs text-muted-foreground">{o.desc}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>

            {assignTeachers && (
              <div className="space-y-2 animate-fade-in">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Teachers
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {allocTeachers.map((t) => {
                    const checked = teacherIds.includes(t.id);
                    return (
                      <Label
                        key={t.id}
                        className={cn(
                          "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                          checked && "border-primary bg-primary/5"
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={(v) =>
                            setTeacherIds((prev) =>
                              v ? [...prev, t.id] : prev.filter((id) => id !== t.id)
                            )
                          }
                        />
                        <span>
                          <span className="block text-sm font-medium">{t.name}</span>
                          <span className="block text-xs text-muted-foreground">
                            {t.title}
                          </span>
                        </span>
                      </Label>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 4 ───────────────────────────────────────── */}
      {step === 4 && (
        <Card className="border-0 shadow-[var(--shadow-card)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Split className="h-4 w-4 text-primary" /> Student distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <RadioGroup
              value={distMode}
              onValueChange={(v) => setDistMode(v as "auto" | "rules")}
              className="grid gap-2 sm:grid-cols-2"
            >
              {[
                { v: "auto", label: "Automatically distribute", desc: "Split students evenly" },
                { v: "rules", label: "Define distribution rules", desc: "Split by name or index range" },
              ].map((o) => (
                <Label
                  key={o.v}
                  className={cn(
                    "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                    distMode === o.v && "border-primary bg-primary/5"
                  )}
                >
                  <RadioGroupItem value={o.v} className="mt-0.5" />
                  <span>
                    <span className="block text-sm font-medium">{o.label}</span>
                    <span className="block text-xs text-muted-foreground">{o.desc}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>

            <div className="rounded-lg border bg-muted/30 p-3 text-sm flex flex-wrap items-center gap-x-6 gap-y-1">
              <span>
                <span className="font-semibold">{selectedStudents.length}</span> students
              </span>
              <span>
                <span className="font-semibold">{selectedTeachers.length}</span> teachers
              </span>
              {rules.length > 0 && (
                <span className="text-muted-foreground">
                  Overall selection: {rules.map(describeRule).join(" · ")}
                </span>
              )}
            </div>

            {distMode === "auto" ? (
              <div className="space-y-2 animate-fade-in">
                {teacherBuckets.map((b) => (
                  <div
                    key={b.teacher.id}
                    className="flex items-center gap-4 rounded-lg border bg-card p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{b.teacher.name}</p>
                      <Progress
                        className="h-1.5 mt-2"
                        value={
                          selectedStudents.length
                            ? (b.count / selectedStudents.length) * 100
                            : 0
                        }
                      />
                    </div>
                    <span className="text-sm font-semibold tabular-nums">
                      {b.count} students
                    </span>
                  </div>
                ))}
                {evenDistribution ? (
                  <p className="text-sm text-success flex items-center gap-1.5">
                    <Check className="h-4 w-4" /> Even distribution
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Remainder given to the first teachers.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 animate-fade-in">
                <p className="text-xs text-muted-foreground">
                  These rules split the {selectedStudents.length} already selected students —
                  a student is assigned to the first teacher whose rule matches.
                </p>
                {teacherBuckets.map((b) => (
                  <div key={b.teacher.id} className="rounded-lg border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{b.teacher.name}</p>
                      <Badge variant="secondary">{b.count} students</Badge>
                    </div>
                    <RuleBuilder
                      compact
                      title="Teacher rules"
                      rules={teacherRules[b.teacher.id] ?? []}
                      matchCount={b.count}
                      onAdd={(r) =>
                        setTeacherRules((prev) => ({
                          ...prev,
                          [b.teacher.id]: [
                            ...(prev[b.teacher.id] ?? []),
                            { ...r, id: crypto.randomUUID() },
                          ],
                        }))
                      }
                      onRemove={(id) =>
                        setTeacherRules((prev) => ({
                          ...prev,
                          [b.teacher.id]: (prev[b.teacher.id] ?? []).filter(
                            (r) => r.id !== id
                          ),
                        }))
                      }
                    />
                  </div>
                ))}
                {unassigned > 0 && (
                  <p className="text-sm text-warning flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4" /> {unassigned} selected students are
                    not covered by any teacher rule.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Step 5 ───────────────────────────────────────── */}
      {step === 5 && (
        <Card className="border-0 shadow-[var(--shadow-card)] max-w-3xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-primary" /> Allocation summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Students
                </dt>
                <dd className="text-sm font-medium mt-0.5">
                  {selectedStudents.length} students
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Selection rule
                </dt>
                <dd className="text-sm font-medium mt-0.5">
                  {rules.length ? rules.map(describeRule).join(" · ") : "Manual selection"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Group
                </dt>
                <dd className="text-sm font-medium mt-0.5">
                  {group ? `${group.year} — ${group.name}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Course Group
                </dt>
                <dd className="text-sm font-medium mt-0.5">
                  {courseGroup ? `${courseGroup.course} — ${courseGroup.name}` : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Teachers
                </dt>
                <dd className="text-sm font-medium mt-0.5">
                  {assignTeachers ? `${selectedTeachers.length} teachers` : "Not assigned"}
                </dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                  Distribution
                </dt>
                <dd className="text-sm font-medium mt-0.5">
                  {!assignTeachers
                    ? "—"
                    : distMode === "auto"
                    ? "Automatic"
                    : "Custom rules"}
                </dd>
              </div>
            </dl>

            {assignTeachers && selectedTeachers.length > 0 && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  {teacherBuckets.map((b) => (
                    <div
                      key={b.teacher.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                        {b.teacher.name}
                      </span>
                      <span className="font-semibold tabular-nums">{b.count}</span>
                    </div>
                  ))}
                  {unassigned > 0 && distMode === "rules" && (
                    <p className="text-xs text-warning pt-1">
                      {unassigned} students unassigned
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={reset}>
                Cancel
              </Button>
              <Button onClick={confirm}>Confirm allocation</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Footer nav ───────────────────────────────────── */}
      {step < 5 && (
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={back} disabled={step === 1}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <Button onClick={next}>
            Continue <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
      {step === 5 && (
        <div>
          <Button variant="ghost" onClick={back}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </div>
      )}
    </div>
  );
}
