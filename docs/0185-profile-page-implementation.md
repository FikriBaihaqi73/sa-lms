# Feature Documentation: Admin / Pemilik Institusi Profile Page

## 1. Overview
Halaman **Profile** (`/profile`) memungkinkan **Admin / Pemilik Institusi** untuk melihat dan mengelola informasi profil pribadinya, identitas resmi (NIK/NIP), jenis kelamin, tempat/tanggal lahir, agama, kewarganegaraan, nomor kontak, email, alamat domisili, dan foto profil yang terhubung secara riil dengan backend NestJS API.

---

## 2. API Endpoints

### A. Get Current User Profile
- **Method**: `GET`
- **URL**: `/profiles/me`
- **Headers**: 
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`

#### Response Success (200 OK)
```json
{
  "status": "success",
  "message": "Current profile retrieved successfully",
  "data": {
    "id": "e9a1b2c3-d4e5-4f6a-8b7c-9d0e1f2a3b4c",
    "userId": "882715be-52ff-4f52-8868-abe5626acd31",
    "institutionId": "inst-001",
    "roleId": "role-001",
    "fullName": "Ahmad Subagja",
    "identityNumber": "3171012304890001",
    "gender": "Laki-Laki",
    "birthPlace": "Jakarta",
    "birthDate": "1989-04-23T00:00:00.000Z",
    "religionId": "rel-01",
    "nationalityId": "nat-01",
    "address": "Jl. Sudirman No. 12, Jakarta Selatan",
    "phoneNumber": "081234567890",
    "email": "admin@nexora.com",
    "photoUrl": "https://example.com/avatar.jpg",
    "institution": {
      "id": "inst-001",
      "name": "Default Institution"
    },
    "role": {
      "id": "role-001",
      "name": "superadmin"
    }
  },
  "code": 200
}
```

### B. Update Current User Profile
- **Method**: `PATCH`
- **URL**: `/profiles/me`
- **Headers**:
  - `Authorization: Bearer <access_token>`
  - `Content-Type: application/json`

#### Request Body Example
```json
{
  "fullName": "Ahmad Subagja, S.Kom., M.T.",
  "identityNumber": "3171012304890001",
  "gender": "Laki-Laki",
  "birthPlace": "Jakarta",
  "birthDate": "1989-04-23",
  "religionId": "rel-01",
  "nationalityId": "nat-01",
  "address": "Jl. Sudirman No. 12, Jakarta Selatan",
  "phoneNumber": "081234567890",
  "email": "admin@nexora.com",
  "photoUrl": "https://example.com/new-avatar.jpg"
}
```

#### Response Success (200 OK)
```json
{
  "status": "success",
  "message": "Profile updated successfully",
  "data": {
    "id": "e9a1b2c3-d4e5-4f6a-8b7c-9d0e1f2a3b4c",
    "fullName": "Ahmad Subagja, S.Kom., M.T.",
    "updatedAt": "2026-10-07T09:50:00.000Z"
  },
  "code": 200
}
```

---

## 3. Frontend Architecture (`apps/web/src/features/profile`)

- **`types/index.ts`**: Antarmuka `Profile`, `UpdateProfileInput`, `ProfileInstitution`, `ProfileRole`.
- **`schemas/profileSchema.ts`**: Skema Zod untuk validasi form pengeditan profil.
- **`api/profile.ts`**: Memanggil endpoint `/profiles/me` menggunakan `apiFetch`.
- **`hooks/useProfile.ts`**: Hook `@tanstack/react-query` untuk fetching (`useProfile`) dan perbarui (`useUpdateProfile`).
- **`components/ProfileHeader.tsx`**: Tampilan visual header dengan avatar, nama lengkap, badge role & institusi.
- **`components/ProfileForm.tsx`**: Form input identitas diri, kontak, alamat, serta pilihan dropdown Agama & Kewarganegaraan dinamis.
- **`components/ProfilePage.tsx`**: Wadah utama halaman profil yang mengkombinasikan header, ringkasan institusi, dan form profil.

---

## 4. Testing & Validation Checklist
- [x] Fetch profil otomatis menggunakan token JWT saat membuka halaman `/profile`.
- [x] Validasi form nama wajib diisi dan format email/URL valid.
- [x] Mengubah data profil dan menekan tombol **Simpan Perubahan Profil** berhasil memperbarui data di database.
- [x] Invalidation query React Query otomatis merefresh header & form setelah berhasil disimpan.
