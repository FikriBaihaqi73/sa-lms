# Dokumentasi Implementasi: Warna & Ikon Status Kehadiran serta Sinkronisasi Presensi

Dokumen ini mendokumentasikan pembaruan fitur **Status Kehadiran** dan **Presensi Siswa** pada sistem SA-LMS.

---

## 1. Ringkasan Perubahan

1. **Halaman Status Kehadiran (`apps/web/src/features/attendance-statuses`)**:
   - **Pilihan Warna**: Tersedia 6 preset warna (Biru `#2563EB`, Hijau `#16A34A`, Merah `#DC2626`, Oranye `#D97706`, Ungu `#7C3AED`, Abu-abu `#64748B`) dan input pemilih warna kustom (HEX & native color picker).
   - **Pilihan Ikon**: Tersedia pilihan ikon standar (`check`, `x`, `alert`, `clock`) serta dukungan karakter custom huruf tunggal A–Z (`letter:A` s/d `letter:Z`).
   - **Pratinjau Real-Time**: Tampilan badge di formulir modal Tambah/Ubah langsung menyesuaikan warna dan ikon yang dipilih admin secara live.
   - **Penyimpanan**: Nilai `color` dan `icon` dikirim dan divalidasi dengan Zod schema dan disimpan ke dalam database.

2. **Halaman Presensi & Absen (`apps/web/src/features/attendances`)**:
   - **Penghapusan Data Hardcoded**: Menghapus styling hardcoded (warna default dan ikon statis) pada tabel matriks dan modal status absensi.
   - **Render Dinamis Terintegrasi**:
     - **Legend Matriks**: Menampilkan seluruh opsi status kehadiran yang aktif lengkap dengan warna dan ikonnya secara dinamis.
     - **Pill Absensi per Siswa**: Menampilkan warna border/background tint dan ikon yang sesuai dengan status kehadiran siswa pada tanggal tersebut.
     - **Modal Ubah Presensi Siswa (`AttendanceNoteDialog`)**: Opsi pilihan status me-render warna dan ikon dinamis sesuai data dari Status Kehadiran.

---

## 2. Rincian API & Endpoint

### A. Status Kehadiran (`/attendance-statuses`)
- **GET `/attendance-statuses`**:
  - Query Params: `page`, `limit`, `search`
  - Respons: Daftar status kehadiran milik institusi pengguna beserta properti `color` dan `icon`.
- **POST `/attendance-statuses`**:
  - Request Body:
    ```json
    {
      "name": "Dispensasi",
      "description": "Izin kegiatan sekolah luar",
      "color": "#7C3AED",
      "icon": "letter:D"
    }
    ```
  - Validasi: `color` harus format HEX `#RRGGBB`, `icon` berupa ikon standar atau `letter:A-Z`.
- **PATCH `/attendance-statuses/:id`**:
  - Request Body: Partial dari data `CreateAttendanceStatusDto`.
- **DELETE `/attendance-statuses/:id`**:
  - Menghapus status kehadiran (dibatasi jika sudah dipakai pada catatan absensi).

### B. Presensi Siswa (`/attendances`)
- **GET `/attendances`**:
  - Mengambil data presensi dengan eager-loading relasi `attendance_status` yang mencakup field `id`, `name`, `description`, `color`, dan `icon`.
- **POST `/attendances/upsert`**:
  - Menyimpan atau memperbarui catatan presensi siswa pada jadwal dan tanggal tertentu.

---

## 3. Komponen Frontend Terkait

- [AttendanceStatusDialog.tsx](file:///c:/sa-lms-baru/apps/web/src/features/attendance-statuses/components/AttendanceStatusDialog.tsx): Modal formulir tambah/edit dengan pilihan warna preset/kustom dan ikon/huruf.
- [attendance-status-icon.tsx](file:///c:/sa-lms-baru/apps/web/src/features/attendance-statuses/components/attendance-status-icon.tsx): Komponen `AttendanceStatusIcon` dan `AttendanceStatusBadge`.
- [attendance-matrix-table.tsx](file:///c:/sa-lms-baru/apps/web/src/features/attendances/components/attendance-matrix-table.tsx): Tabel matriks presensi dengan legend dinamis dan tombol pill warna/ikon terintegrasi.
- [attendance-note-popover.tsx](file:///c:/sa-lms-baru/apps/web/src/features/attendances/components/attendance-note-popover.tsx): Dialog popover pencatatan absensi & catatan siswa dengan tombol opsi status dinamis.
- [attendances-page.tsx](file:///c:/sa-lms-baru/apps/web/src/features/attendances/components/attendances-page.tsx): Halaman utama koordinasi filter, matriks siswa, dan rekonsiliasi data status.

---

## 4. Hasil Verifikasi & Pengujian

- **Linter (Biome)**: Lolos 100% tanpa peringatan maupun error.
- **TypeScript (`tsc -b`)**: Exit code 0 (bebas error kompilasi).
- **Unit & Integration Test (Vitest)**:
  - `src/features/attendance-statuses`: 8 passed
  - `src/features/attendances`: 16 passed
  - Total: 24 passed
- **API Unit Test (Jest)**:
  - `apps/api/src/attendance-status`: 10 passed

