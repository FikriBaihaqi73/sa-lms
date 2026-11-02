# Implementasi Halaman Jadwal Pelajaran (Schedules Page - Admin)

## 1. Ringkasan Fitur
Halaman **Jadwal Pelajaran** (`/schedules`) diperuntukkan bagi Admin Institusi untuk mengelola jadwal alokasi Kegiatan Belajar Mengajar (KBM). Setiap data jadwal menghubungkan:
- **Mata Pelajaran Kelas (`class_subjects`)**: Mengaitkan kelas, mata pelajaran, guru pengampu, dan tahun ajaran aktif.
- **Ruangan Kelas (`classrooms`)**: Kode ruangan, nama ruangan, gedung, dan kapasitas ruangan.
- **Hari Pelaksanaan (`day`)**: Salah satu dari `Senin`, `Selasa`, `Rabu`, `Kamis`, `Jumat`, `Sabtu`, `Minggu`.
- **Waktu Pelaksanaan (`startTime` & `endTime`)**: Format jam mulai dan selesai (WIB).

Tampilan UI/UX disesuaikan penuh dengan standar desain sistem yang sudah ada (dukungan tema Gelap/Terang, Tailwind CSS, shadcn/ui, font inter/geist, badge aksen biru/indigo, responsif mobile hingga desktop).

---

## 2. Route, Navigasi, dan Hak Akses (Role-Based Access)

### A. Route Frontend
- **Path**: `/schedules`
- **File Konfigurasi**: `apps/web/src/routes/_settings/schedules/index.tsx`
- **Layout Parent**: `settingsRoute` (`apps/web/src/routes/settingsLayout.tsx`)
- **Registrasi Router**: `apps/web/src/router.tsx`

### B. Guard & Navigasi
- **Route Guard**: Didaftarkan dalam `INSTITUTION_ADMIN_ONLY_PREFIXES` pada `apps/web/src/routes/__root.tsx`.
- **Sidebar**: Ditambahkan di bawah grup menu **Konfigurasi Akademik** pada `apps/web/src/components/app-sidebar.tsx`:
  ```tsx
  <NavItem
    to="/schedules"
    icon={Calendar}
    label="Jadwal Pelajaran"
  />
  ```
- **Backend Guard**: Endpoint `/schedules` dilindungi dengan decorator `@Roles("admin", "superadmin")` dan `JwtAuthGuard`.

---

## 3. Spesifikasi Endpoint API Backend

Semua pemanggilan endpoint membutuhkan header otentikasi:
`Authorization: Bearer <JWT_ACCESS_TOKEN>`

### A. Daftar Endpoint

| Method | Endpoint | Deskripsi | Query / Param |
|---|---|---|---|
| `GET` | `/schedules` | Mengambil daftar jadwal pelajaran terpaginasi | `page`, `limit`, `search`, `day`, `classroomId`, `classSubjectId` |
| `GET` | `/schedules/:id` | Mengambil satu detail jadwal pelajaran | `id` (UUID) |
| `POST` | `/schedules` | Membuat jadwal pelajaran baru | Body DTO |
| `PATCH` | `/schedules/:id` | Memperbarui alokasi waktu/hari/ruangan/mapel | `id` (UUID) + Body DTO |
| `DELETE` | `/schedules/:id` | Menghapus jadwal pelajaran (soft delete) | `id` (UUID) |
| `GET` | `/class-subjects` | Opsi dropdown mata pelajaran kelas | `page=1&limit=100` |
| `GET` | `/classrooms` | Opsi dropdown ruangan kelas | `page=1&limit=100` |

---

## 4. Struktur Request & Response

### A. GET `/schedules` (List & Filter)

#### Request Query:
```http
GET /schedules?page=1&limit=10&search=RPL&day=Senin&classroomId=b349b106-4b2a-4360-bc73-d515a8167732 HTTP/1.1
Host: api.example.com
Authorization: Bearer <TOKEN>
```

