# Exam Applications — Student Portal

Replace the placeholder `Exams` page at `/students/:id/exams` with a real exam application experience, reusing the enrolment planner's two-panel layout, card/badge styling and payment summary pattern.

## Page structure

**Header** — "Exam Applications" + a session switcher: a row of session tabs/pills, e.g.
`June 2026 — Open (until 12 Sep)` · `January 2026 — Late application` · `June 2025 — Late application`.
Only the current session is fee-free; the others are marked `Late application · €10 per exam`. A short line under the header explains the rule in plain language.

**Left panel — eligible courses.** One row/card per course the student can sit in the selected session:
- Course name, code, ECTS, semester it was taken in
- Eligibility line: signature obtained ✓ / not obtained ✕ (blocked, with reason), previous attempts count
- Professor select — a dropdown of the professors teaching that course (the group/allocation professors), defaulting to the student's assigned professor. Required before the course can be applied for.
- Exam date/time and hall shown as read-only info once the professor is picked (date depends on the session schedule).
- `Apply` toggle button; applied rows get an `Applied` badge and a Remove action. Blocked rows are disabled with the reason inline.
- Search + filter (all / eligible only / already applied).

**Right panel — review & payment (sticky).**
- Selected session, count of applied exams
- Fee breakdown reusing the enrolment `PaymentSummary` pattern: application fee per exam (placeholder), late fee per exam when the session is a past one, administrative/university fee placeholder, **Total**
- List of applied exams with professor and date
- `Submit applications` primary button → confirmation dialog with the same breakdown, then toast + rows move to a `Submitted` state.

**Applied exams history** — a collapsible section (or second tab) listing already-submitted applications for the session: course, professor, date, status badge (`Submitted`, `Withdrawn`, `Graded`), with a `Withdraw` action available only while the session is open.

## Statuses

Reuse existing tokens: accent for `Applied`, muted for `Submitted`, warning for `Late application` / `Signature missing`, destructive-muted for blocked, success for `Graded`. No new colours.

## Mock data

New `src/data/student-exams-data.ts`:
- `ExamSession` — id, label, start/end, `isCurrent`, `lateFeePerExam`
- `ExamCourse` — course info, `signatureObtained`, `attempts`, `professors[]` (id, name, title), `defaultProfessorId`, per-session `examDate`/`hall`
- `examFees` placeholder object — `applicationFeePerExam`, `lateFeePerExam`, `administrativeFee` (wired to backend later, same as `enrolmentFees`)
- A handful of courses for Aleksandar Petrov, including one blocked by a missing signature and one with two professors to exercise the professor choice.

All state is local React state; no backend work.

## Technical notes

- Files: `src/pages/student/StudentExams.tsx` (new page, or `src/pages/StudentExams.tsx` to match current flat layout), `src/data/student-exams-data.ts`, route swap in `src/App.tsx` (currently a `StudentPlaceholderPage`).
- Uses existing shadcn Card, Badge, Select, Dialog, Collapsible, Button, Tabs, Tooltip and `useToast`; currency via `formatEUR` from `quotas-data`.
- Fee math: `applied.length × applicationFee + (session.isCurrent ? 0 : applied.length × lateFee) + administrativeFee`.
- Responsive: panels stack on mobile with the review panel collapsing to a bottom summary bar.
