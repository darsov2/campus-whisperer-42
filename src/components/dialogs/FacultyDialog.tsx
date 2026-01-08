import { useState, useEffect } from "react";
import { Building2 } from "lucide-react";
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

export interface Faculty {
  id: string;
  name: string;
  code: string;
  dean: string;
  programmesCount: number;
  coursesCount: number;
  teachersCount: number;
  studentsCount: number;
  status: "active" | "inactive";
}

interface FacultyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty?: Faculty | null;
  onSave: (faculty: Omit<Faculty, "id" | "programmesCount" | "coursesCount" | "teachersCount" | "studentsCount"> & { id?: string }) => void;
}

export function FacultyDialog({ open, onOpenChange, faculty, onSave }: FacultyDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    dean: "",
    status: "active" as Faculty["status"],
  });

  useEffect(() => {
    if (faculty) {
      setFormData({
        name: faculty.name,
        code: faculty.code,
        dean: faculty.dean,
        status: faculty.status,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        dean: "",
        status: "active",
      });
    }
  }, [faculty, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: faculty?.id,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-accent" />
            {faculty ? "Edit Faculty" : "Add Faculty"}
          </DialogTitle>
          <DialogDescription>
            {faculty ? "Update faculty information" : "Create a new faculty"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Faculty Name</Label>
            <Input
              id="name"
              placeholder="e.g. Faculty of Computer Science"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                placeholder="e.g. FCS"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value: Faculty["status"]) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dean">Dean</Label>
            <Input
              id="dean"
              placeholder="e.g. Prof. Maria Garcia"
              value={formData.dean}
              onChange={(e) => setFormData(prev => ({ ...prev, dean: e.target.value }))}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {faculty ? "Save Changes" : "Add Faculty"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
