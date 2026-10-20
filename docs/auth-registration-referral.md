# Registrasi dengan Referral dan Login

## Endpoint

### `POST /auth/register`

Header: `Content-Type: application/json`.

Registrasi instansi mewajibkan `institutionName`:

```json
{
  "role": "instansi",
  "email": "admin@sekolah.id",
  "password": "kataSandiAman123",
  "institutionName": "SMA Negeri 1 Contoh"
}
```

Registrasi siswa mewajibkan `referralCode`; nama instansi tidak dikirim:

```json
{
  "role": "student",
  "email": "siswa@example.com",
  "password": "kataSandiAman123",
  "referralCode": "SCH-2026-ABC"
}
```

Kode referral dicari tanpa membedakan huruf besar/kecil. Kode harus dimiliki oleh data siswa yang aktif, belum dihapus, dan `referralExpiresAt` harus lebih besar dari waktu server saat ini. Saat valid, profil akun siswa dibuat dengan `institutionId` milik sekolah penerbit kode.

Sukses (`201`):

```json
{
  "status": "success",
  "message": "Registration successful",
  "code": 201,
  "data": { "id": "uuid", "email": "siswa@example.com" }
}
```

Kode tidak valid atau kedaluwarsa (`409`):

```json
{
  "statusCode": 409,
  "message": "Kode referral tidak ditemukan atau sudah kadaluwarsa"
}
```

Frontend menukar field secara otomatis berdasarkan role. Tampilkan pesan API pada form dan jangan melanjutkan ke login bila respons tidak sukses.

### `POST /auth/login`

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

Kredensial salah selalu menghasilkan `401` dan pesan `Email atau kata sandi salah`; detail apakah email terdaftar tidak dibocorkan. Gangguan database, hash yang rusak, atau kegagalan penandatanganan JWT menghasilkan `503` dengan pesan aman untuk pengguna dan detailnya dicatat di console backend. Pastikan `JWT_SECRET` ada di file `.env` sebelum menjalankan API.
