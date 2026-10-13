# 0195 - Specializations (Peminatan / Konsentrasi / Bidang Keahlian)

## 1. Overview
Dokumentasi pembenahan modul **Specialization** (Peminatan & Bidang Keahlian). Sebelumnya halaman ini keliru menampilkan data dan istilah *Academic Statuses* (status mahasiswa seperti Aktif, Cuti, MBKM, DO, tagihan UKT, dan validasi KRS). 

Modul kini telah diselaraskan 100% dengan konteks sistem informasi akademik dan perguruan tinggi, di mana **Specialization** merepresentasikan **Peminatan, Konsentrasi, atau Bidang Keahlian** pengajar/dosen dan kurikulum program studi (misal: *Rekayasa Perangkat Lunak*, *Kecerdasan Buatan & Sains Data*, *Jaringan & Keamanan Siber*).

---

## 2. Root Cause Analysis
1. **Data Mock yang Keliru**: File `mockSpecializationStatuses.ts` sebelumnya menyalin status registrasi mahasiswa dari modul `academic-statuses` (`Aktif Normal`, `Cuti Akademik`, `MBKM`, `Non-Aktif`, `Lulus`, `Drop Out`, dll.).
2. **UI & Terminologi Keliru**: Komponen UI di `apps/web/src/features/specialization-statuses` sebelumnya memiliki header "Status Akademik Mahasiswa", stats KRS/PD-DIKTI/UKT, dan form dialog dengan placeholder status akademik.
3. **Endpoint Auth Mismatch**: Method `findAll()` dan `findOne()` pada `SpecializationController` sebelumnya tidak memiliki decorator `@Public()`, sehingga saat request awal dibaca tanpa token aktif, API mengembalikan 401 Unauthorized dan frontend jatuh ke data mock status akademik yang salah.
4. **Data Master Kosong**: Tabel `specializations` di database belum memiliki data awal, sehingga perlu di-seed dengan data peminatan studi yang realistis.

---

## 3. Implementation Details

### A. Shared Package & Database
- **Prisma Schema (`Specializations.prisma`)**:
  - Model `Specializations` memiliki kolom: `id` (UUID), `name` (VarChar 255 unique), `description` (Text nullable), `created_at`, `updated_at`, `deleted_at`.
  - Berelasi dengan tabel `Teachers` (`teachers Teachers[]`).
- **Schema Validation (`specialization.schema.ts`)**:
  - `name`: String dengan auto `.trim()`, minimal 2 karakter, maksimal 255 karakter.
  - `description`: String opsional / nullable maksimal 1000 karakter.
- **Repository (`specialization.repository.ts`)**:
  - Operasi atomic CRUD dengan sorting `orderBy: { created_at: "asc" }`.
  - Penanganan deskripsi bernilai null atau string kosong secara konsisten.
- **Seeding (`packages/shared/src/script/seed-specializations.ts`)**:
  - Mengisi 6 bidang keahlian resmi ke database PostgreSQL:
    1. Rekayasa Perangkat Lunak
    2. Kecerdasan Buatan & Sains Data
    3. Jaringan Komputer & Keamanan Siber
    4. Sistem Informasi Enterprise
    5. Multimedia & Teknologi Game
    6. Internet of Things & Sistem Tertanam

### B. Backend API (`apps/api`)
- **Controller (`specialization.controller.ts`)**:
  - Menambahkan `@Public()` pada `findAll()` dan `findOne()`, sehingga pembacaan daftar peminatan dapat diakses publik maupun oleh pengguna terautentikasi.
  - Endpoint manipulasi data (`POST`, `PATCH`, `DELETE`) tetap diproteksi menggunakan JWT Guard (`@ApiBearerAuth("JWT-auth")`).
- **Service (`specialization.service.ts`)**:
  - Normalisasi `.trim()` pada nama dan deskripsi.
  - Validasi duplikasi nama menggunakan `ConflictException` (HTTP 409).
- **Unit Testing**:
  - `apps/api/src/specialization/specialization.service.spec.ts` (9 tests passed).
  - `packages/shared/src/infrastructure/repository/specialization.repository.spec.ts` (7 tests passed).

### C. Frontend Web (`apps/web`)
- **API Client (`api/specialization-statuses.ts`)**:
  - Menghubungkan langsung ke endpoint resmi `/specializations`.
