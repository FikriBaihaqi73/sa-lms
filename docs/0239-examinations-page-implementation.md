# Halaman Ujian Admin Institusi

## Akses dan scope

Halaman ini hanya dapat diakses role persis `admin`. Semua data dibatasi pada institusi pemilik `class_subject` pengguna yang login. `classSubjectId` wajib saat membuat ujian. `assignmentTypeId` opsional jika ID tersebut ada. `createdBy` dan `updatedBy` ditentukan server dari token.

## Endpoint

- `GET /api/examinations?page=1&limit=10&search=&classSubjectId=&assignmentTypeId=&dateFrom=&dateTo=` — daftar ujian.
- `GET /api/examinations/stats` — statistik `total`, `upcoming`, `completed`, dan `withoutDate`.
- `POST /api/examinations` — membuat ujian.
- `GET /api/examinations/:id` — detail ujian.
- `PUT /api/examinations/:id` — memperbarui ujian.
- `DELETE /api/examinations/:id` — soft delete.

Semua endpoint membutuhkan `Authorization: Bearer <token>` dan role `admin`.

## Payload dan tanggal

```json
{
  "classSubjectId": "uuid",
  "assignmentTypeId": "uuid",
  "title": "Ujian Tengah Semester",
  "description": "Materi bab 1 sampai 5",
  "examinationDate": "2026-11-20T08:00:00.000Z",
  "duration": 120,
  "maximumScore": 100
}
```

`maximumScore` dikembalikan sebagai `number`. Input `datetime-local` dikonversi browser menjadi ISO 8601 berdasarkan timezone lokal, kemudian ditampilkan kembali dengan format `id-ID`.

## Response dan error

Response sukses memakai `{ status, message, data, code }`. Daftar memiliki `data.data` dan `data.meta` untuk pagination.

- `400`: payload atau relasi tidak valid; error field dapat dipetakan ke form.
- `403`: pengguna tidak memiliki institusi atau role.
- `404`: ujian, class-subject, atau assignment type tidak ditemukan dalam scope.
- `409`: konflik data.

## Perilaku halaman

Halaman menyediakan search debounce, filter class-subject, assignment type, rentang tanggal, pagination, statistik, dialog tambah/ubah, soft delete, loading/error/empty state, retry, dan toast.

## Keputusan yang menunggu mentor

Guru belum boleh mengelola ujian, input nilai berada di luar scope, assignment types belum institution-scoped dan belum memiliki seed, serta status akan datang/selesai dihitung berdasarkan waktu server dan `examinationDate`. Kolom database tetap nullable dan tidak ada migrasi.
