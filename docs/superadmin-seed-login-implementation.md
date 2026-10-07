# Superadmin via Seeder + Login — Frontend Handoff

Status: **verified working** (06-10-2026, live API on `http://localhost:5000`).

## 1. Background

`superadmin` **must never** be creatable from the public Register page
(security: anyone could claim the most powerful role). It is provisioned
only via seed scripts that write directly to the database.

## 2. Seed credentials (DevOps / local setup)

Run once per fresh database, in this order:

```bash
export DATABASE_URL="postgresql://postgres:<pass>@localhost:5432/lms"
pnpm --filter @repo/shared seed:roles   # creates superadmin, admin, guardian, teacher, student
pnpm --filter @repo/shared seed:users   # creates <role>@example.com / password123
```

Seeded accounts (all password `password123`):

| Email | Role |
|---|---|
| `superadmin@example.com` | `superadmin` |
| `admin@example.com` | `admin` |
| `teacher@example.com` | `teacher` |
| `guardian@example.com` | `guardian` |
| `student@example.com` | `student` |

Note: `seed-users.ts` also creates a `Default Institution` because
`profile.institution_id` is NOT NULL.

## 3. Endpoints

Base URL: `VITE_API_URL` (e.g. `http://localhost:5000`).

### 3.1 `POST /auth/login`

Request:

```json
{ "email": "superadmin@example.com", "password": "password123" }
```

Success `200` (verified live):

```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "<JWT with { sub, email, role: \"superadmin\" }>",
    "tokenType": "Bearer",
    "expiresIn": 900,
    "user": {
      "id": "4ea5f2e6-...",
      "email": "superadmin@example.com",
      "is_active": true,
      "profile": [
        {
          "fullName": "Superadmin User",
          "institution": { "id": "...", "name": "Pondok it" },
          "role": { "id": "...", "name": "superadmin" }
        }
      ],
      "activeRole": "superadmin",
      "activeInstitutionId": "...",
      "activeProfileId": "..."
    }
  },
  "code": 200
}
```

Errors:

- `401 { "message": "Invalid credentials" }` — wrong email/password,
  inactive or deleted account. Show a generic message (no field hints).
- `400` — Zod validation (email format, password 8–128 chars).

### 3.2 `POST /auth/register` (public)

Allowed roles: **`student` | `instansi` only**.

```json
{ "email": "new@test.com", "password": "password123", "role": "student" }
{ "email": "x@y.com", "password": "password123", "role": "instansi", "institutionName": "Example Academy" }
```

- `role: "superadmin"` → `400 Validation failed` with
  `errors: [{ path: ["role"], message: "Invalid option: expected one of \"student\"|\"instansi\"" }]`
  (verified live — even manual Postman/curl requests are rejected).
- `institutionName` is required when `role` is `instansi`.
- Duplicate email → `409 Registration could not be completed (email in use)`.

## 4. Frontend flow

1. **Login form** (`LoginForm.tsx` → `loginApi` in `features/auth/api/login.ts`):
   - `POST /auth/login`, persist `accessToken` to
     `localStorage["access_token"]` (+ `"token"` alias).
   - `resolveRole()` reads `user.activeRole` (preferred) → `user.role` →
     `profile.role.name` → JWT payload `role`. It already recognises
     `superadmin`, so seeded accounts work with no extra mapping.
   - Redirect: `user.role === "superadmin" ? "/nationalities" : "/grades"`.
2. **Register form** (`RegisterForm.tsx`): dropdown shows only
   `Student` + `Instansi`. Do NOT re-add `Super Admin`.
3. **Auth guard** (`AuthContext.tsx`): restores role from the JWT on
   reload; tokens without a recognised role are discarded (logged out).

## 5. Edge cases the frontend must handle

- Account with **no profile/role** → `loginApi` throws
  `"Akun ini belum memiliki peran (role). Hubungi administrator."`
  (e.g. a `student` registered before profiles existed). Show the message
  as-is; do not mask it as "invalid credentials".
- Token expiry is 900s (15 min). On `401` from protected endpoints, send
  the user back to `/login`.
- Register `409` may mean "email in use" — display the server message,
  never guess which field failed (except `400`, which has per-field errors).

## 6. What changed in code (this task)

- `packages/shared/src/schemas/auth.schema.ts` — register enum narrowed to
  `["student", "instansi"]` (+ `.describe()` SSOT for Scalar docs).
- `apps/api/src/auth/auth.service.ts` — removed the public
  `registerSuperAdmin` branch; any other role → `409 Invalid registration role`.
  (`AuthRepository.registerSuperAdmin` is kept intentionally for seed/manual use.)
- `apps/web/.../RegisterForm.tsx` — removed `<option value="superadmin">`.
- `apps/web/.../api/login.ts` — removed mock/dev-token fallbacks; backend is
  the single source of truth for the active role.
- `packages/shared/src/script/seed-users.ts` — fixed the hardcoded bcrypt
  hash for `password123` (old value never matched; verified with
  `bcrypt.compare`).
- `apps/api/src/auth/auth.service.spec.ts` — 10 tests pass, incl. negative
  cases (superadmin-via-register rejected, unknown role, missing default
  role → 503, P2002 → 409).
