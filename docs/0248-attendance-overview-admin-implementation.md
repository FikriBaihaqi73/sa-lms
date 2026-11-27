# Dokumentasi Implementasi Halaman Overview Presensi & Absensi (Admin)

Dokumen ini merupakan panduan lengkap mengenai implementasi fitur **Overview & Rekapitulasi Presensi Siswa** berbasis **Tab Switcher Navigasi** (`Overview & Rangkuman` vs `Matriks Presensi Kelas`) dengan **6 KPI Ringkasan Global**, **Performa Kehadiran per Kelas**, **Tabel Rangkuman Siswa Lengkap**, dan fitur **Ekspor Rekap (CSV)** untuk role **Admin Institusi** dan **Guru** (*multi-tenant*).

---

## 1. Ringkasan Fitur
- **Halaman**: `/attendances` (Menu: *Konfigurasi Akademik* -> *Presensi & Absensi*).
- **Tab Utama**:
  1. **Tab Overview & Rangkuman (`Overview & Rekapitulasi Presensi`)**:
     - **Header & Ekspor Rekap**: Tombol `Ekspor Rekap (CSV)` yang mengekspor seluruh akumulasi per siswa (Total Sesi, Hadir, Izin, Sakit, Alpa, Rate %) dalam format CSV UTF-8.
     - **6 KPI Ringkasan Global**:
       - Total Presensi
       - Hadir
       - Izin
       - Sakit
       - Alpa
       - Tingkat Kehadiran (%)
     - **Filter Bar Global**:
       - Input pencarian (Nama Siswa atau NISN) dengan debounce 300ms.
       - Dropdown Kelas ("Semua Kelas" atau spesifik kelas).
       - Dropdown Periode Bulan & Tahun.
       - Dropdown Filter Status Kehadiran (Semua Status, Ada Hadir, Ada Izin, Ada Sakit, Ada Alpa).
       - Tombol Reset Filter.
     - **Performa Kehadiran per Kelas (Progress Cards)**:
       - Menampilkan bar persentase kehadiran masing-masing kelas di institusi jika sedang melihat semua kelas.
     - **Tabel Rangkuman Kehadiran Seluruh Siswa**:
       - Menampilkan nomor, nama siswa, NISN, kelas, total sesi, akumulasi Hadir (H), Izin (I), Sakit (S), Alpa (A), bar tingkat kehadiran (%), dan badge status peringatan ("Perlu Perhatian" jika kehadiran < 75% atau "Baik").
  2. **Tab Matriks Presensi Kelas**:
     - Tampilan bulanan matriks absensi per kelas harian dengan inline pill dropdown, set hadir hari ini, dan popover dialog catatan evaluasi.

---

## 2. API Endpoints Terkait

Endpoint dilindungi oleh `JwtAuthGuard`, `RolesGuard`, dan decorator `@Roles("admin", "teacher")`.

### A. Summary Statistik Presensi (KPI)
- **URL**: `GET /attendances/summary`
- **Query Parameters**:
  - `class_id` (UUID, opsional): Filter kelas.
  - `month` (number 1-12, opsional): Filter bulan.
  - `year` (number, opsional): Filter tahun.
  - `search` (string, opsional): Pencarian nama/NISN siswa.
- **Response**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Attendance summary retrieved successfully",
    "data": {
      "total": 120,
      "present": 100,
      "permission": 10,
      "sick": 5,
      "absent": 5,
      "attendanceRate": 83.33
    }
  }
  ```

### B. List Detail Presensi (Agregasi Siswa)
- **URL**: `GET /attendances`
- **Query Parameters**:
  - `limit`: `5000` (untuk memuat rekaman periode terpilih).
  - `class_id`, `month`, `year`, `search`.

---

## 3. Komponen Frontend

1. **`AttendanceOverviewTab`** (`apps/web/src/features/attendances/components/attendance-overview-tab.tsx`):
   - Komponen representasi tab Overview & Rangkuman.
   - Menghitung agregasi kehadiran tiap siswa dan tiap kelas secara dinamis.
   - Mengakomodasi ekspor CSV ber-BOM UTF-8.
2. **`AttendancesPage`** (`apps/web/src/features/attendances/components/attendances-page.tsx`):
   - Tab switcher controller yang memfasilitasi navigasi mulus antara `Overview & Rangkuman` dan `Matriks Presensi Kelas`.

---

## 4. Pengujian & Verifikasi

- **Unit Test**: `apps/web/src/features/attendances/components/attendance-overview-tab.spec.tsx` (100% Passed).
- **Linter**: Lolos seluruh aturan `@biomejs/biome` tanpa peringatan/error.
