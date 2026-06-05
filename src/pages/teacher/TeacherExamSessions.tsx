import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { examSessions, examApplications, getSubject, getSemester } from "@/data/teacher-portal-data";

export default function TeacherExamSessions() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Exam Sessions</h1>
        <p className="text-sm text-muted-foreground mt-1">Upcoming and active exam sittings you are assigned to.</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {examSessions.map((s) => {
          const apps = examApplications.filter(a => a.examSessionId === s.id);
          return (
            <Card key={s.id} className="border-0 shadow-[var(--shadow-card)]">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-xs text-muted-foreground mt-1">{s.startDate} → {s.endDate}</p>
                    <p className="text-xs text-muted-foreground">{getSemester(s.semesterId)?.label}</p>
                  </div>
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/30">{apps.length} applicants</Badge>
                </div>
                <div className="mt-3 text-xs text-muted-foreground border-t pt-2">
                  Subjects: {Array.from(new Set(apps.map(a => getSubject(a.subjectId)?.code))).filter(Boolean).join(", ") || "—"}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
