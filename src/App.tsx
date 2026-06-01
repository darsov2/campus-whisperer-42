import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import { ReactNode } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { StudentPortalLayout } from "@/components/layout/StudentPortalLayout";
import Index from "./pages/Index";
import Semesters from "./pages/Semesters";
import Faculties from "./pages/Faculties";
import Programmes from "./pages/Programmes";
import Courses from "./pages/Courses";
import CourseTeachers from "./pages/CourseTeachers";
import CourseProgrammes from "./pages/CourseProgrammes";
import MasterCourses from "./pages/MasterCourses";
import Teachers from "./pages/Teachers";
import Students from "./pages/Students";
import StudentProfile from "./pages/StudentProfile";
import StudentProfileInfo from "./pages/StudentProfileInfo";
import { StudentPlaceholderPage } from "./pages/StudentPlaceholderPage";
import StudentSemesters from "./pages/StudentSemesters";
import StudentSemesterDetail from "./pages/StudentSemesterDetail";
import { BookOpen, ClipboardList, Award, FileText, Wallet, FileCheck } from "lucide-react";
import Quotes from "./pages/Quotes";
import QuotaPricing from "./pages/QuotaPricing";
import Reports from "./pages/Reports";
import RuleEngine from "./pages/RuleEngine";
import Accreditations from "./pages/Accreditations";
import Settings from "./pages/Settings";
import Allocation from "./pages/Allocation";
import CourseAllocation from "./pages/CourseAllocation";
import Equivalences from "./pages/Equivalences";
import EquivalenceDetail from "./pages/EquivalenceDetail";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const Admin = ({ children }: { children: ReactNode }) => <MainLayout>{children}</MainLayout>;
const Portal = ({ children }: { children: ReactNode }) => <StudentPortalLayout>{children}</StudentPortalLayout>;

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Student portal — standalone shell */}
          <Route path="/students/:id" element={<Portal><StudentProfile /></Portal>} />
          <Route path="/students/:id/profile" element={<Portal><StudentProfileInfo /></Portal>} />
          <Route path="/students/:id/semesters" element={<Portal><StudentSemesters /></Portal>} />
          <Route path="/students/:id/semesters/:semesterId" element={<Portal><StudentSemesterDetail /></Portal>} />
          <Route path="/students/:id/courses" element={<Portal><StudentPlaceholderPage title="Courses" description="All courses you are enrolled in across semesters." icon={BookOpen} /></Portal>} />
          <Route path="/students/:id/exams" element={<Portal><StudentPlaceholderPage title="Exams" description="Apply for exams, view schedule and history." icon={ClipboardList} /></Portal>} />
          <Route path="/students/:id/grades" element={<Portal><StudentPlaceholderPage title="Grades" description="Your full grade book and transcripts." icon={Award} /></Portal>} />
          <Route path="/students/:id/finance" element={<Portal><StudentPlaceholderPage title="Finance" description="Tuition, payments and balances." icon={Wallet} /></Portal>} />
          <Route path="/students/:id/documents" element={<Portal><StudentPlaceholderPage title="Documents" description="Uploaded documents and submissions." icon={FileText} /></Portal>} />
          <Route path="/students/:id/e-documents" element={<Portal><StudentPlaceholderPage title="E-Documents" description="Official digital transcripts and certificates." icon={FileCheck} /></Portal>} />

          {/* Admin app */}
          <Route path="/" element={<Admin><Index /></Admin>} />
          <Route path="/semesters" element={<Admin><Semesters /></Admin>} />
          <Route path="/faculties" element={<Admin><Faculties /></Admin>} />
          <Route path="/programmes" element={<Admin><Programmes /></Admin>} />
          <Route path="/courses" element={<Admin><Courses /></Admin>} />
          <Route path="/courses/:courseId/teachers" element={<Admin><CourseTeachers /></Admin>} />
          <Route path="/master-courses" element={<Admin><MasterCourses /></Admin>} />
          <Route path="/course-programmes" element={<Admin><CourseProgrammes /></Admin>} />
          <Route path="/allocation" element={<Admin><Allocation /></Admin>} />
          <Route path="/allocation/:courseId" element={<Admin><CourseAllocation /></Admin>} />
          <Route path="/teachers" element={<Admin><Teachers /></Admin>} />
          <Route path="/students" element={<Admin><Students /></Admin>} />
          <Route path="/equivalences" element={<Admin><Equivalences /></Admin>} />
          <Route path="/equivalences/:id" element={<Admin><EquivalenceDetail /></Admin>} />
          <Route path="/quotes" element={<Admin><Quotes /></Admin>} />
          <Route path="/quota-pricing" element={<Admin><QuotaPricing /></Admin>} />
          <Route path="/reports" element={<Admin><Reports /></Admin>} />
          <Route path="/rules" element={<Admin><RuleEngine /></Admin>} />
          <Route path="/accreditations" element={<Admin><Accreditations /></Admin>} />
          <Route path="/settings" element={<Admin><Settings /></Admin>} />
          <Route path="*" element={<Admin><NotFound /></Admin>} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
