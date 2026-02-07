import { useState } from "react";
import { GraduationCap, Search } from "lucide-react";
import { NativeModal } from "@/components/ui/native-modal";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ProgrammeOption {
  id: string;
  name: string;
  code: string;
  degree: "bachelor" | "master" | "doctorate";
  faculty: string;
  semester?: number;
  ects?: number;
  type?: "mandatory" | "elective";
}

interface ProgrammePickerDialogProps {
  open: boolean;
  onClose: () => void;
  courseName: string;
  courseCode: string;
  programmes: ProgrammeOption[];
  onSelect: (programme: ProgrammeOption) => void;
  title?: string;
  description?: string;
}

const degreeLabels = {
  bachelor: "BSc",
  master: "MSc",
  doctorate: "PhD",
};

const degreeColors = {
  bachelor: "bg-info/10 text-info",
  master: "bg-accent/10 text-accent",
  doctorate: "bg-warning/10 text-warning",
};

export function ProgrammePickerDialog({
  open,
  onClose,
  courseName,
  courseCode,
  programmes,
  onSelect,
  title = "Select Programme",
  description,
}: ProgrammePickerDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = programmes.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <NativeModal
      open={open}
      onClose={onClose}
      title={title}
      description={description || `Select a programme for ${courseCode} - ${courseName}`}
      icon={<GraduationCap className="h-5 w-5 text-accent" />}
      className="max-w-[500px]"
    >
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programmes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg max-h-[400px] overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {programmes.length === 0
                ? "This course is not linked to any programme"
                : "No matching programmes found"}
            </div>
          ) : (
            filtered.map((prog) => (
              <div
                key={prog.id}
                className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0"
                onClick={() => {
                  onSelect(prog);
                  onClose();
                }}
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn("text-xs", degreeColors[prog.degree])}>
                        {degreeLabels[prog.degree]}
                      </Badge>
                      <span className="font-medium">{prog.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({prog.code})
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {prog.faculty}
                      {prog.semester != null && ` • Semester ${prog.semester}`}
                      {prog.ects != null && ` • ${prog.ects} ECTS`}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </NativeModal>
  );
}
