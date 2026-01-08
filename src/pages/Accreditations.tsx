import { 
  FileCheck, 
  Plus, 
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface Accreditation {
  id: string;
  programmeName: string;
  programmeCode: string;
  faculty: string;
  agency: string;
  validFrom: string;
  validUntil: string;
  status: "valid" | "expiring" | "expired" | "pending";
  documents: number;
}

const accreditations: Accreditation[] = [
  {
    id: "1",
    programmeName: "Computer Science BSc",
    programmeCode: "CS-BSC",
    faculty: "Faculty of Computer Science",
    agency: "National Accreditation Agency",
    validFrom: "2022-10-01",
    validUntil: "2027-09-30",
    status: "valid",
    documents: 12,
  },
  {
    id: "2",
    programmeName: "Computer Science MSc",
    programmeCode: "CS-MSC",
    faculty: "Faculty of Computer Science",
    agency: "National Accreditation Agency",
    validFrom: "2021-10-01",
    validUntil: "2026-09-30",
    status: "valid",
    documents: 8,
  },
  {
    id: "3",
    programmeName: "Mechanical Engineering BSc",
    programmeCode: "ME-BSC",
    faculty: "Faculty of Engineering",
    agency: "Engineering Board",
    validFrom: "2020-10-01",
    validUntil: "2025-09-30",
    status: "expiring",
    documents: 15,
  },
  {
    id: "4",
    programmeName: "Data Science MSc",
    programmeCode: "DS-MSC",
    faculty: "Faculty of Computer Science",
    agency: "National Accreditation Agency",
    validFrom: "",
    validUntil: "",
    status: "pending",
    documents: 3,
  },
];

function getTimeRemaining(validUntil: string): { months: number; percentage: number } {
  if (!validUntil) return { months: 0, percentage: 0 };
  const end = new Date(validUntil);
  const now = new Date();
  const start = new Date(end);
  start.setFullYear(start.getFullYear() - 5);
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  const remaining = Math.max(0, end.getTime() - now.getTime());
  
  const months = Math.ceil(remaining / (30 * 24 * 60 * 60 * 1000));
  const percentage = Math.max(0, Math.min(100, (elapsed / totalDuration) * 100));
  
  return { months, percentage };
}

const statusConfig = {
  valid: { icon: CheckCircle2, color: "text-success", bg: "bg-success/10", label: "Valid" },
  expiring: { icon: AlertTriangle, color: "text-warning", bg: "bg-warning/10", label: "Expiring Soon" },
  expired: { icon: Clock, color: "text-destructive", bg: "bg-destructive/10", label: "Expired" },
  pending: { icon: Clock, color: "text-info", bg: "bg-info/10", label: "Pending" },
};

function AccreditationCard({ accreditation }: { accreditation: Accreditation }) {
  const config = statusConfig[accreditation.status];
  const StatusIcon = config.icon;
  const timeRemaining = getTimeRemaining(accreditation.validUntil);

  return (
    <div className="data-card p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-lg", config.bg)}>
            <FileCheck className={cn("h-5 w-5", config.color)} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-semibold">{accreditation.programmeName}</h3>
              <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                {accreditation.programmeCode}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">{accreditation.faculty}</p>
          </div>
        </div>
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", config.bg, config.color)}>
          <StatusIcon className="h-3.5 w-3.5" />
          {config.label}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Accreditation Agency</span>
          <span className="font-medium">{accreditation.agency}</span>
        </div>

        {accreditation.status !== "pending" && (
          <>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Valid Period</span>
              <span className="font-medium">{accreditation.validFrom} – {accreditation.validUntil}</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Time Elapsed</span>
                <span className={cn("font-medium", 
                  timeRemaining.months < 12 && "text-warning",
                  timeRemaining.months < 6 && "text-destructive"
                )}>
                  {timeRemaining.months} months remaining
                </span>
              </div>
              <Progress 
                value={timeRemaining.percentage} 
                className={cn(
                  "h-2",
                  timeRemaining.percentage > 80 && "[&>div]:bg-warning",
                  timeRemaining.percentage > 90 && "[&>div]:bg-destructive"
                )}
              />
            </div>
          </>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Documents</span>
          <span className="font-medium">{accreditation.documents} files</span>
        </div>
      </div>

      <div className="flex gap-2 mt-4 pt-4 border-t">
        <Button variant="outline" size="sm" className="flex-1">
          View Documents
        </Button>
        <Button variant="outline" size="sm">
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function Accreditations() {
  const validCount = accreditations.filter(a => a.status === "valid").length;
  const expiringCount = accreditations.filter(a => a.status === "expiring").length;
  const pendingCount = accreditations.filter(a => a.status === "pending").length;

  return (
    <div className="page-container">
      <PageHeader 
        title="Accreditations" 
        description="Track programme accreditations and renewal deadlines"
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Accreditation
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <FileCheck className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{accreditations.length}</p>
              <p className="text-sm text-muted-foreground">Total</p>
            </div>
          </div>
        </div>
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{validCount}</p>
              <p className="text-sm text-muted-foreground">Valid</p>
            </div>
          </div>
        </div>
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{expiringCount}</p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
          </div>
        </div>
        <div className="data-card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-info/10">
              <Clock className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-semibold">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>
      </div>

      {/* Accreditations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {accreditations.map((accreditation) => (
          <AccreditationCard key={accreditation.id} accreditation={accreditation} />
        ))}
      </div>
    </div>
  );
}
