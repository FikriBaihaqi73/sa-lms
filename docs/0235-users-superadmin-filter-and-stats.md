# Manajemen Pengguna Superadmin

## Filter institusi

`GET /users` menerima `institution_id` opsional. Filter ini hanya berlaku untuk
superadmin. Tanpa nilai tersebut, superadmin melihat seluruh user sesuai status
dan pencarian. Admin institusi tetap selalu dibatasi ke institusi pada profilnya;
nilai `institution_id` dari klien diabaikan.

Contoh: `GET /users?page=1&limit=10&institution_id=<institution-uuid>`.

Halaman user menampilkan pilihan **Semua institusi** dan daftar institusi hanya
untuk superadmin. Perubahan filter mengembalikan pagination ke halaman pertama.

## Statistik

`GET /users/stats` mengembalikan statistik tanpa dipengaruhi pagination:

```json
{
  "status": "success",
  "message": "User statistics retrieved successfully",
  "data": { "total": 8, "active": 8, "inactive": 0 },
  "code": 200
}
```

Statistik mengikuti scope daftar: superadmin dapat memakai `institution_id`,
sedangkan admin institusi selalu memakai institusinya sendiri. User soft-deleted
tidak dihitung; `active` dan `inactive` berasal dari `is_active`.

## TINDAK LANJUT

- Form Tambah Pengguna belum membuat profil/institusi, sehingga user baru belum
  muncul pada daftar admin institusi.
- Keputusan cara menampilkan user tanpa profil untuk superadmin masih diperlukan.
- Konfirmasi apakah admin institusi boleh melihat akun superadmin.
