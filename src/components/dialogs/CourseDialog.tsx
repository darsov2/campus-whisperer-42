import { useState, useEffect } from "react";
import { BookOpen } from "lucide-react";
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

export interface CourseRule {
  id: string;
  type: "prerequisite" | "corequisite" | "ects_min" | "semester_min";
  operator: "and" | "or";
  value: string;
  label: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  faculty: string;
  programme: string;
  ects: number;
  semester: number;
  teachers: string[];
  status: "active" | "draft" | "archived";
  rules: CourseRule[];
}

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: Course | null;
  onSave: (course: Omit<Course, "id"> & { id?: string }) => void;
}

const faculties = [
  "Faculty of Computer Science",
  "Faculty of Natural Sciences",
  "Faculty of Engineering",
  "Faculty of Economics",
];

const programmes = [
  "Computer Science BSc",
  "Computer Science MSc",
  "Mathematics BSc",
  "Data Science MSc",
  "Mechanical Engineering BSc",
];

export function CourseDialog({ open, onOpenChange, course, onSave }: CourseDialogProps) {
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    faculty: string;
    programme: string;
    ects: number;
    semester: number;
    status: "active" | "draft" | "archived";
  }>({
    code: "",
    name: "",
    faculty: "",
    programme: "",
    ects: 6,
    semester: 1,
    status: "draft",
  });

  useEffect(() => {
    if (course) {
      setFormData({
        code: course.code,
        name: course.name,
        faculty: course.faculty,
        programme: course.programme,
        ects: course.ects,
        semester: course.semester,
        status: course.status,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        faculty: "",
        programme: "",
        ects: 6,
        semester: 1,
        status: "draft",
      });
    }
  }, [course, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: course?.id,
      teachers: course?.teachers || [],
      rules: course?.rules || [],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            {course ? "Edit Course" : "New Course"}
          </DialogTitle>
          <DialogDescription>
            {course ? "Update course details" : "Create a new course"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Course Code</Label>
              <Input
                id="code"
                placeholder="e.g. CS101"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                placeholder="e.g. Introduction to Programming"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
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
              <Label htmlFor="programme">Programme</Label>
              <Select 
                value={formData.programme} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, programme: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select programme..." />
                </SelectTrigger>
                <SelectContent>
                  {programmes.map(p => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ects">ECTS Credits</Label>
              <Input
                id="ects"
                type="number"
                min={1}
                max={30}
                value={formData.ects}
                onChange={(e) => setFormData(prev => ({ ...prev, ects: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                type="number"
                min={1}
                max={10}
                value={formData.semester}
                onChange={(e) => setFormData(prev => ({ ...prev, semester: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: "active" | "draft" | "archived") => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {course ? "Save Changes" : "Create Course"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
