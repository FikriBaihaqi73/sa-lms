# Frontend Handoff & Technical Documentation: Penggabungan Data KRS Jurusan dalam Semester (Bundle)

**Feature Code**: `0249/fix-page-krs(admin)`  
**Scope**: Manajemen Pengambilan Rencana Studi (KRS) Mahasiswa / Siswa berbasis Semester & Jurusan (Paket Bundle) oleh Admin Institusi.  
**Applications Involved**: `apps/api` (Backend), `packages/shared` (Schemas & DTOs), `apps/web` (Frontend).

---

## 1. Overview & Problem Statement

Sebelumnya, Admin atau Mahasiswa hanya dapat mengambil/mendaftarkan mata pelajaran kelas rencana studi (KRS) satu per satu. Hal ini memakan waktu dan rentan terjadi kesalahan pemilihan mata pelajaran lintas semester atau lintas jurusan.

Fitur **Penggabungan Data KRS Jurusan dalam Semester (Bundle)** memungkinkan:
1. Mahasiswa / Admin memilih satu semester aktif dan jurusan tertentu (contoh: *Teknik Informatika*, *Semester Ganjil*).
2. Sistem secara otomatis menggabungkan seluruh mata pelajaran kurikulum yang termasuk dalam paket (bundle) jurusan tersebut pada semester tersebut.
3. Mendukung preview paket bundle dengan visual indikator SKS (bobot kredit), badge `[Paket Jurusan]`, tombol 1-klik `Gabungkan Semua Paket` / `Paket Tergabung`, serta penegakan batas maksimal kuota kredit (misal: 24 SKS).
4. Menyediakan endpoint batch `POST /study-plans/bundle` yang mendaftarkan kumpulan mata pelajaran sekaligus secara atomik dan idempoten (melewati mata pelajaran yang sudah pernah didaftarkan tanpa menimbulkan error 409).

---

## 2. API Endpoints

### A. Create Study Plan Bundle (Batch / Paket)
Mendaftarkan sekumpulan mata pelajaran kelas untuk seorang siswa dalam suatu tahun ajaran sekaligus.

- **Method**: `POST`
- **URL**: `/study-plans/bundle`
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <access_token>
  ```

#### Request Body
```json
{
  "student_id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8b",
  "academic_year_id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8c",
  "class_subject_ids": [
    "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8d",
    "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8e"
  ]
}
```

#### Request Fields Specification
| Field | Type | Required | Description |
|---|---|---|---|
| `student_id` | `string (UUID)` | Ya | ID unik siswa yang akan didaftarkan ke paket rencana studi. |
| `academic_year_id` | `string (UUID)` | Ya | ID unik tahun ajaran rencana studi. |
| `class_subject_ids` | `string[] (UUID)` | Ya | Daftar ID mata pelajaran kelas yang termasuk dalam paket bundle (minimal 1). |

#### Response: Success (HTTP 201 Created)
```json
{
  "status": "success",
  "code": 201,
  "message": "Pendaftaran paket rencana studi berhasil diproses.",
  "data": {
    "totalRequested": 2,
    "totalEnrolled": 2,
    "totalSkipped": 0,
    "data": [
      {
        "id": "018f4a3b-9999-7b23-a12b-3c4d5e6f7a81",
        "student_id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8b",
        "class_subject_id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8d",
        "academic_year_id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8c",
        "created_at": "2026-11-25T09:00:00.000Z",
        "updated_at": "2026-11-25T09:00:00.000Z"
      },
      {
        "id": "018f4a3b-9999-7b23-a12b-3c4d5e6f7a82",
        "student_id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8b",
        "class_subject_id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8e",
        "academic_year_id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8c",
        "created_at": "2026-11-25T09:00:00.000Z",
        "updated_at": "2026-11-25T09:00:00.000Z"
      }
    ]
  }
}
```

#### Response: Partial Enrollment (Skipped Duplicates)
Jika beberapa mata pelajaran dalam paket sudah pernah diambil oleh siswa:
```json
{
  "status": "success",
  "code": 201,
  "message": "Pendaftaran paket rencana studi berhasil diproses.",
  "data": {
    "totalRequested": 3,
    "totalEnrolled": 2,
    "totalSkipped": 1,
    "data": [ ... ]
  }
}
```

#### Response: Error - Student Not Found (HTTP 404 Not Found)
```json
{
  "status": "error",
  "code": 404,
  "message": "Siswa dengan ID 018f4a3b-... tidak ditemukan."
}
```

#### Response: Error - Class Subject Not Found (HTTP 404 Not Found)
```json
{
  "status": "error",
  "code": 404,
  "message": "Mata pelajaran kelas dengan ID 018f4a3b-... tidak ditemukan."
}
```

#### Response: Error - Validation Failed (HTTP 400 Bad Request)
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "class_subject_ids",
      "message": "Daftar mata pelajaran kelas tidak boleh kosong"
    }
  ]
}
```

---

### B. Get Semester Options
Mengambil daftar semester yang tersedia pada institusi (dapat difilter per tahun ajaran).

