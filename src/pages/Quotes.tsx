import { useState } from "react";
import {
  Receipt,
  Plus,
  Pencil,
  Trash2,
  Euro,
  GraduationCap,
  Globe,
  Users,
  Percent,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// Types
interface QuoteType {
  id: string;
  name: string;
  code: string;
  description: string;
  pricePerEcts: number;
  currency: string;
  isActive: boolean;
  icon: "standard" | "international" | "scholarship" | "discount";
  applicableTo: string;
}

// Mock data
const mockQuoteTypes: QuoteType[] = [
  {
    id: "1",
    name: "Standard Domestic",
    code: "STD-DOM",
    description: "Regular tuition rate for domestic students",
    pricePerEcts: 50,
    currency: "EUR",
    isActive: true,
    icon: "standard",
    applicableTo: "Domestic students (EU citizens)",
  },
  {
    id: "2",
    name: "International",
    code: "INT",
    description: "Tuition rate for international (non-EU) students",
    pricePerEcts: 120,
    currency: "EUR",
    isActive: true,
    icon: "international",
    applicableTo: "Non-EU international students",
  },
  {
    id: "3",
    name: "Scholarship Rate",
    code: "SCHOL",
    description: "Discounted rate for scholarship recipients",
    pricePerEcts: 25,
    currency: "EUR",
    isActive: true,
    icon: "scholarship",
    applicableTo: "Students with approved scholarships",
  },
  {
    id: "4",
    name: "Partner University",
    code: "PARTNER",
    description: "Special rate for exchange students from partner universities",
    pricePerEcts: 0,
    currency: "EUR",
    isActive: true,
    icon: "discount",
    applicableTo: "Exchange students from partner institutions",
  },
  {
    id: "5",
    name: "Employee Discount",
    code: "EMP",
    description: "Reduced rate for university employees and their dependents",
    pricePerEcts: 30,
    currency: "EUR",
    isActive: false,
    icon: "discount",
    applicableTo: "University staff and dependents",
  },
];

const iconConfig = {
  standard: { icon: GraduationCap, color: "bg-accent/10 text-accent" },
  international: { icon: Globe, color: "bg-info/10 text-info" },
  scholarship: { icon: Percent, color: "bg-success/10 text-success" },
  discount: { icon: Users, color: "bg-warning/10 text-warning" },
};

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export default function Quotes() {
  const [quoteTypes, setQuoteTypes] = useState<QuoteType[]>(mockQuoteTypes);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<QuoteType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    pricePerEcts: 0,
    currency: "EUR",
    applicableTo: "",
  });

  const activeTypes = quoteTypes.filter((t) => t.isActive);
  const inactiveTypes = quoteTypes.filter((t) => !t.isActive);

  const handleOpenDialog = (quoteType?: QuoteType) => {
    if (quoteType) {
      setEditingType(quoteType);
      setFormData({
        name: quoteType.name,
        code: quoteType.code,
        description: quoteType.description,
        pricePerEcts: quoteType.pricePerEcts,
        currency: quoteType.currency,
        applicableTo: quoteType.applicableTo,
      });
    } else {
      setEditingType(null);
      setFormData({
        name: "",
        code: "",
        description: "",
        pricePerEcts: 0,
        currency: "EUR",
        applicableTo: "",
      });
    }
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (editingType) {
      setQuoteTypes((prev) =>
        prev.map((t) =>
          t.id === editingType.id
            ? { ...t, ...formData }
            : t
        )
      );
    } else {
      const newType: QuoteType = {
        id: Date.now().toString(),
        ...formData,
        isActive: true,
        icon: "standard",
      };
      setQuoteTypes((prev) => [...prev, newType]);
    }
    setDialogOpen(false);
  };

  const handleToggleActive = (id: string) => {
    setQuoteTypes((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    );
  };

  const handleDelete = (id: string) => {
    setQuoteTypes((prev) => prev.filter((t) => t.id !== id));
  };

  const QuoteTypeCard = ({ quoteType }: { quoteType: QuoteType }) => {
    const IconComponent = iconConfig[quoteType.icon].icon;
    return (
      <div
        className={cn(
          "data-card p-5 hover:shadow-elevated transition-all",
          !quoteType.isActive && "opacity-60"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className={cn("p-3 rounded-lg", iconConfig[quoteType.icon].color)}>
              <IconComponent className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{quoteType.name}</span>
                <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">
                  {quoteType.code}
                </span>
                {!quoteType.isActive && (
                  <Badge variant="outline" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {quoteType.description}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                <span className="font-medium">Applies to:</span> {quoteType.applicableTo}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">
                {formatCurrency(quoteType.pricePerEcts, quoteType.currency)}
              </p>
              <p className="text-xs text-muted-foreground">per ECTS credit</p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOpenDialog(quoteType)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleToggleActive(quoteType.id)}
              >
                {quoteType.isActive ? (
                  <span className="text-xs">Deactivate</span>
                ) : (
                  <span className="text-xs">Activate</span>
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(quoteType.id)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Fee Quotes Configuration"
        description="Configure ECTS credit pricing for different quote types"
        actions={
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => handleOpenDialog()}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Quote Type
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="data-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <p className="text-2xl font-semibold">{quoteTypes.length}</p>
          </div>
          <p className="text-sm text-muted-foreground">Total Quote Types</p>
        </div>
        <div className="data-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Euro className="h-4 w-4 text-success" />
            <p className="text-2xl font-semibold">
              {formatCurrency(
                activeTypes.reduce((acc, t) => acc + t.pricePerEcts, 0) /
                  (activeTypes.length || 1),
                "EUR"
              )}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">Avg. Price/ECTS</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold text-success">{activeTypes.length}</p>
          <p className="text-sm text-muted-foreground">Active Types</p>
        </div>
      </div>

      {/* Active Quote Types */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Active Quote Types</h3>
        <div className="space-y-3">
          {activeTypes.map((quoteType) => (
            <QuoteTypeCard key={quoteType.id} quoteType={quoteType} />
          ))}
          {activeTypes.length === 0 && (
            <div className="data-card p-8 text-center text-muted-foreground">
              No active quote types. Add one to get started.
            </div>
          )}
        </div>
      </div>

      {/* Inactive Quote Types */}
      {inactiveTypes.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
            Inactive Quote Types
          </h3>
          <div className="space-y-3">
            {inactiveTypes.map((quoteType) => (
              <QuoteTypeCard key={quoteType.id} quoteType={quoteType} />
            ))}
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-background">
          <DialogHeader>
            <DialogTitle>
              {editingType ? "Edit Quote Type" : "Add Quote Type"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Standard Domestic"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))
                  }
                  placeholder="e.g., STD-DOM"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of this quote type"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pricePerEcts">Price per ECTS (EUR)</Label>
                <Input
                  id="pricePerEcts"
                  type="number"
                  min={0}
                  step={0.01}
                  value={formData.pricePerEcts}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      pricePerEcts: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, currency: e.target.value }))
                  }
                  placeholder="EUR"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicableTo">Applicable To</Label>
              <Input
                id="applicableTo"
                value={formData.applicableTo}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, applicableTo: e.target.value }))
                }
                placeholder="e.g., Domestic students (EU citizens)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingType ? "Save Changes" : "Add Quote Type"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
