// Mock data for the Equivalence module.
// Equivalence = mapping a student's previously passed exams to slots
// in a NEW study programme they want to transfer into.

export type EquivalenceStatus =
  | "REQUESTED"
  | "GRADES_IMPORTED"
  | "EQUIVALENCE_DONE"
  | "PENDING_COMMENT"
  | "FINISHED"
  | "CANCELLED"
  | "IKNOW_IMPORTED"
  | "ARCHIVED";

export const EQUIVALENCE_STATUS_LABEL: Record<EquivalenceStatus, string> = {
  REQUESTED: "Requested",
  GRADES_IMPORTED: "Grades Imported",
  EQUIVALENCE_DONE: "Equivalence Done",
  PENDING_COMMENT: "Pending Comment",
  FINISHED: "Finished",
  CANCELLED: "Cancelled",
  IKNOW_IMPORTED: "iKnow Imported",
  ARCHIVED: "Archived",
};

// Tone tokens map to existing semantic tokens via classes (see helper below)
export const EQUIVALENCE_STATUS_TONE: Record<
  EquivalenceStatus,
  "info" | "warning" | "success" | "muted" | "destructive"
> = {
  REQUESTED: "info",
  GRADES_IMPORTED: "info",
  EQUIVALENCE_DONE: "warning",
  PENDING_COMMENT: "warning",
  FINISHED: "success",
  CANCELLED: "destructive",
  IKNOW_IMPORTED: "muted",
  ARCHIVED: "muted",
};

export interface PassedExam {
  id: string;
  courseId: string;        // BaseCourse / Course id from origin programme
  courseCode: string;
  courseName: string;
  ects: number;
  grade: number;           // 6..10
  semester: number;        // semester it was taken in origin programme
  academicYear: string;    // e.g. "2023/2024"
  originProgrammeName: string;
}

export interface TargetSlot {
  id: string;
  semester: number;
  position: number;
  type: "mandatory" | "optional";
  courseCode?: string;
  courseName: string;      // for optional, the slot label e.g. "Elective"
  ects: number;
}

// Single passed exam can only be used in ONE slot.
// Multiple passed exams can be merged into ONE slot (n -> 1).
export interface SlotMapping {
  slotId: string;
  passedExamIds: string[]; // 0..n
  // Optional manual override; when undefined, computed grade = avg weighted by ECTS
  grade?: number;
  note?: string;
  confirmed?: boolean;     // user explicitly confirmed this slot
}

export interface EquivalenceRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentIndex: string;     // index number
  fromProgrammeId: string;
  fromProgrammeName: string;
  toProgrammeId: string;
  toProgrammeName: string;
  facultyName: string;
  status: EquivalenceStatus;
  requestedAt: string;      // ISO date
  updatedAt: string;
  comment?: string;
  passedExams: PassedExam[];
  targetSlots: TargetSlot[];
  mappings: SlotMapping[];
}

// ---- mock courses ----
const passedSet1: PassedExam[] = [
  { id: "pe1", courseId: "c-math1", courseCode: "MATH101", courseName: "Calculus I", ects: 6, grade: 9, semester: 1, academicYear: "2022/2023", originProgrammeName: "BSc Software Engineering" },
  { id: "pe2", courseId: "c-prog1", courseCode: "CS101", courseName: "Intro to Programming", ects: 6, grade: 10, semester: 1, academicYear: "2022/2023", originProgrammeName: "BSc Software Engineering" },
  { id: "pe3", courseId: "c-eng1", courseCode: "ENG101", courseName: "Technical English", ects: 3, grade: 8, semester: 1, academicYear: "2022/2023", originProgrammeName: "BSc Software Engineering" },
  { id: "pe4", courseId: "c-disc", courseCode: "MATH120", courseName: "Discrete Math", ects: 6, grade: 7, semester: 2, academicYear: "2022/2023", originProgrammeName: "BSc Software Engineering" },
  { id: "pe5", courseId: "c-oop", courseCode: "CS201", courseName: "Object Oriented Programming", ects: 6, grade: 9, semester: 2, academicYear: "2022/2023", originProgrammeName: "BSc Software Engineering" },
  { id: "pe6", courseId: "c-stat", courseCode: "MATH210", courseName: "Statistics Basics", ects: 4, grade: 8, semester: 2, academicYear: "2022/2023", originProgrammeName: "BSc Software Engineering" },
  { id: "pe7", courseId: "c-ds", courseCode: "CS210", courseName: "Data Structures", ects: 6, grade: 9, semester: 3, academicYear: "2023/2024", originProgrammeName: "BSc Software Engineering" },
  { id: "pe8", courseId: "c-db1", courseCode: "CS220", courseName: "Databases I", ects: 6, grade: 10, semester: 3, academicYear: "2023/2024", originProgrammeName: "BSc Software Engineering" },
  { id: "pe9", courseId: "c-web", courseCode: "CS230", courseName: "Web Development", ects: 5, grade: 8, semester: 3, academicYear: "2023/2024", originProgrammeName: "BSc Software Engineering" },
];

