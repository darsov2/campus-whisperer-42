import { GitBranch, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgrammeCourseRule } from "./dialogs/ProgrammeCourseDialog";

interface RulesVisualTreeProps {
  courseCode: string;
  courseName: string;
  rules: ProgrammeCourseRule[];
}

const ruleTypeLabels: Record<string, string> = {
  prerequisite: "Pass",
  corequisite: "Enroll with",
  ects_min: "ECTS ≥",
  semester_min: "Semester ≥",
};

const ruleTypeColors: Record<string, { bg: string; border: string; text: string }> = {
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

export function RulesVisualTree({ courseCode, courseName, rules }: RulesVisualTreeProps) {
  if (rules.length === 0) {
    return (
      <div className="flex items-center gap-4 p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Check className="h-5 w-5 text-success" />
          <span>No prerequisites - Open enrollment</span>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <div className="px-4 py-2 rounded-lg bg-success/10 border border-success/30 text-success font-medium">
          {courseCode}
        </div>
      </div>
    );
  }

  // Group rules by operator for visualization
  const groupedRules: { operator: "and" | "or"; rules: ProgrammeCourseRule[] }[] = [];
  let currentGroup: ProgrammeCourseRule[] = [];
  let currentOperator: "and" | "or" = "and";

  rules.forEach((rule, index) => {
    if (index === 0) {
      currentGroup.push(rule);
      currentOperator = rule.operator;
    } else if (rule.operator === currentOperator) {
      currentGroup.push(rule);
    } else {
      groupedRules.push({ operator: currentOperator, rules: currentGroup });
      currentGroup = [rule];
      currentOperator = rule.operator;
    }
  });
  if (currentGroup.length > 0) {
    groupedRules.push({ operator: currentOperator, rules: currentGroup });
  }

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex items-center gap-3 min-w-max">
        {/* Rules visualization */}
        <div className="flex items-center gap-2">
          {rules.map((rule, index) => {
            const colors = ruleTypeColors[rule.type];
            return (
              <div key={rule.id} className="flex items-center gap-2">
                {index > 0 && (
                  <span className={cn(
                    "px-2 py-0.5 text-xs font-bold rounded",
                    rule.operator === "and" 
                      ? "bg-accent/20 text-accent" 
                      : "bg-warning/20 text-warning"
                  )}>
                    {rule.operator.toUpperCase()}
                  </span>
                )}
                <div className={cn(
                  "px-3 py-2 rounded-lg border-2 text-sm",
                  colors.bg,
                  colors.border
                )}>
                  <div className={cn("text-xs font-medium mb-0.5", colors.text)}>
                    {ruleTypeLabels[rule.type]}
                  </div>
                  <div className="font-medium text-foreground">
                    {rule.type === "prerequisite" || rule.type === "corequisite" 
                      ? rule.value 
                      : rule.value}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Arrow */}
        <div className="flex items-center gap-1 px-2">
          <div className="h-0.5 w-6 bg-muted-foreground/30" />
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="h-0.5 w-6 bg-muted-foreground/30" />
        </div>

        {/* Target course */}
        <div className="px-4 py-3 rounded-lg bg-success/10 border-2 border-success/40">
          <div className="text-xs font-medium text-success mb-0.5">Can Enroll</div>
          <div className="font-semibold text-foreground">{courseCode}</div>
          <div className="text-xs text-muted-foreground truncate max-w-[150px]">
            {courseName}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-accent/30 border border-accent/50" />
          <span>Prerequisites</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-info/30 border border-info/50" />
          <span>Corequisites</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-warning/30 border border-warning/50" />
          <span>ECTS Minimum</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-success/30 border border-success/50" />
          <span>Semester Minimum</span>
        </div>
      </div>
    </div>
  );
}
