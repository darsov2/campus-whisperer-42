import { useState } from "react";
import {
  FolderOpen,
  Plus,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  BookOpen,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { CourseGroup } from "./types";
import type { BaseCourse } from "@/components/dialogs/ProgrammeCourseDialog";

interface CourseGroupsSectionProps {
  groups: CourseGroup[];
  catalogCourses: BaseCourse[];
  onGroupsChange: (groups: CourseGroup[]) => void;
}

export function CourseGroupsSection({
  groups,
  catalogCourses,
  onGroupsChange,
}: CourseGroupsSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CourseGroup | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    courseIds: [] as string[],
  });
  const [searchQuery, setSearchQuery] = useState("");

  const resetForm = () => {
    setFormData({ name: "", code: "", description: "", courseIds: [] });
    setSearchQuery("");
  };

  const openCreateDialog = () => {
    setEditingGroup(null);
    resetForm();
    setDialogOpen(true);
  };

  const openEditDialog = (group: CourseGroup) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      code: group.code,
      description: group.description || "",
      courseIds: [...group.courseIds],
    });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingGroup) {
      // Update
      onGroupsChange(
        groups.map((g) =>
          g.id === editingGroup.id
            ? { ...g, ...formData }
            : g
        )
      );
    } else {
      // Create
      const newGroup: CourseGroup = {
        id: `cg-${Date.now()}`,
        ...formData,
      };
      onGroupsChange([...groups, newGroup]);
    }
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (groupId: string) => {
    onGroupsChange(groups.filter((g) => g.id !== groupId));
  };

  const toggleCourse = (courseId: string) => {
    setFormData((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }));
  };

  const filteredCourses = catalogCourses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCourseName = (courseId: string) => {
    const course = catalogCourses.find((c) => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : courseId;
  };

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="data-card">
          <CollapsibleTrigger asChild>
            <button className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <FolderOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold">Course Groups</h3>
                  <p className="text-sm text-muted-foreground">
                    {groups.length} groups configured
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    openCreateDialog();
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Group
                </Button>
                {isOpen ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </button>
          </CollapsibleTrigger>

          <CollapsibleContent>
            <div className="border-t px-4 py-4">
              {groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No course groups defined yet</p>
                  <p className="text-sm mt-1">
                    Create groups to categorize courses for slot rules
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {groups.map((group) => (
                    <div
                      key={group.id}
                      className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                              {group.code}
                            </span>
                            <h4 className="font-medium truncate">{group.name}</h4>
                          </div>
                          {group.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {group.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {group.courseIds.length} courses
                            </span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-popover">
                            <DropdownMenuItem onClick={() => openEditDialog(group)}>
                              Edit Group
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(group.id)}
                            >
                              Delete Group
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? "Edit Course Group" : "Create Course Group"}
            </DialogTitle>
            <DialogDescription>
              Group courses together for use in slot rules
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Humanities Electives"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., HUM-ELEC"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Brief description of this group"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden space-y-2">
              <div className="flex items-center justify-between">
                <Label>Courses in Group</Label>
                <Badge variant="outline">{formData.courseIds.length} selected</Badge>
              </div>

              {/* Selected courses */}
              {formData.courseIds.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-lg">
                  {formData.courseIds.map((id) => (
                    <Badge
                      key={id}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {getCourseName(id)}
                      <button
                        onClick={() => toggleCourse(id)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />

              <ScrollArea className="flex-1 border rounded-lg">
                <div className="p-2 space-y-1">
                  {filteredCourses.map((course) => (
                    <label
                      key={course.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded cursor-pointer transition-colors",
                        formData.courseIds.includes(course.id)
                          ? "bg-accent/10"
                          : "hover:bg-muted"
                      )}
                    >
                      <Checkbox
                        checked={formData.courseIds.includes(course.id)}
                        onCheckedChange={() => toggleCourse(course.id)}
                      />
                      <span className="font-mono text-sm">{course.code}</span>
                      <span className="flex-1">{course.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {course.ects} ECTS
                      </span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.code.trim()}
            >
              {editingGroup ? "Save Changes" : "Create Group"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
