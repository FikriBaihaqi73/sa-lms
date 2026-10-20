# 0209 — Simplify Grades Feature: Standard Grading Only

**Fitur**: `0209/0209-fix:Simplify-Grades-Feature:-Standard-Grading-Only`  
**Scope**: Frontend (`apps/web`) & Integrasi API `GET/POST/PATCH/DELETE /grades`  
**Audiens**: Frontend & Backend Developer, QA, Technical Lead  

---

## 1. Latar Belakang & Masalah Sebelumnya

Sebelumnya, rute `/grades` pada `apps/web/src/features/grades` secara keliru diimplementasikan sebagai halaman **Nilai Siswa (Student Grades)** dengan kolom Tugas (30%), UTS (30%), UAS (40%), KKM 70, kalkulasi predikat per-siswa, filter kelas/mapel/semester, dan integrasi ke endpoint `/student-grades`.

Hal ini menyebabkan inkonsistensi domain dan kebingungan pengguna, karena:
1. **Entitas Model Database**: Tabel `grades` (`packages/shared/src/prisma/schema/Grades.prisma`) adalah **Master Data Standar Penilaian (Skala & Rubrik)** yang berisi kolom `grade` (misal A, B, C), `minimumScore`, `maximumScore`, dan `description`.
2. **Backend Controller**: `GradeController` (`apps/api/src/grades`) menyediakan CRUD standar penilaian pada endpoint `/grades` (`GET`, `POST`, `PATCH`, `DELETE`).
3. **Menu Navigasi**: Pada Sidebar di bawah kategori **Konfigurasi Akademik** (berdampingan dengan Tahun Ajaran dan Semester), fungsi yang diharapkan adalah konfigurasi standar skala nilai/rubrik acuan akademik sekolah/institusi, bukan input nilai harian siswa.

Tujuan task ini adalah **menyederhanakan alur dan tampilan fitur Grades agar fokus utamanya hanya digunakan untuk mengatur, menentukan, dan menampilkan rentang standar penilaian (skala nilai/rubrik).**

---

## 2. Rincian Perubahan (Files Modified & Added)

### A. Tipe & Schema Validasi
- `apps/web/src/features/grades/types/index.ts`:
  - Mendefinisikan interface `StandardGrade`, `CreateGradeInput`, dan `UpdateGradeInput`.
  - Helper `parseScore(value: unknown)` untuk menormalkan format skor numerik atau string Decimal dari Prisma backend.
  - Helper `formatScoreRange(min, max)` untuk memformat rentang nilai (contoh: `85.00 – 100.00`, `≥ 75`, `≤ 60`, atau `Tanpa batasan skor`).
  - Helper `getGradeColorBadge(grade)` untuk styling dinamis huruf mutu (Grade A → Emerald, B → Blue, C → Amber, D → Orange, E/F → Rose).
- `apps/web/src/features/grades/schemas/gradeSchema.ts`:
  - Validasi Zod `gradeFormSchema` dengan validasi:
    - `grade`: String wajib diisi (1–50 karakter).
    - `minimumScore`: Angka 0–100, nullable/opsional.
    - `maximumScore`: Angka 0–100, nullable/opsional.
    - Refinement: `minimumScore <= maximumScore` jika kedua nilai diisi.
    - `description`: String keterangan/rubrik capaian (maksimal 255 karakter).
  - Mengekspor tipe `GradeFormInput` dan `GradeFormValues`.
- `apps/web/src/features/grades/schemas/grade-schema.ts`:
  - Re-export untuk backward-compatibility.

### B. Integrasi API & Hooks
- `apps/web/src/features/grades/api/grades.ts`:
  - Menghubungkan client langsung ke endpoint `/grades` (`GET /grades`, `GET /grades/:id`, `POST /grades`, `PATCH /grades/:id`, `DELETE /grades/:id`).
  - Menormalkan envelope `{ status, message, data, code }`.
- `apps/web/src/features/grades/hooks/useGrades.ts`:
  - `useGrades()`: Mengambil daftar standar nilai dengan invalidasi otomatis query key `["grades"]`.
  - `useCreateGrade()`: Mutasi penambahan standar nilai baru.
  - `useUpdateGrade()`: Mutasi pembaruan standar nilai.
  - `useDeleteGrade()`: Mutasi penghapusan standar nilai.

### C. Komponen Antarmuka (UI Components)
- `apps/web/src/features/grades/components/GradesHeader.tsx`:
  - Header modern dengan badge `Konfigurasi Akademik`, judul `Standar Penilaian`, deskripsi acuan rubrik, dan tombol aksi `+ Tambah Standar Nilai`.
