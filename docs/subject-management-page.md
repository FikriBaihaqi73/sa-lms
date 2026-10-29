# Subject Management (Institution Admin)

## Backend contract used

The Subject model is stored in `subjects` and contains `id`, `code`, `name`, optional `credits`, optional `description`, required `institutionId`, optional `departmentId`, and created/updated/deleted timestamps. The response also selects the related institution name and optional department name.

All endpoints below require an authenticated user with the `admin` role.

| Method | URL | Purpose |
| --- | --- | --- |
| GET | `/subjects?page=1&limit=10&search=math` | List and search subjects, paginated |
| POST | `/subjects` | Create a subject |
| PATCH | `/subjects/:id` | Update a subject |
| DELETE | `/subjects/:id` | Soft-delete a subject |

List query parameters are `page` (default 1), `limit` (default 10), optional `search` (matches code or name), and optional `departmentId`. The DTO also accepts `institutionId`, but the service ignores that filter and uses the authenticated profile institution. The page uses page, limit, and search. The Subject controller currently wraps its payload in `ResponseHelper.success(...)` with an object argument, so the actual response is `{ status, message: "Success", code, data: { message, code, data } }`. For list, the inner `data` is `{ "data": Subject[], "total": number }`; create and update return the subject inside the inner `data`.

Create body follows the backend DTO: `code` (1–100 chars), `name` (1–255 chars), optional nonnegative integer `credits`, optional `description` (max 1000 chars), required UUID `institutionId`, and optional UUID `departmentId`. The UI obtains `institutionId` from `/profiles/me` to satisfy DTO validation. The service derives the effective institution from the authenticated user and overrides the submitted institution ID. Update accepts the same fields optionally; the service ignores submitted `institutionId`. The UI can update the optional department and scalar fields. The update DTO accepts `departmentId: null` to clear the optional relation. On create or update with a department ID, the Subject service verifies that the active department belongs to the authenticated user's institution. Delete is a soft delete.

Success envelope example for the list:

```json
{
  "status": "success",
  "message": "Success",
  "code": 200,
  "data": {
    "message": "Subjects retrieved successfully",
    "code": 200,
    "data": {
      "data": [],
      "total": 0
    }
  }
}
```

Validation errors are surfaced in an error toast, including backend field details when provided. Other HTTP errors, such as duplicate subject code, are displayed using the backend message.

Conflict response example (duplicate code):

```json
{
  "statusCode": 409,
  "message": "Subject code already exists",
  "error": "Conflict"
}
```

Validation response example (field paths are provided by the Zod validation pipe):

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    { "path": ["code"], "message": "Subject code is required" }
  ]
}
```

## Frontend behavior

1. The page requests `/subjects` using the current page and debounced search value.
2. Search matches the backend's code/name search. Pagination is based on the backend total count and uses 10 items per page.
3. Create loads the signed-in profile institution ID, validates the entered values, and posts to `/subjects`.
4. Edit sends only editable subject fields to `/subjects/:id`; institution ownership is not editable. Selecting `Tanpa departemen` sends `departmentId: null` to clear an existing assignment.
5. Delete asks for confirmation and calls `/subjects/:id`.
6. Successful mutations show a toast and invalidate the subject list queries. Failed loads show a retry action; empty and loading states are provided.

The frontend role guard limits `/subjects` to institution admins. The API controller also has `@Roles("admin")`; the service scopes list, read, update, and delete operations to the institution found through the authenticated user's profile and checks department assignments against that institution. Frontend filtering is not used as a security boundary.
