import { useState } from "react";
import {
  Layers,
  Plus,
  Search,
  MoreHorizontal,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Star,
  StarOff,
  Link,
  Unlink,
} from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MasterCourseDialog } from "@/components/dialogs/MasterCourseDialog";
import { LinkCourseDialog } from "@/components/dialogs/LinkCourseDialog";
import { DeleteDialog } from "@/components/dialogs/DeleteDialog";

// Course version within a master course
export interface CourseVersion {
  id: string;
  code: string;
  name: string;
  accreditation: string;
  accreditationYear: number;
  status: "active" | "draft" | "archived";
  ects: number;
  isMain: boolean;
}

// Master course grouping multiple course versions
export interface MasterCourse {
  id: string;
  name: string;
  description: string;
  courseVersions: CourseVersion[];
  mainCourseId: string | null; // ID of the main course (auto or manually set)
  isMainOverridden: boolean; // Whether admin manually set the main course
}

const initialMasterCourses: MasterCourse[] = [
  {
    id: "mc1",
    name: "Introduction to Programming",
    description: "Fundamental programming concepts across all accreditations",
    mainCourseId: "cv1",
    isMainOverridden: false,
    courseVersions: [
      {
        id: "cv1",
        code: "CS101",
        name: "Introduction to Programming",
        accreditation: "2023 Accreditation",
        accreditationYear: 2023,
        status: "active",
        ects: 6,
        isMain: true,
      },
      {
        id: "cv2",
        code: "CS100",
        name: "Introduction to Programming",
        accreditation: "2020 Accreditation",
        accreditationYear: 2020,
        status: "archived",
        ects: 6,
        isMain: false,
      },
      {
        id: "cv3",
        code: "INF101",
        name: "Programming Fundamentals",
        accreditation: "2017 Accreditation",
        accreditationYear: 2017,
        status: "archived",
        ects: 5,
        isMain: false,
      },
    ],
  },
  {
    id: "mc2",
    name: "Data Structures and Algorithms",
    description: "Core data structures and algorithm design patterns",
    mainCourseId: "cv4",
    isMainOverridden: false,
    courseVersions: [
      {
        id: "cv4",
        code: "CS201",
        name: "Data Structures and Algorithms",
        accreditation: "2023 Accreditation",
        accreditationYear: 2023,
        status: "active",
        ects: 6,
        isMain: true,
      },
      {
        id: "cv5",
        code: "CS200",
        name: "Data Structures",
        accreditation: "2020 Accreditation",
        accreditationYear: 2020,
        status: "archived",
        ects: 5,
        isMain: false,
      },
    ],
  },
  {
    id: "mc3",
    name: "Database Systems",
    description: "Relational databases, SQL, and database design",
    mainCourseId: "cv6",
    isMainOverridden: false,
    courseVersions: [
      {
        id: "cv6",
        code: "CS301",
        name: "Database Systems",
        accreditation: "2023 Accreditation",
        accreditationYear: 2023,
        status: "active",
        ects: 5,
        isMain: true,
      },
    ],
  },
];

// Available courses that can be linked (not yet part of any master course)
const availableCoursesForLinking = [
  { id: "c1", code: "CS401", name: "Machine Learning", accreditation: "2023 Accreditation", accreditationYear: 2023, status: "draft" as const, ects: 6 },
  { id: "c2", code: "MA101", name: "Calculus I", accreditation: "2023 Accreditation", accreditationYear: 2023, status: "active" as const, ects: 7 },
  { id: "c3", code: "CS102", name: "Programming Lab", accreditation: "2023 Accreditation", accreditationYear: 2023, status: "active" as const, ects: 3 },
];

