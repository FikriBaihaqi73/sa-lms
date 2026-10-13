# Student Guardian — Frontend Handoff

Halaman **Student Guardian** tersedia untuk Admin Institusi di `/student-guardians`. Halaman ini mengelola relasi antara siswa dan wali/orang tua, bukan data master wali itu sendiri.

## Endpoint

| Method | URL | Kegunaan |
| --- | --- | --- |
| `GET` | `/student-guardians?page=1&limit=10&search=` | Daftar relasi, pagination, pencarian nama/nomor siswa dan data wali |
| `GET` | `/student-guardians/:id` | Detail satu relasi siswa dan wali |
| `POST` | `/student-guardians` | Menambahkan relasi |
| `PATCH` | `/student-guardians/:id` | Mengubah siswa, wali, atau status utama |
| `DELETE` | `/student-guardians/:id` | Soft-delete relasi |
| `GET` | `/student-guardians/options/students?page=1&limit=20&search=` | Pilihan siswa khusus relasi, scoped ke institusi admin login (server-side search + pagination) |
| `GET` | `/students?page=1&limit=20&search=` | Daftar siswa global (tidak dipakai form relasi; tanpa scope institusi) |
| `GET` | `/guardians?page=1&limit=20&search=` | Pilihan wali (server-side search + pagination) |

Sertakan header `Authorization: Bearer <access_token>` pada seluruh request. URL API berasal dari `VITE_API_URL` melalui API client terpusat.

## Request form

```json
{
  "studentId": "uuid-siswa",
  "guardianId": "uuid-wali",
  "isPrimary": true
}
```

`studentId` dan `guardianId` wajib berupa UUID. Pasangan siswa dan wali tidak boleh dibuat dua kali. `isPrimary` menentukan label **Wali Utama** pada tabel.

## Respons daftar

```json
{
  "status": "success",
  "message": "Student guardian relations retrieved successfully",
  "code": 200,
  "data": [{
    "id": "uuid-relasi",
    "studentId": "uuid-siswa",
    "guardianId": "uuid-wali",
    "isPrimary": true,
    "student": { "studentNumber": "20260001", "profile": { "fullName": "Alya Putri" } },
    "guardian": { "fullName": "Budi Putra", "relationship": "Ayah", "phoneNumber": "0812..." }
  }],
  "meta": { "totalData": 1, "totalPages": 1, "currentPage": 1, "perPage": 10 }
}
```

Tampilkan pesan `message` dari error API (misalnya siswa/wali tidak ditemukan atau relasi sudah ada) dalam notifikasi form. Setelah berhasil membuat, mengubah, atau menghapus data, muat ulang daftar relasi.

## Parameter list

| Parameter | Wajib | Keterangan |
| --- | --- | --- |
| `page` | Tidak | Nomor halaman, default `1`. |
| `limit` | Tidak | Jumlah data per halaman, default `10`. |
| `search` | Tidak | Nama atau nomor siswa, serta nama, email, atau nomor telepon wali. |

## Error response

```json
{
  "status": "error",
  "code": 409,
  "message": "Student guardian relation already exists"
}
```

Tampilkan pesan API untuk konflik relasi, wali/siswa tidak ditemukan, atau relasi tidak ditemukan. Form harus menampilkan error validasi pada field terkait; `studentId` dan `guardianId` wajib UUID.

## Alur frontend

1. Muat daftar dengan pagination dan parameter pencarian.
2. Muat pilihan siswa dari `/student-guardians/options/students` (scoped institusi admin login) dan wali dari `/guardians` (sudah scoped institusi) saat form dibuka.
3. Gunakan `POST`, `PATCH`, dan `DELETE` untuk CRUD lalu muat ulang daftar.
4. Tombol Detail mengambil data terbaru dari `/student-guardians/:id`.
