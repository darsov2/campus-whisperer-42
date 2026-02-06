import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Search, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvailableCourse {
  id: string;
  code: string;
  name: string;
  accreditation: string;
  accreditationYear: number;
  status: "active" | "draft" | "archived";
  ects: number;
}

interface LinkCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterCourseName: string;
  availableCourses: AvailableCourse[];
  onLink: (
    courses: Array<{
      id: string;
      code: string;
      name: string;
      accreditation: string;
      accreditationYear: number;
      status: "active" | "draft" | "archived";
      ects: number;
    }>
  ) => void;
}

export function LinkCourseDialog({
  open,
  onOpenChange,
  masterCourseName,
  availableCourses,
  onLink,
}: LinkCourseDialogProps) {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<Set<string>>(new Set());

  // New course form state
  const [newCourse, setNewCourse] = useState<{
    code: string;
    name: string;
    accreditation: string;
    accreditationYear: number;
    status: "active" | "draft" | "archived";
    ects: number;
  }>({
    code: "",
    name: "",
    accreditation: "",
    accreditationYear: new Date().getFullYear(),
    status: "draft",
    ects: 6,
  });

  const filteredCourses = availableCourses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedCourseIds(new Set(filteredCourses.map((c) => c.id)));
  };

  const deselectAll = () => {
    setSelectedCourseIds(new Set());
  };

  const handleLink = () => {
    if (activeTab === "existing" && selectedCourseIds.size > 0) {
      const selectedCourses = availableCourses
        .filter((c) => selectedCourseIds.has(c.id))
        .map((course) => ({
          id: course.id,
          code: course.code,
          name: course.name,
          accreditation: course.accreditation,
          accreditationYear: course.accreditationYear,
          status: course.status,
          ects: course.ects,
        }));
      onLink(selectedCourses);
      onOpenChange(false);
      resetForm();
    } else if (activeTab === "new" && newCourse.code && newCourse.name) {
      onLink([{ id: `new-${Date.now()}`, ...newCourse }]);
      onOpenChange(false);
      resetForm();
    }
  };

  const resetForm = () => {
    setSearchQuery("");
    setSelectedCourseIds(new Set());
    setActiveTab("existing");
    setNewCourse({
      code: "",
      name: "",
      accreditation: "",
      accreditationYear: new Date().getFullYear(),
      status: "draft",
      ects: 6,
    });
  };

  const allFilteredSelected = filteredCourses.length > 0 && filteredCourses.every((c) => selectedCourseIds.has(c.id));

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Link Courses to "{masterCourseName}"</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Link Existing Courses</TabsTrigger>
            <TabsTrigger value="new">Create & Link New</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="space-y-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={allFilteredSelected ? deselectAll : selectAll}
              >
                {allFilteredSelected ? "Deselect All" : "Select All"}
              </Button>
            </div>

            {selectedCourseIds.size > 0 && (
              <div className="text-sm text-muted-foreground">
                {selectedCourseIds.size} course{selectedCourseIds.size !== 1 && "s"} selected
              </div>
            )}

            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  onClick={() => toggleCourseSelection(course.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                    selectedCourseIds.has(course.id)
                      ? "border-accent bg-accent/5"
                      : "hover:bg-muted/50"
                  )}
                >
                  <Checkbox
                    checked={selectedCourseIds.has(course.id)}
                    onCheckedChange={() => toggleCourseSelection(course.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                        {course.code}
                      </span>
                      <span className="font-medium">{course.name}</span>
                      <StatusBadge status={course.status} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {course.accreditation} • {course.ects} ECTS
                    </p>
                  </div>
                </div>
              ))}

              {filteredCourses.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No available courses found. Try creating a new one.
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Code</Label>
                <Input
                  placeholder="e.g., CS101"
                  value={newCourse.code}
                  onChange={(e) =>
                    setNewCourse((prev) => ({ ...prev, code: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>ECTS</Label>
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={newCourse.ects}
                  onChange={(e) =>
                    setNewCourse((prev) => ({
                      ...prev,
                      ects: parseInt(e.target.value) || 6,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Course Name</Label>
              <Input
                placeholder="e.g., Introduction to Programming"
                value={newCourse.name}
                onChange={(e) =>
                  setNewCourse((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Accreditation</Label>
                <Input
                  placeholder="e.g., 2023 Accreditation"
                  value={newCourse.accreditation}
                  onChange={(e) =>
                    setNewCourse((prev) => ({
                      ...prev,
                      accreditation: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Accreditation Year</Label>
                <Input
                  type="number"
                  min={2000}
                  max={2100}
                  value={newCourse.accreditationYear}
                  onChange={(e) =>
                    setNewCourse((prev) => ({
                      ...prev,
                      accreditationYear: parseInt(e.target.value) || 2023,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={newCourse.status}
                onValueChange={(v) =>
                  setNewCourse((prev) => ({
                    ...prev,
                    status: v as "active" | "draft" | "archived",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleLink}
            disabled={
              (activeTab === "existing" && selectedCourseIds.size === 0) ||
              (activeTab === "new" && (!newCourse.code || !newCourse.name))
            }
          >
            {activeTab === "existing" ? (
              <>Link {selectedCourseIds.size > 0 ? `${selectedCourseIds.size} Course${selectedCourseIds.size !== 1 ? "s" : ""}` : "Selected"}</>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Create & Link
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}