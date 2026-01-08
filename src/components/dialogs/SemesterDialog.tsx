import { useState, useEffect } from "react";
import { Calendar, Building2 } from "lucide-react";
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

export interface FacultyOverride {
  facultyId: string;
  facultyName: string;
  enrollmentStart: string;
  enrollmentEnd: string;
  lateEnrollmentEnd: string;
  studyCycles: string[];
}

export interface Semester {
  id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  enrollmentStart: string;
  enrollmentEnd: string;
  lateEnrollmentEnd: string;
  status: "active" | "pending" | "archived";
  facultyOverrides: FacultyOverride[];
}

interface SemesterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  semester?: Semester | null;
  onSave: (semester: Omit<Semester, "id"> & { id?: string }) => void;
}

export function SemesterDialog({ open, onOpenChange, semester, onSave }: SemesterDialogProps) {
  const [formData, setFormData] = useState<{
    name: string;
    academicYear: string;
    startDate: string;
    endDate: string;
    enrollmentStart: string;
    enrollmentEnd: string;
    lateEnrollmentEnd: string;
    status: "active" | "pending" | "archived";
  }>({
    name: "Winter Semester",
    academicYear: "",
    startDate: "",
    endDate: "",
    enrollmentStart: "",
    enrollmentEnd: "",
    lateEnrollmentEnd: "",
    status: "pending",
  });

  useEffect(() => {
    if (semester) {
      setFormData({
        name: semester.name,
        academicYear: semester.academicYear,
        startDate: semester.startDate,
        endDate: semester.endDate,
        enrollmentStart: semester.enrollmentStart,
        enrollmentEnd: semester.enrollmentEnd,
        lateEnrollmentEnd: semester.lateEnrollmentEnd,
        status: semester.status,
      });
    } else {
      setFormData({
        name: "Winter Semester",
        academicYear: "",
        startDate: "",
        endDate: "",
        enrollmentStart: "",
        enrollmentEnd: "",
        lateEnrollmentEnd: "",
        status: "pending",
      });
    }
  }, [semester, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: semester?.id,
      facultyOverrides: semester?.facultyOverrides || [],
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            {semester ? "Edit Semester" : "New Semester"}
          </DialogTitle>
          <DialogDescription>
            {semester ? "Update semester details and dates" : "Create a new academic semester with enrollment periods"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Semester Type</Label>
              <Select 
                value={formData.name} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Winter Semester">Winter Semester</SelectItem>
                  <SelectItem value="Summer Semester">Summer Semester</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Input
                id="academicYear"
                placeholder="e.g. 2024/25"
                value={formData.academicYear}
                onChange={(e) => setFormData(prev => ({ ...prev, academicYear: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-medium mb-3">Enrollment Periods</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="enrollmentStart">Enrollment Start</Label>
                <Input
                  id="enrollmentStart"
                  type="date"
                  value={formData.enrollmentStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, enrollmentStart: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="enrollmentEnd">Enrollment End</Label>
                <Input
                  id="enrollmentEnd"
                  type="date"
                  value={formData.enrollmentEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, enrollmentEnd: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lateEnrollmentEnd">Late Enrollment Until</Label>
                <Input
                  id="lateEnrollmentEnd"
                  type="date"
                  value={formData.lateEnrollmentEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, lateEnrollmentEnd: e.target.value }))}
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: "active" | "pending" | "archived") => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {semester ? "Save Changes" : "Create Semester"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface FacultyOverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  override?: FacultyOverride | null;
  onSave: (override: FacultyOverride) => void;
  existingFacultyIds: string[];
}

const availableFaculties = [
  { id: "fcs", name: "Faculty of Computer Science" },
  { id: "fns", name: "Faculty of Natural Sciences" },
  { id: "fme", name: "Faculty of Mechanical Engineering" },
  { id: "fec", name: "Faculty of Economics" },
];

const studyCycleOptions = ["Bachelor", "Master", "Doctorate"];

export function FacultyOverrideDialog({ open, onOpenChange, override, onSave, existingFacultyIds }: FacultyOverrideDialogProps) {
  const [formData, setFormData] = useState<FacultyOverride>({
    facultyId: "",
    facultyName: "",
    enrollmentStart: "",
    enrollmentEnd: "",
    lateEnrollmentEnd: "",
    studyCycles: [],
  });

  useEffect(() => {
    if (override) {
      setFormData(override);
    } else {
      setFormData({
        facultyId: "",
        facultyName: "",
        enrollmentStart: "",
        enrollmentEnd: "",
        lateEnrollmentEnd: "",
        studyCycles: [],
      });
    }
  }, [override, open]);

  const handleFacultyChange = (facultyId: string) => {
    const faculty = availableFaculties.find(f => f.id === facultyId);
    if (faculty) {
      setFormData(prev => ({ ...prev, facultyId, facultyName: faculty.name }));
    }
  };

  const toggleStudyCycle = (cycle: string) => {
    setFormData(prev => ({
      ...prev,
      studyCycles: prev.studyCycles.includes(cycle)
        ? prev.studyCycles.filter(c => c !== cycle)
        : [...prev.studyCycles, cycle]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onOpenChange(false);
  };

  const filteredFaculties = availableFaculties.filter(
    f => !existingFacultyIds.includes(f.id) || f.id === override?.facultyId
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent" />
            {override ? "Edit Faculty Override" : "Add Faculty Override"}
          </DialogTitle>
          <DialogDescription>
            Configure custom enrollment dates for this faculty
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="faculty">Faculty</Label>
            <Select 
              value={formData.facultyId} 
              onValueChange={handleFacultyChange}
              disabled={!!override}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select faculty..." />
              </SelectTrigger>
              <SelectContent>
                {filteredFaculties.map(faculty => (
                  <SelectItem key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Study Cycles</Label>
            <div className="flex gap-2">
              {studyCycleOptions.map(cycle => (
                <Button
                  key={cycle}
                  type="button"
                  variant={formData.studyCycles.includes(cycle) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleStudyCycle(cycle)}
                  className={formData.studyCycles.includes(cycle) ? "bg-accent text-accent-foreground" : ""}
                >
                  {cycle}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overrideEnrollmentStart">Enrollment Start</Label>
              <Input
                id="overrideEnrollmentStart"
                type="date"
                value={formData.enrollmentStart}
                onChange={(e) => setFormData(prev => ({ ...prev, enrollmentStart: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overrideEnrollmentEnd">Enrollment End</Label>
              <Input
                id="overrideEnrollmentEnd"
                type="date"
                value={formData.enrollmentEnd}
                onChange={(e) => setFormData(prev => ({ ...prev, enrollmentEnd: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="overrideLateEnrollment">Late Until</Label>
              <Input
                id="overrideLateEnrollment"
                type="date"
                value={formData.lateEnrollmentEnd}
                onChange={(e) => setFormData(prev => ({ ...prev, lateEnrollmentEnd: e.target.value }))}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {override ? "Save Changes" : "Add Override"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
