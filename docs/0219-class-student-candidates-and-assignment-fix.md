# Dokumentasi Fitur Kandidat Siswa dan Penugasan Siswa ke Kelas

## 1. Ringkasan Perubahan
Memperbaiki fitur tambah siswa ke kelas di halaman **Kelas Siswa (`/class-students`)**:
1. Menambahkan endpoint `GET /class-students/candidates?classId=:classId` di backend NestJS untuk mengambil daftar siswa yang memenuhi syarat ditambahkan ke kelas terkait.
2. Menyinkronkan profil pengguna yang berkedudukan sebagai siswa di institusi terkait agar otomatis terhubung ke entitas data siswa (`Student`).
3. Memperbaiki logika `create` penugasan kelas agar ketika siswa yang pernah dikeluarkan (soft-deleted) ditambahkan kembali, statusnya dipulihkan (*restore*) tanpa memicu pelanggaran `unique constraint` pada `(class_id, student_id)`.
4. Memperbaiki penanganan response fallback di sisi frontend (`apps/web`) agar membaca format pagination backend `{ data: [...], meta: {...} }` secara aman dan tidak lagi memicu error `TypeError: rawStudents.map is not a function`.

---

## 2. Detail Endpoint Baru

### `GET /class-students/candidates`
Mengambil daftar kandidat siswa untuk kelas tertentu berdasarkan institusi kelas tersebut.

- **URL:** `/class-students/candidates`
- **Metode:** `GET`
- **Query Params:**
  - `classId` (string, UUID, wajib): ID kelas target.
- **Headers:**
  - `Authorization: Bearer <token>`
- **Response Sukses (200 OK):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Candidate students retrieved successfully",
  "data": [
    {
      "id": "c1f7a0b3-1122-3344-5566-778899aabbcc",
      "studentNumber": "20260001",
      "fullName": "Ahmad Dani",
      "isPreviouslyRemoved": false,
      "currentClassName": null
    },
    {
      "id": "d2e8b1c4-2233-4455-6677-8899aabbccdd",
      "studentNumber": "20260002",
      "fullName": "Budi Santoso",
      "isPreviouslyRemoved": true,
      "currentClassName": "Kelas 10-A"
    }
  ]
}
```

---

## 3. Logika Penugasan Siswa (`POST /class-students` & `POST /class-students/batch`)
- Jika siswa **belum pernah** terdaftar di kelas: dibuat baris baru di tabel `class_students`.
- Jika siswa **sudah aktif** di kelas: melempar `ConflictException` ("Student is already assigned to this class").
- Jika siswa **pernah dikeluarkan (soft-deleted)** di kelas: statusnya otomatis di-`restore` (`deletedAt = null`), sehingga tidak melanggar index unik `@@unique([classId, studentId])`.

---

## 4. Penanganan Frontend (`apps/web`)
- Lokasi: `apps/web/src/features/class-student/api/class-students.ts` dan `apps/web/src/features/class-student/components/ClassStudentDialog.tsx`
- Dialog sekarang menampilkan nama lengkap dan NIM siswa dari institusi yang bersangkutan.
- Siswa yang sudah aktif di kelas tersebut otomatis disaring agar tidak muncul ganda.
- Siswa yang pernah dikeluarkan diberi badge `"Pernah dikeluarkan"` dan dapat ditambahkan kembali secara mulus.

