import { useMemo, useState } from "react";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle, ArrowRight, Download } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { parseSpreadsheet, exportCSV } from "@/lib/teacher-export";
import { toast } from "sonner";

export type ImportOutcome = "ok" | "warning" | "error";

export interface ParsedImportRow {
  raw: Record<string, any>;
  studentIndex: string;
  value: string;
  outcome: ImportOutcome;
  reasons: string[];
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  valueLabel: string; // "Grade" or "Signature"
  templateColumns: string[];
  validate: (raw: Record<string, any>) => Omit<ParsedImportRow, "raw">;
  onSubmit: (rows: ParsedImportRow[]) => Promise<{ success: number; failed: number; details: { index: string; outcome: ImportOutcome; reason: string }[] }>;
}

type Step = "upload" | "review" | "report";

export function BulkImportWizard({ open, onOpenChange, title, valueLabel, templateColumns, validate, onSubmit }: Props) {
  const [step, setStep] = useState<Step>("upload");
  const [rows, setRows] = useState<ParsedImportRow[]>([]);
  const [report, setReport] = useState<{ success: number; failed: number; details: { index: string; outcome: ImportOutcome; reason: string }[] } | null>(null);

  const reset = () => { setStep("upload"); setRows([]); setReport(null); };

  const handleFile = async (file: File) => {
    try {
      const parsed = await parseSpreadsheet(file);
      const validated = parsed.map((raw) => ({ raw, ...validate(raw) }));
      setRows(validated);
      setStep("review");
    } catch (e: any) {
      toast.error(`Could not parse file: ${e.message ?? e}`);
    }
  };

  const counts = useMemo(() => ({
    ok: rows.filter((r) => r.outcome === "ok").length,
    warn: rows.filter((r) => r.outcome === "warning").length,
    err: rows.filter((r) => r.outcome === "error").length,
  }), [rows]);

  const submit = async () => {
    const toSend = rows.filter((r) => r.outcome !== "error");
    const result = await onSubmit(toSend);
    setReport(result);
    setStep("report");
  };

  const downloadTemplate = () => {
    const sample = templateColumns.reduce((acc, c) => ({ ...acc, [c]: "" }), {});
    exportCSV([sample], `${title.toLowerCase().replace(/\s+/g, "-")}-template`);
  };

  const downloadReport = () => {
    if (!report) return;
    exportCSV(report.details, `${title.toLowerCase().replace(/\s+/g, "-")}-result`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {step === "upload" && "Upload a CSV or Excel file. Use the template for the expected columns."}
            {step === "review" && "Review parsed rows. Only OK and warning rows will be submitted; errors are skipped."}
            {step === "report" && "Import completed. Download the result report for your records."}
          </DialogDescription>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed rounded-xl p-10 text-center">
              <FileSpreadsheet className="h-10 w-10 mx-auto text-accent mb-3" />
              <p className="text-sm font-medium">Drop your file or click to browse</p>
              <p className="text-xs text-muted-foreground mt-1">Accepted: .csv, .xlsx</p>
              <input
                type="file"
                accept=".csv,.xlsx"
                className="hidden"
                id="bulk-file"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              />
              <Button asChild variant="outline" className="mt-4">
                <label htmlFor="bulk-file" className="cursor-pointer"><Upload className="h-4 w-4 mr-2" /> Choose file</label>
              </Button>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Expected columns: <span className="font-mono">{templateColumns.join(", ")}</span></span>
              <Button variant="link" size="sm" onClick={downloadTemplate}>
                <Download className="h-3 w-3 mr-1" /> Download template
              </Button>
            </div>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">OK · {counts.ok}</Badge>
              <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">Warning · {counts.warn}</Badge>
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">Error · {counts.err}</Badge>
            </div>
            <div className="border rounded-lg max-h-[360px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>{valueLabel}</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {r.outcome === "ok" && <CheckCircle2 className="h-4 w-4 text-success" />}
                        {r.outcome === "warning" && <AlertTriangle className="h-4 w-4 text-warning" />}
                        {r.outcome === "error" && <XCircle className="h-4 w-4 text-destructive" />}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.studentIndex}</TableCell>
                      <TableCell>{r.value || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.reasons.length === 0 ? "—" : r.reasons.map((reason, j) => (
                          <span key={j} className="inline-block bg-muted px-1.5 py-0.5 rounded mr-1 mb-0.5">{reason}</span>
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={reset}>Start over</Button>
              <Button onClick={submit} disabled={counts.ok + counts.warn === 0}>
                Submit {counts.ok + counts.warn} rows <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "report" && report && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border bg-success/5 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Successful</p>
                <p className="text-3xl font-bold text-success">{report.success}</p>
              </div>
              <div className="rounded-lg border bg-destructive/5 p-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Failed</p>
                <p className="text-3xl font-bold text-destructive">{report.failed}</p>
              </div>
            </div>
            <div className="border rounded-lg max-h-[280px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Outcome</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.details.map((d, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-xs">{d.index}</TableCell>
                      <TableCell className="capitalize">{d.outcome}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{d.reason}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={downloadReport}>
                <Download className="h-4 w-4 mr-2" /> Download report
              </Button>
              <Button onClick={() => { onOpenChange(false); reset(); }}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
