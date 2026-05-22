import { useState } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  GraduationCap,
  BookOpen,
  Calendar,
  AlertTriangle,
  FileText,
  ChevronRight,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

// Types
interface StudentPersonalData {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  nationality: string;
  address: string;
  enrollmentDate: string;
  status: "active" | "suspended" | "graduated" | "withdrawn";
}

interface EnrolledSemester {
  id: string;
  semesterName: string;
  academicYear: string;
  status: "completed" | "in_progress" | "failed";
  gpa: number;
  enrolledCredits: number;
  earnedCredits: number;
}

interface CourseEnrollment {
  id: string;
  semesterId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  grade: string | null;
  status: "passed" | "failed" | "in_progress" | "withdrawn";
  examDate: string | null;
}

interface DisciplinaryRecord {
  id: string;
  date: string;
  type: "warning" | "probation" | "suspension" | "expulsion";
  reason: string;
  resolvedDate: string | null;
  notes: string;
}

interface Student extends StudentPersonalData {
  programme: string;
  programmeCode: string;
  faculty: string;
  currentSemester: number;
  totalCredits: number;
  gpa: number;
  semesters: EnrolledSemester[];
  courses: CourseEnrollment[];
  disciplinaryRecords: DisciplinaryRecord[];
}

// Mock data
const mockStudents: Student[] = [
  {
    id: "1",
    studentId: "2021-CS-001",
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@student.edu",
    phone: "+1 555-0201",
    dateOfBirth: "2000-05-15",
    nationality: "American",
    address: "123 University Ave, Campus City, ST 12345",
    enrollmentDate: "2021-09-01",
    status: "active",
    programme: "Computer Science",
    programmeCode: "CS-BSC",
    faculty: "Faculty of Computer Science",
    currentSemester: 6,
    totalCredits: 150,
    gpa: 3.65,
    semesters: [
      { id: "s1", semesterName: "Fall 2021", academicYear: "2021/2022", status: "completed", gpa: 3.4, enrolledCredits: 30, earnedCredits: 30 },
      { id: "s2", semesterName: "Spring 2022", academicYear: "2021/2022", status: "completed", gpa: 3.5, enrolledCredits: 30, earnedCredits: 30 },
      { id: "s3", semesterName: "Fall 2022", academicYear: "2022/2023", status: "completed", gpa: 3.7, enrolledCredits: 30, earnedCredits: 30 },
      { id: "s4", semesterName: "Spring 2023", academicYear: "2022/2023", status: "completed", gpa: 3.8, enrolledCredits: 30, earnedCredits: 30 },
      { id: "s5", semesterName: "Fall 2023", academicYear: "2023/2024", status: "completed", gpa: 3.7, enrolledCredits: 30, earnedCredits: 30 },
      { id: "s6", semesterName: "Spring 2024", academicYear: "2023/2024", status: "in_progress", gpa: 0, enrolledCredits: 30, earnedCredits: 0 },
    ],
    courses: [
      { id: "c1", semesterId: "s1", courseCode: "CS101", courseName: "Introduction to Programming", credits: 6, grade: "A", status: "passed", examDate: "2022-01-15" },
      { id: "c2", semesterId: "s1", courseCode: "MA101", courseName: "Calculus I", credits: 7, grade: "B+", status: "passed", examDate: "2022-01-18" },
      { id: "c3", semesterId: "s3", courseCode: "CS201", courseName: "Data Structures", credits: 6, grade: "A-", status: "passed", examDate: "2023-01-20" },
      { id: "c4", semesterId: "s5", courseCode: "CS301", courseName: "Database Systems", credits: 5, grade: "A", status: "passed", examDate: "2024-01-12" },
      { id: "c5", semesterId: "s6", courseCode: "CS401", courseName: "Machine Learning", credits: 6, grade: null, status: "in_progress", examDate: null },
    ],
    disciplinaryRecords: [],
  },
  {
    id: "2",
    studentId: "2020-CS-042",
    firstName: "Maria",
    lastName: "Garcia",
    email: "maria.garcia@student.edu",
    phone: "+1 555-0202",
    dateOfBirth: "1999-11-22",
    nationality: "Spanish",
    address: "456 College Blvd, University Town, ST 54321",
    enrollmentDate: "2020-09-01",
    status: "active",
    programme: "Computer Science",
    programmeCode: "CS-BSC",
    faculty: "Faculty of Computer Science",
    currentSemester: 8,
    totalCredits: 175,
    gpa: 3.82,
    semesters: [
      { id: "s1", semesterName: "Fall 2020", academicYear: "2020/2021", status: "completed", gpa: 3.9, enrolledCredits: 30, earnedCredits: 30 },
      { id: "s2", semesterName: "Spring 2021", academicYear: "2020/2021", status: "completed", gpa: 3.8, enrolledCredits: 30, earnedCredits: 30 },
    ],
    courses: [
      { id: "c1", semesterId: "s1", courseCode: "CS101", courseName: "Introduction to Programming", credits: 6, grade: "A", status: "passed", examDate: "2021-01-15" },
    ],
    disciplinaryRecords: [],
  },
  {
    id: "3",
    studentId: "2022-MA-015",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@student.edu",
    phone: "+1 555-0203",
    dateOfBirth: "2001-03-08",
    nationality: "British",
    address: "789 Academic Dr, Study City, ST 67890",
    enrollmentDate: "2022-09-01",
    status: "suspended",
    programme: "Mathematics",
    programmeCode: "MA-BSC",
    faculty: "Faculty of Natural Sciences",
    currentSemester: 4,
    totalCredits: 90,
    gpa: 2.85,
    semesters: [
      { id: "s1", semesterName: "Fall 2022", academicYear: "2022/2023", status: "completed", gpa: 3.0, enrolledCredits: 30, earnedCredits: 27 },
      { id: "s2", semesterName: "Spring 2023", academicYear: "2022/2023", status: "completed", gpa: 2.8, enrolledCredits: 30, earnedCredits: 30 },
    ],
    courses: [
      { id: "c1", semesterId: "s1", courseCode: "MA101", courseName: "Calculus I", credits: 7, grade: "B", status: "passed", examDate: "2023-01-15" },
      { id: "c2", semesterId: "s1", courseCode: "MA102", courseName: "Linear Algebra", credits: 6, grade: "F", status: "failed", examDate: "2023-01-18" },
    ],
    disciplinaryRecords: [
      { id: "d1", date: "2023-11-15", type: "warning", reason: "Academic dishonesty - plagiarism detected", resolvedDate: "2023-12-01", notes: "First offense, counseling completed" },
      { id: "d2", date: "2024-02-20", type: "suspension", reason: "Repeated academic dishonesty", resolvedDate: null, notes: "One semester suspension effective Spring 2024" },
    ],
  },
];

