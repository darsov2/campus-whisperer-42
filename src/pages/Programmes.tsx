import { useState } from "react";
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  BookOpen,
  Users,
  Clock,
  Award,
  GitBranch,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ProgrammeDialog, type Programme } from "@/components/dialogs/ProgrammeDialog";
import {
  ProgrammeCourseDialog,
  type ProgrammeCourse,
  type BaseCourse,
  type ProgrammeCourseRules,
  createEmptyRules,
} from "@/components/dialogs/ProgrammeCourseDialog";
import { ProgrammeCourseRuleDialog } from "@/components/dialogs/ProgrammeCourseRuleDialog";
import { RulesVisualTree } from "@/components/RulesVisualTree";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { toast } from "sonner";

// Available courses in the catalog
const catalogCourses: BaseCourse[] = [
  { id: "1", code: "CS101", name: "Introduction to Programming", ects: 6 },
  { id: "2", code: "CS201", name: "Data Structures and Algorithms", ects: 6 },
  { id: "3", code: "CS301", name: "Database Systems", ects: 5 },
  { id: "4", code: "MA101", name: "Calculus I", ects: 7 },
  { id: "5", code: "CS401", name: "Machine Learning", ects: 6 },
  { id: "6", code: "CS102", name: "Programming Lab", ects: 3 },
  { id: "7", code: "MA102", name: "Linear Algebra", ects: 6 },
  { id: "8", code: "CS202", name: "Operating Systems", ects: 5 },
  { id: "9", code: "CS302", name: "Computer Networks", ects: 5 },
  { id: "10", code: "CS402", name: "Software Engineering", ects: 6 },
];

interface ProgrammeWithCourses extends Programme {
  courses: ProgrammeCourse[];
}

// Helper to count total conditions in new rules format
function countConditions(rules: ProgrammeCourseRules): number {
  if (!rules || !rules.groups) return 0;
  return rules.groups.reduce((acc, g) => acc + g.conditions.length, 0);
}

const initialProgrammes: ProgrammeWithCourses[] = [
  {
    id: "1",
    name: "Computer Science",
    code: "CS-BSC",
    faculty: "Faculty of Computer Science",
    degree: "bachelor",
    duration: 3,
    totalEcts: 180,
    coursesCount: 5,
    studentsEnrolled: 856,
    status: "active",
    accreditedUntil: "2027-09-30",
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
          groups: [
            {
              id: "g1",
              operator: "and",
              conditions: [
                {
                  id: "c1",
                  type: "corequisite",
                  value: "CS101",
                  label: "CS101 - Introduction to Programming",
                },
              ],
            },
          ],
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
            {
              id: "g1",
              operator: "and",
              conditions: [
                {
                  id: "c1",
                  type: "prerequisite",
                  value: "CS101",
                  label: "CS101 - Introduction to Programming",
                },
                {
                  id: "c2",
                  type: "prerequisite",
                  value: "MA101",
                  label: "MA101 - Calculus I",
                },
              ],
            },
            {
              id: "g2",
              operator: "and",
              conditions: [
                {
                  id: "c3",
                  type: "ects_min",
                  value: "100",
                  label: "Minimum 100 ECTS credits",
                },
                {
                  id: "c4",
                  type: "prerequisite",
                  value: "CS102",
                  label: "CS102 - Programming Lab",
                },
              ],
            },
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
      {
        id: "pc5",
        courseId: "3",
        courseCode: "CS301",
        courseName: "Database Systems",
        ects: 5,
        semester: 5,
        type: "mandatory",
        rules: {
          groupOperator: "and",
          groups: [
            {
              id: "g1",
              operator: "or",
              conditions: [
                {
                  id: "c1",
                  type: "prerequisite",
                  value: "CS201",
                  label: "CS201 - Data Structures and Algorithms",
                },
                {
                  id: "c2",
                  type: "prerequisite",
                  value: "CS202",
                  label: "CS202 - Operating Systems",
                },
              ],
            },
            {
              id: "g2",
              operator: "and",
              conditions: [
                {
                  id: "c3",
                  type: "ects_min",
                  value: "60",
                  label: "Minimum 60 ECTS credits",
                },
              ],
            },
          ],
        },
      },
    ],
  },
  {
    id: "2",
    name: "Computer Science",
    code: "CS-MSC",
    faculty: "Faculty of Computer Science",
    degree: "master",
    duration: 2,
    totalEcts: 120,
    coursesCount: 2,
    studentsEnrolled: 234,
    status: "active",
    accreditedUntil: "2026-09-30",
    courses: [
      {
        id: "pc6",
        courseId: "5",
        courseCode: "CS401",
        courseName: "Machine Learning",
        ects: 6,
        semester: 1,
        type: "mandatory",
        rules: {
          groupOperator: "and",
          groups: [
            {
              id: "g1",
              operator: "and",
              conditions: [
                {
                  id: "c1",
                  type: "ects_min",
                  value: "180",
                  label: "Minimum 180 ECTS credits",
                },
              ],
            },
          ],
        },
      },
      {
        id: "pc7",
        courseId: "3",
        courseCode: "CS301",
        courseName: "Database Systems",
        ects: 5,
        semester: 1,
        type: "elective",
        rules: createEmptyRules(),
      },
    ],
  },
  {
    id: "3",
    name: "Mathematics",
    code: "MA-BSC",
    faculty: "Faculty of Natural Sciences",
    degree: "bachelor",
    duration: 3,
    totalEcts: 180,
    coursesCount: 2,
    studentsEnrolled: 412,
    status: "active",
    accreditedUntil: "2028-09-30",
    courses: [
      {
        id: "pc8",
        courseId: "4",
        courseCode: "MA101",
        courseName: "Calculus I",
        ects: 7,
        semester: 1,
        type: "mandatory",
        rules: createEmptyRules(),
      },
      {
        id: "pc9",
        courseId: "7",
        courseCode: "MA102",
        courseName: "Linear Algebra",
        ects: 6,
        semester: 1,
        type: "mandatory",
        rules: createEmptyRules(),
      },
    ],
  },
];