- `apps/web/src/features/grades/components/GradesStats.tsx`:
  - 4 kartu ringkasan metrik:
    1. **Total Tingkat Skala** (jumlah predikat aktif).
    2. **Batas Skor Maksimum** (skor tertinggi dalam skala).
    3. **Batas Skor Minimum** (batas awal rentang nilai).
    4. **Rubrik Terdefinisi** (kelengkapan penjelasan rubrik).
- `apps/web/src/features/grades/components/GradesScaleVisual.tsx`:
  - Komponen visualisasi interaktif yang menampilkan distribusi skala rentang nilai dari tertinggi ke terendah secara horizontal dengan aksen warna dinamis.
- `apps/web/src/features/grades/components/GradesTable.tsx`:
  - Tabel standar penilaian dengan pencarian (search predikat / rubrik) real-time.
  - Kolom: Predikat / Grade, Rentang Nilai, Skor Minimum, Skor Maksimum, Keterangan / Rubrik, dan Tombol Aksi (Edit & Hapus).
  - Empty state dan skeleton loading state yang rapi.
- `apps/web/src/features/grades/components/GradeDialog.tsx`:
  - Dialog modal untuk Tambah dan Edit standar penilaian.
  - Menggunakan `react-hook-form` + `zodResolver` + `useWatch` (kompatibel penuh dengan React Compiler).
  - Fitur **Pratinjau Langsung (Live Preview)** kartu skala saat admin mengetik nama predikat atau rentang skor.
- `apps/web/src/features/grades/components/DeleteGradeDialog.tsx`:
  - Dialog konfirmasi aman untuk penghapusan (soft-delete) standar predikat.
- `apps/web/src/features/grades/components/GradesPage.tsx`:
  - Halaman kontainer utama yang mengorkestrasi state query, mutasi, notifikasi toast alert, dan modal dialog.

### D. Navigasi & Label Sidebar
- `apps/web/src/components/app-sidebar.tsx`:
  - Mengubah label NavItem `/grades` dari `"Nilai Akademik"` menjadi `"Standar Penilaian"`.
- `apps/web/src/routes/__root.tsx`:
  - Memperbarui pesan AccessDenied superadmin agar mencerminkan pengelolaan lingkup institusi untuk Standar Penilaian.

### E. File Usang yang Dihapus
- `apps/web/src/features/grades/components/EditGradeDialog.tsx` (dihapus — komponen lama untuk edit nilai tugas/uts/uas siswa).
- `apps/web/src/features/grades/components/GradesFilterBar.tsx` (dihapus — komponen lama untuk filter kelas/mapel murid).

---

## 3. Dokumentasi Kontrak Endpoints Backend (`/grades`)

Semua request menggunakan HTTP client terpusat `apiFetch` (`@/lib/api`) yang menyertakan header `Authorization: Bearer <token>`.

### A. GET /grades
Mengambil seluruh daftar standar penilaian yang aktif (tidak terhapus).

**Response (200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Grades retrieved successfully",
  "data": [
    {
      "id": "e4b2d189-9e0a-4286-8f3a-867df3c940b1",
      "grade": "A",
      "minimumScore": 85.00,
      "maximumScore": 100.00,
      "description": "Sangat Baik / Istimewa",
      "createdAt": "2026-10-01T08:00:00.000Z",
      "updatedAt": "2026-10-01T08:00:00.000Z",
      "deletedAt": null
    },
    {
      "id": "c1f7a245-12ab-4ef9-90bc-123456789abc",
      "grade": "B",
      "minimumScore": 70.00,
      "maximumScore": 84.99,
      "description": "Baik / Memuaskan",
      "createdAt": "2026-10-01T08:00:00.000Z",
      "updatedAt": "2026-10-01T08:00:00.000Z",
      "deletedAt": null
    }
  ]
}
```

### B. POST /grades
Membuat standar penilaian / rentang skala baru.

**Request Body:**
```json
{
  "grade": "A+",
  "minimumScore": 95,
  "maximumScore": 100,
  "description": "Capaian Luar Biasa"
}
```

**Response (201 Created):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Grade created successfully",
  "data": {
    "id": "f8a12345-6789-abcd-ef01-23456789abcd",
    "grade": "A+",
    "minimumScore": 95.00,
    "maximumScore": 100.00,
    "description": "Capaian Luar Biasa",
    "createdAt": "2026-10-20T08:00:00.000Z",
    "updatedAt": "2026-10-20T08:00:00.000Z",
    "deletedAt": null
  }
}
```

**Error Duplikasi (409 Conflict):**
```json
{
  "status": "error",
  "code": 409,
  "message": "Grade already exists"
}
```

