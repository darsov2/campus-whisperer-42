import { BookOpen, Users, Megaphone, FlaskConical } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────

export type ClassType = "lecture" | "auditory" | "laboratory";

export interface ClassTypeConfig {
  type: ClassType;
  label: string;
  icon: typeof BookOpen;
  color: string;
}

export const CLASS_TYPES: ClassTypeConfig[] = [
  { type: "lecture", label: "Lectures", icon: Megaphone, color: "bg-primary/10 text-primary" },
  { type: "auditory", label: "Auditory Ex.", icon: Users, color: "bg-accent/10 text-accent" },
  { type: "laboratory", label: "Laboratory Ex.", icon: FlaskConical, color: "bg-warning/20 text-warning" },
];

export type SemesterStatus = "preference_collection" | "allocation" | "finalized";

export interface Semester {
  id: string;
  name: string;
  status: SemesterStatus;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  faculty: string;
  classTypes: ClassType[];
  totalGroups: Record<ClassType, number>;
}

export interface TeacherPreference {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherTitle: string;
  courseId: string;
  willingEnglish: boolean;
  availableFromSemester: string;
  sharedLectures: boolean;
  onlineLectures: boolean;
  preferredTypes: ClassType[];
  submittedAt: string;
}

export interface AllocationEntry {
  id: string;
  teacherId: string;
  teacherName: string;
  courseId: string;
  classType: ClassType;
  groups: number;
  semesterId?: string;
}

export interface Teacher {
  id: string;
  name: string;
  title: string;
}

// ─── Helpers ─────────────────────────────────────────────────

export function getClassTypeConfig(type: ClassType): ClassTypeConfig {
  return CLASS_TYPES.find(ct => ct.type === type)!;
}

// ─── Mock Data ───────────────────────────────────────────────

export const semesters: Semester[] = [
  { id: "s1", name: "Winter 2025/26", status: "finalized" },
  { id: "s2", name: "Summer 2025/26", status: "allocation" },
  { id: "s3", name: "Winter 2026/27", status: "preference_collection" },
];

export const courses: Course[] = [
  { id: "c1", code: "CS101", name: "Intro to Programming", faculty: "Computer Science", classTypes: ["lecture", "auditory", "laboratory"], totalGroups: { lecture: 2, auditory: 4, laboratory: 6 } },
  { id: "c2", code: "CS201", name: "Data Structures", faculty: "Computer Science", classTypes: ["lecture", "auditory", "laboratory"], totalGroups: { lecture: 2, auditory: 3, laboratory: 4 } },
  { id: "c3", code: "CS301", name: "Algorithms", faculty: "Computer Science", classTypes: ["lecture", "auditory"], totalGroups: { lecture: 2, auditory: 4, laboratory: 0 } },
  { id: "c4", code: "MA101", name: "Calculus I", faculty: "Mathematics", classTypes: ["lecture", "auditory"], totalGroups: { lecture: 3, auditory: 6, laboratory: 0 } },
  { id: "c5", code: "MA201", name: "Linear Algebra", faculty: "Mathematics", classTypes: ["lecture", "auditory"], totalGroups: { lecture: 2, auditory: 4, laboratory: 0 } },
  { id: "c6", code: "PH101", name: "Physics I", faculty: "Physics", classTypes: ["lecture", "auditory", "laboratory"], totalGroups: { lecture: 2, auditory: 3, laboratory: 4 } },
];

export const teachers: Teacher[] = [
  { id: "t1", name: "Dr. John Smith", title: "Associate Professor" },
  { id: "t2", name: "Prof. Maria Garcia", title: "Full Professor" },
  { id: "t3", name: "Prof. Anna Johnson", title: "Full Professor" },
  { id: "t4", name: "Prof. David Lee", title: "Full Professor" },
  { id: "t5", name: "Dr. Sarah Chen", title: "Assistant Professor" },
  { id: "t6", name: "Dr. Michael Brown", title: "Senior Lecturer" },
  { id: "t7", name: "Dr. Emily Wilson", title: "Lecturer" },
  { id: "t8", name: "Dr. Robert Taylor", title: "Assistant Professor" },
];

