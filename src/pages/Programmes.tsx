import { useState } from "react";
import { 
  GraduationCap, 
  Plus, 
  Search,
  Filter,
  MoreHorizontal,
  BookOpen,
  Users,
  Clock,
  Award
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
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
import { cn } from "@/lib/utils";

interface Programme {
  id: string;
  name: string;
  code: string;
  faculty: string;
  degree: "bachelor" | "master" | "doctorate";
  duration: number;
  totalEcts: number;
  coursesCount: number;
  studentsEnrolled: number;
  status: "active" | "draft" | "archived";
  accreditedUntil: string;
}

const programmes: Programme[] = [
  {
    id: "1",
    name: "Computer Science",
    code: "CS-BSC",
    faculty: "Faculty of Computer Science",
    degree: "bachelor",
    duration: 3,
    totalEcts: 180,
    coursesCount: 42,
    studentsEnrolled: 856,
    status: "active",
    accreditedUntil: "2027-09-30",
  },
  {
    id: "2",
    name: "Computer Science",
    code: "CS-MSC",
    faculty: "Faculty of Computer Science",
    degree: "master",
    duration: 2,
    totalEcts: 120,
    coursesCount: 24,
    studentsEnrolled: 234,
    status: "active",
    accreditedUntil: "2026-09-30",
  },
  {
    id: "3",
    name: "Mathematics",
    code: "MA-BSC",
    faculty: "Faculty of Natural Sciences",
    degree: "bachelor",
    duration: 3,
    totalEcts: 180,
    coursesCount: 38,
    studentsEnrolled: 412,
    status: "active",
    accreditedUntil: "2028-09-30",
  },
  {
    id: "4",
    name: "Data Science",
    code: "DS-MSC",
    faculty: "Faculty of Computer Science",
    degree: "master",
    duration: 2,
    totalEcts: 120,
    coursesCount: 20,
    studentsEnrolled: 0,
    status: "draft",
    accreditedUntil: "",
  },
  {
    id: "5",
    name: "Mechanical Engineering",
    code: "ME-BSC",
    faculty: "Faculty of Engineering",
    degree: "bachelor",
    duration: 4,
    totalEcts: 240,
    coursesCount: 56,
    studentsEnrolled: 623,
    status: "active",
    accreditedUntil: "2025-09-30",
  },
];

const degreeLabels = {
  bachelor: "Bachelor's",
  master: "Master's",
  doctorate: "Doctorate",
};

const degreeColors = {
  bachelor: "bg-info/10 text-info",
  master: "bg-accent/10 text-accent",
  doctorate: "bg-warning/10 text-warning",
};

function ProgrammeCard({ programme }: { programme: Programme }) {
  const isAccreditationExpiring = programme.accreditedUntil && 
    new Date(programme.accreditedUntil) < new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  return (
    <div className="data-card p-5 hover:shadow-elevated transition-all">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={cn(
            "p-3 rounded-lg",
            programme.status === "active" ? "bg-accent/10" : "bg-muted"
          )}>
            <GraduationCap className={cn(
              "h-5 w-5",
              programme.status === "active" ? "text-accent" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <span className={cn("px-2 py-0.5 rounded text-xs font-medium", degreeColors[programme.degree])}>
                {degreeLabels[programme.degree]}
              </span>
              <h3 className="font-semibold">{programme.name}</h3>
              <span className="font-mono text-sm text-muted-foreground">{programme.code}</span>
              <StatusBadge status={programme.status} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">{programme.faculty}</p>
            
            <div className="flex items-center gap-6 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{programme.duration} years</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span>{programme.totalEcts} ECTS</span>
              </div>
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <span>{programme.coursesCount} courses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{programme.studentsEnrolled} students</span>
              </div>
            </div>

            {programme.accreditedUntil && (
              <div className={cn(
                "mt-3 text-xs",
                isAccreditationExpiring ? "text-warning" : "text-muted-foreground"
              )}>
                {isAccreditationExpiring && "⚠️ "}
                Accredited until {programme.accreditedUntil}
              </div>
            )}
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover">
            <DropdownMenuItem>Edit Programme</DropdownMenuItem>
            <DropdownMenuItem>Manage Courses</DropdownMenuItem>
            <DropdownMenuItem>View Curriculum</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Accreditation Details</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export default function Programmes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [degreeFilter, setDegreeFilter] = useState("all");

  const filteredProgrammes = programmes.filter((programme) => {
    const matchesSearch = 
      programme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      programme.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDegree = degreeFilter === "all" || programme.degree === degreeFilter;
    return matchesSearch && matchesDegree;
  });

  return (
    <div className="page-container">
      <PageHeader 
        title="Study Programmes" 
        description="Manage degree programmes, curricula, and accreditations"
        actions={
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            New Programme
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search programmes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={degreeFilter} onValueChange={setDegreeFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by degree" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="all">All Degrees</SelectItem>
            <SelectItem value="bachelor">Bachelor's</SelectItem>
            <SelectItem value="master">Master's</SelectItem>
            <SelectItem value="doctorate">Doctorate</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{programmes.length}</p>
          <p className="text-sm text-muted-foreground">Total Programmes</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{programmes.filter(p => p.degree === "bachelor").length}</p>
          <p className="text-sm text-muted-foreground">Bachelor's</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{programmes.filter(p => p.degree === "master").length}</p>
          <p className="text-sm text-muted-foreground">Master's</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{programmes.reduce((acc, p) => acc + p.studentsEnrolled, 0).toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Total Students</p>
        </div>
      </div>

      {/* Programmes Grid */}
      <div className="space-y-3">
        {filteredProgrammes.map((programme) => (
          <ProgrammeCard key={programme.id} programme={programme} />
        ))}
      </div>
    </div>
  );
}
