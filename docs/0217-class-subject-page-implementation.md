# Implementasi Halaman Mata Pelajaran Kelas

## Ringkasan

Fitur ini menyediakan halaman admin institusi `/class-subjects` untuk mengelola relasi kelas, mata pelajaran, guru pengampu, dan tahun ajaran. Data dibatasi ke institusi dari profil user yang sedang login. Relasi unik berdasarkan `class_id + subject_id + academic_year_id`; `teacher_id` tidak menjadi bagian dari keunikan.

## Route dan guard

- Route frontend: `GET /class-subjects` melalui `apps/web/src/routes/_settings/class-subjects/index.tsx`.
- Akses frontend hanya untuk role eksplisit `admin`; role kosong atau tidak dikenal ditolak khusus pada route ini dan item sidebar-nya.
- Endpoint backend memakai `@Roles("admin")` dan mengambil institusi dari `request.user.sub` melalui profil user.
- Endpoint `/subjects` yang dipakai dropdown juga sekarang memakai `@Roles("admin")`; superadmin tidak otomatis mendapat akses karena `RolesGuard` mencocokkan role secara eksplisit.
- `<Toaster />` terpasang di `apps/web/src/main.tsx:7,19`.

## Endpoint

Semua endpoint membutuhkan `Authorization: Bearer <JWT>`.

| Method | URL | Request | Response utama |
|---|---|---|---|
| GET | `/class-subjects?page=1&limit=10&search=&class_id=&academic_year_id=&teacher_id=` | Query opsional; page 1+, limit 1–100, tiga filter ID harus UUID | `{ status, message, data: ClassSubject[], code, meta: { totalData, totalPages, currentPage, perPage } }` |
| POST | `/class-subjects` | `{ class_id, subject_id, teacher_id, academic_year_id }` | `{ status, message, data: ClassSubject, code }` |
| PATCH | `/class-subjects/:id` | Satu atau beberapa field UUID | `{ status, message, data: ClassSubject, code }` |
| DELETE | `/class-subjects/:id` | Tidak ada body | `{ status, message, data, code }` |

Field relasi `class` dan `teacher` mempertahankan snake_case (`institution_id`, `academic_year_id`, `teacher_number`, `profile`); field `subject` mempertahankan camelCase (`institutionId`, `createdAt`). Nama guru di UI adalah `teacher.profile?.fullName`, dengan fallback `teacher_number`.

## Aturan bisnis dan error UI

- Subject, class, teacher, dan academic year harus aktif dan berada pada institusi user.
- Duplikat relasi menghasilkan HTTP 409. Dialog menampilkan `Mata pelajaran ini sudah terdaftar di kelas dan tahun ajaran tersebut.` di bawah field Tahun Ajaran.
- Penghapusan ditolak HTTP 409 bila masih digunakan jadwal, modul, ujian, atau nilai. UI menampilkan toast `Mata pelajaran kelas tidak dapat dihapus karena masih digunakan oleh jadwal, modul, ujian, atau nilai.`
- HTTP 422 dipetakan ke field berdasarkan `errors[].path`; error field hilang ketika field tersebut diubah.
- HTTP 404/500 dan error lain ditampilkan sebagai toast error umum.
- Filter awal memakai tahun ajaran aktif milik institusi Admin. Pilihan `Semua tahun ajaran` memakai state khusus dan mengirim query tanpa `academic_year_id`.
- Setelah menghapus item terakhir pada halaman di atas halaman pertama, UI kembali satu halaman.

## Alur frontend

1. Halaman mengambil opsi kelas, guru, subject, dan tahun ajaran melalui query terpusat.
2. Opsi tahun ajaran global (`institution_id: null`) dibuang; endpoint `/academic-years` sudah di-scope backend ke institusi Admin.
3. List memakai query key yang mencakup page, limit, search, dan filter.
4. Dialog memakai React Hook Form + Zod, mereset nilai saat mode tambah/ubah berubah, lalu mutation meng-invalidasi cache list.
5. Delete memakai konfirmasi dan meng-invalidasi cache list setelah sukses.

## Struktur dan komponen reuse

- `apps/web/src/features/class-subject/api`: request API dan unwrap response subject nested.
- `hooks`: query/mutation TanStack Query.
- `components`: halaman, dialog form, dan dialog konfirmasi hapus.
- `schemas`: validasi form Zod.
- Komponen reuse: `Button`, `Input`, `Select`, dialog Radix, `toast` dari Sonner, dan `apiFetch` terpusat.

## Checklist uji manual

- Login sebagai admin institusi, buka `/class-subjects`, dan pastikan menu tampil.
- Pastikan role kosong/tidak dikenal tidak dapat membuka halaman.
- Uji pencarian, filter kelas, tahun aktif, `Semua tahun ajaran`, pagination, dan limit.
- Tambah relasi valid; ulangi relasi yang sama dengan guru berbeda dan pastikan 409.
- Ubah setiap field dan pastikan pesan validasi server hilang.
- Ubah item lalu buka dialog tambah dan pastikan form kosong.
- Hapus item terakhir pada halaman kedua; pastikan kembali ke halaman pertama.
- Coba hapus relasi yang dipakai jadwal/modul/ujian/nilai dan pastikan toast 409.

## Known issues

- Race condition duplikat masih bergantung pada constraint database yang tersedia. Proposal migrasi (tidak dijalankan):

  ```sql
  CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS class_subjects_active_unique
  ON class_subjects (class_id, subject_id, academic_year_id)
  WHERE deleted_at IS NULL;
  ```

  Sebelum migrasi, deteksi duplikat secara read-only:

  ```sql
  SELECT class_id, subject_id, academic_year_id, COUNT(*) AS duplicate_count
  FROM class_subjects
  WHERE deleted_at IS NULL
  GROUP BY class_id, subject_id, academic_year_id
  HAVING COUNT(*) > 1;
  ```

- Eager-load relasi soft delete masih dapat menampilkan relasi yang sudah dihapus.
- Response API belum divalidasi runtime di frontend.
- Statistik halaman hanya mencakup baris pada halaman aktif.
- Perilaku global role kosong di halaman lain masih menggunakan fallback `admin` pada `__root.tsx:102-106`; perubahan ini sengaja hanya mengubah route/menu `/class-subjects`.

