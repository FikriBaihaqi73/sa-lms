# Implementasi Halaman Classes

## Endpoint

Semua endpoint membutuhkan header `Authorization: Bearer <access_token>`.

- `GET /classes?page=1&limit=10&search=...` mengambil daftar kelas.
- `POST /classes` membuat kelas baru.
- `PATCH /classes/:id` memperbarui kelas.
- `DELETE /classes/:id` melakukan soft-delete kelas.

## Request membuat atau memperbarui kelas

```json
{
  "academic_year_id": "uuid-tahun-ajaran",
  "name": "X IPA 1",
  "grade_level": 10,
  "homeroom_teacher_id": "uuid-guru"
}
```

Endpoint Classes dikelola oleh admin institusi. `institution_id` tidak diterima dari body; backend mengambilnya dari profil user yang terautentikasi dan memvalidasi `academic_year_id` pada institusi yang sama. `homeroom_teacher_id` bersifat opsional; pada create field dihilangkan jika kosong, sedangkan update dapat mengirim `null` untuk menghapus wali kelas. ID pada dropdown harus dikirim apa adanya, bukan label yang tampil. `grade_level` harus berupa bilangan bulat minimal `1`.

## Response daftar

```json
{
  "status": "success",
  "code": 200,
  "message": "Classes retrieved successfully",
  "data": [],
  "meta": { "page": 1, "limit": 10, "total": 0, "totalPages": 0 }
}
```

Setelah create, update, atau delete berhasil, cache daftar Classes di-invalidasi dan data diambil ulang. Create juga mengembalikan halaman ke halaman pertama.

Response setiap item daftar juga menyertakan jumlah siswa aktif melalui `_count.classStudents`; angka ini berasal dari relasi `class_students` dan bukan kapasitas.

## Alur frontend

1. Pilih tahun ajaran, lalu isi nama kelas dan tingkat.
2. Pilih wali kelas secara opsional.
3. Validasi form berjalan sebelum request dikirim.
4. Setelah sukses, dialog ditutup, daftar diperbarui, dan notifikasi sukses ditampilkan.
5. Untuk hapus, pengguna harus mengonfirmasi terlebih dahulu.

Pencarian memakai debounce dan mengembalikan pagination ke halaman pertama. Jika request gagal, tabel menampilkan aksi `Coba lagi` dan notifikasi menampilkan pesan error.

## Kolom kapasitas lama

Kolom `Classes.capacity` tetap ada di database untuk kompatibilitas data lama, tetapi tidak lagi menjadi bagian dari form atau payload endpoint Classes. Tidak ada migrasi/backfill otomatis terhadap data lama bernilai `0` atau negatif. Perubahan data lama memerlukan keputusan bisnis dan migrasi terpisah.
