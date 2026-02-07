import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Users,
  GraduationCap,
  ExternalLink,
  LayoutGrid,
  List,
  Building2,
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
import { CourseDialog, type MasterCourseOption } from "@/components/dialogs/CourseDialog";
import { CourseTeachersDialog, type CourseTeacher } from "@/components/dialogs/CourseTeachersDialog";
import { FacultyCourseDialog, type FacultyCourseAssignment } from "@/components/dialogs/FacultyCourseDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";

// Base course - standalone in the catalog
export interface BaseCourse {
  id: string;
  code: string;
  name: string;
  faculty: string;
  ects: number;
  description: string;
  teachers: CourseTeacher[];
  status: "active" | "draft" | "archived";
}

const availableTeachers = [
  { id: "t1", name: "Dr. John Smith", title: "Associate Professor" },
  { id: "t2", name: "Prof. Maria Garcia", title: "Full Professor" },
  { id: "t3", name: "Prof. Anna Johnson", title: "Full Professor" },
  { id: "t4", name: "Prof. David Lee", title: "Full Professor" },
  { id: "t5", name: "Dr. Sarah Chen", title: "Assistant Professor" },
  { id: "t6", name: "Dr. Michael Brown", title: "Senior Lecturer" },
  { id: "t7", name: "Dr. Emily Wilson", title: "Lecturer" },
];

const initialCourses: BaseCourse[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Programming",
    faculty: "Faculty of Computer Science",
    ects: 6,
    description: "Fundamental programming concepts using Python",
    teachers: [
      { id: "t1", name: "Dr. John Smith", role: "coordinator" },
      { id: "t2", name: "Prof. Maria Garcia", role: "lecturer" },
    ],
    status: "active",
  },
  {
    id: "2",
    code: "CS201",
    name: "Data Structures and Algorithms",
    faculty: "Faculty of Computer Science",
    ects: 6,
    description: "Core data structures and algorithm design",
    teachers: [{ id: "t1", name: "Dr. John Smith", role: "coordinator" }],
    status: "active",
  },
  {
    id: "3",
    code: "CS301",
    name: "Database Systems",
    faculty: "Faculty of Computer Science",
    ects: 5,
    description: "Relational databases, SQL, and database design",
    teachers: [{ id: "t3", name: "Prof. Anna Johnson", role: "coordinator" }],
    status: "active",
  },
  {
    id: "4",
    code: "MA101",
    name: "Calculus I",
    faculty: "Faculty of Natural Sciences",
    ects: 7,
    description: "Differential and integral calculus",
    teachers: [{ id: "t4", name: "Prof. David Lee", role: "coordinator" }],
    status: "active",
  },
  {
    id: "5",
    code: "CS401",
    name: "Machine Learning",
    faculty: "Faculty of Computer Science",
    ects: 6,
    description: "Introduction to machine learning algorithms",
    teachers: [{ id: "t5", name: "Dr. Sarah Chen", role: "coordinator" }],
    status: "draft",
  },
  {
    id: "6",
    code: "CS102",
    name: "Programming Lab",
    faculty: "Faculty of Computer Science",
    ects: 3,
    description: "Practical programming exercises",
    teachers: [
      { id: "t1", name: "Dr. John Smith", role: "coordinator" },
      { id: "t7", name: "Dr. Emily Wilson", role: "assistant" },
    ],
    status: "active",
  },
];

