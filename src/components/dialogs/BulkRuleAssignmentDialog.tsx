import { useState, useEffect } from "react";
import { GitBranch, Plus, Trash2, Layers } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ProgrammeOption } from "./ProgrammePickerDialog";

// Rule condition (reused from rule engine)
interface RuleCondition {
  id: string;
  type: "prerequisite" | "corequisite" | "ects_min" | "semester_min";
  value: string;
  label: string;
}

interface RuleGroup {
  id: string;
  operator: "and" | "or";
  conditions: RuleCondition[];
}

interface BulkRules {
  groupOperator: "and" | "or";
  groups: RuleGroup[];
}

interface BulkRuleAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseName: string;
  courseCode: string;
  programmes: ProgrammeOption[];
  availableCourses: { code: string; name: string }[];
  onSave: (programmeIds: string[], rules: BulkRules) => void;
}

const conditionTypeColors: Record<string, { bg: string; border: string }> = {
  prerequisite: { bg: "bg-accent/10", border: "border-accent/40" },
  corequisite: { bg: "bg-info/10", border: "border-info/40" },
  ects_min: { bg: "bg-warning/10", border: "border-warning/40" },
  semester_min: { bg: "bg-success/10", border: "border-success/40" },
};

const degreeLabels = { bachelor: "BSc", master: "MSc", doctorate: "PhD" };

