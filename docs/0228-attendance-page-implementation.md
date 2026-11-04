# Dokumentasi Implementasi Halaman Presensi & Absensi (Admin Panel)

Dokumen ini merupakan panduan lengkap mengenai implementasi fitur **Presensi & Absensi Siswa** khusus untuk role **Admin Institusi** (*multi-tenant*).

---

## 1. Ringkasan Fitur
- **Halaman**: `/attendances` (Menu: *Konfigurasi Akademik* -> *Presensi & Absensi*).
- **Fungsi Utama**:
  1. Melihat daftar kehadiran siswa secara terstruktur berdasarkan tanggal, siswa, mata pelajaran/kelas, dan status kehadiran.
  2. Rekapitulasi statistik kehadiran secara real-time (*Total Presensi*, *Hadir*, *Izin*, *Sakit*, *Alpa*, serta *Tingkat Kehadiran %*).
  3. Filter dinamis berdasarkan pencarian kata kunci (nama siswa, NISN, mata pelajaran), tanggal pelaksanaan, kelas, dan status kehadiran.
  4. Mencatat presensi baru (*Create*) dan memperbarui status atau catatan kehadiran (*Update*).
  5. Menghapus data presensi dengan konfirmasi dialog (*Delete*).
- **Batasan Akses**:
  - Khusus role **Admin Institusi**.
  - Menggunakan isolasi multi-tenant: data absensi terfilter ketat sesuai `institution_id` sekolah tempat admin bertugas melalui relasi jadwal pelajaran (`schedule.classSubject.class.institution_id`).

---

## 2. API Endpoints

Semua endpoint dilindungi oleh `JwtAuthGuard`, `RolesGuard`, dan decorator `@Roles("admin")`.

