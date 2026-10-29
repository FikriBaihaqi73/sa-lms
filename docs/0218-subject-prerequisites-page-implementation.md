# Implementasi Halaman Manajemen Prasyarat Mata Kuliah (0218)

## Ringkasan

Fitur ini menyediakan halaman admin institusi `/subject-prerequisites` untuk mengelola hierarki dan mata kuliah prasyarat akademik universitas. Data tersinkronisasi langsung dengan backend NestJS dan database melalui TanStack Query.

## Route dan Guard

- Route frontend: `GET /subject-prerequisites` melalui `apps/web/src/routes/_settings/subject-prerequisites/index.tsx`.
- Akses frontend dibatasi ke admin institusi (`INSTITUTION_ADMIN_ONLY_PREFIXES` di `apps/web/src/routes/__root.tsx`).
- Terdaftar pada navigasi sidebar di bawah kelompok **Konfigurasi Akademik** (`apps/web/src/components/app-sidebar.tsx`).
- Terdaftar di router tree pengaturan (`apps/web/src/router.tsx`).

## Layout & Desain

- **Split-Screen Layout (60% : 40%)**:
  - **Panel Kiri (60%)**: Daftar kartu mata kuliah berbentuk *boxy* (border 1px tegas, palet netral). Dilengkapi pencarian kode/nama mata kuliah, filter tab (*Semua*, *Ada Prasyarat*, *Tanpa Prasyarat*), dan dropdown filter program studi/jurusan. Setiap kartu menampilkan kode mata kuliah (`font-mono`), nama, SKS, semester, jurusan, dan badge jumlah prasyarat.
  - **Panel Kanan (40%)**: Rincian mata kuliah yang sedang dipilih, daftar prasyarat aktif dengan tombol hapus kecil `'X'`, tombol garis putus-putus (*dashed border*) **'+ Tambah Prasyarat'**, kotak informasi akademik, dan tombol hitam solid **'Simpan Perubahan'** di bagian bawah.

## Endpoint Backend yang Digunakan

Semua request memakai `Authorization: Bearer <JWT>`.

| Method | Endpoint | Fungsi | Payload / Query |
| :--- | :--- | :--- | :--- |
| `GET` | `/subjects?page=1&limit=200` | Mengambil daftar mata kuliah institusi | Query params: `page`, `limit`, `search` |
| `GET` | `/departments?page=1&limit=100` | Mengambil opsi jurusan/program studi | Query params: `page`, `limit` |
| `GET` | `/subject-prerequisites?page=1&limit=200` | Mengambil relasi prasyarat yang terdaftar | Query params: `page`, `limit` |
| `POST` | `/subject-prerequisites` | Menambahkan relasi prasyarat mata kuliah baru | `{ subjectId: string, prerequisiteSubjectId: string }` |
| `DELETE` | `/subject-prerequisites/:id` | Menghapus relasi prasyarat mata kuliah | Path parameter: `:id` (UUID relasi) |

## Struktur Komponen

```
apps/web/src/
├── features/
│   └── subject-prerequisites/
│       ├── types/
│       │   └── index.ts                               # Type definitions & API contracts
│       ├── api/
│       │   └── subjectPrerequisites.ts                # API client functions (apiFetch)
│       ├── hooks/
│       │   └── useSubjectPrerequisitesAuto.ts         # React Query hook & draft state
│       └── components/
│           ├── SubjectCard.tsx                        # Boxy card item panel kiri
│           ├── PrerequisiteItem.tsx                   # Prerequisite item dengan tombol 'X'
│           ├── AddPrerequisiteDialog.tsx              # Modal pemilihan prasyarat
│           ├── SubjectPrerequisitesPage.tsx           # Split-screen master-detail page
│           └── SubjectPrerequisitesPage.spec.tsx      # Comprehensive unit tests
└── routes/
    └── _settings/
        └── subject-prerequisites/
            └── index.tsx                              # TanStack Router route
```

## Hasil Pengujian (Unit Tests)

13 file pengujian (102 tests) di `@repo/web` lulus 100%:
- Render tata letak Split-Screen (60% / 40%).
- Render kartu boxy kode, nama, dan badge jumlah prasyarat.
- Reaktivitas panel kanan saat kartu di panel kiri diklik.
- Filter pencarian kode dan nama mata kuliah.
- Filter status (Semua, Ada Prasyarat, Tanpa Prasyarat).
- Hapus prasyarat via tombol `'X'`.
- Tambah prasyarat via modal dan penyimpanan ke database via tombol hitam solid.
