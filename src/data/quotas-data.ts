export type QuotaApplies = "regular" | "irregular" | "both";

export interface Quota {
  id: string;
  name: string;
  code: string;
  description?: string;
  appliesTo: QuotaApplies;
  isActive: boolean;
}

export interface StudyProgrammeLite {
  id: string;
  name: string;
  code: string;
  faculty: string;
  totalEcts: number; // per academic year
}

export interface QuotaPrice {
  id: string;
  quotaId: string;
  programmeId: string;
  pricePerEcts: number;
  yearlyPrice: number;
  currency: string;
}

// ---- Mock data ----

const quotaSeeds: Array<Omit<Quota, "id" | "isActive">> = [
  { name: "State-funded", code: "STATE", appliesTo: "regular", description: "Government-funded enrollment" },
  { name: "Self-funded", code: "SELF", appliesTo: "both", description: "Student pays full tuition" },
  { name: "Co-financed", code: "COFIN", appliesTo: "regular" },
  { name: "EU Scholarship", code: "EU-SCH", appliesTo: "regular" },
  { name: "International (non-EU)", code: "INT", appliesTo: "both" },
  { name: "Erasmus+ Incoming", code: "ERAS-IN", appliesTo: "regular" },
  { name: "Bilateral Exchange", code: "BILAT", appliesTo: "regular" },
  { name: "Partner University", code: "PARTNER", appliesTo: "both" },
  { name: "Employee Discount", code: "EMP", appliesTo: "both" },
  { name: "Alumni Rate", code: "ALUM", appliesTo: "both" },
  { name: "Government Scholarship A", code: "GOV-A", appliesTo: "regular" },
  { name: "Government Scholarship B", code: "GOV-B", appliesTo: "regular" },
  { name: "Merit Scholarship", code: "MERIT", appliesTo: "both" },
  { name: "Sport Talent", code: "SPORT", appliesTo: "both" },
  { name: "Disability Support", code: "DSAB", appliesTo: "both" },
  { name: "Minority Support", code: "MIN", appliesTo: "regular" },
  { name: "Refugee Programme", code: "REF", appliesTo: "both" },
  { name: "Industry Sponsored", code: "IND", appliesTo: "irregular" },
  { name: "Corporate Partnership", code: "CORP", appliesTo: "both" },
  { name: "Re-enrollment", code: "RE-ENR", appliesTo: "irregular" },
  { name: "Part-time Studies", code: "PT", appliesTo: "irregular" },
  { name: "Distance Learning", code: "DIST", appliesTo: "both" },
  { name: "Summer Programme", code: "SUM", appliesTo: "irregular" },
  { name: "Module-only", code: "MOD", appliesTo: "irregular" },
  { name: "PhD Track", code: "PHD", appliesTo: "regular" },
  { name: "Visiting Student", code: "VIS", appliesTo: "irregular" },
  { name: "Dual Degree", code: "DUAL", appliesTo: "regular" },
  { name: "Veteran Support", code: "VET", appliesTo: "both" },
];

export const mockQuotas: Quota[] = quotaSeeds.map((q, i) => ({
  id: `q${i + 1}`,
  isActive: true,
  ...q,
}));

export const mockProgrammes: StudyProgrammeLite[] = [
  { id: "p1", name: "Computer Science (BSc)", code: "CS-BSc", faculty: "FCSE", totalEcts: 60 },
  { id: "p2", name: "Computer Science (MSc)", code: "CS-MSc", faculty: "FCSE", totalEcts: 60 },
  { id: "p3", name: "Software Engineering", code: "SE-BSc", faculty: "FCSE", totalEcts: 60 },
  { id: "p4", name: "Information Systems", code: "IS-BSc", faculty: "FCSE", totalEcts: 60 },
  { id: "p5", name: "Data Science (MSc)", code: "DS-MSc", faculty: "FCSE", totalEcts: 60 },
  { id: "p6", name: "Electrical Engineering", code: "EE-BSc", faculty: "FEIT", totalEcts: 60 },
  { id: "p7", name: "Mechanical Engineering", code: "ME-BSc", faculty: "FME", totalEcts: 60 },
  { id: "p8", name: "Business Administration", code: "BA-BSc", faculty: "FEB", totalEcts: 60 },
  { id: "p9", name: "Architecture", code: "ARCH-BSc", faculty: "FArch", totalEcts: 60 },
  { id: "p10", name: "Law (LLB)", code: "LAW-BSc", faculty: "FLaw", totalEcts: 60 },
];

// Generate prices for a subset of (programme, quota) combinations
function seedPrices(): QuotaPrice[] {
  const out: QuotaPrice[] = [];
  let id = 1;
  mockProgrammes.forEach((p, pi) => {
    mockQuotas.forEach((q, qi) => {
      // ~55% coverage
      if ((pi * 7 + qi * 3) % 9 < 5) {
        const base = 30 + ((qi * 13 + pi * 5) % 150);
        const perEcts = base;
        const yearly = perEcts * p.totalEcts;
        out.push({
          id: `qp${id++}`,
          quotaId: q.id,
          programmeId: p.id,
          pricePerEcts: perEcts,
          yearlyPrice: yearly,
          currency: "EUR",
        });
      }
    });
  });
  return out;
}

export const mockQuotaPrices: QuotaPrice[] = seedPrices();

export function formatEUR(n: number) {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

export const appliesToLabel: Record<QuotaApplies, string> = {
  regular: "Regular",
  irregular: "Irregular",
  both: "Both",
};
