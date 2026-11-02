# Perbaikan Validasi Kolom Lantai dan Kapasitas Ruang Kelas (Classroom)

## Ringkasan Perbaikan

Perbaikan ini menyelesaikan isu pada panel Admin saat menambah atau mengubah data ruang kelas (`/classrooms`):
- **Masalah**: Form crash atau memunculkan error validasi saat kolom **Lantai** dan **Kapasitas** dikosongkan (tidak diisi).
- **Penyebab**:
  1. Skema Zod backend (`packages/shared/src/schemas/classroom.schema.ts`) dan interface repository hanya mengizinkan `number | undefined`, sehingga saat nilai `null` dikirimkan dari frontend atau form yang dikosongkan, validasi Zod backend menolak dengan error `Expected number, received null`.
  2. Input number di React Hook Form (`apps/web/src/features/classroom/components/ClassroomDialog.tsx`) menghasilkan string kosong `""` saat dikosongkan. Tanpa penanganan `setValueAs` yang mengonversi string kosong menjadi `null`, skema form frontend menolak dengan error `Expected number, received string`.
  3. Aturan refine pada frontend mengevaluasi `capacity >= floor` tanpa memeriksa apakah salah satu nilainya `null` atau `undefined`, sehingga perbandingan `null >= floor` menghasilkan nilai palsu (`0 >= floor` -> `false`) dan memicu pesan kesalahan validasi yang salah.
- **Solusi**:
  1. Memperbarui skema Zod backend (`CreateClassroomSchema` & `UpdateClassroomSchema`) menjadi `.nullable().optional()`.
  2. Memperbarui `classroom.repository.ts` agar interface `CreateClassroomInput` dan `UpdateClassroomInput` mengizinkan `number | null`.
  3. Memperbarui skema form frontend `classroomFormSchema` agar kolom `floor` dan `capacity` menerima `number | null | undefined`, serta memperbaiki refine agar hanya memeriksa `capacity >= floor` jika kedua nilai tersebut terisi.
  4. Memperbarui `ClassroomDialog.tsx` dengan `setValueAs` yang mengubah nilai kosong/NaN menjadi `null` secara konsisten.
  5. Menampilkan tanda hubung `"-"` di tabel daftar ruang kelas saat nilai lantai atau kapasitas tidak terisi (`null`).

---

## Endpoint API

Semua endpoint membutuhkan header `Authorization: Bearer <JWT>`.

| Method | URL | Deskripsi |
|---|---|---|
| `GET` | `/classrooms?page=1&limit=10&search=` | Mengambil daftar ruang kelas dengan pagination dan pencarian |
| `GET` | `/classrooms/:id` | Mengambil detail ruang kelas berdasarkan ID |
| `POST` | `/classrooms` | Menambah data ruang kelas baru |
| `PATCH` | `/classrooms/:id` | Mengubah data ruang kelas |
| `DELETE` | `/classrooms/:id` | Menghapus ruang kelas (*soft-delete*) |

---

## Request & Response

### 1. Tambah Ruang Kelas (Lantai & Kapasitas Dikosongkan)

#### Request:
- **Method**: `POST`
- **URL**: `/classrooms`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body**:
```json
{
  "institutionId": "550e8400-e29b-41d4-a716-446655440000",
  "roomCode": "R-LAB-01",
  "roomName": "Laboratorium Komputer 1",
  "building": "Gedung Teori",
  "floor": null,
  "capacity": null,
  "description": "Lab komputer umum"
}
```

#### Response Sukses (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "message": "Classroom created successfully",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "institutionId": "550e8400-e29b-41d4-a716-446655440000",
    "roomCode": "R-LAB-01",
    "roomName": "Laboratorium Komputer 1",
    "building": "Gedung Teori",
    "floor": null,
    "capacity": null,
    "description": "Lab komputer umum",
    "createdAt": "2026-11-02T10:00:00.000Z",
    "updatedAt": "2026-11-02T10:00:00.000Z"
  }
}
```

### 2. Edit Ruang Kelas (Menghapus / Mengosongkan Nilai Kapasitas dan Lantai)

#### Request:
- **Method**: `PATCH`
- **URL**: `/classrooms/7c9e6679-7425-40de-944b-e07fc1f90ae7`
- **Headers**:
  - `Content-Type: application/json`
  - `Authorization: Bearer <token>`
- **Body**:
```json
{
  "floor": null,
  "capacity": null
}
```

#### Response Sukses (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "message": "Classroom updated successfully",
  "data": {
    "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
    "roomCode": "R-LAB-01",
    "roomName": "Laboratorium Komputer 1",
    "floor": null,
    "capacity": null,
    "updatedAt": "2026-11-02T10:05:00.000Z"
  }
}
```

### 3. Validasi Error (Jika Input Tidak Sesuai)

Jika input bukan bilangan bulat atau di bawah batas minimum:
- **Status**: 400 Bad Request
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "floor",
      "message": "Lantai tidak boleh negatif."
    },
    {
      "field": "capacity",
      "message": "Kapasitas minimal 1 kursi."
    }
  ]
}
```

---

## Alur Implementasi Frontend

1. **Inisialisasi Nilai Form**:
   - Jika membuat ruang kelas baru, nilai awal `floor` dan `capacity` adalah `null`.
   - Jika mengubah ruang kelas, `floor: classroom.floor ?? null` dan `capacity: classroom.capacity ?? null`.
2. **Transformasi Input**:
   - Komponen input menggunakan `setValueAs` dari React Hook Form untuk memetakan string kosong `""` ke `null`, dan memetakan angka valid ke `Number(value)`.
3. **Validasi**:
   - Zod schema menerima `number`, `null`, maupun `undefined`.
   - Jika pengguna mengisi nilai lantai dan kapasitas sekaligus, aturan `capacity >= floor` akan divalidasi.
   - Jika salah satu atau kedua kolom dikosongkan (`null` / `undefined`), validasi tetap lolos dengan sukses.
4. **Penyimpanan**:
   - Payload dikirim langsung ke API backend dengan nilai `null`, yang kemudian disimpan ke database PostgreSQL tanpa menyebabkan crash.

