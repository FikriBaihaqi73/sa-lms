# Dokumentasi Implementasi Halaman Rekap Nilai Siswa (Admin) - Task 0243

## 1. Ikhtisar Fitur (Feature Overview)
Fitur **Halaman Rekap Nilai Siswa (KHS / Study Results)** menyediakan antarmuka interaktif khusus untuk **Admin Institusi** guna memantau capaian akademik siswa, termasuk:
- Indeks Prestasi Semester (IPS)
- Indeks Prestasi Kumulatif (IPK)
- Total SKS yang ditempuh
- Status Akademik Siswa per Semester (Aktif, Cuti, dsb.)
- Filter multi-dimensi berdasarkan Departemen/Program Studi, Kelas, Tahun Ajaran, Semester, dan Status Akademik
- Fitur pencarian instan (NIS, Nama Siswa, Tahun Ajaran) dengan debounce 300ms
- Ekspor rekap nilai siswa ke format file CSV dengan dukungan UTF-8 BOM
- Sinkronisasi data real-time dengan auto-fetch dan query invalidation melalui TanStack Query

---

## 2. Hak Akses & Batasan Role (Access Contract)
- **Role yang diizinkan**: `admin` (Admin Institusi).
- **Pembatasan Backend**: Diatur pada controller menggunakan decorator `@Roles("admin")` dan `@UseGuards(JwtAuthGuard, RolesGuard)`.
- **Pembatasan Frontend**:
  - Rute `/study-results` didaftarkan pada `INSTITUTION_ADMIN_ONLY_PREFIXES` di `apps/web/src/routes/__root.tsx`.
  - Tautan menu navigasi "Rekap Nilai Siswa" hanya muncul di Sidebar untuk user dengan role Admin pada bagian **Konfigurasi Akademik**.

---

## 3. Spesifikasi API Endpoint

### A. Mendapatkan Daftar Rekap Nilai Siswa (Dengan Filter)
- **Method**: `GET`
- **URL**: `/study-results`
- **Query Parameters**:
  - `page` (opsional, number, default: 1): Nomor halaman.
  - `limit` (opsional, number, default: 10): Jumlah item per halaman.
  - `search` (opsional, string): Pencarian teks bebas (NIS siswa, nama siswa, atau tahun ajaran).
  - `departmentId` (opsional, UUID): Filter siswa berdasarkan departemen/jurusan.
  - `classId` (opsional, UUID): Filter siswa berdasarkan kelas tempat siswa terdaftar.
  - `academicYearId` (opsional, UUID): Filter tahun ajaran.
  - `semesterId` (opsional, UUID): Filter semester.
  - `academicStatusId` (opsional, UUID): Filter status akademik (Aktif, Cuti, dsb.).
- **Headers**:
  - `Authorization: Bearer <access_token>`

