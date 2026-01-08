import { 
  Calendar, 
  GraduationCap, 
  BookOpen, 
  Users, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock
} from "lucide-react";
import { StatCard } from "@/components/ui/stat-card";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";

const recentActivity = [
  { id: 1, action: "Course CS101 updated", user: "Dr. Smith", time: "2 hours ago", type: "course" },
  { id: 2, action: "New semester created", user: "Admin", time: "5 hours ago", type: "semester" },
  { id: 3, action: "Rule dependency added", user: "Admin", time: "1 day ago", type: "rule" },
  { id: 4, action: "Teacher profile updated", user: "Dr. Johnson", time: "2 days ago", type: "teacher" },
];

const pendingTasks = [
  { id: 1, task: "Review course prerequisites for CS201", priority: "high" },
  { id: 2, task: "Approve faculty semester overrides", priority: "medium" },
  { id: 3, task: "Update accreditation documents", priority: "low" },
];

export default function Dashboard() {
  return (
    <div className="page-container">
      <PageHeader 
        title="Dashboard" 
        description="Overview of your university management system"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Active Semesters"
          value="2"
          subtitle="Winter 2024/25"
          icon={Calendar}
        />
        <StatCard
          title="Study Programmes"
          value="24"
          subtitle="Across 6 faculties"
          icon={GraduationCap}
          trend={{ value: 4, label: "vs last year" }}
        />
        <StatCard
          title="Active Courses"
          value="342"
          subtitle="187 with dependencies"
          icon={BookOpen}
        />
        <StatCard
          title="Teachers"
          value="156"
          subtitle="12 pending approval"
          icon={Users}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 data-card">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors">
                <div className="p-2 rounded-lg bg-accent/10">
                  {activity.type === "course" && <BookOpen className="h-4 w-4 text-accent" />}
                  {activity.type === "semester" && <Calendar className="h-4 w-4 text-accent" />}
                  {activity.type === "rule" && <TrendingUp className="h-4 w-4 text-accent" />}
                  {activity.type === "teacher" && <Users className="h-4 w-4 text-accent" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">by {activity.user}</p>
                </div>
                <span className="text-sm text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <Button variant="ghost" size="sm" className="w-full text-accent hover:text-accent">
              View all activity
            </Button>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="data-card">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-semibold">Pending Tasks</h2>
            <span className="text-sm text-muted-foreground">{pendingTasks.length} items</span>
          </div>
          <div className="divide-y">
            {pendingTasks.map((task) => (
              <div key={task.id} className="p-4 flex items-start gap-3">
                <div className={`mt-0.5 p-1 rounded ${
                  task.priority === "high" ? "bg-destructive/10" :
                  task.priority === "medium" ? "bg-warning/10" : "bg-muted"
                }`}>
                  {task.priority === "high" ? (
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  ) : task.priority === "medium" ? (
                    <Clock className="h-4 w-4 text-warning" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm flex-1">{task.task}</p>
              </div>
            ))}
          </div>
          <div className="p-4 border-t">
            <Button variant="ghost" size="sm" className="w-full text-accent hover:text-accent">
              View all tasks
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="mt-6 data-card p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <StatusBadge status="active" label="12 Active Rules" />
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="pending" label="3 Pending Reviews" />
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status="draft" label="5 Draft Programmes" />
            </div>
          </div>
          <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground">
            Generate Report
          </Button>
        </div>
      </div>
    </div>
  );
}
