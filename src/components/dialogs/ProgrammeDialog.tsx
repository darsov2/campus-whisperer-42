import { useState, useEffect } from "react";
import { GraduationCap } from "lucide-react";
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

export interface Programme {
  id: string;
  name: string;
  code: string;
  faculty: string;
  degree: "bachelor" | "master" | "doctorate";
  duration: number;
  totalEcts: number;
  coursesCount: number;
  studentsEnrolled: number;
  status: "active" | "draft" | "archived";
  accreditedUntil: string;
}

interface ProgrammeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programme?: Programme | null;
  onSave: (programme: Omit<Programme, "id" | "coursesCount" | "studentsEnrolled"> & { id?: string }) => void;
}

const faculties = [
  "Faculty of Computer Science",
  "Faculty of Natural Sciences",
  "Faculty of Engineering",
  "Faculty of Economics",
];

export function ProgrammeDialog({ open, onOpenChange, programme, onSave }: ProgrammeDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    faculty: "",
    degree: "bachelor" as Programme["degree"],
    duration: 3,
    totalEcts: 180,
    status: "draft" as Programme["status"],
    accreditedUntil: "",
  });

  useEffect(() => {
    if (programme) {
      setFormData({
        name: programme.name,
        code: programme.code,
        faculty: programme.faculty,
        degree: programme.degree,
        duration: programme.duration,
        totalEcts: programme.totalEcts,
        status: programme.status,
        accreditedUntil: programme.accreditedUntil,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        faculty: "",
        degree: "bachelor",
        duration: 3,
        totalEcts: 180,
        status: "draft",
        accreditedUntil: "",
      });
    }
  }, [programme, open]);

  const handleDegreeChange = (degree: Programme["degree"]) => {
    let duration = 3;
    let totalEcts = 180;
    
    if (degree === "master") {
      duration = 2;
      totalEcts = 120;
    } else if (degree === "doctorate") {
      duration = 4;
      totalEcts = 240;
    }
    
    setFormData(prev => ({ ...prev, degree, duration, totalEcts }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: programme?.id,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-accent" />
            {programme ? "Edit Programme" : "New Programme"}
          </DialogTitle>
          <DialogDescription>
            {programme ? "Update programme details" : "Create a new study programme"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Programme Name</Label>
              <Input
                id="name"
                placeholder="e.g. Computer Science"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Programme Code</Label>
              <Input
                id="code"
                placeholder="e.g. CS-BSC"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
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
              <Label htmlFor="degree">Degree Level</Label>
              <Select 
                value={formData.degree} 
                onValueChange={handleDegreeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bachelor">Bachelor's</SelectItem>
                  <SelectItem value="master">Master's</SelectItem>
                  <SelectItem value="doctorate">Doctorate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (years)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                max={6}
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="totalEcts">Total ECTS</Label>
              <Input
                id="totalEcts"
                type="number"
                min={30}
                max={360}
                value={formData.totalEcts}
                onChange={(e) => setFormData(prev => ({ ...prev, totalEcts: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: Programme["status"]) => setFormData(prev => ({ ...prev, status: value }))}
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

          <div className="space-y-2">
            <Label htmlFor="accreditedUntil">Accredited Until</Label>
            <Input
              id="accreditedUntil"
              type="date"
              value={formData.accreditedUntil}
              onChange={(e) => setFormData(prev => ({ ...prev, accreditedUntil: e.target.value }))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {programme ? "Save Changes" : "Create Programme"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
