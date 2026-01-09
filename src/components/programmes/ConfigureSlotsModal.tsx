import { useState, useEffect } from "react";
import {
  Grid3X3,
  Plus,
  Clock,
  MoreHorizontal,
  Lock,
  Unlock,
  BookOpen,
  FolderOpen,
  Settings2,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { ProgrammeWithDetails, ProgrammeSlot, SlotRule, CourseGroup } from "./types";
import type { BaseCourse } from "@/components/dialogs/ProgrammeCourseDialog";

interface ConfigureSlotsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programme: ProgrammeWithDetails | null;
  catalogCourses: BaseCourse[];
  courseGroups: CourseGroup[];
  onSlotsChange: (programmeId: string, slots: ProgrammeSlot[]) => void;
}

export function ConfigureSlotsModal({
  open,
  onOpenChange,
  programme,
  catalogCourses,
  courseGroups,
  onSlotsChange,
}: ConfigureSlotsModalProps) {
  const [activeSemester, setActiveSemester] = useState("1");
  const [slots, setSlots] = useState<ProgrammeSlot[]>([]);
  const [slotDialogOpen, setSlotDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ProgrammeSlot | null>(null);
  const [currentSemester, setCurrentSemester] = useState(1);

  // Form state for slot dialog
  const [slotForm, setSlotForm] = useState({
    type: "mandatory" as "mandatory" | "optional",
    courseId: "",
    name: "",
    minEcts: 0,
    maxEcts: 0,
    rules: [] as SlotRule[],
  });

  useEffect(() => {
    if (programme) {
      setSlots(programme.slots || []);
    }
  }, [programme]);

  if (!programme) return null;

  const totalSemesters = programme.duration * 2;
  const semesters = Array.from({ length: totalSemesters }, (_, i) => i + 1);

  const slotsInSemester = (semester: number) =>
    slots.filter((s) => s.semester === semester).sort((a, b) => a.position - b.position);

  const getNextPosition = (semester: number) => {
    const semSlots = slotsInSemester(semester);
    return semSlots.length > 0 ? Math.max(...semSlots.map((s) => s.position)) + 1 : 1;
  };

  const getCourse = (courseId: string) => catalogCourses.find((c) => c.id === courseId);

  const openAddSlotDialog = (semester: number) => {
    setCurrentSemester(semester);
    setEditingSlot(null);
    setSlotForm({
      type: "mandatory",
      courseId: "",
      name: "",
      minEcts: 0,
      maxEcts: 0,
      rules: [],
    });
    setSlotDialogOpen(true);
  };

  const openEditSlotDialog = (slot: ProgrammeSlot) => {
    setEditingSlot(slot);
    setCurrentSemester(slot.semester);
    setSlotForm({
      type: slot.type,
      courseId: slot.courseId || "",
      name: slot.name || "",
      minEcts: slot.minEcts || 0,
      maxEcts: slot.maxEcts || 0,
      rules: slot.rules || [],
    });
    setSlotDialogOpen(true);
  };

  const handleSaveSlot = () => {
    const course = slotForm.type === "mandatory" ? getCourse(slotForm.courseId) : null;

    const newSlot: ProgrammeSlot = {
      id: editingSlot?.id || `slot-${Date.now()}`,
      semester: currentSemester,
      position: editingSlot?.position || getNextPosition(currentSemester),
      type: slotForm.type,
      ...(slotForm.type === "mandatory" && course
        ? {
            courseId: course.id,
            courseCode: course.code,
            courseName: course.name,
            ects: course.ects,
          }
        : {
            name: slotForm.name,
            minEcts: slotForm.minEcts,
            maxEcts: slotForm.maxEcts,
            rules: slotForm.rules,
          }),
    };

    if (editingSlot) {
      setSlots((prev) => prev.map((s) => (s.id === editingSlot.id ? newSlot : s)));
    } else {
      setSlots((prev) => [...prev, newSlot]);
    }

    setSlotDialogOpen(false);
  };

  const handleDeleteSlot = (slotId: string) => {
    setSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  const handleSaveAll = () => {
    onSlotsChange(programme.id, slots);
    onOpenChange(false);
  };

  const addRule = () => {
    setSlotForm((prev) => ({
      ...prev,
      rules: [
        ...prev.rules,
        {
          id: `rule-${Date.now()}`,
          type: "course_group",
          value: "",
          label: "",
        },
      ],
    }));
  };

  const updateRule = (ruleId: string, updates: Partial<SlotRule>) => {
    setSlotForm((prev) => ({
      ...prev,
      rules: prev.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
    }));
  };

  const removeRule = (ruleId: string) => {
    setSlotForm((prev) => ({
      ...prev,
      rules: prev.rules.filter((r) => r.id !== ruleId),
    }));
  };

  const totalSlots = slots.length;
  const mandatorySlots = slots.filter((s) => s.type === "mandatory").length;
  const optionalSlots = slots.filter((s) => s.type === "optional").length;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Grid3X3 className="h-6 w-6 text-primary" />
                  Configure Slots - {programme.name}
                </DialogTitle>
                <DialogDescription className="mt-1">
                  Define the slot structure for tracking student progress (1 slot = 1 course)
                </DialogDescription>
              </div>
              <Button onClick={handleSaveAll}>Save Slot Configuration</Button>
            </div>

            {/* Summary Stats */}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Total Slots:</span>
                <span className="font-medium">{totalSlots}</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-accent" />
                <span className="text-muted-foreground">Mandatory:</span>
                <span className="font-medium text-accent">{mandatorySlots}</span>
              </div>
              <div className="flex items-center gap-2">
                <Unlock className="h-3.5 w-3.5 text-info" />
                <span className="text-muted-foreground">Optional:</span>
                <span className="font-medium text-info">{optionalSlots}</span>
              </div>
            </div>
          </DialogHeader>

          <Tabs
            value={activeSemester}
            onValueChange={setActiveSemester}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-6 pt-4 border-b">
              <TabsList className="w-full justify-start overflow-x-auto">
                {semesters.map((sem) => {
                  const semSlots = slotsInSemester(sem);
                  return (
                    <TabsTrigger
                      key={sem}
                      value={String(sem)}
                      className="flex items-center gap-2"
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Semester {sem}
                      {semSlots.length > 0 && (
                        <span className="text-xs text-muted-foreground">
                          ({semSlots.length} slots)
                        </span>
                      )}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
            </div>

            {semesters.map((sem) => (
              <TabsContent
                key={sem}
                value={String(sem)}
                className="flex-1 overflow-hidden m-0"
              >
                <ScrollArea className="h-full px-6">
                  <div className="py-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">Semester {sem} Slots</h3>
                      <Button onClick={() => openAddSlotDialog(sem)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Slot
                      </Button>
                    </div>

                    {slotsInSemester(sem).length === 0 ? (
                      <div className="text-center py-16 border border-dashed rounded-lg bg-muted/20">
                        <Grid3X3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                        <p className="text-lg text-muted-foreground">
                          No slots defined for Semester {sem}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Add slots to define the programme structure
                        </p>
                        <Button className="mt-4" onClick={() => openAddSlotDialog(sem)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Slot
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {slotsInSemester(sem).map((slot, index) => (
                          <div
                            key={slot.id}
                            className={cn(
                              "p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow",
                              slot.type === "mandatory"
                                ? "border-l-4 border-l-accent"
                                : "border-l-4 border-l-info"
                            )}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="shrink-0">
                                    Slot {index + 1}
                                  </Badge>
                                  {slot.type === "mandatory" ? (
                                    <>
                                      <Lock className="h-4 w-4 text-accent" />
                                      <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                                        {slot.courseCode}
                                      </span>
                                      <span className="font-medium truncate">
                                        {slot.courseName}
                                      </span>
                                      <span className="text-sm text-muted-foreground">
                                        {slot.ects} ECTS
                                      </span>
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="h-4 w-4 text-info" />
                                      <span className="font-medium">{slot.name}</span>
                                      {(slot.minEcts || slot.maxEcts) && (
                                        <span className="text-sm text-muted-foreground">
                                          {slot.minEcts && slot.maxEcts
                                            ? `${slot.minEcts}-${slot.maxEcts} ECTS`
                                            : slot.minEcts
                                            ? `Min ${slot.minEcts} ECTS`
                                            : `Max ${slot.maxEcts} ECTS`}
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>

                                {slot.type === "optional" && slot.rules && slot.rules.length > 0 && (
                                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    <span className="text-sm text-muted-foreground">Rules:</span>
                                    {slot.rules.map((rule) => (
                                      <Badge key={rule.id} variant="secondary" className="text-xs">
                                        {rule.label || rule.value}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-popover">
                                  <DropdownMenuItem onClick={() => openEditSlotDialog(slot)}>
                                    <Settings2 className="h-4 w-4 mr-2" />
                                    Edit Slot
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    className="text-destructive"
                                    onClick={() => handleDeleteSlot(slot.id)}
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete Slot
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Slot Edit Dialog */}
      <Dialog open={slotDialogOpen} onOpenChange={setSlotDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSlot ? "Edit Slot" : "Add Slot"} - Semester {currentSemester}
            </DialogTitle>
            <DialogDescription>
              Configure a slot for student progress tracking
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Slot Type</Label>
              <Select
                value={slotForm.type}
                onValueChange={(v: "mandatory" | "optional") =>
                  setSlotForm((prev) => ({ ...prev, type: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="mandatory">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-accent" />
                      Mandatory (Fixed Course)
                    </div>
                  </SelectItem>
                  <SelectItem value="optional">
                    <div className="flex items-center gap-2">
                      <Unlock className="h-4 w-4 text-info" />
                      Optional (Rule-based)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {slotForm.type === "mandatory" ? (
              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={slotForm.courseId}
                  onValueChange={(v) => setSlotForm((prev) => ({ ...prev, courseId: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover max-h-60">
                    {catalogCourses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">{course.code}</span>
                          <span>{course.name}</span>
                          <span className="text-muted-foreground">({course.ects} ECTS)</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Slot Name</Label>
                  <Input
                    placeholder="e.g., Humanities Elective"
                    value={slotForm.name}
                    onChange={(e) =>
                      setSlotForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min ECTS (optional)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={slotForm.minEcts || ""}
                      onChange={(e) =>
                        setSlotForm((prev) => ({
                          ...prev,
                          minEcts: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max ECTS (optional)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={slotForm.maxEcts || ""}
                      onChange={(e) =>
                        setSlotForm((prev) => ({
                          ...prev,
                          maxEcts: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Rules (Courses that can fill this slot)</Label>
                    <Button variant="outline" size="sm" onClick={addRule}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Rule
                    </Button>
                  </div>

                  {slotForm.rules.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">
                      No rules defined - any course can fill this slot
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {slotForm.rules.map((rule) => (
                        <div
                          key={rule.id}
                          className="flex items-center gap-2 p-3 border rounded-lg bg-muted/30"
                        >
                          <Select
                            value={rule.type}
                            onValueChange={(v) =>
                              updateRule(rule.id, {
                                type: v as SlotRule["type"],
                                value: "",
                                label: "",
                              })
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              <SelectItem value="course_group">
                                <div className="flex items-center gap-2">
                                  <FolderOpen className="h-3 w-3" />
                                  Course Group
                                </div>
                              </SelectItem>
                              <SelectItem value="min_ects">Min ECTS</SelectItem>
                              <SelectItem value="max_ects">Max ECTS</SelectItem>
                            </SelectContent>
                          </Select>

                          {rule.type === "course_group" ? (
                            <Select
                              value={rule.value}
                              onValueChange={(v) => {
                                const group = courseGroups.find((g) => g.id === v);
                                updateRule(rule.id, {
                                  value: v,
                                  label: group ? `Group: ${group.name}` : "",
                                });
                              }}
                            >
                              <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select group" />
                              </SelectTrigger>
                              <SelectContent className="bg-popover">
                                {courseGroups.map((group) => (
                                  <SelectItem key={group.id} value={group.id}>
                                    {group.code} - {group.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type="number"
                              className="flex-1"
                              placeholder="ECTS value"
                              value={rule.value}
                              onChange={(e) =>
                                updateRule(rule.id, {
                                  value: e.target.value,
                                  label: `${
                                    rule.type === "min_ects" ? "Min" : "Max"
                                  } ${e.target.value} ECTS`,
                                })
                              }
                            />
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRule(rule.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSlotDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveSlot}
              disabled={
                slotForm.type === "mandatory"
                  ? !slotForm.courseId
                  : !slotForm.name.trim()
              }
            >
              {editingSlot ? "Save Changes" : "Add Slot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
