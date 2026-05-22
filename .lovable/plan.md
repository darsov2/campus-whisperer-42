## Student Profile Page

A dedicated page showing one student's full profile — viewable by the student themselves and by Student Services from the Students list.

### Route & Entry Points
- New route: `/students/:id` → `src/pages/StudentProfile.tsx`
- From `Students.tsx`: row "View" action navigates to this page (replacing/augmenting the existing side sheet)
- Registered in `App.tsx`

### Page Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ HEADER (always visible)                                     │
│ ┌─────┐  Name, Student ID, Programme · Year · Status badge │
│ │ pic │  ┌──────┬──────┬──────┬──────┬──────┐              │
│ │     │  │ Avg  │ ECTS │ Prog │Status│ Year │ stat tiles   │
│ └─────┘  └──────┴──────┴──────┴──────┴──────┘              │
├─────────────────────────────────────────────────────────────┤
│ QUICK-ACCESS CARDS (sticky above tabs, always visible)      │
│ [Semesters] [Courses] [Exams] [Grades] [Documents]          │
├─────────────────────────────────────────────────────────────┤
│ TABS                                                        │
│ Basic | Birth | Previous Education | Enrollment | Contact   │
│ ─────────────────────────────────────────────────────────── │
│ <active tab content>                                        │
└─────────────────────────────────────────────────────────────┘
```

### Header (top section)
- Large circular avatar (photo or initials fallback)
- Full name, student ID, programme, current year/semester
- Status badge (active / suspended / graduated / withdrawn)
- Stat tiles: **Average grade**, **Total ECTS acquired** (with target, e.g. 142 / 180), **Study programme**, **Student status**, **Enrolled year**

### Quick-access cards (above tabs, not inside)
Five cards rendered in a responsive grid between header and tabs so they remain visible regardless of active tab. Each is a clickable card with icon, label, and a short metric:
- **Semesters** → e.g. `/students/:id/semesters`
- **Courses** → `/students/:id/courses`
- **Exams** → `/students/:id/exams`
- **Grades** → `/students/:id/grades`
- **Documents** → `/students/:id/documents`

(Destination pages are out of scope for this task — cards are placeholders that route or open a stub.)

### Tabs
1. **Basic Information** — summary: name, ID, programme, status, enrollment date, quick overview
2. **Birth Information** — date of birth, place of birth, country, gender, nationality, citizenship
3. **Previous Education** — high school name, country, graduation year, GPA, prior university (if transfer), prior credits
4. **Enrollment Information** — start year, study programme, faculty, enrollment type (regular/transfer), mode (full-time/part-time), current academic year, expected graduation
5. **Contact Information** — email, phone, permanent address, current address, emergency contact

Each tab uses card-based read-only fields (label + value grid). No editing in this iteration unless asked.

### Data
- Extend `Students.tsx` mock data with the additional fields (birth, previous education, enrollment details, contact extras, photoUrl) by moving the types/mock to `src/data/students-data.ts` so both the list and the profile page consume it.
- Lookup by `:id` param; show NotFound state if missing.

### Components & Styling
- Use existing UI primitives: `Avatar`, `Badge`, `Card`, `Tabs`, `StatusBadge`, `StatCard`, `PageHeader`
- Tailwind semantic tokens only
- Sticky behavior for the quick-access card row using `sticky top-0 z-10 bg-background` under the header

### Files
- **Create**: `src/pages/StudentProfile.tsx`, `src/data/students-data.ts`
- **Edit**: `src/App.tsx` (route), `src/pages/Students.tsx` (link rows to profile, import shared data)
