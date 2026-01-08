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
import { StatusBadge } from "@/components/ui/status-badge";
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
import type { ProgrammeCourse, ProgrammeCourseRule } from "@/components/dialogs/ProgrammeCourseDialog";

interface ProgrammeWithRules {
  id: string;
  name: string;
  code: string;
  degree: "bachelor" | "master" | "doctorate";
  courses: ProgrammeCourse[];
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
        rules: [],
      },
      {
        id: "pc2",
        courseId: "6",
        courseCode: "CS102",
        courseName: "Programming Lab",
        ects: 3,
        semester: 1,
        type: "mandatory",
        rules: [
          {
            id: "r1",
            type: "corequisite",
            operator: "and",
            value: "CS101",
            label: "CS101 - Introduction to Programming",
          },
        ],
      },
      {
        id: "pc3",
        courseId: "2",
        courseCode: "CS201",
        courseName: "Data Structures and Algorithms",
        ects: 6,
        semester: 3,
        type: "mandatory",
        rules: [
          {
            id: "r2",
            type: "prerequisite",
            operator: "and",
            value: "CS101",
            label: "CS101 - Introduction to Programming",
          },
          {
            id: "r3",
            type: "prerequisite",
            operator: "and",
            value: "MA101",
            label: "MA101 - Calculus I",
          },
        ],
      },
      {
        id: "pc4",
        courseId: "4",
        courseCode: "MA101",
        courseName: "Calculus I",
        ects: 7,
        semester: 1,
        type: "mandatory",
        rules: [],
      },
      {
        id: "pc5",
        courseId: "3",
        courseCode: "CS301",
        courseName: "Database Systems",
        ects: 5,
        semester: 5,
        type: "mandatory",
        rules: [
          {
            id: "r4",
            type: "prerequisite",
            operator: "and",
            value: "CS201",
            label: "CS201 - Data Structures and Algorithms",
          },
          {
            id: "r5",
            type: "ects_min",
            operator: "and",
            value: "60",
            label: "Minimum 60 ECTS credits",
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Computer Science",
    code: "CS-MSC",
    degree: "master",
    courses: [
      {
        id: "pc6",
        courseId: "5",
        courseCode: "CS401",
        courseName: "Machine Learning",
        ects: 6,
        semester: 1,
        type: "mandatory",
        rules: [
          {
            id: "r6",
            type: "ects_min",
            operator: "and",
            value: "180",
            label: "Minimum 180 ECTS credits",
          },
        ],
      },
      {
        id: "pc7",
        courseId: "3",
        courseCode: "CS301",
        courseName: "Database Systems",
        ects: 5,
        semester: 1,
        type: "elective",
        rules: [],
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
  const coursesWithRules = programme.courses.filter((c) => c.rules.length > 0);
  const totalRules = programme.courses.reduce(
    (acc, c) => acc + c.rules.length,
    0
  );

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
              <span className="font-mono text-sm text-muted-foreground">
                {programme.code}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">
                {degreeLabels[programme.degree]}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span>{programme.courses.length} courses</span>
              <span className="text-accent font-medium">
                {totalRules} rules configured
              </span>
              <span>{coursesWithRules.length} courses with rules</span>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y">
        {programme.courses.map((course) => (
          <div key={course.id}>
            <div
              className={cn(
                "p-4 cursor-pointer hover:bg-muted/30 transition-colors",
                expandedCourse === course.id && "bg-muted/30"
              )}
              onClick={() => onToggleCourse(course.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <BookOpen
                    className={cn(
                      "h-4 w-4",
                      course.rules.length > 0
                        ? "text-accent"
                        : "text-muted-foreground"
                    )}
                  />
                  <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                    {course.courseCode}
                  </span>
                  <span className="font-medium">{course.courseName}</span>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      course.type === "mandatory"
                        ? "bg-accent/10 text-accent"
                        : "bg-info/10 text-info"
                    )}
                  >
                    {course.type === "mandatory" ? "Mandatory" : "Elective"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {course.rules.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {Array.from(new Set(course.rules.map((r) => r.type))).map(
                          (type) => (
                            <span
                              key={type}
                              className={cn(
                                "px-2 py-0.5 text-xs rounded-full border",
                                ruleTypeColors[type]
                              )}
                            >
                              {ruleTypeLabels[type]}
                            </span>
                          )
                        )}
                      </div>
                      <span className="text-sm text-accent font-medium">
                        {course.rules.length} rule
                        {course.rules.length !== 1 && "s"}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Open enrollment
                    </span>
                  )}
                  <ChevronRight
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      expandedCourse === course.id && "rotate-90"
                    )}
                  />
                </div>
              </div>
            </div>

            {expandedCourse === course.id && (
              <div className="border-t bg-muted/10">
                <RulesVisualTree
                  courseCode={course.courseCode}
                  courseName={course.courseName}
                  rules={course.rules}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RuleEngine() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

  // Flatten courses for filtering
  const allCourses = programmes.flatMap((p) =>
    p.courses.map((c) => ({ ...c, programmeCode: p.code, programmeName: p.name }))
  );

  const filteredProgrammes = programmes
    .map((p) => ({
      ...p,
      courses: p.courses.filter((course) => {
        const matchesSearch =
          course.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          course.courseCode.toLowerCase().includes(searchQuery.toLowerCase());

        if (filterType === "all") return matchesSearch;
        if (filterType === "with-rules")
          return matchesSearch && course.rules.length > 0;
        if (filterType === "no-rules")
          return matchesSearch && course.rules.length === 0;
        return matchesSearch && course.rules.some((r) => r.type === filterType);
      }),
    }))
    .filter((p) => p.courses.length > 0);

  const totalCourses = allCourses.length;
  const coursesWithRules = allCourses.filter((c) => c.rules.length > 0).length;
  const totalRules = allCourses.reduce((acc, c) => acc + c.rules.length, 0);

  return (
    <div className="page-container">
      <PageHeader
        title="Rule Engine"
        description="Visual overview of all enrollment rules across programmes. Rules are configured per programme course in the Programmes section."
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{programmes.length}</p>
              <p className="text-sm text-muted-foreground">Programmes</p>
            </div>
          </div>
        </div>
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalCourses}</p>
              <p className="text-sm text-muted-foreground">Programme Courses</p>
            </div>
          </div>
        </div>
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <GitBranch className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{coursesWithRules}</p>
              <p className="text-sm text-muted-foreground">With Rules</p>
            </div>
          </div>
        </div>
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <GitBranch className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{totalRules}</p>
              <p className="text-sm text-muted-foreground">Total Rules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by rules" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Courses</SelectItem>
            <SelectItem value="with-rules">With Rules</SelectItem>
            <SelectItem value="no-rules">No Rules</SelectItem>
            <SelectItem value="prerequisite">Prerequisites</SelectItem>
            <SelectItem value="corequisite">Corequisites</SelectItem>
            <SelectItem value="ects_min">ECTS Requirements</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info Banner */}
      <div className="mb-6 p-4 rounded-lg bg-info/10 border border-info/30 text-sm">
        <div className="flex items-start gap-3">
          <Eye className="h-5 w-5 text-info mt-0.5" />
          <div>
            <p className="font-medium text-info">Visual Rules Overview</p>
            <p className="text-muted-foreground mt-1">
              This page provides a read-only view of all enrollment rules. To
              edit rules, go to{" "}
              <span className="text-accent font-medium">
                Study Programmes → Manage Courses
              </span>{" "}
              and configure rules for each programme course.
            </p>
          </div>
        </div>
      </div>

      {/* Programme List */}
      <div className="space-y-4">
        {filteredProgrammes.map((programme) => (
          <ProgrammeRulesCard
            key={programme.id}
            programme={programme}
            expandedCourse={expandedCourse}
            onToggleCourse={(courseId) =>
              setExpandedCourse(expandedCourse === courseId ? null : courseId)
            }
          />
        ))}
      </div>

      {filteredProgrammes.length === 0 && (
        <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
          <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No matching courses found</p>
          <p className="text-sm text-muted-foreground">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
}
