import {
  BarChart3,
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  Calendar,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReportCategory {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  reports: {
    id: string;
    name: string;
    description: string;
  }[];
}

const reportCategories: ReportCategory[] = [
  {
    id: "student-performance",
    title: "Student Performance",
    description: "Academic grades, GPA trends, and pass rates",
    icon: TrendingUp,
    color: "bg-success/10 text-success",
    reports: [
      { id: "sp1", name: "Grade Distribution", description: "View grade distribution across all courses" },
      { id: "sp2", name: "GPA Trends", description: "Track GPA trends over time by programme" },
      { id: "sp3", name: "Pass/Fail Rates", description: "Analyze pass and fail rates by course" },
      { id: "sp4", name: "At-Risk Students", description: "Identify students with declining performance" },
      { id: "sp5", name: "Top Performers", description: "List of students with highest GPA" },
    ],
  },
  {
    id: "enrollment-stats",
    title: "Enrollment Statistics",
    description: "Student counts, demographics, and trends",
    icon: Users,
    color: "bg-info/10 text-info",
    reports: [
      { id: "es1", name: "Enrollment Summary", description: "Total enrollments by programme and semester" },
      { id: "es2", name: "Demographics", description: "Student demographics breakdown" },
      { id: "es3", name: "Retention Rates", description: "Student retention and dropout analysis" },
      { id: "es4", name: "New Admissions", description: "New student admission trends" },
      { id: "es5", name: "Graduation Rates", description: "On-time graduation statistics" },
    ],
  },
  {
    id: "course-analytics",
    title: "Course & Teacher Analytics",
    description: "Course completion rates and teacher workload",
    icon: BookOpen,
    color: "bg-accent/10 text-accent",
    reports: [
      { id: "ca1", name: "Course Enrollment", description: "Student enrollment numbers per course" },
      { id: "ca2", name: "Course Completion", description: "Completion rates by course" },
      { id: "ca3", name: "Teacher Workload", description: "Teaching load distribution" },
      { id: "ca4", name: "Course Evaluations", description: "Student feedback summary" },
      { id: "ca5", name: "Prerequisite Analysis", description: "Impact of prerequisites on success rates" },
    ],
  },
  {
    id: "financial",
    title: "Financial Reports",
    description: "Revenue, payments, and scholarships",
    icon: DollarSign,
    color: "bg-warning/10 text-warning",
    reports: [
      { id: "fr1", name: "Revenue Summary", description: "Total revenue by programme and semester" },
      { id: "fr2", name: "Outstanding Payments", description: "Students with pending payments" },
      { id: "fr3", name: "Scholarship Distribution", description: "Scholarships awarded by type" },
      { id: "fr4", name: "Payment Trends", description: "Payment patterns and collection rates" },
      { id: "fr5", name: "Fee Quote Analysis", description: "Quote acceptance and conversion rates" },
    ],
  },
];

export default function Reports() {
  return (
    <div className="page-container">
      <PageHeader
        title="Reports"
        description="Generate and view academic, enrollment, and financial reports"
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <FileText className="h-4 w-4 mr-2" />
            Custom Report
          </Button>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="data-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-info/10">
            <BarChart3 className="h-6 w-6 text-info" />
          </div>
          <div>
            <p className="text-2xl font-semibold">{reportCategories.length}</p>
            <p className="text-sm text-muted-foreground">Report Categories</p>
          </div>
        </div>
        <div className="data-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-success/10">
            <FileText className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-semibold">
              {reportCategories.reduce((acc, c) => acc + c.reports.length, 0)}
            </p>
            <p className="text-sm text-muted-foreground">Available Reports</p>
          </div>
        </div>
        <div className="data-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-accent/10">
            <Calendar className="h-6 w-6 text-accent" />
          </div>
          <div>
            <p className="text-2xl font-semibold">2024/2025</p>
            <p className="text-sm text-muted-foreground">Academic Year</p>
          </div>
        </div>
        <div className="data-card p-4 flex items-center gap-4">
          <div className="p-3 rounded-lg bg-warning/10">
            <Download className="h-6 w-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-semibold">PDF, Excel</p>
            <p className="text-sm text-muted-foreground">Export Formats</p>
          </div>
        </div>
      </div>

      {/* Report Categories */}
      <div className="grid md:grid-cols-2 gap-6">
        {reportCategories.map((category) => {
          const Icon = category.icon;
          return (
            <div key={category.id} className="data-card overflow-hidden">
              <div className="p-5 border-b bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className={cn("p-3 rounded-lg", category.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                </div>
              </div>
              <div className="divide-y">
                {category.reports.map((report) => (
                  <div
                    key={report.id}
                    className="p-4 hover:bg-muted/30 transition-colors cursor-pointer flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Generate
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-8 p-6 border border-dashed rounded-lg bg-muted/20 text-center">
        <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-semibold text-lg mb-2">Reports Module</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          This is a placeholder for the reports module. Connect to Lovable Cloud to enable 
          real-time report generation with interactive charts and data export capabilities.
        </p>
      </div>
    </div>
  );
}
