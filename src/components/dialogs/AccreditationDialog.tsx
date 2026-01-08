import { useState, useEffect } from "react";
import { FileCheck } from "lucide-react";
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

export interface Accreditation {
  id: string;
  programmeName: string;
  programmeCode: string;
  faculty: string;
  agency: string;
  validFrom: string;
  validUntil: string;
  status: "valid" | "expiring" | "expired" | "pending";
  documents: number;
}

interface AccreditationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accreditation?: Accreditation | null;
  onSave: (accreditation: Omit<Accreditation, "id" | "documents"> & { id?: string }) => void;
}

const agencies = [
  "National Accreditation Agency",
  "Engineering Board",
  "European Quality Assurance",
  "International Accreditation Council",
];

const programmes = [
  { name: "Computer Science BSc", code: "CS-BSC", faculty: "Faculty of Computer Science" },
  { name: "Computer Science MSc", code: "CS-MSC", faculty: "Faculty of Computer Science" },
  { name: "Data Science MSc", code: "DS-MSC", faculty: "Faculty of Computer Science" },
  { name: "Mathematics BSc", code: "MA-BSC", faculty: "Faculty of Natural Sciences" },
  { name: "Mechanical Engineering BSc", code: "ME-BSC", faculty: "Faculty of Engineering" },
];

export function AccreditationDialog({ open, onOpenChange, accreditation, onSave }: AccreditationDialogProps) {
  const [formData, setFormData] = useState({
    programmeCode: "",
    programmeName: "",
    faculty: "",
    agency: "",
    validFrom: "",
    validUntil: "",
    status: "pending" as Accreditation["status"],
  });

  useEffect(() => {
    if (accreditation) {
      setFormData({
        programmeCode: accreditation.programmeCode,
        programmeName: accreditation.programmeName,
        faculty: accreditation.faculty,
        agency: accreditation.agency,
        validFrom: accreditation.validFrom,
        validUntil: accreditation.validUntil,
        status: accreditation.status,
      });
    } else {
      setFormData({
        programmeCode: "",
        programmeName: "",
        faculty: "",
        agency: "",
        validFrom: "",
        validUntil: "",
        status: "pending",
      });
    }
  }, [accreditation, open]);

  const handleProgrammeChange = (code: string) => {
    const programme = programmes.find(p => p.code === code);
    if (programme) {
      setFormData(prev => ({
        ...prev,
        programmeCode: programme.code,
        programmeName: programme.name,
        faculty: programme.faculty,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: accreditation?.id,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-accent" />
            {accreditation ? "Edit Accreditation" : "New Accreditation"}
          </DialogTitle>
          <DialogDescription>
            {accreditation ? "Update accreditation details" : "Create a new accreditation record"}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="programme">Programme</Label>
            <Select 
              value={formData.programmeCode} 
              onValueChange={handleProgrammeChange}
              disabled={!!accreditation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select programme..." />
              </SelectTrigger>
              <SelectContent>
                {programmes.map(p => (
                  <SelectItem key={p.code} value={p.code}>
                    {p.name} ({p.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agency">Accreditation Agency</Label>
            <Select 
              value={formData.agency} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, agency: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select agency..." />
              </SelectTrigger>
              <SelectContent>
                {agencies.map(a => (
                  <SelectItem key={a} value={a}>{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) => setFormData(prev => ({ ...prev, validFrom: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: Accreditation["status"]) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="valid">Valid</SelectItem>
                <SelectItem value="expiring">Expiring Soon</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">
              {accreditation ? "Save Changes" : "Create Accreditation"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
