# Aturan Guru dan Scoping Institusi

## Aturan baru

- Pembuatan guru wajib memilih `profile_id` yang valid.
- Profil harus aktif, berada pada institusi admin yang sedang login, dan belum dipakai guru lain.
- Daftar, detail, statistik, perubahan, dan penghapusan guru hanya berlaku untuk institusi admin.
- Guru lama tanpa profil tidak akan muncul pada daftar guru setelah scoping institusi aktif.

## Dampak data lama

Audit read-only menemukan guru aktif tanpa profil:

```sql
SELECT id, teacher_number, profile_id
FROM "Teachers"
WHERE deleted_at IS NULL AND profile_id IS NULL;
```

Data tersebut harus ditautkan ke profil yang benar atau dibuat ulang melalui alur pembuatan guru. Contoh SQL berikut hanya dokumentasi dan tidak dijalankan:

```sql
UPDATE "Teachers"
SET profile_id = '<PROFILE_UUID_YANG_BENAR>'
WHERE id = '<TEACHER_UUID>' AND profile_id IS NULL;
```

Setelah seluruh data dibersihkan dan diverifikasi, constraint `profile_id NOT NULL` dapat dipertimbangkan melalui migrasi terpisah. Constraint tersebut sengaja belum diterapkan.

## Frontend

Form tambah guru harus memilih profil. Pada dropdown guru di Mata Pelajaran Kelas, profil bernama ditampilkan sebagai `Nama (nomor guru)`, sedangkan data lama tanpa profil ditampilkan sebagai `Tanpa nama - nomor_guru`.