function CourseCard({
  course,
  onEdit,
  onDelete,
  onManageFaculty,
}: {
  course: BaseCourse;
  onEdit: () => void;
  onDelete: () => void;
  onManageFaculty: () => void;
}) {
  return (
    <div className="data-card p-5 hover:shadow-elevated transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "p-3 rounded-lg",
              course.status === "active" ? "bg-accent/10" : "bg-muted"
            )}
          >
            <BookOpen
              className={cn(
                "h-5 w-5",
                course.status === "active"
                  ? "text-accent"
                  : "text-muted-foreground"
              )}
            />
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
              {course.faculty}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {course.description}
            </p>

            <div className="flex items-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{course.ects} ECTS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>
                  {course.teachers.length} teacher
                  {course.teachers.length !== 1 && "s"}
                </span>
              </div>
            </div>

            {course.teachers.length > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {course.teachers.slice(0, 3).map((teacher) => (
                  <span
                    key={teacher.id}
                    className={cn(
                      "text-xs px-2 py-0.5 rounded",
                      teacher.role === "coordinator"
                        ? "bg-accent/20 text-accent"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {teacher.name}
                    {teacher.role === "coordinator" && " (Coord.)"}
                  </span>
                ))}
                {course.teachers.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{course.teachers.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={onEdit}>Edit Course</DropdownMenuItem>
            <DropdownMenuItem onClick={onManageFaculty}>
              <Building2 className="h-4 w-4 mr-2" />
              Faculty & Teachers
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Archive Course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<BaseCourse[]>(initialCourses);
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<BaseCourse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const [teachersDialogOpen, setTeachersDialogOpen] = useState(false);
  const [teachersCourse, setTeachersCourse] = useState<BaseCourse | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Faculty-Course dialog state
  const [facultyCourseDialogOpen, setFacultyCourseDialogOpen] = useState(false);
  const [facultyCourseCourse, setFacultyCourseCourse] = useState<BaseCourse | null>(null);
  const [facultyCourseAssignments, setFacultyCourseAssignments] = useState<Record<string, FacultyCourseAssignment[]>>({});

  const allFaculties = [
    { id: "1", name: "Faculty of Computer Science", code: "FCS" },
    { id: "2", name: "Faculty of Natural Sciences", code: "FNS" },
    { id: "3", name: "Faculty of Engineering", code: "FE" },
    { id: "4", name: "Faculty of Economics", code: "FEC" },
  ];

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFaculty =
      facultyFilter === "all" || course.faculty.includes(facultyFilter);
    return matchesSearch && matchesFaculty;
  });

  // Mock master courses for the dialog
  const masterCourseOptions: MasterCourseOption[] = [
    { id: "mc1", name: "Introduction to Programming" },
    { id: "mc2", name: "Data Structures and Algorithms" },
    { id: "mc3", name: "Database Systems" },
  ];

  const handleSave = (data: any) => {
    if (data.id) {
      setCourses((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, ...data } : c))
      );
      toast.success("Course updated successfully");
    } else {
      const newCourse: BaseCourse = {
        ...data,
        id: `course-${Date.now()}`,
        teachers: [],
      };
      setCourses((prev) => [newCourse, ...prev]);

      if (data.createNewMasterCourse) {
        toast.success(`Course created and new master course "${data.name}" created`);
      } else if (data.masterCourseId) {
        const mc = masterCourseOptions.find(m => m.id === data.masterCourseId);
        toast.success(`Course created and linked to "${mc?.name}"`);
      } else {
        toast.success("Course created successfully");
      }
    }
  };

  const handleDelete = () => {
    if (deletingCourseId) {
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourseId));
      toast.success("Course archived");
      setDeleteDialogOpen(false);
      setDeletingCourseId(null);
    }
  };

  const handleSaveTeachers = (teachers: CourseTeacher[]) => {
    if (teachersCourse) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === teachersCourse.id ? { ...c, teachers } : c
        )
      );
      toast.success("Teachers updated successfully");
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Course Catalog"
        description="Manage standalone courses - link them to programmes to configure rules"
        actions={
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => {
              setEditingCourse(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Course
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
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
        <div className="flex items-center border rounded-md">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
            className="rounded-r-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="rounded-l-none"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{courses.length}</p>
          <p className="text-sm text-muted-foreground">Total Courses</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">
            {courses.filter((c) => c.status === "active").length}
          </p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">
            {courses.filter((c) => c.status === "draft").length}
          </p>
          <p className="text-sm text-muted-foreground">Draft</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">
            {courses.reduce((acc, c) => acc + c.ects, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total ECTS</p>
        </div>
      </div>

      {/* Courses View */}
      {viewMode === "grid" ? (
        <div className="space-y-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={() => {
                setEditingCourse(course);
                setDialogOpen(true);
              }}
              onDelete={() => {
                setDeletingCourseId(course.id);
                setDeleteDialogOpen(true);
              }}
              onManageFaculty={() => {
                setFacultyCourseCourse(course);
                setFacultyCourseDialogOpen(true);
              }}
            />
          ))}
        </div>
      ) : (
        <DataTable
          data={filteredCourses}
          columns={[
            {
              key: "code",
              header: "Code",
              cell: (course) => (
                <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                  {course.code}
                </span>
              ),
            },
            {
              key: "name",
              header: "Name",
              cell: (course) => (
                <div>
                  <span className="font-medium">{course.name}</span>
                  <p className="text-xs text-muted-foreground truncate max-w-xs">
                    {course.description}
                  </p>
                </div>
              ),
            },
            {
              key: "faculty",
              header: "Faculty",
              cell: (course) => (
                <span className="text-sm">{course.faculty}</span>
              ),
            },
            {
              key: "ects",
              header: "ECTS",
              cell: (course) => (
                <span className="font-medium">{course.ects}</span>
              ),
              className: "text-center",
            },
            {
              key: "teachers",
              header: "Teachers",
              cell: (course) => (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.teachers.length}</span>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              cell: (course) => <StatusBadge status={course.status} />,
            },
            {
              key: "actions",
              header: "",
              cell: (course) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingCourse(course);
                        setDialogOpen(true);
                      }}
                    >
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setFacultyCourseCourse(course);
                        setFacultyCourseDialogOpen(true);
                      }}
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Faculty & Teachers
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setDeletingCourseId(course.id);
                        setDeleteDialogOpen(true);
                      }}
                      className="text-destructive"
                    >
                      Archive Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
              className: "w-12",
            },
          ]}
          emptyMessage="No courses found"
        />
      )}

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={editingCourse as any}
        masterCourses={masterCourseOptions}
        onSave={handleSave}
      />

      {facultyCourseCourse && (
        <FacultyCourseDialog
          open={facultyCourseDialogOpen}
          onOpenChange={setFacultyCourseDialogOpen}
          courseName={facultyCourseCourse.name}
          courseCode={facultyCourseCourse.code}
          faculties={allFaculties}
          availableTeachers={availableTeachers}
          assignments={facultyCourseAssignments[facultyCourseCourse.id] || []}
          onSave={(assignments) => {
            setFacultyCourseAssignments((prev) => ({
              ...prev,
              [facultyCourseCourse.id]: assignments,
            }));
            toast.success("Faculty configuration saved");
          }}
        />
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Archive Course"
        description="Are you sure you want to archive this course? It will be removed from all programmes."
        onConfirm={handleDelete}
      />
    </div>
  );
}