export const initialPreferences: TeacherPreference[] = [
  { id: "p1", teacherId: "t1", teacherName: "Dr. John Smith", teacherTitle: "Associate Professor", courseId: "c1", willingEnglish: true, availableFromSemester: "s2", sharedLectures: false, onlineLectures: true, preferredTypes: ["lecture", "auditory"], submittedAt: "2025-09-15" },
  { id: "p2", teacherId: "t1", teacherName: "Dr. John Smith", teacherTitle: "Associate Professor", courseId: "c2", willingEnglish: true, availableFromSemester: "s2", sharedLectures: true, onlineLectures: false, preferredTypes: ["lecture"], submittedAt: "2025-09-15" },
  { id: "p3", teacherId: "t2", teacherName: "Prof. Maria Garcia", teacherTitle: "Full Professor", courseId: "c1", willingEnglish: false, availableFromSemester: "s2", sharedLectures: true, onlineLectures: false, preferredTypes: ["lecture"], submittedAt: "2025-09-14" },
  { id: "p4", teacherId: "t2", teacherName: "Prof. Maria Garcia", teacherTitle: "Full Professor", courseId: "c3", willingEnglish: true, availableFromSemester: "s3", sharedLectures: false, onlineLectures: true, preferredTypes: ["lecture", "auditory"], submittedAt: "2025-09-14" },
  { id: "p5", teacherId: "t3", teacherName: "Prof. Anna Johnson", teacherTitle: "Full Professor", courseId: "c4", willingEnglish: true, availableFromSemester: "s2", sharedLectures: true, onlineLectures: false, preferredTypes: ["lecture"], submittedAt: "2025-09-16" },
  { id: "p6", teacherId: "t4", teacherName: "Prof. David Lee", teacherTitle: "Full Professor", courseId: "c4", willingEnglish: false, availableFromSemester: "s2", sharedLectures: false, onlineLectures: false, preferredTypes: ["lecture", "auditory"], submittedAt: "2025-09-13" },
  { id: "p7", teacherId: "t5", teacherName: "Dr. Sarah Chen", teacherTitle: "Assistant Professor", courseId: "c1", willingEnglish: true, availableFromSemester: "s2", sharedLectures: false, onlineLectures: true, preferredTypes: ["laboratory", "auditory"], submittedAt: "2025-09-17" },
  { id: "p8", teacherId: "t5", teacherName: "Dr. Sarah Chen", teacherTitle: "Assistant Professor", courseId: "c6", willingEnglish: true, availableFromSemester: "s2", sharedLectures: false, onlineLectures: false, preferredTypes: ["laboratory"], submittedAt: "2025-09-17" },
  { id: "p9", teacherId: "t6", teacherName: "Dr. Michael Brown", teacherTitle: "Senior Lecturer", courseId: "c2", willingEnglish: false, availableFromSemester: "s2", sharedLectures: true, onlineLectures: false, preferredTypes: ["auditory", "laboratory"], submittedAt: "2025-09-12" },
  { id: "p10", teacherId: "t7", teacherName: "Dr. Emily Wilson", teacherTitle: "Lecturer", courseId: "c5", willingEnglish: true, availableFromSemester: "s2", sharedLectures: false, onlineLectures: true, preferredTypes: ["lecture", "auditory"], submittedAt: "2025-09-18" },
  { id: "p11", teacherId: "t8", teacherName: "Dr. Robert Taylor", teacherTitle: "Assistant Professor", courseId: "c3", willingEnglish: false, availableFromSemester: "s3", sharedLectures: true, onlineLectures: false, preferredTypes: ["auditory"], submittedAt: "2025-09-11" },
  { id: "p12", teacherId: "t8", teacherName: "Dr. Robert Taylor", teacherTitle: "Assistant Professor", courseId: "c6", willingEnglish: true, availableFromSemester: "s2", sharedLectures: false, onlineLectures: true, preferredTypes: ["auditory", "laboratory"], submittedAt: "2025-09-11" },
];

