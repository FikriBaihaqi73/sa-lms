# TASK 0241 - Relocate Assignment Type Feature from Superadmin to Admin Institusi

## Summary
- **Backend**: `AssignmentTypeController` diberi `@Roles("admin")` pada level controller. Token `superadmin`, `teacher`, `student`, `guardian` menerima **403 Forbidden**.
- **Frontend**: Menu "Jenis Tugas" dipindahkan dari menu Superadmin (Master Data Global) ke section **Konfigurasi Akademik** (Admin Institusi).
- **Access Guard**: Route `/assignment-types` dipindahkan dari `SUPERADMIN_ONLY_PREFIXES` ke `INSTITUTION_ADMIN_ONLY_PREFIXES` (Superadmin & peran non-admin lainnya menerima halaman `AccessDenied (403)`).

## Endpoints
Semua endpoint di bawah membutuhkan `Authorization: Bearer <JWT>` dengan role `admin`:
- `GET /assignment-types` - Mendapatkan daftar tipe tugas
- `GET /assignment-types/:id` - Mendapatkan detail tipe tugas berdasarkan ID
- `POST /assignment-types` - Membuat tipe tugas baru
- `PATCH /assignment-types/:id` - Memperbarui data tipe tugas
- `DELETE /assignment-types/:id` - Menghapus (soft-delete) tipe tugas

## Access Matrix
- **Backend**: Role `admin` only (`@Roles("admin")`).
- **Frontend**: Admin Institusi only (`INSTITUTION_ADMIN_ONLY_PREFIXES`); Superadmin dan role lain diblokir dengan `AccessDenied (403)`.
