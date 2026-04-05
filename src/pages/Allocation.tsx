import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  Filter,
  Layers,
  Lock,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  User,
  Users,
  BookOpen,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Plus,
  Minus,
  Globe,
  Monitor,
  Split,
  FlaskConical,
  Megaphone,
  X,
  Eye,
  CheckCheck,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/ui/stat-card";
import { DataTable } from "@/components/ui/data-table";
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
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  type ClassType,
  type AllocationEntry,
  type TeacherPreference,
  type SemesterStatus,
  courses,
  teachers,
  semesters,
  initialPreferences,
  initialAllocations,
  previousAllocations,
  getClassTypeConfig,
  CLASS_TYPES,
} from "@/data/allocation-data";

const semesterStatusConfig: Record<SemesterStatus, { label: string; color: string; icon: typeof Clock }> = {
  preference_collection: { label: "Collecting Preferences", color: "bg-info/10 text-info border-info/20", icon: Clock },
  allocation: { label: "Allocation In Progress", color: "bg-warning/10 text-warning border-warning/20", icon: Settings2 },
  finalized: { label: "Finalized", color: "bg-success/10 text-success border-success/20", icon: CheckCircle2 },
};

export default function Allocation() {
  const navigate = useNavigate();
  const [selectedSemester, setSelectedSemester] = useState("s2");
  const [preferences] = useState<TeacherPreference[]>(initialPreferences);
  const [allocations, setAllocations] = useState<AllocationEntry[]>(initialAllocations);
  const [activeTab, setActiveTab] = useState("preferences");

  // Preferences tab state
  const [prefSearch, setPrefSearch] = useState("");
  const [prefTeacherFilter, setPrefTeacherFilter] = useState("all");
  const [prefCourseFilter, setPrefCourseFilter] = useState("all");
  const [viewPreferenceId, setViewPreferenceId] = useState<string | null>(null);

  // Allocation tab state
  const [allocSearch, setAllocSearch] = useState("");
  const [allocCourseFilter, setAllocCourseFilter] = useState("all");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(new Set(["c1", "c4"]));
  const [allocateDialogOpen, setAllocateDialogOpen] = useState(false);
  const [allocatingCourse, setAllocatingCourse] = useState<typeof courses[0] | null>(null);

  // Copy previous semester dialog
  const [copyAllDialogOpen, setCopyAllDialogOpen] = useState(false);

  // Stats tab state
  const [statsView, setStatsView] = useState<"teacher" | "course">("teacher");
  const [statsSearch, setStatsSearch] = useState("");

  const semester = semesters.find(s => s.id === selectedSemester)!;
  const statusCfg = semesterStatusConfig[semester.status];
  const StatusIcon = statusCfg.icon;

  // ── Preferences Tab ────────────────────────────────────────

  const filteredPreferences = useMemo(() => {
    return preferences.filter(p => {
      if (prefTeacherFilter !== "all" && p.teacherId !== prefTeacherFilter) return false;
      if (prefCourseFilter !== "all" && p.courseId !== prefCourseFilter) return false;
      if (prefSearch) {
        const q = prefSearch.toLowerCase();
        const course = courses.find(c => c.id === p.courseId);
        return p.teacherName.toLowerCase().includes(q) || course?.name.toLowerCase().includes(q) || course?.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [preferences, prefSearch, prefTeacherFilter, prefCourseFilter]);

  const viewingPreference = viewPreferenceId ? preferences.find(p => p.id === viewPreferenceId) : null;

  // ── Allocation Tab ─────────────────────────────────────────

  const filteredCourses = useMemo(() => {
    return courses.filter(c => {
      if (allocCourseFilter !== "all" && c.faculty !== allocCourseFilter) return false;
      if (allocSearch) {
        const q = allocSearch.toLowerCase();
        return c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q);
      }
      return true;
    });
  }, [allocSearch, allocCourseFilter]);

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) next.delete(courseId);
      else next.add(courseId);
      return next;
    });
  };

  const getCourseAllocations = (courseId: string) =>
    allocations.filter(a => a.courseId === courseId);

  const getGroupsAllocated = (courseId: string, classType: ClassType) =>
    allocations.filter(a => a.courseId === courseId && a.classType === classType).reduce((sum, a) => sum + a.groups, 0);

  const removeAllocation = (allocationId: string) => {
    setAllocations(prev => prev.filter(a => a.id !== allocationId));
    toast.success("Allocation removed");
  };

  const updateAllocationGroups = (allocationId: string, delta: number) => {
    setAllocations(prev => prev.map(a => {
      if (a.id !== allocationId) return a;
      const newGroups = Math.max(1, a.groups + delta);
      return { ...a, groups: newGroups };
    }));
  };

  // Allocate dialog state
  const [newAllocTeacher, setNewAllocTeacher] = useState("");
  const [newAllocType, setNewAllocType] = useState<ClassType>("lecture");
  const [newAllocGroups, setNewAllocGroups] = useState(1);

  const openAllocateDialog = (course: typeof courses[0]) => {
    setAllocatingCourse(course);
    setNewAllocTeacher("");
    setNewAllocType(course.classTypes[0]);
    setNewAllocGroups(1);
    setAllocateDialogOpen(true);
  };

  const handleAllocate = () => {
    if (!allocatingCourse || !newAllocTeacher) return;
    const teacher = teachers.find(t => t.id === newAllocTeacher);
    if (!teacher) return;

    const existing = allocations.find(
      a => a.courseId === allocatingCourse.id && a.teacherId === newAllocTeacher && a.classType === newAllocType
    );
    if (existing) {
      setAllocations(prev => prev.map(a =>
        a.id === existing.id ? { ...a, groups: a.groups + newAllocGroups } : a
      ));
    } else {
      setAllocations(prev => [...prev, {
        id: `a${Date.now()}`,
        teacherId: newAllocTeacher,
        teacherName: teacher.name,
        courseId: allocatingCourse.id,
        classType: newAllocType,
        groups: newAllocGroups,
      }]);
    }
    setAllocateDialogOpen(false);
    toast.success(`Allocated ${teacher.name} to ${allocatingCourse.code}`);
  };

  // Copy all previous semester
  const handleCopyAllPrevious = () => {
    const newAllocs = previousAllocations.map((pa, i) => ({
      ...pa,
      id: `copied-all-${Date.now()}-${i}`,
      semesterId: "s2",
    }));
    setAllocations(newAllocs);
    setCopyAllDialogOpen(false);
    toast.success(`Copied ${newAllocs.length} allocations from previous semester`);
  };

  // ── Statistics Tab ─────────────────────────────────────────

  const teacherStats = useMemo(() => {
    const map = new Map<string, { name: string; totalGroups: number; courses: Set<string>; byType: Record<ClassType, number> }>();
    allocations.forEach(a => {
      if (!map.has(a.teacherId)) {
        map.set(a.teacherId, { name: a.teacherName, totalGroups: 0, courses: new Set(), byType: { lecture: 0, auditory: 0, laboratory: 0 } });
      }
      const entry = map.get(a.teacherId)!;
      entry.totalGroups += a.groups;
      entry.courses.add(a.courseId);
      entry.byType[a.classType] += a.groups;
    });
    return Array.from(map.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      totalGroups: data.totalGroups,
      courseCount: data.courses.size,
      ...data.byType,
    }));
  }, [allocations]);

  const courseStats = useMemo(() => {
    return courses.map(c => {
      const courseAllocs = allocations.filter(a => a.courseId === c.id);
      const teacherSet = new Set(courseAllocs.map(a => a.teacherId));
      const byType: Record<ClassType, { allocated: number; total: number }> = {
        lecture: { allocated: 0, total: c.totalGroups.lecture },
        auditory: { allocated: 0, total: c.totalGroups.auditory },
        laboratory: { allocated: 0, total: c.totalGroups.laboratory },
      };
      courseAllocs.forEach(a => { byType[a.classType].allocated += a.groups; });
      const totalAllocated = courseAllocs.reduce((s, a) => s + a.groups, 0);
      const totalNeeded = c.classTypes.reduce((s, t) => s + c.totalGroups[t], 0);
      return {
        id: c.id,
        code: c.code,
        name: c.name,
        faculty: c.faculty,
        teacherCount: teacherSet.size,
        totalAllocated,
        totalNeeded,
        coverage: totalNeeded > 0 ? Math.round((totalAllocated / totalNeeded) * 100) : 0,
        ...byType,
      };
    });
  }, [allocations]);

  const totalAllocatedGroups = allocations.reduce((s, a) => s + a.groups, 0);
  const totalNeededGroups = courses.reduce((s, c) => s + c.classTypes.reduce((ss, t) => ss + c.totalGroups[t], 0), 0);
  const uniqueTeachersAllocated = new Set(allocations.map(a => a.teacherId)).size;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Allocation"
        description="Assign professors and assistants to courses each semester"
      />

      {/* Semester Selector + Status */}
      <div className="flex items-center gap-4 flex-wrap">
        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {semesters.map(s => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border", statusCfg.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {statusCfg.label}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" variant="outline" onClick={() => setCopyAllDialogOpen(true)}>
            <Copy className="h-3.5 w-3.5 mr-1.5" />
            Copy Previous Semester
          </Button>

          {semester.status === "preference_collection" && (
            <Button size="sm" variant="outline" onClick={() => toast.info("Semester moved to allocation phase")}>
              <Lock className="h-3.5 w-3.5 mr-1.5" />
              Close Preferences & Start Allocation
            </Button>
          )}
          {semester.status === "allocation" && (
            <Button size="sm" onClick={() => toast.info("Allocation finalized")}>
              <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
              Finalize Allocation
            </Button>
          )}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Preferences Submitted" value={preferences.length} icon={Send} subtitle={`${new Set(preferences.map(p => p.teacherId)).size} teachers`} />
        <StatCard title="Total Groups Needed" value={totalNeededGroups} icon={Layers} subtitle={`${courses.length} courses`} />
        <StatCard title="Groups Allocated" value={totalAllocatedGroups} icon={CheckCheck} subtitle={`${Math.round((totalAllocatedGroups / totalNeededGroups) * 100)}% coverage`} />
        <StatCard title="Teachers Allocated" value={uniqueTeachersAllocated} icon={Users} subtitle={`of ${teachers.length} total`} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="preferences" className="gap-1.5">
            <Send className="h-3.5 w-3.5" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="allocation" className="gap-1.5">
            <Settings2 className="h-3.5 w-3.5" />
            Allocation
          </TabsTrigger>
          <TabsTrigger value="statistics" className="gap-1.5">
            <BarChart3 className="h-3.5 w-3.5" />
            Statistics
          </TabsTrigger>
        </TabsList>

        {/* ═══ PREFERENCES TAB ═══ */}
        <TabsContent value="preferences" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search preferences..." value={prefSearch} onChange={e => setPrefSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={prefTeacherFilter} onValueChange={setPrefTeacherFilter}>
              <SelectTrigger className="w-[200px]">
                <User className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Teachers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teachers</SelectItem>
                {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={prefCourseFilter} onValueChange={setPrefCourseFilter}>
              <SelectTrigger className="w-[200px]">
                <BookOpen className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Courses</SelectItem>
                {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} – {c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <DataTable
            data={filteredPreferences}
            emptyMessage="No preferences found"
            onRowClick={(p) => setViewPreferenceId(p.id)}
            columns={[
              {
                key: "teacher",
                header: "Teacher",
                cell: (p) => (
                  <div>
                    <p className="font-medium text-foreground">{p.teacherName}</p>
                    <p className="text-xs text-muted-foreground">{p.teacherTitle}</p>
                  </div>
                ),
              },
              {
                key: "course",
                header: "Course",
                cell: (p) => {
                  const c = courses.find(c => c.id === p.courseId);
                  return (
                    <div>
                      <p className="font-medium text-foreground">{c?.code}</p>
                      <p className="text-xs text-muted-foreground">{c?.name}</p>
                    </div>
                  );
                },
              },
              {
                key: "types",
                header: "Preferred Types",
                cell: (p) => (
                  <div className="flex gap-1 flex-wrap">
                    {p.preferredTypes.map(t => {
                      const cfg = getClassTypeConfig(t);
                      return <Badge key={t} variant="outline" className={cn("text-[10px] py-0 px-1.5", cfg.color)}>{cfg.label}</Badge>;
                    })}
                  </div>
                ),
              },
              {
                key: "flags",
                header: "Flags",
                cell: (p) => (
                  <div className="flex gap-1.5 flex-wrap">
                    {p.willingEnglish && <Badge variant="secondary" className="text-[10px] py-0 gap-1"><Globe className="h-2.5 w-2.5" /> EN</Badge>}
                    {p.onlineLectures && <Badge variant="secondary" className="text-[10px] py-0 gap-1"><Monitor className="h-2.5 w-2.5" /> Online</Badge>}
                    {p.sharedLectures && <Badge variant="secondary" className="text-[10px] py-0 gap-1"><Split className="h-2.5 w-2.5" /> Shared</Badge>}
                  </div>
                ),
              },
              {
                key: "submitted",
                header: "Submitted",
                cell: (p) => <span className="text-xs text-muted-foreground">{p.submittedAt}</span>,
              },
            ]}
          />
        </TabsContent>

        {/* ═══ ALLOCATION TAB ═══ */}
        <TabsContent value="allocation" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search courses..." value={allocSearch} onChange={e => setAllocSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={allocCourseFilter} onValueChange={setAllocCourseFilter}>
              <SelectTrigger className="w-[200px]">
                <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                <SelectValue placeholder="All Faculties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {[...new Set(courses.map(c => c.faculty))].map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            {filteredCourses.map(course => {
              const isExpanded = expandedCourses.has(course.id);
              const courseAllocs = getCourseAllocations(course.id);
              const totalAllocated = courseAllocs.reduce((s, a) => s + a.groups, 0);
              const totalNeeded = course.classTypes.reduce((s, t) => s + course.totalGroups[t], 0);
              const coverage = totalNeeded > 0 ? Math.round((totalAllocated / totalNeeded) * 100) : 0;

              return (
                <div key={course.id} className="data-card overflow-hidden">
                  {/* Course Header */}
                  <button
                    onClick={() => toggleCourse(course.id)}
                    className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{course.code}</span>
                        <span className="text-muted-foreground">–</span>
                        <span className="text-foreground">{course.name}</span>
                        <Badge variant="outline" className="text-[10px] py-0 ml-1">{course.faculty}</Badge>
                      </div>
                    </div>

                    {/* Class type group indicators */}
                    <div className="flex items-center gap-3 mr-2">
                      {course.classTypes.map(t => {
                        const cfg = getClassTypeConfig(t);
                        const allocated = getGroupsAllocated(course.id, t);
                        const total = course.totalGroups[t];
                        const Icon = cfg.icon;
                        return (
                          <div key={t} className="flex items-center gap-1 text-xs">
                            <Icon className={cn("h-3.5 w-3.5", allocated >= total ? "text-success" : "text-muted-foreground")} />
                            <span className={cn("tabular-nums font-medium", allocated >= total ? "text-success" : "text-foreground")}>
                              {allocated}/{total}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      coverage >= 100 ? "bg-success/10 text-success" : coverage >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                    )}>
                      {coverage}%
                    </div>
                  </button>

                  {/* Expanded: Allocations */}
                  {isExpanded && (
                    <div className="border-t px-4 pb-4">
                      {course.classTypes.map(classType => {
                        const cfg = getClassTypeConfig(classType);
                        const typeAllocs = courseAllocs.filter(a => a.classType === classType);
                        const allocated = getGroupsAllocated(course.id, classType);
                        const total = course.totalGroups[classType];
                        const Icon = cfg.icon;

                        return (
                          <div key={classType} className="mt-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={cn("h-4 w-4", cfg.color.split(" ")[1])} />
                              <span className="text-sm font-medium">{cfg.label}</span>
                              <span className={cn("text-xs tabular-nums", allocated >= total ? "text-success" : "text-muted-foreground")}>
                                ({allocated}/{total} groups)
                              </span>
                            </div>
                            {typeAllocs.length === 0 ? (
                              <p className="text-xs text-muted-foreground ml-6 italic">No allocations yet</p>
                            ) : (
                              <div className="ml-6 space-y-1">
                                {typeAllocs.map(a => (
                                  <div key={a.id} className="flex items-center gap-2 py-1 px-2 rounded-md hover:bg-muted/30 group transition-colors">
                                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-sm flex-1">{a.teacherName}</span>
                                    <div className="flex items-center gap-1">
                                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => updateAllocationGroups(a.id, -1)}>
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-sm font-medium tabular-nums w-6 text-center">{a.groups}</span>
                                      <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => updateAllocationGroups(a.id, 1)}>
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                      <span className="text-xs text-muted-foreground mr-2">groups</span>
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive" onClick={() => removeAllocation(a.id)}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      <div className="mt-4 flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={() => openAllocateDialog(course)}>
                          <Plus className="h-3.5 w-3.5 mr-1.5" />
                          Assign Teacher
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/allocation/${course.id}`)}>
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          Open Full View
                        </Button>
                        {(() => {
                          const prefs = preferences.filter(p => p.courseId === course.id);
                          if (prefs.length === 0) return null;
                          return (
                            <span className="text-xs text-muted-foreground">
                              {prefs.length} preference{prefs.length > 1 ? "s" : ""} submitted
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ═══ STATISTICS TAB ═══ */}
        <TabsContent value="statistics" className="space-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="inline-flex rounded-lg border p-0.5">
              <Button size="sm" variant={statsView === "teacher" ? "default" : "ghost"} onClick={() => setStatsView("teacher")} className="gap-1.5">
                <Users className="h-3.5 w-3.5" />
                By Teacher
              </Button>
              <Button size="sm" variant={statsView === "course" ? "default" : "ghost"} onClick={() => setStatsView("course")} className="gap-1.5">
                <BookOpen className="h-3.5 w-3.5" />
                By Course
              </Button>
            </div>
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." value={statsSearch} onChange={e => setStatsSearch(e.target.value)} className="pl-9" />
            </div>
          </div>

          {statsView === "teacher" ? (
            <DataTable
              data={teacherStats.filter(t => !statsSearch || t.name.toLowerCase().includes(statsSearch.toLowerCase()))}
              emptyMessage="No allocation data"
              columns={[
                { key: "name", header: "Teacher", cell: (t) => <span className="font-medium text-foreground">{t.name}</span> },
                { key: "courses", header: "Courses", cell: (t) => <span className="tabular-nums">{t.courseCount}</span> },
                {
                  key: "lecture",
                  header: "Lecture Gr.",
                  cell: (t) => <Badge variant="outline" className={cn("tabular-nums text-[10px]", t.lecture > 0 && "bg-primary/5 text-primary")}>{t.lecture}</Badge>,
                },
                {
                  key: "auditory",
                  header: "Auditory Gr.",
                  cell: (t) => <Badge variant="outline" className={cn("tabular-nums text-[10px]", t.auditory > 0 && "bg-accent/10 text-accent")}>{t.auditory}</Badge>,
                },
                {
                  key: "laboratory",
                  header: "Lab Gr.",
                  cell: (t) => <Badge variant="outline" className={cn("tabular-nums text-[10px]", t.laboratory > 0 && "bg-warning/10 text-warning")}>{t.laboratory}</Badge>,
                },
                {
                  key: "total",
                  header: "Total Groups",
                  cell: (t) => <span className="font-semibold tabular-nums">{t.totalGroups}</span>,
                },
              ]}
            />
          ) : (
            <DataTable
              data={courseStats.filter(c => !statsSearch || c.name.toLowerCase().includes(statsSearch.toLowerCase()) || c.code.toLowerCase().includes(statsSearch.toLowerCase()))}
              emptyMessage="No course data"
              columns={[
                {
                  key: "course",
                  header: "Course",
                  cell: (c) => (
                    <div>
                      <span className="font-medium text-foreground">{c.code}</span>
                      <span className="text-muted-foreground ml-1.5">– {c.name}</span>
                    </div>
                  ),
                },
                { key: "faculty", header: "Faculty", cell: (c) => <span className="text-muted-foreground text-xs">{c.faculty}</span> },
                { key: "teachers", header: "Teachers", cell: (c) => <span className="tabular-nums">{c.teacherCount}</span> },
                {
                  key: "lecture",
                  header: "Lectures",
                  cell: (c) => <span className={cn("tabular-nums text-sm", c.lecture.allocated >= c.lecture.total && c.lecture.total > 0 ? "text-success font-medium" : "")}>{c.lecture.allocated}/{c.lecture.total}</span>,
                },
                {
                  key: "auditory",
                  header: "Auditory",
                  cell: (c) => <span className={cn("tabular-nums text-sm", c.auditory.allocated >= c.auditory.total && c.auditory.total > 0 ? "text-success font-medium" : "")}>{c.auditory.allocated}/{c.auditory.total}</span>,
                },
                {
                  key: "lab",
                  header: "Lab",
                  cell: (c) => <span className={cn("tabular-nums text-sm", c.laboratory.allocated >= c.laboratory.total && c.laboratory.total > 0 ? "text-success font-medium" : "")}>{c.laboratory.allocated}/{c.laboratory.total}</span>,
                },
                {
                  key: "coverage",
                  header: "Coverage",
                  cell: (c) => (
                    <div className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full inline-block",
                      c.coverage >= 100 ? "bg-success/10 text-success" : c.coverage >= 50 ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"
                    )}>
                      {c.coverage}%
                    </div>
                  ),
                },
              ]}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* ═══ VIEW PREFERENCE DIALOG ═══ */}
      <Dialog open={!!viewingPreference} onOpenChange={() => setViewPreferenceId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-accent" />
              Teacher Preference
            </DialogTitle>
            <DialogDescription>Submitted preference details</DialogDescription>
          </DialogHeader>
          {viewingPreference && (() => {
            const course = courses.find(c => c.id === viewingPreference.courseId);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Teacher</p>
                    <p className="text-sm font-medium">{viewingPreference.teacherName}</p>
                    <p className="text-xs text-muted-foreground">{viewingPreference.teacherTitle}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium">Course</p>
                    <p className="text-sm font-medium">{course?.code}</p>
                    <p className="text-xs text-muted-foreground">{course?.name}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1.5">Preferred Class Types</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {viewingPreference.preferredTypes.map(t => {
                        const cfg = getClassTypeConfig(t);
                        return <Badge key={t} variant="outline" className={cn("gap-1", cfg.color)}><cfg.icon className="h-3 w-3" />{cfg.label}</Badge>;
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">English Groups</p>
                        <p className="text-sm font-medium">{viewingPreference.willingEnglish ? "Yes" : "No"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Monitor className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Online Lectures</p>
                        <p className="text-sm font-medium">{viewingPreference.onlineLectures ? "Yes" : "No"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <Split className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Shared Lectures</p>
                        <p className="text-sm font-medium">{viewingPreference.sharedLectures ? "Yes" : "No"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <CalendarClock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-xs text-muted-foreground">Available From</p>
                        <p className="text-sm font-medium">{semesters.find(s => s.id === viewingPreference.availableFromSemester)?.name}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground">Submitted on {viewingPreference.submittedAt}</p>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ═══ ALLOCATE DIALOG ═══ */}
      <Dialog open={allocateDialogOpen} onOpenChange={setAllocateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-accent" />
              Assign Teacher
            </DialogTitle>
            <DialogDescription>
              {allocatingCourse && `Assign a teacher to ${allocatingCourse.code} – ${allocatingCourse.name}`}
            </DialogDescription>
          </DialogHeader>
          {allocatingCourse && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select value={newAllocTeacher} onValueChange={setNewAllocTeacher}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => {
                      const hasPref = preferences.some(p => p.teacherId === t.id && p.courseId === allocatingCourse.id);
                      return (
                        <SelectItem key={t.id} value={t.id}>
                          <div className="flex items-center gap-2">
                            {t.name}
                            {hasPref && <Badge variant="secondary" className="text-[9px] py-0 px-1">has pref</Badge>}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Class Type</Label>
                <Select value={newAllocType} onValueChange={(v) => setNewAllocType(v as ClassType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allocatingCourse.classTypes.map(t => {
                      const cfg = getClassTypeConfig(t);
                      const allocated = getGroupsAllocated(allocatingCourse.id, t);
                      const total = allocatingCourse.totalGroups[t];
                      return (
                        <SelectItem key={t} value={t}>
                          <div className="flex items-center gap-2">
                            <cfg.icon className="h-3.5 w-3.5" />
                            {cfg.label}
                            <span className="text-xs text-muted-foreground ml-auto">({allocated}/{total})</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Number of Groups</Label>
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
                const pref = preferences.find(p => p.teacherId === newAllocTeacher && p.courseId === allocatingCourse.id);
                if (!pref) return (
                  <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground">
                    This teacher has not submitted a preference for this course.
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
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAllocateDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAllocate} disabled={!newAllocTeacher}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ COPY ALL PREVIOUS SEMESTER DIALOG ═══ */}
      <Dialog open={copyAllDialogOpen} onOpenChange={setCopyAllDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Copy className="h-4 w-4 text-accent" />
              Copy Previous Semester Allocation
            </DialogTitle>
            <DialogDescription>
              This will replace all current allocations with the staff from {semesters.find(s => s.id === "s1")?.name}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            <p className="text-sm font-medium">{previousAllocations.length} allocations across {new Set(previousAllocations.map(a => a.courseId)).size} courses</p>
            {courses.map(c => {
              const courseAllocs = previousAllocations.filter(a => a.courseId === c.id);
              if (courseAllocs.length === 0) return null;
              return (
                <div key={c.id} className="rounded-lg bg-muted/30 p-3">
                  <p className="text-sm font-medium mb-1.5">{c.code} – {c.name}</p>
                  <div className="space-y-0.5">
                    {courseAllocs.map(a => {
                      const cfg = getClassTypeConfig(a.classType);
                      return (
                        <div key={a.id} className="flex items-center gap-2 text-xs">
                          <cfg.icon className="h-3 w-3 text-muted-foreground" />
                          <span>{a.teacherName}</span>
                          <span className="text-muted-foreground ml-auto tabular-nums">{a.groups} gr.</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCopyAllDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCopyAllPrevious}>
              <Copy className="h-3.5 w-3.5 mr-1.5" />
              Replace All & Copy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
