# Dokumentasi Implementasi Fitur Guru (Teachers) & 1-Step Onboarding

Dokumen ini merupakan panduan lengkap integrasi fitur Guru (Teachers) baik pada Backend (`@repo/shared` dan `apps/api`) maupun Frontend (`apps/web`). Fitur ini menerapkan pola **1-Step Onboarding Guru** di mana Akun Login (`Users`), Profil Pengguna (`Profile`), dan Data Kepegawaian (`Teachers`) dibuat atau diperbarui secara atomik dalam satu transaksi database Prisma.

---

## 1. Daftar Endpoint API

Semua endpoint dilindungi oleh autentikasi JWT (`JwtAuthGuard`) dan pemeriksaan hak akses (`RolesGuard`). Endpoint scoped secara otomatis ke institusi dari Admin Institusi yang sedang login (`institutionId`).

| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/teachers` | `admin`, `teacher`, `superadmin` | Mengambil daftar guru dengan pagination, pencarian, dan filter |
| `GET` | `/teachers/stats` | `admin`, `teacher`, `superadmin` | Mengambil 4 metrik statistik ringkasan guru institusi |
| `GET` | `/teachers/:id` | `admin`, `teacher`, `superadmin` | Mengambil detail guru lengkap dengan relasi profil & kepegawaian |
| `POST` | `/teachers` | `admin`, `superadmin` | **1-Step Onboarding Guru**: membuat Akun, Profil, dan Data Guru |
| `PATCH` | `/teachers/:id` | `admin`, `superadmin` | Memperbarui data akun, profil, dan kepegawaian guru |
| `DELETE` | `/teachers/:id` | `admin`, `superadmin` | Menghapus (soft delete) data guru dari institusi |

---

## 2. Spesifikasi Request & Response

### A. 1-Step Onboarding Guru (`POST /teachers`)
Membuat akun login baru dengan password yang di-hash menggunakan bcrypt (cost 10), data profil terhubung, serta entitas guru.

#### Headers
```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

#### Request Body (JSON)
```json
{
  "full_name": "Dra. Siti Rahmawati, M.Pd",
  "email": "siti.rahmawati@sekolah.sch.id",
  "password": "Password123#",
  "gender": "Perempuan",
  "phone": "081234567890",
  "teacher_number": "198501012010011001",
  "join_date": "2024-01-15T00:00:00.000Z",
  "employment_status_id": "a4d3cf38-4e89-4bc2-8419-45d65f57a111",
  "specialization_id": "b7c2df11-2e33-4f99-9233-12d45a67b222",
  "department_id": "c9e1fa22-3f44-4a88-8122-34e56b78c333"
}
```

#### Aturan Validasi:
- `full_name`: String wajib, min 1 karakter.
- `email`: Format email valid, wajib, unik di tabel `Users`.
- `password`: String wajib, min 8 karakter.
- `teacher_number`: String NIP wajib, unik di tabel `Teachers`.
- `gender`: Opsional (`Laki-laki` / `Perempuan` / `L` / `P`).
- `phone`: Opsional string nomor telepon.
- `join_date`: Opsional ISO Date string.
- `employment_status_id`, `specialization_id`, `department_id`: Opsional UUID valid. `department_id` harus milik institusi yang sama.

#### Success Response (`201 Created`)
```json
{
  "status": "success",
  "code": 201,
  "message": "Guru berhasil ditambahkan",
  "data": {
    "id": "e7b1a234-5678-4321-9876-abcdef012345",
    "profile_id": "f8c2b345-6789-5432-0987-bcdef0123456",
    "teacher_number": "198501012010011001",
    "department_id": "c9e1fa22-3f44-4a88-8122-34e56b78c333",
    "specialization_id": "b7c2df11-2e33-4f99-9233-12d45a67b222",
    "employment_status_id": "a4d3cf38-4e89-4bc2-8419-45d65f57a111",
    "join_date": "2024-01-15T00:00:00.000Z",
    "created_at": "2026-11-09T05:00:00.000Z",
    "updated_at": "2026-11-09T05:00:00.000Z",
    "profile": {
      "id": "f8c2b345-6789-5432-0987-bcdef0123456",
      "fullName": "Dra. Siti Rahmawati, M.Pd",
      "email": "siti.rahmawati@sekolah.sch.id",
      "phoneNumber": "081234567890",
      "gender": "Perempuan",
      "userId": "d6a0f123-4567-3210-8765-abcdef654321",
      "users": {
        "id": "d6a0f123-4567-3210-8765-abcdef654321",
        "email": "siti.rahmawati@sekolah.sch.id",
        "is_active": true
      }
    },
    "department": {
      "id": "c9e1fa22-3f44-4a88-8122-34e56b78c333",
      "name": "MIPA",
      "code": "MIPA"
    },
    "employment_status": {
      "id": "a4d3cf38-4e89-4bc2-8419-45d65f57a111",
      "name": "Guru Tetap"
    },
    "specialization": {
      "id": "b7c2df11-2e33-4f99-9233-12d45a67b222",
      "name": "Matematika"
    },
    "_count": {
      "classSubjects": 2,
      "classes": 1
    }
  }
}
```

#### Error Response: Duplikasi NIP (`409 Conflict`)
```json
{
  "status": "error",
  "code": 409,
  "message": "NIP/Nomor guru '198501012010011001' sudah terdaftar di sistem."
}
```

#### Error Response: Duplikasi Email Login (`409 Conflict`)
```json
{
  "status": "error",
  "code": 409,
  "message": "Email 'siti.rahmawati@sekolah.sch.id' sudah terdaftar pada akun lain."
}
```

---

