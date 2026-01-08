import { useState } from "react";
import { 
  Calendar, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Edit2,
  Building2,
  GraduationCap
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FacultyOverride {
  facultyId: string;
  facultyName: string;
  enrollmentStart: string;
  enrollmentEnd: string;
  lateEnrollmentEnd: string;
  studyCycles: string[];
}

interface Semester {
  id: string;
  name: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  enrollmentStart: string;
  enrollmentEnd: string;
  lateEnrollmentEnd: string;
  status: "active" | "pending" | "archived";
  facultyOverrides: FacultyOverride[];
}

const semesters: Semester[] = [
  {
    id: "1",
    name: "Winter Semester",
    academicYear: "2024/25",
    startDate: "2024-10-01",
    endDate: "2025-02-15",
    enrollmentStart: "2024-09-01",
    enrollmentEnd: "2024-09-30",
    lateEnrollmentEnd: "2024-10-15",
    status: "active",
    facultyOverrides: [
      {
        facultyId: "fcs",
        facultyName: "Faculty of Computer Science",
        enrollmentStart: "2024-09-05",
        enrollmentEnd: "2024-10-05",
        lateEnrollmentEnd: "2024-10-20",
        studyCycles: ["Bachelor", "Master"],
      },
      {
        facultyId: "fme",
        facultyName: "Faculty of Mechanical Engineering",
        enrollmentStart: "2024-09-01",
        enrollmentEnd: "2024-09-25",
        lateEnrollmentEnd: "2024-10-10",
        studyCycles: ["Bachelor"],
      },
    ],
  },
  {
    id: "2",
    name: "Summer Semester",
    academicYear: "2024/25",
    startDate: "2025-02-24",
    endDate: "2025-06-30",
    enrollmentStart: "2025-02-01",
    enrollmentEnd: "2025-02-20",
    lateEnrollmentEnd: "2025-03-05",
    status: "pending",
    facultyOverrides: [],
  },
  {
    id: "3",
    name: "Winter Semester",
    academicYear: "2023/24",
    startDate: "2023-10-01",
    endDate: "2024-02-15",
    enrollmentStart: "2023-09-01",
    enrollmentEnd: "2023-09-30",
    lateEnrollmentEnd: "2023-10-15",
    status: "archived",
    facultyOverrides: [],
  },
];

function SemesterCard({ semester }: { semester: Semester }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="data-card overflow-hidden">
      {/* Master Semester Header */}
      <div 
        className="p-5 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-accent/10">
              <Calendar className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-lg">{semester.name}</h3>
                <span className="text-muted-foreground">{semester.academicYear}</span>
                <StatusBadge status={semester.status} />
              </div>
              <div className="mt-2 grid grid-cols-3 gap-6 text-sm">
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-medium">{semester.startDate} – {semester.endDate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Enrollment Period</p>
                  <p className="font-medium">{semester.enrollmentStart} – {semester.enrollmentEnd}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Late Enrollment Until</p>
                  <p className="font-medium">{semester.lateEnrollmentEnd}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
              <Edit2 className="h-4 w-4" />
            </Button>
            <div className="p-2">
              {expanded ? (
                <ChevronDown className="h-5 w-5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
        
        {semester.facultyOverrides.length > 0 && (
          <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{semester.facultyOverrides.length} faculty override{semester.facultyOverrides.length !== 1 && "s"}</span>
          </div>
        )}
      </div>

      {/* Faculty Overrides */}
      {expanded && (
        <div className="border-t bg-muted/20">
          <div className="p-4 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Faculty Overrides</h4>
              <Button size="sm" variant="outline" className="h-8">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Override
              </Button>
            </div>
          </div>
          
          {semester.facultyOverrides.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Building2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No faculty overrides configured</p>
              <p className="text-sm">All faculties use master semester dates</p>
            </div>
          ) : (
            <div className="divide-y">
              {semester.facultyOverrides.map((override) => (
                <div key={override.facultyId} className="p-4 hover:bg-muted/10 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium">{override.facultyName}</h5>
                        <div className="flex gap-1">
                          {override.studyCycles.map((cycle) => (
                            <span 
                              key={cycle}
                              className="px-2 py-0.5 text-xs bg-accent/10 text-accent rounded-full"
                            >
                              {cycle}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-6 text-sm">
                        <div>
                          <p className="text-muted-foreground">Enrollment Start</p>
                          <p className="font-medium">{override.enrollmentStart}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Enrollment End</p>
                          <p className="font-medium">{override.enrollmentEnd}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Late Enrollment</p>
                          <p className="font-medium">{override.lateEnrollmentEnd}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Semesters() {
  return (
    <div className="page-container">
      <PageHeader 
        title="Semesters" 
        description="Manage academic semesters and faculty-specific enrollment periods"
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Semester
          </Button>
        }
      />

      <div className="space-y-4">
        {semesters.map((semester) => (
          <SemesterCard key={semester.id} semester={semester} />
        ))}
      </div>
    </div>
  );
}
