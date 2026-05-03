import { useMemo, useState } from "react";
import { Search, Receipt, Pencil, TrendingUp, Plus, Building2, Layers } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  mockQuotas,
  mockProgrammes,
  mockQuotaPrices,
  formatEUR,
  appliesToLabel,
  type QuotaPrice,
  type Quota,
  type StudyProgrammeLite,
} from "@/data/quotas-data";

export default function QuotaPricing() {
  const [prices, setPrices] = useState<QuotaPrice[]>(mockQuotaPrices);
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState<string>("all");
  const [appliesFilter, setAppliesFilter] = useState<string>("all");

  // Side sheets
  const [openProgramme, setOpenProgramme] = useState<StudyProgrammeLite | null>(null);
  const [openQuota, setOpenQuota] = useState<Quota | null>(null);

  // Inline edit dialog
  const [editing, setEditing] = useState<{
    programme: StudyProgrammeLite;
    quota: Quota;
    price?: QuotaPrice;
  } | null>(null);
  const [editForm, setEditForm] = useState({ pricePerEcts: 0, yearlyPrice: 0 });

  // Bulk update dialog
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkQuotaId, setBulkQuotaId] = useState<string>("");
  const [bulkPercent, setBulkPercent] = useState<number>(5);

  const faculties = Array.from(new Set(mockProgrammes.map((p) => p.faculty)));

  const filteredProgrammes = useMemo(
    () =>
      mockProgrammes.filter((p) => {
        if (facultyFilter !== "all" && p.faculty !== facultyFilter) return false;
        const q = search.toLowerCase();
        return !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
      }),
    [search, facultyFilter]
  );

  const filteredQuotas = useMemo(
    () =>
      mockQuotas.filter((q) => {
        if (appliesFilter !== "all" && q.appliesTo !== appliesFilter && q.appliesTo !== "both")
          return false;
        const s = search.toLowerCase();
        return !s || q.name.toLowerCase().includes(s) || q.code.toLowerCase().includes(s);
      }),
    [search, appliesFilter]
  );

  const pricesByProgramme = (pid: string) => prices.filter((p) => p.programmeId === pid);
  const pricesByQuota = (qid: string) => prices.filter((p) => p.quotaId === qid);

  const openEdit = (programme: StudyProgrammeLite, quota: Quota) => {
    const existing = prices.find(
      (p) => p.programmeId === programme.id && p.quotaId === quota.id
    );
    setEditing({ programme, quota, price: existing });
    setEditForm({
      pricePerEcts: existing?.pricePerEcts ?? 0,
      yearlyPrice: existing?.yearlyPrice ?? 0,
    });
  };

  const saveEdit = () => {
    if (!editing) return;
    const { programme, quota, price } = editing;
    setPrices((prev) => {
      if (price) {
        return prev.map((p) =>
          p.id === price.id
            ? { ...p, pricePerEcts: editForm.pricePerEcts, yearlyPrice: editForm.yearlyPrice }
            : p
        );
      }
      return [
        ...prev,
        {
          id: `qp-${Date.now()}`,
          programmeId: programme.id,
          quotaId: quota.id,
          pricePerEcts: editForm.pricePerEcts,
          yearlyPrice: editForm.yearlyPrice,
          currency: "EUR",
        },
      ];
    });
    toast.success(`Saved price for ${programme.code} · ${quota.code}`);
    setEditing(null);
  };

  const removePrice = (id: string) => {
    setPrices((prev) => prev.filter((p) => p.id !== id));
  };

  const applyBulkIncrease = () => {
    if (!bulkQuotaId) return;
    const factor = 1 + bulkPercent / 100;
    setPrices((prev) =>
      prev.map((p) =>
        p.quotaId === bulkQuotaId
          ? {
              ...p,
              pricePerEcts: Math.round(p.pricePerEcts * factor),
              yearlyPrice: Math.round(p.yearlyPrice * factor),
            }
          : p
      )
    );
    toast.success(`Applied ${bulkPercent > 0 ? "+" : ""}${bulkPercent}% to all prices for selected quota`);
    setBulkOpen(false);
  };

  // Suggested yearly = perEcts * programme ects
  const expectedYearly =
    editing && editForm.pricePerEcts && editing.programme.totalEcts
      ? editForm.pricePerEcts * editing.programme.totalEcts
      : 0;
  const yearlyMismatch =
    editing && expectedYearly > 0 && Math.abs(expectedYearly - editForm.yearlyPrice) > 1;

  return (
    <div className="page-container">
      <PageHeader
        title="Quota Pricing"
        description="Per-ECTS and yearly prices for each financing quota across study programmes"
        actions={
          <Button onClick={() => setBulkOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <TrendingUp className="h-4 w-4 mr-2" />
            Bulk update
          </Button>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatBox icon={<Layers className="h-4 w-4" />} label="Quotas" value={mockQuotas.length} />
        <StatBox icon={<Building2 className="h-4 w-4" />} label="Programmes" value={mockProgrammes.length} />
        <StatBox icon={<Receipt className="h-4 w-4" />} label="Priced combinations" value={prices.length} />
        <StatBox
          icon={<TrendingUp className="h-4 w-4" />}
          label="Coverage"
          value={`${Math.round((prices.length / (mockQuotas.length * mockProgrammes.length)) * 100)}%`}
        />
      </div>

      <Tabs defaultValue="byProgramme">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <TabsList>
            <TabsTrigger value="byProgramme">By Programme</TabsTrigger>
            <TabsTrigger value="byQuota">By Quota</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 flex-1 max-w-2xl ml-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={facultyFilter} onValueChange={setFacultyFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Faculty" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">All faculties</SelectItem>
                {faculties.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={appliesFilter} onValueChange={setAppliesFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Applies to" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Regular & Irregular</SelectItem>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="irregular">Irregular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* By Programme — list */}
        <TabsContent value="byProgramme" className="space-y-3">
          {filteredProgrammes.map((p) => {
            const ps = pricesByProgramme(p.id);
            const coverage = Math.round((ps.length / mockQuotas.length) * 100);
            const minPrice = ps.length ? Math.min(...ps.map((x) => x.pricePerEcts)) : 0;
            const maxPrice = ps.length ? Math.max(...ps.map((x) => x.pricePerEcts)) : 0;
            return (
              <button
                key={p.id}
                onClick={() => setOpenProgramme(p)}
                className="data-card w-full p-4 text-left hover:shadow-elevated transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{p.name}</span>
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{p.code}</span>
                      <Badge variant="outline" className="text-xs">{p.faculty}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {ps.length} of {mockQuotas.length} quotas priced
                      {ps.length > 0 && (
                        <> · {formatEUR(minPrice)}–{formatEUR(maxPrice)} per ECTS</>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-40">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Coverage</span>
                        <span>{coverage}%</span>
                      </div>
                      <Progress value={coverage} className="h-2" />
                    </div>
                    <Button variant="outline" size="sm">
                      Manage prices
                    </Button>
                  </div>
                </div>
              </button>
            );
          })}
        </TabsContent>

        {/* By Quota — list */}
        <TabsContent value="byQuota" className="space-y-3">
          {filteredQuotas.map((q) => {
            const qp = pricesByQuota(q.id);
            const avg = qp.length ? Math.round(qp.reduce((a, x) => a + x.pricePerEcts, 0) / qp.length) : 0;
            const coverage = Math.round((qp.length / mockProgrammes.length) * 100);
            return (
              <button
                key={q.id}
                onClick={() => setOpenQuota(q)}
                className="data-card w-full p-4 text-left hover:shadow-elevated transition-all"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold truncate">{q.name}</span>
                      <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{q.code}</span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-xs",
                          q.appliesTo === "regular" && "border-info/40 text-info",
                          q.appliesTo === "irregular" && "border-warning/40 text-warning",
                          q.appliesTo === "both" && "border-success/40 text-success"
                        )}
                      >
                        {appliesToLabel[q.appliesTo]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Applied to {qp.length} of {mockProgrammes.length} programmes
                      {qp.length > 0 && <> · avg {formatEUR(avg)}/ECTS</>}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="w-40">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Coverage</span>
                        <span>{coverage}%</span>
                      </div>
                      <Progress value={coverage} className="h-2" />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setBulkQuotaId(q.id);
                        setBulkOpen(true);
                      }}
                    >
                      <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
                      Bulk %
                    </Button>
                  </div>
                </div>
              </button>
            );
          })}
        </TabsContent>
      </Tabs>

      {/* Programme detail sheet */}
      <Sheet open={!!openProgramme} onOpenChange={(o) => !o && setOpenProgramme(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-background">
          {openProgramme && (
            <ProgrammePricingPanel
              programme={openProgramme}
              prices={pricesByProgramme(openProgramme.id)}
              onEdit={(quota) => openEdit(openProgramme, quota)}
              onRemove={removePrice}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Quota detail sheet */}
      <Sheet open={!!openQuota} onOpenChange={(o) => !o && setOpenQuota(null)}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-background">
          {openQuota && (
            <QuotaPricingPanel
              quota={openQuota}
              prices={pricesByQuota(openQuota.id)}
              onEdit={(programme) => openEdit(programme, openQuota)}
              onRemove={removePrice}
              onBulk={() => {
                setBulkQuotaId(openQuota.id);
                setBulkOpen(true);
              }}
            />
          )}
        </SheetContent>
      </Sheet>

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>
              {editing?.price ? "Edit price" : "Add price"}
            </DialogTitle>
          </DialogHeader>
          {editing && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <div><span className="text-muted-foreground">Programme:</span> <strong>{editing.programme.name}</strong> ({editing.programme.totalEcts} ECTS/yr)</div>
                <div><span className="text-muted-foreground">Quota:</span> <strong>{editing.quota.name}</strong> · <span className="font-mono text-xs">{editing.quota.code}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price per ECTS (€)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editForm.pricePerEcts}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value) || 0;
                      setEditForm({ pricePerEcts: v, yearlyPrice: v * editing.programme.totalEcts });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Yearly price (€)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editForm.yearlyPrice}
                    onChange={(e) => setEditForm((f) => ({ ...f, yearlyPrice: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>
              {yearlyMismatch && (
                <div className="text-xs text-warning bg-warning/10 border border-warning/30 rounded p-2">
                  Heads up: {editForm.pricePerEcts}€ × {editing.programme.totalEcts} ECTS = {formatEUR(expectedYearly)}, which differs from the yearly price entered.
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk update */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>Bulk price adjustment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Quota</Label>
              <Select value={bulkQuotaId} onValueChange={setBulkQuotaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select quota" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {mockQuotas.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.name} ({q.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Adjust by % (use negative to decrease)</Label>
              <Input
                type="number"
                value={bulkPercent}
                onChange={(e) => setBulkPercent(parseFloat(e.target.value) || 0)}
              />
              <p className="text-xs text-muted-foreground">
                Applies to all programmes currently priced under this quota.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button onClick={applyBulkIncrease} disabled={!bulkQuotaId}>Apply</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
  return (
    <div className="data-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

// Panel: all quotas for one programme
function ProgrammePricingPanel({
  programme,
  prices,
  onEdit,
  onRemove,
}: {
  programme: StudyProgrammeLite;
  prices: QuotaPrice[];
  onEdit: (q: Quota) => void;
  onRemove: (id: string) => void;
}) {
  const [search, setSearch] = useState("");
  const priceMap = new Map(prices.map((p) => [p.quotaId, p]));
  const groups: { key: "regular" | "irregular" | "both"; label: string }[] = [
    { key: "regular", label: "Regular studies" },
    { key: "irregular", label: "Irregular studies" },
    { key: "both", label: "Both" },
  ];
  const filtered = mockQuotas.filter((q) => {
    const s = search.toLowerCase();
    return !s || q.name.toLowerCase().includes(s) || q.code.toLowerCase().includes(s);
  });

  return (
    <>
      <SheetHeader className="mb-4">
        <SheetTitle>{programme.name}</SheetTitle>
        <SheetDescription>
          <span className="font-mono">{programme.code}</span> · {programme.faculty} · {programme.totalEcts} ECTS/yr
        </SheetDescription>
      </SheetHeader>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search quotas…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="space-y-5">
        {groups.map((g) => {
          const items = filtered.filter((q) => q.appliesTo === g.key);
          if (!items.length) return null;
          return (
            <div key={g.key}>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">{g.label}</h4>
              <div className="space-y-1.5">
                {items.map((q) => {
                  const price = priceMap.get(q.id);
                  return (
                    <div
                      key={q.id}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg border p-2.5 pl-3 transition-colors",
                        price ? "bg-card" : "bg-muted/30 border-dashed"
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{q.name}</span>
                          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{q.code}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {price ? (
                          <div className="text-right">
                            <p className="text-sm font-semibold">{formatEUR(price.pricePerEcts)}<span className="text-xs text-muted-foreground font-normal">/ECTS</span></p>
                            <p className="text-xs text-muted-foreground">{formatEUR(price.yearlyPrice)}/yr</p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Not priced</span>
                        )}
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" onClick={() => onEdit(q)}>
                            {price ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          </Button>
                          {price && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => onRemove(price.id)}
                            >
                              ✕
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Panel: all programmes for one quota
function QuotaPricingPanel({
  quota,
  prices,
  onEdit,
  onRemove,
  onBulk,
}: {
  quota: Quota;
  prices: QuotaPrice[];
  onEdit: (p: StudyProgrammeLite) => void;
  onRemove: (id: string) => void;
  onBulk: () => void;
}) {
  const priceMap = new Map(prices.map((p) => [p.programmeId, p]));
  return (
    <>
      <SheetHeader className="mb-4">
        <SheetTitle className="flex items-center gap-2">
          {quota.name}
          <Badge variant="outline" className="text-xs">{appliesToLabel[quota.appliesTo]}</Badge>
        </SheetTitle>
        <SheetDescription>
          <span className="font-mono">{quota.code}</span>
          {quota.description && <> · {quota.description}</>}
        </SheetDescription>
      </SheetHeader>

      <div className="flex justify-end mb-3">
        <Button variant="outline" size="sm" onClick={onBulk}>
          <TrendingUp className="h-3.5 w-3.5 mr-1.5" /> Bulk adjust %
        </Button>
      </div>

      <div className="space-y-1.5">
        {mockProgrammes.map((p) => {
          const price = priceMap.get(p.id);
          return (
            <div
              key={p.id}
              className={cn(
                "flex items-center justify-between gap-3 rounded-lg border p-2.5 pl-3",
                price ? "bg-card" : "bg-muted/30 border-dashed"
              )}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">{p.name}</span>
                  <span className="font-mono text-[10px] bg-muted px-1.5 py-0.5 rounded">{p.code}</span>
                  <Badge variant="outline" className="text-[10px]">{p.faculty}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {price ? (
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatEUR(price.pricePerEcts)}<span className="text-xs text-muted-foreground font-normal">/ECTS</span></p>
                    <p className="text-xs text-muted-foreground">{formatEUR(price.yearlyPrice)}/yr</p>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Not priced</span>
                )}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(p)}>
                    {price ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </Button>
                  {price && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => onRemove(price.id)}
                    >
                      ✕
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
