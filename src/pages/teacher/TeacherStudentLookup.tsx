import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchStudents, students } from "@/data/teacher-portal-data";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  active: "bg-success/15 text-success border-success/30",
  suspended: "bg-destructive/15 text-destructive border-destructive/30",
  graduated: "bg-accent/15 text-accent border-accent/30",
  withdrawn: "bg-muted text-muted-foreground border-border",
};

export default function TeacherStudentLookup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const results = q ? searchStudents(q) : students.slice(0, 8);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Student Lookup</h1>
        <p className="text-sm text-muted-foreground mt-1">Search by student ID number, full name or email address.</p>
      </div>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              placeholder="e.g. 2021-CS-001 or Maria Garcia"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-9 h-11"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          {q ? `${results.length} result${results.length === 1 ? "" : "s"}` : "Recent students"}
        </p>
        <div className="grid gap-2">
          {results.map((s) => (
            <button
              key={s.id}
              onClick={() => navigate(`/teachers/${id}/lookup/${s.id}/courses`)}
              className="text-left flex items-center gap-3 rounded-lg border bg-card p-3 hover:border-accent/50 hover:shadow-[var(--shadow-md)] transition-all"
            >
              <div className="h-10 w-10 rounded-full bg-accent/10 text-accent flex items-center justify-center font-semibold">
                {s.firstName[0]}{s.lastName[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{s.firstName} {s.lastName}</p>
                <p className="text-xs text-muted-foreground font-mono">{s.index} · {s.programme} · Year {s.year}</p>
              </div>
              <Badge variant="outline" className={cn("capitalize", statusStyles[s.status])}>{s.status}</Badge>
            </button>
          ))}
          {results.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center">
                <User className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No students match "{q}".</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
