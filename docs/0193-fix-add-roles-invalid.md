# 0193 - Fix Add Roles Invalid

## 1. Overview
Perbaikan kendala penambahan Role baru yang mengalami error `(invalid)` serta perbaikan ~13 unit test repository yang gagal akibat import Vitest yang rusak.

## 2. Root Cause Analysis
1. **Frontend Role Schema (`roleFormSchema`)**:
   - Field `description` sebelumnya diwajibkan sebagai string tanpa `.optional().default("")`. Ketika pengguna menambahkan role baru dengan deskripsi kosong/undefined, Zod menolak form dengan status `invalid`.
   - Field `permissionIds` belum memiliki validasi UUID yang presisi.
   - Komponen `EditRoleSheet.tsx` tidak merender pesan error `errors.description`, sehingga saat validasi gagal, form tidak memberikan pesan yang jelas.
   - Pemilihan permission diblokir pada saat penambahan role (`!isAdding`) dengan catatan usang bahwa backend belum mendukung penyimpanan permission, padahal backend sudah mendukung relasi permission pada pembuatan role.
2. **Role API Client (`apps/web/src/features/roles/api.ts`)**:
   - Fungsi `toRoleRequest` memanggil `values.description.trim()` secara langsung tanpa pemeriksaan `undefined`/`null`, menyebabkan potensi runtime error.
   - Masih menggunakan type cast `any`.
3. **Backend Service (`RoleService.ts`) & Schema (`role.schema.ts`)**:
   - Belum melakukan trim pada `name` dan `description`.
   - Belum memvalidasi keberadaan `permissionIds` di database sebelum operasi `connect`, yang dapat memicu uncaught exception Prisma `P2025`.
4. **14 Unit Test Repository Gagal**:
   - Sebanyak 14 file spec di `packages/shared/src/infrastructure/repository/*.spec.ts` sebelumnya mengimpor helper Vitest (`vi.fn()`) dan path import yang keliru, menyebabkan kegagalan 13+ test suite saat dijalankan dengan Jest.

---

## 3. Implementation Details

### A. Shared Package & Backend API
- **Schema (`packages/shared/src/schemas/role.schema.ts`)**:
  - Menambahkan `.trim()` pada `name`.
  - Memastikan `permissionIds` bertipe `z.array(z.string().uuid("Invalid UUID format for permissionId"))`.
- **Repository (`packages/shared/src/infrastructure/repository/role.repository.ts`)**:
  - Menghapus tipe `meta: any` dan menggantinya dengan `RolePaginationMeta` / `FindAllRolesResult`.
  - Memastikan input update mendukung `description?: string | null | undefined`.
- **Service (`apps/api/src/role/role.service.ts`)**:
  - Menambahkan normalisasi `trim()` untuk role name dan description.
  - Memvalidasi keberadaan `permissionIds` di tabel permissions sebelum persistensi. Melempar `BadRequestException("One or more permission IDs are invalid")` jika ID tidak ditemukan.
- **Unit Testing**:
  - `apps/api/src/role/role.service.spec.ts`: Unit test lengkap mencakup skenario create, duplicate role, validasi permission invalid, update, dan remove.
  - `packages/shared/src/infrastructure/repository/role.repository.spec.ts`: Unit test lengkap untuk create, findById, findByName, findAll pagination, update, dan soft delete.
  - Memperbaiki seluruh 14 file repository spec yang error.

### B. Frontend (`apps/web`)
- **Schema (`apps/web/src/features/roles/schemas.ts`)**:
  - Memperbarui `description` menjadi `.optional().default("")`.
  - Menambahkan batas panjang `min(2)` dan `max(255)` untuk `name`.
- **API (`apps/web/src/features/roles/api.ts`)**:
  - `toRoleRequest` dibuat null-safe (`values.description?.trim()`).
  - Menghilangkan penggunaan tipe `any` pada pembacaan paginasi `getRoles`.
- **Form UI (`apps/web/src/features/roles/components/EditRoleSheet.tsx`)**:
  - Menambahkan sinkronisasi `form.reset` saat sheet dibuka atau role berganti via `useEffect`.
  - Menampilkan pesan error validasi `description`.
  - Mengizinkan pemilihan permission langsung saat membuat role baru (mengaktifkan permissions untuk Add Role).
  - Menyesuaikan lebar sheet menjadi `max-w-xl` agar daftar permission mudah dibaca.

---

## 4. Endpoints & Data Contracts

### Create Role
- **Method**: `POST`
- **URL**: `/roles`
- **Request Body**:
  ```json
  {
    "name": "Academic Coordinator",
    "description": "Mengatur jadwal dan kurikulum",
    "permissionIds": ["e5b2c9a1-4321-4f1a-8c54-793b82df1001"]
  }
  ```
- **Response Success (201)**:
  ```json
  {
    "status": "success",
    "code": 201,
    "message": "Role created successfully",
    "data": {
      "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "name": "Academic Coordinator",
      "description": "Mengatur jadwal dan kurikulum",
      "createdAt": "2026-10-12T04:00:00.000Z",
      "updatedAt": "2026-10-12T04:00:00.000Z",
      "rolePermissions": [
        {
          "id": "f8a9b0c1-2345-6789-0123-456789abcdef",
          "roleId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "permissionId": "e5b2c9a1-4321-4f1a-8c54-793b82df1001"
        }
      ]
    }
  }
  ```
- **Response Error (400 - Validation / Invalid Permission)**:
  ```json
  {
    "statusCode": 400,
    "message": "One or more permission IDs are invalid",
    "error": "Bad Request"
  }
  ```
- **Response Error (409 - Duplicate Role Name)**:
  ```json
  {
    "statusCode": 409,
    "message": "Role name already exists",
    "error": "Conflict"
  }
  ```

---

## 5. Verification
- **Jest Unit Tests**: `pnpm --filter @repo/api test` -> **62/62 Test Suites Passed**, **383/383 Tests Passed** (0 failures).
- **Turborepo Build**: `pnpm run build` -> **6/6 tasks successful** (0 issues).
