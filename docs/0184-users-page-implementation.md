# Feature Implementation: Users Page (Superadmin & Admin Institusi)

**Feature**: `0184- feat/0184-page-Users`  
**Scope**: Frontend (`apps/web`), Backend Integration (`apps/api`), Route Protection & Auth Guard  
**Target Audience**: Frontend & Fullstack Developers

---

## 1. Overview
Halaman **Users** (Manajemen Pengguna) menyediakan antarmuka CRUD lengkap bagi **Admin (Pemilik Institusi / Superadmin)** untuk mengelola akun pengguna di seluruh sistem akademik.

Antarmuka ini terintegrasi penuh dengan backend pada endpoint `/users`, mendukung fitur:
- Pagination & kontrol batas data per halaman (limit 10, 25, 50, 100).
- Pencarian real-time (case-insensitive) berdasarkan nama, email, role, atau institusi.
- Pembuatan akun user baru (`POST /users`) dengan enkripsi password di sisi server.
- Pengubahan akun user (`PATCH /users/:id`) secara parsial.
- Soft-delete akun user (`DELETE /users/:id`).
- Perlindungan halaman via **Auth Guard** (`__root.tsx`).

---

## 2. Architecture & Directory Structure

```
apps/web/src/
├── features/
│   └── users/
│       ├── api/
│       │   └── users.ts               # Centralized API fetcher methods (apiFetch)
│       ├── components/
│       │   ├── UserDeleteDialog.tsx   # Modal konfirmasi soft-delete
│       │   ├── UserFormModal.tsx      # Modal form tambah & edit user (RHF + Zod)
│       │   ├── UsersHeader.tsx        # Top header & search input bar
│       │   ├── UsersPage.tsx          # Page container & state orchestrator
│       │   ├── UsersStats.tsx         # Information cards & stats
│       │   └── UsersTable.tsx         # Data table, loading skeleton, & pagination
│       ├── hooks/
│       │   └── useUsers.ts            # TanStack Query custom hooks (useUsers, useUser, useCreateUser, etc.)
│       ├── schemas/
│       │   └── userSchema.ts          # Zod validation schemas (createUserSchema, updateUserSchema)
│       ├── types/
│       │   └── index.ts               # TypeScript interfaces & types
│       └── index.ts                   # Feature barrel exports
├── routes/
│   ├── __root.tsx                     # Root layout with Auth Guard protection
│   └── users/
│       └── index.tsx                  # Users route (/users)
```

---

## 3. Backend Endpoints (API Integration)

Semua HTTP request menggunakan centralized API client wrapper `apiFetch` dari `@/lib/api` yang secara otomatis menyertakan header `Authorization: Bearer <access_token>` dan mendahului URL dengan `VITE_API_URL`.

### 1) Get Users (List, Search & Pagination)
- **Method**: `GET`
- **URL**: `/users?page=1&limit=10&search=Ahmad`
- **Query Parameters**:
  - `page`: nomor halaman (default `1`)
  - `limit`: batas item per halaman (default `10`)
  - `search`: kata kunci pencarian (opsional)
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": {
    "data": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "is_active": true,
        "last_login": "2026-09-01T10:00:00.000Z",
        "profile": [
          {
            "id": "profile-uuid",
            "fullName": "Ahmad Student",
            "institution": {
              "id": "inst-uuid",
              "name": "SMA Negeri 1",
              "shortName": "SMAN1"
            },
            "role": {
              "id": "role-uuid",
              "name": "Student"
            }
          }
        ]
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  },
  "code": 200
}
```

### 2) Get User By ID
- **Method**: `GET`
- **URL**: `/users/:id`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "User detail retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "is_active": true,
    "last_login": null
  },
  "code": 200
}
```

### 3) Create User
- **Method**: `POST`
- **URL**: `/users`
- **Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "is_active": true
}
```
- **Response Success (201 Created)**:
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "new-user-uuid",
    "email": "newuser@example.com",
    "is_active": true,
    "last_login": null
  },
  "code": 201
}
```

### 4) Update User
- **Method**: `PATCH`
- **URL**: `/users/:id`
- **Request Body**:
```json
{
  "email": "updated@example.com",
  "password": "newpassword123",
  "is_active": false
}
```
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "updated@example.com",
    "is_active": false
  },
  "code": 200
}
```

### 5) Delete User (Soft Delete)
- **Method**: `DELETE`
- **URL**: `/users/:id`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "User deleted successfully",
  "data": {
    "success": true,
    "id": "123e4567-e89b-12d3-a456-426614174000"
  },
  "code": 200
}
```

---

## 4. Frontend Flow & Validation Rules

### A. Form Validation (Zod Schema & React Hook Form)
- **Email (`email`)**:
  - Wajib diisi (`min(1)`).
  - Validasi format email baku (`.email()`).
  - Maksimal 255 karakter (`max(255)`).
- **Password (`password`)**:
  - Pada pembuatan user baru (Create): Wajib diisi minimal 8 karakter (`min(8)`), maksimal 128 karakter (`max(128)`).
  - Pada pembaruan user (Edit): Opsional. Jika diisi harus minimal 8 karakter, jika dibiarkan kosong password lama tidak akan diubah atau dikirim.
- **Status Aktif (`is_active`)**:
  - Boolean flag (default: `true`).

### B. State Management & Query Invalidation
- Menggunakan `@tanstack/react-query` dengan key `['users', page, limit, search]`.
- Setiap mutasi (`createMutation`, `updateMutation`, `deleteMutation`) sukses secara otomatis memicu `queryClient.invalidateQueries({ queryKey: ['users'] })` untuk memperbarui tabel secara instan tanpa perlu reload halaman.

---

## 5. Verification & Compliance Checklist
- [x] **Zero Linter Warnings/Errors**: Memenuhi standar kode `biome check`.
- [x] **Strict TypeScript**: Bebas dari `any` type.
- [x] **Centralized API Wrapper**: Memakai `apiFetch` dari `@/lib/api`.
- [x] **Auth Protection**: Terhubung dengan `__root.tsx` dan `AppSidebar`.
