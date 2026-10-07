# Role-Based Access Control (RBAC) — Backend + Frontend

Single source of truth peran user: `profiles.role_id -> roles.name`.
Registrasi hanya menentukan kategori awal (`student` langsung, `instansi`
membuat institusi + profil `admin`). Penetapan/pengubahan role final dilakukan
via baris `Profile` (CRUD profile/users atau seed), bukan pilihan bebas saat login.

## Backend

- `apps/api/src/auth/roles.decorator.ts` — `@Roles('admin', ...)` (case-insensitive).
- `apps/api/src/auth/roles.guard.ts` — global guard kedua setelah `JwtAuthGuard`.
  Tanpa `@Roles()` request lolos (default-allow agar controller lama tidak lockout).
  Dengan `@Roles()` guard baca `request.user.role` dari JWT, fallback query
  `Profile -> Role` bila JWT tidak membawa klaim role. Gagal -> `403 Insufficient role`.
- `apps/api/src/app.module.ts` — `JwtAuthGuard` lalu `RolesGuard` sebagai `APP_GUARD`.
- `AuthService.login` — JWT kini membawa `role` (lowercase) + response user membawa
  `activeRole`, `activeInstitutionId`, `activeProfileId` dari profil aktif (`findByUserId`).
- Seed `packages/shared/src/script/seed-roles.ts` — `superadmin, admin, teacher,
  guardian, student`. Jalankan: `pnpm --filter @repo/shared seed:roles`.
- Endpoint terkunci: `GradeController` + `StudentGradeController` pakai
  `@Roles("admin", "teacher", "student", "guardian")` — **semua role operasional
  diizinkan, `superadmin` sengaja tidak dicantumkan** sehingga mendapat `403`.
- Registrasi: `POST /auth/login`… `POST /auth/register` menerima
  `role: "student" | "instansi" | "superadmin"`.
  - `student` → user tanpa profil (aturan default).
  - `instansi` → buat institusi + profil `admin` (env `DEFAULT_INSTITUTION_ADMIN_ROLE`, default `admin`).
  - `superadmin` → buat user + profil `superadmin` yang menempel pada institusi
    `"System"` (dibuat otomatis saat pertama kali, karena `Profile.institution_id`
    wajib — tanpa migrasi). Nama role bisa dioverride via env
    `DEFAULT_SUPERADMIN_ROLE`. Role `superadmin` harus sudah ada di DB
    (`pnpm --filter @repo/shared seed:roles`), kalau tidak registrasi memberi `503`.
- Test: `apps/api/src/auth/roles.guard.spec.ts` (allow tanpa metadata, cocok,
  tolak, fallback profil, tolak tanpa peran, multi-role, tolak superadmin) dan
  `apps/api/src/auth/auth.service.spec.ts` (register superadmin, duplikat, 503,
  role tak dikenal, P2002).

## Frontend

- **Matriks visibilitas halaman (mutlak):**
  | Role | Menu/halaman yang tampil |
  |---|---|
  | `superadmin` | Semua halaman **KECUALI Grades** |
  | `admin`, `teacher`, `student`, `guardian` | **Hanya Grades** |
- `components/app-sidebar.tsx` — dua blok `{isSuperadmin && (...)}` untuk semua
  menu non-Grades; Grades dirender `{!isSuperadmin && (...)}`.
- `routes/__root.tsx` — guard URL langsung: `/grades*` ditolak untuk superadmin;
  prefix `SUPERADMIN_ONLY_PREFIXES` (nationalities, religions, users, roles,
  role-permissions, jenjang-institusi, activity-logs, employment-statuses,
  academic-statuses, institutions, superadmin) ditolak untuk non-superadmin.
  Keduanya menampilkan panel 403 di dalam layout.
- `routes/index.tsx` + `LoginForm.tsx` — landing page berdasar role: superadmin →
  `/nationalities`, selain itu → `/grades` (supaya tidak langsung kena 403).
- `features/auth/api/login.ts` — role di-resolve dari `user.activeRole`,
  `user.profile[].role.name`, atau klaim JWT `role`. Tanpa role -> error eksplisit
  "belum memiliki peran". Dev-mock hanya dipakai saat network error (bukan saat
  kredensial salah), token mock kini JWT-like agar `AuthContext` bisa parse.
- `features/auth/context/AuthContext.tsx` — baca `role/activeRole` dari JWT,
  token tanpa role dianggap tidak valid dan di-logout (tidak ada fallback superadmin).
- `components/app-sidebar.tsx` — menu Grades hanya render bila `role === 'admin'`.
- `routes/__root.tsx` — `/grades*` via URL langsung menampilkan panel 403 untuk
  non-admin (tetap inside layout agar tidak blank).

## Contoh

Login admin (profil role `admin`):
```json
{
  "status": "success",
  "data": {
    "accessToken": "<jwt dengan klaim role:'admin'>",
    "user": { "activeRole": "admin", "activeInstitutionId": "<uuid>", "profile": [...] }
  }
}
```

Akses terkunci sebagai superadmin:
```
GET /grades  -> 403 { "status": "error", "message": "Insufficient role" }
GET /student-grades -> 403
```

## Alur frontend

1. Login -> simpan token -> `role` dari backend.
2. Sidebar: Grades muncul hanya untuk `admin`.
3. Buka `/grades` sebagai superadmin -> panel 403 + API juga 403.
4. Akun tanpa profil/role -> pesan "belum memiliki peran", bukan superadmin diam-diam.

## Batasan / lanjutan

- Satu user = satu profil aktif (`findByUserId` = `findFirst`). Multi-profil +
  switch-role belum didukung.
- Belum permission-based (`grades.read` vs `grades.write`); guard masih level nama role.
- `@Public()` GET roles/permissions masih terbuka; audit terpisah bila ingin dikunci.
