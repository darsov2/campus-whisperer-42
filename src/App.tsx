import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Semesters from "./pages/Semesters";
import Faculties from "./pages/Faculties";
import Programmes from "./pages/Programmes";
import Courses from "./pages/Courses";
import CourseTeachers from "./pages/CourseTeachers";
import CourseProgrammes from "./pages/CourseProgrammes";
import Teachers from "./pages/Teachers";
import RuleEngine from "./pages/RuleEngine";
import Accreditations from "./pages/Accreditations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/semesters" element={<Semesters />} />
            <Route path="/faculties" element={<Faculties />} />
            <Route path="/programmes" element={<Programmes />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:courseId/teachers" element={<CourseTeachers />} />
            <Route path="/course-programmes" element={<CourseProgrammes />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/rules" element={<RuleEngine />} />
            <Route path="/accreditations" element={<Accreditations />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </MainLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
