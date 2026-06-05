import { useParams } from "react-router-dom";
import { ReportPageShell } from "@/components/teacher/ReportPageShell";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  studentsForSubject, applicationsForSubject, examSessions, getExamSession, getSubject,
  getProfessorForStudent,
} from "@/data/teacher-portal-data";
import { useState } from "react";

const statusClass = (s: string) =>
  s === "passed" || s === "applied" ? "bg-success/10 text-success border-success/30"
  : s === "failed" || s === "missed" ? "bg-destructive/10 text-destructive border-destructive/30"
  : s === "in_progress" ? "bg-info/10 text-info border-info/30"
  : "bg-muted text-muted-foreground";

export function ReportEnrolled() {
  const { id } = useParams<{ id: string }>();
  return (
    <ReportPageShell
      backTo={`/teachers/${id}/reports`}
      title="Enrolled Students"
      description="Students enrolled in a subject for the selected semester."
      filename="enrolled-students"
      columns={[
        { key: "index",     header: "Student ID" },
        { key: "name",      header: "Name" },
        { key: "programme", header: "Programme" },
        { key: "year",      header: "Year" },
        { key: "status",    header: "Status", render: (r: any) => <Badge variant="outline" className={statusClass(r.status)}>{r.statusLabel}</Badge> },
      ]}
      build={({ semesterId, subjectId }) =>
        studentsForSubject(subjectId, semesterId).map((r) => ({
          id: r.student.id,
          index: r.student.index,
          name: `${r.student.firstName} ${r.student.lastName}`,
          programme: r.student.programme,
          year: r.student.year,
          status: r.enrollment.status,
          statusLabel: r.enrollment.status.replace("_", " "),
        }))
      }
      toExportRow={(r) => ({
        "Student ID": r.index, Name: r.name, Programme: r.programme, Year: r.year, Status: r.statusLabel,
      })}
    />
  );
}

export function ReportPassed() {
  const { id } = useParams<{ id: string }>();
  return (
    <ReportPageShell
      backTo={`/teachers/${id}/reports`}
      title="Passed Students"
      description="Students who passed the subject, with grade and exam details."
      filename="passed-students"
      columns={[
        { key: "index",      header: "Student ID" },
        { key: "name",       header: "Name" },
        { key: "programme",  header: "Programme" },
        { key: "grade",      header: "Grade", render: (r: any) => <Badge variant="outline" className="bg-success/10 text-success border-success/30">{r.grade}</Badge> },
        { key: "examDate",   header: "Exam date" },
        { key: "session",    header: "Session" },
        { key: "attempt",    header: "Attempt #" },
      ]}
      build={({ semesterId, subjectId }) =>
        studentsForSubject(subjectId, semesterId)
          .filter((r) => r.enrollment.status === "passed" && r.grade?.grade && r.grade.grade >= 6)
          .map((r) => ({
            id: r.grade!.id,
            index: r.student.index,
            name: `${r.student.firstName} ${r.student.lastName}`,
            programme: r.student.programme,
            grade: r.grade!.grade,
            examDate: r.grade!.examDate ?? "—",
            session: r.grade!.examSessionId ? getExamSession(r.grade!.examSessionId)?.label : "—",
            attempt: r.grade!.attempts,
          }))
      }
      toExportRow={(r) => ({
        "Student ID": r.index, Name: r.name, Programme: r.programme, Grade: r.grade,
        "Exam date": r.examDate, Session: r.session, "Attempt #": r.attempt,
      })}
    />
  );
}

export function ReportExamApplications() {
  const { id } = useParams<{ id: string }>();
  const [examSessionId, setSession] = useState<string>("all");

  return (
    <ReportPageShell
      backTo={`/teachers/${id}/reports`}
      title="Exam Applications"
      description="Students registered for exams in subjects where you are assigned."
      filename="exam-applications"
      extraFilters={
        <div className="space-y-1">
          <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Exam session</p>
          <Select value={examSessionId} onValueChange={setSession}>
            <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sessions</SelectItem>
              {examSessions.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      }
      columns={[
        { key: "index",     header: "Student ID" },
        { key: "name",      header: "Name" },
        { key: "subject",   header: "Subject" },
        { key: "session",   header: "Exam session" },
        { key: "appDate",   header: "Application" },
        { key: "role",      header: "Professor role", render: (r: any) => <Badge variant="outline" className="capitalize">{r.role}</Badge> },
        { key: "status",    header: "Status", render: (r: any) => <Badge variant="outline" className={statusClass(r.status)}>{r.status}</Badge> },
      ]}
      build={({ semesterId, subjectId }) =>
        applicationsForSubject(subjectId, semesterId, examSessionId === "all" ? undefined : examSessionId)
          .map((r) => ({
            id: r.application.id,
            index: r.student.index,
            name: `${r.student.firstName} ${r.student.lastName}`,
            subject: getSubject(r.application.subjectId)?.code,
            session: getExamSession(r.application.examSessionId)?.label,
            appDate: r.application.applicationDate,
            role: r.application.professorRole,
            status: r.application.status,
          }))
      }
      toExportRow={(r) => ({
        "Student ID": r.index, Name: r.name, Subject: r.subject, Session: r.session,
        "Application date": r.appDate, "Professor role": r.role, Status: r.status,
      })}
    />
  );
}
