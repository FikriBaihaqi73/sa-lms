# Dokumentasi Implementasi Halaman Pengumuman Resmi Institusi (Admin)

**Branch**: `0244/feat-page-announcement`  
**Fitur**: Kelola Pengumuman Resmi Institusi (CRUD, Target Audiens, Kategori, Status Publikasi, Multi-Tenant Scoping)  
**Role Akses**: `admin` (Admin Institusi)  

---

## 1. Ringkasan Fitur
Halaman Pengumuman Institusi dirancang khusus bagi pengguna dengan peran **Admin Institusi** untuk mengelola seluruh pengumuman resmi institusi mereka secara independen, aman, dan terisolasi (*multi-tenant*).

Fitur mencakup:
1. **Kelola Pengumuman (CRUD)**:
   - Membuat pengumuman baru lengkap dengan judul, target audiens, kategori, isi pengumuman, dan pengaturan jadwal tayang.
   - Menampilkan daftar pengumuman dalam tabel interaktif dengan pagination, sorting waktu terbaru, dan metadata lengkap (pembuat, tanggal tayang, status).
   - Melihat rincian lengkap pengumuman (*detail view modal*).
   - Mengubah informasi pengumuman (*edit modal*).
   - Menghapus pengumuman dengan konfirmasi aman (*delete confirmation alert*).
2. **Target Audiens & Kategori**:
   - **Target Penerima**: `ALL` (Semua Pengguna), `TEACHER` (Khusus Guru), `STUDENT` (Khusus Siswa).
   - **Kategori**: `GENERAL` (Umum), `ACADEMIC` (Akademik & Perkuliahan), `EVENT` (Kegiatan / Agenda), `IMPORTANT` (Penting & Mendesak).
   - **Status Publikasi**: Diterbitkan (*Published*) vs Draf (*Draft*).
   - **Jadwal Tayang**: Waktu mulai tayang (`published_at`) dan batas waktu kedaluwarsa (`expired_at`).
3. **Statistik Pengumuman**:
   - 4 kartu metrik informatif: Total Pengumuman, Diterbitkan, Draf, dan Pengumuman Aktif (yang sedang tayang).
4. **Batasan Institusi (Multi-Tenant Scoping)**:
   - Admin hanya dapat melihat, menambah, mengubah, dan menghapus pengumuman milik institusi mereka sendiri.
   - `institution_id` diisolasi secara ketat di backend melalui profil user yang sedang login (`req.user.sub`), sehingga tidak ada kebocoran data antar institusi.
   - Rute frontend `"/announcements"` dilindungi oleh `INSTITUTION_ADMIN_ONLY_PREFIXES`.

---

## 2. API Endpoints

Semua endpoint pengumuman berada di bawah `/announcements` dan membutuhkan header:
```http
Authorization: Bearer <JWT_TOKEN>
```
dan pengguna harus memiliki role `admin`.

### A. Mendapatkan Daftar Pengumuman
- **Method**: `GET`
- **URL**: `/announcements`
- **Query Parameters**:
  - `page` (optional, default: `1`): nomor halaman.
  - `limit` (optional, default: `10`): jumlah data per halaman.
  - `search` (optional): teks pencarian pada judul atau isi pengumuman.
  - `isPublished` (optional): filter status publikasi (`true` / `false`).
  - `targetAudience` (optional): `ALL` | `TEACHER` | `STUDENT`.
  - `category` (optional): `GENERAL` | `ACADEMIC` | `EVENT` | `IMPORTANT`.

