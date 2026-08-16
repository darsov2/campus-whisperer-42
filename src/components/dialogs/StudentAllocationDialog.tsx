import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import StudentAllocationWizard from "@/components/allocation/StudentAllocationWizard";

interface StudentAllocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseLabel?: string;
}

export function StudentAllocationDialog({
  open,
  onOpenChange,
  courseLabel,
}: StudentAllocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sr-only">
          <DialogTitle>Student Allocation</DialogTitle>
          <DialogDescription>
            Select students, assign them to a group and distribute them between teachers.
          </DialogDescription>
        </DialogHeader>
        <StudentAllocationWizard
          courseLabel={courseLabel}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
