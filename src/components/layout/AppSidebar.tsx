import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Calendar,
  GraduationCap,
  BookOpen,
  Users,
  Network,
  Settings,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Building2,
  FileCheck,
  Workflow,
  UserCircle,
  Receipt,
  BarChart3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Semesters", href: "/semesters", icon: Calendar },
  { name: "Faculties", href: "/faculties", icon: Building2 },
  { name: "Study Programmes", href: "/programmes", icon: GraduationCap },
  { name: "Courses", href: "/courses", icon: BookOpen },
  { name: "Course Overview", href: "/course-programmes", icon: Network },
  { name: "Teachers", href: "/teachers", icon: Users },
  { name: "Students", href: "/students", icon: UserCircle },
  { name: "Fee Quotes", href: "/quotes", icon: Receipt },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Rule Engine", href: "/rules", icon: Workflow },
  { name: "Accreditations", href: "/accreditations", icon: FileCheck },
];

const bottomNavigation = [
  { name: "Settings", href: "/settings", icon: Settings },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location.pathname === item.href;
    const Icon = item.icon;

    const content = (
      <NavLink
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-sidebar-primary")} />
        {!collapsed && <span className="truncate">{item.name}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="bg-popover text-popover-foreground">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar flex flex-col border-r border-sidebar-border transition-all duration-300 sticky top-0",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "h-16 flex items-center border-b border-sidebar-border px-4",
        collapsed ? "justify-center" : "justify-between"
      )}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Network className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="font-semibold text-sidebar-accent-foreground">iKnow</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Network className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>

      {/* Bottom section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomNavigation.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            "w-full justify-center text-sidebar-muted hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 mt-2"
          )}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span>Collapse</span>
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
