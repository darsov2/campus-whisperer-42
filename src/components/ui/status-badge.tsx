import { cn } from "@/lib/utils";

type Status = "active" | "pending" | "inactive" | "draft" | "archived";

interface StatusBadgeProps {
  status: Status;
  label?: string;
}

const statusStyles: Record<Status, string> = {
  active: "status-badge-active",
  pending: "status-badge-pending",
  inactive: "status-badge-inactive",
  draft: "bg-info/10 text-info",
  archived: "bg-muted text-muted-foreground",
};

const defaultLabels: Record<Status, string> = {
  active: "Active",
  pending: "Pending",
  inactive: "Inactive",
  draft: "Draft",
  archived: "Archived",
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={cn("status-badge", statusStyles[status])}>
      <span className={cn(
        "w-1.5 h-1.5 rounded-full",
        status === "active" && "bg-success",
        status === "pending" && "bg-warning",
        status === "inactive" && "bg-muted-foreground",
        status === "draft" && "bg-info",
        status === "archived" && "bg-muted-foreground"
      )} />
      {label || defaultLabels[status]}
    </span>
  );
}
