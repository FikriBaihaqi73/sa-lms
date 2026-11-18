# Task 0238 — Frontend Prepared / Integration Blocked

Only new files were added. Backend, existing Assignments, routes and sidebar are unchanged.

## New module

`apps/web/src/features/assignment-submissions/` exports `AssignmentSubmissionsAdminPage` and presentation types. It reuses the existing accessible Radix dialog. The page implements the supplied navy layout, four cards, dependent academic year/class/task filters, search, roster pagination and read-only details. No API client, request, mutation, export action, attachment or fabricated application data is included. Fixtures exist only in tests.

Default state is `blocked`. Other states are `loading`, `error`, and `ready`. Unavailable totals display an em dash, not zero. Ready requires a complete, authorized class roster joined to all submissions for each assignment. It is a presentation contract, not the current raw API response. Never pass raw grader objects, credentials or mixed-institution records. The eventual adapter must be separately reviewed and use the centralized client and TanStack Query.

The caller must supply validated submission statuses: valid submittedAt indicates submission; a timestamp after assignment due_date indicates late, subject to confirmed business rules. Invalid/incomplete timestamps must be resolved before passing ready data. Late is included in submitted totals. Search does not change task-level summary totals. Null scores remain unavailable; numeric zero is preserved. Decimal strings are displayed without lossy conversion. Dates use Asia/Jakarta (WIB).

## Backend dependencies

GET /assignment-submissions accepts page, limit and search only. Its JSON is `{ status, message, data: { data: Submission[], meta: { total, page, limit, totalPages } }, code }`. No requests are currently sent. Safe explicit grader selection, role authorization and institution scope are required before operational integration. Server assignment filtering, complete roster matching and safe student/profile/class fields are also required. Never treat the first 100 submissions as the full dataset. API failures must become error state, not an empty roster.

## Integration requiring approval

Proposed route: `/settings/assignment-submissions`. Existing manual router registration and sidebar entries require explicit approval under the task instructions. Do not replace `/settings/assignments`. Application access control and loader/query integration remain pending backend fixes. No route file was created because it could imply operational availability.

## Verification and acceptance

Tests cover default no-fetch behavior, header/cards, unavailable/loading/error states, dependent filters, search/reset, pagination, detail, invalid dates, empty totals and late-inclusive totals. Test fixtures are not application data. Final completion additionally requires safe backend integration, real complete data, permission tests, responsive browser review, and passing typecheck/lint/tests.

Visual differences from the image are intentional: no unapproved report download or three-dot mutation menu, no fabricated names/counts, no duplicate application top bar. Default UI shows unavailable data. The table scrolls horizontally on narrow screens; cards/filters stack. Existing shared tokens are generic light/dark tokens, so the isolated navy surface uses the requested reference colors with existing slate/blue utility styling.
