# Feature Implementation: Settings (Platform & System Configuration)

**Feature**: `0174- feat/0174-page-setting`  
**Scope**: Frontend (`apps/web`), Backend Integration (`apps/api`), Shared Contracts (`@repo/shared`)  
**Target Audience**: Frontend & Fullstack Developers, Superadmin LMS Platform  

---

## 1. Overview
Halaman **Pengaturan Sistem (Settings)** menyediakan antarmuka CRUD lengkap bagi **Superadmin** untuk mengelola variabel konfigurasi platform, parameter keamanan, dan pengaturan aplikasi global NEXORA (misalnya `APP_NAME`, `MAINTENANCE_MODE`, `MAX_LOGIN_ATTEMPTS`, dll.).

Halaman ini terlindungi oleh **Auth Guard** dan terintegrasi dengan layout superadmin di `/settings`.

---

## 2. Architecture & Directory Structure

```
apps/web/src/
├── features/
│   └── settings/
│       ├── api/
│       │   └── settings.ts            # Centralized API fetcher methods
│       ├── components/
│       │   ├── DeleteSettingDialog.tsx # Modal dialog konfirmasi hapus
│       │   ├── SettingDialog.tsx       # Modal dialog tambah & ubah pengaturan
│       │   ├── SettingsHeader.tsx      # Header & tombol aksi tambah
│       │   ├── SettingsPage.tsx        # Container utama halaman settings
│       │   ├── SettingsStats.tsx       # Kartu statistik ringkasan konfigurasi
│       │   └── SettingsTable.tsx       # Tabel data, pencarian, & paginasi
│       ├── hooks/
│       │   └── useSettings.ts          # TanStack Query custom hooks
│       ├── schemas/
│       │   ├── index.ts                # Re-export schemas
│       │   └── settingSchema.ts        # Zod form validation schema
│       ├── types/
│       │   └── index.ts                # TypeScript interfaces & types
│       └── index.ts                    # Public barrel export
├── routes/
│   └── _settings/
│       └── settings/
│           └── index.tsx               # TanStack Router route definition (/settings)
```

---

## 3. Backend Endpoints (API Integration)

Semua permintaan HTTP dilakukan melalui centralized fetch wrapper `apiFetch` dari `@/lib/api` dengan header otomatis:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

### 1) Get All Settings (Paginated & Search)
- **Method**: `GET`
- **URL**: `/settings?page=1&limit=10&search=<query>`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Settings fetched successfully",
  "data": [
    {
      "id": "e6a2082f-870a-48cf-9917-dbecf97e289c",
      "settingKey": "APP_NAME",
      "settingValue": "NEXORA Learning Management",
      "description": "Nama resmi aplikasi platform",
      "updatedBy": "44db2db2-7b0b-4890-a7d3-ff4b0439634e",
      "createdAt": "2026-10-01T10:00:00.000Z",
      "updatedAt": "2026-10-05T08:30:00.000Z",
      "deletedAt": null,
      "updater": {
        "id": "44db2db2-7b0b-4890-a7d3-ff4b0439634e",
        "email": "superadmin@nexora.id"
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

### 2) Get Setting By ID
- **Method**: `GET`
- **URL**: `/settings/:id`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Setting fetched successfully",
  "data": {
    "id": "e6a2082f-870a-48cf-9917-dbecf97e289c",
    "settingKey": "APP_NAME",
    "settingValue": "NEXORA Learning Management",
    "description": "Nama resmi aplikasi platform",
    "createdAt": "2026-10-01T10:00:00.000Z",
    "updatedAt": "2026-10-05T08:30:00.000Z"
  }
}
```

### 3) Create Setting
- **Method**: `POST`
- **URL**: `/settings`
- **Request Body**:
```json
{
  "settingKey": "MAINTENANCE_MODE",
  "settingValue": "false",
  "description": "Mode pemeliharaan platform global"
}
```
- **Response Success (201 Created)**:
```json
{
  "status": "success",
  "code": 201,
  "message": "Setting created successfully",
  "data": {
    "id": "f5195204-c5a8-48b2-bdae-2f50c0576974",
    "settingKey": "MAINTENANCE_MODE",
    "settingValue": "false",
    "description": "Mode pemeliharaan platform global",
    "createdAt": "2026-10-07T08:30:00.000Z",
    "updatedAt": "2026-10-07T08:30:00.000Z"
  }
}
```

### 4) Update Setting
- **Method**: `PATCH`
- **URL**: `/settings/:id`
- **Request Body**:
```json
{
  "settingValue": "true",
  "description": "Platform sedang dalam pemeliharaan terjadwal"
}
```
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Setting updated successfully",
  "data": {
    "id": "f5195204-c5a8-48b2-bdae-2f50c0576974",
    "settingKey": "MAINTENANCE_MODE",
    "settingValue": "true",
    "description": "Platform sedang dalam pemeliharaan terjadwal",
    "updatedAt": "2026-10-07T08:35:00.000Z"
  }
}
```

### 5) Delete Setting
- **Method**: `DELETE`
- **URL**: `/settings/:id`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "code": 200,
  "message": "Setting deleted successfully",
  "data": {
    "success": true,
    "id": "f5195204-c5a8-48b2-bdae-2f50c0576974"
  }
}
```

---

## 4. Frontend State & Hook Flow

Modul ini mengadopsi standar **TanStack Query** (React Query v5):

1. **`useSettings({ page, limit, search })`**:
   - Query Key: `['settings', page, limit, search]`
   - Menggunakan `placeholderData: keepPreviousData` untuk transisi pagination yang mulus tanpa kedip (flicker).
2. **`useCreateSetting()`**:
   - Mengirim mutasi POST ke `/settings`.
   - Melakukan `invalidateQueries(['settings'])` saat sukses agar tabel langsung diperbarui.
3. **`useUpdateSetting()`**:
   - Mengirim mutasi PATCH ke `/settings/:id`.
   - Meng-invalidate cache `['settings']` saat sukses.
4. **`useDeleteSetting()`**:
   - Mengirim mutasi DELETE ke `/settings/:id`.
   - Meng-invalidate cache `['settings']` saat sukses.

---

## 5. Aturan Validasi & Penanganan Edge Cases

1. **Format Kunci Pengaturan (`settingKey`)**:
   - Wajib diisi (minimal 1 karakter).
   - Regex format: `^[A-Za-z0-9_.-]+$` (hanya alphanumeric, underscore, dot, hyphen).
   - Dinonaktifkan (`disabled`) saat mode Edit agar key tidak terduplikasi atau merusak dependensi modul backend/frontend lain.
2. **Nilai Pengaturan (`settingValue`)**:
   - Opsional, dapat menampung string biasa, angka, flag boolean (`true`/`false`), maupun JSON string.
3. **Deskripsi (`description`)**:
   - Opsional, digunakan sebagai panduan dokumentasi konfigurasi untuk administrator.
4. **Soft Delete**:
   - Database dan repository menggunakan `deletedAt` soft delete. Data yang dihapus tidak akan tampil di tabel atau pencarian.
5. **Handling Token Expired**:
   - Request `apiFetch` secara otomatis membaca token dari `localStorage`. Jika 401 Unauthorized, AuthContext akan mengarahkan pengguna ke `/login`.
