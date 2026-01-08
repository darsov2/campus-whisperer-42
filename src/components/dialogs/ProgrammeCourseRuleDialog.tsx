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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { 
  ProgrammeCourse, 
  ProgrammeCourseRules, 
  RuleGroup, 
  RuleCondition,
  createEmptyRules 
} from "./ProgrammeCourseDialog";

interface ProgrammeCourseRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programmeCourse: ProgrammeCourse;
  allProgrammeCourses: ProgrammeCourse[];
  onSave: (programmeCourseId: string, rules: ProgrammeCourseRules) => void;
}

const ruleTypeLabels: Record<string, string> = {
  prerequisite: "Must have passed",
  corequisite: "Must be enrolled in",
  ects_min: "Minimum ECTS credits",
  semester_min: "Minimum semester",
};

const conditionTypeColors: Record<string, { bg: string; border: string; text: string }> = {
  prerequisite: {
    bg: "bg-accent/10",
    border: "border-accent/40",
    text: "text-accent",
  },
  corequisite: {
    bg: "bg-info/10",
    border: "border-info/40",
    text: "text-info",
  },
  ects_min: {
    bg: "bg-warning/10",
    border: "border-warning/40",
    text: "text-warning",
  },
  semester_min: {
    bg: "bg-success/10",
    border: "border-success/40",
    text: "text-success",
  },
};

function createEmptyRulesInternal(): ProgrammeCourseRules {
  return {
    groupOperator: "and",
    groups: [],
  };
}

