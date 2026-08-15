// Mock data for the Student Portal "Subject Enrolment" experience.
// Programme slots exist here only to drive grouping/eligibility — they are never
// surfaced to the student as technical entities.

export const MAX_SEMESTER_ECTS = 40;

export interface RequirementCheck {
  label: string;
  fulfilled: boolean;
  detail?: string;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  ects: number;
  /** Plain-language eligibility checks derived from the subject's rule tree. */
  requirements: RequirementCheck[];
}

export const isEligible = (s: Subject) => s.requirements.every((r) => r.fulfilled);

export type SlotKind = "reenrolled" | "mandatory" | "elective";

export interface EnrolmentSlot {
  id: string;
  kind: SlotKind;
  /** Student-facing requirement title, e.g. "Software Engineering Elective". */
  title: string;
  /** For elective slots: subjects belonging to this requirement's group. */
  groupSubjects?: Subject[];
  /** Pre-filled subject for re-enrolled / mandatory slots. */
  subject?: Subject;
  /** Mandatory subject the student cannot take yet. */
  blocked?: boolean;
  /** Failed subject where the professor hasn't entered the final grade yet. */
  gradePending?: boolean;
}

/* ---------------------------------- subjects --------------------------------- */

const ok = (label: string): RequirementCheck => ({ label, fulfilled: true });

export const databases: Subject = {
  id: "sub-db",
  code: "FINKI-DB",
  name: "Databases",
  ects: 6,
  requirements: [ok("Programming I completed")],
};

const operatingSystems: Subject = {
  id: "sub-os",
  code: "FINKI-OS",
  name: "Operating Systems",
  ects: 6,
  requirements: [ok("Computer Architecture completed")],
};

const softwareArchitecture: Subject = {
  id: "sub-sa",
  code: "FINKI-SA",
  name: "Software Architecture",
  ects: 6,
  requirements: [ok("Object Oriented Programming completed"), ok("Software Engineering completed")],
};

const webProgramming: Subject = {
  id: "sub-wp",
  code: "FINKI-WP",
  name: "Web Programming",
  ects: 6,
  requirements: [ok("Programming II completed")],
};

const advancedAlgorithms: Subject = {
  id: "sub-aa",
  code: "FINKI-AA",
  name: "Advanced Algorithms",
  ects: 6,
  requirements: [
    ok("Algorithms I completed"),
    ok("Programming II completed"),
    {
      label: "Minimum 120 accumulated ECTS required",
      fulfilled: false,
      detail: "Current: 114 ECTS",
    },
  ],
};

/* ------------------------------ elective groups ------------------------------ */

const softwareEngineeringGroup: Subject[] = [
  {
    id: "sub-ds",
    code: "FINKI-DS",
    name: "Distributed Systems",
    ects: 6,
    requirements: [ok("Operating Systems completed"), ok("Computer Networks completed")],
  },
  {
    id: "sub-cc",
    code: "FINKI-CC",
    name: "Cloud Computing",
    ects: 6,
    requirements: [ok("Computer Networks completed")],
  },
  {
    id: "sub-mob",
    code: "FINKI-MOB",
    name: "Mobile Application Development",
    ects: 6,
    requirements: [ok("Programming II completed")],
  },
  {
    id: "sub-ai",
    code: "FINKI-AI",
    name: "Artificial Intelligence",
    ects: 6,
    requirements: [{ label: "Algorithms II completed", fulfilled: false, detail: "Not completed" }],
  },
];

const informationSystemsGroup: Subject[] = [
  {
    id: "sub-bi",
    code: "FINKI-BI",
    name: "Business Intelligence",
    ects: 6,
    requirements: [ok("Databases completed"), ok("Statistics completed")],
  },
  {
    id: "sub-erp",
    code: "FINKI-ERP",
    name: "Enterprise Information Systems",
    ects: 6,
    requirements: [ok("Information Systems Analysis completed")],
  },
  {
    id: "sub-ux",
    code: "FINKI-UX",
    name: "Human–Computer Interaction",
    ects: 4,
    requirements: [ok("Web Programming enrolled")],
  },
  {
    id: "sub-sec",
    code: "FINKI-SEC",
    name: "Information Security",
    ects: 8,
    requirements: [
      { label: "Discrete Mathematics completed", fulfilled: false, detail: "Exam not passed" },
    ],
  },
];

/* -------------------------------- programme ---------------------------------- */

export const enrolmentSlots: EnrolmentSlot[] = [
  {
    id: "slot-re-1",
    kind: "reenrolled",
    title: "Repeated mandatory subject",
    subject: databases,
  },
  {
    id: "slot-re-2",
    kind: "reenrolled",
    title: "Repeated mandatory subject",
    subject: operatingSystems,
    gradePending: true,
  },
  { id: "slot-m-1", kind: "mandatory", title: "Mandatory subject", subject: softwareArchitecture },
  { id: "slot-m-2", kind: "mandatory", title: "Mandatory subject", subject: webProgramming },
  {
    id: "slot-m-3",
    kind: "mandatory",
    title: "Mandatory subject",
    subject: advancedAlgorithms,
    blocked: true,
  },
  {
    id: "slot-e-1",
    kind: "elective",
    title: "Software Engineering Elective",
    groupSubjects: softwareEngineeringGroup,
  },
  {
    id: "slot-e-2",
    kind: "elective",
    title: "Information Systems Elective",
    groupSubjects: informationSystemsGroup,
  },
];

/** Subjects offered as replacements for a re-enrolment waiting on a grade. */
export const replacementSubjects: Subject[] = [
  {
    id: "sub-cc-rep",
    code: "FINKI-CC",
    name: "Cloud Computing",
    ects: 6,
    requirements: [ok("Computer Networks completed")],
  },
  {
    id: "sub-devops",
    code: "FINKI-DEV",
    name: "DevOps and Continuous Delivery",
    ects: 6,
    requirements: [ok("Software Engineering completed")],
  },
  {
    id: "sub-ip",
    code: "FINKI-IP",
    name: "Internet Programming",
    ects: 6,
    requirements: [ok("Programming II completed")],
  },
];

/** Subjects from other programme slots the student may add on top. */
export const additionalSubjects: Subject[] = [
  {
    id: "sub-ml",
    code: "FINKI-ML",
    name: "Machine Learning",
    ects: 6,
    requirements: [ok("Linear Algebra completed"), ok("Statistics completed")],
  },
  {
    id: "sub-nlp",
    code: "FINKI-NLP",
    name: "Natural Language Processing",
    ects: 6,
    requirements: [ok("Statistics completed")],
  },
  {
    id: "sub-emb",
    code: "FINKI-EMB",
    name: "Embedded Systems",
    ects: 8,
    requirements: [ok("Computer Architecture completed")],
  },
  {
    id: "sub-qc",
    code: "FINKI-QC",
    name: "Quantum Computing",
    ects: 6,
    requirements: [
      { label: "Advanced Algorithms completed", fulfilled: false, detail: "Not completed" },
    ],
  },
];

export const enrolmentContext = {
  studentName: "Aleksandar Petrov",
  programme: "Software Engineering and Information Systems",
  semesterNumber: 5,
  semesterLabel: "Winter Semester 2026/27",
  gpa: 8.72,
  lowGpa: 7.24,
  gpaThreshold: 8.5,
};
