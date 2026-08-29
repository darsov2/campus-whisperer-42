export type ThesisStatus = "draft" | "applied" | "in-progress" | "submitted" | "defended" | "discarded";

export interface DiplomaFee {
  id: string;
  label: string;
  description: string;
  amount: number;
  currency: string;
  paid: boolean;
}

// Placeholder fees — to be linked to the backend payment module.
export function getDiplomaFees(studentId: string): DiplomaFee[] {
  return [
    {
      id: "diploma-pack",
      label: "Diploma pack",
      description: "Printed diploma, cover and diploma supplement",
      amount: 45,
      currency: "EUR",
      paid: false,
    },
    {
      id: "diploma-document",
      label: "Diploma document",
      description: "Official certified copy of the diploma document",
      amount: 15,
      currency: "EUR",
      paid: false,
    },
  ];
}

export interface DiplomaThesis {
  thesisNo: string;
  name: string;
  description?: string;
  mentor: string;
  member1?: string;
  member2?: string;
  credits: number;
  grade?: number;
  applicationDate: string;
  submissionDate?: string;
  presentationDate?: string;
  discarded: boolean;
  supplementNo?: string;
  supplementDate?: string;
  masterDiplomaBookNo?: string;
  isSentForPrint?: boolean;
}

export function getThesisStatus(t: DiplomaThesis): ThesisStatus {
  if (t.discarded) return "discarded";
  if (t.presentationDate) return "defended";
  if (t.submissionDate) return "submitted";
  if (t.applicationDate) return "in-progress";
  return "draft";
}

export const diplomaTheses: Record<string, DiplomaThesis> = {
  "1": {
    thesisNo: "DT-2024-0142",
    name: "Machine Learning Approaches for Predicting Student Dropout in Higher Education",
    description:
      "This thesis explores supervised machine learning techniques — logistic regression, random forests and gradient boosting — applied to anonymised academic records to identify students at risk of dropping out. The study evaluates model performance on historical cohorts and proposes an early-warning dashboard for academic advisors.",
    mentor: "Prof. Dr. Elena Petrova",
    member1: "Assoc. Prof. Dr. Marko Stojanov",
    member2: "Asst. Prof. Dr. Ana Dimitrova",
    credits: 8,
    grade: 9,
    applicationDate: "2024-02-12",
    submissionDate: "2024-05-30",
    presentationDate: "2024-06-18",
    discarded: false,
    supplementNo: "SUP-2024-038",
    supplementDate: "2024-06-20",
    masterDiplomaBookNo: "MDB-2024-0517",
    isSentForPrint: true,
  },
  "2": {
    thesisNo: "DT-2024-0155",
    name: "Distributed Consensus Algorithms in Edge Computing Environments",
    description:
      "An analysis of Raft and Paxos variants adapted for latency-constrained edge networks, with a simulation-based evaluation of throughput and fault tolerance.",
    mentor: "Prof. Dr. Elena Petrova",
    member1: "Assoc. Prof. Dr. Ivan Kolev",
    member2: "Asst. Prof. Dr. Sara Novak",
    credits: 8,
    applicationDate: "2024-03-04",
    discarded: false,
    isSentForPrint: false,
  },
  "3": {
    thesisNo: "DT-2025-0007",
    name: "Stochastic Models for Queueing Systems in Public Transport",
    mentor: "Prof. Dr. Georgi Andonov",
    member1: "Assoc. Prof. Dr. Viktor Hristov",
    credits: 8,
    applicationDate: "2025-01-20",
    submissionDate: "2025-04-10",
    discarded: true,
  },
};

export function getDiplomaThesis(studentId: string): DiplomaThesis | undefined {
  return diplomaTheses[studentId];
}
