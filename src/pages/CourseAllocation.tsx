import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCheck,
  Clock,
  Copy,
  FlaskConical,
  Globe,
  History,
  Megaphone,
  Minus,
  Monitor,
  Plus,
  Send,
  Split,
  User,
  Users,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type ClassType,
  type AllocationEntry,
  courses,
  teachers,
  semesters,
  initialPreferences,
  initialAllocations,
  previousAllocations,
  getClassTypeConfig,
  CLASS_TYPES,
} from "@/data/allocation-data";

export default function CourseAllocation() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === courseId);

  const [allocations, setAllocations] = useState<AllocationEntry[]>(initialAllocations);
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [newAllocTeacher, setNewAllocTeacher] = useState("");
  const [newAllocType, setNewAllocType] = useState<ClassType>("lecture");
  const [newAllocGroups, setNewAllocGroups] = useState(1);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <p className="text-muted-foreground">Course not found</p>
        <Button variant="outline" onClick={() => navigate("/allocation")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Allocation
        </Button>
      </div>
    );
  }

  const courseAllocations = allocations.filter(a => a.courseId === course.id);
  const coursePreferences = initialPreferences.filter(p => p.courseId === course.id);
  const prevCourseAllocations = previousAllocations.filter(a => a.courseId === course.id);

  const getGroupsAllocated = (classType: ClassType) =>
    courseAllocations.filter(a => a.classType === classType).reduce((s, a) => s + a.groups, 0);

  const totalAllocated = courseAllocations.reduce((s, a) => s + a.groups, 0);
  const totalNeeded = course.classTypes.reduce((s, t) => s + course.totalGroups[t], 0);
  const coverage = totalNeeded > 0 ? Math.round((totalAllocated / totalNeeded) * 100) : 0;

  const removeAllocation = (id: string) => {
    setAllocations(prev => prev.filter(a => a.id !== id));
    toast.success("Allocation removed");
  };

  const updateGroups = (id: string, delta: number) => {
    setAllocations(prev => prev.map(a => {
      if (a.id !== id) return a;
      const g = Math.max(1, a.groups + delta);
      return { ...a, groups: g };
    }));
  };

  const handleAllocate = () => {
    const teacher = teachers.find(t => t.id === newAllocTeacher);
    if (!teacher) return;

    const existing = courseAllocations.find(a => a.teacherId === newAllocTeacher && a.classType === newAllocType);
    if (existing) {
      setAllocations(prev => prev.map(a =>
        a.id === existing.id ? { ...a, groups: a.groups + newAllocGroups } : a
      ));
    } else {
      setAllocations(prev => [...prev, {
        id: `a${Date.now()}`,
        teacherId: newAllocTeacher,
        teacherName: teacher.name,
        courseId: course.id,
        classType: newAllocType,
        groups: newAllocGroups,
        semesterId: "s2",
      }]);
    }
    setAllocateDialogOpen(false);
    toast.success(`Assigned ${teacher.name}`);
  };

  const handleCopyPrevious = () => {
    const newAllocs = prevCourseAllocations.map((pa, i) => ({
      ...pa,
      id: `copied-${Date.now()}-${i}`,
      semesterId: "s2",
    }));
    setAllocations(prev => [
      ...prev.filter(a => a.courseId !== course.id),
      ...newAllocs,
    ]);
    setCopyDialogOpen(false);
    toast.success(`Copied ${newAllocs.length} allocations from previous semester`);
  };

  const openAllocate = () => {
    setNewAllocTeacher("");
    setNewAllocType(course.classTypes[0]);
    setNewAllocGroups(1);
    setAllocateDialogOpen(true);
  };

  // Determine which teachers are "new" (have preference but weren't in previous semester)
  const prevTeacherIds = new Set(prevCourseAllocations.map(a => a.teacherId));
  const currentTeacherIds = new Set(courseAllocations.map(a => a.teacherId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/allocation")} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <PageHeader
            title={`${course.code} – ${course.name}`}
            description={`${course.faculty} · Manage staff allocation for this course`}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setCopyDialogOpen(true)} disabled={prevCourseAllocations.length === 0}>
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  Copy Previous Semester
                </Button>
                <Button size="sm" onClick={openAllocate}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Assign Teacher
                </Button>
              </div>
            }
          />
        </div>
      </div>

      {/* Coverage summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {course.classTypes.map(t => {
          const cfg = getClassTypeConfig(t);
          const allocated = getGroupsAllocated(t);
          const total = course.totalGroups[t];
          const Icon = cfg.icon;
          const pct = total > 0 ? Math.round((allocated / total) * 100) : 0;
          return (
            <div key={t} className="data-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Icon className={cn("h-4 w-4", cfg.color.split(" ")[1])} />
                <span className="text-sm font-medium">{cfg.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold tabular-nums">{allocated}<span className="text-base text-muted-foreground font-normal">/{total}</span></span>
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-full",
                  pct >= 100 ? "bg-success/10 text-success" : pct >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                )}>{pct}%</span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-destructive")} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
            </div>
          );
        })}
        <div className="data-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCheck className="h-4 w-4 text-accent" />
            <span className="text-sm font-medium">Overall</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold tabular-nums">{totalAllocated}<span className="text-base text-muted-foreground font-normal">/{totalNeeded}</span></span>
            <span className={cn(
              "text-xs font-semibold px-2 py-0.5 rounded-full",
              coverage >= 100 ? "bg-success/10 text-success" : coverage >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
            )}>{coverage}%</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={cn("h-full rounded-full transition-all", coverage >= 100 ? "bg-success" : coverage >= 50 ? "bg-warning" : "bg-destructive")} style={{ width: `${Math.min(coverage, 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Main 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ─── Column 1: Teacher Preferences ─── */}
        <div className="data-card overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <Send className="h-4 w-4 text-info" />
              <h3 className="font-semibold text-sm">Preferences</h3>
              <Badge variant="secondary" className="ml-auto text-[10px]">{coursePreferences.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Teachers who expressed interest</p>
          </div>
          <div className="divide-y">
            {coursePreferences.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center italic">No preferences submitted</p>
            ) : (
              coursePreferences.map(pref => {
                const isAllocated = currentTeacherIds.has(pref.teacherId);
                return (
                  <div key={pref.id} className={cn("p-3 hover:bg-muted/20 transition-colors", isAllocated && "bg-success/5")}>
                    <div className="flex items-start gap-3">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0", isAllocated ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                        {pref.teacherName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium truncate">{pref.teacherName}</p>
                          {isAllocated && <Badge variant="outline" className="text-[9px] py-0 bg-success/10 text-success border-success/20">Assigned</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground">{pref.teacherTitle}</p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {pref.preferredTypes.map(t => {
                            const cfg = getClassTypeConfig(t);
                            return <Badge key={t} variant="outline" className={cn("text-[9px] py-0 px-1", cfg.color)}>{cfg.label}</Badge>;
                          })}
                        </div>
                        <div className="flex gap-2 mt-1.5 flex-wrap">
                          {pref.willingEnglish && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Globe className="h-2.5 w-2.5" /> EN</span>}
                          {pref.onlineLectures && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Monitor className="h-2.5 w-2.5" /> Online</span>}
                          {pref.sharedLectures && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Split className="h-2.5 w-2.5" /> Shared</span>}
                        </div>
                      </div>
                      {!isAllocated && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 text-accent hover:text-accent"
                          onClick={() => {
                            setNewAllocTeacher(pref.teacherId);
                            setNewAllocType(pref.preferredTypes[0] || course.classTypes[0]);
                            setNewAllocGroups(1);
                            setAllocateDialogOpen(true);
                          }}
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ─── Column 2: Previous Semester ─── */}
        <div className="data-card overflow-hidden">
          <div className="p-4 border-b bg-muted/20">
            <div className="flex items-center gap-2">
              <History className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Previous Semester</h3>
              <Badge variant="secondary" className="ml-auto text-[10px]">{semesters.find(s => s.id === "s1")?.name}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Staff from last semester for reference</p>
          </div>
          {prevCourseAllocations.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center italic">No previous allocations</p>
          ) : (
            <div className="divide-y">
              {course.classTypes.map(classType => {
                const cfg = getClassTypeConfig(classType);
                const typeAllocs = prevCourseAllocations.filter(a => a.classType === classType);
                if (typeAllocs.length === 0) return null;
                const Icon = cfg.icon;
                return (
                  <div key={classType} className="p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon className={cn("h-3.5 w-3.5", cfg.color.split(" ")[1])} />
                      <span className="text-xs font-medium text-muted-foreground">{cfg.label}</span>
                    </div>
                    <div className="space-y-1.5 ml-5">
                      {typeAllocs.map(a => {
                        const isStillAssigned = courseAllocations.some(ca => ca.teacherId === a.teacherId && ca.classType === a.classType);
                        return (
                          <div key={a.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={cn("text-sm", isStillAssigned ? "text-foreground" : "text-muted-foreground")}>{a.teacherName}</span>
                              {isStillAssigned && <Badge variant="outline" className="text-[9px] py-0 bg-success/5 text-success border-success/20">Kept</Badge>}
                            </div>
                            <span className="text-xs tabular-nums text-muted-foreground">{a.groups} gr.</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {prevCourseAllocations.length > 0 && (
            <div className="p-3 border-t">
              <Button variant="outline" size="sm" className="w-full" onClick={() => setCopyDialogOpen(true)}>
                <Copy className="h-3.5 w-3.5 mr-1.5" />
                Copy All to Current
              </Button>
            </div>
          )}
        </div>

        {/* ─── Column 3: Current Allocation ─── */}
        <div className="data-card overflow-hidden">
          <div className="p-4 border-b bg-accent/5">
            <div className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm">Current Allocation</h3>
              <Badge variant="secondary" className="ml-auto text-[10px]">{semesters.find(s => s.id === "s2")?.name}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Active assignment for this semester</p>
          </div>
          {courseAllocations.length === 0 ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-sm text-muted-foreground italic">No allocations yet</p>
              <Button size="sm" onClick={openAllocate}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Assign First Teacher
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {course.classTypes.map(classType => {
                const cfg = getClassTypeConfig(classType);
                const typeAllocs = courseAllocations.filter(a => a.classType === classType);
                const allocated = getGroupsAllocated(classType);
                const total = course.totalGroups[classType];
                const Icon = cfg.icon;

                return (
                  <div key={classType} className="p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon className={cn("h-3.5 w-3.5", cfg.color.split(" ")[1])} />
                      <span className="text-xs font-medium">{cfg.label}</span>
                      <span className={cn("text-xs tabular-nums ml-auto", allocated >= total ? "text-success font-medium" : "text-muted-foreground")}>
                        {allocated}/{total}
                      </span>
                    </div>
                    {typeAllocs.length === 0 ? (
                      <p className="text-xs text-muted-foreground ml-5 italic">None assigned</p>
                    ) : (
                      <div className="space-y-1 ml-5">
                        {typeAllocs.map(a => {
                          const wasPrev = prevCourseAllocations.some(pa => pa.teacherId === a.teacherId && pa.classType === a.classType);
                          return (
                            <div key={a.id} className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/30 group transition-colors">
                              <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                              <span className="text-sm flex-1 truncate">{a.teacherName}</span>
                              {wasPrev && <Badge variant="outline" className="text-[8px] py-0 px-1 border-muted-foreground/20 text-muted-foreground shrink-0">prev</Badge>}
                              <div className="flex items-center gap-0.5 shrink-0">
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => updateGroups(a.id, -1)}>
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium tabular-nums w-5 text-center">{a.groups}</span>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => updateGroups(a.id, 1)}>
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive shrink-0" onClick={() => removeAllocation(a.id)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          <div className="p-3 border-t">
            <Button variant="outline" size="sm" className="w-full" onClick={openAllocate}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Assign Teacher
            </Button>
          </div>
        </div>
      </div>

      {/* ═══ ASSIGN DIALOG ═══ */}
      <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-accent" />
              Assign Teacher to {course.code}
            </DialogTitle>
            <DialogDescription>Select a teacher, class type, and number of groups</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select value={newAllocTeacher} onValueChange={setNewAllocTeacher}>
                <SelectTrigger><SelectValue placeholder="Select teacher..." /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t => {
                    const hasPref = coursePreferences.some(p => p.teacherId === t.id);
                    const wasPrev = prevCourseAllocations.some(a => a.teacherId === t.id);
                    return (
                      <SelectItem key={t.id} value={t.id}>
                        <div className="flex items-center gap-2">
                          {t.name}
                          {hasPref && <Badge variant="secondary" className="text-[9px] py-0 px-1">pref</Badge>}
                          {wasPrev && <Badge variant="outline" className="text-[9px] py-0 px-1">prev</Badge>}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Class Type</Label>
              <Select value={newAllocType} onValueChange={v => setNewAllocType(v as ClassType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {course.classTypes.map(t => {
                    const cfg = getClassTypeConfig(t);
                    const allocated = getGroupsAllocated(t);
                    return (
                      <SelectItem key={t} value={t}>
                        <div className="flex items-center gap-2">
                          <cfg.icon className="h-3.5 w-3.5" />
                          {cfg.label}
                          <span className="text-xs text-muted-foreground">({allocated}/{course.totalGroups[t]})</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Groups</Label>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNewAllocGroups(Math.max(1, newAllocGroups - 1))}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="text-lg font-semibold tabular-nums w-8 text-center">{newAllocGroups}</span>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setNewAllocGroups(newAllocGroups + 1)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Preference hint */}
            {newAllocTeacher && (() => {
              const pref = coursePreferences.find(p => p.teacherId === newAllocTeacher);
              if (!pref) return (
                <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                  No preference submitted for this course.
                </div>
              );
              return (
                <div className="rounded-lg bg-accent/5 border border-accent/20 p-3 space-y-1.5">
                  <p className="text-xs font-medium text-accent">Teacher Preference</p>
                  <div className="flex gap-1 flex-wrap">
                    {pref.preferredTypes.map(t => {
                      const cfg = getClassTypeConfig(t);
                      return <Badge key={t} variant="outline" className={cn("text-[10px] py-0", cfg.color)}>{cfg.label}</Badge>;
                    })}
                  </div>
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    {pref.willingEnglish && <span>✓ English</span>}
                    {pref.onlineLectures && <span>✓ Online</span>}
                    {pref.sharedLectures && <span>✓ Shared</span>}
                  </div>
                </div>
              );
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAllocate} disabled={!newAllocTeacher}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ COPY PREVIOUS DIALOG ═══ */}
      <Dialog open={copyDialogOpen} onOpenChange={setCopyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-accent" />
              Copy Previous Semester
            </DialogTitle>
            <DialogDescription>
              This will replace the current allocation for {course.code} with the staff from {semesters.find(s => s.id === "s1")?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-sm font-medium">Allocations to copy:</p>
            {course.classTypes.map(classType => {
              const cfg = getClassTypeConfig(classType);
              const typeAllocs = prevCourseAllocations.filter(a => a.classType === classType);
              if (typeAllocs.length === 0) return null;
              const Icon = cfg.icon;
              return (
                <div key={classType} className="rounded-lg bg-muted/30 p-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon className={cn("h-3.5 w-3.5", cfg.color.split(" ")[1])} />
                    <span className="text-xs font-medium">{cfg.label}</span>
                  </div>
                  <div className="space-y-0.5 ml-5">
                    {typeAllocs.map(a => (
                      <div key={a.id} className="flex items-center justify-between text-sm">
                        <span>{a.teacherName}</span>
                        <span className="text-xs text-muted-foreground tabular-nums">{a.groups} groups</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCopyPrevious}>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Replace & Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
