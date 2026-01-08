import { useState } from "react";
import { 
  BookOpen,
  Plus, 
  Search,
  ChevronRight,
  GitBranch,
  ArrowRight,
  Filter
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
import { RuleDialog } from "@/components/dialogs/RuleDialog";
import type { Course, CourseRule } from "@/components/dialogs/CourseDialog";
import { toast } from "sonner";

// Shared course data with rules
const initialCourses: Course[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Programming",
    faculty: "Faculty of Computer Science",
    programme: "Computer Science BSc",
    ects: 6,
    semester: 1,
    teachers: ["Dr. John Smith", "Prof. Maria Garcia"],
    status: "active",
    rules: [],
  },
  {
    id: "2",
    code: "CS201",
    name: "Data Structures and Algorithms",
    faculty: "Faculty of Computer Science",
    programme: "Computer Science BSc",
    ects: 6,
    semester: 3,
    teachers: ["Dr. John Smith"],
    status: "active",
    rules: [
      { id: "r1", type: "prerequisite", operator: "and", value: "CS101", label: "CS101 - Introduction to Programming" },
      { id: "r2", type: "prerequisite", operator: "and", value: "MA101", label: "MA101 - Calculus I" },
    ],
  },
  {
    id: "3",
    code: "CS301",
    name: "Database Systems",
    faculty: "Faculty of Computer Science",
    programme: "Computer Science BSc",
    ects: 5,
    semester: 5,
    teachers: ["Prof. Anna Johnson"],
    status: "active",
    rules: [
      { id: "r3", type: "prerequisite", operator: "and", value: "CS201", label: "CS201 - Data Structures and Algorithms" },
      { id: "r4", type: "ects_min", operator: "and", value: "60", label: "Minimum 60 ECTS credits" },
    ],
  },
  {
    id: "4",
    code: "MA101",
    name: "Calculus I",
    faculty: "Faculty of Natural Sciences",
    programme: "Mathematics BSc",
    ects: 7,
    semester: 1,
    teachers: ["Prof. David Lee"],
    status: "active",
    rules: [],
  },
  {
    id: "5",
    code: "CS401",
    name: "Machine Learning",
    faculty: "Faculty of Computer Science",
    programme: "Computer Science MSc",
    ects: 6,
    semester: 1,
    teachers: ["Dr. Sarah Chen"],
    status: "active",
    rules: [
      { id: "r5", type: "ects_min", operator: "and", value: "180", label: "Minimum 180 ECTS credits" },
      { id: "r6", type: "prerequisite", operator: "and", value: "CS301", label: "CS301 - Database Systems" },
      { id: "r7", type: "prerequisite", operator: "or", value: "MA101", label: "MA101 - Calculus I" },
    ],
  },
  {
    id: "6",
    code: "CS102",
    name: "Programming Lab",
    faculty: "Faculty of Computer Science",
    programme: "Computer Science BSc",
    ects: 3,
    semester: 1,
    teachers: ["Dr. John Smith"],
    status: "active",
    rules: [
      { id: "r8", type: "corequisite", operator: "and", value: "CS101", label: "CS101 - Introduction to Programming" },
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

function CourseRuleCard({ 
  course, 
  onConfigureRules 
}: { 
  course: Course;
  onConfigureRules: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="data-card overflow-hidden">
      <div 
        className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={cn(
              "p-3 rounded-lg",
              course.rules.length > 0 ? "bg-accent/10" : "bg-muted"
            )}>
              <BookOpen className={cn(
                "h-5 w-5",
                course.rules.length > 0 ? "text-accent" : "text-muted-foreground"
              )} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                  {course.code}
                </span>
                <h3 className="font-semibold">{course.name}</h3>
                <StatusBadge status={course.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {course.faculty} • {course.ects} ECTS • Semester {course.semester}
              </p>
              
              {course.rules.length > 0 && (
                <div className="flex items-center gap-2 mt-3">
                  <GitBranch className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium text-accent">
                    {course.rules.length} enrollment rule{course.rules.length !== 1 && "s"}
                  </span>
                  <div className="flex gap-1 ml-2">
                    {Array.from(new Set(course.rules.map(r => r.type))).map(type => (
                      <span 
                        key={type} 
                        className={cn("px-2 py-0.5 text-xs rounded-full border", ruleTypeColors[type])}
                      >
                        {ruleTypeLabels[type]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {course.rules.length === 0 && (
                <p className="text-sm text-muted-foreground mt-3 italic">
                  No enrollment rules - any student can enroll
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={(e) => { e.stopPropagation(); onConfigureRules(); }}
            >
              <GitBranch className="h-4 w-4 mr-2" />
              {course.rules.length > 0 ? "Edit Rules" : "Add Rules"}
            </Button>
            <ChevronRight className={cn(
              "h-5 w-5 text-muted-foreground transition-transform",
              expanded && "rotate-90"
            )} />
          </div>
        </div>
      </div>

      {expanded && course.rules.length > 0 && (
        <div className="border-t bg-muted/20 p-5">
          <h4 className="font-medium text-sm mb-4">Enrollment Conditions</h4>
          <div className="flex items-center flex-wrap gap-3">
            <div className="text-sm text-muted-foreground mr-2">To enroll, student must:</div>
            {course.rules.map((rule, index) => (
              <div key={rule.id} className="flex items-center gap-2">
                {index > 0 && (
                  <span className="text-xs font-medium text-muted-foreground uppercase px-2 py-1 bg-muted rounded">
                    {rule.operator}
                  </span>
                )}
                <div className={cn(
                  "px-3 py-1.5 rounded-lg border text-sm",
                  ruleTypeColors[rule.type]
                )}>
                  <span className="font-medium">{ruleTypeLabels[rule.type]}:</span> {rule.label}
                </div>
              </div>
            ))}
            <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
            <div className="px-3 py-1.5 rounded-lg bg-success/10 text-success border border-success/30 text-sm font-medium">
              Can enroll in {course.code}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RuleEngine() {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "with-rules") return matchesSearch && course.rules.length > 0;
    if (filterType === "no-rules") return matchesSearch && course.rules.length === 0;
    return matchesSearch && course.rules.some(r => r.type === filterType);
  });

  const handleSaveRules = (courseId: string, rules: CourseRule[]) => {
    setCourses(prev => prev.map(c => c.id === courseId ? { ...c, rules } : c));
    toast.success("Rules saved successfully");
  };

  const coursesWithRules = courses.filter(c => c.rules.length > 0).length;
  const totalRules = courses.reduce((acc, c) => acc + c.rules.length, 0);

  return (
    <div className="page-container">
      <PageHeader 
        title="Rule Engine" 
        description="Configure enrollment rules, prerequisites, and dependencies for each course"
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{courses.length}</p>
              <p className="text-sm text-muted-foreground">Total Courses</p>
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
            <div className="p-2 rounded-lg bg-success/10">
              <BookOpen className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{courses.length - coursesWithRules}</p>
              <p className="text-sm text-muted-foreground">Open Enrollment</p>
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

      {/* Course List */}
      <div className="space-y-3">
        {filteredCourses.map((course) => (
          <CourseRuleCard 
            key={course.id} 
            course={course}
            onConfigureRules={() => { setSelectedCourse(course); setRuleDialogOpen(true); }}
          />
        ))}
      </div>

      {selectedCourse && (
        <RuleDialog
          open={ruleDialogOpen}
          onOpenChange={setRuleDialogOpen}
          course={selectedCourse}
          allCourses={courses}
          onSave={handleSaveRules}
        />
      )}
    </div>
  );
}
