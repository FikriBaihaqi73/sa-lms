# Dokumentasi Implementasi Halaman Presensi & Absensi (Auto-Populated Monthly Matrix)

Dokumen ini merupakan panduan lengkap mengenai implementasi fitur **Presensi & Absensi Siswa** berbasis **Auto-Populated Matrix Kehadiran Bulanan & Jadwal Pelajaran** dengan **Inline Pill Dropdown**, **Tombol Set Semua Hadir Hari Ini**, **Ekspor Rekap (CSV)**, dan **6 Kartu Ringkasan Real-Time** untuk role **Admin Institusi** dan **Guru** (*multi-tenant*).

---

## 1. Ringkasan Fitur
- **Halaman**: `/attendances` (Menu: *Konfigurasi Akademik* -> *Presensi & Absensi*).
- **Fungsi Utama**:
  1. **Header & Fast Actions**:
     - Judul: `Overview & Report Presensi Siswa` dengan subteks deskriptif.
     - Tombol `Set Semua Hadir Hari Ini` (`✓` hijau): Mencatat presensi seluruh siswa kelas pada jadwal terpilih sebagai **Hadir** untuk tanggal hari ini secara massal (*bulk upsert*) dalam 1 kali klik.
     - Tombol `Ekspor Rekap` (`Download` biru): Mengunduh seluruh rekapitulasi matriks kehadiran kelas dalam format file CSV (.csv) ber-BOM UTF-8.
  2. **6 Kartu Ringkasan Real-Time**:
     - Layout horizontal kompak (*left-icon card*): Total Presensi, Hadir, Izin, Sakit, Alpa, dan Tingkat Kehadiran (%) yang reaktif terhadap data matriks.
  3. **Filter Bar Kompak (1 Baris)**:
     - Input pencarian (Nama siswa atau NISN) dengan debounce 300ms.
     - Dropdown Kelas (otomatis default ke kelas pertama yang tersedia).
     - Dropdown Jadwal & Mata Pelajaran (otomatis tersinkronisasi dengan kelas terpilih).
     - Dropdown Tahun Ajaran (otomatis default ke tahun ajaran yang aktif).
     - Dropdown Periode Gabungan Bulan & Tahun (misal: `November 2026`).
     - Dropdown Filter Status Kehadiran (`Semua Status`, `Hadir`, `Izin`, `Sakit`, `Alpa`).
     - Tombol Reset Filter berupa ikon `⟳` (merah/rose) untuk membersihkan seluruh filter.
  4. **Auto-Populated Monthly Matrix Table**:
     - Card Header: Menampilkan judul `Matrix Kehadiran Siswa`, badge informasi jadwal/ruang kelas, pengampu guru, legend status dot warna, dan jumlah siswa.
     - Kolom Kiri Sticky: Kolom `PENGGUNA (SISWA & KELAS)` menampilkan nama lengkap siswa (bold huruf besar) dan subteks format `[Nama Kelas] • [NISN]`.
     - Kolom Tanggal Horizontal: Tanggal 1 s.d. 28/29/30/31 dengan indikator chip `• Aktif` (hijau) atau `• Libur` (abu-abu), nama hari singkat (misal `MON, 02 NOV`), dan tahun.
     - Sel Status Inline: Tombol pill rounded `w-14` dengan ikon/simbol status (`✓`, `I`, `S`, `✕`, `-`) dan panah dropdown kecil (`⌄`). Klik membuka dropdown instan untuk mengubah status langsung atau membuka modal catatan.
     - Titik Indikator Catatan: Glowing amber dot di sudut atas pill jika terdapat catatan/notes evaluasi pada pertemuan tersebut.
     - Baris Footer: Baris `Rata-Rata Keseluruhan` menampilkan persentase kehadiran harian dan rasio kehadiran siswa `(hadir/total)` di tiap tanggal.
- **Batasan Akses**:
  - Role **Admin Institusi** dan **Guru** (`@Roles("admin", "teacher")`).
  - Multi-tenancy: Data terisolasi ketat sesuai `institution_id` sekolah tempat pengguna bertugas melalui relasi jadwal pelajaran (`schedule.classSubject.class.institution_id`).

---

## 2. API Endpoints

Semua endpoint dilindungi oleh `JwtAuthGuard`, `RolesGuard`, dan decorator `@Roles("admin", "teacher")`.

### A. Mendapatkan Daftar Presensi Siswa (Matrix Range Support)
- **URL**: `GET /attendances`
- **Query Parameters**:
  - `page` (number, default: 1): Nomor halaman.
  - `limit` (number, default: 1000): Jumlah data per request.
  - `schedule_id` (UUID, opsional): Filter berdasarkan jadwal pelajaran.
  - `class_id` (UUID, opsional): Filter berdasarkan kelas.
  - `student_id` (UUID, opsional): Filter berdasarkan ID siswa.
  - `attendance_status_id` (UUID, opsional): Filter berdasarkan status kehadiran.
  - `search` (string, opsional): Pencarian nama siswa atau NISN.
  - `attendance_date` (string `YYYY-MM-DD`, opsional): Filter tanggal spesifik.
  - `start_date` (string `YYYY-MM-DD`, opsional): Awal rentang tanggal (awal bulan).
  - `end_date` (string `YYYY-MM-DD`, opsional): Akhir rentang tanggal (akhir bulan).
  - `month` (number 1-12, opsional): Filter bulan.
  - `year` (number, opsional): Filter tahun.
