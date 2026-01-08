import { useState } from "react";
import { 
  Building2, 
  Plus, 
  Users,
  BookOpen,
  GraduationCap,
  MoreHorizontal
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FacultyDialog, type Faculty } from "@/components/dialogs/FacultyDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";
import { toast } from "sonner";

const initialFaculties: Faculty[] = [
  {
    id: "1",
    name: "Faculty of Computer Science",
    code: "FCS",
    dean: "Prof. Maria Garcia",
    programmesCount: 5,
    coursesCount: 86,
    teachersCount: 42,
    studentsCount: 1234,
    status: "active",
  },
  {
    id: "2",
    name: "Faculty of Natural Sciences",
    code: "FNS",
    dean: "Prof. David Lee",
    programmesCount: 8,
    coursesCount: 124,
    teachersCount: 56,
    studentsCount: 892,
    status: "active",
  },
  {
    id: "3",
    name: "Faculty of Engineering",
    code: "FE",
    dean: "Prof. Robert Brown",
    programmesCount: 6,
    coursesCount: 98,
    teachersCount: 38,
    studentsCount: 756,
    status: "active",
  },
  {
    id: "4",
    name: "Faculty of Economics",
    code: "FEC",
    dean: "Prof. Emily White",
    programmesCount: 4,
    coursesCount: 52,
    teachersCount: 24,
    studentsCount: 645,
    status: "active",
  },
];

function FacultyCard({ 
  faculty, 
  onEdit, 
  onDelete 
}: { 
  faculty: Faculty;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="data-card overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{faculty.name}</h3>
                <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">{faculty.code}</span>
                <StatusBadge status={faculty.status} />
              </div>
              <p className="text-sm text-muted-foreground mt-1">Dean: {faculty.dean}</p>
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem onClick={onEdit}>Edit Faculty</DropdownMenuItem>
              <DropdownMenuItem>Manage Departments</DropdownMenuItem>
              <DropdownMenuItem>View Reports</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">Deactivate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <GraduationCap className="h-4 w-4" />
            </div>
            <p className="text-2xl font-semibold">{faculty.programmesCount}</p>
            <p className="text-xs text-muted-foreground">Programmes</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <BookOpen className="h-4 w-4" />
            </div>
            <p className="text-2xl font-semibold">{faculty.coursesCount}</p>
            <p className="text-xs text-muted-foreground">Courses</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-2xl font-semibold">{faculty.teachersCount}</p>
            <p className="text-xs text-muted-foreground">Teachers</p>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-2xl font-semibold">{faculty.studentsCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Students</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Faculties() {
  const [faculties, setFaculties] = useState<Faculty[]>(initialFaculties);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingFacultyId, setDeletingFacultyId] = useState<string | null>(null);

  const handleSave = (data: Omit<Faculty, "id" | "programmesCount" | "coursesCount" | "teachersCount" | "studentsCount"> & { id?: string }) => {
    if (data.id) {
      setFaculties(prev => prev.map(f => f.id === data.id ? { ...f, ...data } as Faculty : f));
      toast.success("Faculty updated successfully");
    } else {
      const newFaculty: Faculty = {
        ...data,
        id: `fac-${Date.now()}`,
        programmesCount: 0,
        coursesCount: 0,
        teachersCount: 0,
        studentsCount: 0,
      };
      setFaculties(prev => [newFaculty, ...prev]);
      toast.success("Faculty added successfully");
    }
  };

  const handleDelete = () => {
    if (deletingFacultyId) {
      setFaculties(prev => prev.filter(f => f.id !== deletingFacultyId));
      toast.success("Faculty deactivated");
      setDeleteDialogOpen(false);
      setDeletingFacultyId(null);
    }
  };

  return (
    <div className="page-container">
      <PageHeader 
        title="Faculties" 
        description="Manage faculties and their departments"
        actions={
          <Button 
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => { setEditingFaculty(null); setDialogOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Faculty
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{faculties.length}</p>
          <p className="text-sm text-muted-foreground">Faculties</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{faculties.reduce((acc, f) => acc + f.programmesCount, 0)}</p>
          <p className="text-sm text-muted-foreground">Total Programmes</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{faculties.reduce((acc, f) => acc + f.teachersCount, 0)}</p>
          <p className="text-sm text-muted-foreground">Total Teachers</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{faculties.reduce((acc, f) => acc + f.studentsCount, 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Students</p>
        </div>
      </div>

      {/* Faculties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {faculties.map((faculty) => (
          <FacultyCard 
            key={faculty.id} 
            faculty={faculty}
            onEdit={() => { setEditingFaculty(faculty); setDialogOpen(true); }}
            onDelete={() => { setDeletingFacultyId(faculty.id); setDeleteDialogOpen(true); }}
          />
        ))}
      </div>

      <FacultyDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        faculty={editingFaculty}
        onSave={handleSave}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Deactivate Faculty"
        description="Are you sure you want to deactivate this faculty? All associated programmes and courses will be affected."
        onConfirm={handleDelete}
      />
    </div>
  );
}