### A. Mendapatkan Daftar Presensi Siswa
- **URL**: `GET /attendances`
- **Query Parameters**:
  - `page` (number, default: 1): Nomor halaman.
  - `limit` (number, default: 10): Jumlah data per halaman.
  - `search` (string, opsional): Pencarian nama siswa, NISN, atau mata pelajaran.
  - `class_id` (UUID, opsional): Filter berdasarkan kelas.
  - `schedule_id` (UUID, opsional): Filter berdasarkan ID jadwal pelajaran.
  - `student_id` (UUID, opsional): Filter berdasarkan ID siswa.
  - `attendance_status_id` (UUID, opsional): Filter berdasarkan status kehadiran.
  - `attendance_date` (string `YYYY-MM-DD` atau ISO string, opsional): Filter tanggal kehadiran.
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
        "created_at": "2026-11-04T07:15:00.000Z",
        "updated_at": "2026-11-04T07:15:00.000Z",
        "attendance_status": {
          "id": "d9876543-210f-4edc-ba98-76543210fedc",
          "name": "Hadir",
          "description": "Hadir tepat waktu di kelas"
        },
        "student": {
          "id": "c1f23456-7890-4abc-def1-234567890abc",
          "studentNumber": "1029384756",
          "profile": {
            "id": "f0123456-789a-bcde-f012-3456789abcdef",
            "fullName": "Ahmad Dahlan",
            "email": "ahmad.dahlan@example.sch.id"
          }
        },
        "schedule": {
          "id": "b3e94474-1234-4a25-8840-a3528b98b981",
          "day": "Senin",
          "startTime": "07:30",
          "endTime": "09:00",
          "classroom": {
            "id": "11111111-2222-3333-4444-555555555555",
            "roomCode": "LAB-01",
            "roomName": "Laboratorium Komputer 1"
          },
          "classSubject": {
            "id": "22222222-3333-4444-5555-666666666666",
            "class": {
              "id": "33333333-4444-5555-6666-777777777777",
              "name": "X-IPA-1",
              "grade_level": 10
            },
            "subject": {
              "id": "44444444-5555-6666-7777-888888888888",
              "name": "Matematika",
              "code": "MAT-10"
            },
            "teacher": {
              "id": "55555555-6666-7777-8888-999999999999",
              "teacher_number": "GUR-001",
              "profile": {
                "id": "66666666-7777-8888-9999-000000000000",
                "fullName": "Budi Santoso, M.Pd"
              }
            }
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

### B. Mendapatkan Ringkasan Statistik Presensi (Summary)
- **URL**: `GET /attendances/summary`
- **Query Parameters**:
  - `class_id` (UUID, opsional)
  - `schedule_id` (UUID, opsional)
  - `attendance_date` (string `YYYY-MM-DD`, opsional)
  - `search` (string, opsional)
- **Response Sukses (200 OK)**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Attendance summary retrieved successfully",
    "data": {
      "total": 45,
      "present": 38,
      "permission": 3,
      "sick": 3,
      "absent": 1,
      "attendanceRate": 84.4
    }
  }
  ```

---

### C. Mencatat Presensi Baru
- **URL**: `POST /attendances`
- **Request Body**:
  ```json
  {
    "schedule_id": "b3e94474-1234-4a25-8840-a3528b98b981",
    "student_id": "c1f23456-7890-4abc-def1-234567890abc",
    "attendance_status_id": "d9876543-210f-4edc-ba98-76543210fedc",
    "attendance_date": "2026-11-04T00:00:00.000Z",
    "notes": "Surat dokter terlampir"
  }
  ```
- **Response Sukses (201 Created)**:
  ```json
  {
    "status": "success",
    "code": 201,
    "message": "Attendance created successfully",
    "data": {
      "id": "a50c8ec8-8cf9-4ee7-9bfa-31b68ce4621c",
      "schedule_id": "b3e94474-1234-4a25-8840-a3528b98b981",
      "student_id": "c1f23456-7890-4abc-def1-234567890abc",
      "attendance_status_id": "d9876543-210f-4edc-ba98-76543210fedc",
      "attendance_date": "2026-11-04T00:00:00.000Z",
      "notes": "Surat dokter terlampir",
      "created_at": "2026-11-04T07:15:00.000Z",
      "updated_at": "2026-11-04T07:15:00.000Z"
    }
  }
  ```

---

### D. Mengubah Data Presensi
- **URL**: `PATCH /attendances/:id`
- **Request Body**: Sama seperti POST namun semua field bersifat opsional.
- **Response Sukses (200 OK)**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Attendance updated successfully",
    "data": { ... }
  }
  ```

---

### E. Menghapus Data Presensi
- **URL**: `DELETE /attendances/:id`
- **Response Sukses (200 OK)**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Attendance deleted successfully"
  }
  ```

---

## 3. Struktur Komponen Frontend (`apps/web`)

Komponen terletak di direktori `apps/web/src/features/attendances/`:
```text
apps/web/src/features/attendances/
├── api/
│   ├── attendances.ts
│   └── attendances.spec.ts
├── components/
│   ├── AttendanceHeader.tsx
│   ├── AttendanceStats.tsx
│   ├── AttendanceFilterBar.tsx
│   ├── AttendanceTable.tsx
│   ├── AttendanceDialog.tsx
│   ├── DeleteAttendanceDialog.tsx
│   ├── AttendancesPage.tsx
│   └── AttendancesPage.spec.tsx
├── hooks/
│   └── useAttendances.ts
├── schemas/
│   └── attendanceSchema.ts
├── types/
│   └── index.ts
└── index.ts
```

### Integrasi Routing:
1. `apps/web/src/routes/_settings/attendances/index.tsx`: Export `attendancesRoute` dengan path `"/attendances"`.
2. `apps/web/src/router.tsx`: Mendaftarkan `attendancesRoute` ke dalam `settingsTree`.
3. `apps/web/src/routes/__root.tsx`: Menambahkan `"/attendances"` ke dalam array `INSTITUTION_ADMIN_ONLY_PREFIXES`.
4. `apps/web/src/components/app-sidebar.tsx`: Menambahkan navigasi `Presensi & Absensi` dengan icon `ClipboardCheck` di bawah menu *Konfigurasi Akademik*.

---

## 4. Alur Interaksi Frontend
1. **Pemuatan Awal**:
   - `AttendancesPage` memicu `useAttendances` dan `useAttendanceSummary`.
   - Card statistik menampilkan 6 metrik (Total, Hadir, Izin, Sakit, Alpa, % Kehadiran).
   - Tabel menampilkan data presensi yang sesuai.
2. **Pencarian dan Filter**:
   - Filter teks mendebounce input selama 400ms sebelum memicu fetch data baru.
   - Mengubah filter tanggal, kelas, atau status akan mereset halaman kembali ke halaman 1.
   - Tombol *Reset* membersihkan seluruh kriteria filter aktif.
3. **Pencatatan Presensi**:
   - Klik "+ Catat Presensi" membuka `AttendanceDialog`.
   - Admin memilih jadwal pelajaran, siswa, status kehadiran, tanggal, dan catatan opsional.
   - Saat submit berhasil, cache React Query `attendances` dan `attendance-summary` diinvalidasi secara otomatis, dan notifikasi sukses ditampilkan di pojok kanan atas.
4. **Pembaruan & Penghapusan**:
   - Tombol *Ubah* pada baris tabel membuka modal dengan nilai yang sudah terisi.
   - Tombol *Hapus* memunculkan dialog konfirmasi demi mencegah ketidaksengajaan.

---

## 5. Aturan Validasi & Penanganan Kasus Khusus
1. **Multi-Tenancy**: Hanya data milik institusi admin yang ditampilkan. Jika user bukan admin institusi terkait, API mengembalikan 403 Forbidden / 404 Not Found.
2. **Format Tanggal**: Frontend mengirimkan tanggal dalam format ISO string (`YYYY-MM-DDT00:00:00.000Z`) untuk memastikan kepatuhan validasi datetime backend.
3. **Pilihan Dropdown**: Dropdown jadwal pelajaran menampilkan hari, nama kelas, mata pelajaran, dan jam tayang agar admin mudah mengidentifikasi sesi belajar mengajar.