function MasterCourseCard({
  masterCourse,
  onEdit,
  onDelete,
  onLinkCourse,
  onUnlinkCourse,
  onSetMain,
  onResetMain,
}: {
  masterCourse: MasterCourse;
  onEdit: () => void;
  onDelete: () => void;
  onLinkCourse: () => void;
  onUnlinkCourse: (courseVersionId: string) => void;
  onSetMain: (courseVersionId: string) => void;
  onResetMain: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const mainCourse = masterCourse.courseVersions.find(
    (cv) => cv.id === masterCourse.mainCourseId
  );

  return (
    <div className="data-card">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-accent/10">
                <Layers className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold text-lg">{masterCourse.name}</h3>
                  <span className="text-xs bg-muted px-2 py-0.5 rounded">
                    {masterCourse.courseVersions.length} version
                    {masterCourse.courseVersions.length !== 1 && "s"}
                  </span>
                  {masterCourse.isMainOverridden && (
                    <span className="text-xs bg-warning/20 text-warning px-2 py-0.5 rounded">
                      Main Overridden
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {masterCourse.description}
                </p>

                {mainCourse && (
                  <div className="flex items-center gap-2 mt-3">
                    <Star className="h-4 w-4 text-accent fill-accent" />
                    <span className="text-sm font-medium">Main:</span>
                    <span className="font-mono text-sm bg-accent/20 text-accent px-2 py-0.5 rounded">
                      {mainCourse.code}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      ({mainCourse.accreditation})
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={onEdit}>
                    Edit Master Course
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onLinkCourse}>
                    <Link className="h-4 w-4 mr-2" />
                    Link Existing Course
                  </DropdownMenuItem>
                  {masterCourse.isMainOverridden && (
                    <DropdownMenuItem onClick={onResetMain}>
                      <StarOff className="h-4 w-4 mr-2" />
                      Reset Main to Auto
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onDelete}
                    className="text-destructive"
                  >
                    Delete Master Course
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <CollapsibleContent>
          <div className="border-t px-5 py-4 bg-muted/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-muted-foreground">
                Course Versions
              </h4>
              <Button variant="outline" size="sm" onClick={onLinkCourse}>
                <Plus className="h-3 w-3 mr-1" />
                Link Course
              </Button>
            </div>
            <div className="space-y-2">
              {masterCourse.courseVersions
                .sort((a, b) => b.accreditationYear - a.accreditationYear)
                .map((version) => (
                  <div
                    key={version.id}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border",
                      version.id === masterCourse.mainCourseId
                        ? "bg-accent/5 border-accent/30"
                        : "bg-background"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen
                        className={cn(
                          "h-4 w-4",
                          version.id === masterCourse.mainCourseId
                            ? "text-accent"
                            : "text-muted-foreground"
                        )}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">
                            {version.code}
                          </span>
                          <span className="font-medium">{version.name}</span>
                          <StatusBadge status={version.status} />
                          {version.id === masterCourse.mainCourseId && (
                            <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded flex items-center gap-1">
                              <Star className="h-3 w-3 fill-current" />
                              Main
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {version.accreditation} • {version.ects} ECTS
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {version.id !== masterCourse.mainCourseId && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSetMain(version.id)}
                          title="Set as Main Course"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onUnlinkCourse(version.id)}
                        title="Unlink from Master Course"
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Unlink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

              {masterCourse.courseVersions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No courses linked yet. Link existing courses or create new
                  ones.
                </p>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export default function MasterCourses() {
  const [masterCourses, setMasterCourses] =
    useState<MasterCourse[]>(initialMasterCourses);
  const [searchQuery, setSearchQuery] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMasterCourse, setEditingMasterCourse] =
    useState<MasterCourse | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkingToMasterCourse, setLinkingToMasterCourse] =
    useState<MasterCourse | null>(null);

  const filteredMasterCourses = masterCourses.filter(
    (mc) =>
      mc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mc.courseVersions.some(
        (cv) =>
          cv.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cv.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const handleSave = (data: { name: string; description: string }) => {
    if (editingMasterCourse) {
      setMasterCourses((prev) =>
        prev.map((mc) =>
          mc.id === editingMasterCourse.id ? { ...mc, ...data } : mc
        )
      );
      toast.success("Master course updated");
    } else {
      const newMasterCourse: MasterCourse = {
        id: `mc-${Date.now()}`,
        name: data.name,
        description: data.description,
        courseVersions: [],
        mainCourseId: null,
        isMainOverridden: false,
      };
      setMasterCourses((prev) => [newMasterCourse, ...prev]);
      toast.success("Master course created");
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      setMasterCourses((prev) => prev.filter((mc) => mc.id !== deletingId));
      toast.success("Master course deleted");
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const handleLinkCourse = (
    courseId: string,
    courseData: {
      code: string;
      name: string;
      accreditation: string;
      accreditationYear: number;
      status: "active" | "draft" | "archived";
      ects: number;
    }
  ) => {
    if (linkingToMasterCourse) {
      const newVersion: CourseVersion = {
        id: courseId,
        ...courseData,
        isMain: false,
      };

      setMasterCourses((prev) =>
        prev.map((mc) => {
          if (mc.id !== linkingToMasterCourse.id) return mc;

          const updatedVersions = [...mc.courseVersions, newVersion];
          // Auto-determine main if not overridden
          let mainCourseId = mc.mainCourseId;
          if (!mc.isMainOverridden) {
            const activeVersions = updatedVersions
              .filter((v) => v.status === "active")
              .sort((a, b) => b.accreditationYear - a.accreditationYear);
            mainCourseId = activeVersions[0]?.id || updatedVersions[0]?.id;
          }

          return {
            ...mc,
            courseVersions: updatedVersions,
            mainCourseId,
          };
        })
      );
      toast.success("Course linked successfully");
    }
  };

  const handleUnlinkCourse = (masterCourseId: string, courseVersionId: string) => {
    setMasterCourses((prev) =>
      prev.map((mc) => {
        if (mc.id !== masterCourseId) return mc;

        const updatedVersions = mc.courseVersions.filter(
          (v) => v.id !== courseVersionId
        );

        // Recalculate main if the unlinked course was main
        let mainCourseId = mc.mainCourseId;
        if (mc.mainCourseId === courseVersionId || !mc.isMainOverridden) {
          const activeVersions = updatedVersions
            .filter((v) => v.status === "active")
            .sort((a, b) => b.accreditationYear - a.accreditationYear);
          mainCourseId = activeVersions[0]?.id || updatedVersions[0]?.id || null;
        }

        return {
          ...mc,
          courseVersions: updatedVersions,
          mainCourseId,
          isMainOverridden: mc.mainCourseId === courseVersionId ? false : mc.isMainOverridden,
        };
      })
    );
    toast.success("Course unlinked");
  };

  const handleSetMain = (masterCourseId: string, courseVersionId: string) => {
    setMasterCourses((prev) =>
      prev.map((mc) =>
        mc.id === masterCourseId
          ? { ...mc, mainCourseId: courseVersionId, isMainOverridden: true }
          : mc
      )
    );
    toast.success("Main course updated");
  };

  const handleResetMain = (masterCourseId: string) => {
    setMasterCourses((prev) =>
      prev.map((mc) => {
        if (mc.id !== masterCourseId) return mc;

        const activeVersions = mc.courseVersions
          .filter((v) => v.status === "active")
          .sort((a, b) => b.accreditationYear - a.accreditationYear);
        const mainCourseId = activeVersions[0]?.id || mc.courseVersions[0]?.id || null;

        return {
          ...mc,
          mainCourseId,
          isMainOverridden: false,
        };
      })
    );
    toast.success("Main course reset to automatic");
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Master Courses"
        description="Group courses across accreditations - each master course tracks the same content under different codes"
        actions={
          <Button
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
            onClick={() => {
              setEditingMasterCourse(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Master Course
          </Button>
        }
      />

      {/* Search */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or course code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">{masterCourses.length}</p>
          <p className="text-sm text-muted-foreground">Master Courses</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">
            {masterCourses.reduce((acc, mc) => acc + mc.courseVersions.length, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Course Versions</p>
        </div>
        <div className="data-card p-4 text-center">
          <p className="text-2xl font-semibold">
            {masterCourses.filter((mc) => mc.isMainOverridden).length}
          </p>
          <p className="text-sm text-muted-foreground">Manual Overrides</p>
        </div>
      </div>

      {/* Master Courses List */}
      <div className="space-y-3">
        {filteredMasterCourses.map((mc) => (
          <MasterCourseCard
            key={mc.id}
            masterCourse={mc}
            onEdit={() => {
              setEditingMasterCourse(mc);
              setDialogOpen(true);
            }}
            onDelete={() => {
              setDeletingId(mc.id);
              setDeleteDialogOpen(true);
            }}
            onLinkCourse={() => {
              setLinkingToMasterCourse(mc);
              setLinkDialogOpen(true);
            }}
            onUnlinkCourse={(cvId) => handleUnlinkCourse(mc.id, cvId)}
            onSetMain={(cvId) => handleSetMain(mc.id, cvId)}
            onResetMain={() => handleResetMain(mc.id)}
          />
        ))}

        {filteredMasterCourses.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Layers className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No master courses found</p>
          </div>
        )}
      </div>

      <MasterCourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        masterCourse={editingMasterCourse}
        onSave={handleSave}
      />

      {linkingToMasterCourse && (
        <LinkCourseDialog
          open={linkDialogOpen}
          onOpenChange={setLinkDialogOpen}
          masterCourseName={linkingToMasterCourse.name}
          availableCourses={availableCoursesForLinking}
          onLink={handleLinkCourse}
        />
      )}

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Master Course"
        description="Are you sure you want to delete this master course? The individual courses will remain but lose their grouping."
        onConfirm={handleDelete}
      />
    </div>
  );
}