const targetSlots1: TargetSlot[] = [
  { id: "s1", semester: 1, position: 1, type: "mandatory", courseCode: "INF101", courseName: "Mathematical Foundations", ects: 6 },
  { id: "s2", semester: 1, position: 2, type: "mandatory", courseCode: "INF102", courseName: "Programming Fundamentals", ects: 6 },
  { id: "s3", semester: 1, position: 3, type: "mandatory", courseCode: "INF103", courseName: "Academic English", ects: 3 },
  { id: "s4", semester: 1, position: 4, type: "optional", courseName: "Elective Slot 1", ects: 5 },
  { id: "s5", semester: 2, position: 1, type: "mandatory", courseCode: "INF110", courseName: "Discrete Structures", ects: 6 },
  { id: "s6", semester: 2, position: 2, type: "mandatory", courseCode: "INF111", courseName: "Advanced Programming", ects: 6 },
  { id: "s7", semester: 2, position: 3, type: "mandatory", courseCode: "INF112", courseName: "Probability & Statistics", ects: 5 },
  { id: "s8", semester: 2, position: 4, type: "optional", courseName: "Elective Slot 2", ects: 5 },
  { id: "s9", semester: 3, position: 1, type: "mandatory", courseCode: "INF210", courseName: "Algorithms & Data Structures", ects: 6 },
  { id: "s10", semester: 3, position: 2, type: "mandatory", courseCode: "INF220", courseName: "Database Systems", ects: 6 },
  { id: "s11", semester: 3, position: 3, type: "mandatory", courseCode: "INF230", courseName: "Web Technologies", ects: 5 },
  { id: "s12", semester: 3, position: 4, type: "optional", courseName: "Elective Slot 3", ects: 5 },
];

// auto-mapping example for the first request
const autoMappings1: SlotMapping[] = [
  { slotId: "s1", passedExamIds: ["pe1"], confirmed: false },
  { slotId: "s2", passedExamIds: ["pe2"], confirmed: false },
  { slotId: "s3", passedExamIds: ["pe3"], confirmed: false },
  { slotId: "s5", passedExamIds: ["pe4"], confirmed: false },
  { slotId: "s6", passedExamIds: ["pe5"], confirmed: false },
  { slotId: "s7", passedExamIds: ["pe6"], confirmed: false },
  { slotId: "s9", passedExamIds: ["pe7"], confirmed: false },
  { slotId: "s10", passedExamIds: ["pe8"], confirmed: false },
  { slotId: "s11", passedExamIds: ["pe9"], confirmed: false },
];

