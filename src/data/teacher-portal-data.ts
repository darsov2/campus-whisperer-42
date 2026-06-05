// Mock data for the teacher portal. All data is illustrative.

export interface TeacherPortalProfile {
  id: string;
  staffId: string;
  firstName: string;
  lastName: string;
  title: string;
  faculty: string;
  department: string;
  email: string;
  phone: string;
  office: string;
  joinedYear: number;
  status: "active" | "on_leave" | "retired";
}

export interface PortalSemester {
  id: string;
  label: string;
  academicYear: string;
  current?: boolean;
}

export interface PortalSubject {
  id: string;
  code: string;
  name: string;
  ects: number;
  semesterIds: string[];
  // The teacher's role on this subject — controls editability of grades.
  role: "coordinator" | "lecturer" | "assistant";
}

export interface PortalExamSession {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  semesterId: string;
}

export interface PortalStudent {
  id: string;
  index: string; // student ID number
  firstName: string;
  lastName: string;
  programme: string;
  programmeCode: string;
  year: number;
  status: "active" | "suspended" | "graduated" | "withdrawn";
  email: string;
  photoUrl?: string;
}

export interface StudentEnrolledCourse {
  studentId: string;
  subjectId: string;
  semesterId: string;
  status: "in_progress" | "passed" | "failed" | "withdrawn";
  enrollmentDate: string;
  type: "mandatory" | "elective";
  teacherName: string;
}

export interface StudentGradeRow {
  id: string;
  studentId: string;
  subjectId: string;
  semesterId: string;
  grade: number | null; // 5-10 or null
  examDate: string | null;
  examSessionId: string | null;
  note?: string;
  attempts: number;
}

export interface DisciplinaryViolation {
  id: string;
  studentId: string;
  subjectId?: string;
  date: string;
  type: "academic_dishonesty" | "attendance" | "conduct" | "plagiarism" | "other";
  severity: "low" | "medium" | "high";
  description: string;
  decision: string;
  reportedBy: string;
}

export interface ExamApplication {
  id: string;
  studentId: string;
  subjectId: string;
  semesterId: string;
  examSessionId: string;
  applicationDate: string;
  status: "applied" | "withdrawn" | "missed";
  professorRole: "coordinator" | "lecturer" | "assistant";
}

// ---- Singletons ----

export const teacherProfile: TeacherPortalProfile = {
  id: "t-1",
  staffId: "STF-2018-114",
  firstName: "John",
  lastName: "Smith",
  title: "Associate Professor",
  faculty: "Faculty of Computer Science",
  department: "Software Engineering",
  email: "john.smith@university.edu",
  phone: "+1 555-0101",
  office: "Building B · Room 312",
  joinedYear: 2018,
  status: "active",
};

export const semesters: PortalSemester[] = [
  { id: "s-2024-w", label: "2024/2025 — Winter", academicYear: "2024/2025", current: true },
  { id: "s-2024-s", label: "2023/2024 — Summer", academicYear: "2023/2024" },
  { id: "s-2023-w", label: "2023/2024 — Winter", academicYear: "2023/2024" },
];

export const subjects: PortalSubject[] = [
  { id: "sub-se301", code: "SE301", name: "Software Engineering", ects: 6, semesterIds: ["s-2024-w", "s-2023-w"], role: "coordinator" },
  { id: "sub-db201", code: "DB201", name: "Database Systems", ects: 5, semesterIds: ["s-2024-w", "s-2024-s"], role: "lecturer" },
  { id: "sub-al101", code: "AL101", name: "Algorithms & Data Structures", ects: 6, semesterIds: ["s-2024-s", "s-2023-w"], role: "lecturer" },
  { id: "sub-os401", code: "OS401", name: "Operating Systems", ects: 6, semesterIds: ["s-2024-w"], role: "assistant" },
];

// Full professor roster per subject (the current teacher is always included).
// Used so reports list every student on the subject, regardless of which
// professor they are personally assigned to.
export const professorsBySubject: Record<string, string[]> = {
  "sub-se301": ["J. Smith", "M. Garcia", "L. Petrović"],
  "sub-db201": ["J. Smith", "A. Novak", "R. Kim"],
  "sub-al101": ["J. Smith", "P. Andersson", "E. Müller"],
  "sub-os401": ["J. Smith", "D. Costa"],
};

