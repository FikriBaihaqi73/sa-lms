# 0207 — Remove Profile Selection Feature in Add User Form (Teacher & Student)

Fitur ini menghapus kewajiban pemilihan akun profil pengguna (`profile_id` / `profileId`) pada form tambah data master **Guru** (`/teachers`) dan **Siswa** (`/students`). Admin institusi kini dapat mendaftarkan guru dan siswa langsung sebagai data master akademik tanpa harus membuat akun profil atau login terlebih dahulu.

---

## 1. Perubahan Skema Database (Prisma)

- **`Teachers.prisma`**:
  Field `profile_id` diubah dari wajib menjadi opsional/nullable:
  ```prisma
  profile_id String? @unique @db.Uuid
  profile    Profile? @relation(fields: [profile_id], references: [id])
  ```
- **`student.prisma`**:
  Field `profileId` diubah dari wajib menjadi opsional/nullable:
  ```prisma
  profileId String? @unique @map("profile_id") @db.Uuid
  profile   Profile? @relation(fields: [profileId], references: [id])
  ```

---

## 2. API Endpoints

### A. Tambah Guru (`POST /teachers`)
- **Headers**: `Authorization: Bearer <token>`
- **Role**: `admin` / authorized staff
- **Request Body**:
  ```json
  {
    "teacher_number": "198501012010011001",
    "employment_status_id": "00000000-0000-4000-8000-000000000001",
    "specialization_id": "00000000-0000-4000-8000-000000000002",
    "join_date": "2024-01-15T00:00:00.000Z"
  }
  ```
  *(Catatan: `profile_id` bersifat opsional dan nullable).*

- **Response Sukses (`201 Created` / `200 OK`)**:
  ```json
  {
    "statusCode": 200,
    "status": "success",
    "message": "Teacher successfully created",
    "data": {
      "id": "11111111-1111-4000-8000-111111111111",
      "teacher_number": "198501012010011001",
      "profile_id": null,
      "employment_status_id": "00000000-0000-4000-8000-000000000001",
      "specialization_id": "00000000-0000-4000-8000-000000000002",
      "join_date": "2024-01-15T00:00:00.000Z",
      "profile": null,
      "employment_status": {
        "id": "00000000-0000-4000-8000-000000000001",
        "name": "Tetap"
      },
      "specialization": {
        "id": "00000000-0000-4000-8000-000000000002",
        "name": "Matematika"
      }
    }
  }
  ```

---

### B. Tambah Siswa (`POST /students`)
- **Headers**: `Authorization: Bearer <token>`
- **Role**: `admin` / authorized staff
- **Request Body**:
  ```json
  {
    "studentNumber": "20260001",
    "academicStatusId": "22222222-2222-4000-8000-222222222222",
    "departmentId": "33333333-3333-4000-8000-333333333333",
    "enrollmentYear": 2026,
    "referralCode": "REF2026XYZ",
    "referralExpiresAt": "2026-12-31"
  }
  ```
  *(Catatan: `profileId` bersifat opsional dan nullable).*

- **Response Sukses (`201 Created` / `200 OK`)**:
  ```json
  {
    "statusCode": 200,
    "status": "success",
    "message": "Student successfully created",
    "data": {
      "id": "44444444-4444-4000-8000-444444444444",
      "profileId": null,
      "departmentId": "33333333-3333-4000-8000-333333333333",
      "academicStatusId": "22222222-2222-4000-8000-222222222222",
      "studentNumber": "20260001",
      "enrollmentYear": 2026,
      "referralCode": "REF2026XYZ",
      "referralExpiresAt": "2026-12-31T00:00:00.000Z",
      "profile": null,
      "assignmentSubmissions": []
    }
  }
  ```

---

## 3. Frontend Flow & Implementasi

1. **Dialog Tambah Guru (`AddTeacherDialog` / `TeacherDialogForm`)**:
   - Field `profile_id` ditiadakan dari tampilan dialog.
   - Subtitle: *"Data master guru saja, tanpa membuat akun login."*
   - Submit form mengirim data master guru (`teacher_number`, `join_date`, `employment_status_id`, `specialization_id`).

2. **Dialog Tambah Siswa (`StudentDialog`)**:
   - Field pilihan `Profil *` ditiadakan dari form dialog.
   - Subtitle: *"Data master siswa saja, tanpa membuat akun login."*
   - Submit form mengirim data master siswa (`studentNumber`, `academicStatusId`, `departmentId`, `enrollmentYear`, `referralCode`, `referralExpiresAt`).

3. **Penanganan Tampilan Tabel & Null Safety**:
   - Kolom nama pada tabel Guru dan Siswa menggunakan fallback jika `profile` bernilai `null` (misal: `"Profil belum tersedia"`), sehingga UI tetap stabil dan aman saat me-render data yang belum memiliki relasi akun pengguna.
