
# Teacher Portal

A standalone portal for teachers, structured like the existing Student Portal (collapsible sidebar shell, dedicated routes, no admin menu). All data is mocked — no backend wiring in this pass.

## Shell & navigation

New layout `TeacherPortalLayout` (clone of `StudentPortalLayout`) wraps every `/teachers/:id/...` route via a `Portal` wrapper in `App.tsx`.

Sidebar items:
- Dashboard
- Profile
- My Courses
- Student Lookup
- Exam Sessions
- Grade Entry
- Signatures
- Reports
- Email Students

Header keeps the same dark bar (trigger, teacher name/title, globe/bell/help/logout, avatar).

## Routes

```text
/teachers/:id                          Dashboard
/teachers/:id/profile                  Profile
/teachers/:id/courses                  My Courses
/teachers/:id/exam-sessions            Exam Sessions
/teachers/:id/lookup                   Student Lookup (search)
/teachers/:id/lookup/:studentId        Student detail (tab redirect → courses)
/teachers/:id/lookup/:studentId/courses
/teachers/:id/lookup/:studentId/grades
/teachers/:id/lookup/:studentId/violations
/teachers/:id/grades                   Grade Entry
/teachers/:id/grades/conditional       Conditional Grade Entry
/teachers/:id/signatures               Signature Entry
/teachers/:id/signatures/conditional   Conditional Signatures
/teachers/:id/reports                  Reports hub
/teachers/:id/reports/enrolled
/teachers/:id/reports/passed
/teachers/:id/reports/exam-applications
/teachers/:id/email                    Email composer
```

## Student Lookup (hybrid tabs + routes)

A persistent search bar (by student ID number, with autocomplete on name/index) sits above the content. Once a student is selected, the URL changes to `/teachers/:id/lookup/:studentId/<tab>` and a sticky student header (photo, name, index, programme, year, status) renders with three tabs as `NavLink`s — so each tab is deep-linkable, but the search context is preserved.

Tabs:
1. **Enrolled Courses** — table grouped by semester: course, ECTS, type, teacher, status.
2. **Grades** — full transcript table. Rows for courses the current teacher is assigned to are editable inline (grade + date + note); other rows are read-only with a lock icon. Save shows a toast.
3. **Disciplinary Violations** — list/table: date, subject (if course-bound), type, severity badge, description, decision, attachments. Click row → side sheet with full detail.

## Reports hub

Landing page (`/teachers/:id/reports`) is a grid of report cards (icon, title, description, "Open"). Each card routes to its own page. All three report pages share a `ReportPageShell` component:

- Filter bar (Semester select, Subject select, plus report-specific filters)
- Paginated DataTable (uses existing `DataTable` + `Pagination`)
- Result count + `Export` split-button (CSV / Excel / PDF; mocked download)
- Empty state when filters yield nothing

Report pages:
1. **Enrolled Students** — columns: index, name, programme, year, enrollment date, status.
2. **Passed Students** — adds: grade, exam date, exam session, attempt #.
3. **Exam Applications** — adds: application date, exam session, status (applied/withdrawn), professor role.

## Grade Entry

`/teachers/:id/grades` — a single working table for entering grades.

Filter bar: Subject, Semester, Exam Session, "Has submitted application" toggle (Yes / No / All).

Table columns: index, student, programme, application status badge, current grade, **new grade** input, exam date, note, row status indicator. Bulk selection checkboxes. Toolbar actions:
- `Save changes` (per-row edits)
- `Bulk Import` → opens a wizard:
  1. Upload CSV/XLSX (template download link)
  2. **Review** step: parsed rows shown in a table with validation badges (OK / warning / error) and reason chips (disciplinary block, no application, teacher not assigned, unknown student, invalid grade)
  3. **Submit** step: only OK + warning rows are submitted
  4. **Report** screen: success/failure counts, downloadable result CSV, per-row outcome with reason

`/teachers/:id/grades/conditional` — same UX, but pre-filtered to students without an application, and saved entries are tagged "Conditional" so they appear in a separate stream.

## Signatures Entry

`/teachers/:id/signatures` and `/teachers/:id/signatures/conditional` — identical structure to Grade Entry, but the editable column is **Signature** (granted / refused / pending, with optional date and note) instead of grade. Same bulk import wizard with the same result report.

## Email Students

`/teachers/:id/email` — a composer page:

- Recipient picker: filter by Subject + Semester, multi-select students with chips; "Select all (n)" shortcut.
- Subject input.
- Rich text editor (TipTap with StarterKit + Link + Lists + simple toolbar — bold/italic/underline/heading/bullet/numbered/link/clear).
- Optional attachment slot (UI only).
- Preview pane + `Send` (mocked, toast confirmation).

## Dashboard / Profile / My Courses / Exam Sessions

- **Dashboard**: greeting, KPI tiles (active courses, pending grade entries, upcoming exam sessions, unread mentions), Quick Actions to the heavy pages, Recent Activity.
- **Profile**: read-only personal/employment info, similar to `StudentProfileInfo`.
- **My Courses**: list of courses the teacher is assigned to, grouped by semester, with student counts and quick links to Grade Entry filtered to that course.
- **Exam Sessions**: list of upcoming/active sessions the teacher is on, with date, room, subject, applicant count.

Initial pass renders these with the existing `StudentPlaceholderPage` style for any sections we don't fully build yet — but Dashboard, My Courses, Student Lookup, Grade Entry, Signatures, Reports, and Email will be implemented fully (with mock data).

## Mock data

New files under `src/data/`:
- `teachers-data.ts` (already exists — extend if needed)
- `teacher-courses-data.ts`
- `teacher-students-data.ts` (students assigned via the teacher's courses)
- `teacher-grades-data.ts`
- `teacher-violations-data.ts`
- `teacher-exam-sessions-data.ts`
- `teacher-applications-data.ts`

## Tech notes (for developer)

- TipTap deps: `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`.
- File parsing for bulk import preview: use `papaparse` for CSV; XLSX handled via `xlsx` package (already permitted) — kept client-side, no upload.
- Export buttons can use `papaparse` (CSV) and a tiny `xlsx` writer; PDF export stubbed with a toast for now.
- Reuse `DataTable`, `Pagination`, `PageHeader`, `StatusBadge`, `Sidebar`, sheet/dialog primitives.
- No new tables in Cloud — this is a presentation-layer build with mock data, ready to be wired later.

## Out of scope (this pass)

- Real persistence / RLS / auth.
- Sending real email.
- Real PDF generation.
- Teacher login flow (entered via `/teachers/:id` like the student portal).