#### Response Sukses (HTTP 200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Schedules retrieved successfully",
  "data": [
    {
      "id": "e2a39281-a189-4fa2-b258-00aa45c71120",
      "classSubjectId": "f101340a-9d62-4217-ba59-67992cbcf51c",
      "classroomId": "b349b106-4b2a-4360-bc73-d515a8167732",
      "day": "Senin",
      "startTime": "2026-01-01T07:30:00.000Z",
      "endTime": "2026-01-01T09:00:00.000Z",
      "createdAt": "2026-10-29T10:00:00.000Z",
      "updatedAt": "2026-10-29T10:00:00.000Z",
      "deletedAt": null,
      "classroom": {
        "id": "b349b106-4b2a-4360-bc73-d515a8167732",
        "roomCode": "LAB-01",
        "roomName": "Laboratorium Komputer 1",
        "building": "Gedung B Lt. 2",
        "capacity": 36
      },
      "classSubject": {
        "id": "f101340a-9d62-4217-ba59-67992cbcf51c",
        "class": {
          "id": "c194a289-40da-4a58-8547-2cb829ca1321",
          "name": "X RPL 1"
        },
        "subject": {
          "id": "s88294a2-1132-4740-b6c8-1123490aafe1",
          "name": "Pemrograman Web & Perangkat Bergerak",
          "code": "PWPB-01"
        },
        "teacher": {
          "id": "t900213a-a871-4602-9111-e4091a18274a",
          "teacher_number": "GUR-2026-001",
          "profile": {
            "id": "p891002a-9921-4d1a-821b-8712a149021c",
            "fullName": "Budi Santoso, S.Kom."
          }
        },
        "academic_year": {
          "id": "a7721890-4100-4bfa-8733-1bca01991823",
          "academic_year": "2026/2027"
        }
      }
    }
  ],
  "meta": {
    "currentPage": 1,
    "perPage": 10,
    "totalData": 1,
    "totalPages": 1
  }
}
```

---

### B. POST `/schedules` (Create Schedule)

#### Request Body:
```json
{
  "classSubjectId": "f101340a-9d62-4217-ba59-67992cbcf51c",
  "classroomId": "b349b106-4b2a-4360-bc73-d515a8167732",
  "day": "Senin",
  "startTime": "07:30",
  "endTime": "09:00"
}
```
*(Catatan: Backend menerima format jam string `HH:mm` seperti `"07:30"` maupun format ISO timestamp `Date`).*

#### Response Sukses (HTTP 201 Created):
```json
{
  "status": "success",
  "code": 201,
  "message": "Schedule created successfully",
  "data": {
    "id": "e2a39281-a189-4fa2-b258-00aa45c71120",
    "classSubjectId": "f101340a-9d62-4217-ba59-67992cbcf51c",
    "classroomId": "b349b106-4b2a-4360-bc73-d515a8167732",
    "day": "Senin",
    "startTime": "2026-01-01T07:30:00.000Z",
    "endTime": "2026-01-01T09:00:00.000Z",
    "createdAt": "2026-10-30T01:00:00.000Z",
    "updatedAt": "2026-10-30T01:00:00.000Z"
  }
}
```

#### Response Validasi Gagal (HTTP 400 Bad Request):
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "classSubjectId",
      "message": "Pilihan mata pelajaran kelas wajib dipilih."
    }
  ]
}
```

---

### C. PATCH `/schedules/:id` (Update Schedule)

#### Request Body:
```json
{
  "day": "Selasa",
  "startTime": "08:00",
  "endTime": "09:30"
}
```

#### Response Sukses (HTTP 200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Schedule updated successfully",
  "data": {
    "id": "e2a39281-a189-4fa2-b258-00aa45c71120",
    "day": "Selasa",
    "startTime": "2026-01-01T08:00:00.000Z",
    "endTime": "2026-01-01T09:30:00.000Z"
  }
}
```

---

### D. DELETE `/schedules/:id` (Soft Delete)

#### Response Sukses (HTTP 200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Schedule deleted successfully",
  "data": {
    "id": "e2a39281-a189-4fa2-b258-00aa45c71120"
  }
}
```

---

## 5. Arsitektur Komponen Frontend (`apps/web/src/features/schedules/`)

