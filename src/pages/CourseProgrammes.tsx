import { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Filter,
  GraduationCap,
  Eye,
  ChevronDown,
  ChevronUp,
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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
interface CourseInProgramme {
  programmeId: string;
  programmeName: string;
  programmeCode: string;
  degree: "bachelor" | "master" | "doctorate";
  faculty: string;
  semester: number;
  ects: number;
  type: "mandatory" | "elective";
}

interface CourseCatalogEntry {
  id: string;
  code: string;
  name: string;
  faculty: string;
  defaultEcts: number;
  programmes: CourseInProgramme[];
}

// Mock data
const coursesWithProgrammes: CourseCatalogEntry[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Programming",
    faculty: "Faculty of Computer Science",
    defaultEcts: 6,
    programmes: [
      { programmeId: "1", programmeName: "Computer Science", programmeCode: "CS-BSC", degree: "bachelor", faculty: "Faculty of Computer Science", semester: 1, ects: 6, type: "mandatory" },
      { programmeId: "4", programmeName: "Information Systems", programmeCode: "IS-BSC", degree: "bachelor", faculty: "Faculty of Computer Science", semester: 1, ects: 5, type: "mandatory" },
    ],
  },
  {
    id: "2",
    code: "CS201",
    name: "Data Structures and Algorithms",
    faculty: "Faculty of Computer Science",
    defaultEcts: 6,
    programmes: [
      { programmeId: "1", programmeName: "Computer Science", programmeCode: "CS-BSC", degree: "bachelor", faculty: "Faculty of Computer Science", semester: 3, ects: 6, type: "mandatory" },
    ],
  },
  {
    id: "3",
    code: "CS301",
    name: "Database Systems",
    faculty: "Faculty of Computer Science",
    defaultEcts: 5,
    programmes: [
      { programmeId: "1", programmeName: "Computer Science", programmeCode: "CS-BSC", degree: "bachelor", faculty: "Faculty of Computer Science", semester: 5, ects: 5, type: "mandatory" },
      { programmeId: "2", programmeName: "Computer Science", programmeCode: "CS-MSC", degree: "master", faculty: "Faculty of Computer Science", semester: 1, ects: 5, type: "elective" },
      { programmeId: "4", programmeName: "Information Systems", programmeCode: "IS-BSC", degree: "bachelor", faculty: "Faculty of Computer Science", semester: 4, ects: 6, type: "mandatory" },
    ],
  },
  {
    id: "4",
    code: "MA101",
    name: "Calculus I",
    faculty: "Faculty of Natural Sciences",
    defaultEcts: 7,
    programmes: [
      { programmeId: "1", programmeName: "Computer Science", programmeCode: "CS-BSC", degree: "bachelor", faculty: "Faculty of Computer Science", semester: 1, ects: 7, type: "mandatory" },
      { programmeId: "3", programmeName: "Mathematics", programmeCode: "MA-BSC", degree: "bachelor", faculty: "Faculty of Natural Sciences", semester: 1, ects: 7, type: "mandatory" },
      { programmeId: "5", programmeName: "Physics", programmeCode: "PH-BSC", degree: "bachelor", faculty: "Faculty of Natural Sciences", semester: 1, ects: 8, type: "mandatory" },
    ],
  },
  {
    id: "5",
    code: "CS401",
    name: "Machine Learning",
    faculty: "Faculty of Computer Science",
    defaultEcts: 6,
    programmes: [
      { programmeId: "2", programmeName: "Computer Science", programmeCode: "CS-MSC", degree: "master", faculty: "Faculty of Computer Science", semester: 1, ects: 6, type: "mandatory" },
    ],
  },
  {
    id: "6",
    code: "CS102",
    name: "Programming Lab",
    faculty: "Faculty of Computer Science",
    defaultEcts: 3,
    programmes: [
      { programmeId: "1", programmeName: "Computer Science", programmeCode: "CS-BSC", degree: "bachelor", faculty: "Faculty of Computer Science", semester: 1, ects: 3, type: "mandatory" },
    ],
  },
];

const degreeLabels = {
  bachelor: "BSc",
  master: "MSc",
  doctorate: "PhD",
};

