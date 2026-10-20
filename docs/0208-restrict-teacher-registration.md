# 0208 — Restrict Teacher Registration (Admin-Only Account Creation)

Date: 2026-10-19
Scope: minimal & secure fix. No new combined endpoint, no frontend RegisterForm change.

## 1. What was already secure (no change needed)

- Public registration schema `packages/shared/src/schemas/auth.schema.ts`:
  `role: z.enum(["student", "instansi"])`. `teacher` / `admin` / `superadmin` /
  `guardian` are rejected by `ZodValidationPipe` (400).
- Service fallback `apps/api/src/auth/auth.service.ts:register()`:
  only `student` and `instansi` branches exist; anything else throws
  `409 Invalid registration role`.
- Frontend `apps/web/src/features/auth/components/RegisterForm.tsx`:
  only two buttons — `Siswa / Murid` and `Instansi / Sekolah`. No
  `Daftar sebagai Guru` / `Register as Teacher` option anywhere.
- Teacher master data `apps/api/src/teachers/teachers.controller.ts`:
  class-level `@Roles("admin")`. Frontend `/teachers` is in
  `INSTITUTION_ADMIN_ONLY_PREFIXES` with a working `Tambah guru` dialog.

## 2. Vulnerability found

`apps/api/src/profile/profile.controller.ts` had **no `@Roles()` guard**.
Any authenticated user (e.g. a freshly self-registered student) could call:

```http
POST /profiles
Authorization: Bearer <student-token>
Content-Type: application/json

{
  "userId": "<own-user-id>",
  "roleId": "<teacher-role-uuid>",
  "institutionId": "<any-institution-uuid>",
  "fullName": "Fake Teacher"
}
```

`CreateProfileSchema.roleId` accepts any UUID, so the caller could attach the
`teacher` role (seeded in `packages/shared/src/script/seed-roles.ts`) to their
own user — a privilege-escalation bypass around the closed `/auth/register`.

`GET /profiles`, `GET /profiles/:id`, `PATCH /profiles/:id`,
`DELETE /profiles/:id` were equally unguarded.

## 3. What was changed

- `apps/api/src/profile/profile.controller.ts`
  - Added class-level `@Roles("superadmin", "admin")` (+ import).
  - Added method-level `@Roles()` (empty override) on `GET /profiles/me` and
    `PATCH /profiles/me` so self-service stays open to any authenticated user.
    The global `RolesGuard` treats an empty required-roles array as allow
    (`roles.guard.ts:66-68`), while `JwtAuthGuard` still requires a valid token.
  - All other handlers (`findAll`, `findOne`, `create`, `update`, `remove`)
    inherit the admin-only roles. Student/guardian/teacher tokens now get
    `403 Insufficient role` on `POST /profiles`.
- `CreateProfileDto` / `profile.schema.ts`: intentionally **unchanged**.
  Controller-level RBAC is the single enforcement point; `roleId` must stay
  writable for admins. `ProfileService.update` already ignores `roleId`
  changes, so role elevation via `PATCH` was never possible.
- Tests:
  - `apps/api/src/profile/profile.controller.spec.ts` (new): asserts
    class-level `["superadmin","admin"]`, empty override on both `/me`
    handlers, inheritance on privileged handlers, plus `create`/`getMyProfile`
    delegation.
  - `apps/api/src/auth/auth.service.spec.ts`: added `rejects a teacher role`
    and `rejects a guardian role` cases (both expect `ConflictException` and
    zero repository writes).
  - `apps/api/src/auth/roles.guard.spec.ts`: added empty-array override case
    proving a student token passes a `@Roles()` self-service endpoint.

## 4. Current admin flow for a full teacher account (no single endpoint)

There is intentionally **no** `POST /teachers/with-account` (per ticket
Do-NOT-do). Admin creates a login-capable teacher in 3 steps, all admin-gated:

1. `POST /users` (`@Roles("superadmin","admin")`) — body
   `{ "email", "password", "is_active": true }` → returns `user.id`.
2. `POST /profiles` (now `@Roles("superadmin","admin")`) — body
   `{ "userId": "<step-1 id>", "roleId": "<teacher role uuid>", "institutionId": "<admin institution uuid>", "fullName": "<name>" }`
   → returns `profile.id`. Teacher `roleId` lookup: `GET /roles` (superadmin).
3. `POST /teachers` (`@Roles("admin")`) — body
   `{ "profile_id": "<step-2 id>", "teacher_number": "<NIP>", ... }`.

Frontend `Tambah guru` dialog (`AddTeacherDialog` /
`TeacherDialogForm`) covers step 3 only (master data, profile picker); steps
1–2 are done via Users/Profiles admin screens or API client.

## 5. Verification

- `POST /auth/register { role: "teacher" }` → 400 (Zod) or 409
  (`Invalid registration role`) — covered by updated `auth.service.spec.ts`.
- Student token → `POST /profiles { roleId: <teacher> }` → 403
  (`Insufficient role`) — covered by `profile.controller.spec.ts` role metadata
  + `roles.guard.spec.ts` empty-override case.
- Admin/superadmin token → `POST /profiles` → 201 — delegation covered by
  `profile.controller.spec.ts`.
- Existing `student` + `instansi` registration untouched; existing specs
  (`registers a student…`, `registers an institution owner…`, duplicate-email,
  503-missing-role, P2002) still pass.
- Admin teacher master-data flow (`POST /teachers`, `Tambah guru` dialog)
  untouched and still `@Roles("admin")`.
