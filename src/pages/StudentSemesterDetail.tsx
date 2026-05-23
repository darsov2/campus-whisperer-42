import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle2,
  CircleDot,
  Clock,
  FileSignature,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { getStudentProfile } from "@/data/students-data";
import { getStudentSemester, SemesterStatus } from "@/data/student-semesters-data";

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
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-border last:border-0">
      <span className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1.5">
        {Icon && <Icon className="h-3.5 w-3.5" />}
        {label}
      </span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}

export default function StudentSemesterDetail() {
  const { id, semesterId } = useParams<{ id: string; semesterId: string }>();
  const navigate = useNavigate();
  const student = id ? getStudentProfile(id) : undefined;
  const semester = id && semesterId ? getStudentSemester(id, semesterId) : undefined;

  if (!student || !semester) {
    return (
      <div className="page-container">
        <p className="text-muted-foreground">Semester not found.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(`/students/${id}/semesters`)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to semesters
        </Button>
      </div>
    );
  }

  const sigPct =
    semester.signaturesTotal > 0
      ? Math.round((semester.signaturesAcquired / semester.signaturesTotal) * 100)
      : 0;

  return (
    <div className="page-container space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(`/students/${id}/semesters`)}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to semesters
      </Button>

      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-primary/10 text-primary shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold">Semester {semester.number}</h1>
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
            <p className="text-muted-foreground mt-1">
              {semester.label} • {student.firstName} {student.lastName}
            </p>
          </div>
        </div>
        {semester.courses.length > 0 && (
          <Button asChild>
            <Link to={`/students/${id}/semesters/${semester.id}/courses`}>
              <BookOpen className="h-4 w-4 mr-1.5" /> View courses
              <ArrowRight className="h-4 w-4 ml-1.5" />
            </Link>
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1.5">
              <FileSignature className="h-3.5 w-3.5" /> Signatures
            </p>
            <p className="text-2xl font-semibold mt-1">
              {semester.signaturesAcquired}
              <span className="text-muted-foreground text-base font-normal">
                /{semester.signaturesTotal || 0}
              </span>
            </p>
            {semester.signaturesTotal > 0 && <Progress value={sigPct} className="h-1.5 mt-3" />}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Courses</p>
            <p className="text-2xl font-semibold mt-1">{semester.courses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Total price</p>
            <p className="text-2xl font-semibold mt-1">{fmtMoney(semester.price)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">General</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DetailRow label="Academic year" value={semester.academicYear} />
            <DetailRow label="Quota" value={semester.quota} />
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
                      <span className="text-muted-foreground ml-1 font-normal">
                        on {semester.validatedAt}
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted-foreground">
                    <XCircle className="h-3.5 w-3.5" /> No
                  </span>
                )
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financials</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <DetailRow label="Price" value={fmtMoney(semester.price)} />
            <DetailRow label="Paid to faculty" value={fmtMoney(semester.paidToFaculty)} />
            <DetailRow label="Paid to university" value={fmtMoney(semester.paidToUniversity)} />
            <DetailRow
              label="Outstanding"
              value={fmtMoney(
                Math.max(0, semester.price - semester.paidToFaculty - semester.paidToUniversity),
              )}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student services note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {semester.studentServicesNote || (
                <span className="text-muted-foreground">No note.</span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student note</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              {semester.studentNote || <span className="text-muted-foreground">No note.</span>}
            </p>
          </CardContent>
        </Card>
      </div>

      {semester.courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrolled courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {semester.courses.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{c.code}</span>
                <span className="text-sm font-medium flex-1 min-w-0">{c.name}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {c.type}
                </Badge>
                <span className="text-xs text-muted-foreground shrink-0">{c.ects} ECTS</span>
              </div>
            ))}
            <Separator className="my-2" />
            <div className="flex justify-end text-sm text-muted-foreground">
              Total ECTS:{" "}
              <span className="font-semibold text-foreground ml-1">
                {semester.courses.reduce((sum, c) => sum + c.ects, 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
