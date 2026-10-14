# Dokumentasi Fitur: Penambahan Input Kode Referral & Tanggal Expired pada Pembuatan Siswa

Dokumen ini merupakan panduan teknis dan handoff untuk fitur penambahan field **Kode Referral** (`referralCode`) dan **Tanggal Expired** (`referralExpiresAt`) saat Admin menambahkan atau memperbarui data siswa pada aplikasi LMS.

---

## 1. Ringkasan Perubahan

1. **Database Schema (`students` table)**:
   - Kolom `referral_code` (`VARCHAR(100)`, opsional/nullable).
   - Kolom `referral_expires_at` (`TIMESTAMP`, opsional/nullable).
2. **Backend API (`/students`)**:
   - `CreateStudentDto` & `UpdateStudentDto` mendukung `referralCode` dan `referralExpiresAt`.
   - Pencarian `findAll` mendukung filter pencarian berdasarkan `referralCode`.
3. **Frontend Web (`apps/web`)**:
   - `StudentDialog`: Form input untuk **Kode Referral** (teks) dan **Tanggal Expired Referral** (`<input type="date" />`).
   - `StudentsTable`: Kolom **Kode Referral** menampilkan kode referral beserta tanggal expired.

---

## 2. Spesifikasi Endpoint API

Base URL: `http://localhost:5000/api` (atau sesuai `VITE_API_URL`)

### A. Buat Siswa Baru (Create Student)

- **Method**: `POST`
- **URL**: `/students`
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <jwt-token>
  ```

#### Request Body
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `profileId` | string (UUID) | Ya | ID Profile pengguna |
| `departmentId` | string (UUID) | Tidak | ID Jurusan / Departemen |
| `academicStatusId` | string (UUID) | Ya | ID Status Akademik |
| `studentNumber` | string | Ya | Nomor Induk Siswa / NIM |
| `enrollmentYear` | number | Tidak | Tahun masuk siswa (e.g. 2026) |
| `referralCode` | string | Tidak | Kode referral (maks 100 karakter) |
| `referralExpiresAt` | string (ISO 8601 / YYYY-MM-DD) | Tidak | Tanggal kedaluwarsa kode referral |

##### Contoh Request:
```json
{
  "profileId": "a50c822e-1317-48f8-8bb2-53dbe6ffc1f1",
  "departmentId": "4723dd88-f5e6-4fd0-96f8-472061e8c0fa",
  "academicStatusId": "33b28b5e-ec95-468f-9a1f-a3d548325a66",
  "studentNumber": "20260001",
  "enrollmentYear": 2026,
  "referralCode": "REF2026XYZ",
  "referralExpiresAt": "2026-12-31"
}
```

#### Response Sukses (200 OK / 201 Created)
```json
{
  "code": 200,
  "status": "success",
  "message": "Student successfully created",
  "data": {
    "id": "67b848fb-f739-4bb4-a554-b38dcf51421b",
    "profileId": "a50c822e-1317-48f8-8bb2-53dbe6ffc1f1",
    "departmentId": "4723dd88-f5e6-4fd0-96f8-472061e8c0fa",
    "academicStatusId": "33b28b5e-ec95-468f-9a1f-a3d548325a66",
    "studentNumber": "20260001",
    "enrollmentYear": 2026,
    "referralCode": "REF2026XYZ",
    "referralExpiresAt": "2026-12-31T00:00:00.000Z",
    "createdAt": "2026-10-14T09:00:00.000Z",
    "updatedAt": "2026-10-14T09:00:00.000Z",
    "deletedAt": null,
    "profile": {
      "id": "a50c822e-1317-48f8-8bb2-53dbe6ffc1f1",
      "fullName": "Ahmad Dani",
      "email": "ahmad.dani@example.com"
    }
  }
}
```

#### Response Error Validasi (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "referralCode",
      "message": "Kode referral maksimal 100 karakter"
    }
  ]
}
```

---

### B. Perbarui Data Siswa (Update Student)

- **Method**: `PATCH`
- **URL**: `/students/:id`
- **Headers**:
  ```http
  Content-Type: application/json
  Authorization: Bearer <jwt-token>
  ```

#### Request Body
Menerima subset dari field pembuatan siswa. Untuk menghapus kode referral atau tanggal expired, kirim nilai `null`.

##### Contoh Request:
```json
{
  "referralCode": "REF2027PROMO",
  "referralExpiresAt": "2027-06-30"
}
```

#### Response Sukses (200 OK)
```json
{
  "code": 200,
  "status": "success",
  "message": "Student successfully updated",
  "data": {
    "id": "67b848fb-f739-4bb4-a554-b38dcf51421b",
    "studentNumber": "20260001",
    "referralCode": "REF2027PROMO",
    "referralExpiresAt": "2027-06-30T00:00:00.000Z",
    "updatedAt": "2026-10-14T09:10:00.000Z"
  }
}
```

---

### C. Ambil Daftar Siswa (Get All Students)

- **Method**: `GET`
- **URL**: `/students?page=1&limit=10&search=REF2026`
- **Query Params**:
  - `page` (number, default: 1)
  - `limit` (number, default: 10)
  - `search` (string, opsional): Mencari berdasarkan nama siswa, email, nomor identitas, NIS/NIM, atau kode referral.

#### Response Sukses (200 OK)
```json
{
  "code": 200,
  "status": "success",
  "message": "Students fetched successfully",
  "data": {
    "data": [
      {
        "id": "67b848fb-f739-4bb4-a554-b38dcf51421b",
        "studentNumber": "20260001",
        "enrollmentYear": 2026,
        "referralCode": "REF2026XYZ",
        "referralExpiresAt": "2026-12-31T00:00:00.000Z",
        "profile": {
          "fullName": "Ahmad Dani",
          "email": "ahmad.dani@example.com"
        }
      }
    ],
    "meta": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

---

## 3. Implementasi Frontend

1. **Form Dialog (`StudentDialog.tsx`)**:
   - Field `Kode Referral`: Input teks biasa dengan placeholder `Contoh: REF2026XYZ`.
   - Field `Tanggal Expired Referral`: Input format tanggal (`type="date"`). Nilai ISO dari backend diformat menjadi `YYYY-MM-DD` saat dialog disunting.
   - Nilai dikirim via React Hook Form yang tervalidasi menggunakan Zod schema `studentFormSchema`.
2. **Tabel Mahasiswa (`StudentsTable.tsx`)**:
   - Menambahkan kolom **Kode Referral**.
   - Jika siswa memiliki kode referral, ditampilkan dalam badge `font-mono` disertai keterangan tanggal kedaluwarsa jika diset.
   - Jika tidak ada kode referral, ditampilkan `-`.

---

## 4. Edge Cases & Catatan Khusus

1. **Format Tanggal**:
   - HTML date picker menghasilkan string dengan format `YYYY-MM-DD`. Schema backend menerima format `YYYY-MM-DD` maupun ISO 8601 secara langsung.
2. **Field Kosong / Nullable**:
   - Kode referral dan tanggal kedaluwarsa bersifat opsional. Jika input dibiarkan kosong, dikirim sebagai `null` agar konsisten di database.
3. **Pencarian Global**:
   - Pengguna dapat mengetikkan kode referral langsung di kotak pencarian header untuk menemukan siswa yang terdaftar dengan kode tersebut.
