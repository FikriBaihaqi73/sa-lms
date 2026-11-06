# Implementasi Attendance Status untuk Admin Institusi

## Ringkasan

`attendance_statuses` sekarang dimiliki per institusi. Halaman `/attendance-statuses` dikelola Admin Institusi, bukan Superadmin. `institution_id` selalu berasal dari profile user di server dan tidak dikirim dari frontend.

## Akses dan endpoint

Semua endpoint memerlukan:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

| Method | URL | Akses |
| --- | --- | --- |
| GET | `/attendance-statuses?page=1&limit=10&search=Hadir` | Admin Institusi |
| GET | `/attendance-statuses/:id` | Admin Institusi |
| POST | `/attendance-statuses` | Admin Institusi |
| PATCH | `/attendance-statuses/:id` | Admin Institusi |
| DELETE | `/attendance-statuses/:id` | Admin Institusi |

Payload create/update hanya berisi:

```json
{ "name": "Hadir", "description": "Siswa hadir mengikuti pembelajaran" }
```

Jangan mengirim `institution_id`. Backend menentukan institusi dari user JWT.

## Respons

Success mengikuti format `ResponseHelper`:

```json
{
  "status": "success",
  "code": 201,
  "message": "Attendance status created successfully",
  "data": {
    "id": "uuid",
    "institution_id": "institution-uuid",
    "name": "Hadir",
    "description": "Siswa hadir mengikuti pembelajaran"
  }
}
```

Duplicate nama pada institusi yang sama menghasilkan HTTP 409:

```json
{
  "status": "error",
  "code": 409,
  "message": "Attendance status name already exists in this institution",
  "data": null
}
```

Delete status yang masih dipakai attendance aktif ditolak:

```json
{
  "status": "error",
  "code": 409,
  "message": "Attendance status is still used by attendance records",
  "data": null
}
```

Status milik institusi lain dan status yang tidak ditemukan sama-sama menghasilkan 404. User tanpa institusi mendapat 403. Nama dari baris soft-deleted dipulihkan saat create ulang pada institusi yang sama.

## Alur frontend

1. Ambil daftar status melalui `GET /attendance-statuses`.
2. Isi selector status pada halaman `/attendances` menggunakan hasil tersebut.
3. Saat create/update, kirim hanya `name` dan `description`.
4. Tampilkan error 409 nama di field nama.
5. Saat delete gagal karena digunakan attendance, tampilkan pesan bisnis dan pertahankan dialog.
6. Setelah mutasi berhasil, invalidate query `attendance-statuses`.

Halaman menampilkan loading state, empty state, retry untuk error daftar, dan error validasi server pada field terkait.

## Seed

Jalankan setelah migrasi diterapkan dan Prisma Client digenerate:

```bash
pnpm --filter @repo/shared seed:attendance-statuses
```

Script memastikan setiap institusi memiliki `Hadir`, `Izin`, `Sakit`, dan `Alpa`. Script tidak mengubah alur registrasi institusi.

## Dampak ke Presensi & Absensi

`/attendances` tetap Admin Institusi dan sekarang hanya dapat membuat/mengubah attendance menggunakan status dari institusi yang sama dengan schedule/class terkait. Status tidak dapat dihapus selama masih dipakai attendance aktif.

Superadmin tidak lagi melihat menu atau mengakses halaman `/attendance-statuses` melalui web.
