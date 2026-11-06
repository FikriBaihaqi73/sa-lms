# Attendance Statuses API

API ini mengelola referensi status kehadiran per institusi. Seluruh endpoint membutuhkan JWT dan hanya dapat digunakan oleh role `admin` (Admin Institusi). Superadmin tidak lagi mengelola halaman ini.

| Method | URL | Keterangan |
| --- | --- | --- |
| `GET` | `/attendance-statuses` | Daftar status aktif pada institusi admin |
| `GET` | `/attendance-statuses/:id` | Detail status aktif pada institusi admin |
| `POST` | `/attendance-statuses` | Membuat status pada institusi admin |
| `PATCH` | `/attendance-statuses/:id` | Mengubah status milik institusi admin |
| `DELETE` | `/attendance-statuses/:id` | Soft-delete status yang tidak sedang dipakai |

## Request

Header:

```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Body create:

```json
{ "name": "Hadir", "description": "Siswa hadir mengikuti pembelajaran" }
```

Body update menerima `name` dan `description` secara opsional. `institution_id` tidak boleh dikirim client; server mengambilnya dari profile user yang login.

## Scoping

Semua operasi memakai `institution_id` dari profile user. ID status milik institusi lain diperlakukan sebagai `404`, sehingga keberadaannya tidak bocor.

Nama unik per institusi melalui `(institution_id, name)`. Jika create memakai nama dari baris soft-deleted pada institusi yang sama, baris tersebut dipulihkan dan deskripsinya diperbarui.

## Respons error

Duplicate name:

```json
{
  "status": "error",
  "code": 409,
  "message": "Attendance status name already exists in this institution",
  "data": null
}
```

Status yang masih dipakai attendance aktif tidak dapat dihapus:

```json
{
  "status": "error",
  "code": 409,
  "message": "Attendance status is still used by attendance records",
  "data": null
}
```

User tanpa institusi mendapat `403` dengan pesan `Institution access is required`.

## Seed default

`pnpm --filter @repo/shared seed:attendance-statuses` memastikan `Hadir`, `Izin`, `Sakit`, dan `Alpa` tersedia untuk setiap institusi. Script idempotent dan tidak dijalankan otomatis oleh auth registration.
