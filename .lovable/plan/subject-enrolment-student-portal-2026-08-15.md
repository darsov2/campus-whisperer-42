# Subject Enrolment — Student Portal

Add a new **Enrolment** page inside the existing Student Portal (sidebar item between Semesters and Courses), at `/students/:id/enrolment`. It reuses the portal's current layout, dark header, card/badge styling and dialog patterns — no new shell, no redesign.

## Page structure

**Header block** (existing page-header style): "Subject Enrolment" + "Winter Semester 2026/27", with a compact summary strip: Study programme, Current semester, GPA, and a live `30 / 40 ECTS` counter with a slim progress bar. The counter updates instantly on every selection and is sticky-visible while scrolling.

**Sections** (only rendered when they have content):

1. **Re-enrolled subjects** — previously failed mandatory subjects, pre-selected and not removable. Badge: `Re-enrolled`.
   - Late-grade case: `Grade pending` badge, explanatory note, and a "Choose replacement subject" action. Once chosen, the replacement renders nested under the original as a conditional alternative (single card group, dashed connector, `Replacement selected` badge) and only one of the two counts toward ECTS.
2. **Mandatory subjects** — auto-enrolled ones show `Automatically enrolled`; blocked ones show `Requirements not fulfilled` with a "View requirements" disclosure listing plain-language checks (✓ / ✕ with current vs required values). No rule trees, no IDs.
3. **Electives** — one card per elective slot, titled by the requirement name (e.g. "Software Engineering Elective"), `Action required` until filled. "Choose subject" opens a dialog scoped to that requirement showing **Available** subjects (name, ECTS, code, ✓ prerequisites fulfilled, Select) and a collapsible **Unavailable** group with disabled rows plus the reason. Selecting fills the card in place with a `Selected` badge and a Change/Remove action.
4. **Additional subjects** — shown only after all normal slots are filled.
   - GPA ≥ 8.5: direct "Add additional subject" (same picker), marked `Additional subject`.
   - GPA < 8.5: picker + optional justification textarea + "Submit request"; result renders visually distinct (dashed border, muted) with `Pending approval` / `Approved` / `Rejected`, never like a confirmed enrolment.
   - A GPA toggle in the mock data/dev switch on the page lets you preview both states.

**ECTS enforcement** — any option that would push the total above 40 is disabled in the picker with the explanatory sentence shown inline on hover/description; no post-submit validation.

**Review & submit** — a summary panel at the bottom (and in a confirmation dialog) splitting: Confirmed enrolments (with total), Conditional replacements, Approval requests. Primary "Submit enrolment" button using the portal's existing button + toast confirmation pattern; disabled while any `Action required` slot remains, with a short reason line.

## Statuses

One subtle badge system reusing existing tokens: neutral/muted for automatic and re-enrolled, accent for selected, warning for action required / grade pending / pending approval, destructive-muted for requirements not fulfilled and rejected, success for approved. No new colours introduced.

## Mock data

New `src/data/student-enrolment-data.ts` for Aleksandar Petrov, Software Engineering and Information Systems, semester 5, GPA 8.72:
- Databases (6) failed mandatory, re-enrolled
- Operating Systems (6) failed-with-missing-grade → late-grade replacement scenario
- Software Architecture (6) + Web Programming (6) auto-enrolled mandatory
- Advanced Algorithms (6) blocked: Algorithms I ✓, Programming II ✓, 120 ECTS ✕ (current 114)
- Two elective slots with groups; eligible options (Distributed Systems, Cloud Computing, Mobile Development…) and unavailable ones (Artificial Intelligence — Algorithms not completed)
- Additional subject pool (e.g. Machine Learning) for both GPA paths

All state is local React state; no backend work.

## Technical notes

- Files: `src/pages/student/StudentEnrolment.tsx` (page) plus small local components for subject card, requirements disclosure, and the subject picker dialog; `src/data/student-enrolment-data.ts`; route in `src/App.tsx`; nav entry in `StudentPortalLayout`.
- Uses existing shadcn Card, Badge, Dialog, Collapsible, Progress, Button, Tooltip and the toast hook already in the project.
- Programme slots exist only in the data layer to drive grouping and eligibility; never surfaced as identifiers in the UI.
- Responsive: single-column stack on mobile, two-column card content on desktop; keyboard-accessible dialogs and disclosures with proper labels.
