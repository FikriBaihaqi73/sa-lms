# Guardian Management (Admin / Institution Owner) — Frontend Handoff

Status: **verified working** (08-10-2026, live API on `http://localhost:5000`).

## 1. Overview

Halaman `/guardians` memungkinkan **institution admin (pemilik institusi)**
mengelola data *wali murid* (guardian): melihat daftar, mencari, menambah,
mengubah, dan menghapus (soft delete) data guardian. UI/UX mengikuti pola
halaman lain (`/religions`, `/students`): stats cards, tabel dengan search,
dialog tambah/ubah, dialog konfirmasi hapus, toast notice, dan pagination.

Guardian baru harus langsung dihubungkan ke satu student. Backend memvalidasi
student aktif dalam institusi admin dan membuat relasi `StudentGuardian` secara
atomik bersama guardian.

## 2. Endpoints (semua butuh header `Authorization: Bearer <token>`)

| Method | URL | Fungsi |
|---|---|---|
| `GET` | `/guardians?page=1&limit=10&search=<q>` | Daftar guardian (pagination + search by `fullName`, case-insensitive) |
| `GET` | `/guardians/:id` | Detail satu guardian |
| `POST` | `/guardians` | Buat guardian baru sekaligus relasi ke student |
| `PATCH` | `/guardians/:id` | Update sebagian field guardian |
| `DELETE` | `/guardians/:id` | Soft delete (set `deletedAt`) |

Catatan role: controller `GuardianController` memakai `@Roles("admin")`.
Endpoint guardian hanya dapat dipanggil oleh admin institusi dan seluruh data
dibatasi ke institusi admin yang sedang login.

## 3. Request expectations

### `POST /guardians` body

```json
{
  "studentId": "00000000-0000-4000-8000-000000000001",
  "fullName": "Budi Santoso",
  "relationship": "Ayah",
  "phoneNumber": "081234567890",
  "email": "budi@example.com",
  "address": "Jl. Merdeka No. 1, Jakarta",
  "occupation": "Wiraswasta"
}
```

- `studentId`: **wajib**, UUID student aktif yang berada di institusi admin.
  Student yang tidak ada atau berasal dari institusi lain menghasilkan `404`.
- `fullName`: **wajib**, string, min 1 karakter (validasi Zod backend;
  request dengan `fullName: ""` menghasilkan `400`).
- Semua field lain **opsional**.
- `email` jika diisi harus berformat email valid.

### `PATCH /guardians/:id` body

Field guardian pada PATCH bersifat partial — kirim hanya field yang berubah;
`studentId` tidak diperlukan saat update.

## 4. Response structure

Sukses list:

```json
{
  "status": "success",
  "message": "Guardians retrieved successfully",
  "data": [
    {
      "id": "3a9c99f2-8d24-44fe-81f4-61caf6c6d249",
      "fullName": "Budi Santoso",
      "relationship": "Wali",
      "phoneNumber": "081234567890",
      "email": "budi@example.com",
      "address": "Jl. Merdeka No. 1, Jakarta",
      "occupation": "Pegawai Swasta",
      "createdAt": "2026-10-08T09:00:00.000Z",
      "updatedAt": "2026-10-08T09:05:00.000Z",
      "studentGuardians": []
    }
  ],
  "code": 200,
  "meta": { "totalData": 1, "totalPages": 1, "currentPage": 1, "perPage": 10 }
}
```

Sukses create/update/delete: object guardian di `data` (tanpa `meta`).

Error umum:

- `400` — validasi Zod (field gagal + pesan per field).
- `401` — token tidak ada/kedaluwarsa → redirect `/login`.
- `404` — `Student not found` bila student tidak valid atau di luar institusi;
  `Guardian not found` untuk detail/update/delete yang tidak ditemukan.

## 5. Frontend implementation flow

1. Route `/guardians` (`apps/web/src/routes/guardians/index.tsx`) diregistrasi
   di `apps/web/src/router.tsx` sebagai child `rootRoute`.
2. Menu sidebar **"Wali Murid / Guardians"** ditambahkan pada section
   *User Management* khusus Institution Admin (`app-sidebar.tsx`).
3. Data fetching memakai TanStack Query (`useGuardians`), query key
   `["guardians", page, limit, search]`, `placeholderData: keepPreviousData`
   agar pagination terasa halus.
4. Search memakai `useDeferredValue` — request server hanya dikirim setelah
   user berhenti mengetik (debounce alami).
5. Pada mode tambah, `GuardianDialog` memuat pilihan student dari
   `/student-guardians/options/students` dan mengirim `studentId` bersama data
   guardian. Mode ubah tidak meminta student baru.
6. Semua mutasi (create/update/delete) meng-invalidasi
   `["guardians"]` sehingga tabel reload otomatis.
7. Field opsional dikirim sebagai `undefined` saat kosong
   (`"" → undefined`) agar body tetap bersih.

## 6. Edge cases & validation rules untuk frontend

- **Nama wajib**: form Zod `fullName` min 1 karakter — tombol submit tetap
  aktif, error muncul di bawah input.
- **Student wajib saat tambah**: form menampilkan searchable select dengan
  pesan `Siswa wajib dipilih.`. Pilihan sudah dibatasi backend ke institusi
  admin, tetapi backend tetap memvalidasi ulang ID yang dikirim.
- **Email**: format email divalidasi lokal (`Format email tidak valid.`);
  string kosong diizinkan (field opsional).
- **Batas karakter**: fullName 255, relationship/occupation 100,
  phoneNumber 30, address 255 — dijaga `maxLength` + skema Zod.
- **Empty state**: bila `search` kosong & data 0 → "Belum ada data guardian"
  dengan ajakan tombol Tambah; bila search kosong hasil → saran kata kunci lain.
- **Soft delete**: dialog hapus menjelaskan data "disembunyikan, bukan
  dihapus permanen"; bila item terakhir di halaman >1 dihapus, halaman mundur
  1 otomatis.
- **Notice toast** otomatis hilang setelah 4 detik (sukses & error).
- **Loading**: skeleton baris (5 baris pulse) saat fetch pertama.

## 7. Files changed / created

**Created:**

- `apps/web/src/features/guardians/index.ts`
- `apps/web/src/features/guardians/types/index.ts`
- `apps/web/src/features/guardians/schemas/guardianSchema.ts`
- `apps/web/src/features/guardians/api/guardians.ts`
- `apps/web/src/features/guardians/hooks/useGuardians.ts`
- `apps/web/src/features/guardians/components/GuardiansPage.tsx`
- `apps/web/src/features/guardians/components/GuardiansTable.tsx`
- `apps/web/src/features/guardians/components/GuardianDialog.tsx`
- `apps/web/src/features/guardians/components/DeleteGuardianDialog.tsx`
- `apps/web/src/routes/guardians/index.tsx`

**Modified:**

- `apps/web/src/router.tsx` — registrasi `guardiansRoute`.
- `apps/web/src/components/app-sidebar.tsx` — import `HeartHandshake` + NavItem
  `/guardians` di section Institution Admin.

## 8. Verification performed

- `tsc -b` (apps/web): exit 0.
- `eslint` pada semua file baru + file yang diubah: exit 0.
- Live API test (admin@example.com / password123):
  `LIST → CREATE → PATCH → DELETE → SEARCH → VALIDATION 400` semuanya sesuai
  ekspektasi.
