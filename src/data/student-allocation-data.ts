// ─── Student allocation mock data ────────────────────────────

export interface AllocStudent {
  id: string;
  index: string;
  firstName: string;
  lastName: string;
  programme: string;
  year: number;
}

export interface AllocGroup {
  id: string;
  name: string;
  year: string;
}

export interface AllocCourseGroup {
  id: string;
  course: string;
  name: string;
}

export interface AllocTeacher {
  id: string;
  name: string;
  title: string;
}

const firstNames = [
  "Aleksandar", "Ana", "Boris", "Bojana", "Cvetan", "Dragan", "Elena", "Filip",
  "Goran", "Hristina", "Igor", "Jasmina", "Kiril", "Ljubica", "Marko", "Nina",
  "Ognen", "Petar", "Ruzica", "Stefan", "Tamara", "Ubavka", "Viktor", "Zoran",
  "Andrej", "Bisera", "Damjan", "Emilija", "Frosina", "Goce",
];

const lastNames = [
  "Aleksov", "Andreeva", "Borisov", "Bogdanova", "Cvetkov", "Dimitrov", "Efremova",
  "Filipov", "Georgiev", "Hadzieva", "Ilievski", "Jovanova", "Kostov", "Lazarova",
  "Markovski", "Nikolov", "Ordanoski", "Petrovski", "Ristova", "Stojanov",
  "Todorova", "Uzunov", "Velkovski", "Zdravkova", "Angelov", "Bozinova",
  "Damjanov", "Eftimova", "Frckovski", "Gjorgjiev",
];

const programmes = ["Computer Science", "Mathematics", "Physics"];

export const allocStudents: AllocStudent[] = Array.from({ length: 60 }, (_, i) => {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i * 7 + 3) % lastNames.length];
  return {
    id: `st-${i + 1}`,
    index: String(221001 + i),
    firstName: fn,
    lastName: ln,
    programme: programmes[i % programmes.length],
    year: (i % 4) + 1,
  };
});

export const allocGroups: AllocGroup[] = [
  { id: "g1", name: "Group A", year: "2026" },
  { id: "g2", name: "Group B", year: "2026" },
  { id: "g3", name: "Group C", year: "2026" },
  { id: "g4", name: "Group A", year: "2025" },
];

export const allocCourseGroups: AllocCourseGroup[] = [
  { id: "cg1", course: "Programming", name: "Group 1" },
  { id: "cg2", course: "Programming", name: "Group 2" },
  { id: "cg3", course: "Databases", name: "Group 1" },
  { id: "cg4", course: "Algorithms", name: "Lab Group A" },
];

export const allocTeachers: AllocTeacher[] = [
  { id: "at1", name: "Professor Aleksov", title: "Full Professor" },
  { id: "at2", name: "Professor Andreeva", title: "Associate Professor" },
  { id: "at3", name: "Professor Petrovski", title: "Assistant Professor" },
  { id: "at4", name: "Professor Nikolova", title: "Senior Lecturer" },
];

// ─── Rules ───────────────────────────────────────────────────

export type StudentProperty = "lastName" | "firstName" | "index";

export const PROPERTY_LABELS: Record<StudentProperty, string> = {
  lastName: "Last Name",
  firstName: "First Name",
  index: "Index",
};

export interface SelectionRule {
  id: string;
  property: StudentProperty;
  from: string;
  to: string;
}

function normalize(v: string) {
  return v.trim().toLocaleLowerCase();
}

export function matchesRule(student: AllocStudent, rule: SelectionRule): boolean {
  const from = normalize(rule.from);
  const to = normalize(rule.to);

  if (rule.property === "index") {
    const value = Number(student.index);
    const lo = from ? Number(from) : -Infinity;
    const hi = to ? Number(to) : Infinity;
    if (Number.isNaN(value)) return false;
    return value >= lo && value <= hi;
  }

  const value = normalize(
    rule.property === "lastName" ? student.lastName : student.firstName
  );
  // Prefix-range comparison: "A" → "S" includes everything starting up to "s..."
  const okFrom = !from || value.slice(0, from.length) >= from || value > from;
  const okTo = !to || value.slice(0, to.length) <= to || value < to;
  return okFrom && okTo;
}

export function studentsMatchingRules(
  students: AllocStudent[],
  rules: SelectionRule[]
): AllocStudent[] {
  if (rules.length === 0) return [];
  return students.filter((s) => rules.some((r) => matchesRule(s, r)));
}

export function describeRule(rule: SelectionRule) {
  return `${PROPERTY_LABELS[rule.property]}: ${rule.from || "…"} → ${rule.to || "…"}`;
}

/** Even split with remainder distributed to the first teachers. */
export function autoDistribute(total: number, buckets: number): number[] {
  if (buckets <= 0) return [];
  const base = Math.floor(total / buckets);
  const rest = total % buckets;
  return Array.from({ length: buckets }, (_, i) => base + (i < rest ? 1 : 0));
}
