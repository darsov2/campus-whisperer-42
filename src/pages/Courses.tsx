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
  Table as TableIcon,
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
import { CourseDialog } from "@/components/dialogs/CourseDialog";
import { CourseTeachersDialog, type CourseTeacher } from "@/components/dialogs/CourseTeachersDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { CourseGroupsSection } from "@/components/programmes/CourseGroupsSection";
import type { CourseGroup } from "@/components/programmes/types";
import { toast } from "sonner";
import { DataTable } from "@/components/ui/data-table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
  {
    id: "7",
    code: "MA102",
    name: "Linear Algebra",
    faculty: "Faculty of Natural Sciences",
    ects: 6,
    description: "Vectors, matrices, and linear transformations",
    teachers: [{ id: "t4", name: "Prof. David Lee", role: "coordinator" }],
    status: "active",
  },
  {
    id: "8",
    code: "CS202",
    name: "Operating Systems",
    faculty: "Faculty of Computer Science",
    ects: 5,
    description: "Principles of operating system design",
    teachers: [{ id: "t6", name: "Dr. Michael Brown", role: "coordinator" }],
    status: "active",
  },
  {
    id: "9",
    code: "HUM101",
    name: "Philosophy",
    faculty: "Faculty of Humanities",
    ects: 4,
    description: "Introduction to philosophical thinking",
    teachers: [],
    status: "active",
  },
  {
    id: "10",
    code: "HUM102",
    name: "History of Science",
    faculty: "Faculty of Humanities",
    ects: 4,
    description: "Historical development of scientific thought",
    teachers: [],
    status: "active",
  },
  {
    id: "11",
    code: "HUM103",
    name: "Ethics in Technology",
    faculty: "Faculty of Humanities",
    ects: 3,
    description: "Ethical considerations in modern technology",
    teachers: [],
    status: "active",
  },
  {
    id: "12",
    code: "ENG101",
    name: "Technical Writing",
    faculty: "Faculty of Engineering",
    ects: 3,
    description: "Writing for technical and scientific contexts",
    teachers: [],
    status: "active",
  },
];

const initialCourseGroups: CourseGroup[] = [
  {
    id: "cg1",
    name: "Humanities Electives",
    code: "HUM-ELEC",
    description: "Courses from the humanities department",
    courseIds: ["9", "10", "11"],
  },
  {
    id: "cg2",
    name: "Technical Core",
    code: "TECH-CORE",
    description: "Core technical courses for CS students",
    courseIds: ["1", "2", "3", "8"],
  },
];

interface CourseGridItemProps {
  course: BaseCourse;
  onEdit: () => void;
  onDelete: () => void;
  onManageTeachers: () => void;
  onViewTeachersPage: () => void;
}

