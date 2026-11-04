# Attendance and Teaching Journals API

Both features use JSON requests and return `{ "status", "message", "data", "code" }`.

## Attendances

| Method | URL | Purpose |
| --- | --- | --- |
| GET | `/attendances` | List active attendance records. |
| GET | `/attendances/:id` | Get one record. |
| POST | `/attendances` | Create a record. |
| PATCH | `/attendances/:id` | Update a record. |
| DELETE | `/attendances/:id` | Soft-delete a record. |

Send `Content-Type: application/json`. Create example:

```json
{
  "schedule_id": "b3ecbb44-7a11-4ebb-b8ff-9001c20b6721",
  "student_id": "6e278a13-a4ed-4d23-9d70-9ad9746b436a",
  "attendance_status_id": "218734a3-e3f2-4791-b6c5-04b8ef9b1ef7",
  "attendance_date": "2026-09-10T00:00:00.000Z",
  "notes": "Present on time"
}
```

The three IDs are required; the date and notes are optional. The schedule, student, and attendance status must exist. One active record is allowed for each schedule, student, and supplied date. A duplicate returns HTTP 409; missing related data or an unknown ID returns HTTP 404. Zod validation returns field-specific HTTP 400 errors.

## Teaching journals

Access requires a valid bearer token and an active profile and institution. Admins can only list and read journals within their institution. Teachers can list and read journals for their assigned schedules and can create journals only for those schedules. Only teachers can update or delete journals, and only when `created_by` identifies the requesting user and the schedule is still assigned to that teacher. Journals without a recorded creator cannot be updated or deleted through this API. Missing or inaccessible journals and schedules return 404; missing institution context or an unauthorized role returns 403. Create records the authenticated user as `created_by`.

| Method | URL | Purpose |
| --- | --- | --- |
| GET | `/teaching-journals` | List active journals. |
| GET | `/teaching-journals/:id` | Get one journal. |
| POST | `/teaching-journals` | Create a journal. |
| PATCH | `/teaching-journals/:id` | Update a journal. |
| DELETE | `/teaching-journals/:id` | Soft-delete a journal. |

Create example:

```json
{
  "schedule_id": "b3ecbb44-7a11-4ebb-b8ff-9001c20b6721",
  "meeting_number": 1,
  "journal_date": "2026-09-10T00:00:00.000Z",
  "topic": "Introduction to Algebra",
  "material": "Variables and expressions",
  "notes": "Class completed as planned"
}
```

Only `schedule_id` is required. `meeting_number` must be an integer of at least 1, and `topic` accepts at most 255 characters. The schedule must exist; otherwise the API returns HTTP 404. All fields in PATCH are optional.

## Response examples

Successful create returns HTTP 201:

```json
{
  "status": "success",
  "message": "Attendance created successfully",
  "data": { "id": "...", "schedule_id": "...", "student_id": "..." },
  "code": 201
}
```

A client can refresh the relevant list after POST, PATCH, or DELETE. DELETE responds with `data: { "success": true, "id": "..." }`; deleted records are omitted from later GET results.
