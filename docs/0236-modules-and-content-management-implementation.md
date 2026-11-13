# Implementasi Halaman Modul Materi & Konten Pembelajaran (Admin)

Dokumentasi ini menjelaskan implementasi fitur manajemen modul pembelajaran dan konten materi khusus untuk role **Admin**, sesuai dengan Task `0236/feat-page-modules-content`.

---

## 1. Ringkasan Fitur
- **Halaman Manajemen**: Halaman antarmuka khusus di panel admin pada rute `/_settings/modules` (`/modules`).
- **Fungsi Utama**:
  - **CRUD Modul Pembelajaran**: Tambah, lihat (list & detail), edit, dan hapus modul kurikulum per mata pelajaran kelas (`ClassSubject`).
  - **Pengaturan Publikasi & Kunci**: Admin dapat menerbitkan (*publish/draft*) modul ke siswa serta mengunci/membuka kunci akses modul (*lock/unlock*).
  - **CRUD Konten Materi**: Di dalam setiap modul, Admin dapat menambahkan bahan ajar (teks/artikel, video, PDF slide, link tautan eksternal, atau dokumen panduan), mengubah konten/urutan, dan menghapusnya.
  - **Pencarian & Pemfilteran**: Pencarian berbasis judul modul/materi (dengan debounce), filter berdasarkan mata pelajaran kelas, filter status publikasi (Semua / Diterbitkan / Draf), dan filter status kunci (Semua / Terbuka / Terkunci).
  - **Statistik Cepat**: Kartu metrik realtime untuk Total Modul, Modul Diterbitkan, Modul Terkunci, dan Total Konten Materi.
  - **Auto-Fetch & Re-fetch**: Menggunakan TanStack Query dengan query invalidation otomatis setelah mutasi data berhasil tanpa perlu refresh manual browser.
- **Batasan Akses**:
  - Di tingkat route frontend dilindungi oleh `INSTITUTION_ADMIN_ONLY_PREFIXES` (hanya role `admin`).
  - Di tingkat backend controller dilindungi oleh decorator `@Roles("admin")` dan `RoleGuard`.

---

## 2. API Endpoints Backend

### A. Modul Pembelajaran (`/modules`)
Semua endpoint memerlukan header `Authorization: Bearer <jwt-token>` dan role `admin`.

| Method | Endpoint | Deskripsi | Query / Body Params |
|---|---|---|---|
| `GET` | `/modules` | Mendapatkan daftar modul dengan pagination dan filter | Query: `page`, `limit`, `search`, `class_subject_id`, `is_published`, `is_locked` |
| `GET` | `/modules/:id` | Mendapatkan detail modul spesifik beserta konten materi di dalamnya | Param: `id` (UUID) |
| `POST` | `/modules` | Membuat modul pembelajaran baru | Body: `CreateModuleInput` |
| `PATCH` | `/modules/:id` | Memperbarui modul atau mengubah status publikasi/kunci | Param: `id`, Body: `UpdateModuleInput` |
| `DELETE` | `/modules/:id` | Menghapus modul (soft-delete / delete) beserta relasi konten | Param: `id` (UUID) |

#### Format Request Body `POST /modules`:
```json
{
  "class_subject_id": "67bfa39c-43f1-4df2-bc24-81d09df7d123",
  "title": "Modul 1: Algoritma dan Pemrograman Dasar",
  "description": "Pengantar konsep logika dan algoritma komputer",
  "display_order": 1,
  "is_published": true,
  "is_locked": false
}
```

