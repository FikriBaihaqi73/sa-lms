# Feature Implementation: Assignment Types (Tipe Tugas Pembelajaran)

**Feature**: `0181- feat/0181-page-assignment_types`  
**Scope**: Frontend (`apps/web`), Backend Integration (`apps/api`), Shared Contracts (`@repo/shared`)  
**Target Audience**: Frontend & Fullstack Developers, Superadmin LMS Platform  

---

## 1. Overview
Halaman **Tipe Tugas (Assignment Types)** menyediakan antarmuka CRUD lengkap bagi **Superadmin** (pemilik aplikasi) untuk mengelola kategori dan jenis penugasan pembelajaran (seperti *Tugas Mandiri*, *Tugas Kelompok*, *Kuis*, *Ujian Praktik*, *Proyek Akhir*, dll.) di seluruh ekosistem institusi LMS.

Halaman ini terlindungi oleh **Superadmin Access Guard** dan terintegrasi dengan layout superadmin di path `/assignment-types`.

---

## 2. Architecture & Directory Structure

```
apps/web/src/
├── features/
│   └── assignment-types/
│       ├── api/
│       │   └── assignment-types.ts        # Centralized API fetcher methods
│       ├── components/
│       │   ├── AssignmentTypeDialog.tsx   # Modal dialog tambah & edit tipe tugas
│       │   ├── AssignmentTypeHeader.tsx   # Header judul & tombol tambah
│       │   ├── AssignmentTypeStats.tsx    # Kartu ringkasan statistik tipe tugas
│       │   ├── AssignmentTypesPage.tsx    # Container utama halaman assignment types
│       │   ├── AssignmentTypesTable.tsx   # Tabel data, pencarian interaktif, & aksi
│       │   └── DeleteAssignmentTypeDialog.tsx # Modal konfirmasi soft delete
│       ├── hooks/
│       │   └── useAssignmentTypes.ts      # TanStack Query custom hooks
│       ├── schemas/
│       │   ├── assignmentTypeSchema.ts    # Zod form validation schema
│       │   └── index.ts                   # Re-export schemas
│       ├── types/
│       │   └── index.ts                   # TypeScript interfaces & types
│       └── index.ts                       # Public barrel export
├── routes/
│   └── _settings/
│       └── assignment-types/
│           └── index.tsx                  # TanStack Router route definition (/assignment-types)
```

---

## 3. Backend Endpoints (API Integration)

Semua permintaan HTTP dilakukan melalui centralized fetch wrapper `apiFetch` dari `@/lib/api` dengan header otomatis:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### 1) Get All Assignment Types
- **Method**: `GET`
- **URL**: `/assignment-types`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Assignment types retrieved successfully",
  "data": [
    {
      "id": "e4b9533c-3837-4d4d-a77c-743db5bc6ce1",
      "name": "Tugas Mandiri",
      "description": "Tugas pekerjaan rumah individu",
      "created_at": "2026-10-07T02:00:00.000Z",
      "updated_at": "2026-10-07T02:00:00.000Z"
    }
  ],
  "code": 200
}
```

### 2) Get Assignment Type by ID
- **Method**: `GET`
- **URL**: `/assignment-types/:id`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Assignment type detail retrieved successfully",
  "data": {
    "id": "e4b9533c-3837-4d4d-a77c-743db5bc6ce1",
    "name": "Tugas Mandiri",
    "description": "Tugas pekerjaan rumah individu",
    "created_at": "2026-10-07T02:00:00.000Z",
    "updated_at": "2026-10-07T02:00:00.000Z"
  },
  "code": 200
}
```

### 3) Create Assignment Type
- **Method**: `POST`
- **URL**: `/assignment-types`
- **Request Body**:
```json
{
  "name": "Proyek Kelompok",
  "description": "Tugas kolaboratif berkelompok"
}
```
- **Response Success (201 Created)**:
```json
{
  "status": "success",
  "message": "Assignment type created successfully",
  "data": {
    "id": "f5c8644d-4948-5e5e-b88d-854ec6cd7df2",
    "name": "Proyek Kelompok",
    "description": "Tugas kolaboratif berkelompok",
    "created_at": "2026-10-07T03:00:00.000Z",
    "updated_at": "2026-10-07T03:00:00.000Z"
  },
  "code": 201
}
```

### 4) Update Assignment Type
- **Method**: `PATCH`
- **URL**: `/assignment-types/:id`
- **Request Body**:
```json
{
  "name": "Proyek Kelompok Terstruktur",
  "description": "Tugas tim kolaboratif dengan milestone"
}
```
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Assignment type updated successfully",
  "data": {
    "id": "f5c8644d-4948-5e5e-b88d-854ec6cd7df2",
    "name": "Proyek Kelompok Terstruktur",
    "description": "Tugas tim kolaboratif dengan milestone",
    "created_at": "2026-10-07T03:00:00.000Z",
    "updated_at": "2026-10-07T03:05:00.000Z"
  },
  "code": 200
}
```

### 5) Delete Assignment Type (Soft Delete)
- **Method**: `DELETE`
- **URL**: `/assignment-types/:id`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Assignment type deleted successfully",
  "data": {
    "success": true,
    "id": "f5c8644d-4948-5e5e-b88d-854ec6cd7df2"
  },
  "code": 200
}
```

---

## 4. Frontend State & Hook Management

Data fetching dan state mutation ditangani oleh `@tanstack/react-query`:
- **Query Key**: `['assignment-types']`
- **Detail Key**: `['assignment-types', 'detail', id]`
- **Cache Invalidation**: Setiap mutasi sukses (`create`, `update`, `delete`) secara otomatis meng-invalidate `['assignment-types']` untuk memicu background refresh tanpa reload browser.

---

## 5. Validation & Edge Cases

1. **Nama Unik**: Backend memastikan `name` tipe tugas unik. Jika nama yang sama sudah ada, backend mengembalikan status `409 Conflict`.
2. **Validasi Form**: Menggunakan Zod schema `assignmentTypeFormSchema`:
   - `name`: Wajib diisi, minimal 1 karakter, maksimal 100 karakter.
   - `description`: Opsional, maksimal 500 karakter.
3. **Role Access Restriction**:
   - `/assignment-types` terdaftar dalam `SUPERADMIN_ONLY_PREFIXES`. Pengguna dengan peran non-superadmin akan diblokir dengan tampilan `AccessDenied (403)`.
4. **Respon Error**: Pesan error dari backend diparsing secara elegan dan ditampilkan pada alert notice di atas tabel.
