import { useState } from "react";
import { 
  Users, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  BookOpen,
  Award
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface Teacher {
  id: string;
  name: string;
  email: string;
  phone: string;
  faculty: string;
  department: string;
  title: "prof" | "assoc_prof" | "asst_prof" | "lecturer";
  coursesCount: number;
  status: "active" | "pending" | "inactive";
}

const teachers: Teacher[] = [
  {
    id: "1",
    name: "Dr. John Smith",
    email: "john.smith@university.edu",
    phone: "+1 555-0101",
    faculty: "Faculty of Computer Science",
    department: "Software Engineering",
    title: "assoc_prof",
    coursesCount: 4,
    status: "active",
  },
  {
    id: "2",
    name: "Prof. Maria Garcia",
    email: "maria.garcia@university.edu",
    phone: "+1 555-0102",
    faculty: "Faculty of Computer Science",
    department: "Artificial Intelligence",
    title: "prof",
    coursesCount: 3,
    status: "active",
  },
  {
    id: "3",
    name: "Dr. Sarah Chen",
    email: "sarah.chen@university.edu",
    phone: "+1 555-0103",
    faculty: "Faculty of Computer Science",
    department: "Data Science",
    title: "asst_prof",
    coursesCount: 2,
    status: "active",
  },
  {
    id: "4",
    name: "Prof. David Lee",
    email: "david.lee@university.edu",
    phone: "+1 555-0104",
    faculty: "Faculty of Natural Sciences",
    department: "Applied Mathematics",
    title: "prof",
    coursesCount: 5,
    status: "active",
  },
  {
    id: "5",
    name: "Anna Johnson",
    email: "anna.johnson@university.edu",
    phone: "+1 555-0105",
    faculty: "Faculty of Computer Science",
    department: "Database Systems",
    title: "lecturer",
    coursesCount: 2,
    status: "pending",
  },
];

const titleLabels = {
  prof: "Professor",
  assoc_prof: "Assoc. Professor",
  asst_prof: "Asst. Professor",
  lecturer: "Lecturer",
};

const titleColors = {
  prof: "bg-accent/10 text-accent",
  assoc_prof: "bg-info/10 text-info",
  asst_prof: "bg-success/10 text-success",
  lecturer: "bg-muted text-muted-foreground",
};

function getInitials(name: string) {
  return name.split(" ").map(n => n[0]).join("").toUpperCase();
}

function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <div className="data-card p-5 hover:shadow-elevated transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
              {getInitials(teacher.name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{teacher.name}</h3>
              <span className={cn("px-2 py-0.5 rounded text-xs font-medium", titleColors[teacher.title])}>
                {titleLabels[teacher.title]}
              </span>
              <StatusBadge status={teacher.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {teacher.department} • {teacher.faculty}
            </p>
            
            <div className="flex items-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href={`mailto:${teacher.email}`} className="hover:text-accent transition-colors">
                  {teacher.email}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{teacher.phone}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{teacher.coursesCount} course{teacher.coursesCount !== 1 && "s"}</span>
              </div>
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
            <DropdownMenuItem>Edit Profile</DropdownMenuItem>
            <DropdownMenuItem>Manage Courses</DropdownMenuItem>
            <DropdownMenuItem>View Schedule</DropdownMenuItem>
            <DropdownMenuSeparator />
            {teacher.status === "pending" && (
              <DropdownMenuItem className="text-success">Approve</DropdownMenuItem>
            )}
            <DropdownMenuItem className="text-destructive">Deactivate</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function Teachers() {
  const [searchQuery, setSearchQuery] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("all");

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = 
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFaculty = facultyFilter === "all" || teacher.faculty.includes(facultyFilter);
    return matchesSearch && matchesFaculty;
  });

  return (
    <div className="page-container">
      <PageHeader 
        title="Teachers" 
        description="Manage teaching staff and course assignments"
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
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
          <p className="text-2xl font-semibold">{teachers.length}</p>
          <p className="text-sm text-muted-foreground">Total Teachers</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{teachers.filter(t => t.title === "prof").length}</p>
          <p className="text-sm text-muted-foreground">Professors</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{teachers.filter(t => t.status === "pending").length}</p>
          <p className="text-sm text-muted-foreground">Pending Approval</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{teachers.reduce((acc, t) => acc + t.coursesCount, 0)}</p>
          <p className="text-sm text-muted-foreground">Course Assignments</p>
        </div>
      </div>

      {/* Teachers Grid */}
      <div className="space-y-3">
        {filteredTeachers.map((teacher) => (
          <TeacherCard key={teacher.id} teacher={teacher} />
        ))}
      </div>
    </div>
  );
}
