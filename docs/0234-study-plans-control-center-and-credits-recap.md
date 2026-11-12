# Handoff Dokumentasi Fitur: Rencana Studi (KRS) Control Center & Monitoring

## 1. Ikhtisar Fitur
Fitur **Rencana Studi (KRS)** telah direfaktor penuh menjadi **Pusat Kontrol, Rekapitulasi SKS, & Monitoring KRS** di sisi Admin/Guru.
Modul ini mendukung pemantauan beban kredit (SKS) mahasiswa/siswa berdasarkan `Subject.credits` (maksimum beban standar 24 SKS), pengelompokan bidang/departemen dari `Subject.department`, serta intervensi langsung Admin untuk melakukan pendaftaran mandiri maupun manual (Force Enroll).

---

## 2. Endpoints Backend (`apps/api`)

### A. Mendapatkan Daftar Rencana Studi
- **URL**: `GET /study-plans`
- **Headers**: `Authorization: Bearer <token>`
- **Query Parameters**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string, opsional): Pencarian nama siswa, NIS/NIM, kode mapel, atau nama mata pelajaran.
  - `student_id` (UUID, opsional): Filter berdasarkan ID siswa.
  - `class_subject_id` (UUID, opsional): Filter berdasarkan ID mata pelajaran kelas.
  - `academic_year_id` (UUID, opsional): Filter berdasarkan ID tahun ajaran.
  - `department_id` (UUID, opsional): Filter berdasarkan ID departemen/bidang.

- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Study plans retrieved successfully",
  "data": [
    {
      "id": "e2a4a75e-8b6b-4e17-bfd2-0850dfd7f001",
      "student_id": "8bb5d1ea-6c2e-4b68-80f0-8e10034a7001",
      "class_subject_id": "c1f2e3d4-5678-4321-8765-abcdef123456",
      "academic_year_id": "f4e3d2c1-1234-5678-90ab-cdef12345678",
      "created_at": "2026-11-11T00:00:00.000Z",
      "updated_at": "2026-11-11T00:00:00.000Z",
      "student": {
        "id": "8bb5d1ea-6c2e-4b68-80f0-8e10034a7001",
        "studentNumber": "1001",
        "profile": {
          "fullName": "Fajar Nugraha",
          "email": "fajar@example.com"
        }
      },
      "classSubject": {
        "id": "c1f2e3d4-5678-4321-8765-abcdef123456",
        "class": {
          "id": "class-1",
          "name": "X-RPL-1"
        },
        "subject": {
          "id": "sub-1",
          "code": "PRG-101",
          "name": "Pemrograman Dasar",
          "credits": 3,
          "department": {
            "id": "dept-1",
            "name": "Teknik Informatika",
            "code": "TI"
          }
        },
        "teacher": {
          "id": "tch-1",
          "teacher_number": "T001",
          "profile": {
            "fullName": "Hendra Wijaya"
          }
        }
      },
      "academicYear": {
        "id": "f4e3d2c1-1234-5678-90ab-cdef12345678",
        "academic_year": "2026/2027",
        "is_active": true
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

### B. Membuat / Force Enroll Rencana Studi
- **URL**: `POST /study-plans`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Request Body**:
```json
{
  "student_id": "8bb5d1ea-6c2e-4b68-80f0-8e10034a7001",
  "class_subject_id": "c1f2e3d4-5678-4321-8765-abcdef123456",
  "academic_year_id": "f4e3d2c1-1234-5678-90ab-cdef12345678"
}
```
*Catatan: `academic_year_id` bersifat opsional; jika tidak dikirim, otomatis mengikuti tahun ajaran dari `classSubject` terkait.*

- **Response Duplikasi (409 Conflict)**:
```json
{
  "status": "error",
  "code": 409,
  "message": "Siswa sudah terdaftar pada mata pelajaran kelas ini untuk tahun ajaran yang dipilih."
}
```

### C. Menghapus / Drop Rencana Studi
- **URL**: `DELETE /study-plans/:id`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Study plan deleted successfully",
  "data": {
    "success": true,
    "id": "e2a4a75e-8b6b-4e17-bfd2-0850dfd7f001"
  }
}
```

---

## 3. Fitur Frontend (`apps/web/src/features/study-plans/`)

### A. 4 Kartu Ringkasan Eksekutif (`study-plan-stats.tsx`)
1. **SISWA SUDAH KRS**: Jumlah siswa unik yang telah mengambil minimal 1 mapel pada tahun ajaran aktif.
2. **TOTAL PENGAMBILAN**: Total transaksi pendaftaran KRS beserta akumulasi SKS terambil.
3. **KELAS / MAPEL AKTIF**: Jumlah mata pelajaran kelas aktif beserta jumlah departemen/bidang.
4. **SISWA BELUM KRS**: Jumlah siswa terdaftar yang belum mengambil KRS sama sekali (indikator atensi warna amber).

### B. 3 Tab Mode Tampilan (`study-plan-filter.tsx`)
1. **Tab 1: Rekap per Siswa & SKS (`student_view` - Default)**:
   - Pengelompokan data berdasarkan Siswa.
   - Kolom: Siswa (Avatar & Nama/NIS), Kelas/Bidang, Jumlah Mapel, Beban Kredit (SKS) dengan visual progress bar `/ 24 SKS`, Status KRS (`Sudah KRS` / `Belum KRS`), dan Tombol Aksi (`Rincian` & `+ Mapel`).
   - Fitur Expandable Row: Menampilkan kartu-kartu mata pelajaran yang diambil siswa lengkap dengan tombol **Drop / Hapus**.
2. **Tab 2: Katalog Mapel Kelas (`catalog_view`)**:
   - Menampilkan penawaran seluruh mata pelajaran kelas.
   - Kolom: Kode & Nama Mapel, Kelas & Bidang, Bobot SKS, Pengajar, Jumlah Pendaftar Real-time, Status Periode (Dibuka/Ditutup), dan Tombol `+ Daftarkan Siswa`.
3. **Tab 3: Log Transaksi KRS (`log_view`)**:
   - Menampilkan daftar log transaksi individual KRS dengan pagination.
   - Tombol Ubah dan Hapus.

### C. Modal Dialog Intervensi Admin (`study-plan-dialog.tsx`)
- Pilihan Siswa, Tahun Ajaran, dan Mata Pelajaran Kelas.
- **Info Box SKS Otomatis**: Menampilkan perhitungan otomatis *SKS Saat Ini*, *Tambahan SKS*, dan *Total SKS KRS*. Terdapat peringatan jika total melebihi 24 SKS.

