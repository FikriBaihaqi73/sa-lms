# Dokumentasi Implementasi Fitur Manajemen Departemen (Admin)

Dokumen ini merupakan panduan lengkap teknis dan integrasi frontend untuk fitur **Manajemen Departemen** yang dikembangkan khusus untuk peran **Admin Institusi** (`admin`).

---

## 1. Ringkasan & Ruang Lingkup Fitur

Fitur ini memungkinkan Admin Institusi untuk mengelola struktur organisasi internal pada institusinya (seperti Departemen Kurikulum & Akademik, Kesiswaan, Sarana Prasarana, Hubungan Masyarakat, dll.), serta menetapkan guru/staf ke dalam departemen terkait.

### Poin Kunci
1. **CRUD Lengkap**: Tambah, Lihat (dengan pencarian & pagination), Perbarui, dan Hapus (soft delete) departemen.
2. **Multi-Tenancy Scoping**: Setiap departemen terikat secara ketat ke `institution_id` milik admin yang sedang login. Admin institusi A tidak dapat melihat atau mengubah departemen institusi B.
3. **Assigned Staff/Teacher**: Admin dapat menugaskan satu atau lebih guru ke departemen langsung melalui dialog form modal (searchable multi-select picker) dan melihat daftar staf yang bertugas.
4. **Proteksi Akses**: Endpoint backend diproteksi `@Roles("admin")` dan frontend diproteksi via `INSTITUTION_ADMIN_ONLY_PREFIXES`.

---

## 2. API Endpoints

Semua endpoint berada di bawah prefix `/departments`.

| Metode | URL | Deskripsi | Autentikasi | Role |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/departments` | Mengambil daftar departemen (paginasi & pencarian) | Bearer Token | `admin` |
| `GET` | `/departments/:id` | Mengambil detail 1 departemen beserta daftar guru | Bearer Token | `admin` |
| `POST` | `/departments` | Membuat departemen baru & menetapkan guru | Bearer Token | `admin` |
| `PATCH` | `/departments/:id` | Memperbarui departemen & sinkronisasi guru | Bearer Token | `admin` |
| `DELETE` | `/departments/:id` | Menghapus (soft delete) departemen & melepas relasi guru | Bearer Token | `admin` |

---

## 3. Spesifikasi Permintaan & Respon

### A. Mendapatkan Daftar Departemen (`GET /departments`)

#### Query Parameters:
- `page` (opsional, integer): Nomor halaman (default: `1`).
- `limit` (opsional, integer): Jumlah item per halaman (default: `10`).
- `search` (opsional, string): Kata kunci pencarian berdasarkan nama atau kode departemen.

#### Headers:
```http
Authorization: Bearer <ACCESS_TOKEN>
```

#### Contoh Respon Sukses (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Data departemen berhasil diambil",
  "data": [
    {
      "id": "c7116773-a68d-4f1f-9da3-718e22f28389",
      "name": "Departemen Kurikulum & Akademik",
      "code": "KURIKULUM",
      "institution_id": "8931eb6f-8700-47b7-873b-4fa815eeea26",
      "created_at": "2026-10-21T02:44:09.123Z",
      "updated_at": "2026-10-21T02:44:09.123Z",
      "deleted_at": null,
      "teachers": [
        {
          "id": "e818816f-ecb6-45ef-8931-155e11ccba91",
          "teacher_number": "TCH-2026-001",
          "profile": {
            "id": "b1016773-a68d-4f1f-9da3-718e22f28389",
            "fullName": "Dra. Siti Aminah, M.Pd",
            "email": "siti.aminah@sekolah.sch.id",
            "phoneNumber": "08123456789",
            "photoUrl": null
          }
        }
      ],
      "_count": {
        "teachers": 1,
        "subjects": 4
      }
    }
  ],
  "meta": {
    "totalData": 1,
    "totalPages": 1,
    "currentPage": 1,
    "perPage": 10
  }
}
```

---

### B. Membuat Departemen Baru (`POST /departments`)

#### Request Body:
```json
{
  "name": "Departemen Kesiswaan & Kedisiplinan",
  "code": "KESISWAAN",
  "teacher_ids": [
    "e818816f-ecb6-45ef-8931-155e11ccba91"
  ]
}
```

#### Validasi Field:
- `name` (string, required): 1 - 255 karakter.
- `code` (string, required): 1 - 50 karakter. Otomatis diubah ke huruf kapital oleh sistem.
- `teacher_ids` (array of UUID, optional): ID guru yang langsung ditugaskan ke departemen ini.

