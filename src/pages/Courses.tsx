import { useState } from "react";
import { 
  BookOpen, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Link2,
  Users,
  Clock,
  GraduationCap
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

interface Course {
  id: string;
  code: string;
  name: string;
  faculty: string;
  programme: string;
  ects: number;
  semester: number;
  teachers: string[];
  status: "active" | "draft" | "archived";
  hasPrerequisites: boolean;
  prerequisiteCount: number;
}

const courses: Course[] = [
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
    hasPrerequisites: false,
    prerequisiteCount: 0,
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
    hasPrerequisites: true,
    prerequisiteCount: 2,
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
    hasPrerequisites: true,
    prerequisiteCount: 3,
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
    hasPrerequisites: false,
    prerequisiteCount: 0,
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
    status: "draft",
    hasPrerequisites: true,
    prerequisiteCount: 4,
  },
];

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="data-card p-5 hover:shadow-elevated transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-lg",
            course.status === "active" ? "bg-accent/10" : "bg-muted"
          )}>
            <BookOpen className={cn(
              "h-5 w-5",
              course.status === "active" ? "text-accent" : "text-muted-foreground"
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
              {course.faculty} • {course.programme}
            </p>
            
            <div className="flex items-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>{course.ects} ECTS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Semester {course.semester}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{course.teachers.length} teacher{course.teachers.length !== 1 && "s"}</span>
              </div>
              {course.hasPrerequisites && (
                <div className="flex items-center gap-1.5">
                  <Link2 className="h-4 w-4 text-accent" />
                  <span className="text-accent font-medium">
                    {course.prerequisiteCount} prerequisite{course.prerequisiteCount !== 1 && "s"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem>Edit Course</DropdownMenuItem>
            <DropdownMenuItem>Manage Teachers</DropdownMenuItem>
            <DropdownMenuItem>Configure Prerequisites</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View Enrollment</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Archive Course</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function Courses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFaculty = facultyFilter === "all" || course.faculty.includes(facultyFilter);
    return matchesSearch && matchesFaculty;
  });

  return (
    <div className="page-container">
      <PageHeader 
        title="Courses" 
        description="Manage courses, assignments, and prerequisites"
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{courses.length}</p>
          <p className="text-sm text-muted-foreground">Total Courses</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{courses.filter(c => c.status === "active").length}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{courses.filter(c => c.hasPrerequisites).length}</p>
          <p className="text-sm text-muted-foreground">With Prerequisites</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{courses.reduce((acc, c) => acc + c.ects, 0)}</p>
          <p className="text-sm text-muted-foreground">Total ECTS</p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="space-y-3">
        {filteredCourses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  );
}
