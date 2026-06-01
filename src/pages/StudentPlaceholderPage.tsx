import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

export function StudentPlaceholderPage({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  useParams();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <Card className="border-0 shadow-[var(--shadow-card)]">
        <CardContent className="py-20 text-center space-y-3">
          <div className="h-14 w-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mx-auto">
            <Icon className="h-6 w-6" />
          </div>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            This section is coming soon. You'll be able to manage {title.toLowerCase()} here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