- **Headers**:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Attendances retrieved successfully",
    "data": [
      {
        "id": "a50c8ec8-8cf9-4ee7-9bfa-31b68ce4621c",
        "schedule_id": "b3e94474-1234-4a25-8840-a3528b98b981",
        "student_id": "c1f23456-7890-4abc-def1-234567890abc",
        "attendance_status_id": "d9876543-210f-4edc-ba98-76543210fedc",
        "attendance_date": "2026-11-04T00:00:00.000Z",
        "notes": "Hadir tepat waktu",
        "attendance_status": {
          "id": "d9876543-210f-4edc-ba98-76543210fedc",
          "name": "Hadir"
        },
        "student": {
          "id": "c1f23456-7890-4abc-def1-234567890abc",
          "studentNumber": "1029384756",
          "profile": {
            "fullName": "Ahmad Dahlan"
          }
        },
        "schedule": {
          "id": "b3e94474-1234-4a25-8840-a3528b98b981",
          "day": "Senin",
          "startTime": "07:30",
          "endTime": "09:00",
          "classroom": { "roomName": "Lab Komputer 1" },
          "classSubject": {
            "class": { "id": "...", "name": "Kelas A - Pemrograman" },
            "subject": { "name": "Pemrograman Web" },
            "teacher": { "profile": { "fullName": "Budi Santoso, S.Kom." } }
          }
        }
      }
    ],
    "meta": { "currentPage": 1, "perPage": 1000, "totalData": 1, "totalPages": 1 }
  }
  ```

---

### B. Mendapatkan Ringkasan Statistik Presensi (Summary)
- **URL**: `GET /attendances/summary`
- **Query Parameters**: `class_id`, `schedule_id`, `start_date`, `end_date`, `search`
- **Response Sukses (200 OK)**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Attendance summary retrieved successfully",
    "data": {
      "total": 45,
      "present": 37,
      "permission": 5,
      "sick": 2,
      "absent": 1,
      "attendanceRate": 82
    }
  }
  ```

---

### C. Inline Upsert Presensi Satuan (Create or Update)
- **URL**: `POST /attendances/upsert`
- **Request Body**:
  ```json
  {
    "schedule_id": "b3e94474-1234-4a25-8840-a3528b98b981",
    "student_id": "c1f23456-7890-4abc-def1-234567890abc",
    "attendance_status_id": "d9876543-210f-4edc-ba98-76543210fedc",
    "attendance_date": "2026-11-04T00:00:00.000Z",
    "notes": "Hadir tepat waktu"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Attendance saved successfully",
    "data": { "id": "...", ... }
  }
  ```

---

### D. Bulk Upsert Presensi ("Set Semua Hadir Hari Ini" / Massal)
- **URL**: `POST /attendances/bulk-upsert` (atau alias `POST /attendances/bulk`)
- **Request Body**:
  ```json
  {
    "schedule_id": "b3e94474-1234-4a25-8840-a3528b98b981",
    "attendance_date": "2026-11-11T00:00:00.000Z",
    "attendance_status_id": "d9876543-210f-4edc-ba98-76543210fedc",
    "notes": "Hadir hari ini"
  }
  ```
- **Response Sukses (200 OK)**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Bulk attendance recorded successfully",
    "data": { "count": 32 }
  }
  ```

---

## 3. Struktur Komponen Frontend (`apps/web`)

```text
apps/web/src/features/attendances/
├── api/
│   ├── index.ts               # Wrapper HTTP: getAttendances, upsert, bulk, delete, options
│   └── attendances.spec.ts    # Unit test API wrapper
├── components/
│   ├── attendance-stats.tsx           # 6 Kartu ringkasan metrik horizontal (1:1 UI referensi)
│   ├── attendance-filter.tsx          # Filter bar kompak 1-baris (Pencarian, Kelas, Jadwal, TA, Bulan-Tahun, Status, Reset)
│   ├── attendance-matrix-table.tsx    # Monthly Attendance Matrix Table dengan pill status & footer ratio
│   ├── attendance-note-popover.tsx    # Dialog catatan presensi siswa
│   ├── attendances-page.tsx           # Halaman utama pengelola state & aksi (Set Semua Hadir, Ekspor CSV)
│   ├── AttendancesPage.tsx            # Barrel export
│   └── AttendancesPage.spec.tsx       # Vitest unit tests (5 passed)
├── hooks/
│   └── index.ts               # React Query hooks
├── schemas/
│   └── index.ts               # Skema validasi Zod
├── types/
│   └── index.ts               # Interface TypeScript
└── index.ts                   # Public barrel export
```

---

## 4. Perbaikan Masalah Data Kelas & Siswa Kosong

1. **Endpoint Kelas**:
   - Diperbaiki dari `/class?limit=100` menjadi `/classes?limit=100` sesuai route `@Controller("classes")` di backend.
2. **Double Wrapping `class-students`**:
   - Dihilangkan double `ResponseHelper.success` di `apps/api/src/class-student/class-student.service.ts` agar mengembalikan data repositori secara bersih.
   - Ditambahkan parser adaptif `extractArray` di `apps/web/src/features/attendances/api/index.ts` agar aman mengekstrak array siswa pada setiap variasi respons API.
3. **Auto-Default Inisialisasi**:
   - Saat dropdown kelas dimuat, otomatis memilih kelas pertama jika belum ada kelas yang dipilih.
   - Dropdown jadwal otomatis memilih jadwal pertama kelas tersebut.
   - Dropdown tahun ajaran otomatis mengaktifkan tahun ajaran aktif (`is_active === true`).
   - Matriks kehadiran langsung terisi data siswa dan tanggal bulanan secara otomatis tanpa harus memilih manual terlebih dahulu.
