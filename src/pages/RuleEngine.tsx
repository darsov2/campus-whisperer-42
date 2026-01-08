import { useState } from "react";
import {
  BookOpen,
  Search,
  ChevronRight,
  GitBranch,
  Filter,
  GraduationCap,
  Eye,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { RulesVisualTree } from "@/components/RulesVisualTree";
import type { ProgrammeCourse, ProgrammeCourseRules } from "@/components/dialogs/ProgrammeCourseDialog";
import { createEmptyRules } from "@/components/dialogs/ProgrammeCourseDialog";

interface ProgrammeWithRules {
  id: string;
  name: string;
  code: string;
  degree: "bachelor" | "master" | "doctorate";
  courses: ProgrammeCourse[];
}

// Helper to count conditions
function countConditions(rules: ProgrammeCourseRules): number {
  if (!rules || !rules.groups) return 0;
  return rules.groups.reduce((acc, g) => acc + g.conditions.length, 0);
}

// Helper to get all condition types
function getConditionTypes(rules: ProgrammeCourseRules): string[] {
  if (!rules || !rules.groups) return [];
  const types = new Set<string>();
  rules.groups.forEach(g => g.conditions.forEach(c => types.add(c.type)));
  return Array.from(types);
}

const programmes: ProgrammeWithRules[] = [
  {
    id: "1",
    name: "Computer Science",
    code: "CS-BSC",
    degree: "bachelor",
    courses: [
      {
        id: "pc1",
        courseId: "1",
        courseCode: "CS101",
        courseName: "Introduction to Programming",
        ects: 6,
        semester: 1,
        type: "mandatory",
        rules: createEmptyRules(),
      },
      {
        id: "pc2",
        courseId: "6",
        courseCode: "CS102",
        courseName: "Programming Lab",
        ects: 3,
        semester: 1,
        type: "mandatory",
        rules: {
          groupOperator: "and",
          groups: [{ id: "g1", operator: "and", conditions: [{ id: "c1", type: "corequisite", value: "CS101", label: "CS101" }] }],
        },
      },
      {
        id: "pc3",
        courseId: "2",
        courseCode: "CS201",
        courseName: "Data Structures and Algorithms",
        ects: 6,
        semester: 3,
        type: "mandatory",
        rules: {
          groupOperator: "or",
          groups: [
            { id: "g1", operator: "and", conditions: [{ id: "c1", type: "prerequisite", value: "CS101", label: "CS101" }, { id: "c2", type: "prerequisite", value: "MA101", label: "MA101" }] },
            { id: "g2", operator: "and", conditions: [{ id: "c3", type: "ects_min", value: "100", label: "100 ECTS" }] },
          ],
        },
      },
      {
        id: "pc4",
        courseId: "4",
        courseCode: "MA101",
        courseName: "Calculus I",
        ects: 7,
        semester: 1,
        type: "mandatory",
        rules: createEmptyRules(),
      },
    ],
  },
];

const ruleTypeLabels: Record<string, string> = {
  prerequisite: "Prerequisite",
  corequisite: "Corequisite",
  ects_min: "Min ECTS",
  semester_min: "Min Semester",
};

const ruleTypeColors: Record<string, string> = {
  prerequisite: "bg-accent/10 text-accent border-accent/30",
  corequisite: "bg-info/10 text-info border-info/30",
  ects_min: "bg-warning/10 text-warning border-warning/30",
  semester_min: "bg-success/10 text-success border-success/30",
};

const degreeLabels = {
  bachelor: "Bachelor's",
  master: "Master's",
  doctorate: "Doctorate",
};

function ProgrammeRulesCard({
  programme,
  expandedCourse,
  onToggleCourse,
}: {
  programme: ProgrammeWithRules;
  expandedCourse: string | null;
  onToggleCourse: (courseId: string) => void;
}) {
  const coursesWithRules = programme.courses.filter((c) => countConditions(c.rules) > 0);
  const totalRules = programme.courses.reduce((acc, c) => acc + countConditions(c.rules), 0);

  return (
    <div className="data-card overflow-hidden">
      <div className="p-5 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <GraduationCap className="h-5 w-5 text-accent" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{programme.name}</h3>
              <span className="font-mono text-sm text-muted-foreground">{programme.code}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {degreeLabels[programme.degree]}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{programme.courses.length} courses</span>
              <span className="text-accent font-medium">{totalRules} conditions</span>
              <span>{coursesWithRules.length} courses with rules</span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {programme.courses.map((course) => {
          const condCount = countConditions(course.rules);
          const types = getConditionTypes(course.rules);
          return (
            <div key={course.id}>
              <div
                className={cn("p-4 cursor-pointer hover:bg-muted/30 transition-colors", expandedCourse === course.id && "bg-muted/30")}
                onClick={() => onToggleCourse(course.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BookOpen className={cn("h-4 w-4", condCount > 0 ? "text-accent" : "text-muted-foreground")} />
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">{course.courseCode}</span>
                    <span className="font-medium">{course.courseName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {condCount > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {types.map((type) => (
                            <span key={type} className={cn("px-2 py-0.5 text-xs rounded-full border", ruleTypeColors[type])}>
                              {ruleTypeLabels[type]}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm text-accent font-medium">{condCount} condition{condCount !== 1 && "s"}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Open enrollment</span>
                    )}
                    <ChevronRight className={cn("h-4 w-4 text-muted-foreground transition-transform", expandedCourse === course.id && "rotate-90")} />
                  </div>
                </div>
              </div>
              {expandedCourse === course.id && (
                <div className="border-t bg-muted/10">
                  <RulesVisualTree courseCode={course.courseCode} courseName={course.courseName} rules={course.rules} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RuleEngine() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  const allCourses = programmes.flatMap((p) => p.courses.map((c) => ({ ...c, programmeCode: p.code })));

  const filteredProgrammes = programmes
    .map((p) => ({
      ...p,
      courses: p.courses.filter((course) => {
        const matchesSearch = course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) || course.courseCode.toLowerCase().includes(searchQuery.toLowerCase());
        const condCount = countConditions(course.rules);
        if (filterType === "all") return matchesSearch;
        if (filterType === "with-rules") return matchesSearch && condCount > 0;
        if (filterType === "no-rules") return matchesSearch && condCount === 0;
        return matchesSearch && getConditionTypes(course.rules).includes(filterType);
      }),
    }))
    .filter((p) => p.courses.length > 0);

  const totalCourses = allCourses.length;
  const coursesWithRules = allCourses.filter((c) => countConditions(c.rules) > 0).length;
  const totalRules = allCourses.reduce((acc, c) => acc + countConditions(c.rules), 0);

  return (
    <div className="page-container">
      <PageHeader title="Rule Engine" description="Visual overview of all enrollment rules. Edit rules in Programmes → Manage Courses." />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4"><p className="text-2xl font-semibold">{programmes.length}</p><p className="text-sm text-muted-foreground">Programmes</p></div>
        <div className="data-card p-4"><p className="text-2xl font-semibold">{totalCourses}</p><p className="text-sm text-muted-foreground">Courses</p></div>
        <div className="data-card p-4"><p className="text-2xl font-semibold">{coursesWithRules}</p><p className="text-sm text-muted-foreground">With Rules</p></div>
        <div className="data-card p-4"><p className="text-2xl font-semibold">{totalRules}</p><p className="text-sm text-muted-foreground">Conditions</p></div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="with-rules">With Rules</SelectItem>
            <SelectItem value="no-rules">No Rules</SelectItem>
            <SelectItem value="prerequisite">Prerequisites</SelectItem>
            <SelectItem value="corequisite">Corequisites</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6 p-4 rounded-lg bg-info/10 border border-info/30 text-sm">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 text-info" />
          <p className="text-muted-foreground">Read-only view. To edit rules, go to <span className="text-accent font-medium">Study Programmes → Manage Courses</span>.</p>
        </div>
      </div>

      <div className="space-y-4">
        {filteredProgrammes.map((programme) => (
          <ProgrammeRulesCard key={programme.id} programme={programme} expandedCourse={expandedCourse} onToggleCourse={(id) => setExpandedCourse(expandedCourse === id ? null : id)} />
        ))}
      </div>
    </div>
  );
}
