import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Clock,
  FileSignature,
  Plus,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { getStudentProfile } from "@/data/students-data";
import {
  AvailableSubject,
  availableSubjectsForNextSemester,
  getStudentSemesters,
  SemesterStatus,
  StudentSemester,
} from "@/data/student-semesters-data";

const statusStyles: Record<SemesterStatus, string> = {
  "NOT STARTED": "bg-muted text-muted-foreground border-border",
  STARTED: "bg-warning/15 text-warning border-warning/30",
  FINISHED: "bg-success/15 text-success border-success/30",
};

function fmtMoney(v: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function SemesterCard({
  semester,
  expanded,
  onToggle,
  studentId,
  onEnrollCourses,
}: {
  semester: StudentSemester;
  expanded: boolean;
  onToggle: () => void;
  studentId: string;
  onEnrollCourses: () => void;
}) {
  const sigPct =
    semester.signaturesTotal > 0
      ? Math.round((semester.signaturesAcquired / semester.signaturesTotal) * 100)
      : 0;
  const hasCourses = semester.courses.length > 0;

  return (
    <Card className="w-full overflow-hidden transition-shadow hover:shadow-elevated">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left"
        aria-expanded={expanded}
      >
        <CardContent className="p-5">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0">
              <Calendar className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold">Semester {semester.number}</h3>
                <span className="text-sm text-muted-foreground">{semester.label}</span>
                <Badge variant="outline" className={cn("text-xs", statusStyles[semester.status])}>
                  {semester.status === "FINISHED" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  {semester.status === "STARTED" && <CircleDot className="h-3 w-3 mr-1" />}
                  {semester.status === "NOT STARTED" && <Clock className="h-3 w-3 mr-1" />}
                  {semester.status}
                </Badge>
                {semester.isEmpty && (
                  <Badge variant="outline" className="text-xs">
                    Empty semester
                  </Badge>
                )}
              </div>
              <div className="mt-2 flex items-center gap-4 flex-wrap text-sm">
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <FileSignature className="h-3.5 w-3.5" />
                  <span className="font-medium text-foreground">
                    {semester.signaturesAcquired}/{semester.signaturesTotal || 0}
                  </span>{" "}
                  signatures
                </span>
                {semester.signaturesTotal > 0 && (
                  <div className="w-32">
                    <Progress value={sigPct} className="h-1.5" />
                  </div>
                )}
                <span className="text-muted-foreground">
                  {semester.courses.length} {semester.courses.length === 1 ? "course" : "courses"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {hasCourses ? (
                <Button
                  asChild
                  size="sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link to={`/students/${studentId}/semesters/${semester.id}/courses`}>
                    <BookOpen className="h-4 w-4 mr-1.5" /> View courses
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Link>
                </Button>
              ) : (
                !semester.isEmpty && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEnrollCourses();
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1.5" /> Enroll courses
                  </Button>
                )
              )}
              {expanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardContent>
      </button>

      {expanded && (
        <>
          <Separator />
          <CardContent className="p-5 grid md:grid-cols-2 gap-x-8 gap-y-1 bg-muted/20">
            <DetailRow label="Quota" value={semester.quota} />
            <DetailRow label="Price" value={fmtMoney(semester.price)} />
            <DetailRow label="Paid to faculty" value={fmtMoney(semester.paidToFaculty)} />
            <DetailRow label="Paid to university" value={fmtMoney(semester.paidToUniversity)} />
            <DetailRow label="Created" value={semester.createdAt} />
            <DetailRow label="Last change" value={semester.lastChangedAt} />
            <DetailRow
              label="Verified"
              icon={ShieldCheck}
              value={
                semester.verified ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5" /> No
                  </span>
                )
              }
            />
            <DetailRow
              label="Validated"
              icon={CheckCircle2}
              value={
                semester.validated ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Yes
                    {semester.validatedAt && (
                      <span className="text-muted-foreground ml-1 font-normal">on {semester.validatedAt}</span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5" /> No
                  </span>
                )
              }
            />
            <div className="md:col-span-2 mt-3 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                  Student services note
                </p>
                <p className="text-sm rounded-md bg-card border p-3">
                  {semester.studentServicesNote || <span className="text-muted-foreground">No note.</span>}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Student note</p>
                <p className="text-sm rounded-md bg-card border p-3">
                  {semester.studentNote || <span className="text-muted-foreground">No note.</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}

function EnrollSemesterDialog({
  open,
  onOpenChange,
  nextNumber,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  nextNumber: number;
  onConfirm: (payload: { isEmpty: boolean; selectedIds: string[] }) => void;
}) {
  const [isEmpty, setIsEmpty] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const mandatory = useMemo(
    () => availableSubjectsForNextSemester.filter((s) => s.type === "mandatory"),
    [],
  );
  const optional = useMemo(
    () => availableSubjectsForNextSemester.filter((s) => s.type === "optional"),
    [],
  );

  const toggle = (id: string) => setSelected((p) => ({ ...p, [id]: !p[id] }));

  const totalEcts = useMemo(() => {
    if (isEmpty) return 0;
    const auto = mandatory.reduce((sum, s) => sum + s.ects, 0);
    const picked = optional.filter((s) => selected[s.id]).reduce((sum, s) => sum + s.ects, 0);
    return auto + picked;
  }, [isEmpty, mandatory, optional, selected]);

  const handleConfirm = () => {
    const mandatoryIds = isEmpty ? [] : mandatory.map((s) => s.id);
    const optionalIds = isEmpty ? [] : optional.filter((s) => selected[s.id]).map((s) => s.id);
    onConfirm({ isEmpty, selectedIds: [...mandatoryIds, ...optionalIds] });
    onOpenChange(false);
    setIsEmpty(false);
    setSelected({});
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Enroll in semester {nextNumber}</DialogTitle>
          <DialogDescription>
            Configure the new semester. Toggle "Empty semester" to enroll without subjects.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-md border p-3 bg-muted/30">
          <div>
            <Label htmlFor="empty-toggle" className="font-medium">
              Empty semester
            </Label>
            <p className="text-xs text-muted-foreground">No courses will be assigned.</p>
          </div>
          <Switch id="empty-toggle" checked={isEmpty} onCheckedChange={setIsEmpty} />
        </div>

        {!isEmpty && (
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold mb-2">Mandatory subjects</p>
              <p className="text-xs text-muted-foreground mb-2">
                Automatically enrolled. Cannot be removed.
              </p>
              <div className="space-y-1.5">
                {mandatory.map((s) => (
                  <SubjectRow key={s.id} subject={s} mandatory checked />
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold mb-2">Optional subjects</p>
              <p className="text-xs text-muted-foreground mb-2">
                Pick from available optional subjects for your programme.
              </p>
              <div className="space-y-1.5">
                {optional.map((s) => (
                  <SubjectRow
                    key={s.id}
                    subject={s}
                    checked={!!selected[s.id]}
                    onToggle={() => toggle(s.id)}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-md bg-primary/5 border border-primary/20 p-3 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total ECTS selected</span>
              <span className="text-lg font-semibold">{totalEcts}</span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>
            <Plus className="h-4 w-4 mr-1.5" /> Enroll
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubjectRow({
  subject,
  checked,
  onToggle,
  mandatory,
}: {
  subject: AvailableSubject;
  checked: boolean;
  onToggle?: () => void;
  mandatory?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border p-3",
        mandatory && "bg-muted/30",
        subject.alreadyEnrolled && "opacity-80",
      )}
    >
      <Checkbox checked={checked} disabled={mandatory || subject.alreadyEnrolled} onCheckedChange={onToggle} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{subject.code}</span>
          <span className="text-sm font-medium">{subject.name}</span>
          {subject.alreadyEnrolled && (
            <Badge variant="outline" className="text-xs">
              Already enrolled
            </Badge>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{subject.ects} ECTS</span>
    </div>
  );
}

export default function StudentSemesters() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const student = id ? getStudentProfile(id) : undefined;
  const semesters = id ? getStudentSemesters(id) : [];

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollTargetId, setEnrollTargetId] = useState<string | null>(null);

  if (!student) {
    return (
      <div className="page-container">
        <p className="text-muted-foreground">Student not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/students")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Students
        </Button>
      </div>
    );
  }

  const nextNumber =
    semesters.length > 0 ? Math.max(...semesters.map((s) => s.number)) + 1 : student.currentSemester;

  const handleEnrollSemester = ({
    isEmpty,
    selectedIds,
  }: {
    isEmpty: boolean;
    selectedIds: string[];
  }) => {
    if (enrollTargetId) {
      toast({
        title: "Courses enrolled",
        description: `${selectedIds.length} course(s) added to the semester.`,
      });
    } else {
      toast({
        title: `Semester ${nextNumber} created`,
        description: isEmpty
          ? "Empty semester created."
          : `Enrolled in ${selectedIds.length} subject(s).`,
      });
    }
    setEnrollTargetId(null);
  };

  const sorted = [...semesters].sort((a, b) => b.number - a.number);

  return (
    <div className="page-container space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate(`/students/${id}`)} className="-ml-2">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to profile
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Semesters</h1>
          <p className="text-muted-foreground mt-1">
            {student.firstName} {student.lastName} • {student.programme}
          </p>
        </div>
        <Button onClick={() => { setEnrollTargetId(null); setEnrollOpen(true); }}>
          <Plus className="h-4 w-4 mr-1.5" /> Enroll in new semester
        </Button>
      </div>

      <div className="space-y-3">
        {sorted.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No semesters yet. Click "Enroll in new semester" to get started.
            </CardContent>
          </Card>
        )}
        {sorted.map((sem) => (
          <SemesterCard
            key={sem.id}
            semester={sem}
            expanded={expandedId === sem.id}
            onToggle={() => setExpandedId((prev) => (prev === sem.id ? null : sem.id))}
            studentId={id!}
            onEnrollCourses={() => {
              setEnrollTargetId(sem.id);
              setEnrollOpen(true);
            }}
          />
        ))}
      </div>

      <EnrollSemesterDialog
        open={enrollOpen}
        onOpenChange={setEnrollOpen}
        nextNumber={
          enrollTargetId
            ? semesters.find((s) => s.id === enrollTargetId)?.number ?? nextNumber
            : nextNumber
        }
        onConfirm={handleEnrollSemester}
      />
    </div>
  );
}
