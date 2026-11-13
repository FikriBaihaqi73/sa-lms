# Dokumentasi Fitur Halaman Modul Pembelajaran (Learning Modules Page - Admin)

Dokumen ini merupakan panduan lengkap implementasi dan integrasi frontend fitur **Modul Pembelajaran** (`/modules`) pada aplikasi web Sistem Academic & LMS (`apps/web`). Fitur ini diperuntukkan bagi **Admin Institusi** untuk mengelola silabus bab materi pelajaran, urutan pembelajaran, publikasi materi, dan batasan akses (lock/unlock) materi pada mata pelajaran kelas institusi.

---

## 1. Daftar Endpoint API Backend (`/modules`)

Semua endpoint dilindungi oleh autentikasi JWT (`JwtAuthGuard`) dan hak akses Admin Institusi:

| Method | Endpoint | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/modules` | `admin`, `teacher` | Mengambil daftar modul pembelajaran dengan pencarian dan pagination |
| `GET` | `/modules/:id` | `admin`, `teacher` | Mengambil detail spesifik modul pembelajaran berdasarkan ID |
| `POST` | `/modules` | `admin`, `teacher` | Membuat modul pembelajaran baru |
| `PATCH` | `/modules/:id` | `admin`, `teacher` | Memperbarui modul pembelajaran yang ada |
| `DELETE` | `/modules/:id` | `admin`, `teacher` | Menghapus (soft delete) modul pembelajaran |
| `GET` | `/class-subjects` | `admin` | Mengambil opsi mata pelajaran kelas untuk dropdown form & filter |

---

## 2. Struktur Modul Modular Frontend (`apps/web/src/features/modules/`)

```text
apps/web/src/features/modules/
├── api/
│   ├── index.ts                      # Client wrapper API via apiFetch (getModules, getModuleById, create, update, delete, options)
│   └── api.spec.ts                   # Unit tests untuk endpoint wrapper API
├── components/
│   ├── module-stats.tsx               # 4 Kartu metrik: TOTAL MODUL, DITERBITKAN, TERKUNCI, KONTEN MATERI
│   ├── module-filter.tsx              # Input pencarian debounced, dropdown mapel kelas, tombol reset
│   ├── module-table.tsx               # Tabel daftar modul dengan urutan, mapel kelas, status penerbitan & kunci, pagination
│   ├── module-dialog.tsx              # Modal form tambah & ubah modul pembelajaran (React Hook Form + Zod)
│   ├── module-detail-dialog.tsx       # Modal baca detail lengkap informasi silabus & materi terhubung
│   ├── module-delete-dialog.tsx       # Dialog konfirmasi hapus modul pembelajaran (soft delete)
│   ├── modules-page.tsx               # Komponen utama orchestrator halaman modul
│   └── ModulesPage.spec.tsx           # Unit tests interaksi komponen & mutasi
├── hooks/
│   └── index.ts                      # React Query hooks (useModules, useModule, useCreateModule, useUpdateModule, useDeleteModule, useClassSubjectOptions)
├── schemas/
│   └── index.ts                      # Skema validasi Zod form & filter
├── types/
│   └── index.ts                      # Strict TypeScript interfaces (tanpa any)
├── access-contract.spec.ts           # Access contract tests (sidebar & root route restrictions)
└── index.ts                          # Barrel export
```

---

## 3. Rute & Akses Halaman

- **Rute URL**: `/modules`
- **File Route TanStack**: `apps/web/src/routes/_settings/modules/index.tsx`
- **Navigasi Sidebar**: Berada di grup navigasi **Konfigurasi Akademik** dengan ikon `BookOpen` dan label `Modul Pembelajaran`.
- **Proteksi Hak Akses**: Dibatasi khusus untuk **Admin Institusi** (`isInstitutionAdmin`) pada `apps/web/src/routes/__root.tsx`.

---

## 4. Spesifikasi Request & Response

### A. Mengambil Daftar Modul (`GET /modules`)
#### Query Parameters
- `page`: Nomor halaman (integer, default: 1).
- `limit`: Jumlah per halaman (integer, default: 10).
- `search`: Pencarian parsial berdasarkan judul modul (case-insensitive).
- `class_subject_id`: Filter berdasarkan UUID mata pelajaran kelas.

#### Success Response (`200 OK`)
```json
{
  "status": "success",
  "code": 200,
  "message": "Learning modules retrieved successfully",
  "data": [
    {
      "id": "9d7a5dd3-86c0-49a3-9a7f-9ea501c91350",
      "class_subject_id": "a8a24b7f-9d9f-4e60-b9b5-b9c5d1bcf899",
      "title": "Bab 1: Logika Komputasi & Pemrograman Dasar",
      "description": "Pembahasan konsep dasar algoritma, flowchart, dan variabel.",
      "display_order": 1,
      "is_published": true,
      "is_locked": false,
      "created_at": "2026-11-13T09:00:00.000Z",
      "updated_at": "2026-11-13T09:00:00.000Z",
      "class_subject": {
        "id": "a8a24b7f-9d9f-4e60-b9b5-b9c5d1bcf899",
        "class": { "id": "c-1", "name": "X-RPL-1" },
        "subject": { "id": "s-1", "name": "Informatika", "code": "INF-10" },
        "teacher": {
          "id": "t-1",
          "teacher_number": "198501012010011001",
          "profile": { "id": "p-1", "fullName": "Budi Santoso, S.Kom" }
        }
      },
      "moduleContents": [
        { "id": "mc-1", "title": "Pengenalan Flowchart", "contentType": "text" }
      ],
      "assignments": []
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

### B. Membuat Modul Pembelajaran (`POST /modules`)
#### Request Body (JSON)
```json
{
  "class_subject_id": "a8a24b7f-9d9f-4e60-b9b5-b9c5d1bcf899",
  "title": "Bab 2: Struktur Kontrol Percabangan",
  "description": "Kondisi IF-ELSE, SWITCH-CASE, dan implementasi kasus.",
  "display_order": 2,
  "is_published": false,
  "is_locked": false
}
```

#### Success Response (`201 Created`)
```json
{
  "status": "success",
  "code": 201,
  "message": "Learning module created successfully",
  "data": {
    "id": "8f1a2345-6789-4bcd-ef01-23456789abcd",
    "class_subject_id": "a8a24b7f-9d9f-4e60-b9b5-b9c5d1bcf899",
    "title": "Bab 2: Struktur Kontrol Percabangan",
    "description": "Kondisi IF-ELSE, SWITCH-CASE, dan implementasi kasus.",
    "display_order": 2,
    "is_published": false,
    "is_locked": false,
    "created_at": "2026-11-13T09:10:00.000Z",
    "updated_at": "2026-11-13T09:10:00.000Z"
  }
}
```

---

## 5. Fitur Antarmuka Pengguna (UI)

1. **Dashboard 4 Kartu Metrik**:
   - **TOTAL MODUL**: Jumlah keseluruhan modul silabus terdata pada institusi.
   - **DITERBITKAN**: Modul yang berstatus aktif dan dapat diakses siswa.
   - **TERKUNCI**: Modul yang aksesnya dibatasi/dikunci oleh pengajar/admin.
   - **KONTEN MATERI**: Akumulasi bahan bacaan, materi, dan tugas yang terhubung.
2. **Filter & Pencarian Dinamis**:
   - Pencarian teks dengan debounce 400ms terhadap judul atau deskripsi modul.
   - Dropdown filter berdasarkan mata pelajaran kelas (`class_subject_id`).
   - Tombol *Reset* filter untuk mengembalikan pencarian ke kondisi awal.
3. **Tabel Data Komprehensif**:
   - Badge status penerbitan (*Diterbitkan* / *Draf*).
   - Badge status kunci (*Terkunci* / *Terbuka*).
   - Indikator urutan tampil, nama mapel, rombel kelas, nama guru pengampu, serta jumlah materi dan tugas terlampir.
4. **Modal Form Tambah & Ubah Modul**:
   - Validasi ketat menggunakan Zod & React Hook Form.
   - Dukungan toggle status terbitkan dan kunci modul.
5. **Modal Baca Detail Modul**:
   - Tampilan modal untuk membaca rincian kompetensi dasar/silabus modul tanpa terpotong.
6. **Dialog Konfirmasi Hapus**:
   - Konfirmasi aman sebelum melakukan *soft delete*.

