# 0177 — Grades Page Implementation (Frontend Handoff)

**Fitur**: `feat/0177-page-grades`
**Scope**: Frontend (`apps/web`) — halaman Manajemen Nilai + integrasi `GET/PATCH /student-grades`
**Audiens**: Frontend Developer

---

## 1. Ringkasan
Halaman **Grades** (`/grades`) menampilkan daftar nilai siswa per kelas/mapel/semester
dengan kolom Tugas (30%), UTS (30%), UAS (40%), Nilai Akhir otomatis, Predikat, dan Status
(Lulus / Remedial / Belum lengkap, KKM 70). Menu **Grades** ditambahkan di sidebar tepat
di bawah **Activity Logs**.

Tema:
- Light Mode: putih + abu-abu (`slate-50/white`) + biru (`blue-700`).
- Dark Mode: navy/slate (`slate-900`) + aksen biru (`blue-600/400`).

Struktur mengikuti pola `nationalities` + aturan `AGENTS.md`:
fungsi reusable di `packages/shared`, validasi Zod dengan `.describe()`,
`ResponseHelper`, import alias `@repo/shared/*` / `#generated/client`.

---

## 2. File yang Ditambahkan/Diubah
- `apps/web/src/features/grades/types/index.ts` — tipe `GradeRow`, bobot, KKM, helper `calcFinalScore`, `gradePredicate`, `gradeStatus`.
- `apps/web/src/features/grades/schemas/grade-schema.ts` — Zod `gradeRowFormSchema` (0–100, nullable) + `gradeFilterSchema` dengan `.describe()`.
- `apps/web/src/features/grades/api/grades.ts` — `getGradesApi()` (`GET /student-grades?page=1&limit=50&search=`), mapping eager loading ke `GradeRow`, `updateGradeApi()` (`PATCH /student-grades/:id`). Dev fallback memakai `localStorage` (`mock_grades_data`) bila backend offline.
- `apps/web/src/features/grades/hooks/useGrades.ts` — `useGrades(search)`, `useUpdateGrade()` (TanStack Query, invalidasi `["grades"]`).
- `apps/web/src/features/grades/components/GradesStats.tsx` — 4 kartu: Total Siswa, Rata-rata Kelas, Lulus, Remedial.
- `apps/web/src/features/grades/components/GradesFilterBar.tsx` — search + select Kelas, Mapel, Semester.
- `apps/web/src/features/grades/components/GradesTable.tsx` — tabel 8 kolom + badge status + tombol Edit.
- `apps/web/src/features/grades/components/EditGradeDialog.tsx` — dialog edit Tugas/UTS/UAS (react-hook-form + zod).
- `apps/web/src/features/grades/components/GradesPage.tsx` — container: filter, statistik, notice, loading/error.
- `apps/web/src/features/grades/index.ts`, `apps/web/src/routes/grades/index.tsx` (`/grades`), `apps/web/src/router.tsx` (registrasi `gradesRoute`), `apps/web/src/components/app-sidebar.tsx` (link Grades di bawah Activity Logs).
- `apps/web/src/features/grades/types/grades.spec.ts` — kasus uji helper nilai (`runGradeSpecCases`, tanpa runner tambahan).
- `docs/0158-student-grades-api.md` — referensi kontrak backend yang dipakai halaman ini.

---

## 3. Endpoints & Contoh
Semua request memakai `apiFetch` (`@/lib/api`) — base URL dari `VITE_API_URL`, header `Authorization: Bearer <access_token>`.

### GET /student-grades?page=1&limit=50&search=
Response sukses mengikuti pola `{ status, message, data[], code, meta }` (lihat `docs/0158-student-grades-api.md`).
Contoh item `data[]` (eager loaded):
```json
{
  "id": "e9b1c7d2-...",
  "assignmentScore": 85,
  "midExamScore": 80,
  "finalExamScore": 88,
  "student": { "studentNumber": "STD-2026-001", "profile": { "fullName": "Ahmad Student" } },
  "classSubject": { "class": { "name": "X IPA 1" }, "subject": { "code": "MATH101", "name": "Mathematics" } },
  "academicYear": { "academic_year": "2024/2025" }
}
```

### PATCH /student-grades/:id
Request:
```json
{ "assignmentScore": 88, "midExamScore": 88, "finalExamScore": 92 }
```
Response sukses: `{ "status": "success", "code": 200, "message": "Student grade updated successfully", "data": { ... } }`.

Error penting untuk frontend:
- `404` — `Student/Class subject/Academic year/Grade letter not found` (ID referensi tidak valid).
- `409` — kombinasi `[studentId, classSubjectId, academicYearId]` sudah ada (saat create).
- `400` — skor harus angka 0–100.
- Pola validasi umum: `{ status: "error", code: 400, message: "Validation failed", errors: [{ "field": "assignmentScore", "message": "..." }] }`.

---

## 4. Alur Frontend
1. Buka `/grades` (wajib login; `__root.tsx` redirect ke `/login` jika belum auth).
2. Pilih filter Kelas (`Semua Kelas, Kelas 7A/7B/8A/9A`), Mapel (`Semua Mapel, Matematika, IPA, ...`), Semester (`Ganjil/Genap`), dan ketik search (nama/NIS/kode/nama mapel).
3. Statistik atas terhitung dari data terfilter: `final = tugas*0.3 + uts*0.3 + uas*0.4` (1 desimal). `null` jika ada komponen kosong.
4. Status: `Belum lengkap` (final null), `Lulus` (>=70), `Remedial` (<70). Predikat: A >=90, B >=80, C >=70, D <70, `Menunggu UAS` jika null.
5. Klik **Edit** → dialog Tugas/UTS/UAS (0–100, boleh kosong) → **Simpan Perubahan** → `PATCH /student-grades/:id` → invalidasi query → notice sukses.
6. Tombol **Export** dan **Tambah Nilai** saat ini aksi placeholder (belum memanggil API create/export).

---

## 5. Verifikasi
- `pnpm --filter @repo/web build` → sukses (`tsc -b && vite build`, 2202 modul, `dist/` ter-generate).
- Edge case ter-cover di `grades.spec.ts` (`runGradeSpecCases`): bobot 30/30/40 (88/88/92 → 89.6), komponen null → final null, batas 0/100, predikat A–D + null, status Lulus/Remedial/Belum lengkap.
- Manual: cek `/grades` light/dark mode, filter + search, edit nilai (termasuk UAS kosong → Status `Belum lengkap`), dan link sidebar Grades di bawah Activity Logs.
