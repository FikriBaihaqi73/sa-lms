# Halaman Nilai Siswa

Halaman ini ditujukan untuk Admin Institusi dan tersedia di `/student-grades`. Seluruh endpoint student-grade menggunakan role `admin` dan scoping melalui institusi pada `classSubject.class.institution_id`. Akses guru, siswa, dan wali ditunda sampai pemeriksaan kepemilikan disepakati.

## Endpoint

- `GET /student-grades?page=1&limit=10&search=&classSubjectId=&academicYearId=&studentId=` — daftar terfilter dan ter-paginasi.
- `GET /student-grades/stats` — total nilai, nilai lengkap, belum lengkap, dan rata-rata nilai akhir.
- `GET /student-grades/:id` — detail nilai yang masih berada dalam institusi admin.
- `POST /student-grades` — tambah nilai.
- `PATCH /student-grades/:id` — ubah komponen nilai; key siswa, mata pelajaran kelas, dan tahun ajaran tidak dapat diubah.
- `DELETE /student-grades/:id` — soft delete.

Payload tambah memerlukan `studentId`, `classSubjectId`, dan `academicYearId`. Komponen skor bersifat opsional/null, bernilai 0–100 dengan maksimal dua desimal. `finalScore` diinput manual oleh admin. `gradeId` bersifat opsional dan dapat disarankan dari rentang `/grades` di frontend.

Response memakai pola `{ status, message, data, code, meta }`; Decimal dikembalikan sebagai number. Error penting: 400 untuk validasi/relasi, 403 bila akun tidak memiliki institusi, 404 bila record atau relasi tidak berada dalam institusi, dan 409 untuk kombinasi siswa–mata pelajaran kelas–tahun ajaran yang duplikat.

## Perilaku frontend

Frontend memuat opsi mata pelajaran kelas, tahun ajaran, siswa, dan standar penilaian melalui hook yang sudah tersedia. Filter mereset halaman ke halaman pertama. Nilai null ditampilkan sebagai `-`. Admin dapat menambah, mengubah, dan menghapus nilai; error field dari `ApiError.fieldErrors` dipetakan ke form.

## Keputusan yang menunggu mentor

Rumus bobot dan finalScore otomatis, huruf mutu otomatis dari server, penguncian/publikasi nilai, input massal, serta akses guru/siswa/wali masih menunggu keputusan. Model `grades` tetap global dan tidak diubah pada task ini.
