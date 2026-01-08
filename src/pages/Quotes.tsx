import { useState } from "react";
import {
  Receipt,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  User,
  GraduationCap,
  Calendar,
  DollarSign,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Types
interface QuoteItem {
  description: string;
  amount: number;
  type: "fee" | "scholarship" | "discount";
}

interface Quote {
  id: string;
  quoteNumber: string;
  studentId: string;
  studentName: string;
  programme: string;
  programmeCode: string;
  academicYear: string;
  semester: string;
  items: QuoteItem[];
  totalAmount: number;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  createdDate: string;
  validUntil: string;
  notes: string;
}

// Mock data
const mockQuotes: Quote[] = [
  {
    id: "1",
    quoteNumber: "QT-2024-001",
    studentId: "2021-CS-001",
    studentName: "Alex Johnson",
    programme: "Computer Science",
    programmeCode: "CS-BSC",
    academicYear: "2024/2025",
    semester: "Fall 2024",
    items: [
      { description: "Tuition Fee - Fall Semester", amount: 5000, type: "fee" },
      { description: "Student Services Fee", amount: 250, type: "fee" },
      { description: "Technology Fee", amount: 150, type: "fee" },
      { description: "Merit Scholarship", amount: -1500, type: "scholarship" },
    ],
    totalAmount: 3900,
    status: "sent",
    createdDate: "2024-06-15",
    validUntil: "2024-08-15",
    notes: "Early registration discount applied",
  },
  {
    id: "2",
    quoteNumber: "QT-2024-002",
    studentId: "2020-CS-042",
    studentName: "Maria Garcia",
    programme: "Computer Science",
    programmeCode: "CS-BSC",
    academicYear: "2024/2025",
    semester: "Fall 2024",
    items: [
      { description: "Tuition Fee - Fall Semester", amount: 5000, type: "fee" },
      { description: "Student Services Fee", amount: 250, type: "fee" },
      { description: "Dean's List Scholarship", amount: -2000, type: "scholarship" },
      { description: "Returning Student Discount", amount: -250, type: "discount" },
    ],
    totalAmount: 3000,
    status: "accepted",
    createdDate: "2024-06-10",
    validUntil: "2024-08-10",
    notes: "",
  },
  {
    id: "3",
    quoteNumber: "QT-2024-003",
    studentId: "2022-MA-015",
    studentName: "James Wilson",
    programme: "Mathematics",
    programmeCode: "MA-BSC",
    academicYear: "2024/2025",
    semester: "Fall 2024",
    items: [
      { description: "Tuition Fee - Fall Semester", amount: 4500, type: "fee" },
      { description: "Student Services Fee", amount: 250, type: "fee" },
      { description: "Lab Fee", amount: 100, type: "fee" },
    ],
    totalAmount: 4850,
    status: "draft",
    createdDate: "2024-06-20",
    validUntil: "2024-08-20",
    notes: "Pending academic review",
  },
  {
    id: "4",
    quoteNumber: "QT-2024-004",
    studentId: "2023-ENG-008",
    studentName: "Sarah Chen",
    programme: "Engineering",
    programmeCode: "ENG-BSC",
    academicYear: "2024/2025",
    semester: "Fall 2024",
    items: [
      { description: "Tuition Fee - Fall Semester", amount: 5500, type: "fee" },
      { description: "Engineering Lab Fee", amount: 300, type: "fee" },
      { description: "Student Services Fee", amount: 250, type: "fee" },
    ],
    totalAmount: 6050,
    status: "expired",
    createdDate: "2024-05-01",
    validUntil: "2024-07-01",
    notes: "Student did not respond",
  },
];

const statusConfig = {
  draft: { icon: FileText, color: "bg-muted text-muted-foreground", label: "Draft" },
  sent: { icon: Clock, color: "bg-info/20 text-info", label: "Sent" },
  accepted: { icon: CheckCircle, color: "bg-success/20 text-success", label: "Accepted" },
  rejected: { icon: XCircle, color: "bg-destructive/20 text-destructive", label: "Rejected" },
  expired: { icon: Clock, color: "bg-warning/20 text-warning", label: "Expired" },
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function Quotes() {
  const [quotes] = useState<Quote[]>(mockQuotes);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredQuotes = quotes.filter((quote) => {
    const matchesSearch =
      quote.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quote.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || quote.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const totalValue = quotes.reduce((acc, q) => acc + q.totalAmount, 0);
  const acceptedValue = quotes
    .filter((q) => q.status === "accepted")
    .reduce((acc, q) => acc + q.totalAmount, 0);
  const pendingCount = quotes.filter((q) => q.status === "sent").length;

  return (
    <div className="page-container">
      <PageHeader
        title="Fee Quotes"
        description="Create and manage tuition fee quotes for students"
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student, ID, or quote number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{quotes.length}</p>
          <p className="text-sm text-muted-foreground">Total Quotes</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{formatCurrency(totalValue)}</p>
          <p className="text-sm text-muted-foreground">Total Value</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold text-success">{formatCurrency(acceptedValue)}</p>
          <p className="text-sm text-muted-foreground">Accepted</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold text-info">{pendingCount}</p>
          <p className="text-sm text-muted-foreground">Pending Response</p>
        </div>
      </div>

      {/* Quotes List */}
      <div className="space-y-3">
        {filteredQuotes.map((quote) => {
          const StatusIcon = statusConfig[quote.status].icon;
          return (
            <div key={quote.id} className="data-card p-5 hover:shadow-elevated transition-all">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Receipt className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                        {quote.quoteNumber}
                      </span>
                      <span className="font-semibold">{quote.studentName}</span>
                      <Badge className={cn("text-xs", statusConfig[quote.status].color)}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[quote.status].label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {quote.programme} ({quote.programmeCode}) • {quote.semester}
                    </p>

                    <div className="flex items-center gap-6 mt-3 text-sm">
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span>{quote.studentId}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Valid until {quote.validUntil}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>{quote.academicYear}</span>
                      </div>
                    </div>

                    {/* Quote Items Summary */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex flex-wrap gap-2">
                        {quote.items.map((item, idx) => (
                          <span
                            key={idx}
                            className={cn(
                              "text-xs px-2 py-1 rounded",
                              item.type === "fee" && "bg-muted",
                              item.type === "scholarship" && "bg-success/10 text-success",
                              item.type === "discount" && "bg-info/10 text-info"
                            )}
                          >
                            {item.description}: {formatCurrency(item.amount)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-2xl font-bold">{formatCurrency(quote.totalAmount)}</p>
                    <p className="text-xs text-muted-foreground">Total Amount</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-popover">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit Quote</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {quote.status === "draft" && (
                        <DropdownMenuItem className="text-accent">Send to Student</DropdownMenuItem>
                      )}
                      <DropdownMenuItem>Download PDF</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