**Contoh Response Sukses (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Announcements retrieved successfully",
  "data": [
    {
      "id": "cm1234567890abcdef",
      "title": "Jadwal Ujian Akhir Semester Ganjil 2026/2027",
      "content": "{\"body\":\"UAS akan diselenggarakan mulai tanggal 15 Desember 2026.\",\"targetAudience\":\"ALL\",\"category\":\"ACADEMIC\"}",
      "contentBody": "UAS akan diselenggarakan mulai tanggal 15 Desember 2026.",
      "targetAudience": "ALL",
      "category": "ACADEMIC",
      "is_published": true,
      "published_at": "2026-11-01T08:00:00.000Z",
      "expired_at": "2026-12-31T23:59:59.000Z",
      "institution_id": "inst-1",
      "institution": {
        "id": "inst-1",
        "name": "SMA Negeri 1 Prestasi"
      },
      "created_by": "usr-admin-1",
      "creator": {
        "id": "usr-admin-1",
        "email": "admin@sekolah.sch.id",
        "profile": {
          "id": "prof-1",
          "fullName": "Drs. Bambang Sudarsono"
        }
      },
      "created_at": "2026-11-01T07:30:00.000Z",
      "updated_at": "2026-11-01T07:30:00.000Z"
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

### B. Mendapatkan Statistik Pengumuman
- **Method**: `GET`
- **URL**: `/announcements/stats`

**Contoh Response Sukses (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Announcement statistics retrieved successfully",
  "data": {
    "total": 12,
    "published": 9,
    "draft": 3,
    "active": 7
  }
}
```

### C. Mendapatkan Detail Pengumuman
- **Method**: `GET`
- **URL**: `/announcements/:id`

**Contoh Response Sukses (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Announcement retrieved successfully",
  "data": {
    "id": "cm1234567890abcdef",
    "title": "Jadwal Ujian Akhir Semester Ganjil 2026/2027",
    "contentBody": "UAS akan diselenggarakan mulai tanggal 15 Desember 2026.",
    "targetAudience": "ALL",
    "category": "ACADEMIC",
    "is_published": true,
    "published_at": "2026-11-01T08:00:00.000Z",
    "expired_at": "2026-12-31T23:59:59.000Z",
    "institution_id": "inst-1",
    "institution": {
      "id": "inst-1",
      "name": "SMA Negeri 1 Prestasi"
    },
    "creator": {
      "id": "usr-admin-1",
      "email": "admin@sekolah.sch.id",
      "profile": {
        "id": "prof-1",
        "fullName": "Drs. Bambang Sudarsono"
      }
    },
    "created_at": "2026-11-01T07:30:00.000Z",
    "updated_at": "2026-11-01T07:30:00.000Z"
  }
}
```

### D. Membuat Pengumuman Baru
- **Method**: `POST`
- **URL**: `/announcements`
- **Request Body**:
```json
{
  "title": "Libur Awal Ramadhan 1448 H",
  "content": "Diberitahukan kepada seluruh siswa dan dewan guru bahwa kegiatan KBM diliburkan mulai tanggal...",
  "targetAudience": "ALL",
  "category": "GENERAL",
  "isPublished": true,
  "publishedAt": "2026-11-20T08:00:00.000Z",
  "expiredAt": null
}
```

**Contoh Response Sukses (201 Created)**:
```json
{
  "status": "success",
  "code": 201,
  "message": "Announcement created successfully",
  "data": {
    "id": "cmnewannouncement123",
    "title": "Libur Awal Ramadhan 1448 H",
    "contentBody": "Diberitahukan kepada seluruh siswa dan dewan guru bahwa kegiatan KBM diliburkan mulai tanggal...",
    "targetAudience": "ALL",
    "category": "GENERAL",
    "is_published": true,
    "published_at": "2026-11-20T08:00:00.000Z",
    "expired_at": null,
    "institution_id": "inst-1",
    "created_at": "2026-11-19T12:00:00.000Z",
    "updated_at": "2026-11-19T12:00:00.000Z"
  }
}
```

### E. Memperbarui Pengumuman
- **Method**: `PATCH`
- **URL**: `/announcements/:id`
- **Request Body**:
```json
{
  "title": "Libur Awal Ramadhan 1448 H (Revisi Tanggal)",
  "content": "Revisi jadwal libur: KBM efektif dimulai kembali pada hari Senin...",
  "targetAudience": "ALL",
  "category": "GENERAL",
  "isPublished": true,
  "publishedAt": "2026-11-20T08:00:00.000Z",
  "expiredAt": "2026-11-27T23:59:59.000Z"
}
```

**Contoh Response Sukses (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Announcement updated successfully",
  "data": {
    "id": "cmnewannouncement123",
    "title": "Libur Awal Ramadhan 1448 H (Revisi Tanggal)",
    "contentBody": "Revisi jadwal libur: KBM efektif dimulai kembali pada hari Senin...",
    "targetAudience": "ALL",
    "category": "GENERAL",
    "is_published": true,
    "updated_at": "2026-11-19T12:10:00.000Z"
  }
}
```

### F. Menghapus Pengumuman
- **Method**: `DELETE`
- **URL**: `/announcements/:id`

**Contoh Response Sukses (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Announcement deleted successfully",
  "data": {
    "success": true,
    "id": "cmnewannouncement123"
  }
}
```

---

## 3. Penanganan Validasi & Error (Granular Errors)

Jika request tidak valid, backend memberikan format error standar:
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "title",
      "message": "Judul pengumuman wajib diisi"
    },
    {
      "field": "targetAudience",
      "message": "Target penerima tidak valid"
    }
  ]
}
```

Jika user bukan admin atau mencoba mengakses pengumuman institusi lain:
```json
{
  "status": "error",
  "code": 403,
  "message": "Forbidden resource"
}
```
atau
```json
{
  "status": "error",
  "code": 404,
  "message": "Pengumuman tidak ditemukan pada institusi Anda"
}
```

---

## 4. Arsitektur Frontend (`apps/web`)

### Struktur Berkas:
```
apps/web/src/features/announcements/
├── api/
│   └── announcements.ts              # Client API wrapper (centralized request helper)
├── components/
│   ├── AnnouncementBadges.tsx        # TargetAudienceBadge, CategoryBadge, PublicationStatusBadge
│   ├── AnnouncementDetailDialog.tsx  # Modal detail rincian pengumuman
│   ├── AnnouncementDialog.tsx        # Modal form tambah & edit pengumuman
│   ├── AnnouncementsFilter.tsx       # Filter bar (search, status, audience, category, reset)
│   ├── AnnouncementsHeader.tsx       # Header halaman + tombol tambah pengumuman
│   ├── AnnouncementsPage.tsx         # Halaman utama pengumuman
│   ├── AnnouncementsPage.spec.tsx    # Unit test komprehensif Vitest & React Testing Library
│   ├── AnnouncementsStats.tsx        # 4 Kartu metrik statistik pengumuman
│   └── DeleteAnnouncementDialog.tsx  # Dialog konfirmasi hapus pengumuman
├── hooks/
│   └── useAnnouncements.ts           # TanStack Query hooks (query, mutation, cache invalidation)
├── schemas/
│   └── announcementSchema.ts         # Zod validation schema untuk form modal
├── types/
│   └── index.ts                      # TypeScript interfaces domain pengumuman
└── index.ts                          # Barrel export
```

### Integrasi Routing & Navigasi:
- **Route File**: `apps/web/src/routes/_settings/announcements/index.tsx`
- **Router Tree**: Ditambahkan ke `settingsTree` di `apps/web/src/router.tsx` pada path `"/announcements"`.
- **Akses & Proteksi**: Didaftarkan ke `INSTITUTION_ADMIN_ONLY_PREFIXES` di `apps/web/src/routes/__root.tsx`.
- **Sidebar**: Ditambahkan menu `Pengumuman` dengan ikon `Megaphone` di bawah bagian `Sistem & Pengaturan` pada `apps/web/src/components/app-sidebar.tsx`.

---

## 5. Ringkasan Pengujian & Verifikasi
- **Unit Test Backend**:
  - `announcement-content.spec.ts`: 4 passed
  - `announcements.repository.spec.ts`: 4 passed
  - `announcement.service.spec.ts`: 7 passed
  - `announcement.controller.spec.ts`: 8 passed
  - Total: **23 passed**
- **Unit Test Frontend**:
  - `AnnouncementsPage.spec.tsx`: **8 passed** (header, stats, table rendering, empty state, filter handling & reset, create modal, detail modal, edit modal, delete modal)
- **Kompilasi & Build**:
  - Backend (`apps/api`): 226 files compiled with SWC, 0 issues.
  - Frontend (`apps/web`): `tsc -b && vite build` berhasil tanpa error.
- **Linting**:
  - Biome check (`@repo/api` & `@repo/shared`): 0 error, 0 warning.
  - ESLint (`apps/web`): 0 error, 0 warning.