const degreeLabels = {
  bachelor: "Bachelor's",
  master: "Master's",
  doctorate: "Doctorate",
};

const degreeColors = {
  bachelor: "bg-info/10 text-info",
  master: "bg-accent/10 text-accent",
  doctorate: "bg-warning/10 text-warning",
};

function ProgrammeCard({
  programme,
  onEdit,
  onDelete,
  onManageCourses,
}: {
  programme: ProgrammeWithCourses;
  onEdit: () => void;
  onDelete: () => void;
  onManageCourses: () => void;
}) {
  const isAccreditationExpiring =
    programme.accreditedUntil &&
    new Date(programme.accreditedUntil) <
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  const rulesCount = programme.courses.reduce(
    (acc, c) => acc + countConditions(c.rules),
    0
  );

  return (
    <div className="data-card p-5 hover:shadow-elevated transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-lg",
              programme.status === "active" ? "bg-accent/10" : "bg-muted"
            )}
          >
            <GraduationCap
              className={cn(
                "h-5 w-5",
                programme.status === "active"
                  ? "text-accent"
                  : "text-muted-foreground"
              )}
            />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "px-2 py-0.5 rounded text-xs font-medium",
                  degreeColors[programme.degree]
                )}
              >
                {degreeLabels[programme.degree]}
              </span>
              <h3 className="font-semibold">{programme.name}</h3>
              <span className="font-mono text-sm text-muted-foreground">
                {programme.code}
              </span>
              <StatusBadge status={programme.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {programme.faculty}
            </p>

            <div className="flex items-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{programme.duration} years</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{programme.totalEcts} ECTS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{programme.courses.length} courses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{programme.studentsEnrolled} students</span>
              </div>
              {rulesCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <GitBranch className="h-4 w-4 text-accent" />
                  <span className="text-accent font-medium">
                    {rulesCount} conditions
                  </span>
                </div>
              )}
            </div>

            {programme.accreditedUntil && (
              <div
                className={cn(
                  "mt-3 text-xs",
                  isAccreditationExpiring
                    ? "text-warning"
                    : "text-muted-foreground"
                )}
              >
                {isAccreditationExpiring && "⚠️ "}
                Accredited until {programme.accreditedUntil}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onManageCourses}>
            <BookOpen className="h-4 w-4 mr-2" />
            Manage Courses
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={onEdit}>
                Edit Programme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onManageCourses}>
                Manage Courses
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Accreditation Details</DropdownMenuItem>
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                Archive
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

