export type StudentStatus = "active" | "suspended" | "graduated" | "withdrawn";

export interface StudentProfile {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  photoUrl?: string;
  status: StudentStatus;

  // Header / summary
  programme: string;
  programmeCode: string;
  faculty: string;
  enrolledYear: number;
  currentSemester: number;
  expectedGraduation: string;
  averageGrade: number;
  totalEcts: number;
  targetEcts: number;

  // Birth
  dateOfBirth: string;
  placeOfBirth: string;
  countryOfBirth: string;
  gender: "Male" | "Female" | "Other";
  nationality: string;
  citizenship: string;

  // Previous education
  highSchoolName: string;
  highSchoolCountry: string;
  highSchoolGraduationYear: number;
  highSchoolGpa: string;
  priorUniversity?: string;
  priorCredits?: number;

  // Enrollment
  enrollmentDate: string;
  enrollmentType: "Regular" | "Transfer";
  studyMode: "Full-time" | "Part-time";
  academicYear: string;

  // Contact
  email: string;
  phone: string;
  permanentAddress: string;
  currentAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;

  // Quick-access counts
  counts: {
    semesters: number;
    courses: number;
    exams: number;
    grades: number;
    documents: number;
  };
}

export const studentProfiles: StudentProfile[] = [
  {
    id: "1",
    studentId: "2021-CS-001",
    firstName: "Alex",
    lastName: "Johnson",
    status: "active",
    programme: "Computer Science",
    programmeCode: "CS-BSC",
    faculty: "Faculty of Computer Science",
    enrolledYear: 2021,
    currentSemester: 6,
    expectedGraduation: "June 2025",
    averageGrade: 8.7,
    totalEcts: 150,
    targetEcts: 180,
    dateOfBirth: "2000-05-15",
    placeOfBirth: "Boston",
    countryOfBirth: "United States",
    gender: "Male",
    nationality: "American",
    citizenship: "United States",
    highSchoolName: "Boston Latin School",
    highSchoolCountry: "United States",
    highSchoolGraduationYear: 2021,
    highSchoolGpa: "3.9 / 4.0",
    enrollmentDate: "2021-09-01",
    enrollmentType: "Regular",
    studyMode: "Full-time",
    academicYear: "2023/2024",
    email: "alex.johnson@student.edu",
    phone: "+1 555-0201",
    permanentAddress: "123 University Ave, Campus City, ST 12345",
    currentAddress: "12 Dorm Lane, Campus City, ST 12345",
    emergencyContactName: "Sarah Johnson (Mother)",
    emergencyContactPhone: "+1 555-0301",
    counts: { semesters: 6, courses: 28, exams: 24, grades: 24, documents: 9 },
  },
  {
    id: "2",
    studentId: "2020-CS-042",
    firstName: "Maria",
    lastName: "Garcia",
    status: "active",
    programme: "Computer Science",
    programmeCode: "CS-BSC",
    faculty: "Faculty of Computer Science",
    enrolledYear: 2020,
    currentSemester: 8,
    expectedGraduation: "June 2024",
    averageGrade: 9.2,
    totalEcts: 175,
    targetEcts: 180,
    dateOfBirth: "1999-11-22",
    placeOfBirth: "Madrid",
    countryOfBirth: "Spain",
    gender: "Female",
    nationality: "Spanish",
    citizenship: "Spain",
    highSchoolName: "IES San Isidro",
    highSchoolCountry: "Spain",
    highSchoolGraduationYear: 2020,
    highSchoolGpa: "9.4 / 10",
    priorUniversity: "Universidad Complutense de Madrid",
    priorCredits: 12,
    enrollmentDate: "2020-09-01",
    enrollmentType: "Transfer",
    studyMode: "Full-time",
    academicYear: "2023/2024",
    email: "maria.garcia@student.edu",
    phone: "+1 555-0202",
    permanentAddress: "456 College Blvd, University Town, ST 54321",
    currentAddress: "456 College Blvd, University Town, ST 54321",
    emergencyContactName: "Luis Garcia (Father)",
    emergencyContactPhone: "+34 600 123 456",
    counts: { semesters: 8, courses: 36, exams: 34, grades: 34, documents: 12 },
  },
  {
    id: "3",
    studentId: "2022-MA-015",
    firstName: "James",
    lastName: "Wilson",
    status: "suspended",
    programme: "Mathematics",
    programmeCode: "MA-BSC",
    faculty: "Faculty of Natural Sciences",
    enrolledYear: 2022,
    currentSemester: 4,
    expectedGraduation: "June 2026",
    averageGrade: 6.8,
    totalEcts: 90,
    targetEcts: 180,
    dateOfBirth: "2001-03-08",
    placeOfBirth: "London",
    countryOfBirth: "United Kingdom",
    gender: "Male",
    nationality: "British",
    citizenship: "United Kingdom",
    highSchoolName: "Westminster School",
    highSchoolCountry: "United Kingdom",
    highSchoolGraduationYear: 2022,
    highSchoolGpa: "A* A A",
    enrollmentDate: "2022-09-01",
    enrollmentType: "Regular",
    studyMode: "Full-time",
    academicYear: "2023/2024",
    email: "james.wilson@student.edu",
    phone: "+1 555-0203",
    permanentAddress: "789 Academic Dr, Study City, ST 67890",
    currentAddress: "789 Academic Dr, Study City, ST 67890",
    emergencyContactName: "Emily Wilson (Sister)",
    emergencyContactPhone: "+44 7700 900123",
    counts: { semesters: 4, courses: 18, exams: 14, grades: 12, documents: 6 },
  },
];

export function getStudentProfile(id: string) {
  return studentProfiles.find((s) => s.id === id);
}