export function getProfessorForStudent(subjectId: string, studentId: string): string {
  const list = professorsBySubject[subjectId] ?? ["J. Smith"];
  const n = studentId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return list[n % list.length];
}

export const examSessions: PortalExamSession[] = [
  { id: "es-jan25", label: "January 2025", startDate: "2025-01-15", endDate: "2025-02-05", semesterId: "s-2024-w" },
  { id: "es-feb25", label: "February 2025", startDate: "2025-02-10", endDate: "2025-02-25", semesterId: "s-2024-w" },
  { id: "es-jun24", label: "June 2024", startDate: "2024-06-10", endDate: "2024-06-28", semesterId: "s-2024-s" },
  { id: "es-sep24", label: "September 2024", startDate: "2024-09-02", endDate: "2024-09-18", semesterId: "s-2024-s" },
];

const firstNames = ["Alex", "Maria", "James", "Sofia", "Liam", "Emma", "Noah", "Olivia", "Ethan", "Ava", "Lucas", "Isabella", "Mason", "Mia", "Logan", "Charlotte", "Jacob", "Amelia", "Daniel", "Harper", "Henry", "Evelyn", "Sebastian", "Abigail", "Owen", "Emily", "Wyatt", "Elizabeth", "Carter", "Sofia"];
const lastNames = ["Johnson", "Garcia", "Wilson", "Martinez", "Brown", "Davis", "Miller", "Lopez", "Smith", "Anderson", "Taylor", "Thomas", "Moore", "Jackson", "White", "Harris", "Martin", "Thompson", "Young", "Allen", "King", "Wright", "Scott", "Green", "Adams", "Baker", "Nelson", "Carter", "Mitchell", "Perez"];
const programmes = [
  { name: "Computer Science", code: "CS-BSC" },
  { name: "Software Engineering", code: "SE-BSC" },
  { name: "Information Systems", code: "IS-BSC" },
];

export const students: PortalStudent[] = Array.from({ length: 36 }, (_, i) => {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i * 3) % lastNames.length];
  const prog = programmes[i % programmes.length];
  const year = (i % 4) + 1;
  const status: PortalStudent["status"] =
    i % 17 === 0 ? "suspended" : i % 19 === 0 ? "withdrawn" : "active";
  const index = `2021-${prog.code.split("-")[0]}-${String(100 + i).padStart(3, "0")}`;
  return {
    id: `st-${i + 1}`,
    index,
    firstName: fn,
    lastName: ln,
    programme: prog.name,
    programmeCode: prog.code,
    year,
    status,
    email: `${fn}.${ln}@student.edu`.toLowerCase(),
  };
});

// For every student × subject combo where the subject runs in the student's relevant semester,
// generate an enrollment + grade row.
export const enrolledCourses: StudentEnrolledCourse[] = [];
export const grades: StudentGradeRow[] = [];

let gid = 1;
students.forEach((st, i) => {
  subjects.forEach((sub, j) => {
    // Spread students across subjects: each student gets ~2-3 subjects
    if ((i + j) % 3 === 0) return;
    const semId = sub.semesterIds[(i + j) % sub.semesterIds.length];
    const passed = (i + j) % 4 !== 0;
    const inProgress = semId === "s-2024-w" && (i + j) % 5 !== 0;
    const status: StudentEnrolledCourse["status"] = inProgress
      ? "in_progress"
      : passed
        ? "passed"
        : "failed";
    enrolledCourses.push({
      studentId: st.id,
      subjectId: sub.id,
      semesterId: semId,
      status,
      enrollmentDate: "2024-09-15",
      type: j % 2 === 0 ? "mandatory" : "elective",
      teacherName: sub.role === "coordinator" ? "J. Smith" : "M. Garcia",
    });
    const grade = status === "passed" ? 6 + ((i + j) % 5) : status === "failed" ? 5 : null;
    grades.push({
      id: `g-${gid++}`,
      studentId: st.id,
      subjectId: sub.id,
      semesterId: semId,
      grade,
      examDate: grade ? "2024-06-18" : null,
      examSessionId: grade ? "es-jun24" : null,
      attempts: 1 + ((i + j) % 2),
    });
  });
});