export const EQUIVALENCE_REQUESTS: EquivalenceRequest[] = [
  {
    id: "eq-1001",
    studentId: "stu-1",
    studentName: "Marko Petrov",
    studentIndex: "201/2022",
    fromProgrammeId: "p-se",
    fromProgrammeName: "BSc Software Engineering",
    toProgrammeId: "p-inf",
    toProgrammeName: "BSc Informatics",
    facultyName: "Faculty of Computer Science",
    status: "EQUIVALENCE_DONE",
    requestedAt: "2026-04-12",
    updatedAt: "2026-04-28",
    passedExams: passedSet1,
    targetSlots: targetSlots1,
    mappings: autoMappings1,
  },
  {
    id: "eq-1002",
    studentId: "stu-2",
    studentName: "Ana Stojanova",
    studentIndex: "145/2023",
    fromProgrammeId: "p-mech",
    fromProgrammeName: "BSc Mechanical Engineering",
    toProgrammeId: "p-inf",
    toProgrammeName: "BSc Informatics",
    facultyName: "Faculty of Computer Science",
    status: "REQUESTED",
    requestedAt: "2026-04-29",
    updatedAt: "2026-04-29",
    passedExams: [],
    targetSlots: targetSlots1,
    mappings: [],
  },
  {
    id: "eq-1003",
    studentId: "stu-3",
    studentName: "Dimitar Nikolov",
    studentIndex: "088/2021",
    fromProgrammeId: "p-econ",
    fromProgrammeName: "BSc Economics",
    toProgrammeId: "p-inf",
    toProgrammeName: "BSc Informatics",
    facultyName: "Faculty of Computer Science",
    status: "GRADES_IMPORTED",
    requestedAt: "2026-04-22",
    updatedAt: "2026-04-25",
    passedExams: passedSet1.slice(0, 5),
    targetSlots: targetSlots1,
    mappings: [],
  },
  {
    id: "eq-1004",
    studentId: "stu-4",
    studentName: "Elena Trajkovska",
    studentIndex: "032/2022",
    fromProgrammeId: "p-math",
    fromProgrammeName: "BSc Mathematics",
    toProgrammeId: "p-inf",
    toProgrammeName: "BSc Informatics",
    facultyName: "Faculty of Computer Science",
    status: "PENDING_COMMENT",
    requestedAt: "2026-03-30",
    updatedAt: "2026-04-20",
    comment: "Awaiting confirmation from former faculty regarding Calculus II.",
    passedExams: passedSet1,
    targetSlots: targetSlots1,
    mappings: autoMappings1.slice(0, 6),
  },
  {
    id: "eq-1005",
    studentId: "stu-5",
    studentName: "Petar Jovanov",
    studentIndex: "012/2020",
    fromProgrammeId: "p-se",
    fromProgrammeName: "BSc Software Engineering",
    toProgrammeId: "p-inf",
    toProgrammeName: "BSc Informatics",
    facultyName: "Faculty of Computer Science",
    status: "FINISHED",
    requestedAt: "2026-02-10",
    updatedAt: "2026-03-05",
    passedExams: passedSet1,
    targetSlots: targetSlots1,
    mappings: autoMappings1.map((m) => ({ ...m, confirmed: true })),
  },
  {
    id: "eq-1006",
    studentId: "stu-6",
    studentName: "Ivana Kostova",
    studentIndex: "199/2023",
    fromProgrammeId: "p-bio",
    fromProgrammeName: "BSc Biology",
    toProgrammeId: "p-inf",
    toProgrammeName: "BSc Informatics",
    facultyName: "Faculty of Computer Science",
    status: "CANCELLED",
    requestedAt: "2026-01-15",
    updatedAt: "2026-01-20",
    passedExams: [],
    targetSlots: targetSlots1,
    mappings: [],
  },
  {
    id: "eq-1007",
    studentId: "stu-7",
    studentName: "Stefan Mitrev",
    studentIndex: "077/2021",
    fromProgrammeId: "p-se",
    fromProgrammeName: "BSc Software Engineering",
    toProgrammeId: "p-inf",
    toProgrammeName: "BSc Informatics",
    facultyName: "Faculty of Computer Science",
    status: "IKNOW_IMPORTED",
    requestedAt: "2025-11-12",
    updatedAt: "2025-12-01",
    passedExams: passedSet1,
    targetSlots: targetSlots1,
    mappings: autoMappings1.map((m) => ({ ...m, confirmed: true })),
  },
  {
    id: "eq-1008",
    studentId: "stu-8",
    studentName: "Tamara Ilieva",
    studentIndex: "044/2019",
    fromProgrammeId: "p-se",
    fromProgrammeName: "BSc Software Engineering",
    toProgrammeId: "p-inf",
    toProgrammeName: "BSc Informatics",
    facultyName: "Faculty of Computer Science",
    status: "ARCHIVED",
    requestedAt: "2024-09-01",
    updatedAt: "2024-10-15",
    passedExams: passedSet1,
    targetSlots: targetSlots1,
    mappings: autoMappings1.map((m) => ({ ...m, confirmed: true })),
  },
];

