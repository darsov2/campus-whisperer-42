// Mock data for the Student Portal "Exam Applications" experience.
// All fee values are placeholders and will be linked to the backend later.

export interface ExamSession {
  id: string;
  label: string;
  period: string;
  /** Academic year the session belongs to, e.g. "2026/27". */
  academicYear: string;
  /** Currently open session — no late fee. */
  isCurrent: boolean;
  /** Whether late applications are still accepted for this (closed) session. */
  applicationsAllowed: boolean;
  /** Application deadline (display only). */
  deadline: string;
}


export interface ExamProfessor {
  id: string;
  name: string;
  title: string;
}

export interface ExamSchedule {
  date: string;
  time: string;
  hall: string;
}

export interface ExamCourse {
  id: string;
  code: string;
  name: string;
  ects: number;
  /** Programme semester the course belongs to. */
  semester: number;
  signatureObtained: boolean;
  /** Previous failed attempts on this exam. */
  attempts: number;
  professors: ExamProfessor[];
  defaultProfessorId: string;
  /** Schedule per session id. */
  schedule: Record<string, ExamSchedule>;
}

export type ApplicationStatus = "submitted" | "withdrawn" | "graded";

export interface ExamApplication {
  id: string;
  sessionId: string;
  courseId: string;
  professorId: string;
  status: ApplicationStatus;
  submittedOn: string;
  grade?: number;
}

export interface ExamFeeBreakdown {
  applicationFeePerExam: number;
  lateFeePerExam: number;
  administrativeFee: number;
  currency: string;
}

/** Placeholder values — to be linked to faculty/university configuration. */
export const examFees: ExamFeeBreakdown = {
  applicationFeePerExam: 3,
  lateFeePerExam: 10,
  administrativeFee: 2,
  currency: "EUR",
};

export const examSessions: ExamSession[] = [
  {
    id: "sess-sep-2026",
    label: "September 2026",
    period: "1 – 20 Sep 2026",
    academicYear: "2025/26",
    isCurrent: true,
    applicationsAllowed: true,
    deadline: "12 Sep 2026",
  },
  {
    id: "sess-jun-2026",
    label: "June 2026",
    period: "5 – 28 Jun 2026",
    academicYear: "2025/26",
    isCurrent: false,
    applicationsAllowed: true,
    deadline: "closed 20 Jun 2026",
  },
  {
    id: "sess-jan-2026",
    label: "January 2026",
    period: "12 Jan – 5 Feb 2026",
    academicYear: "2025/26",
    isCurrent: false,
    applicationsAllowed: true,
    deadline: "closed 28 Jan 2026",
  },
  {
    id: "sess-sep-2025",
    label: "September 2025",
    period: "1 – 20 Sep 2025",
    academicYear: "2024/25",
    isCurrent: false,
    applicationsAllowed: false,
    deadline: "closed 12 Sep 2025",
  },
  {
    id: "sess-jun-2025",
    label: "June 2025",
    period: "5 – 28 Jun 2025",
    academicYear: "2024/25",
    isCurrent: false,
    applicationsAllowed: false,
    deadline: "closed 20 Jun 2025",
  },
  {
    id: "sess-jan-2025",
    label: "January 2025",
    period: "12 Jan – 5 Feb 2025",
    academicYear: "2024/25",
    isCurrent: false,
    applicationsAllowed: false,
    deadline: "closed 28 Jan 2025",
  },
  {
    id: "sess-jun-2024",
    label: "June 2024",
    period: "5 – 28 Jun 2024",
    academicYear: "2023/24",
    isCurrent: false,
    applicationsAllowed: false,
    deadline: "closed 20 Jun 2024",
  },
  {
    id: "sess-jan-2024",
    label: "January 2024",
    period: "12 Jan – 5 Feb 2024",
    academicYear: "2023/24",
    isCurrent: false,
    applicationsAllowed: false,
    deadline: "closed 28 Jan 2024",
  },
];


const prof = (id: string, name: string, title: string): ExamProfessor => ({ id, name, title });

const kostadinov = prof("t1", "Prof. Dr. Marko Kostadinov", "Full Professor");
const nikolova = prof("t2", "Prof. Dr. Elena Nikolova", "Associate Professor");
const stojanov = prof("t3", "Prof. Dr. Ivan Stojanov", "Full Professor");
const petrovska = prof("t4", "Doc. Dr. Ana Petrovska", "Assistant Professor");

const sched = (date: string, time: string, hall: string): ExamSchedule => ({ date, time, hall });

