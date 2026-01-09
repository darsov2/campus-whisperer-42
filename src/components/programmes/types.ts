import type { Programme } from "@/components/dialogs/ProgrammeDialog";
import type { ProgrammeCourse, ProgrammeCourseRules } from "@/components/dialogs/ProgrammeCourseDialog";

// Course Groups - for grouping courses that can fill optional slots
export interface CourseGroup {
  id: string;
  name: string;
  code: string;
  description?: string;
  courseIds: string[]; // Courses in this group
}

// Slot types
export type SlotType = "mandatory" | "optional";

// Rule for optional slots - defines which courses can fill the slot
export interface SlotRule {
  id: string;
  type: "course_group" | "min_ects" | "max_ects" | "semester_range" | "course_list";
  value: string;
  label: string;
}

// A single slot in a programme
export interface ProgrammeSlot {
  id: string;
  semester: number;
  position: number; // Order within the semester
  type: SlotType;
  // For mandatory slots
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  ects?: number;
  // For optional slots
  name?: string; // e.g., "Humanities Elective"
  rules?: SlotRule[];
  minEcts?: number;
  maxEcts?: number;
}

// Extended programme with courses, groups and slots
export interface ProgrammeWithDetails extends Programme {
  courses: ProgrammeCourse[];
  slots: ProgrammeSlot[];
  totalSlots?: number;
}

// Helper to create empty rules
export function createEmptySlotRules(): SlotRule[] {
  return [];
}

export type { Programme, ProgrammeCourse, ProgrammeCourseRules };
