# 0191 — Semesters Page Implementation

## Frontend scope

The Semesters page is available at `/semesters` for the institution Admin role. It is implemented in `apps/web/src/features/semesters` and follows the existing TanStack Query, React Hook Form, Zod, shadcn/ui, toast, and TanStack Router patterns.

## API endpoints used

The frontend uses the existing API only:

- `GET /semesters?page={page}&limit={limit}&search={search}&academic_year_id={id}`
- `POST /semesters`
- `PATCH /semesters/{id}`
- `DELETE /semesters/{id}`
- `GET /academic-years`

All requests go through `apps/web/src/lib/api.ts`, which adds the configured `VITE_API_URL` and bearer token.

## Request bodies

Create:

```json
{
  "academic_year_id": "uuid",
  "name": "Semester Ganjil",
  "start_date": "2026-07-01T00:00:00.000Z",
  "end_date": "2026-12-31T00:00:00.000Z",
  "is_active": true
}
```

Update accepts the same fields, all optional. Date inputs are optional HTML date fields and are converted to ISO datetime strings before submission. Empty date fields are omitted, matching the existing API schema.

## Response shape

The list endpoint is consumed as:

```json
{
  "status": "success",
  "message": "Semesters retrieved successfully",
  "code": 200,
  "data": [
    {
      "id": "uuid",
      "academic_year_id": "uuid",
      "name": "Semester Ganjil",
      "start_date": "2026-07-01T00:00:00.000Z",
      "end_date": null,
      "is_active": true,
      "created_at": "2026-06-01T00:00:00.000Z",
      "updated_at": "2026-06-01T00:00:00.000Z",
      "academicYear": {
        "id": "uuid",
        "academic_year": "2026/2027",
        "is_active": true,
        "created_at": "2026-05-01T00:00:00.000Z",
        "updated_at": "2026-05-01T00:00:00.000Z"
      }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

`start_date`, `end_date`, and `academicYear` are handled as nullable in the frontend. The table displays `-` when an optional date or relation is unavailable.

The Academic Year dropdown uses the existing `useAcademicYears()` hook and `GET /academic-years`; no new endpoint or mock data is introduced.

## Validation and access

- `academic_year_id` must be a UUID and is required.
- `name` is trimmed and must contain at least one character.
- `start_date` and `end_date` are optional and submitted as ISO datetime strings.
- `is_active` is submitted as a boolean.
- `/semesters` is restricted by the existing root access check to institution Admin users and is shown only in the Admin sidebar section. Superadmin does not receive the menu and gets the existing access-denied view.

