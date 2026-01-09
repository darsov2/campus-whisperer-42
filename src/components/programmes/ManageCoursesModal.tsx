import { useState } from "react";
import {
  BookOpen,
  Plus,
  Clock,
  GitBranch,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { RulesVisualTree } from "@/components/RulesVisualTree";
import type { ProgrammeWithDetails, ProgrammeCourse } from "./types";

interface ManageCoursesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  programme: ProgrammeWithDetails | null;
  onAddCourse: (semester: number) => void;
  onEditCourse: (course: ProgrammeCourse) => void;
  onConfigureRules: (course: ProgrammeCourse) => void;
  onRemoveCourse: (courseId: string) => void;
}

function countConditions(rules: ProgrammeCourse["rules"]): number {
  if (!rules || !rules.groups) return 0;
  return rules.groups.reduce((acc, g) => acc + g.conditions.length, 0);
}

export function ManageCoursesModal({
  open,
  onOpenChange,
  programme,
  onAddCourse,
  onEditCourse,
  onConfigureRules,
  onRemoveCourse,
}: ManageCoursesModalProps) {
  const [visualRulesCourse, setVisualRulesCourse] = useState<ProgrammeCourse | null>(null);
  const [activeSemester, setActiveSemester] = useState("1");

  if (!programme) return null;

  // Get semesters based on programme duration
  const totalSemesters = programme.duration * 2; // Assuming 2 semesters per year
  const semesters = Array.from({ length: totalSemesters }, (_, i) => i + 1);

  const coursesInSemester = (semester: number) =>
    programme.courses.filter((c) => c.semester === semester);

  const totalEcts = programme.courses.reduce((acc, c) => acc + c.ects, 0);
  const mandatoryCount = programme.courses.filter((c) => c.type === "mandatory").length;
  const electiveCount = programme.courses.filter((c) => c.type === "elective").length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <BookOpen className="h-6 w-6 text-accent" />
                {programme.name} - {programme.code}
              </DialogTitle>
              <DialogDescription className="mt-1">
                Manage courses linked to this programme by semester
              </DialogDescription>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-medium">{programme.courses.length} courses</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Mandatory:</span>
              <span className="font-medium text-accent">{mandatoryCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Elective:</span>
              <span className="font-medium text-info">{electiveCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">ECTS:</span>
              <span className="font-medium">{totalEcts} / {programme.totalEcts}</span>
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
                const semCourses = coursesInSemester(sem);
                const semEcts = semCourses.reduce((acc, c) => acc + c.ects, 0);
                return (
                  <TabsTrigger
                    key={sem}
                    value={String(sem)}
                    className="flex items-center gap-2"
                  >
                    <Clock className="h-3.5 w-3.5" />
                    Semester {sem}
                    {semCourses.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({semCourses.length} · {semEcts} ECTS)
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
                    <h3 className="font-semibold text-lg">Semester {sem} Courses</h3>
                    <Button onClick={() => onAddCourse(sem)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Course
                    </Button>
                  </div>

                  {coursesInSemester(sem).length === 0 ? (
                    <div className="text-center py-16 border border-dashed rounded-lg bg-muted/20">
                      <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-lg text-muted-foreground">
                        No courses in Semester {sem}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add courses from the catalog to this semester
                      </p>
                      <Button className="mt-4" onClick={() => onAddCourse(sem)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Course
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {coursesInSemester(sem)
                        .sort((a, b) => a.courseCode.localeCompare(b.courseCode))
                        .map((course) => {
                          const conditionsCount = countConditions(course.rules);
                          return (
                            <div key={course.id} className="space-y-2">
                              <div className="p-4 border rounded-lg bg-card hover:shadow-sm transition-shadow">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded shrink-0">
                                        {course.courseCode}
                                      </span>
                                      <span className="font-medium truncate">
                                        {course.courseName}
                                      </span>
                                      <span
                                        className={cn(
                                          "text-xs px-2 py-0.5 rounded shrink-0",
                                          course.type === "mandatory"
                                            ? "bg-accent/20 text-accent"
                                            : "bg-info/20 text-info"
                                        )}
                                      >
                                        {course.type === "mandatory"
                                          ? "Mandatory"
                                          : "Elective"}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                      <span>{course.ects} ECTS</span>
                                      {conditionsCount > 0 && (
                                        <span className="text-accent font-medium flex items-center gap-1">
                                          <GitBranch className="h-3 w-3" />
                                          {conditionsCount} condition
                                          {conditionsCount !== 1 && "s"}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setVisualRulesCourse(
                                          visualRulesCourse?.id === course.id
                                            ? null
                                            : course
                                        );
                                      }}
                                      title="View rules"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onConfigureRules(course)}
                                      title="Configure rules"
                                    >
                                      <GitBranch className="h-4 w-4" />
                                    </Button>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm">
                                          <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent
                                        align="end"
                                        className="bg-popover"
                                      >
                                        <DropdownMenuItem
                                          onClick={() => onEditCourse(course)}
                                        >
                                          Edit Settings
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => onConfigureRules(course)}
                                        >
                                          <GitBranch className="h-4 w-4 mr-2" />
                                          Configure Rules
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => onRemoveCourse(course.id)}
                                        >
                                          Remove from Programme
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                </div>
                              </div>

                              {/* Visual Rules Tree */}
                              {visualRulesCourse?.id === course.id && (
                                <div className="ml-4 border-l-2 border-accent/30 bg-muted/20 rounded-r-lg">
                                  <RulesVisualTree
                                    courseCode={course.courseCode}
                                    courseName={course.courseName}
                                    rules={course.rules}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
