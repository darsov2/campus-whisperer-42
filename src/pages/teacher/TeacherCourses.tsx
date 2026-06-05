import { useNavigate, useParams } from "react-router-dom";
import { BookOpen, Users, ClipboardEdit } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { subjects, enrolledCourses, semesters } from "@/data/teacher-portal-data";
import { cn } from "@/lib/utils";

export default function TeacherCourses() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Courses</h1>
        <p className="text-sm text-muted-foreground mt-1">Subjects you are assigned to this academic year.</p>
      </div>

      {semesters.map((sem) => {
        const semSubjects = subjects.filter((s) => s.semesterIds.includes(sem.id));
        if (semSubjects.length === 0) return null;
        return (
          <div key={sem.id} className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">{sem.label}</h2>
              {sem.current && <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">Current</Badge>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {semSubjects.map((s) => {
                const enrolled = enrolledCourses.filter(e => e.subjectId === s.id && e.semesterId === sem.id).length;
                return (
                  <Card key={s.id} className="border-0 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-md)] transition-shadow">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3">
                        <div className="h-12 w-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center font-mono text-xs shrink-0">
                          {s.code}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold">{s.name}</p>
                            <Badge variant="outline" className={cn(
                              "capitalize",
                              s.role === "coordinator" && "bg-accent/10 text-accent border-accent/30",
                            )}>{s.role}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{s.ects} ECTS</p>
                          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {enrolled} students</span>
                            <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {s.semesterIds.length} terms</span>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm" variant="outline" onClick={() => navigate(`/teachers/${id}/grades`)}>
                              <ClipboardEdit className="h-3.5 w-3.5 mr-1" /> Enter grades
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => navigate(`/teachers/${id}/reports/enrolled`)}>
                              View report
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