export default function Programmes() {
  const [programmes, setProgrammes] =
    useState<ProgrammeWithCourses[]>(initialProgrammes);
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] =
    useState<ProgrammeWithCourses | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProgrammeId, setDeletingProgrammeId] = useState<string | null>(
    null
  );

  // Course management sheet
  const [courseSheetOpen, setCourseSheetOpen] = useState(false);
  const [selectedProgramme, setSelectedProgramme] =
    useState<ProgrammeWithCourses | null>(null);

  // Programme course dialogs
  const [programmeCourseDialogOpen, setProgrammeCourseDialogOpen] =
    useState(false);
  const [editingProgrammeCourse, setEditingProgrammeCourse] =
    useState<ProgrammeCourse | null>(null);

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [rulesCourse, setRulesCourse] = useState<ProgrammeCourse | null>(null);

  const [deleteCourseDialogOpen, setDeleteCourseDialogOpen] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const [visualRulesCourse, setVisualRulesCourse] =
    useState<ProgrammeCourse | null>(null);

  const filteredProgrammes = programmes.filter((programme) => {
    const matchesSearch =
      programme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      programme.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDegree =
      degreeFilter === "all" || programme.degree === degreeFilter;
    return matchesSearch && matchesDegree;
  });

  const handleSave = (
    data: Omit<Programme, "id" | "coursesCount" | "studentsEnrolled"> & {
      id?: string;
    }
  ) => {
    if (data.id) {
      setProgrammes((prev) =>
        prev.map((p) => (p.id === data.id ? { ...p, ...data } : p))
      );
      toast.success("Programme updated successfully");
    } else {
      const newProgramme: ProgrammeWithCourses = {
        ...data,
        id: `prog-${Date.now()}`,
        coursesCount: 0,
        studentsEnrolled: 0,
        courses: [],
      };
      setProgrammes((prev) => [newProgramme, ...prev]);
      toast.success("Programme created successfully");
    }
  };

  const handleDelete = () => {
    if (deletingProgrammeId) {
      setProgrammes((prev) => prev.filter((p) => p.id !== deletingProgrammeId));
      toast.success("Programme archived");
      setDeleteDialogOpen(false);
      setDeletingProgrammeId(null);
    }
  };

  const handleSaveProgrammeCourse = (
    data: Omit<ProgrammeCourse, "id"> & { id?: string }
  ) => {
    if (!selectedProgramme) return;

    if (data.id) {
      // Update existing
      setProgrammes((prev) =>
        prev.map((p) =>
          p.id === selectedProgramme.id
            ? {
                ...p,
                courses: p.courses.map((c) =>
                  c.id === data.id ? { ...c, ...data } : c
                ),
              }
            : p
        )
      );
      // Update local state
      setSelectedProgramme((prev) =>
        prev
          ? {
              ...prev,
              courses: prev.courses.map((c) =>
                c.id === data.id ? { ...c, ...data, id: c.id } : c
              ),
            }
          : null
      );
      toast.success("Course updated in programme");
    } else {
      // Add new
      const newCourse: ProgrammeCourse = {
        ...data,
        id: `pc-${Date.now()}`,
      };
      setProgrammes((prev) =>
        prev.map((p) =>
          p.id === selectedProgramme.id
            ? { ...p, courses: [...p.courses, newCourse] }
            : p
        )
      );
      setSelectedProgramme((prev) =>
        prev ? { ...prev, courses: [...prev.courses, newCourse] } : null
      );
      toast.success("Course added to programme");
    }
  };

  const handleSaveRules = (
    programmeCourseId: string,
    rules: ProgrammeCourseRules
  ) => {
    if (!selectedProgramme) return;

    setProgrammes((prev) =>
      prev.map((p) =>
        p.id === selectedProgramme.id
          ? {
              ...p,
              courses: p.courses.map((c) =>
                c.id === programmeCourseId ? { ...c, rules } : c
              ),
            }
          : p
      )
    );
    setSelectedProgramme((prev) =>
      prev
        ? {
            ...prev,
            courses: prev.courses.map((c) =>
              c.id === programmeCourseId ? { ...c, rules } : c
            ),
          }
        : null
    );
    
    // Update visual rules if showing
    if (visualRulesCourse?.id === programmeCourseId) {
      setVisualRulesCourse(prev => prev ? { ...prev, rules } : null);
    }
    
    toast.success("Rules saved successfully");
  };

  const handleRemoveCourse = () => {
    if (!selectedProgramme || !deletingCourseId) return;

    setProgrammes((prev) =>
      prev.map((p) =>
        p.id === selectedProgramme.id
          ? { ...p, courses: p.courses.filter((c) => c.id !== deletingCourseId) }
          : p
      )
    );
    setSelectedProgramme((prev) =>
      prev
        ? { ...prev, courses: prev.courses.filter((c) => c.id !== deletingCourseId) }
        : null
    );
    toast.success("Course removed from programme");
    setDeleteCourseDialogOpen(false);
    setDeletingCourseId(null);
  };

  // Filter out already added courses
  const availableCatalogCourses = selectedProgramme
    ? catalogCourses.filter(
        (c) => !selectedProgramme.courses.some((pc) => pc.courseId === c.id)
      )
    : catalogCourses;

  return (
    <div className="page-container">
      <PageHeader
        title="Study Programmes"
        description="Manage degree programmes, link courses, and configure enrollment rules"
        actions={
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => {
              setEditingProgramme(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Programme
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programmes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={degreeFilter} onValueChange={setDegreeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by degree" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Degrees</SelectItem>
            <SelectItem value="bachelor">Bachelor's</SelectItem>
            <SelectItem value="master">Master's</SelectItem>
            <SelectItem value="doctorate">Doctorate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{programmes.length}</p>
          <p className="text-sm text-muted-foreground">Total Programmes</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">
            {programmes.filter((p) => p.degree === "bachelor").length}
          </p>
          <p className="text-sm text-muted-foreground">Bachelor's</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">
            {programmes.filter((p) => p.degree === "master").length}
          </p>
          <p className="text-sm text-muted-foreground">Master's</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">
            {programmes
              .reduce((acc, p) => acc + p.studentsEnrolled, 0)
              .toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Total Students</p>
        </div>
      </div>

      {/* Programmes Grid */}
      <div className="space-y-3">
        {filteredProgrammes.map((programme) => (
          <ProgrammeCard
            key={programme.id}
            programme={programme}
            onEdit={() => {
              setEditingProgramme(programme);
              setDialogOpen(true);
            }}
            onDelete={() => {
              setDeletingProgrammeId(programme.id);
              setDeleteDialogOpen(true);
            }}
            onManageCourses={() => {
              setSelectedProgramme(programme);
              setCourseSheetOpen(true);
            }}
          />
        ))}
      </div>

      {/* Programme Dialog */}
      <ProgrammeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        programme={editingProgramme}
        onSave={handleSave}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Archive Programme"
        description="Are you sure you want to archive this programme? No new students will be able to enroll."
        onConfirm={handleDelete}
      />

      {/* Course Management Full-Screen Modal */}
      <Dialog open={courseSheetOpen} onOpenChange={setCourseSheetOpen}>
        <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="h-6 w-6 text-accent" />
                  {selectedProgramme?.name} - {selectedProgramme?.code}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Manage courses linked to this programme and configure enrollment rules
                </DialogDescription>
              </div>
              <Button
                onClick={() => {
                  setEditingProgrammeCourse(null);
                  setProgrammeCourseDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
            
            {/* Summary Stats */}
            {selectedProgramme && selectedProgramme.courses.length > 0 && (
              <div className="flex items-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Total:</span>
                  <span className="font-medium">{selectedProgramme.courses.length} courses</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Mandatory:</span>
                  <span className="font-medium text-accent">
                    {selectedProgramme.courses.filter(c => c.type === "mandatory").length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Elective:</span>
                  <span className="font-medium text-info">
                    {selectedProgramme.courses.filter(c => c.type === "elective").length}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">ECTS:</span>
                  <span className="font-medium">
                    {selectedProgramme.courses.reduce((acc, c) => acc + c.ects, 0)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Semesters:</span>
                  <span className="font-medium">
                    {new Set(selectedProgramme.courses.map(c => c.semester)).size}
                  </span>
                </div>
              </div>
            )}
          </DialogHeader>

          <ScrollArea className="flex-1 px-6">
            <div className="py-6">
              {selectedProgramme?.courses.length === 0 ? (
                <div className="text-center py-16 border border-dashed rounded-lg bg-muted/20">
                  <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-lg text-muted-foreground">No courses linked</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add courses from the catalog to this programme
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setEditingProgrammeCourse(null);
                      setProgrammeCourseDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Course
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Group courses by semester */}
                  {Array.from(new Set(selectedProgramme?.courses.map(c => c.semester))).sort((a, b) => a - b).map(semester => (
                    <div key={semester} className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Semester {semester}
                        <span className="text-xs font-normal">
                          ({selectedProgramme?.courses.filter(c => c.semester === semester).length} courses,{" "}
                          {selectedProgramme?.courses.filter(c => c.semester === semester).reduce((acc, c) => acc + c.ects, 0)} ECTS)
                        </span>
                      </h4>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {selectedProgramme?.courses
                          .filter(c => c.semester === semester)
                          .sort((a, b) => a.courseCode.localeCompare(b.courseCode))
                          .map((course) => {
                            const conditionsCount = countConditions(course.rules);
                            return (
                              <div key={course.id} className="space-y-2">
                                <div className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded shrink-0">
                                          {course.courseCode}
                                        </span>
                                        <span className="font-medium truncate">
                                          {course.courseName}
                                        </span>
                                        <span
                                          className={cn(
                                            "text-xs px-2 py-0.5 rounded shrink-0",
                                            course.type === "mandatory"
                                              ? "bg-accent/20 text-accent"
                                              : "bg-info/20 text-info"
                                          )}
                                        >
                                          {course.type === "mandatory"
                                            ? "Mandatory"
                                            : "Elective"}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                        <span>{course.ects} ECTS</span>
                                        {conditionsCount > 0 && (
                                          <span className="text-accent font-medium flex items-center gap-1">
                                            <GitBranch className="h-3 w-3" />
                                            {conditionsCount} condition
                                            {conditionsCount !== 1 && "s"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0 ml-2">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setVisualRulesCourse(
                                            visualRulesCourse?.id === course.id
                                              ? null
                                              : course
                                          );
                                        }}
                                        title="View rules"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          setRulesCourse(course);
                                          setRuleDialogOpen(true);
                                        }}
                                        title="Configure rules"
                                      >
                                        <GitBranch className="h-4 w-4" />
                                      </Button>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="sm">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                          align="end"
                                          className="bg-popover"
                                        >
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setEditingProgrammeCourse(course);
                                              setProgrammeCourseDialogOpen(true);
                                            }}
                                          >
                                            Edit Settings
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() => {
                                              setRulesCourse(course);
                                              setRuleDialogOpen(true);
                                            }}
                                          >
                                            <GitBranch className="h-4 w-4 mr-2" />
                                            Configure Rules
                                          </DropdownMenuItem>
                                          <DropdownMenuSeparator />
                                          <DropdownMenuItem
                                            className="text-destructive"
                                            onClick={() => {
                                              setDeletingCourseId(course.id);
                                              setDeleteCourseDialogOpen(true);
                                            }}
                                          >
                                            Remove from Programme
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </div>
                                  </div>
                                </div>

                                {/* Visual Rules Tree */}
                                {visualRulesCourse?.id === course.id && (
                                  <div className="ml-4 border-l-2 border-accent/30 bg-muted/20 rounded-r-lg">
                                    <RulesVisualTree
                                      courseCode={course.courseCode}
                                      courseName={course.courseName}
                                      rules={course.rules}
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Programme Course Dialog */}
      {selectedProgramme && (
        <ProgrammeCourseDialog
          open={programmeCourseDialogOpen}
          onOpenChange={setProgrammeCourseDialogOpen}
          programmeName={selectedProgramme.name}
          programmeCourse={editingProgrammeCourse}
          availableCourses={
            editingProgrammeCourse ? catalogCourses : availableCatalogCourses
          }
          onSave={handleSaveProgrammeCourse}
        />
      )}

      {/* Rule Dialog */}
      {rulesCourse && selectedProgramme && (
        <ProgrammeCourseRuleDialog
          open={ruleDialogOpen}
          onOpenChange={setRuleDialogOpen}
          programmeCourse={rulesCourse}
          allProgrammeCourses={selectedProgramme.courses}
          onSave={handleSaveRules}
        />
      )}

      {/* Delete Course Dialog */}
      <DeleteDialog
        open={deleteCourseDialogOpen}
        onOpenChange={setDeleteCourseDialogOpen}
        title="Remove Course"
        description="Are you sure you want to remove this course from the programme? This will also delete all associated rules."
        onConfirm={handleRemoveCourse}
      />
    </div>
  );
}
