import { useState, useEffect } from "react";
import { BookOpen, Search } from "lucide-react";
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
import { cn } from "@/lib/utils";

export interface BaseCourse {
  id: string;
  code: string;
  name: string;
  ects: number;
}

// Single rule condition
export interface RuleCondition {
  id: string;
  type: "prerequisite" | "corequisite" | "ects_min" | "semester_min";
  value: string;
  label: string;
}

// A group of conditions connected by the same operator
export interface RuleGroup {
  id: string;
  operator: "and" | "or";
  conditions: RuleCondition[];
}

// The entire rule structure: groups connected by operators
export interface ProgrammeCourseRules {
  groupOperator: "and" | "or"; // How groups are connected
  groups: RuleGroup[];
}

export interface ProgrammeCourse {
  id: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  ects: number;
  semester: number;
  type: "mandatory" | "elective";
  rules: ProgrammeCourseRules;
  teachers?: { id: string; name: string; role: "coordinator" | "lecturer" | "assistant" }[];
  // Equivalents are stored as groups (alternatives). Each group lists one or more
  // courses that TOGETHER are considered equivalent to this programme course.
  equivalents?: { id: string; courses: { id: string; code: string; name: string; ects: number }[] }[];
}

// Legacy rule format for backwards compatibility
export interface ProgrammeCourseRule {
  id: string;
  type: "prerequisite" | "corequisite" | "ects_min" | "semester_min";
  operator: "and" | "or";
  value: string;
  label: string;
}

interface ProgrammeCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programmeName: string;
  programmeCourse?: ProgrammeCourse | null;
  availableCourses: BaseCourse[];
  onSave: (programmeCourse: Omit<ProgrammeCourse, "id"> & { id?: string }) => void;
}

// Helper to create empty rules structure
export function createEmptyRules(): ProgrammeCourseRules {
  return {
    groupOperator: "and",
    groups: [],
  };
}

export function ProgrammeCourseDialog({
  open,
  onOpenChange,
  programmeName,
  programmeCourse,
  availableCourses,
  onSave,
}: ProgrammeCourseDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState<BaseCourse | null>(null);
  const [formData, setFormData] = useState({
    semester: 1,
    type: "mandatory" as ProgrammeCourse["type"],
    ects: 6,
  });

  useEffect(() => {
    if (programmeCourse) {
      const course = availableCourses.find(c => c.id === programmeCourse.courseId);
      setSelectedCourse(course || null);
      setFormData({
        semester: programmeCourse.semester,
        type: programmeCourse.type,
        ects: programmeCourse.ects,
      });
    } else {
      setSelectedCourse(null);
      setFormData({ semester: 1, type: "mandatory", ects: 6 });
    }
    setSearchQuery("");
  }, [programmeCourse, availableCourses, open]);

  // Update ECTS when course is selected (use default from catalog)
  useEffect(() => {
    if (selectedCourse && !programmeCourse) {
      setFormData(prev => ({ ...prev, ects: selectedCourse.ects }));
    }
  }, [selectedCourse, programmeCourse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    onSave({
      id: programmeCourse?.id,
      courseId: selectedCourse.id,
      courseCode: selectedCourse.code,
      courseName: selectedCourse.name,
      ects: formData.ects,
      semester: formData.semester,
      type: formData.type,
      rules: programmeCourse?.rules || createEmptyRules(),
    });
    onOpenChange(false);
  };

  const filteredCourses = availableCourses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-accent" />
            {programmeCourse ? "Edit Programme Course" : "Add Course to Programme"}
          </DialogTitle>
          <DialogDescription>
            {programmeCourse
              ? `Update course settings for ${programmeName}`
              : `Link a course from the catalog to ${programmeName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label>Course</Label>
            {selectedCourse ? (
              <div className="p-4 border rounded-lg bg-accent/5 border-accent/30">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                        {selectedCourse.code}
                      </span>
                      <span className="font-semibold">{selectedCourse.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedCourse.ects} ECTS
                    </p>
                  </div>
                  {!programmeCourse && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedCourse(null)}
                    >
                      Change
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search courses from catalog..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="border rounded-lg max-h-48 overflow-y-auto">
                  {filteredCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No courses found
                    </p>
                  ) : (
                    filteredCourses.slice(0, 10).map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer transition-colors border-b last:border-b-0"
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                              {course.code}
                            </span>
                            <span className="font-medium">{course.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {course.ects} ECTS
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {selectedCourse && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Input
                    id="semester"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        semester: parseInt(e.target.value) || 1,
                      }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ects">
                    ECTS Credits
                    {selectedCourse.ects !== formData.ects && (
                      <span className="text-xs text-warning ml-1">(modified)</span>
                    )}
                  </Label>
                  <Input
                    id="ects"
                    type="number"
                    min={1}
                    max={30}
                    value={formData.ects}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        ects: parseInt(e.target.value) || 1,
                      }))
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Catalog default: {selectedCourse.ects} ECTS
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Course Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: ProgrammeCourse["type"]) =>
                      setFormData((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mandatory">Mandatory</SelectItem>
                      <SelectItem value="elective">Elective</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className={cn(
                "p-3 rounded-lg text-sm",
                formData.type === "mandatory" 
                  ? "bg-accent/10 text-accent border border-accent/30"
                  : "bg-info/10 text-info border border-info/30"
              )}>
                {formData.type === "mandatory" 
                  ? "This course is required for all students in the programme"
                  : "This course is optional - students can choose whether to enroll"}
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
              disabled={!selectedCourse}
            >
              {programmeCourse ? "Save Changes" : "Add to Programme"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
