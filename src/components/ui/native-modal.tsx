import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NativeModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function NativeModal({
  open,
  onClose,
  title,
  description,
  icon,
  className,
  children,
}: NativeModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === dialogRef.current) {
      onClose();
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className={cn(
        "w-full max-w-lg rounded-lg border bg-background p-0 shadow-lg backdrop:bg-black/80",
        "open:animate-in open:fade-in-0 open:zoom-in-95",
        className
      )}
      onClick={handleBackdropClick}
    >
      <div className="p-6" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex flex-col space-y-1.5 mb-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold leading-none tracking-tight flex items-center gap-2">
              {icon}
              {title}
            </h2>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-7 w-7 p-0 rounded-sm opacity-70 hover:opacity-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Content */}
        {children}
      </div>
    </dialog>
  );
}
