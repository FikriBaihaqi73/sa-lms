# Feature Implementation: Nationalities Page & Auth Guard (Superadmin)

**Feature**: `0176- feat/0176-page-nationalities`  
**Scope**: Frontend (`apps/web`), Backend Integration (`apps/api`), Route Protection & Auth Guard  
**Target Audience**: Frontend & Fullstack Developers

---

## 1. Overview
Halaman **Nationalities** (Kewarganegaraan) menyediakan antarmuka CRUD lengkap bagi **Superadmin** untuk mengelola master data kewarganegaraan yang digunakan pada profil pengguna, siswa, dan wali murid di seluruh sistem akademik. 

Selain itu, modul ini mengimplementasikan **Auth Guard** di mana akses ke halaman Superadmin (termasuk `/nationalities`, `/users`, `/roles`, `/permissions`, dan `/jenjang-institusi`) **wajib melewati tahap login** melalui layar utama (`/login`).

---

## 2. Architecture & Directory Structure

```
apps/web/src/
├── features/
│   ├── auth/
│   │   ├── api/login.ts
│   │   ├── components/LoginForm.tsx
│   │   ├── context/AuthContext.tsx
│   │   └── hooks/useAuth.ts
│   └── nationalities/
│       ├── api/nationalities.ts       # Centralized API fetcher methods
│       ├── components/
│       │   ├── DeleteNationalityDialog.tsx # Modal dialog konfirmasi hapus
│       │   ├── NationalityDialog.tsx       # Modal dialog tambah & ubah
│       │   ├── NationalitiesPage.tsx       # Main page container component
│       │   └── NationalitiesTable.tsx      # Table, search, & stats cards
│       ├── hooks/
│       │   └── useNationalities.ts     # TanStack Query custom hooks
│       ├── schemas/
│       │   └── nationalitySchema.ts   # Zod validation schema
│       ├── types/
│       │   └── index.ts               # TypeScript interfaces
│       └── index.ts
├── routes/
│   ├── __root.tsx                    # Root layout with Auth Guard protection
│   ├── login/index.tsx               # Login route (/login)
│   └── nationalities/index.tsx       # Nationalities route (/nationalities)
```

---

## 3. Backend Endpoints (API Integration)

Semua request menggunakan wrapper `apiFetch` dari `@/lib/api` yang menyertakan header `Authorization: Bearer <access_token>`.

### 1) Get All Nationalities
- **Method**: `GET`
- **URL**: `/nationalities`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Nationalities retrieved successfully",
  "data": [
    {
      "id": "c1f7b8e0-1234-5678-9abc-def012345678",
      "name": "Indonesia",
      "description": "Warga Negara Indonesia",
      "createdAt": "2026-10-01T08:00:00.000Z",
      "updatedAt": "2026-10-01T08:00:00.000Z"
    }
  ]
}
```

### 2) Get Nationality By ID
- **Method**: `GET`
- **URL**: `/nationalities/:id`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Nationality detail retrieved successfully",
  "data": {
    "id": "c1f7b8e0-1234-5678-9abc-def012345678",
    "name": "Indonesia",
    "description": "Warga Negara Indonesia"
  }
}
```

### 3) Create Nationality
- **Method**: `POST`
- **URL**: `/nationalities`
- **Request Body**:
```json
{
  "name": "Malaysia",
  "description": "Warga Negara Malaysia"
}
```
- **Response Success (201 Created)**:
```json
{
  "status": "success",
  "code": 201,
  "message": "Nationality created successfully",
  "data": {
    "id": "a9e8d7c6-4321-8765-cba9-1234567890ab",
    "name": "Malaysia",
    "description": "Warga Negara Malaysia"
  }
}
```

### 4) Update Nationality
- **Method**: `PATCH`
- **URL**: `/nationalities/:id`
- **Request Body**:
```json
{
  "name": "Malaysia (Updated)",
  "description": "Kewarganegaraan Malaysia"
}
```
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Nationality updated successfully",
  "data": {
    "id": "a9e8d7c6-4321-8765-cba9-1234567890ab",
    "name": "Malaysia (Updated)",
    "description": "Kewarganegaraan Malaysia"
  }
}
```

### 5) Delete Nationality
- **Method**: `DELETE`
- **URL**: `/nationalities/:id`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Nationality deleted successfully",
  "data": {
    "id": "a9e8d7c6-4321-8765-cba9-1234567890ab"
  }
}
```

---

## 4. Frontend Flow & Validation Rules

### A. Auth Protection Flow
1. Pengguna membuka aplikasi di `/` atau `/nationalities`.
2. `__root.tsx` mengecek `isAuthenticated` dari `useAuth()`.
3. Jika penguna **belum login** (`isAuthenticated === false`) dan halaman yang diakses bukan `/login`, aplikasi **otomatis mengarahkan ke `/login`**.
4. Di `/login`, pengguna mengisi email & password, lalu menekan **Sign in**.
5. Setelah autentikasi berhasil, token disimpan ke `localStorage` (`access_token`), dan pengguna diarahkan ke `/nationalities`.
6. Di `AppSidebar`, pengguna dapat menekan tombol **Logout** untuk menghapus token dan kembali ke `/login`.

### B. Validation Rules (Form Kewarganegaraan)
- **Nama Kewarganegaraan (`name`)**:
  - Mandatory / Wajib diisi (minimal 1 karakter).
  - Sanitasi spasi depan/belakang via `.trim()`.
- **Keterangan (`description`)**:
  - Opsional.

---

## 5. Verification & Testing
- Pembentukan bundle produksi menggunakan `pnpm --filter @repo/web build` berjalan **tanpa error linter atau tipe TypeScript**.