### C. PATCH /grades/:id
Memperbarui batas rentang atau keterangan predikat yang sudah ada.

**Request Body:**
```json
{
  "grade": "A+",
  "minimumScore": 92,
  "maximumScore": 100,
  "description": "Capaian Prestasi Sangat Tinggi"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Grade updated successfully",
  "data": {
    "id": "f8a12345-6789-abcd-ef01-23456789abcd",
    "grade": "A+",
    "minimumScore": 92.00,
    "maximumScore": 100.00,
    "description": "Capaian Prestasi Sangat Tinggi",
    "createdAt": "2026-10-20T08:00:00.000Z",
    "updatedAt": "2026-10-20T08:15:00.000Z",
    "deletedAt": null
  }
}
```

### D. DELETE /grades/:id
Menghapus (soft delete) standar penilaian.

**Response (200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Grade deleted successfully",
  "data": {
    "success": true,
    "id": "f8a12345-6789-abcd-ef01-23456789abcd"
  }
}
```

---

## 4. Alur Kerja Pengguna (User Flow)

1. **Akses Halaman**:
   - Pengguna dengan peran **Admin Institusi** atau **Guru** membuka menu **Konfigurasi Akademik → Standar Penilaian** (`/grades`).
2. **Melihat Ringkasan & Visualisasi**:
   - Pengguna melihat kartu statistik (total tingkat, skor maks, skor min, rubrik).
   - Pengguna melihat diagram rentang visual (kartu skala horizontal berurutan A, B, C, D, dsb.).
3. **Mencari Standar Penilaian**:
   - Mengetikkan predikat atau kata kunci deskripsi pada bar pencarian tabel.
4. **Menambah Standar Penilaian**:
   - Klik tombol **+ Tambah Standar Nilai**.
   - Mengisi Nama Predikat/Grade (wajib), Skor Minimum, Skor Maksimum, dan Rubrik Capaian.
   - Melihat pratinjau kartu skala secara real-time.
   - Klik **Tambah Standar** → data tersimpan via `POST /grades` → query ter-refresh otomatis.
5. **Mengubah Standar Penilaian**:
   - Klik ikon **Edit** pada baris tabel yang bersangkutan.
   - Dialog form terisi dengan data yang ada, pengguna melakukan penyesuaian → Klik **Simpan Perubahan** via `PATCH /grades/:id`.
6. **Menghapus Standar Penilaian**:
   - Klik ikon **Hapus** pada baris tabel → Dialog konfirmasi terbuka → Konfirmasi via `DELETE /grades/:id`.

---

## 5. Validasi & Penanganan Edge Cases

| Skenario / Kasus | Penanganan di Frontend & Schema |
|---|---|
| Skor Minimum > Skor Maksimum (misal Min 90, Max 80) | Ditolak oleh Zod refinement: `"Nilai minimum tidak boleh lebih besar dari nilai maksimum."` |
| Skor di luar rentang 0 – 100 | Ditolak oleh Zod: `"Nilai tidak boleh kurang dari 0 / lebih dari 100"` |
| Skor berupa string desimal dari wire backend (`"85.00"`) | Dinormalkan oleh `parseScore` menjadi angka `85` |
| Hanya salah satu batas diisi (misal hanya Skor Min 75) | Diformat menjadi `≥ 75` secara fleksibel |
| Nama Predikat berupa spasi kosong | Ditolak Zod `trim().min(1)`: `"Nama predikat/grade wajib diisi"` |
| Konflik Predikat Ganda (`409 Conflict`) | Ditangkap oleh mutasi dan ditampilkan sebagai pesan error toast yang jelas |

---

## 6. Verifikasi & Hasil Pengujian

1. **Unit Testing Frontend (`vitest run`)**:
   - File: `apps/web/src/features/grades/types/grades.spec.ts`
   - Hasil: **24 uji coba lulus 100%** (mencakup parsing skor, pemformatan rentang, tema warna badge, transformasi entitas, validasi form schema, dan integrasi mock API).
2. **Unit Testing Backend (`jest "grades"`)**:
   - File: `packages/shared/src/infrastructure/repository/grades.repository.spec.ts` & `apps/api/src/grades/grades.service.spec.ts`
   - Hasil: **7 uji coba lulus 100%**.
3. **Linter Check (`eslint src/features/grades`)**:
   - Hasil: **0 errors, 0 warnings** (kompatibel penuh dengan React Compiler).
4. **Production Build (`pnpm --filter @repo/web build`)**:
   - Hasil: **Exit code 0** (`tsc -b && vite build` sukses mentransformasi 2455 modul).
