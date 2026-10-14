# TASK 0198 — Academic Years: Pindah dari Superadmin ke Admin Institusi

## Overview

Fitur **Academic Years (Tahun Ajaran)** dipindahkan dari **Superadmin** ke **Admin (institusi)**. Sebelum TASK 0198 endpoint `GET/POST/PATCH/DELETE /academic-years` tidak dibatasi role sama sekali dan halaman frontend berada di guard `ADMIN_ACCESSIBLE_PREFIXES` (admin + superadmin). Setelah TASK 0198:

- **Backend**: `AcademicYearController` diberi `@Roles("admin")` — hanya token dengan role `admin` yang diterima `RolesGuard`; token `superadmin`, `teacher`, `student`, `guardian` menerima **403 Forbidden**.
- **Scoping**: seluruh operasi di-scope ke institusi milik admin yang login (`institution_id` dari user → repository).
- **Frontend**: menu "Tahun Ajaran" pindah ke section **Admin** sidebar, route `/academic-years` masuk `INSTITUTION_ADMIN_ONLY_PREFIXES` (Superadmin menerima halaman 403).

## Endpoints

Semua endpoint di bawah **membutuhkan** `Authorization: Bearer <JWT>` dengan role `admin`.

| Method | URL | Deskripsi |
| --- | --- | --- |
| `GET` | `/academic-years` | List academic years milik institusi admin |
| `GET` | `/academic-years/:id` | Detail satu academic year (wajib milik institusi admin) |
| `POST` | `/academic-years` | Buat academic year baru |
| `PATCH` | `/academic-years/:id` | Update academic year |
| `DELETE` | `/academic-years/:id` | Hapus academic year |

### Request headers

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

### Contoh body

`POST /academic-years`:

```json
{ "academic_year": "2026/2027", "is_active": true, "institution_id": "<uuid>" }
```

`PATCH /academic-years/:id`:

```json
{ "academic_year": "2027/2028", "is_active": false }
```

## Response

### Sukses (format standar ResponseHelper)

```json
{
  "status": "success",
  "code": 200,
  "message": "Academic years retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "academic_year": "2026/2027",
      "is_active": true,
      "institution_id": "uuid-institusi",
      "created_at": "2026-10-01T00:00:00.000Z",
      "updated_at": "2026-10-01T00:00:00.000Z"
    }
  ]
}
```

`POST` memakai `code: 201`. Field `institution_id` ikut di-select (`academicYearSelect`) agar frontend dapat memverifikasi kepemilikan data.

### Error

| Kondisi | HTTP | Pesan |
| --- | --- | --- |
| Role bukan `admin` (superadmin/teacher/student/guardian) | 403 | Pesan umum dari `RolesGuard` (Forbidden) |
| Tidak ada / invalid JWT | 401 | Unauthorized |
| ID tidak ditemukan atau bukan milik institusi admin | 404 | `Academic year not found` |
| Duplikat (`academic_year` sama dalam institusi yang sama) | 409 | Pesan duplikat |
| Validasi Zod gagal | 400 | `Validation failed` + daftar `errors[]` per-field |

Contoh 403:

```json
{
  "status": "error",
  "code": 403,
  "message": "Forbidden"
}
```

Contoh 400 validasi:

```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [{ "field": "academic_year", "message": "Academic year is required" }]
}
```


## Alur Frontend

1. **Guard route** — `src/routes/__root.tsx`:
   - `/academic-years` **dihapus** dari `ADMIN_ACCESSIBLE_PREFIXES`.
   - `/academic-years` **ditambahkan** ke `INSTITUTION_ADMIN_ONLY_PREFIXES` (bersama `/students`, `/teachers`, `/semesters`).
   - Jika role ≠ `admin` (termasuk `superadmin`), komponen `AccessDenied` merender **403 — Akses ditolak** dengan pesan: `Halaman ini membutuhkan hak akses Admin Institusi...`
2. **Sidebar** — `src/components/app-sidebar.tsx`:
   - NavItem "Tahun Ajaran" dihapus dari section **Master Data Global** (Superadmin).
   - NavItem "Tahun Ajaran" ditambahkan ke section **Data Akademik** (Admin), bersama Nilai Akademik, Semester, Kelas, Guru, Siswa.
3. **Data fetching** — `features/academic-years/hooks/useAcademicYears.ts` menggunakan `@tanstack/react-query` dengan `queryKey: ["academic-years"]`; API calls via `lib/api.ts` (`apiFetch`) — tidak ada perubahan endpoint.
4. **Halaman** — `routes/_settings/academic-years/index.tsx` → `AcademicYearsPage` (CRUD penuh) tidak berubah; cukup guard + menu.

### Catatan untuk frontend developer

- Superadmin **tidak lagi** melihat menu maupun dapat mengakses `/academic-years` — tampilkan 403 bila user mencoba akses langsung via URL.
- `GET /academic-years` dengan token superadmin akan memunculkan 403 di network call; jangan fetch sama sekali untuk role selain `admin`.
- Halaman Semesters memakai `useAcademicYears()` untuk dropdown — hanya dirender untuk admin, jadi aman.

## Backend (API)

- `apps/api/src/academic-year/academic-year.controller.ts`:
  - `@Roles("admin")` di level class (berlaku untuk semua 5 handler).
  - Setiap handler mengambil `request.user.sub` dan meneruskannya ke service → repository scoping by `institution_id`.
  - `@ApiOperation` summary diperbarui agar mencantumkan "…of the authenticated admin's institution".
- `apps/api/src/academic-year/academic-year.service.ts` / `packages/shared/.../academic-year.repository.ts`: resolusi institusi dari user id, scoping query, dan duplikat-check per institusi.
- `packages/shared/src/selects/academic-year.select.ts`: menambahkan `institution_id`.
- Tests: `academic-year.controller.spec.ts` (baru) memverifikasi metadata `Reflector` untuk `@Roles("admin")` di class & semua handler (mengandung `admin`, tidak mengandung `superadmin`), plus spec service/repository yang ada (total **26 tests / 2 suites** lulus).

## Validasi / Verifikasi

| Pemeriksaan | Hasil |
| --- | --- |
| `jest academic-year` (apps/api) | ✅ 2 suites, 26 tests lulus |
| `nest build` (apps/api) | ✅ 0 error TS |
| `tsc -b` (apps/web) | ✅ exit 0 |
| `vite build` (apps/web) | ✅ exit 0 (2460 modules) |
| `eslint .` (apps/web) | ✅ 0 error di file akademik; 14 error lain **pre-existing** di fitur lain |
| `vitest run` (apps/web) | ⚠️ hanya gagal di `grades.spec.ts` (pre-existing, "No test suite found" — tidak terkait TASK ini) |

## Edge Cases

- **Superadmin mencoba akses API**: ditolak `RolesGuard` 403 sebelum menyentuh service (dijamin guard global).
- **Admin institusi A mencoba ID milik institusi B**: 404 (query di-filter `institution_id`).
- **Duplikat tahun dalam institusi sama**: 409; duplikat antar institusi diizinkan.
- **User tanpa role** (`user?.role` kosong): guard frontend memperlakukan sebagai `admin` (fallback perilaku lama yang dipertahankan).
- **Spec TS**: `apps/api/tsconfig.json` ikut meng-include file spec — `tsc --noEmit` akan menampilkan error spec yang tidak dilihat `nest build` (catatan: error `role.service.spec.ts` pre-existing di HEAD, di luar scope).
