import { useState, useEffect } from "react";
import { GitBranch, Plus, Trash2 } from "lucide-react";
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
import type { ProgrammeCourse, ProgrammeCourseRule } from "./ProgrammeCourseDialog";

interface ProgrammeCourseRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programmeCourse: ProgrammeCourse;
  allProgrammeCourses: ProgrammeCourse[];
  onSave: (programmeCourseId: string, rules: ProgrammeCourseRule[]) => void;
}

const ruleTypeLabels: Record<string, string> = {
  prerequisite: "Must have passed",
  corequisite: "Must be enrolled in",
  ects_min: "Minimum ECTS credits",
  semester_min: "Minimum semester",
};

export function ProgrammeCourseRuleDialog({
  open,
  onOpenChange,
  programmeCourse,
  allProgrammeCourses,
  onSave,
}: ProgrammeCourseRuleDialogProps) {
  const [rules, setRules] = useState<ProgrammeCourseRule[]>([]);

  useEffect(() => {
    if (programmeCourse) {
      setRules(programmeCourse.rules || []);
    }
  }, [programmeCourse, open]);

  const addRule = () => {
    const newRule: ProgrammeCourseRule = {
      id: `rule-${Date.now()}`,
      type: "prerequisite",
      operator: rules.length > 0 ? "and" : "and",
      value: "",
      label: "",
    };
    setRules([...rules, newRule]);
  };

  const updateRule = (index: number, updates: Partial<ProgrammeCourseRule>) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], ...updates };

    // Auto-update label based on type and value
    if (updates.value !== undefined || updates.type !== undefined) {
      const rule = newRules[index];
      if (rule.type === "prerequisite" || rule.type === "corequisite") {
        const targetCourse = allProgrammeCourses.find(
          (c) => c.courseCode === rule.value
        );
        if (targetCourse) {
          newRules[index].label = `${targetCourse.courseCode} - ${targetCourse.courseName}`;
        }
      } else if (rule.type === "ects_min") {
        newRules[index].label = `Minimum ${rule.value} ECTS credits`;
      } else if (rule.type === "semester_min") {
        newRules[index].label = `Minimum semester ${rule.value}`;
      }
    }

    setRules(newRules);
  };

  const removeRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(programmeCourse.id, rules);
    onOpenChange(false);
  };

  const availablePrerequisites = allProgrammeCourses.filter(
    (c) => c.id !== programmeCourse.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-accent" />
            Configure Rules for {programmeCourse.courseCode}
          </DialogTitle>
          <DialogDescription>
            Define prerequisites, corequisites, and other enrollment conditions
            for <strong>{programmeCourse.courseName}</strong> in this programme
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            {rules.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-lg bg-muted/20">
                <GitBranch className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No rules configured</p>
                <p className="text-sm text-muted-foreground">
                  Add conditions that students must meet to enroll in this
                  course
                </p>
              </div>
            ) : (
              rules.map((rule, index) => (
                <div key={rule.id} className="space-y-3">
                  {index > 0 && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 border-t" />
                      <Select
                        value={rule.operator}
                        onValueChange={(value: "and" | "or") =>
                          updateRule(index, { operator: value })
                        }
                      >
                        <SelectTrigger className="w-20 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="and">AND</SelectItem>
                          <SelectItem value="or">OR</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex-1 border-t" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "p-4 rounded-lg border bg-card",
                      rule.type === "prerequisite" &&
                        "border-l-4 border-l-accent",
                      rule.type === "corequisite" && "border-l-4 border-l-info",
                      (rule.type === "ects_min" ||
                        rule.type === "semester_min") &&
                        "border-l-4 border-l-warning"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            Condition Type
                          </Label>
                          <Select
                            value={rule.type}
                            onValueChange={(
                              value: ProgrammeCourseRule["type"]
                            ) => updateRule(index, { type: value, value: "" })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="prerequisite">
                                Must have passed (Prerequisite)
                              </SelectItem>
                              <SelectItem value="corequisite">
                                Must be enrolled in (Corequisite)
                              </SelectItem>
                              <SelectItem value="ects_min">
                                Minimum ECTS credits
                              </SelectItem>
                              <SelectItem value="semester_min">
                                Minimum semester
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-xs text-muted-foreground">
                            {rule.type === "prerequisite" ||
                            rule.type === "corequisite"
                              ? "Course"
                              : "Value"}
                          </Label>
                          {rule.type === "prerequisite" ||
                          rule.type === "corequisite" ? (
                            <Select
                              value={rule.value}
                              onValueChange={(value) =>
                                updateRule(index, { value })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select course..." />
                              </SelectTrigger>
                              <SelectContent>
                                {availablePrerequisites.map((c) => (
                                  <SelectItem key={c.id} value={c.courseCode}>
                                    {c.courseCode} - {c.courseName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type="number"
                              min={1}
                              placeholder={
                                rule.type === "ects_min" ? "e.g. 60" : "e.g. 3"
                              }
                              value={rule.value}
                              onChange={(e) =>
                                updateRule(index, { value: e.target.value })
                              }
                            />
                          )}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRule(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {rule.label && (
                      <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                        <span className="font-medium">
                          {ruleTypeLabels[rule.type]}:
                        </span>{" "}
                        {rule.label}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            onClick={addRule}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>

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
