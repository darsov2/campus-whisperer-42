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
  Grid3X3,
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
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";

import { ManageCoursesModal } from "@/components/programmes/ManageCoursesModal";
import { ConfigureSlotsModal } from "@/components/programmes/ConfigureSlotsModal";
import type { ProgrammeWithDetails, CourseGroup, ProgrammeSlot } from "@/components/programmes/types";
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
  { id: "11", code: "HUM101", name: "Philosophy", ects: 4 },
  { id: "12", code: "HUM102", name: "History of Science", ects: 4 },
  { id: "13", code: "HUM103", name: "Ethics in Technology", ects: 3 },
  { id: "14", code: "ENG101", name: "Technical Writing", ects: 3 },
];

// Helper to count total conditions in new rules format
function countConditions(rules: ProgrammeCourseRules): number {
  if (!rules || !rules.groups) return 0;
  return rules.groups.reduce((acc, g) => acc + g.conditions.length, 0);
}

const initialCourseGroups: CourseGroup[] = [
  {
    id: "cg1",
    name: "Humanities Electives",
    code: "HUM-ELEC",
    description: "Courses from the humanities department",
    courseIds: ["11", "12", "13"],
  },
  {
    id: "cg2",
    name: "Technical Core",
    code: "TECH-CORE",
    description: "Core technical courses for CS students",
    courseIds: ["1", "2", "3", "8", "9"],
  },
];

const initialProgrammes: ProgrammeWithDetails[] = [
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
    slots: [
      {
        id: "slot1",
        semester: 1,
        position: 1,
        type: "mandatory",
        courseId: "1",
        courseCode: "CS101",
        courseName: "Introduction to Programming",
        ects: 6,
      },
      {
        id: "slot2",
        semester: 1,
        position: 2,
        type: "mandatory",
        courseId: "6",
        courseCode: "CS102",
        courseName: "Programming Lab",
        ects: 3,
      },
      {
        id: "slot3",
        semester: 2,
        position: 1,
        type: "optional",
        name: "Humanities Elective",
        minEcts: 3,
        maxEcts: 4,
        rules: [
          { id: "r1", type: "course_group", value: "cg1", label: "Group: Humanities Electives" },
        ],
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
    slots: [],
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
    slots: [],
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
  onConfigureSlots,
}: {
  programme: ProgrammeWithDetails;
  onEdit: () => void;
  onDelete: () => void;
  onManageCourses: () => void;
  onConfigureSlots: () => void;
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
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                <span>{programme.slots?.length || 0} slots</span>
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
            Courses
          </Button>
          <Button variant="outline" size="sm" onClick={onConfigureSlots}>
            <Grid3X3 className="h-4 w-4 mr-2" />
            Slots
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
              <DropdownMenuItem onClick={onConfigureSlots}>
                Configure Slots
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
    useState<ProgrammeWithDetails[]>(initialProgrammes);
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>(initialCourseGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProgramme, setEditingProgramme] =
    useState<ProgrammeWithDetails | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProgrammeId, setDeletingProgrammeId] = useState<string | null>(
    null
  );

  // Course management modal
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [selectedProgramme, setSelectedProgramme] =
    useState<ProgrammeWithDetails | null>(null);
  const [addCourseSemester, setAddCourseSemester] = useState<number>(1);

  // Slots configuration modal
  const [slotsModalOpen, setSlotsModalOpen] = useState(false);

  // Programme course dialogs
  const [programmeCourseDialogOpen, setProgrammeCourseDialogOpen] =
    useState(false);
  const [editingProgrammeCourse, setEditingProgrammeCourse] =
    useState<ProgrammeCourse | null>(null);

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [rulesCourse, setRulesCourse] = useState<ProgrammeCourse | null>(null);

  const [deleteCourseDialogOpen, setDeleteCourseDialogOpen] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

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
      const newProgramme: ProgrammeWithDetails = {
        ...data,
        id: `prog-${Date.now()}`,
        coursesCount: 0,
        studentsEnrolled: 0,
        courses: [],
        slots: [],
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

    // Override semester with the one from tab if adding new
    const courseData = data.id ? data : { ...data, semester: addCourseSemester };

    if (data.id) {
      // Update existing
      setProgrammes((prev) =>
        prev.map((p) =>
          p.id === selectedProgramme.id
            ? {
                ...p,
                courses: p.courses.map((c) =>
                  c.id === data.id ? { ...c, ...courseData } : c
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
                c.id === data.id ? { ...c, ...courseData, id: c.id } : c
              ),
            }
          : null
      );
      toast.success("Course updated in programme");
    } else {
      // Add new
      const newCourse: ProgrammeCourse = {
        ...courseData,
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

  const handleSlotsChange = (programmeId: string, slots: ProgrammeSlot[]) => {
    setProgrammes((prev) =>
      prev.map((p) => (p.id === programmeId ? { ...p, slots } : p))
    );
    if (selectedProgramme?.id === programmeId) {
      setSelectedProgramme((prev) => (prev ? { ...prev, slots } : null));
    }
    toast.success("Slot configuration saved");
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
              setCourseModalOpen(true);
            }}
            onConfigureSlots={() => {
              setSelectedProgramme(programme);
              setSlotsModalOpen(true);
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

      {/* Manage Courses Modal */}
      <ManageCoursesModal
        open={courseModalOpen}
        onOpenChange={setCourseModalOpen}
        programme={selectedProgramme}
        onAddCourse={(semester) => {
          setAddCourseSemester(semester);
          setEditingProgrammeCourse(null);
          setProgrammeCourseDialogOpen(true);
        }}
        onEditCourse={(course) => {
          setEditingProgrammeCourse(course);
          setProgrammeCourseDialogOpen(true);
        }}
        onConfigureRules={(course) => {
          setRulesCourse(course);
          setRuleDialogOpen(true);
        }}
        onRemoveCourse={(courseId) => {
          setDeletingCourseId(courseId);
          setDeleteCourseDialogOpen(true);
        }}
      />

      {/* Configure Slots Modal */}
      <ConfigureSlotsModal
        open={slotsModalOpen}
        onOpenChange={setSlotsModalOpen}
        programme={selectedProgramme}
        catalogCourses={catalogCourses}
        courseGroups={courseGroups}
        onSlotsChange={handleSlotsChange}
      />

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