#### Format Response `GET /modules`:
```json
{
  "status": "success",
  "code": 200,
  "message": "Learning modules retrieved successfully",
  "data": [
    {
      "id": "e44d5c19-fb10-48e2-b13c-29a39a2ff11a",
      "class_subject_id": "67bfa39c-43f1-4df2-bc24-81d09df7d123",
      "title": "Modul 1: Algoritma dan Pemrograman Dasar",
      "description": "Pengantar konsep logika dan algoritma komputer",
      "display_order": 1,
      "is_published": true,
      "is_locked": false,
      "created_at": "2026-11-12T08:00:00.000Z",
      "updated_at": "2026-11-12T08:00:00.000Z",
      "class_subject": {
        "id": "67bfa39c-43f1-4df2-bc24-81d09df7d123",
        "class": {
          "id": "class-uuid",
          "name": "X-RPL-1"
        },
        "subject": {
          "id": "subject-uuid",
          "name": "Pemrograman Dasar",
          "code": "PRG-101"
        }
      },
      "moduleContents": [
        {
          "id": "content-uuid",
          "moduleId": "e44d5c19-fb10-48e2-b13c-29a39a2ff11a",
          "title": "1.1 Pengenalan Variabel dan Tipe Data",
          "contentType": "text",
          "content": "Rangkuman materi tipe data primitif dan referensi...",
          "sortOrder": 1
        }
      ]
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

### B. Konten Modul Pembelajaran (`/module-contents`)

| Method | Endpoint | Deskripsi | Query / Body Params |
|---|---|---|---|
| `GET` | `/module-contents` | Daftar konten materi per modul | Query: `moduleId`, `contentType`, `search`, `page`, `limit` |
| `GET` | `/module-contents/:id` | Detail konten materi | Param: `id` |
| `POST` | `/module-contents` | Menambahkan materi baru ke modul | Body: `CreateModuleContentInput` |
| `PATCH` | `/module-contents/:id` | Memperbarui konten materi | Param: `id`, Body: `UpdateModuleContentInput` |
| `DELETE` | `/module-contents/:id` | Menghapus konten materi | Param: `id` |

#### Format Request Body `POST /module-contents`:
```json
{
  "moduleId": "e44d5c19-fb10-48e2-b13c-29a39a2ff11a",
  "title": "Video Pembahasan Algoritma Pencarian",
  "contentType": "video",
  "content": "https://www.youtube.com/watch?v=sample-video",
  "sortOrder": 2
}
```

---

## 3. Arsitektur Frontend (`apps/web`)

### Struktur File:
```
apps/web/src/
├── routes/
│   └── _settings/modules/
│       └── index.tsx                    # Route TanStack Router /modules
├── router.tsx                           # Registrasi rute modulesRoute
├── routes/__root.tsx                    # Proteksi INSTITUTION_ADMIN_ONLY_PREFIXES
├── components/
│   └── app-sidebar.tsx                  # Menu sidebar "Modul & Konten Materi"
└── features/modules/
    ├── api/
    │   └── modules.ts                   # Client API calls (getModules, CRUD, etc.)
    ├── hooks/
    │   └── useModules.ts                # TanStack Query & mutation hooks
    ├── schemas/
    │   └── moduleSchema.ts              # Zod validation schemas
    ├── types/
    │   └── index.ts                     # TypeScript interfaces & types
    ├── components/
    │   ├── ModulesPageHeader.tsx        # Page header + Tambah Modul action
    │   ├── ModuleStatsCards.tsx         # 4 Kartu metrik statistik
    │   ├── ModuleFilterBar.tsx          # Filter pencarian, mapel, publish, lock
    │   ├── ModuleCard.tsx               # Card modul + accordion konten materi
    │   ├── ModuleDialog.tsx             # Modal form tambah/edit modul
    │   ├── ModuleContentDialog.tsx      # Modal form tambah/edit konten
    │   ├── DeleteConfirmDialog.tsx      # Modal konfirmasi hapus modul/konten
    │   ├── ModulesPage.tsx              # Halaman utama
    │   └── ModulesPage.spec.tsx         # Unit tests komponen frontend
    └── index.ts                         # Public exports
```

---

## 4. Alur Interaksi dan State Management

1. **Auto-Fetch dan Sinkronisasi**:
   - Setelah mutasi (create, update, delete, toggle publish, toggle lock), mutasi TanStack Query secara otomatis memicu `queryClient.invalidateQueries({ queryKey: [MODULES_QUERY_KEY] })` dan `modulesQuery.refetch()`.
   - Data terbaru langsung tersaji di tabel/card tanpa membutuhkan reload browser manual.
2. **Accordion Konten Interaktif**:
   - Tiap kartu modul memiliki tombol toggle expand/collapse untuk membuka daftar konten materi yang ada di dalam modul tersebut.
   - Admin dapat menambah konten baru langsung dari header modul (`+ Konten`) maupun dari tombol di dalam panel daftar konten.
3. **Aksi Cepat (Quick Actions)**:
   - Satu klik untuk mengubah status publikasi (*Publish / Draft*).
   - Satu klik untuk mengunci/membuka kunci akses modul (*Lock / Unlock*).
4. **Validasi Formulir (Zod)**:
   - Judul modul dan mata pelajaran kelas wajib diisi.
   - Judul konten dan tipe materi (text, video, pdf, link, document) wajib diisi.
   - Nomor urut tampil divalidasi sebagai integer positif.

---

## 5. Pengujian & Verifikasi

- **Backend Unit Tests**:
  - `apps/api/src/module/module.controller.spec.ts` (100% lulus)
  - `apps/api/src/module/module.service.spec.ts` (100% lulus)
  - `apps/api/src/module-content/module-content.controller.spec.ts` (100% lulus)
  - `apps/api/src/module-content/module-content.service.spec.ts` (100% lulus)
- **Frontend Unit Tests**:
  - `apps/web/src/features/modules/components/ModulesPage.spec.tsx` (10/10 test cases lulus):
    1. Render judul, metrik kartu statistik, dan kartu modul.
    2. Render kondisi kosong (*empty state*) ketika belum ada data.
    3. Alur tambah modul baru melalui modal dialog dan integrasi API.
    4. Alur ubah modul pembelajaran dan simpan data revisi.
    5. Aksi cepat toggle status publikasi modul.
    6. Aksi cepat toggle kunci akses modul.
    7. Alur tambah materi pembelajaran ke dalam modul.
    8. Konfirmasi dan eksekusi penghapusan modul.
    9. Konfirmasi dan eksekusi penghapusan materi konten.
    10. Filter pencarian, filter status, dan reset filter.
- **Production Build**:
  - `tsc -b && vite build` berhasil tanpa error.

