import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface Teacher {
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

interface TeacherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher?: Teacher | null;
  onSave: (teacher: Omit<Teacher, "id" | "coursesCount"> & { id?: string }) => void;
}

const faculties = [
  "Faculty of Computer Science",
  "Faculty of Natural Sciences",
  "Faculty of Engineering",
  "Faculty of Economics",
];

const departments = [
  "Software Engineering",
  "Artificial Intelligence",
  "Data Science",
  "Database Systems",
  "Applied Mathematics",
  "Physics",
  "Mechanical Systems",
];

export function TeacherDialog({ open, onOpenChange, teacher, onSave }: TeacherDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    faculty: "",
    department: "",
    title: "lecturer" as Teacher["title"],
    status: "pending" as Teacher["status"],
  });

  useEffect(() => {
    if (teacher) {
      setFormData({
        name: teacher.name,
        email: teacher.email,
        phone: teacher.phone,
        faculty: teacher.faculty,
        department: teacher.department,
        title: teacher.title,
        status: teacher.status,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        faculty: "",
        department: "",
        title: "lecturer",
        status: "pending",
      });
    }
  }, [teacher, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: teacher?.id,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-accent" />
            {teacher ? "Edit Teacher" : "Add Teacher"}
          </DialogTitle>
          <DialogDescription>
            {teacher ? "Update teacher profile information" : "Add a new teacher to the system"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g. Dr. John Smith"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Academic Title</Label>
              <Select 
                value={formData.title} 
                onValueChange={(value: Teacher["title"]) => setFormData(prev => ({ ...prev, title: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prof">Professor</SelectItem>
                  <SelectItem value="assoc_prof">Associate Professor</SelectItem>
                  <SelectItem value="asst_prof">Assistant Professor</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@university.edu"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="+1 555-0100"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="faculty">Faculty</Label>
              <Select 
                value={formData.faculty} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, faculty: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select faculty..." />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map(f => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select 
                value={formData.department} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department..." />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: Teacher["status"]) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending Approval</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {teacher ? "Save Changes" : "Add Teacher"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