- **Method**: `GET`
- **URL**: `/semesters`
- **Query Params**:
  - `academic_year_id` (optional): Filter semester berdasarkan tahun ajaran.
- **Headers**:
  ```http
  Authorization: Bearer <access_token>
  ```

#### Response Success (HTTP 200 OK)
```json
{
  "status": "success",
  "code": 200,
  "message": "Semesters retrieved successfully",
  "data": [
    {
      "id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8f",
      "academic_year_id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8c",
      "name": "Semester Ganjil",
      "is_active": true,
      "academicYear": {
        "id": "018f4a3b-2c1a-7b23-a12b-3c4d5e6f7a8c",
        "academic_year": "2026/2027",
        "is_active": true
      }
    }
  ]
}
```

---

## 3. Frontend Implementation Flow

### Flow 1: Filter Bar Semester & Jurusan
1. Di halaman utama KRS (`StudyPlansPage`), filter bar dilengkapi dengan pilihan:
   - **Tahun Ajaran**
   - **Semester** (pilihan semester disinkronkan dengan tahun ajaran aktif)
   - **Bidang / Departemen**
   - **Mata Pelajaran**
2. Ketika admin memilih satu Jurusan tertentu pada filter bar:
   - Muncul **Banner Paket KRS Jurusan**: menampilkan nama jurusan, tahun ajaran aktif, jumlah mata pelajaran yang termasuk dalam paket, total SKS, serta tombol aksi cepat `+ Daftarkan Siswa ke Paket Ini`.

### Flow 2: Tombol `+ Paket` pada Baris Siswa (Tabel Rekap)
1. Pada setiap baris siswa di tab *Rekap per Siswa & SKS*, tersedia tombol aksi:
   - `+ Paket` (warna indigo) untuk membuka modal force enroll langsung dalam mode bundling.
   - `+ Tambah` (warna biru) untuk pemilihan manual.
2. Ketika tombol `+ Paket` diklik:
   - Dialog KRS terbuka dengan siswa yang dipilih terkunci.
   - Pilihan jurusan siswa secara otomatis terpilih.
   - Semua mata pelajaran dari jurusan tersebut langsung dicentang (bundled).

### Flow 3: Auto-Bundling di Modal Dialog Intervensi Admin (`StudyPlanDialog`)
1. **Pilihan Semester & Tahun Ajaran**:
   - Terdapat selector gabungan baris 2: Tahun Ajaran dan Semester.
   - Mengubah Semester secara otomatis menyinkronkan Tahun Ajaran terkait dan mengaktifkan mode bundling.
2. **Pilihan Bidang / Departemen (Interactive Pill Buttons)**:
   - Memilih pill jurusan (misal: *Teknik Informatika*) secara cerdas mengelompokkan mata pelajaran dalam jurusan tersebut.
   - Jika mode bundle aktif, seluruh mata pelajaran dalam jurusan tersebut otomatis dicentang ke dalam paket.
3. **Card Paket KRS Jurusan**:
   - Menampilkan ringkasan: `Paket KRS: [Nama Jurusan] • [Nama Semester]`.
   - Menampilkan total mata pelajaran dan total SKS paket.
   - Tombol toggle 1-klik:
     - Jika belum semua dicentang: `Gabungkan Semua Paket (X Mapel • Y SKS)`.
     - Jika sudah semua dicentang: `Paket Tergabung (X Mapel)`.
4. **Indikator pada Checkbox**:
   - Mata pelajaran yang termasuk dalam paket jurusan diberi badge `[Paket Jurusan]`.
   - Mata pelajaran yang sudah pernah diambil siswa diberi badge `[Sudah Diambil]` dan diceklis serta dinonaktifkan (disabled).
5. **Kalkulator & Validasi Kuota 24 SKS**:
   - Menghitung secara real-time: `Kredit Terpakai + Dipilih Baru = Total Kredit Akhir / 24 SKS`.
   - Jika total kredit melebihi 24 SKS, muncul alert peringatan merah `Kredit siswa tidak mencukupi!` dan tombol `Simpan` dinonaktifkan.

---

## 4. Edge Cases & Handling

1. **Mata Pelajaran Duplikat**:
   - Backend memvalidasi `existingPlans` siswa dan secara aman melewatkan (skip) mata pelajaran yang sudah terdaftar.
   - Frontend menampilkan notifikasi informatif: `X mata pelajaran berhasil didaftarkan (Y mapel sudah pernah diambil dilewati)`.
2. **Pergantian Semester Tanpa Mata Pelajaran**:
   - Jika suatu jurusan tidak memiliki mata pelajaran yang dibuka pada tahun ajaran/semester yang dipilih, dialog menampilkan pesan `Belum ada bidang studi / mata pelajaran kelas yang dibuka pada tahun ajaran ini` dan tidak menampilkan card bundle kosong.
3. **Mata Pelajaran Dinonaktifkan**:
   - Mata pelajaran yang dinonaktifkan lewat toggle katalog tetap diabaikan dari pembentukan paket bundle.
