import { useNavigate, useParams } from "react-router-dom";
import { ChevronRight, GraduationCap, CheckCircle2, ClipboardList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const reports = [
  { id: "enrolled",         title: "Enrolled Students",  desc: "Students currently enrolled in your subjects.",                 icon: GraduationCap, color: "bg-info/10 text-info" },
  { id: "passed",           title: "Passed Students",    desc: "Students who passed your subjects, with grade and exam detail.", icon: CheckCircle2,  color: "bg-success/10 text-success" },
  { id: "exam-applications",title: "Exam Applications",  desc: "Students who registered for an exam where you are assigned.",   icon: ClipboardList, color: "bg-accent/10 text-accent" },
];

export default function TeacherReportsHub() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">Filter and export student data for your subjects.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {reports.map((r) => {
          const Icon = r.icon;
          return (
            <button
              key={r.id}
              onClick={() => navigate(`/teachers/${id}/reports/${r.id}`)}
              className="text-left rounded-xl border bg-card p-5 hover:border-accent/50 hover:shadow-[var(--shadow-md)] transition-all group"
            >
              <div className={cn("h-11 w-11 rounded-lg flex items-center justify-center mb-3", r.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">{r.title}</p>
                <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
