import { ReactNode, useState, useMemo } from "react";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { semesters, subjects } from "@/data/teacher-portal-data";
import { exportCSV, exportXLSX } from "@/lib/teacher-export";
import { toast } from "sonner";

export interface ReportColumn<T> {
  header: string;
  key: string;
  render?: (row: T) => ReactNode;
}

export interface ReportFilters {
  semesterId: string;
  subjectId: string;
  examSessionId?: string;
}

interface Props<T> {
  backTo: string;
  title: string;
  description: string;
  columns: ReportColumn<T>[];
  build: (f: ReportFilters) => T[];
  toExportRow: (row: T) => Record<string, any>;
  extraFilters?: ReactNode;
  defaultFilters?: Partial<ReportFilters>;
  filename: string;
}

const PAGE = 10;

export function ReportPageShell<T extends { id?: string | number }>({
  backTo, title, description, columns, build, toExportRow, extraFilters, defaultFilters, filename,
}: Props<T>) {
  const [semesterId, setSemester] = useState(defaultFilters?.semesterId ?? semesters[0].id);
  const [subjectId, setSubject] = useState(defaultFilters?.subjectId ?? subjects[0].id);
  const [page, setPage] = useState(1);

  const rows = useMemo(() => build({ semesterId, subjectId }), [build, semesterId, subjectId]);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE));
  const pageRows = rows.slice((page - 1) * PAGE, page * PAGE);

  const handleExport = (kind: "csv" | "xlsx" | "pdf") => {
    if (kind === "pdf") {
      toast.info("PDF export will be wired to the reporting service.");
      return;
    }
    const data = rows.map(toExportRow);
    if (data.length === 0) {
      toast.warning("Nothing to export — adjust the filters first.");
      return;
    }
    kind === "csv" ? exportCSV(data, filename) : exportXLSX(data, filename);
    toast.success(`Exported ${data.length} rows.`);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to={backTo} className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="h-3 w-3 mr-1" /> Reports hub
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
              <Download className="h-4 w-4 mr-2" /> Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleExport("csv")}>CSV (.csv)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("xlsx")}>Excel (.xlsx)</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleExport("pdf")}>PDF (.pdf)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Semester</p>
              <Select value={semesterId} onValueChange={(v) => { setSemester(v); setPage(1); }}>
                <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {semesters.map((s) => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Subject</p>
              <Select value={subjectId} onValueChange={(v) => { setSubject(v); setPage(1); }}>
                <SelectTrigger className="w-[260px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} — {s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {extraFilters}
            <div className="ml-auto text-sm text-muted-foreground">
              {rows.length} result{rows.length === 1 ? "" : "s"}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-[var(--shadow-card)]">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((c) => <TableHead key={c.key}>{c.header}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-16 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No rows match these filters.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((row, i) => (
                <TableRow key={(row.id as any) ?? i}>
                  {columns.map((c) => (
                    <TableCell key={c.key}>
                      {c.render ? c.render(row) : (row as any)[c.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className="cursor-pointer" />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)} className="cursor-pointer">
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="cursor-pointer" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