#### Contoh Respon Sukses (`201 Created`):
```json
{
  "status": "success",
  "code": 201,
  "message": "Departemen berhasil dibuat",
  "data": {
    "id": "d8016773-a68d-4f1f-9da3-718e22f28389",
    "name": "Departemen Kesiswaan & Kedisiplinan",
    "code": "KESISWAAN",
    "institution_id": "8931eb6f-8700-47b7-873b-4fa815eeea26",
    "created_at": "2026-10-21T03:00:00.000Z",
    "updated_at": "2026-10-21T03:00:00.000Z",
    "deleted_at": null,
    "teachers": [
      {
        "id": "e818816f-ecb6-45ef-8931-155e11ccba91",
        "teacher_number": "TCH-2026-001",
        "profile": {
          "id": "b1016773-a68d-4f1f-9da3-718e22f28389",
          "fullName": "Dra. Siti Aminah, M.Pd",
          "email": "siti.aminah@sekolah.sch.id",
          "phoneNumber": "08123456789",
          "photoUrl": null
        }
      }
    ],
    "_count": {
      "teachers": 1,
      "subjects": 0
    }
  }
}
```

---

### C. Memperbarui Departemen (`PATCH /departments/:id`)

#### Request Body (Partial):
```json
{
  "name": "Departemen Kesiswaan & Konseling",
  "teacher_ids": [
    "e818816f-ecb6-45ef-8931-155e11ccba91",
    "f929927f-fcb7-56ef-9042-266f22ddcb02"
  ]
}
```

#### Catatan Sinkronisasi Guru:
- Jika `teacher_ids` dikirimkan, backend secara otomatis:
  1. Melepas relasi guru-guru yang sebelumnya terdaftar di departemen ini namun tidak ada di `teacher_ids`.
  2. Menautkan guru-guru baru yang ada di `teacher_ids` ke departemen ini.
  3. Memastikan guru yang ditugaskan hanya guru yang berada pada institusi yang sama.

---

### D. Menghapus Departemen (`DELETE /departments/:id`)

#### Contoh Respon Sukses (`200 OK`):
```json
{
  "status": "success",
  "code": 200,
  "message": "Departemen berhasil dihapus",
  "data": {
    "success": true,
    "id": "d8016773-a68d-4f1f-9da3-718e22f28389"
  }
}
```

---

### E. Penanganan Error (Error Variations)

1. **Nama / Kode Departemen Sudah Terdaftar di Institusi Ini (`409 Conflict`)**:
   ```json
   {
     "status": "error",
     "code": 409,
     "message": "Nama departemen sudah digunakan di institusi Anda"
   }
   ```
2. **Data Tidak Ditemukan atau Milik Institusi Lain (`404 Not Found`)**:
   ```json
   {
     "status": "error",
     "code": 404,
     "message": "Departemen tidak ditemukan"
   }
   ```
3. **Akses Ditolak Bukan Admin (`403 Forbidden`)**:
   ```json
   {
     "status": "error",
     "code": 403,
     "message": "Forbidden resource"
   }
   ```
4. **Validasi Gagal (`400 Bad Request`)**:
   ```json
   {
     "status": "error",
     "code": 400,
     "message": "Validation failed",
     "errors": [
       {
         "field": "code",
         "message": "Kode departemen wajib diisi."
       }
     ]
   }
   ```

---

## 4. Alur & Struktur Implementasi Frontend

Halaman berada pada rute: `/departments` (`apps/web/src/routes/_settings/departments/index.tsx`).

### Struktur Komponen:
- **`DepartmentsHeader`**: Menampilkan judul halaman, deskripsi, tombol refresh data, dan tombol "Tambah Departemen" yang memicu dialog pembuatan.
- **`DepartmentsStats`**: Tiga kartu analitik cepat:
  1. *Total Departemen*: Jumlah departemen yang aktif.
  2. *Total Guru Ditugaskan*: Akumulasi seluruh guru yang berafiliasi dengan departemen.
  3. *Rata-rata Staf*: Rasio rata-rata staf per departemen.
- **`DepartmentsTable`**:
  - Kolom Nama Departemen & Kode (Badge monospaced).
  - Kolom Guru & Staf: Menampilkan chip nama & avatar staf yang bertugas, badge `+N staf lainnya` jika melebihi 2 staf, atau badge `Belum ada staf` jika kosong.
  - Kolom Tanggal Dibuat.
  - Aksi: Tombol Edit (membuka dialog edit) dan Tombol Hapus (membuka dialog konfirmasi).
  - Toolbar pencarian dengan *debounce* dan navigasi pagination lengkap.
- **`DepartmentDialog`**:
  - Form dialog dengan validasi Zod (`react-hook-form` + `@hookform/resolvers/zod`).
  - Searchable multi-select picker guru yang menampilkan daftar guru aktif di institusi, foto profil, nama lengkap, dan NIP.
- **`DeleteDepartmentDialog`**: Dialog konfirmasi destruktif dengan ringkasan konsekuensi penghapusan departemen.

---

## 5. Keamanan & Multi-Tenancy

1. `institution_id` tidak pernah diambil dari request payload client. Backend mengambilnya langsung dari profil pengguna terautentikasi melalui JWT token (`request.user.sub`).
2. Pencarian dan validasi keunikan `name` dan `code` hanya berlaku di dalam cakupan institusi terkait (`where: { institution_id, name, deleted_at: null }`). Dua institusi berbeda dapat menggunakan kode departemen yang sama tanpa konflik.