export const initialAllocations: AllocationEntry[] = [
  { id: "a1", teacherId: "t1", teacherName: "Dr. John Smith", courseId: "c1", classType: "lecture", groups: 1, semesterId: "s2" },
  { id: "a2", teacherId: "t1", teacherName: "Dr. John Smith", courseId: "c2", classType: "lecture", groups: 2, semesterId: "s2" },
  { id: "a3", teacherId: "t2", teacherName: "Prof. Maria Garcia", courseId: "c1", classType: "lecture", groups: 1, semesterId: "s2" },
  { id: "a4", teacherId: "t5", teacherName: "Dr. Sarah Chen", courseId: "c1", classType: "laboratory", groups: 3, semesterId: "s2" },
  { id: "a5", teacherId: "t5", teacherName: "Dr. Sarah Chen", courseId: "c1", classType: "auditory", groups: 2, semesterId: "s2" },
  { id: "a6", teacherId: "t3", teacherName: "Prof. Anna Johnson", courseId: "c4", classType: "lecture", groups: 2, semesterId: "s2" },
  { id: "a7", teacherId: "t4", teacherName: "Prof. David Lee", courseId: "c4", classType: "lecture", groups: 1, semesterId: "s2" },
  { id: "a8", teacherId: "t4", teacherName: "Prof. David Lee", courseId: "c4", classType: "auditory", groups: 3, semesterId: "s2" },
  { id: "a9", teacherId: "t6", teacherName: "Dr. Michael Brown", courseId: "c2", classType: "auditory", groups: 2, semesterId: "s2" },
  { id: "a10", teacherId: "t6", teacherName: "Dr. Michael Brown", courseId: "c2", classType: "laboratory", groups: 3, semesterId: "s2" },
  { id: "a11", teacherId: "t7", teacherName: "Dr. Emily Wilson", courseId: "c5", classType: "lecture", groups: 2, semesterId: "s2" },
  { id: "a12", teacherId: "t7", teacherName: "Dr. Emily Wilson", courseId: "c5", classType: "auditory", groups: 2, semesterId: "s2" },
];

// Previous semester allocations (Winter 2025/26 - finalized)
export const previousAllocations: AllocationEntry[] = [
  { id: "pa1", teacherId: "t1", teacherName: "Dr. John Smith", courseId: "c1", classType: "lecture", groups: 2, semesterId: "s1" },
  { id: "pa2", teacherId: "t2", teacherName: "Prof. Maria Garcia", courseId: "c1", classType: "lecture", groups: 1, semesterId: "s1" },
  { id: "pa3", teacherId: "t5", teacherName: "Dr. Sarah Chen", courseId: "c1", classType: "laboratory", groups: 4, semesterId: "s1" },
  { id: "pa4", teacherId: "t5", teacherName: "Dr. Sarah Chen", courseId: "c1", classType: "auditory", groups: 2, semesterId: "s1" },
  { id: "pa5", teacherId: "t1", teacherName: "Dr. John Smith", courseId: "c2", classType: "lecture", groups: 1, semesterId: "s1" },
  { id: "pa6", teacherId: "t6", teacherName: "Dr. Michael Brown", courseId: "c2", classType: "auditory", groups: 3, semesterId: "s1" },
  { id: "pa7", teacherId: "t6", teacherName: "Dr. Michael Brown", courseId: "c2", classType: "laboratory", groups: 2, semesterId: "s1" },
  { id: "pa8", teacherId: "t3", teacherName: "Prof. Anna Johnson", courseId: "c4", classType: "lecture", groups: 3, semesterId: "s1" },
  { id: "pa9", teacherId: "t4", teacherName: "Prof. David Lee", courseId: "c4", classType: "auditory", groups: 4, semesterId: "s1" },
  { id: "pa10", teacherId: "t7", teacherName: "Dr. Emily Wilson", courseId: "c5", classType: "lecture", groups: 2, semesterId: "s1" },
  { id: "pa11", teacherId: "t7", teacherName: "Dr. Emily Wilson", courseId: "c5", classType: "auditory", groups: 3, semesterId: "s1" },
  { id: "pa12", teacherId: "t8", teacherName: "Dr. Robert Taylor", courseId: "c3", classType: "auditory", groups: 2, semesterId: "s1" },
  { id: "pa13", teacherId: "t2", teacherName: "Prof. Maria Garcia", courseId: "c3", classType: "lecture", groups: 2, semesterId: "s1" },
  { id: "pa14", teacherId: "t8", teacherName: "Dr. Robert Taylor", courseId: "c6", classType: "laboratory", groups: 3, semesterId: "s1" },
  { id: "pa15", teacherId: "t5", teacherName: "Dr. Sarah Chen", courseId: "c6", classType: "laboratory", groups: 2, semesterId: "s1" },
];