#### Contoh Respon Sukses (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Study results retrieved successfully",
  "data": [
    {
      "id": "e43b67c1-8840-41da-8db1-e97ba1192931",
      "studentId": "b1f7e02b-2f10-482a-a9e9-d3e75e921b38",
      "academicYearId": "f7d3a011-37d4-49ab-a02e-c357fbb46821",
      "semesterId": "a901bf64-16f3-4211-9e73-b3c9597ba120",
      "academicStatusId": "87e35b71-3c58-45ec-b17e-c80f63ef4741",
      "totalCredits": 20,
      "semesterGpa": 3.85,
      "cumulativeGpa": 3.80,
      "student": {
        "id": "b1f7e02b-2f10-482a-a9e9-d3e75e921b38",
        "studentNumber": "2026001",
        "departmentId": "1b08c66e-c6c7-4340-9799-a41e97669d01",
        "classStudents": [
          {
            "id": "cs-1",
            "classId": "349f2b1d-8472-4682-82cb-2fcae958133b",
            "classes": {
              "id": "349f2b1d-8472-4682-82cb-2fcae958133b",
              "name": "TIF-1A",
              "grade_level": 1
            }
          }
        ],
        "profile": {
          "id": "6732cf09-21b3-467f-94ad-779836173a4b",
          "fullName": "Ahmad Dahlan",
          "email": "ahmad@example.com",
          "phoneNumber": "08123456789",
          "identityNumber": "3201012345670001"
        }
      },
      "academicYear": {
        "id": "f7d3a011-37d4-49ab-a02e-c357fbb46821",
        "academic_year": "2026/2027",
        "is_active": true
      },
      "semester": {
        "id": "a901bf64-16f3-4211-9e73-b3c9597ba120",
        "name": "Semester Ganjil",
        "is_active": true
      },
      "academicStatus": {
        "id": "87e35b71-3c58-45ec-b17e-c80f63ef4741",
        "name": "Aktif",
        "description": "Mahasiswa aktif mengikuti perkuliahan"
      },
      "createdAt": "2026-11-01T08:00:00.000Z",
      "updatedAt": "2026-11-01T08:00:00.000Z"
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

### B. Mendapatkan Rincian Rekap Nilai Siswa (Get By ID)
- **Method**: `GET`
- **URL**: `/study-results/:id`
- **Headers**: `Authorization: Bearer <access_token>`

#### Contoh Respon Sukses (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Study result retrieved successfully",
  "data": {
    "id": "e43b67c1-8840-41da-8db1-e97ba1192931",
    "studentId": "b1f7e02b-2f10-482a-a9e9-d3e75e921b38",
    "totalCredits": 20,
    "semesterGpa": 3.85,
    "cumulativeGpa": 3.80,
    "student": {
      "profile": {
        "fullName": "Ahmad Dahlan"
      }
    }
  }
}
```

---

### C. Menambah Rekap Nilai Siswa (Create)
- **Method**: `POST`
- **URL**: `/study-results`
- **Request Body**:
```json
{
  "studentId": "b1f7e02b-2f10-482a-a9e9-d3e75e921b38",
  "academicYearId": "f7d3a011-37d4-49ab-a02e-c357fbb46821",
  "semesterId": "a901bf64-16f3-4211-9e73-b3c9597ba120",
  "academicStatusId": "87e35b71-3c58-45ec-b17e-c80f63ef4741",
  "totalCredits": 20,
  "semesterGpa": 3.85,
  "cumulativeGpa": 3.80
}
```

#### Validasi Error (400 Bad Request):
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "semesterGpa",
      "message": "Indeks Prestasi Semester (IPS) harus antara 0.00 dan 4.00"
    }
  ]
}
```

---

### D. Mengubah Rekap Nilai Siswa (Update)
- **Method**: `PATCH`
- **URL**: `/study-results/:id`
- **Request Body**:
```json
{
  "totalCredits": 22,
  "semesterGpa": 3.90,
  "cumulativeGpa": 3.85
}
```

---

### E. Menghapus Rekap Nilai Siswa (Delete)
- **Method**: `DELETE`
- **URL**: `/study-results/:id`
- **Headers**: `Authorization: Bearer <access_token>`

#### Contoh Respon Sukses (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Study result deleted successfully",
  "data": {
    "success": true,
    "id": "e43b67c1-8840-41da-8db1-e97ba1192931"
  }
}
```

---

## 4. Struktur Modul & Komponen Frontend

Direktori: `apps/web/src/features/study-results/`
```
├── api/
│   └── study-results.ts            # Client HTTP functions untuk CRUD dan fetch opsi
├── components/
│   ├── StudyResultsHeader.tsx      # Judul halaman, aksi Ekspor CSV, dan tombol Tambah
│   ├── StudyResultsStats.tsx       # 4 Kartu metrik ringkasan (Total, Rata-rata IPK, IPS, Aktif)
│   ├── StudyResultsFilter.tsx      # Baris filter: Departemen, Kelas, Tahun Ajaran, Semester, Status, Search, Reset
│   ├── StudyResultsTable.tsx       # Tabel interaktif hasil studi, badge nilai, status, pagination
│   ├── StudyResultDialog.tsx       # Modal form tambah & edit data dengan validasi Zod
│   ├── StudyResultDetailDialog.tsx # Modal detail informasi lengkap rekap nilai siswa
│   ├── DeleteStudyResultDialog.tsx # Modal konfirmasi penghapusan aman
│   ├── StudyResultsPage.tsx        # Container utama pengelola state dan queries
│   └── StudyResultsPage.spec.tsx   # Pengujian unit komprehensif Vitest & React Testing Library
├── hooks/
│   └── useStudyResults.ts          # TanStack Query hooks (auto-fetch, invalidasi mutasi, stats calculation)
├── schemas/
│   └── studyResultSchema.ts        # Zod validation schema untuk form rekap nilai
├── types/
│   └── index.ts                    # Tipe TypeScript domain hasil studi dan opsi
└── index.ts                        # Barrel export untuk modularitas
```

---

## 5. Alur Logika Frontend & Ekspor CSV

1. **Auto-Fetch & Sinkronisasi**:
   - Komponen `StudyResultsPage` menggunakan `useStudyResults({ page, limit, search, departmentId, classId, academicYearId, semesterId, academicStatusId })`.
   - Menggunakan query key `["study-results", filters]`.
   - Setiap mutasi (`create`, `update`, `delete`) secara otomatis memicu query invalidation ke `["study-results"]` sehingga UI langsung ter-update tanpa perlu reload browser.
2. **Perhitungan Metrik Real-time**:
   - `useStudyResultStats` menghitung rata-rata IPK kumulatif, rata-rata IPS semester, dan jumlah siswa aktif secara dinamis dari data yang ditampilkan.
3. **Ekspor CSV**:
   - Tombol "Ekspor CSV" mengonversi seluruh data yang sedang aktif ke dalam format CSV berstandar RFC 4180.
   - Menggunakan prefix UTF-8 BOM (`\uFEFF`) agar karakter nama khusus dan angka format Indonesia terbuka dengan rapi di Microsoft Excel.
   - Nama file output terformat rapi: `rekap-nilai-siswa-YYYY-MM-DD.csv`.

---

## 6. Verifikasi & Pengujian
- **Unit Testing**:
  - `pnpm --filter @repo/web test StudyResultsPage` : 9/9 tes lulus.
  - `pnpm --filter @repo/api test study-result` : 34/34 tes lulus.
- **Build & Linter**:
  - `pnpm --filter @repo/web run build` : `tsc -b && vite build` sukses dengan 0 error.
  - `pnpm --filter @repo/api run build` : `nest build` sukses dengan 0 error.
  - `pnpm biome check` : 0 error, 0 warning.
