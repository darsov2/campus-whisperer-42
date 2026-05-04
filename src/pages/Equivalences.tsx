import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  Archive,
  XCircle,
  FileDown,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  EQUIVALENCE_REQUESTS,
  EQUIVALENCE_STATUS_LABEL,
  EQUIVALENCE_STATUS_TONE,
  computeMappedEcts,
  totalSlotEcts,
  type EquivalenceRequest,
  type EquivalenceStatus,
} from "@/data/equivalence-data";

const STATUS_TONE_CLASS: Record<string, string> = {
  info: "bg-info/10 text-info border-info/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  success: "bg-success/10 text-success border-success/20",
  destructive: "bg-destructive/10 text-destructive border-destructive/20",
  muted: "bg-muted text-muted-foreground border-border",
};

function StatusPill({ status }: { status: EquivalenceStatus }) {
  const tone = EQUIVALENCE_STATUS_TONE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        STATUS_TONE_CLASS[tone],
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {EQUIVALENCE_STATUS_LABEL[status]}
    </span>
  );
}

const TAB_FILTERS: { value: string; label: string; statuses?: EquivalenceStatus[] }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active", statuses: ["REQUESTED", "GRADES_IMPORTED", "EQUIVALENCE_DONE", "PENDING_COMMENT"] },
  { value: "finished", label: "Finished", statuses: ["FINISHED", "IKNOW_IMPORTED"] },
  { value: "closed", label: "Closed", statuses: ["CANCELLED", "ARCHIVED"] },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");
}

export default function Equivalences() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [progFilter, setProgFilter] = useState<string>("all");

  const requests = EQUIVALENCE_REQUESTS;

  const programmes = useMemo(() => {
    const map = new Map<string, string>();
    requests.forEach((r) => map.set(r.toProgrammeId, r.toProgrammeName));
    return Array.from(map.entries());
  }, [requests]);

  const filtered = useMemo(() => {
    const tabDef = TAB_FILTERS.find((t) => t.value === tab);
    return requests.filter((r) => {
      if (tabDef?.statuses && !tabDef.statuses.includes(r.status)) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (progFilter !== "all" && r.toProgrammeId !== progFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (
          !r.studentName.toLowerCase().includes(q) &&
          !r.studentIndex.toLowerCase().includes(q) &&
          !r.id.toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [requests, tab, statusFilter, progFilter, search]);

  const counters = useMemo(() => {
    const total = requests.length;
    const active = requests.filter((r) =>
      ["REQUESTED", "GRADES_IMPORTED", "EQUIVALENCE_DONE", "PENDING_COMMENT"].includes(r.status),
    ).length;
    const pendingComment = requests.filter((r) => r.status === "PENDING_COMMENT").length;
    const finished = requests.filter((r) => ["FINISHED", "IKNOW_IMPORTED"].includes(r.status)).length;
    return { total, active, pendingComment, finished };
  }, [requests]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equivalences"
        description="Manage course equivalence requests for students transferring between study programmes."
        actions={
          <Button>
            <Plus className="h-4 w-4" />
            New Request
          </Button>
        }
      />

      {/* Stat strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
              <p className="text-2xl font-semibold mt-1">{counters.total}</p>
            </div>
            <FileDown className="h-5 w-5 text-muted-foreground" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">In Progress</p>
              <p className="text-2xl font-semibold mt-1 text-info">{counters.active}</p>
            </div>
            <Clock className="h-5 w-5 text-info" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Pending Comment</p>
              <p className="text-2xl font-semibold mt-1 text-warning">{counters.pendingComment}</p>
            </div>
            <MessageSquare className="h-5 w-5 text-warning" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Finished</p>
              <p className="text-2xl font-semibold mt-1 text-success">{counters.finished}</p>
            </div>
            <CheckCircle2 className="h-5 w-5 text-success" />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 space-y-4">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            {TAB_FILTERS.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by student, index or request ID…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="md:w-56">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {(Object.keys(EQUIVALENCE_STATUS_LABEL) as EquivalenceStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {EQUIVALENCE_STATUS_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={progFilter} onValueChange={setProgFilter}>
            <SelectTrigger className="md:w-64">
              <SelectValue placeholder="Target programme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All target programmes</SelectItem>
              {programmes.map(([id, name]) => (
                <SelectItem key={id} value={id}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-muted-foreground text-sm">
              No requests match the current filters.
            </div>
          )}
          {filtered.map((r) => (
            <RequestRow key={r.id} req={r} onOpen={() => navigate(`/equivalences/${r.id}`)} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function RequestRow({ req, onOpen }: { req: EquivalenceRequest; onOpen: () => void }) {
  const mapped = computeMappedEcts(req);
  const total = totalSlotEcts(req);
  const pct = total > 0 ? Math.round((mapped / total) * 100) : 0;

  return (
    <div
      onClick={onOpen}
      className="group cursor-pointer rounded-lg border bg-card p-4 hover:border-primary/40 hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
            {initials(req.studentName)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{req.studentName}</p>
            <span className="text-xs text-muted-foreground">#{req.studentIndex}</span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground font-mono">{req.id}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground flex-wrap">
            <span className="truncate">{req.fromProgrammeName}</span>
            <ArrowRight className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate text-foreground">{req.toProgrammeName}</span>
          </div>
        </div>

        {/* Coverage */}
        <div className="hidden md:block w-40">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">Mapped</span>
            <span className="font-medium">{mapped}/{total} ECTS</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                pct === 100 ? "bg-success" : pct > 0 ? "bg-info" : "bg-muted",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusPill status={req.status} />
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
}
