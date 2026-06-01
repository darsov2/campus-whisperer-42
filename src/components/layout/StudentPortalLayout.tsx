import { ReactNode } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { GraduationCap, Bell, LogOut, HelpCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getStudentProfile } from "@/data/students-data";

interface Props {
  children: ReactNode;
}

export function StudentPortalLayout({ children }: Props) {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const student = id ? getStudentProfile(id) : undefined;

  const nav = [
    { label: "Overview", to: `/students/${id}` },
    { label: "Semesters", to: `/students/${id}/semesters` },
  ];

  return (
    <div className="min-h-screen bg-[hsl(220_25%_96%)] flex flex-col">
      {/* Top brand bar */}
      <header className="bg-[hsl(222_47%_11%)] text-primary-foreground border-b border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-md bg-accent/20 flex items-center justify-center ring-1 ring-accent/40">
              <GraduationCap className="h-4 w-4 text-accent" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">University Portal</p>
              <p className="text-sm font-semibold">Student Information System</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => {
              const active = location.pathname === n.to || (n.to !== `/students/${id}` && location.pathname.startsWith(n.to));
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-md transition-colors",
                    active ? "bg-white/10 text-white" : "text-white/70 hover:text-white hover:bg-white/5"
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

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
        </div>
      </header>

      <main className="flex-1">
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
  );
}
