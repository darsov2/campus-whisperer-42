import { ReactNode } from "react";
import { Link, NavLink, useLocation, useParams } from "react-router-dom";
import {
  GraduationCap,
  Bell,
  LogOut,
  HelpCircle,
  Globe,
  LayoutDashboard,
  User,
  CalendarRange,
  BookOpen,
  ClipboardList,
  GraduationCap as GradIcon,
  Wallet,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getStudentProfile } from "@/data/students-data";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface Props {
  children: ReactNode;
}

function PortalSidebar({ studentId }: { studentId?: string }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();

  const items = [
    { label: "Dashboard", to: `/students/${studentId}`, icon: LayoutDashboard, exact: true },
    { label: "Profile", to: `/students/${studentId}/profile`, icon: User },
    { label: "Semesters", to: `/students/${studentId}/semesters`, icon: CalendarRange },
    { label: "Courses", to: `/students/${studentId}/courses`, icon: BookOpen },
    { label: "Exams", to: `/students/${studentId}/exams`, icon: ClipboardList },
    { label: "Grades", to: `/students/${studentId}/grades`, icon: GradIcon },
    { label: "Finance", to: `/students/${studentId}/finance`, icon: Wallet },
    { label: "Documents", to: `/students/${studentId}/documents`, icon: FileText },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2.5 px-2 py-2">
          <div className="h-8 w-8 shrink-0 rounded-md bg-accent/20 flex items-center justify-center ring-1 ring-accent/40">
            <GraduationCap className="h-4 w-4 text-accent" />
          </div>
          {!collapsed && (
            <div className="leading-tight overflow-hidden">
              <p className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">University</p>
              <p className="text-sm font-semibold text-sidebar-foreground truncate">Student Portal</p>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          {!collapsed && <SidebarGroupLabel>Navigation</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton asChild isActive={isActive(item.to, item.exact)} tooltip={item.label}>
                    <NavLink to={item.to} end={item.exact} className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function StudentPortalLayout({ children }: Props) {
  const { id } = useParams<{ id: string }>();
  const student = id ? getStudentProfile(id) : undefined;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[hsl(220_25%_96%)]">
        <PortalSidebar studentId={id} />

        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 bg-[hsl(222_47%_11%)] text-primary-foreground border-b border-white/5 flex items-center justify-between px-4 gap-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/10" />
              <div className="hidden md:block leading-tight ml-2">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">Student Information System</p>
                <p className="text-sm font-semibold">
                  {student ? `${student.firstName} ${student.lastName}` : "Student Portal"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                <Globe className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                <HelpCircle className="h-4 w-4" />
              </Button>
              <div className="w-px h-6 bg-white/10 mx-1" />
              {student && (
                <div className="flex items-center gap-2 pl-1">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-accent/20 text-accent text-xs font-semibold">
                      {student.firstName[0]}
                      {student.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block leading-tight">
                    <p className="text-xs font-medium">
                      {student.firstName} {student.lastName}
                    </p>
                    <p className="text-[10px] text-white/50 font-mono">{student.studentId}</p>
                  </div>
                </div>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="max-w-[1400px] mx-auto px-6 py-6">{children}</div>
          </main>

          <footer className="border-t bg-card">
            <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between text-xs text-muted-foreground">
              <p>© {new Date().getFullYear()} University Student Portal</p>
              <div className="flex items-center gap-4">
                <a href="#" className="hover:text-foreground">Privacy</a>
                <a href="#" className="hover:text-foreground">Terms</a>
                <a href="#" className="hover:text-foreground">Contact</a>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  );
}