- **UI Components**:
  - **Header (`SpecializationStatusHeader.tsx`)**: Judul "Peminatan & Bidang Keahlian", breadcrumb "Master Data Global > Peminatan & Konsentrasi".
  - **Stats (`SpecializationStatusStats.tsx`)**: Menampilkan total peminatan aktif, daftar bidang terdaftar, dan status integrasi pengajar.
  - **Table (`SpecializationStatusesTable.tsx`)**: Menampilkan Nomor, Nama Peminatan / Konsentrasi, Deskripsi / Cakupan Keahlian, dan tombol Aksi (Ubah & Hapus).
  - **Dialog (`SpecializationStatusDialog.tsx`)**: Form tambah/ubah peminatan dengan validasi zod dan pesan interaktif.
  - **Delete Dialog (`DeleteSpecializationStatusDialog.tsx`)**: Konfirmasi penghapusan data peminatan.
- **Navigasi & Routing**:
  - Sidebar: Menu **Peminatan & Keahlian** dengan icon `Award` mengarah ke `/specializations`.
  - Router: Mendukung rute `/specializations` dan `/specialization-statuses`.

---

## 4. API Endpoints

### 1. Get All Specializations
- **Method**: `GET`
- **URL**: `/specializations`
- **Auth**: Public / Optional Bearer Token
- **Response Success (200)**:
  ```json
  {
    "status": "success",
    "message": "Specializations retrieved successfully",
    "data": [
      {
        "id": "2d94f6d5-a75e-45b1-a548-89208f750d57",
        "name": "Rekayasa Perangkat Lunak",
        "description": "Fokus pada perancangan arsitektur software, pemrograman web & mobile modern, DevOps, serta pengujian perangkat lunak.",
        "created_at": "2026-10-13T06:27:51.130Z",
        "updated_at": "2026-10-13T06:27:51.130Z"
      }
    ],
    "code": 200
  }
  ```

### 2. Create Specialization
- **Method**: `POST`
- **URL**: `/specializations`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Kecerdasan Buatan & Sains Data",
    "description": "Bidang keahlian machine learning, deep learning, dan big data."
  }
  ```
- **Response Success (201)**:
  ```json
  {
    "status": "success",
    "message": "Specialization created successfully",
    "data": {
      "id": "89354229-3370-4731-b4f7-2a2c29de1c31",
      "name": "Kecerdasan Buatan & Sains Data",
      "description": "Bidang keahlian machine learning, deep learning, dan big data.",
      "created_at": "2026-10-13T06:27:51.144Z",
      "updated_at": "2026-10-13T06:27:51.144Z"
    },
    "code": 201
  }
  ```

### 3. Update Specialization
- **Method**: `PATCH`
- **URL**: `/specializations/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "name": "Jaringan Komputer & Cloud Security",
    "description": "Pembaruan cakupan keamanan cloud dan infrastruktur."
  }
  ```
- **Response Success (200)**:
  ```json
  {
    "status": "success",
    "message": "Specialization updated successfully",
    "data": {
      "id": "c20e8227-a2a5-4523-977c-e3344782976d",
      "name": "Jaringan Komputer & Cloud Security",
      "description": "Pembaruan cakupan keamanan cloud dan infrastruktur.",
      "created_at": "2026-10-13T06:27:51.149Z",
      "updated_at": "2026-10-13T06:35:00.000Z"
    },
    "code": 200
  }
  ```

### 4. Delete Specialization
- **Method**: `DELETE`
- **URL**: `/specializations/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Response Success (200)**:
  ```json
  {
    "status": "success",
    "message": "Specialization deleted successfully",
    "data": {
      "success": true,
      "id": "c20e8227-a2a5-4523-977c-e3344782976d"
    },
    "code": 200
  }
  ```

---

## 5. Verification & Testing
- **Jest Unit Tests**: `pnpm --filter @repo/api test` -> **64/64 Test Suites Passed**, **400/400 Tests Passed** (0 failures).
- **Turborepo Build**: `pnpm build` -> **6/6 tasks successful** (0 errors).
- **End-to-End Live Check**:
  - `GET http://localhost:5000/specializations` -> 200 OK (mengembalikan 6 peminatan asli).
  - `POST http://localhost:5000/specializations` dengan Bearer token -> 201 Created.
  - `DELETE http://localhost:5000/specializations/:id` dengan Bearer token -> 200 OK.
