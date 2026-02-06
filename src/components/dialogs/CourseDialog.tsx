import { useState, useEffect } from "react";
import { BookOpen, Layers } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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

// Base course for catalog (simplified)
export interface BaseCourse {
  id: string;
  code: string;
  name: string;
  faculty: string;
  ects: number;
  description: string;
  status: "active" | "draft" | "archived";
}

export interface MasterCourseOption {
  id: string;
  name: string;
}

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course?: BaseCourse | null;
  masterCourses?: MasterCourseOption[];
  onSave: (course: Omit<BaseCourse, "id"> & { id?: string; masterCourseId?: string; createNewMasterCourse?: boolean }) => void;
}

const faculties = [
  "Faculty of Computer Science",
  "Faculty of Natural Sciences",
  "Faculty of Engineering",
  "Faculty of Economics",
];

export function CourseDialog({ open, onOpenChange, course, masterCourses = [], onSave }: CourseDialogProps) {
  const [formData, setFormData] = useState<{
    code: string;
    name: string;
    faculty: string;
    ects: number;
    description: string;
    status: "active" | "draft" | "archived";
  }>({
    code: "",
    name: "",
    faculty: "",
    ects: 6,
    description: "",
    status: "draft",
  });

  const [masterCourseId, setMasterCourseId] = useState<string>("");
  const [createNewMasterCourse, setCreateNewMasterCourse] = useState(false);

  useEffect(() => {
    if (course) {
      setFormData({
        code: course.code,
        name: course.name,
        faculty: course.faculty,
        ects: course.ects,
        description: course.description || "",
        status: course.status,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        faculty: "",
        ects: 6,
        description: "",
        status: "draft",
      });
    }
    setMasterCourseId("");
    setCreateNewMasterCourse(false);
  }, [course, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: course?.id,
      masterCourseId: !createNewMasterCourse && masterCourseId ? masterCourseId : undefined,
      createNewMasterCourse: createNewMasterCourse,
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
            {course ? "Update course details in the catalog" : "Add a new course to the catalog"}
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
            <div className="grid grid-cols-2 gap-4">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the course content..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Master Course Section */}
          {!course && (
            <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" />
                <Label className="text-sm font-medium">Master Course</Label>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="createNewMasterCourse"
                  checked={createNewMasterCourse}
                  onCheckedChange={(checked) => {
                    setCreateNewMasterCourse(!!checked);
                    if (checked) setMasterCourseId("");
                  }}
                />
                <Label htmlFor="createNewMasterCourse" className="text-sm cursor-pointer">
                  Create a new master course from this course
                </Label>
              </div>

              {!createNewMasterCourse && (
                <Select
                  value={masterCourseId}
                  onValueChange={setMasterCourseId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select existing master course (optional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {masterCourses.map((mc) => (
                      <SelectItem key={mc.id} value={mc.id}>
                        {mc.name}
                      </SelectItem>
                    ))}
                    {masterCourses.length === 0 && (
                      <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                        No master courses available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              )}

              {createNewMasterCourse && formData.name && (
                <p className="text-xs text-muted-foreground">
                  A new master course "<strong>{formData.name}</strong>" will be created automatically.
                </p>
              )}
            </div>
          )}

          <div className="p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            <p>💡 <strong>Note:</strong> After creating the course, you can:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Assign teachers via "Manage Teachers"</li>
              <li>Link to programmes via Study Programmes → Manage Courses</li>
              <li>Configure rules per programme where this course is linked</li>
            </ul>
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