```
features/schedules/
├── api/
│   ├── schedules.ts                  # Integrasi fetch API (CRUD & options)
│   └── schedules.spec.ts             # Unit test untuk API functions
├── components/
│   ├── SchedulesPage.tsx             # Container halaman utama & state coordinator
│   ├── SchedulesHeader.tsx           # Judul, breadcrumb, tombol "+ Tambah Jadwal"
│   ├── SchedulesStats.tsx            # 4 kartu ringkasan metrik jadwal
│   ├── SchedulesFilterBar.tsx        # Search bar, filter hari, filter ruangan, reset
│   ├── SchedulesTable.tsx            # Tabel responsif, skeleton loading, pagination
│   ├── ScheduleDialog.tsx            # Modal formulir Tambah/Ubah jadwal (RHF + Zod)
│   └── DeleteScheduleDialog.tsx      # Modal konfirmasi soft delete
├── hooks/
│   └── useSchedules.ts               # React Query hooks (caching, invalidation)
├── schemas/
│   ├── scheduleSchema.ts             # Skema validasi Zod
│   └── scheduleSchema.spec.ts        # Unit test skema validasi
├── types/
│   └── index.ts                      # Definisi tipe & interface TypeScript
├── utils/
│   └── index.ts                      # Format waktu (HH:mm WIB), badge color
└── index.ts                          # Public exports
```

---

## 6. Alur & Logika Penggunaan (Frontend Flow)

1. **Inisialisasi Data**:
   - `SchedulesPage` memanggil hook `useSchedules()` dan `useScheduleOptions()`.
   - Mengambil data jadwal pelajaran terpaginasi beserta opsi dropdown untuk modal (relasi mapel kelas & ruangan).
2. **Pencarian & Penyaringan**:
   - Pencarian teks mendukung pencarian nama kelas, kode/nama mapel, guru, nama/kode ruangan, atau hari dengan `useDebounce(search, 300)`.
   - Pilihan filter hari (`Semua Hari`, `Senin` – `Minggu`) dan filter ruangan secara instan me-reset pagination ke halaman 1.
3. **Tambah & Ubah Jadwal**:
   - Menekan tombol **"+ Tambah Jadwal"** atau tombol **"Ubah"** pada baris tabel akan membuka `ScheduleDialog`.
   - Formulir divalidasi dengan `scheduleFormSchema`:
     - Pilihan hari wajib (Senin–Minggu).
     - Pilihan mata pelajaran kelas wajib (UUID).
     - Pilihan ruangan wajib (UUID).
     - Validasi waktu: jika jam mulai dan jam selesai diisi, maka `endTime` harus lebih akhir daripada `startTime`.
   - Setelah mutation berhasil, cache list diinvaliasi otomatis oleh TanStack Query (`queryClient.invalidateQueries({ queryKey: ["schedules"] })`), dan notifikasi sukses ditampilkan melalui `sonner`.
4. **Hapus Jadwal**:
   - Menekan tombol **"Hapus"** membuka dialog konfirmasi `DeleteScheduleDialog` yang merinci kelas, mapel, hari, jam, dan ruangan yang akan dihapus.
   - Jika item yang dihapus adalah baris terakhir pada halaman tertentu (> halaman 1), sistem secara otomatis memundurkan posisi pagination ke halaman sebelumnya.

---

## 7. Status Pengujian & Verifikasi

- **Backend Unit Tests**:
  - `apps/api/src/schedule/schedule.service.spec.ts`: **10 / 10 PASS**
  - `@biomejs/biome check src/schedule/`: **0 Errors**
  - `nest build`: **Compiled successfully with 0 issues**
- **Frontend Unit Tests**:
  - `apps/web/src/features/schedules/schemas/scheduleSchema.spec.ts`: **14 / 14 PASS**
  - `apps/web/src/features/schedules/api/schedules.spec.ts`: **8 / 8 PASS**
  - `typescript typecheck (tsc -b)`: **0 Type Errors**
  - `vite build`: **Compiled successfully**
  - `eslint src/features/schedules`: **0 Warnings / Errors**
