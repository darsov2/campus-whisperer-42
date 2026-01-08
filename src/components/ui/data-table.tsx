import { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onRowClick,
  emptyMessage = "No data available",
}: DataTableProps<T>) {
  return (
    <div className="data-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={cn("font-semibold text-foreground", column.className)}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center py-8 text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow
                key={item.id}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/50"
                )}
              >
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {column.cell(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
