import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Users,
  Plus,
  Search,
  ArrowLeft,
  Trash2,
  Check,
  GraduationCap,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";

// Types
interface CourseTeacher {
  id: string;
  name: string;
  title: string;
  role: "coordinator" | "lecturer" | "assistant";
}

interface AvailableTeacher {
  id: string;
  name: string;
  title: string;
  faculty: string;
  department: string;
}

// Mock data - in real app this would come from API/context
const mockCourse = {
  id: "1",
  code: "CS101",
  name: "Introduction to Programming",
  faculty: "Faculty of Computer Science",
};

const mockAssignedTeachers: CourseTeacher[] = [
  { id: "t1", name: "Dr. John Smith", title: "Associate Professor", role: "coordinator" },
  { id: "t2", name: "Prof. Maria Garcia", title: "Full Professor", role: "lecturer" },
];

const mockAvailableTeachers: AvailableTeacher[] = [
  { id: "t1", name: "Dr. John Smith", title: "Associate Professor", faculty: "Faculty of Computer Science", department: "Software Engineering" },
  { id: "t2", name: "Prof. Maria Garcia", title: "Full Professor", faculty: "Faculty of Computer Science", department: "AI" },
  { id: "t3", name: "Prof. Anna Johnson", title: "Full Professor", faculty: "Faculty of Computer Science", department: "Database" },
  { id: "t4", name: "Prof. David Lee", title: "Full Professor", faculty: "Faculty of Natural Sciences", department: "Mathematics" },
  { id: "t5", name: "Dr. Sarah Chen", title: "Assistant Professor", faculty: "Faculty of Computer Science", department: "Data Science" },
  { id: "t6", name: "Dr. Michael Brown", title: "Senior Lecturer", faculty: "Faculty of Computer Science", department: "Networks" },
  { id: "t7", name: "Dr. Emily Wilson", title: "Lecturer", faculty: "Faculty of Computer Science", department: "Programming" },
  { id: "t8", name: "Prof. Robert Taylor", title: "Full Professor", faculty: "Faculty of Engineering", department: "Systems" },
  { id: "t9", name: "Dr. Lisa Anderson", title: "Associate Professor", faculty: "Faculty of Computer Science", department: "Security" },
  { id: "t10", name: "Dr. James Martinez", title: "Assistant Professor", faculty: "Faculty of Computer Science", department: "Graphics" },
];

const roleLabels = {
  coordinator: "Course Coordinator",
  lecturer: "Lecturer",
  assistant: "Teaching Assistant",
};

const roleColors = {
  coordinator: "bg-accent text-accent-foreground",
  lecturer: "bg-info/20 text-info",
  assistant: "bg-muted text-muted-foreground",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

export default function CourseTeachers() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // State
  const [teachers, setTeachers] = useState<CourseTeacher[]>(mockAssignedTeachers);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTeacherId, setDeletingTeacherId] = useState<string | null>(null);

  // Filter available teachers (not already assigned)
  const availableTeachers = useMemo(() => {
    return mockAvailableTeachers.filter(
      (t) =>
        !teachers.some((assigned) => assigned.id === t.id) &&
        (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.department.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [teachers, searchQuery]);

  const toggleSelection = (teacherId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(teacherId)) {
        next.delete(teacherId);
      } else {
        next.add(teacherId);
      }
      return next;
    });
  };

  const addSelectedTeachers = () => {
    const newTeachers: CourseTeacher[] = [];
    selectedIds.forEach((id) => {
      const teacher = mockAvailableTeachers.find((t) => t.id === id);
      if (teacher) {
        newTeachers.push({
          id: teacher.id,
          name: teacher.name,
          title: teacher.title,
          role: teachers.length === 0 && newTeachers.length === 0 ? "coordinator" : "lecturer",
        });
      }
    });
    setTeachers([...teachers, ...newTeachers]);
    setSelectedIds(new Set());
    toast.success(`Added ${newTeachers.length} teacher${newTeachers.length !== 1 ? "s" : ""}`);
  };

  const updateRole = (teacherId: string, role: CourseTeacher["role"]) => {
    setTeachers(teachers.map((t) => (t.id === teacherId ? { ...t, role } : t)));
    toast.success("Role updated");
  };

  const handleDelete = () => {
    if (deletingTeacherId) {
      setTeachers(teachers.filter((t) => t.id !== deletingTeacherId));
      toast.success("Teacher removed from course");
      setDeleteDialogOpen(false);
      setDeletingTeacherId(null);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/courses")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
      </div>

      <PageHeader
        title={`Teachers - ${mockCourse.code}`}
        description={`Manage teaching staff for ${mockCourse.name}`}
      />

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Assigned Teachers Panel */}
        <div className="data-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-accent" />
              Assigned Teachers ({teachers.length})
            </h3>
          </div>

          {teachers.length === 0 ? (
            <div className="text-center py-12 border border-dashed rounded-lg bg-muted/20">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No teachers assigned</p>
              <p className="text-sm text-muted-foreground">
                Select teachers from the right panel to add
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="flex items-center gap-3 p-3 bg-card border rounded-lg"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                      {getInitials(teacher.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{teacher.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {teacher.title}
                    </p>
                  </div>
                  <Select
                    value={teacher.role}
                    onValueChange={(value: CourseTeacher["role"]) =>
                      updateRole(teacher.id, value)
                    }
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                      <SelectItem value="lecturer">Lecturer</SelectItem>
                      <SelectItem value="assistant">Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                  <Badge className={cn("text-xs shrink-0", roleColors[teacher.role])}>
                    {roleLabels[teacher.role]}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDeletingTeacherId(teacher.id);
                      setDeleteDialogOpen(true);
                    }}
                    className="text-destructive hover:text-destructive shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Available Teachers Panel */}
        <div className="data-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-muted-foreground" />
              Available Teachers
            </h3>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, title, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent/30 rounded-lg">
                <span className="text-sm text-accent font-medium">
                  {selectedIds.size} teacher{selectedIds.size !== 1 && "s"} selected
                </span>
                <Button
                  size="sm"
                  onClick={addSelectedTeachers}
                  className="bg-accent hover:bg-accent/90"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to Course
                </Button>
              </div>
            )}

            <div className="border rounded-lg max-h-[500px] overflow-y-auto">
              {availableTeachers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery
                    ? "No matching teachers found"
                    : "All teachers are assigned"}
                </div>
              ) : (
                availableTeachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className={cn(
                      "flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0",
                      selectedIds.has(teacher.id) && "bg-accent/5"
                    )}
                    onClick={() => toggleSelection(teacher.id)}
                  >
                    <Checkbox
                      checked={selectedIds.has(teacher.id)}
                      onCheckedChange={() => toggleSelection(teacher.id)}
                    />
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="text-xs">
                        {getInitials(teacher.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{teacher.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {teacher.title} • {teacher.department}
                      </p>
                    </div>
                    {selectedIds.has(teacher.id) && (
                      <Check className="h-4 w-4 text-accent shrink-0" />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Remove Teacher"
        description="Are you sure you want to remove this teacher from the course?"
        onConfirm={handleDelete}
      />
    </div>
  );
}