export const violations: DisciplinaryViolation[] = [
  {
    id: "v-1",
    studentId: "st-3",
    subjectId: "sub-se301",
    date: "2024-04-12",
    type: "plagiarism",
    severity: "high",
    description: "Final project contained large portions copied from an open-source repository without attribution.",
    decision: "Course failed for the semester. Written warning issued.",
    reportedBy: "J. Smith",
  },
  {
    id: "v-2",
    studentId: "st-3",
    subjectId: "sub-db201",
    date: "2024-02-03",
    type: "attendance",
    severity: "low",
    description: "Missed 5 consecutive lab sessions without medical justification.",
    decision: "Reduced lab grade.",
    reportedBy: "M. Garcia",
  },
  {
    id: "v-3",
    studentId: "st-7",
    subjectId: "sub-al101",
    date: "2024-05-22",
    type: "academic_dishonesty",
    severity: "medium",
    description: "Discovered using an unauthorized cheat-sheet during the midterm exam.",
    decision: "Midterm voided. Allowed to re-take in September session.",
    reportedBy: "J. Smith",
  },
  {
    id: "v-4",
    studentId: "st-12",
    date: "2024-03-10",
    type: "conduct",
    severity: "medium",
    description: "Disruptive behavior during a lecture.",
    decision: "Verbal warning recorded in academic file.",
    reportedBy: "Faculty Office",
  },
];

export const examApplications: ExamApplication[] = [];
let aid = 1;
grades.forEach((g, i) => {
  if (!g.grade && i % 3 !== 0) return;
  const session = g.examSessionId ?? examSessions[(i % examSessions.length)].id;
  examApplications.push({
    id: `ea-${aid++}`,
    studentId: g.studentId,
    subjectId: g.subjectId,
    semesterId: g.semesterId,
    examSessionId: session,
    applicationDate: "2024-06-01",
    status: i % 11 === 0 ? "withdrawn" : i % 13 === 0 ? "missed" : "applied",
    professorRole: subjects.find((s) => s.id === g.subjectId)?.role ?? "lecturer",
  });
});

// ----- Selectors -----
export const getSubject = (id: string) => subjects.find((s) => s.id === id);
export const getSemester = (id: string) => semesters.find((s) => s.id === id);
export const getStudent = (id: string) => students.find((s) => s.id === id);
export const getExamSession = (id: string) => examSessions.find((s) => s.id === id);

export function getStudentByIndex(idx: string) {
  return students.find((s) => s.index.toLowerCase() === idx.toLowerCase());
}

export function searchStudents(query: string) {
  if (!query) return [];
  const q = query.toLowerCase();
  return students
    .filter(
      (s) =>
        s.index.toLowerCase().includes(q) ||
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q),
    )
    .slice(0, 8);
}

export function studentsForSubject(subjectId: string, semesterId?: string) {
  const rows = enrolledCourses.filter(
    (e) => e.subjectId === subjectId && (!semesterId || e.semesterId === semesterId),
  );
  return rows
    .map((r) => ({ enrollment: r, student: getStudent(r.studentId)!, grade: grades.find((g) => g.studentId === r.studentId && g.subjectId === subjectId && g.semesterId === r.semesterId) }))
    .filter((r) => r.student);
}

export function applicationsForSubject(subjectId: string, semesterId?: string, examSessionId?: string) {
  return examApplications
    .filter(
      (a) =>
        a.subjectId === subjectId &&
        (!semesterId || a.semesterId === semesterId) &&
        (!examSessionId || a.examSessionId === examSessionId),
    )
    .map((a) => ({ application: a, student: getStudent(a.studentId)!, grade: grades.find((g) => g.studentId === a.studentId && g.subjectId === a.subjectId && g.semesterId === a.semesterId) }))
    .filter((r) => r.student);
}
