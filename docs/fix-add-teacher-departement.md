# Dokumentasi Perbaikan: Add Teacher & Department Feature

Dokumen ini menjelaskan perbaikan komprehensif yang telah dilakukan pada fitur penambahan data guru (teachers), master unit departemen (departments), serta validasi tanggal pada profil admin.

---

## 1. Ringkasan Masalah & Solusi

### A. Fitur Guru (Teachers)
- **Masalah**:
  - Penambahan atau pengubahan guru gagal dengan error `400 Bad Request` saat admin mengisi tanggal bergabung. Penyebabnya adalah skema backend (`teacher.schema.ts`) yang menggunakan `.datetime()` secara kaku sehingga menolak format tanggal HTML `<input type="date">` (`YYYY-MM-DD`).
  - Dropdown **Departemen** tidak tersedia pada form Tambah Guru dan tidak ditampilkan pada tabel guru.
- **Solusi**:
  - Fleksibilitas validasi format tanggal di `packages/shared/src/schemas/teacher.schema.ts` yang mendukung format `YYYY-MM-DD` maupun ISO 8601 string.
  - Penambahan field dan dropdown **Departemen** di modal tambah guru (`TeacherDialogForm.tsx` & `AddTeacherDialog.tsx`).
  - Penambahan relasi departemen di `teacherSelect` (`packages/shared/src/selects/teacher.select.ts`) dan kolom **Departemen** di tabel guru (`TeacherRow.tsx` & `TeachersTableBody.tsx`).

### B. Fitur Departemen (Departments)
- **Masalah**:
  - Belum ada halaman antarmuka (UI) untuk admin institusi mengelola master data departemen (CRUD).
  - Pengecekan keunikan kode departemen (`code`) belum ditangani di level service backend sehingga memicu unhandled Prisma unique violation jika kode duplikat dimasukkan.
  - Pencarian pada `DepartmentRepository.findAll` hanya mencari berdasarkan `name` tanpa mencakup `code`.
- **Solusi**:
  - Penambahan validasi `ensureUniqueCode` di `apps/api/src/departments/departments.service.ts` yang melempar `ConflictException` (409) dengan pesan yang jelas.
  - Peningkatan pencarian di `DepartmentRepository.findAll` agar mencari di kolom `name` maupun `code`.
  - Pembuatan fitur frontend lengkap di `apps/web/src/features/departments` (table, dialog create/edit, dialog soft-delete, hooks, api, dan skema).
  - Pendaftaran route TanStack Router `/departments` dan link navigasi di sidebar Admin Institusi.

### C. Fitur Profil Admin (Profile)
- **Masalah**:
  - Field `birthDate` pada `profile.schema.ts` mengalami masalah serupa dengan `teacher.schema.ts` (.datetime() kaku).
- **Solusi**:
  - Validasi `birthDate` diperbarui agar mendukung format `YYYY-MM-DD` dari `<input type="date">`.

---

## 2. Detail API Endpoints

### Teachers (`/teachers`)
- **GET `/teachers`**: Mendapatkan daftar guru dengan pagination, filter status, filter spesialisasi, dan pencarian teks.
- **POST `/teachers`**: Menambahkan data guru baru.
  - Payload:
    ```json
    {
      "profile_id": "uuid",
      "teacher_number": "198501012010011001",
      "department_id": "uuid", // Opsional
      "specialization_id": "uuid", // Opsional
      "employment_status_id": "uuid", // Opsional
      "join_date": "2024-01-15" // Opsional (YYYY-MM-DD atau ISO 8601)
    }
    ```
- **PATCH `/teachers/:id`**: Memperbarui data guru.
- **DELETE `/teachers/:id`**: Menghapus data guru (soft delete).

### Departments (`/departments`)
- **GET `/departments`**: Mendapatkan daftar departemen (search `name` & `code`, pagination).
- **POST `/departments`**: Membuat departemen baru.
  - Payload:
    ```json
    {
      "name": "Ilmu Pengetahuan Alam",
      "code": "IPA-01"
    }
    ```
- **PATCH `/departments/:id`**: Memperbarui nama atau kode departemen.
- **DELETE `/departments/:id`**: Soft-delete departemen.

---

## 3. Hasil Pengujian
- Unit test backend `TeachersService`: **PASS** (8/8 tests passed).
- Unit test backend `DepartmentsService`: **PASS** (4/4 tests passed termasuk validasi keunikan nama & kode).
- Build frontend `apps/web`: **SUCCESS** (TypeScript check & Vite bundling berhasil tanpa error).
