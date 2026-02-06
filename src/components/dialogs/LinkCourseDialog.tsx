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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Search, ChevronRight, ChevronLeft, ChevronsRight, ChevronsLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/status-badge";

interface Course {
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
  availableCourses: Course[];
  onLink: (courses: Course[]) => void;
}

function LinkCourseDialog({
  open,
  onOpenChange,
  masterCourseName,
  availableCourses,
  onLink,
}: LinkCourseDialogProps) {
  const [activeTab, setActiveTab] = useState<"existing" | "new">("existing");
  const [searchQuery, setSearchQuery] = useState("");
  
  // List builder state
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);
  const [highlightedAvailable, setHighlightedAvailable] = useState<string | null>(null);
  const [highlightedSelected, setHighlightedSelected] = useState<string | null>(null);

  // New course form state
  const [newCourse, setNewCourse] = useState<{
    code: string;
    name: string;
    accreditation: string;
    ects: string;
    status: "active" | "draft" | "archived";
  }>({
    code: "",
    name: "",
    accreditation: "",
    ects: "",
    status: "draft" as const,
  });

  const unselectedCourses = availableCourses.filter(
    (c) => !selectedCourses.some((sc) => sc.id === c.id)
  );

  const filteredAvailableCourses = unselectedCourses.filter(
    (course) =>
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddOne = () => {
    if (highlightedAvailable) {
      const course = unselectedCourses.find((c) => c.id === highlightedAvailable);
      if (course) {
        setSelectedCourses((prev) => [...prev, course]);
        setHighlightedAvailable(null);
      }
    }
  };

  const handleAddAll = () => {
    setSelectedCourses((prev) => [...prev, ...filteredAvailableCourses]);
    setHighlightedAvailable(null);
  };

  const handleRemoveOne = () => {
    if (highlightedSelected) {
      setSelectedCourses((prev) => prev.filter((c) => c.id !== highlightedSelected));
      setHighlightedSelected(null);
    }
  };

  const handleRemoveAll = () => {
    setSelectedCourses([]);
    setHighlightedSelected(null);
  };

  const handleDoubleClickAvailable = (courseId: string) => {
    const course = unselectedCourses.find((c) => c.id === courseId);
    if (course) {
      setSelectedCourses((prev) => [...prev, course]);
    }
  };

  const handleDoubleClickSelected = (courseId: string) => {
    setSelectedCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  const handleLinkExisting = () => {
    if (selectedCourses.length > 0) {
      onLink(selectedCourses);
      resetAndClose();
    }
  };

  const handleCreateAndLink = () => {
    if (newCourse.code && newCourse.name && newCourse.accreditation) {
      const createdCourse: Course = {
        id: `new-${Date.now()}`,
        code: newCourse.code,
        name: newCourse.name,
        accreditation: newCourse.accreditation,
        accreditationYear: parseInt(newCourse.accreditation.match(/\d{4}/)?.[0] || "2024"),
        status: newCourse.status,
        ects: parseInt(newCourse.ects) || 6,
      };
      onLink([createdCourse]);
      resetAndClose();
    }
  };

  const resetAndClose = () => {
    setSelectedCourses([]);
    setHighlightedAvailable(null);
    setHighlightedSelected(null);
    setSearchQuery("");
    setNewCourse({ code: "", name: "", accreditation: "", ects: "", status: "draft" });
    onOpenChange(false);
  };

  const CourseItem = ({
    course,
    isHighlighted,
    onSelect,
    onDoubleClick,
  }: {
    course: Course;
    isHighlighted: boolean;
    onSelect: () => void;
    onDoubleClick: () => void;
  }) => (
    <div
      className={cn(
        "flex items-center gap-2 p-2 rounded cursor-pointer transition-colors",
        isHighlighted ? "bg-accent/20 border border-accent" : "hover:bg-muted"
      )}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
    >
      <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
            {course.code}
          </span>
          <span className="text-sm truncate">{course.name}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {course.accreditation}
        </p>
      </div>
      <StatusBadge status={course.status} />
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Link Courses to "{masterCourseName}"</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "existing" | "new")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Link Existing</TabsTrigger>
            <TabsTrigger value="new">Create & Link</TabsTrigger>
          </TabsList>

          <TabsContent value="existing" className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search available courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              {/* Available Courses */}
              <div className="flex-1 border rounded-lg">
                <div className="px-3 py-2 border-b bg-muted/50">
                  <span className="text-sm font-medium">Available ({filteredAvailableCourses.length})</span>
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="p-2 space-y-1">
                    {filteredAvailableCourses.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No courses available
                      </p>
                    ) : (
                      filteredAvailableCourses.map((course) => (
                        <CourseItem
                          key={course.id}
                          course={course}
                          isHighlighted={highlightedAvailable === course.id}
                          onSelect={() => setHighlightedAvailable(course.id)}
                          onDoubleClick={() => handleDoubleClickAvailable(course.id)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Transfer Buttons */}
              <div className="flex flex-col justify-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddAll}
                  disabled={filteredAvailableCourses.length === 0}
                  title="Add all"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleAddOne}
                  disabled={!highlightedAvailable}
                  title="Add selected"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRemoveOne}
                  disabled={!highlightedSelected}
                  title="Remove selected"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRemoveAll}
                  disabled={selectedCourses.length === 0}
                  title="Remove all"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
              </div>

              {/* Selected Courses */}
              <div className="flex-1 border rounded-lg border-accent/50">
                <div className="px-3 py-2 border-b bg-accent/10">
                  <span className="text-sm font-medium text-accent">To Link ({selectedCourses.length})</span>
                </div>
                <ScrollArea className="h-[280px]">
                  <div className="p-2 space-y-1">
                    {selectedCourses.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Double-click or use arrows to add courses
                      </p>
                    ) : (
                      selectedCourses.map((course) => (
                        <CourseItem
                          key={course.id}
                          course={course}
                          isHighlighted={highlightedSelected === course.id}
                          onSelect={() => setHighlightedSelected(course.id)}
                          onDoubleClick={() => handleDoubleClickSelected(course.id)}
                        />
                      ))
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="new" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., CS401"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, code: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ects">ECTS Credits</Label>
                <Input
                  id="ects"
                  type="number"
                  placeholder="6"
                  value={newCourse.ects}
                  onChange={(e) => setNewCourse((prev) => ({ ...prev, ects: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Course Name</Label>
              <Input
                id="name"
                placeholder="e.g., Machine Learning Fundamentals"
                value={newCourse.name}
                onChange={(e) => setNewCourse((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accreditation">Accreditation</Label>
                <Select
                  value={newCourse.accreditation}
                  onValueChange={(v) => setNewCourse((prev) => ({ ...prev, accreditation: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select accreditation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2023 Accreditation">2023 Accreditation</SelectItem>
                    <SelectItem value="2020 Accreditation">2020 Accreditation</SelectItem>
                    <SelectItem value="2017 Accreditation">2017 Accreditation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newCourse.status}
                  onValueChange={(v) =>
                    setNewCourse((prev) => ({ ...prev, status: v as "active" | "draft" | "archived" }))
                  }
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
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            Cancel
          </Button>
          {activeTab === "existing" ? (
            <Button onClick={handleLinkExisting} disabled={selectedCourses.length === 0}>
              Link {selectedCourses.length} Course{selectedCourses.length !== 1 && "s"}
            </Button>
          ) : (
            <Button
              onClick={handleCreateAndLink}
              disabled={!newCourse.code || !newCourse.name || !newCourse.accreditation}
            >
              Create & Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { LinkCourseDialog };