export function BulkRuleAssignmentDialog({
  open,
  onOpenChange,
  courseName,
  courseCode,
  programmes,
  availableCourses,
  onSave,
}: BulkRuleAssignmentDialogProps) {
  const [selectedProgrammes, setSelectedProgrammes] = useState<Set<string>>(new Set());
  const [rules, setRules] = useState<BulkRules>({ groupOperator: "and", groups: [] });

  useEffect(() => {
    if (open) {
      setSelectedProgrammes(new Set());
      setRules({ groupOperator: "and", groups: [] });
    }
  }, [open]);

  const toggleProgramme = (id: string) => {
    setSelectedProgrammes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => setSelectedProgrammes(new Set(programmes.map((p) => p.id)));
  const deselectAll = () => setSelectedProgrammes(new Set());

  const addGroup = () => {
    setRules((prev) => ({
      ...prev,
      groups: [
        ...prev.groups,
        { id: `group-${Date.now()}`, operator: "and", conditions: [] },
      ],
    }));
  };

  const removeGroup = (groupId: string) => {
    setRules((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== groupId),
    }));
  };

  const addCondition = (groupId: string) => {
    setRules((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              conditions: [
                ...g.conditions,
                { id: `cond-${Date.now()}`, type: "prerequisite" as const, value: "", label: "" },
              ],
            }
          : g
      ),
    }));
  };

  const updateCondition = (
    groupId: string,
    condId: string,
    updates: Partial<RuleCondition>
  ) => {
    setRules((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.map((c) => {
                if (c.id !== condId) return c;
                const updated = { ...c, ...updates };
                if (updates.value !== undefined || updates.type !== undefined) {
                  if (updated.type === "prerequisite" || updated.type === "corequisite") {
                    const target = availableCourses.find((ac) => ac.code === updated.value);
                    if (target) updated.label = `${target.code} - ${target.name}`;
                  } else if (updated.type === "ects_min") {
                    updated.label = `Minimum ${updated.value} ECTS`;
                  } else if (updated.type === "semester_min") {
                    updated.label = `Minimum semester ${updated.value}`;
                  }
                }
                return updated;
              }),
            }
          : g
      ),
    }));
  };

  const removeCondition = (groupId: string, condId: string) => {
    setRules((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId
          ? { ...g, conditions: g.conditions.filter((c) => c.id !== condId) }
          : g
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedRules: BulkRules = {
      ...rules,
      groups: rules.groups.filter((g) => g.conditions.length > 0),
    };
    onSave(Array.from(selectedProgrammes), cleanedRules);
    onOpenChange(false);
  };

  const totalConditions = rules.groups.reduce((acc, g) => acc + g.conditions.length, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-accent" />
            Assign Rules - {courseCode}
          </DialogTitle>
          <DialogDescription>
            Configure rules for <strong>{courseName}</strong> and select which
            programme-courses they apply to.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Step 1: Select Programmes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">
                1. Select Programme-Courses
              </Label>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={selectAll}>
                  Select All
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={deselectAll}>
                  Deselect All
                </Button>
              </div>
            </div>
            {programmes.length === 0 ? (
              <div className="text-center py-4 border border-dashed rounded-lg bg-muted/20 text-sm text-muted-foreground">
                This course is not linked to any programme
              </div>
            ) : (
              <div className="border rounded-lg max-h-48 overflow-y-auto">
                {programmes.map((prog) => (
                  <div
                    key={prog.id}
                    className={cn(
                      "flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0",
                      selectedProgrammes.has(prog.id) && "bg-accent/5"
                    )}
                    onClick={() => toggleProgramme(prog.id)}
                  >
                    <Checkbox
                      checked={selectedProgrammes.has(prog.id)}
                      onCheckedChange={() => toggleProgramme(prog.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-muted">
                          {degreeLabels[prog.degree]}
                        </span>
                        <span className="font-medium">{prog.name}</span>
                        <span className="text-sm text-muted-foreground">
                          ({prog.code})
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {prog.faculty}
                        {prog.semester != null && ` • Sem ${prog.semester}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {selectedProgrammes.size > 0 && (
              <p className="text-xs text-accent font-medium">
                {selectedProgrammes.size} programme
                {selectedProgrammes.size !== 1 && "s"} selected
              </p>
            )}
          </div>

          {/* Step 2: Configure Rules */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">
              2. Configure Rules
            </Label>

            {rules.groups.length > 1 && (
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
                <span className="text-sm font-medium">Connect groups with:</span>
                <Select
                  value={rules.groupOperator}
                  onValueChange={(v: "and" | "or") =>
                    setRules((prev) => ({ ...prev, groupOperator: v }))
                  }
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="and">AND</SelectItem>
                    <SelectItem value="or">OR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {rules.groups.length === 0 ? (
              <div className="text-center py-6 border border-dashed rounded-lg bg-muted/20">
                <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground text-sm mb-3">
                  No rule groups configured
                </p>
                <Button type="button" variant="outline" onClick={addGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule Group
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {rules.groups.map((group, gi) => (
                  <div key={group.id} className="space-y-2">
                    {gi > 0 && (
                      <div className="flex items-center gap-2 py-1">
                        <div className="flex-1 border-t border-dashed" />
                        <span className={cn(
                          "px-3 py-0.5 text-xs font-bold rounded-full",
                          rules.groupOperator === "and"
                            ? "bg-accent/20 text-accent"
                            : "bg-warning/20 text-warning"
                        )}>
                          {rules.groupOperator.toUpperCase()}
                        </span>
                        <div className="flex-1 border-t border-dashed" />
                      </div>
                    )}
                    <div className="border-2 rounded-lg overflow-hidden">
                      <div className="flex items-center justify-between p-2.5 bg-muted/30 border-b">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Group {gi + 1}</span>
                          <Select
                            value={group.operator}
                            onValueChange={(v: "and" | "or") =>
                              setRules((prev) => ({
                                ...prev,
                                groups: prev.groups.map((g) =>
                                  g.id === group.id ? { ...g, operator: v } : g
                                ),
                              }))
                            }
                          >
                            <SelectTrigger className="w-20 h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="and">AND</SelectItem>
                              <SelectItem value="or">OR</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeGroup(group.id)}
                          className="text-destructive hover:text-destructive h-7"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <div className="p-3 space-y-2">
                        {group.conditions.map((cond, ci) => {
                          const colors = conditionTypeColors[cond.type];
                          return (
                            <div key={cond.id}>
                              {ci > 0 && (
                                <div className="flex justify-center py-1">
                                  <span className={cn(
                                    "px-2 py-0.5 text-xs font-bold rounded",
                                    group.operator === "and"
                                      ? "bg-accent/20 text-accent"
                                      : "bg-warning/20 text-warning"
                                  )}>
                                    {group.operator.toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div className={cn("p-2.5 rounded-lg border-l-4", colors.bg, colors.border)}>
                                <div className="flex items-center gap-2">
                                  <Select
                                    value={cond.type}
                                    onValueChange={(v: RuleCondition["type"]) =>
                                      updateCondition(group.id, cond.id, { type: v, value: "" })
                                    }
                                  >
                                    <SelectTrigger className="h-8 w-[160px] text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="prerequisite">Must have passed</SelectItem>
                                      <SelectItem value="corequisite">Must be enrolled in</SelectItem>
                                      <SelectItem value="ects_min">Minimum ECTS</SelectItem>
                                      <SelectItem value="semester_min">Minimum semester</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {cond.type === "prerequisite" || cond.type === "corequisite" ? (
                                    <Select
                                      value={cond.value}
                                      onValueChange={(v) => updateCondition(group.id, cond.id, { value: v })}
                                    >
                                      <SelectTrigger className="h-8 flex-1 text-xs">
                                        <SelectValue placeholder="Select course..." />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {availableCourses
                                          .filter((ac) => ac.code !== courseCode)
                                          .map((ac) => (
                                            <SelectItem key={ac.code} value={ac.code}>
                                              {ac.code} - {ac.name}
                                            </SelectItem>
                                          ))}
                                      </SelectContent>
                                    </Select>
                                  ) : (
                                    <Input
                                      type="number"
                                      min={1}
                                      className="h-8 w-24 text-xs"
                                      placeholder={cond.type === "ects_min" ? "e.g. 60" : "e.g. 3"}
                                      value={cond.value}
                                      onChange={(e) =>
                                        updateCondition(group.id, cond.id, { value: e.target.value })
                                      }
                                    />
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeCondition(group.id, cond.id)}
                                    className="text-destructive h-7 w-7 p-0"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => addCondition(group.id)}
                          className="w-full text-xs"
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" />
                          Add Condition
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" onClick={addGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule Group
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={selectedProgrammes.size === 0 || totalConditions === 0}
            >
              Apply to {selectedProgrammes.size} Programme
              {selectedProgrammes.size !== 1 && "s"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