### B. Memperbarui Data Guru (`PATCH /teachers/:id`)
Dapat memperbarui profil nama/telepon/gender, email akun, opsional reset password (jika diisi), serta relasi kepegawaian.

#### Request Body (JSON)
```json
{
  "full_name": "Dr. Siti Rahmawati, M.Pd",
  "email": "siti.rahmawati.baru@sekolah.sch.id",
  "password": "PasswordBaru456#", // Opsional, kosongkan jika tidak ingin ganti password
  "gender": "Perempuan",
  "phone": "081299998888",
  "teacher_number": "198501012010011001",
  "employment_status_id": "a4d3cf38-4e89-4bc2-8419-45d65f57a111",
  "specialization_id": "b7c2df11-2e33-4f99-9233-12d45a67b222",
  "department_id": "c9e1fa22-3f44-4a88-8122-34e56b78c333"
}
```

#### Success Response (`200 OK`)
```json
{
  "status": "success",
  "code": 200,
  "message": "Data guru berhasil diperbarui",
  "data": { ... }
}
```

---

### C. Daftar Guru (`GET /teachers`)

#### Query Parameters:
- `page`: Nomor halaman (integer, default: 1).
- `limit`: Jumlah per halaman (integer, default: 10).
- `search`: Pencarian nama guru, NIP, atau email.
- `status`: Filter berdasarkan ID `employment_status_id`.
- `specialization`: Filter berdasarkan ID `specialization_id`.

#### Success Response (`200 OK`)
```json
{
  "status": "success",
  "code": 200,
  "message": "Data guru berhasil diambil",
  "data": [
    {
      "id": "e7b1a234-5678-4321-9876-abcdef012345",
      "teacher_number": "198501012010011001",
      "profile": {
        "fullName": "Dra. Siti Rahmawati, M.Pd",
        "email": "siti.rahmawati@sekolah.sch.id",
        "gender": "Perempuan"
      },
      "department": { "name": "MIPA" },
      "specialization": { "name": "Matematika" },
      "employment_status": { "name": "Guru Tetap" },
      "_count": { "classSubjects": 2, "classes": 1 }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

### D. Statistik Guru (`GET /teachers/stats`)

#### Success Response (`200 OK`)
```json
{
  "status": "success",
  "code": 200,
  "message": "Statistik guru berhasil diambil",
  "data": {
    "total": 42,
    "tetapCount": 30,
    "honorerCount": 12,
    "specializationCount": 8,
    "totalClassAssignments": 86,
    "unassignedCount": 3
  }
}
```

---

## 3. Implementasi Frontend (`apps/web/src/features/teachers/`)

### Arsitektur Direktori
- `api/teachers.ts`: Wrapper API call menggunakan `@/lib/api`.
- `hooks/useTeachers.ts`: Kumpulan hook `@tanstack/react-query` (`useTeachers`, `useTeacherStats`, `useCreateTeacher`, `useUpdateTeacher`, `useDeleteTeacher`, `useSpecializations`, `useEmploymentStatuses`, `useTeacherDepartments`).
- `schemas/teacherSchema.ts`: Validasi Zod form create & update dengan pesan lokal bahasa Indonesia.
- `types/index.ts`: Interface TypeScript untuk entitas `Teacher`, DTO input, filter params, dan response meta.
- `components/`:
  - `TeachersHeader.tsx`: Breadcrumb `Master data / Pendidik & Staf Pengajar`, Badge `Master Registry`, dan tombol `+ Tambah guru`.
  - `TeacherStatsCards.tsx`: 4 Kartu metrik:
    - **TOTAL GURU**: Total pengajar terdata (ikon Users biru).
    - **SPESIALISASI**: Bidang keahlian aktif (ikon Award hijau).
    - **KELAS DIAMPU**: Total alokasi jadwal kelas (ikon BookOpen ungu).
    - **BELUM ADA KELAS**: Kartu merah gelap (`bg-[#1c1219]`, `border-[#4c1d24]`, teks merah) untuk guru yang belum memiliki jam mengajar.
  - `TeacherFilterBar.tsx`: Input pencarian debounced, dropdown status kepegawaian, dropdown spesialisasi, dropdown departemen, dan tombol Reset Filter.
  - `TeacherRow.tsx`: Tampilan baris guru dengan inisial avatar gradien, nama lengkap, email, NIP monospace dengan subteks tanggal bergabung, badge status, jumlah kelas diampu, serta tombol Edit dan Hapus.
  - `TeacherDialogForm.tsx`: Modal form terpadu (Create & Edit) dengan 2 bagian:
    1. **Akun Login & Identitas**: Nama lengkap, email login, gender, telepon, dan password generator (dengan tombol acak sandi, copy ke clipboard, dan toggle tampil/sembunyi sandi).
    2. **Data Kepegawaian**: NIP, tanggal bergabung, status kepegawaian, bidang keahlian, dan departemen.
  - `TeacherCredentialModal.tsx`: Modal popup setelah berhasil tambah guru yang menampilkan kredensial akun serta tombol **Salin Info Login (WA)** berformat WhatsApp untuk dibagikan langsung kepada guru yang bersangkutan.
  - `DeleteTeacherDialog.tsx`: Dialog konfirmasi penghapusan data guru.

---

## 4. Format Salin Info Login (WhatsApp Template)

Ketika tombol **Salin Info Login (WA)** diklik pada modal kredensial:
```text
Halo *Dra. Siti Rahmawati, M.Pd*,
Berikut adalah kredensial login akun Guru Anda di Sistem Academic:
• Email: siti.rahmawati@sekolah.sch.id
• Password: Password123#
• NIP: 198501012010011001

Silakan gunakan informasi di atas untuk masuk ke sistem dan segera lakukan pergantian kata sandi Anda demi keamanan.
```