export function ProgrammeCourseRuleDialog({
  open,
  onOpenChange,
  programmeCourse,
  allProgrammeCourses,
  onSave,
}: ProgrammeCourseRuleDialogProps) {
  const [rules, setRules] = useState<ProgrammeCourseRules>(createEmptyRulesInternal());

  useEffect(() => {
    if (programmeCourse) {
      // Handle both new and legacy rule formats
      if (programmeCourse.rules && 'groups' in programmeCourse.rules) {
        setRules(programmeCourse.rules);
      } else {
        setRules(createEmptyRulesInternal());
      }
    }
  }, [programmeCourse, open]);

  const addGroup = () => {
    const newGroup: RuleGroup = {
      id: `group-${Date.now()}`,
      operator: "and",
      conditions: [],
    };
    setRules((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
    }));
  };

  const removeGroup = (groupId: string) => {
    setRules((prev) => ({
      ...prev,
      groups: prev.groups.filter((g) => g.id !== groupId),
    }));
  };

  const updateGroupOperator = (groupId: string, operator: "and" | "or") => {
    setRules((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId ? { ...g, operator } : g
      ),
    }));
  };

  const addCondition = (groupId: string) => {
    const newCondition: RuleCondition = {
      id: `cond-${Date.now()}`,
      type: "prerequisite",
      value: "",
      label: "",
    };
    setRules((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId
          ? { ...g, conditions: [...g.conditions, newCondition] }
          : g
      ),
    }));
  };

  const updateCondition = (
    groupId: string,
    conditionId: string,
    updates: Partial<RuleCondition>
  ) => {
    setRules((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              conditions: g.conditions.map((c) => {
                if (c.id !== conditionId) return c;
                const updated = { ...c, ...updates };
                
                // Auto-update label
                if (updates.value !== undefined || updates.type !== undefined) {
                  if (updated.type === "prerequisite" || updated.type === "corequisite") {
                    const targetCourse = allProgrammeCourses.find(
                      (pc) => pc.courseCode === updated.value
                    );
                    if (targetCourse) {
                      updated.label = `${targetCourse.courseCode} - ${targetCourse.courseName}`;
                    }
                  } else if (updated.type === "ects_min") {
                    updated.label = `Minimum ${updated.value} ECTS credits`;
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

  const removeCondition = (groupId: string, conditionId: string) => {
    setRules((prev) => ({
      ...prev,
      groups: prev.groups.map((g) =>
        g.id === groupId
          ? { ...g, conditions: g.conditions.filter((c) => c.id !== conditionId) }
          : g
      ),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clean up empty groups
    const cleanedRules: ProgrammeCourseRules = {
      ...rules,
      groups: rules.groups.filter((g) => g.conditions.length > 0),
    };
    onSave(programmeCourse.id, cleanedRules);
    onOpenChange(false);
  };

  const availablePrerequisites = allProgrammeCourses.filter(
    (c) => c.id !== programmeCourse.id
  );

  const totalConditions = rules.groups.reduce(
    (acc, g) => acc + g.conditions.length,
    0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-accent" />
            Configure Rules for {programmeCourse.courseCode}
          </DialogTitle>
          <DialogDescription>
            Create rule groups with AND/OR logic for{" "}
            <strong>{programmeCourse.courseName}</strong>. Groups are connected by{" "}
            <strong className="text-accent">{rules.groupOperator.toUpperCase()}</strong>.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Group Operator */}
          {rules.groups.length > 1 && (
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border">
              <span className="text-sm font-medium">Connect groups with:</span>
              <Select
                value={rules.groupOperator}
                onValueChange={(value: "and" | "or") =>
                  setRules((prev) => ({ ...prev, groupOperator: value }))
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
              <span className="text-xs text-muted-foreground">
                {rules.groupOperator === "and"
                  ? "All groups must be satisfied"
                  : "At least one group must be satisfied"}
              </span>
            </div>
          )}

          {/* Rule Groups */}
          <div className="space-y-4">
            {rules.groups.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg bg-muted/20">
                <Layers className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No rule groups configured</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Add groups of conditions that students must meet to enroll
                </p>
                <Button type="button" variant="outline" onClick={addGroup}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Rule Group
                </Button>
              </div>
            ) : (
              rules.groups.map((group, groupIndex) => (
                <div key={group.id} className="space-y-2">
                  {/* Group Separator */}
                  {groupIndex > 0 && (
                    <div className="flex items-center gap-2 py-2">
                      <div className="flex-1 border-t border-dashed" />
                      <span
                        className={cn(
                          "px-3 py-1 text-sm font-bold rounded-full",
                          rules.groupOperator === "and"
                            ? "bg-accent/20 text-accent"
                            : "bg-warning/20 text-warning"
                        )}
                      >
                        {rules.groupOperator.toUpperCase()}
                      </span>
                      <div className="flex-1 border-t border-dashed" />
                    </div>
                  )}

                  {/* Group Card */}
                  <div className="border-2 rounded-lg overflow-hidden">
                    {/* Group Header */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 border-b">
                      <div className="flex items-center gap-3">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Group {groupIndex + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Conditions connected by:
                          </span>
                          <Select
                            value={group.operator}
                            onValueChange={(value: "and" | "or") =>
                              updateGroupOperator(group.id, value)
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
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGroup(group.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Conditions */}
                    <div className="p-3 space-y-3">
                      {group.conditions.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          No conditions in this group
                        </div>
                      ) : (
                        group.conditions.map((condition, condIndex) => {
                          const colors = conditionTypeColors[condition.type];
                          return (
                            <div key={condition.id} className="space-y-2">
                              {condIndex > 0 && (
                                <div className="flex justify-center">
                                  <span
                                    className={cn(
                                      "px-2 py-0.5 text-xs font-bold rounded",
                                      group.operator === "and"
                                        ? "bg-accent/20 text-accent"
                                        : "bg-warning/20 text-warning"
                                    )}
                                  >
                                    {group.operator.toUpperCase()}
                                  </span>
                                </div>
                              )}
                              <div
                                className={cn(
                                  "p-3 rounded-lg border-l-4",
                                  colors.bg,
                                  colors.border
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">
                                        Condition Type
                                      </Label>
                                      <Select
                                        value={condition.type}
                                        onValueChange={(
                                          value: RuleCondition["type"]
                                        ) =>
                                          updateCondition(group.id, condition.id, {
                                            type: value,
                                            value: "",
                                          })
                                        }
                                      >
                                        <SelectTrigger className="h-9">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="prerequisite">
                                            Must have passed
                                          </SelectItem>
                                          <SelectItem value="corequisite">
                                            Must be enrolled in
                                          </SelectItem>
                                          <SelectItem value="ects_min">
                                            Minimum ECTS
                                          </SelectItem>
                                          <SelectItem value="semester_min">
                                            Minimum semester
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>

                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">
                                        {condition.type === "prerequisite" ||
                                        condition.type === "corequisite"
                                          ? "Course"
                                          : "Value"}
                                      </Label>
                                      {condition.type === "prerequisite" ||
                                      condition.type === "corequisite" ? (
                                        <Select
                                          value={condition.value}
                                          onValueChange={(value) =>
                                            updateCondition(
                                              group.id,
                                              condition.id,
                                              { value }
                                            )
                                          }
                                        >
                                          <SelectTrigger className="h-9">
                                            <SelectValue placeholder="Select course..." />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availablePrerequisites.map((c) => (
                                              <SelectItem
                                                key={c.id}
                                                value={c.courseCode}
                                              >
                                                {c.courseCode} - {c.courseName}
                                              </SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      ) : (
                                        <Input
                                          type="number"
                                          min={1}
                                          className="h-9"
                                          placeholder={
                                            condition.type === "ects_min"
                                              ? "e.g. 60"
                                              : "e.g. 3"
                                          }
                                          value={condition.value}
                                          onChange={(e) =>
                                            updateCondition(
                                              group.id,
                                              condition.id,
                                              { value: e.target.value }
                                            )
                                          }
                                        />
                                      )}
                                    </div>
                                  </div>

                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      removeCondition(group.id, condition.id)
                                    }
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-4"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>

                                {condition.label && (
                                  <div className="mt-2 pt-2 border-t text-xs text-muted-foreground">
                                    <span className="font-medium">
                                      {ruleTypeLabels[condition.type]}:
                                    </span>{" "}
                                    {condition.label}
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addCondition(group.id)}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Condition to Group
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {rules.groups.length > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={addGroup}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Rule Group
            </Button>
          )}

          {/* Summary */}
          {totalConditions > 0 && (
            <div className="p-3 bg-muted/30 rounded-lg text-sm">
              <span className="font-medium">Summary: </span>
              {rules.groups.map((g, i) => (
                <span key={g.id}>
                  {i > 0 && (
                    <span className="font-bold text-accent mx-1">
                      {rules.groupOperator.toUpperCase()}
                    </span>
                  )}
                  <span className="text-muted-foreground">(</span>
                  {g.conditions.map((c, j) => (
                    <span key={c.id}>
                      {j > 0 && (
                        <span className="font-medium mx-1">
                          {g.operator.toUpperCase()}
                        </span>
                      )}
                      <span className={conditionTypeColors[c.type].text}>
                        {c.value || "[empty]"}
                      </span>
                    </span>
                  ))}
                  <span className="text-muted-foreground">)</span>
                </span>
              ))}
            </div>
          )}

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
              Save Rules
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