const statusColors = {
  active: "bg-success/20 text-success",
  suspended: "bg-destructive/20 text-destructive",
  graduated: "bg-accent/20 text-accent",
  withdrawn: "bg-muted text-muted-foreground",
};

const courseStatusColors = {
  passed: "bg-success/20 text-success",
  failed: "bg-destructive/20 text-destructive",
  in_progress: "bg-info/20 text-info",
  withdrawn: "bg-muted text-muted-foreground",
};

const disciplinaryColors = {
  warning: "bg-warning/20 text-warning",
  probation: "bg-warning/20 text-warning",
  suspension: "bg-destructive/20 text-destructive",
  expulsion: "bg-destructive text-destructive-foreground",
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
}

export default function Students() {
  const navigate = useNavigate();
  const [students] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [adminLookupId, setAdminLookupId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAdminLookup = () => {
    const student = students.find(
      (s) => s.studentId.toLowerCase() === adminLookupId.toLowerCase()
    );
    if (student) {
      setSelectedStudent(student);
      setSheetOpen(true);
    }
  };

  const openStudentRecord = (student: Student) => {
    setSelectedStudent(student);
    setSheetOpen(true);
  };

  // Stats
  const activeCount = students.filter((s) => s.status === "active").length;
  const suspendedCount = students.filter((s) => s.status === "suspended").length;
  const avgGpa = (students.reduce((acc, s) => acc + s.gpa, 0) / students.length).toFixed(2);

  return (
    <div className="page-container">
      <PageHeader
        title="Students"
        description="Manage student records, enrollments, and academic history"
      />

      {/* Admin Lookup */}
      <div className="data-card p-4 mb-6 bg-accent/5 border-accent/20">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1.5 block">
              Admin Student Lookup
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter Student ID (e.g., 2021-CS-001)"
                value={adminLookupId}
                onChange={(e) => setAdminLookupId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminLookup()}
                className="max-w-sm"
              />
              <Button onClick={handleAdminLookup} className="bg-accent hover:bg-accent/90">
                <Eye className="h-4 w-4 mr-2" />
                View Full Record
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, ID, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="graduated">Graduated</SelectItem>
            <SelectItem value="withdrawn">Withdrawn</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{students.length}</p>
          <p className="text-sm text-muted-foreground">Total Students</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold text-success">{activeCount}</p>
          <p className="text-sm text-muted-foreground">Active</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold text-destructive">{suspendedCount}</p>
          <p className="text-sm text-muted-foreground">Suspended</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{avgGpa}</p>
          <p className="text-sm text-muted-foreground">Avg GPA</p>
        </div>
      </div>

      {/* Students List */}
      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <div
            key={student.id}
            className="data-card p-4 hover:shadow-elevated transition-all cursor-pointer"
            onClick={() => openStudentRecord(student)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(student.firstName, student.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                      {student.studentId}
                    </span>
                    <span className="font-semibold">
                      {student.firstName} {student.lastName}
                    </span>
                    <Badge className={cn("text-xs", statusColors[student.status])}>
                      {student.status}
                    </Badge>
                    {student.disciplinaryRecords.length > 0 && (
                      <Badge variant="outline" className="text-xs text-warning border-warning">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Disciplinary
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {student.programme} ({student.programmeCode}) • {student.faculty}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold">{student.currentSemester}</p>
                  <p className="text-xs text-muted-foreground">Semester</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{student.totalCredits}</p>
                  <p className="text-xs text-muted-foreground">Credits</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{student.gpa.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">GPA</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/students/${student.id}`);
                  }}
                >
                  Open profile
                </Button>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Student Record Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-3xl overflow-y-auto">
          {selectedStudent && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(selectedStudent.firstName, selectedStudent.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                        {selectedStudent.studentId}
                      </span>
                      {selectedStudent.firstName} {selectedStudent.lastName}
                      <Badge className={cn("text-xs", statusColors[selectedStudent.status])}>
                        {selectedStudent.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">
                      {selectedStudent.programme} • GPA: {selectedStudent.gpa.toFixed(2)}
                    </p>
                  </div>
                </SheetTitle>
                <SheetDescription>
                  Complete student record and academic history
                </SheetDescription>
              </SheetHeader>

              <Tabs defaultValue="personal" className="mt-6">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="semesters">Semesters</TabsTrigger>
                  <TabsTrigger value="courses">Courses</TabsTrigger>
                  <TabsTrigger value="disciplinary" className="relative">
                    Disciplinary
                    {selectedStudent.disciplinaryRecords.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                        {selectedStudent.disciplinaryRecords.length}
                      </span>
                    )}
                  </TabsTrigger>
                </TabsList>

                {/* Personal Data Tab */}
                <TabsContent value="personal" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="font-medium">{selectedStudent.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="font-medium">{selectedStudent.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{selectedStudent.dateOfBirth}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Nationality</p>
                      <p className="font-medium">{selectedStudent.nationality}</p>
                    </div>
                    <div className="space-y-1 col-span-2">
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="font-medium">{selectedStudent.address}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Enrollment Date</p>
                      <p className="font-medium">{selectedStudent.enrollmentDate}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Faculty</p>
                      <p className="font-medium">{selectedStudent.faculty}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="data-card p-4 text-center">
                      <Calendar className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xl font-semibold">{selectedStudent.currentSemester}</p>
                      <p className="text-xs text-muted-foreground">Current Semester</p>
                    </div>
                    <div className="data-card p-4 text-center">
                      <BookOpen className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xl font-semibold">{selectedStudent.totalCredits}</p>
                      <p className="text-xs text-muted-foreground">Total Credits</p>
                    </div>
                    <div className="data-card p-4 text-center">
                      <GraduationCap className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                      <p className="text-xl font-semibold">{selectedStudent.gpa.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">Cumulative GPA</p>
                    </div>
                  </div>
                </TabsContent>

                {/* Semesters Tab */}
                <TabsContent value="semesters" className="space-y-3 mt-4">
                  {selectedStudent.semesters.map((semester) => (
                    <div key={semester.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{semester.semesterName}</p>
                          <p className="text-sm text-muted-foreground">{semester.academicYear}</p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-center">
                            <p className="font-semibold">{semester.earnedCredits}/{semester.enrolledCredits}</p>
                            <p className="text-xs text-muted-foreground">Credits</p>
                          </div>
                          {semester.status !== "in_progress" && (
                            <div className="text-center">
                              <p className="font-semibold">{semester.gpa.toFixed(2)}</p>
                              <p className="text-xs text-muted-foreground">GPA</p>
                            </div>
                          )}
                          <Badge className={cn(
                            "text-xs",
                            semester.status === "completed" && "bg-success/20 text-success",
                            semester.status === "in_progress" && "bg-info/20 text-info",
                            semester.status === "failed" && "bg-destructive/20 text-destructive"
                          )}>
                            {semester.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-3 mt-4">
                  {selectedStudent.courses.map((course) => (
                    <div key={course.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                              {course.courseCode}
                            </span>
                            <span className="font-medium">{course.courseName}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {course.credits} ECTS
                            {course.examDate && ` • Exam: ${course.examDate}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          {course.grade && (
                            <span className="text-lg font-bold">{course.grade}</span>
                          )}
                          <Badge className={cn("text-xs", courseStatusColors[course.status])}>
                            {course.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </TabsContent>

                {/* Disciplinary Tab */}
                <TabsContent value="disciplinary" className="space-y-3 mt-4">
                  {selectedStudent.disciplinaryRecords.length === 0 ? (
                    <div className="text-center py-8 border border-dashed rounded-lg bg-muted/20">
                      <FileText className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No disciplinary records</p>
                    </div>
                  ) : (
                    selectedStudent.disciplinaryRecords.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg border-destructive/30 bg-destructive/5">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className={cn("text-xs", disciplinaryColors[record.type])}>
                                {record.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">{record.date}</span>
                              {record.resolvedDate && (
                                <Badge variant="outline" className="text-xs text-success border-success">
                                  Resolved {record.resolvedDate}
                                </Badge>
                              )}
                            </div>
                            <p className="font-medium mt-2">{record.reason}</p>
                            {record.notes && (
                              <p className="text-sm text-muted-foreground mt-1">{record.notes}</p>
                            )}
                          </div>
                          <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