const degreeColors = {
  bachelor: "bg-info/10 text-info",
  master: "bg-accent/10 text-accent",
  doctorate: "bg-warning/10 text-warning",
};

export default function CourseProgrammes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set());

  const filteredCourses = useMemo(() => {
    return coursesWithProgrammes.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFaculty =
        facultyFilter === "all" || course.faculty.includes(facultyFilter);
      return matchesSearch && matchesFaculty;
    });
  }, [searchQuery, facultyFilter]);

  const toggleExpand = (courseId: string) => {
    setExpandedCourses((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedCourses(new Set(filteredCourses.map((c) => c.id)));
  };

  const collapseAll = () => {
    setExpandedCourses(new Set());
  };

  // Stats
  const totalCourses = coursesWithProgrammes.length;
  const coursesInMultipleProgrammes = coursesWithProgrammes.filter(
    (c) => c.programmes.length > 1
  ).length;
  const totalProgrammeLinks = coursesWithProgrammes.reduce(
    (acc, c) => acc + c.programmes.length,
    0
  );

  return (
    <div className="page-container">
      <PageHeader
        title="Courses in Programmes"
        description="Overview of courses across all study programmes with ECTS variations"
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by course name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={facultyFilter} onValueChange={setFacultyFilter}>
          <SelectTrigger className="w-[240px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by faculty" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Faculties</SelectItem>
            <SelectItem value="Computer Science">Computer Science</SelectItem>
            <SelectItem value="Natural Sciences">Natural Sciences</SelectItem>
            <SelectItem value="Engineering">Engineering</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Expand All
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Collapse All
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{totalCourses}</p>
          <p className="text-sm text-muted-foreground">Total Courses</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{coursesInMultipleProgrammes}</p>
          <p className="text-sm text-muted-foreground">In Multiple Programmes</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{totalProgrammeLinks}</p>
          <p className="text-sm text-muted-foreground">Programme Links</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">
            {coursesWithProgrammes.filter((c) =>
              c.programmes.some((p) => p.ects !== c.defaultEcts)
            ).length}
          </p>
          <p className="text-sm text-muted-foreground">With ECTS Variations</p>
        </div>
      </div>

      {/* Courses List */}
      <div className="space-y-3">
        {filteredCourses.map((course) => {
          const isExpanded = expandedCourses.has(course.id);
          const hasEctsVariation = course.programmes.some(
            (p) => p.ects !== course.defaultEcts
          );

          return (
            <div key={course.id} className="data-card overflow-hidden">
              {/* Course Header */}
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpand(course.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <BookOpen className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                      <span className="font-semibold">{course.name}</span>
                      {hasEctsVariation && (
                        <Badge variant="outline" className="text-xs">
                          ECTS varies
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {course.faculty} • Default: {course.defaultEcts} ECTS
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">
                    {course.programmes.length} programme
                    {course.programmes.length !== 1 && "s"}
                  </Badge>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Programmes List */}
              {isExpanded && (
                <div className="border-t bg-muted/10">
                  <div className="p-4 space-y-2">
                    {course.programmes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Not linked to any programme
                      </p>
                    ) : (
                      course.programmes.map((prog) => (
                        <div
                          key={prog.programmeId}
                          className="flex items-center justify-between p-3 bg-card border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <GraduationCap className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-xs px-1.5 py-0.5 rounded font-medium",
                                    degreeColors[prog.degree]
                                  )}
                                >
                                  {degreeLabels[prog.degree]}
                                </span>
                                <span className="font-medium">
                                  {prog.programmeName}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  ({prog.programmeCode})
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {prog.faculty}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">
                              Semester {prog.semester}
                            </span>
                            <span
                              className={cn(
                                "font-medium",
                                prog.ects !== course.defaultEcts
                                  ? "text-warning"
                                  : "text-foreground"
                              )}
                            >
                              {prog.ects} ECTS
                              {prog.ects !== course.defaultEcts && " *"}
                            </span>
                            <span
                              className={cn(
                                "text-xs px-2 py-0.5 rounded",
                                prog.type === "mandatory"
                                  ? "bg-accent/20 text-accent"
                                  : "bg-info/20 text-info"
                              )}
                            >
                              {prog.type === "mandatory" ? "Mandatory" : "Elective"}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
