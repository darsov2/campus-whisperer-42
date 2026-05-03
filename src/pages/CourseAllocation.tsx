import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCheck,
  Copy,
  FlaskConical,
  Globe,
  GraduationCap,
  History,
  Megaphone,
  Minus,
  Monitor,
  Plus,
  Send,
  Settings2,
  Split,
  User,
  Users,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
} from "@/data/allocation-data";

interface CourseSettings {
  hasEnglishGroups: boolean;
  sharedLectures: boolean;
  hasLaboratory: boolean;
  mentoredOnly: boolean;
}

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
  const [prefOpen, setPrefOpen] = useState(true);
  const [prevOpen, setPrevOpen] = useState(true);

  const [courseSettings, setCourseSettings] = useState<CourseSettings>({
    hasEnglishGroups: true,
    sharedLectures: false,
    hasLaboratory: course?.classTypes.includes("laboratory") ?? false,
    mentoredOnly: false,
  });

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
      return { ...a, groups: Math.max(1, a.groups + delta) };
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
                  Copy Previous
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

      {/* Course Settings Card */}
      <div className="data-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Settings2 className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Course Configuration</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-info" />
              <Label htmlFor="english" className="text-sm cursor-pointer">English Groups</Label>
            </div>
            <Switch
              id="english"
              checked={courseSettings.hasEnglishGroups}
              onCheckedChange={v => setCourseSettings(s => ({ ...s, hasEnglishGroups: v }))}
            />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2">
              <Split className="h-4 w-4 text-accent" />
              <Label htmlFor="shared" className="text-sm cursor-pointer">Shared Lectures</Label>
            </div>
            <Switch
              id="shared"
              checked={courseSettings.sharedLectures}
              onCheckedChange={v => setCourseSettings(s => ({ ...s, sharedLectures: v }))}
            />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-warning" />
              <Label htmlFor="labs" className="text-sm cursor-pointer">Has Laboratory</Label>
            </div>
            <Switch
              id="labs"
              checked={courseSettings.hasLaboratory}
              onCheckedChange={v => setCourseSettings(s => ({ ...s, hasLaboratory: v }))}
            />
          </div>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <Label htmlFor="mentored" className="text-sm cursor-pointer">Mentored Only</Label>
            </div>
            <Switch
              id="mentored"
              checked={courseSettings.mentoredOnly}
              onCheckedChange={v => setCourseSettings(s => ({ ...s, mentoredOnly: v }))}
            />
          </div>
        </div>
      </div>

      {/* Main layout: Current Allocation center, side panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ─── Left sidebar: Preferences + Previous ─── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Preferences */}
          <Collapsible open={prefOpen} onOpenChange={setPrefOpen}>
            <div className="data-card overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 border-b bg-muted/20 flex items-center gap-2 hover:bg-muted/30 transition-colors text-left">
                  <Send className="h-4 w-4 text-info shrink-0" />
                  <h3 className="font-semibold text-sm flex-1">Preferences</h3>
                  <Badge variant="secondary" className="text-[10px]">{coursePreferences.length}</Badge>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="divide-y max-h-[400px] overflow-y-auto">
                  {coursePreferences.length === 0 ? (
                    <p className="p-4 text-sm text-muted-foreground text-center italic">No preferences submitted</p>
                  ) : (
                    coursePreferences.map(pref => {
                      const isAllocated = currentTeacherIds.has(pref.teacherId);
                      return (
                        <div key={pref.id} className={cn("p-3 hover:bg-muted/20 transition-colors", isAllocated && "bg-success/5")}>
                          <div className="flex items-start gap-3">
                            <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0", isAllocated ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                              {pref.teacherName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium truncate">{pref.teacherName}</p>
                                {isAllocated && <Badge variant="outline" className="text-[9px] py-0 bg-success/10 text-success border-success/20">Assigned</Badge>}
                              </div>
                              <p className="text-[11px] text-muted-foreground">{pref.teacherTitle}</p>
                              <div className="flex gap-1 mt-1 flex-wrap">
                                {pref.preferredTypes.map(t => {
                                  const cfg = getClassTypeConfig(t);
                                  return <Badge key={t} variant="outline" className={cn("text-[9px] py-0 px-1", cfg.color)}>{cfg.label}</Badge>;
                                })}
                              </div>
                              <div className="flex gap-2 mt-1 flex-wrap">
                                {pref.willingEnglish && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Globe className="h-2.5 w-2.5" /> EN</span>}
                                {pref.onlineLectures && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Monitor className="h-2.5 w-2.5" /> Online</span>}
                                {pref.sharedLectures && <span className="text-[10px] text-muted-foreground flex items-center gap-0.5"><Split className="h-2.5 w-2.5" /> Shared</span>}
                              </div>
                            </div>
                            {!isAllocated && (
                              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-accent hover:text-accent" onClick={() => {
                                setNewAllocTeacher(pref.teacherId);
                                setNewAllocType(pref.preferredTypes[0] || course.classTypes[0]);
                                setNewAllocGroups(1);
                                setAllocateDialogOpen(true);
                              }}>
                                <Plus className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          {/* Previous Semester */}
          <Collapsible open={prevOpen} onOpenChange={setPrevOpen}>
            <div className="data-card overflow-hidden">
              <CollapsibleTrigger asChild>
                <button className="w-full p-4 border-b bg-muted/20 flex items-center gap-2 hover:bg-muted/30 transition-colors text-left">
                  <History className="h-4 w-4 text-muted-foreground shrink-0" />
                  <h3 className="font-semibold text-sm flex-1">Previous Semester</h3>
                  <Badge variant="secondary" className="text-[10px]">{semesters.find(s => s.id === "s1")?.name}</Badge>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
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
              </CollapsibleContent>
            </div>
          </Collapsible>
        </div>

        {/* ─── Center: Current Allocation (prominent) ─── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Coverage summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {course.classTypes.map(t => {
              const cfg = getClassTypeConfig(t);
              const allocated = getGroupsAllocated(t);
              const total = course.totalGroups[t];
              const Icon = cfg.icon;
              const pct = total > 0 ? Math.round((allocated / total) * 100) : 0;
              return (
                <div key={t} className="data-card p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={cn("h-3.5 w-3.5", cfg.color.split(" ")[1])} />
                    <span className="text-xs font-medium">{cfg.label}</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <span className="text-xl font-semibold tabular-nums">{allocated}<span className="text-sm text-muted-foreground font-normal">/{total}</span></span>
                    <span className={cn(
                      "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      pct >= 100 ? "bg-success/10 text-success" : pct >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                    )}>{pct}%</span>
                  </div>
                  <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-success" : pct >= 50 ? "bg-warning" : "bg-destructive")} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
              );
            })}
            <div className="data-card p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <CheckCheck className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-medium">Overall</span>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xl font-semibold tabular-nums">{totalAllocated}<span className="text-sm text-muted-foreground font-normal">/{totalNeeded}</span></span>
                <span className={cn(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                  coverage >= 100 ? "bg-success/10 text-success" : coverage >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                )}>{coverage}%</span>
              </div>
              <div className="mt-1.5 h-1 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full transition-all", coverage >= 100 ? "bg-success" : coverage >= 50 ? "bg-warning" : "bg-destructive")} style={{ width: `${Math.min(coverage, 100)}%` }} />
              </div>
            </div>
          </div>

          {/* Current Allocation table */}
          <div className="data-card overflow-hidden">
            <div className="p-4 border-b bg-accent/5 flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-accent" />
              <h3 className="font-semibold text-sm flex-1">Current Allocation</h3>
              <Badge variant="secondary" className="text-[10px]">{semesters.find(s => s.id === "s2")?.name}</Badge>
            </div>
            {courseAllocations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground italic">No allocations yet</p>
                <Button size="sm" onClick={openAllocate}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  Assign First Teacher
                </Button>
              </div>
            ) : (() => {
              // Group allocations by teacher
              const teacherIds = Array.from(new Set(courseAllocations.map(a => a.teacherId)));
              const rows = teacherIds.map(tid => {
                const tAllocs = courseAllocations.filter(a => a.teacherId === tid);
                return {
                  teacherId: tid,
                  teacherName: tAllocs[0].teacherName,
                  byType: course.classTypes.reduce((acc, ct) => {
                    acc[ct] = tAllocs.find(a => a.classType === ct);
                    return acc;
                  }, {} as Record<ClassType, AllocationEntry | undefined>),
                };
              });

              const setGroupsFor = (teacherId: string, classType: ClassType, value: number) => {
                const existing = courseAllocations.find(a => a.teacherId === teacherId && a.classType === classType);
                if (value <= 0) {
                  if (existing) setAllocations(prev => prev.filter(a => a.id !== existing.id));
                  return;
                }
                if (existing) {
                  setAllocations(prev => prev.map(a => a.id === existing.id ? { ...a, groups: value } : a));
                } else {
                  const teacher = teachers.find(t => t.id === teacherId);
                  if (!teacher) return;
                  setAllocations(prev => [...prev, {
                    id: `a${Date.now()}-${classType}`,
                    teacherId,
                    teacherName: teacher.name,
                    courseId: course.id,
                    classType,
                    groups: value,
                    semesterId: "s2",
                  }]);
                }
              };

              const removeTeacher = (teacherId: string) => {
                setAllocations(prev => prev.filter(a => !(a.teacherId === teacherId && a.courseId === course.id)));
                toast.success("Teacher removed from allocation");
              };

              return (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-muted/20">
                        <th className="text-left font-semibold p-3">Teacher</th>
                        {course.classTypes.map(ct => {
                          const cfg = getClassTypeConfig(ct);
                          const Icon = cfg.icon;
                          const allocated = getGroupsAllocated(ct);
                          const total = course.totalGroups[ct];
                          return (
                            <th key={ct} className="font-semibold p-3 text-center min-w-[120px]">
                              <div className="flex items-center justify-center gap-1.5">
                                <Icon className={cn("h-3.5 w-3.5", cfg.color.split(" ")[1])} />
                                <span>{cfg.label}</span>
                              </div>
                              <div className={cn("text-[10px] font-normal mt-0.5", allocated >= total ? "text-success" : "text-muted-foreground")}>
                                {allocated}/{total}
                              </div>
                            </th>
                          );
                        })}
                        <th className="font-semibold p-3 text-center">Total</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {rows.map(row => {
                        const total = course.classTypes.reduce((s, ct) => s + (row.byType[ct]?.groups ?? 0), 0);
                        const wasPrev = prevCourseAllocations.some(pa => pa.teacherId === row.teacherId);
                        return (
                          <tr key={row.teacherId} className="group hover:bg-muted/20 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{row.teacherName}</span>
                                {wasPrev && <Badge variant="outline" className="text-[9px] py-0 px-1.5 border-muted-foreground/20 text-muted-foreground">prev</Badge>}
                              </div>
                            </td>
                            {course.classTypes.map(ct => {
                              const entry = row.byType[ct];
                              const value = entry?.groups ?? 0;
                              return (
                                <td key={ct} className="p-2 text-center">
                                  <div className="inline-flex items-center gap-1 rounded-md border border-border/50 bg-background">
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setGroupsFor(row.teacherId, ct, value - 1)} disabled={value === 0}>
                                      <Minus className="h-3 w-3" />
                                    </Button>
                                    <span className={cn("text-sm font-semibold tabular-nums w-6 text-center", value === 0 && "text-muted-foreground/40")}>{value}</span>
                                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setGroupsFor(row.teacherId, ct, value + 1)}>
                                      <Plus className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </td>
                              );
                            })}
                            <td className="p-3 text-center">
                              <span className="text-sm font-semibold tabular-nums">{total}</span>
                            </td>
                            <td className="p-2">
                              <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive" onClick={() => removeTeacher(row.teacherId)}>
                                <X className="h-3 w-3" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })()}
            <div className="p-3 border-t">
              <Button variant="outline" size="sm" className="w-full" onClick={openAllocate}>
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Assign Teacher
              </Button>
            </div>
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
              This will replace the current allocation for {course.code} with staff from {semesters.find(s => s.id === "s1")?.name}.
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
