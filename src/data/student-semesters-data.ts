export type SemesterStatus = "NOT STARTED" | "STARTED" | "FINISHED";

export interface SemesterCourseAssignment {
  id: string;
  code: string;
  name: string;
  ects: number;
  type: "mandatory" | "optional";
}

export interface StudentSemester {
  id: string;
  studentId: string;
  number: number;
  academicYear: string;
  label: string;
  status: SemesterStatus;
  signaturesAcquired: number;
  signaturesTotal: number;
  isEmpty: boolean;

  quota: string;
  studentServicesNote: string;
  studentNote: string;
  price: number;
  paidToFaculty: number;
  paidToUniversity: number;

  createdAt: string;
  lastChangedAt: string;
  verified: boolean;
  validated: boolean;
  validatedAt?: string;

  courses: SemesterCourseAssignment[];
}

export const studentSemesters: StudentSemester[] = [
  {
    id: "sem-1-1",
    studentId: "1",
    number: 1,
    academicYear: "2021/2022",
    label: "Winter 2021/2022",
    status: "FINISHED",
    signaturesAcquired: 6,
    signaturesTotal: 6,
    isEmpty: false,
    quota: "Full quota (30 ECTS)",
    studentServicesNote: "All documents submitted on time.",
    studentNote: "Adapted well to first semester.",
    price: 1200,
    paidToFaculty: 800,
    paidToUniversity: 400,
    createdAt: "2021-09-01",
    lastChangedAt: "2022-02-10",
    verified: true,
    validated: true,
    validatedAt: "2022-02-15",
    courses: [
      { id: "c1", code: "CS101", name: "Intro to Programming", ects: 6, type: "mandatory" },
      { id: "c2", code: "MA101", name: "Calculus I", ects: 6, type: "mandatory" },
      { id: "c3", code: "CS102", name: "Discrete Mathematics", ects: 6, type: "mandatory" },
      { id: "c4", code: "EN101", name: "Academic English", ects: 4, type: "mandatory" },
      { id: "c5", code: "PH101", name: "Physics I", ects: 5, type: "mandatory" },
      { id: "c6", code: "EL101", name: "Critical Thinking", ects: 3, type: "optional" },
    ],
  },
  {
    id: "sem-1-2",
    studentId: "1",
    number: 2,
    academicYear: "2021/2022",
    label: "Summer 2021/2022",
    status: "FINISHED",
    signaturesAcquired: 5,
    signaturesTotal: 5,
    isEmpty: false,
    quota: "Full quota (30 ECTS)",
    studentServicesNote: "—",
    studentNote: "",
    price: 1200,
    paidToFaculty: 800,
    paidToUniversity: 400,
    createdAt: "2022-02-15",
    lastChangedAt: "2022-07-05",
    verified: true,
    validated: true,
    validatedAt: "2022-07-10",
    courses: [
      { id: "c7", code: "CS201", name: "Data Structures", ects: 7, type: "mandatory" },
      { id: "c8", code: "MA201", name: "Calculus II", ects: 6, type: "mandatory" },
      { id: "c9", code: "CS202", name: "Computer Architecture", ects: 6, type: "mandatory" },
      { id: "c10", code: "EL201", name: "Ethics in Tech", ects: 4, type: "optional" },
      { id: "c11", code: "EL202", name: "Public Speaking", ects: 3, type: "optional" },
    ],
  },
  {
    id: "sem-1-6",
    studentId: "1",
    number: 6,
    academicYear: "2023/2024",
    label: "Summer 2023/2024",
    status: "STARTED",
    signaturesAcquired: 2,
    signaturesTotal: 5,
    isEmpty: false,
    quota: "Reduced (24 ECTS)",
    studentServicesNote: "Pending verification of language certificate.",
    studentNote: "Doing internship in parallel.",
    price: 1300,
    paidToFaculty: 600,
    paidToUniversity: 300,
    createdAt: "2024-02-12",
    lastChangedAt: "2024-04-22",
    verified: false,
    validated: false,
    courses: [
      { id: "c20", code: "CS401", name: "Operating Systems", ects: 7, type: "mandatory" },
      { id: "c21", code: "CS402", name: "Databases", ects: 6, type: "mandatory" },
      { id: "c22", code: "CS403", name: "Software Engineering", ects: 6, type: "mandatory" },
      { id: "c23", code: "EL401", name: "Machine Learning Basics", ects: 5, type: "optional" },
      { id: "c24", code: "EL402", name: "Cloud Computing", ects: 5, type: "optional" },
    ],
  },
  {
    id: "sem-1-7",
    studentId: "1",
    number: 7,
    academicYear: "2024/2025",
    label: "Winter 2024/2025",
    status: "NOT STARTED",
    signaturesAcquired: 0,
    signaturesTotal: 0,
    isEmpty: true,
    quota: "—",
    studentServicesNote: "Empty semester (suspended enrollment).",
    studentNote: "Taking a break for civil service.",
    price: 0,
    paidToFaculty: 0,
    paidToUniversity: 0,
    createdAt: "2024-09-01",
    lastChangedAt: "2024-09-01",
    verified: false,
    validated: false,
    courses: [],
  },
];

// Catalog of subjects the student could enroll in for a new semester.
export interface AvailableSubject {
  id: string;
  code: string;
  name: string;
  ects: number;
  type: "mandatory" | "optional";
  alreadyEnrolled?: boolean;
}

export const availableSubjectsForNextSemester: AvailableSubject[] = [
  { id: "n1", code: "CS501", name: "Distributed Systems", ects: 7, type: "mandatory" },
  { id: "n2", code: "CS502", name: "Computer Networks", ects: 6, type: "mandatory", alreadyEnrolled: true },
  { id: "n3", code: "CS503", name: "Information Security", ects: 6, type: "mandatory" },
  { id: "n4", code: "EL501", name: "Deep Learning", ects: 5, type: "optional" },
  { id: "n5", code: "EL502", name: "Mobile Development", ects: 5, type: "optional" },
  { id: "n6", code: "EL503", name: "Game Development", ects: 4, type: "optional" },
  { id: "n7", code: "EL504", name: "Computer Vision", ects: 5, type: "optional" },
  { id: "n8", code: "EL505", name: "Blockchain Fundamentals", ects: 4, type: "optional" },
];

export function getStudentSemesters(studentId: string) {
  return studentSemesters.filter((s) => s.studentId === studentId);
}

export function getStudentSemester(studentId: string, semesterId: string) {
  return studentSemesters.find((s) => s.studentId === studentId && s.id === semesterId);
}