export const examCourses: ExamCourse[] = [
  {
    id: "c-db",
    code: "FINKI-DB",
    name: "Databases",
    ects: 6,
    semester: 4,
    signatureObtained: true,
    attempts: 1,
    professors: [kostadinov, nikolova],
    defaultProfessorId: kostadinov.id,
    schedule: {
      "sess-sep-2026": sched("14 Sep 2026", "10:00", "Amphitheatre A"),
      "sess-jun-2026": sched("11 Jun 2026", "09:00", "Amphitheatre A"),
      "sess-jan-2026": sched("18 Jan 2026", "12:00", "Hall 200"),
    },
  },
  {
    id: "c-os",
    code: "FINKI-OS",
    name: "Operating Systems",
    ects: 6,
    semester: 4,
    signatureObtained: true,
    attempts: 2,
    professors: [stojanov],
    defaultProfessorId: stojanov.id,
    schedule: {
      "sess-sep-2026": sched("15 Sep 2026", "13:00", "Hall 138"),
      "sess-jun-2026": sched("12 Jun 2026", "13:00", "Hall 138"),
      "sess-jan-2026": sched("20 Jan 2026", "10:00", "Hall 138"),
    },
  },
  {
    id: "c-web",
    code: "FINKI-WP",
    name: "Web Programming",
    ects: 6,
    semester: 5,
    signatureObtained: true,
    attempts: 0,
    professors: [nikolova, petrovska],
    defaultProfessorId: nikolova.id,
    schedule: {
      "sess-sep-2026": sched("16 Sep 2026", "09:00", "Lab 3"),
      "sess-jun-2026": sched("14 Jun 2026", "09:00", "Lab 3"),
      "sess-jan-2026": sched("22 Jan 2026", "09:00", "Lab 3"),
    },
  },
  {
    id: "c-sa",
    code: "FINKI-SA",
    name: "Software Architecture",
    ects: 6,
    semester: 5,
    signatureObtained: true,
    attempts: 0,
    professors: [kostadinov, stojanov, petrovska],
    defaultProfessorId: petrovska.id,
    schedule: {
      "sess-sep-2026": sched("17 Sep 2026", "11:00", "Amphitheatre B"),
      "sess-jun-2026": sched("15 Jun 2026", "11:00", "Amphitheatre B"),
      "sess-jan-2026": sched("24 Jan 2026", "11:00", "Amphitheatre B"),
    },
  },
  {
    id: "c-ds",
    code: "FINKI-DS",
    name: "Distributed Systems",
    ects: 6,
    semester: 5,
    signatureObtained: false,
    attempts: 0,
    professors: [stojanov, nikolova],
    defaultProfessorId: stojanov.id,
    schedule: {
      "sess-sep-2026": sched("18 Sep 2026", "10:00", "Hall 200"),
      "sess-jun-2026": sched("16 Jun 2026", "10:00", "Hall 200"),
      "sess-jan-2026": sched("26 Jan 2026", "10:00", "Hall 200"),
    },
  },
];

export const existingApplications: ExamApplication[] = [
  {
    id: "app-1",
    sessionId: "sess-sep-2026",
    courseId: "c-sa",
    professorId: kostadinov.id,
    status: "submitted",
    submittedOn: "26 Aug 2026",
  },
  {
    id: "app-2",
    sessionId: "sess-jun-2026",
    courseId: "c-db",
    professorId: kostadinov.id,
    status: "graded",
    submittedOn: "2 Jun 2026",
    grade: 5,
  },
  {
    id: "app-3",
    sessionId: "sess-jan-2026",
    courseId: "c-os",
    professorId: stojanov.id,
    status: "withdrawn",
    submittedOn: "14 Jan 2026",
  },
  {
    id: "app-4",
    sessionId: "sess-jan-2026",
    courseId: "c-web",
    professorId: nikolova.id,
    status: "graded",
    submittedOn: "10 Jan 2026",
    grade: 9,
  },
  {
    id: "app-5",
    sessionId: "sess-sep-2025",
    courseId: "c-os",
    professorId: stojanov.id,
    status: "graded",
    submittedOn: "1 Sep 2025",
    grade: 5,
  },
  {
    id: "app-6",
    sessionId: "sess-jun-2025",
    courseId: "c-db",
    professorId: nikolova.id,
    status: "graded",
    submittedOn: "3 Jun 2025",
    grade: 5,
  },
  {
    id: "app-7",
    sessionId: "sess-jun-2025",
    courseId: "c-web",
    professorId: petrovska.id,
    status: "withdrawn",
    submittedOn: "3 Jun 2025",
  },
  {
    id: "app-8",
    sessionId: "sess-jan-2025",
    courseId: "c-sa",
    professorId: kostadinov.id,
    status: "graded",
    submittedOn: "11 Jan 2025",
    grade: 8,
  },
  {
    id: "app-9",
    sessionId: "sess-jun-2024",
    courseId: "c-ds",
    professorId: stojanov.id,
    status: "graded",
    submittedOn: "4 Jun 2024",
    grade: 7,
  },
  {
    id: "app-10",
    sessionId: "sess-jan-2024",
    courseId: "c-db",
    professorId: kostadinov.id,
    status: "graded",
    submittedOn: "10 Jan 2024",
    grade: 6,
  },
];


export const getCourse = (id: string) => examCourses.find((c) => c.id === id);
export const getProfessor = (course: ExamCourse | undefined, id: string) =>
  course?.professors.find((p) => p.id === id);