// Pipeline: which actions are available per status, and the resulting status.
export interface PipelineAction {
  id: string;
  label: string;
  toStatus: EquivalenceStatus;
  variant?: "default" | "secondary" | "outline" | "destructive";
  description?: string;
}

export function getPipelineActions(status: EquivalenceStatus): PipelineAction[] {
  switch (status) {
    case "REQUESTED":
      return [
        { id: "import", label: "Import Grades", toStatus: "GRADES_IMPORTED", variant: "default" },
        { id: "cancel", label: "Cancel", toStatus: "CANCELLED", variant: "destructive" },
      ];
    case "GRADES_IMPORTED":
      return [
        { id: "auto", label: "Run Auto-Equivalence", toStatus: "EQUIVALENCE_DONE", variant: "default" },
        { id: "cancel", label: "Cancel", toStatus: "CANCELLED", variant: "destructive" },
      ];
    case "EQUIVALENCE_DONE":
      return [
        { id: "comment", label: "Send for Comment", toStatus: "PENDING_COMMENT", variant: "secondary" },
        { id: "confirm", label: "Confirm Equivalence", toStatus: "FINISHED", variant: "default" },
        { id: "cancel", label: "Cancel", toStatus: "CANCELLED", variant: "destructive" },
      ];
    case "PENDING_COMMENT":
      return [
        { id: "confirm", label: "Confirm Equivalence", toStatus: "FINISHED", variant: "default" },
        { id: "back", label: "Back to Editing", toStatus: "EQUIVALENCE_DONE", variant: "outline" },
        { id: "cancel", label: "Cancel", toStatus: "CANCELLED", variant: "destructive" },
      ];
    case "FINISHED":
      return [
        { id: "iknow", label: "Mark Imported in iKnow", toStatus: "IKNOW_IMPORTED", variant: "default" },
        { id: "archive", label: "Archive", toStatus: "ARCHIVED", variant: "outline" },
      ];
    case "IKNOW_IMPORTED":
      return [{ id: "archive", label: "Archive", toStatus: "ARCHIVED", variant: "outline" }];
    case "CANCELLED":
    case "ARCHIVED":
      return [];
  }
}

export function computeMappedEcts(req: EquivalenceRequest): number {
  return req.mappings.reduce((sum, m) => {
    const slot = req.targetSlots.find((s) => s.id === m.slotId);
    if (!slot || m.passedExamIds.length === 0) return sum;
    return sum + slot.ects;
  }, 0);
}

export function totalSlotEcts(req: EquivalenceRequest): number {
  return req.targetSlots.reduce((s, x) => s + x.ects, 0);
}

export function computedGrade(req: EquivalenceRequest, mapping: SlotMapping): number | null {
  if (mapping.grade !== undefined) return mapping.grade;
  if (mapping.passedExamIds.length === 0) return null;
  const exams = mapping.passedExamIds
    .map((id) => req.passedExams.find((e) => e.id === id))
    .filter(Boolean) as PassedExam[];
  if (exams.length === 0) return null;
  const totalEcts = exams.reduce((s, e) => s + e.ects, 0);
  if (totalEcts === 0) return null;
  const weighted = exams.reduce((s, e) => s + e.grade * e.ects, 0);
  return Math.round((weighted / totalEcts) * 10) / 10;
}