function CourseGridItem({
  course,
  onEdit,
  onDelete,
  onManageTeachers,
  onViewTeachersPage,
}: CourseGridItemProps) {
  return (
    <div className="data-card p-4 hover:shadow-elevated transition-all flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            "p-2.5 rounded-lg",
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem onClick={onEdit}>Edit Course</DropdownMenuItem>
            <DropdownMenuItem onClick={onManageTeachers}>
              <Users className="h-4 w-4 mr-2" />
              Quick Assign Teachers
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onViewTeachersPage}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Full Teachers Page
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              Archive Course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
            {course.code}
          </span>
          <StatusBadge status={course.status} />
        </div>
        <h3 className="font-semibold text-sm mb-1 line-clamp-2">{course.name}</h3>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {course.description}
        </p>
      </div>

      <div className="mt-auto pt-3 border-t border-border/50">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{course.ects} ECTS</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span>
              {course.teachers.length} teacher
              {course.teachers.length !== 1 && "s"}
            </span>
          </div>
        </div>
        {course.teachers.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {course.teachers.slice(0, 2).map((teacher) => (
              <span
                key={teacher.id}
                className={cn(
                  "text-xs px-1.5 py-0.5 rounded truncate max-w-[120px]",
                  teacher.role === "coordinator"
                    ? "bg-accent/20 text-accent"
                    : "bg-muted text-muted-foreground"
                )}
                title={teacher.name}
              >
                {teacher.name.split(" ").slice(-1)[0]}
                {teacher.role === "coordinator" && " ★"}
              </span>
            ))}
            {course.teachers.length > 2 && (
              <span className="text-xs text-muted-foreground">
                +{course.teachers.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Courses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<BaseCourse[]>(initialCourses);
  const [courseGroups, setCourseGroups] = useState<CourseGroup[]>(initialCourseGroups);
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<BaseCourse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const [teachersDialogOpen, setTeachersDialogOpen] = useState(false);
  const [teachersCourse, setTeachersCourse] = useState<BaseCourse | null>(null);

  // Convert BaseCourse to the format expected by CourseGroupsSection
  const catalogCoursesForGroups = courses.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    ects: c.ects,
  }));

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFaculty =
      facultyFilter === "all" || course.faculty.includes(facultyFilter);
    return matchesSearch && matchesFaculty;
  });

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
      toast.success("Course created successfully");
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

  // Get unique faculties for filter
  const uniqueFaculties = [...new Set(courses.map((c) => {
    const match = c.faculty.match(/Faculty of (.+)/);
    return match ? match[1] : c.faculty;
  }))];

  return (
    <div className="page-container">
      <PageHeader
        title="Course Catalog"
        description="Manage standalone courses and course groups"
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

      {/* Course Groups Section */}
      <div className="mb-6">
        <CourseGroupsSection
          groups={courseGroups}
          catalogCourses={catalogCoursesForGroups}
          onGroupsChange={setCourseGroups}
        />
      </div>

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
            {uniqueFaculties.map((faculty) => (
              <SelectItem key={faculty} value={faculty}>
                {faculty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ToggleGroup type="single" value={viewMode} onValueChange={(v) => v && setViewMode(v as "grid" | "table")}>
          <ToggleGroupItem value="grid" aria-label="Grid view">
            <LayoutGrid className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Table view">
            <TableIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
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
          <p className="text-2xl font-semibold">{courseGroups.length}</p>
          <p className="text-sm text-muted-foreground">Course Groups</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredCourses.map((course) => (
            <CourseGridItem
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
              onManageTeachers={() => {
                setTeachersCourse(course);
                setTeachersDialogOpen(true);
              }}
              onViewTeachersPage={() => {
                navigate(`/courses/${course.id}/teachers`);
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
              className: "w-[100px]",
            },
            {
              key: "name",
              header: "Course Name",
              cell: (course) => (
                <div>
                  <p className="font-medium">{course.name}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{course.description}</p>
                </div>
              ),
            },
            {
              key: "faculty",
              header: "Faculty",
              cell: (course) => (
                <span className="text-sm">{course.faculty.replace("Faculty of ", "")}</span>
              ),
            },
            {
              key: "ects",
              header: "ECTS",
              cell: (course) => <span className="font-medium">{course.ects}</span>,
              className: "w-[80px] text-center",
            },
            {
              key: "teachers",
              header: "Teachers",
              cell: (course) => (
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm">{course.teachers.length}</span>
                </div>
              ),
              className: "w-[100px]",
            },
            {
              key: "status",
              header: "Status",
              cell: (course) => <StatusBadge status={course.status} />,
              className: "w-[100px]",
            },
            {
              key: "actions",
              header: "",
              cell: (course) => (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-popover">
                    <DropdownMenuItem onClick={() => {
                      setEditingCourse(course);
                      setDialogOpen(true);
                    }}>
                      Edit Course
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => {
                      setTeachersCourse(course);
                      setTeachersDialogOpen(true);
                    }}>
                      <Users className="h-4 w-4 mr-2" />
                      Quick Assign Teachers
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/courses/${course.id}/teachers`)}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Full Teachers Page
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      setDeletingCourseId(course.id);
                      setDeleteDialogOpen(true);
                    }} className="text-destructive">
                      Archive Course
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
              className: "w-[60px]",
            },
          ]}
          emptyMessage="No courses found"
        />
      )}

      {filteredCourses.length === 0 && viewMode === "grid" && (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg font-medium">No courses found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        course={editingCourse as any}
        onSave={handleSave}
      />

      {teachersCourse && (
        <CourseTeachersDialog
          open={teachersDialogOpen}
          onOpenChange={setTeachersDialogOpen}
          courseName={teachersCourse.name}
          courseCode={teachersCourse.code}
          teachers={teachersCourse.teachers}
          availableTeachers={availableTeachers}
          onSave={handleSaveTeachers}
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
