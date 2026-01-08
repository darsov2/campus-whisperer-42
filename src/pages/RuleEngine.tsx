import { useState } from "react";
import { 
  Workflow, 
  Plus, 
  Search,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  GitBranch,
  Zap
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface Rule {
  id: string;
  name: string;
  description: string;
  targetCourse: string;
  targetCourseCode: string;
  type: "prerequisite" | "corequisite" | "ects" | "custom";
  conditions: Condition[];
  status: "active" | "draft" | "inactive";
  priority: number;
}

interface Condition {
  id: string;
  type: "course_passed" | "course_enrolled" | "ects_min" | "ects_max" | "semester_min";
  operator: "and" | "or";
  value: string;
  label: string;
}

const rules: Rule[] = [
  {
    id: "1",
    name: "CS201 Prerequisites",
    description: "Students must complete introductory courses before enrolling in Data Structures",
    targetCourse: "Data Structures and Algorithms",
    targetCourseCode: "CS201",
    type: "prerequisite",
    status: "active",
    priority: 1,
    conditions: [
      { id: "c1", type: "course_passed", operator: "and", value: "CS101", label: "CS101 - Intro to Programming" },
      { id: "c2", type: "course_passed", operator: "and", value: "MA101", label: "MA101 - Calculus I" },
    ],
  },
  {
    id: "2",
    name: "CS301 Prerequisites",
    description: "Database Systems requires programming and math foundations",
    targetCourse: "Database Systems",
    targetCourseCode: "CS301",
    type: "prerequisite",
    status: "active",
    priority: 1,
    conditions: [
      { id: "c3", type: "course_passed", operator: "and", value: "CS201", label: "CS201 - Data Structures" },
      { id: "c4", type: "ects_min", operator: "and", value: "60", label: "Minimum 60 ECTS credits" },
    ],
  },
  {
    id: "3",
    name: "Master's Entry Requirements",
    description: "Entry requirements for CS Master's programme",
    targetCourse: "Machine Learning",
    targetCourseCode: "CS401",
    type: "ects",
    status: "active",
    priority: 2,
    conditions: [
      { id: "c5", type: "ects_min", operator: "and", value: "180", label: "Bachelor's degree (180 ECTS)" },
      { id: "c6", type: "course_passed", operator: "and", value: "CS301", label: "CS301 - Database Systems" },
      { id: "c7", type: "course_passed", operator: "or", value: "MA301", label: "MA301 - Linear Algebra" },
    ],
  },
  {
    id: "4",
    name: "Lab Course Corequisite",
    description: "Programming Lab must be taken alongside the main course",
    targetCourse: "Programming Lab",
    targetCourseCode: "CS102",
    type: "corequisite",
    status: "draft",
    priority: 1,
    conditions: [
      { id: "c8", type: "course_enrolled", operator: "and", value: "CS101", label: "CS101 - Intro to Programming" },
    ],
  },
];

const ruleTypeIcons = {
  prerequisite: GitBranch,
  corequisite: Zap,
  ects: CheckCircle2,
  custom: Workflow,
};

const ruleTypeLabels = {
  prerequisite: "Prerequisite",
  corequisite: "Corequisite",
  ects: "ECTS Requirement",
  custom: "Custom Rule",
};

function ConditionNode({ condition, isLast }: { condition: Condition; isLast: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "dependency-node",
        condition.type === "course_passed" && "dependency-node-required",
        condition.type === "course_enrolled" && "dependency-node-optional",
        (condition.type === "ects_min" || condition.type === "ects_max" || condition.type === "semester_min") && "border-info/50 bg-info/5 text-info"
      )}>
        {condition.label}
      </div>
      {!isLast && (
        <span className="text-xs font-medium text-muted-foreground uppercase px-2 py-1 bg-muted rounded">
          {condition.operator}
        </span>
      )}
    </div>
  );
}

function RuleCard({ rule }: { rule: Rule }) {
  const [expanded, setExpanded] = useState(false);
  const TypeIcon = ruleTypeIcons[rule.type];

  return (
    <div className="data-card overflow-hidden">
      <div 
        className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <TypeIcon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{rule.name}</h3>
                <StatusBadge status={rule.status} />
                <span className="text-xs bg-muted px-2 py-0.5 rounded">
                  Priority: {rule.priority}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">{rule.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium">Target:</span>
                <span className="font-mono text-sm bg-primary/10 text-primary px-2 py-0.5 rounded">
                  {rule.targetCourseCode}
                </span>
                <span className="text-sm text-muted-foreground">{rule.targetCourse}</span>
              </div>
            </div>
          </div>
          <ChevronRight className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            expanded && "rotate-90"
          )} />
        </div>
      </div>

      {expanded && (
        <div className="border-t bg-muted/20 p-5">
          <h4 className="font-medium text-sm mb-4">Rule Conditions</h4>
          <div className="flex items-center flex-wrap gap-3">
            <div className="text-sm text-muted-foreground mr-2">Student must:</div>
            {rule.conditions.map((condition, index) => (
              <ConditionNode 
                key={condition.id} 
                condition={condition} 
                isLast={index === rule.conditions.length - 1}
              />
            ))}
            <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
            <div className="dependency-node dependency-node-passed">
              Can enroll in {rule.targetCourseCode}
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline">Edit Rule</Button>
            <Button size="sm" variant="outline">Test Rule</Button>
            <Button size="sm" variant="outline" className="text-destructive">Disable</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RuleEngine() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRules = rules.filter((rule) =>
    rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    rule.targetCourseCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="page-container">
      <PageHeader 
        title="Rule Engine" 
        description="Configure enrollment rules, prerequisites, and dependency trees"
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Rule
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <Workflow className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{rules.length}</p>
              <p className="text-sm text-muted-foreground">Total Rules</p>
            </div>
          </div>
        </div>
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{rules.filter(r => r.status === "active").length}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </div>
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{rules.filter(r => r.status === "draft").length}</p>
              <p className="text-sm text-muted-foreground">Draft</p>
            </div>
          </div>
        </div>
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <XCircle className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{rules.filter(r => r.status === "inactive").length}</p>
              <p className="text-sm text-muted-foreground">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="bg-muted">
            <TabsTrigger value="all">All Rules</TabsTrigger>
            <TabsTrigger value="prerequisite">Prerequisites</TabsTrigger>
            <TabsTrigger value="corequisite">Corequisites</TabsTrigger>
            <TabsTrigger value="ects">ECTS</TabsTrigger>
          </TabsList>
          
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <TabsContent value="all" className="space-y-3">
          {filteredRules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </TabsContent>
        
        <TabsContent value="prerequisite" className="space-y-3">
          {filteredRules.filter(r => r.type === "prerequisite").map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </TabsContent>
        
        <TabsContent value="corequisite" className="space-y-3">
          {filteredRules.filter(r => r.type === "corequisite").map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </TabsContent>
        
        <TabsContent value="ects" className="space-y-3">
          {filteredRules.filter(r => r.type === "ects").map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
