# Validasi Lantai dan Kapasitas Ruang Kelas

## Aturan saat ini

- Lantai bersifat opsional/null, harus berupa angka bulat, dan nilainya minimal `0`.
- Kapasitas bersifat opsional/null, harus berupa angka bulat, dan nilainya minimal `1`.
- Kedua field dibatasi oleh rentang teknis PostgreSQL `Int`.
- Nilai kosong dikirim sebagai `null`.
- Input number yang browser tandai sebagai `badInput` tidak lagi diubah diam-diam menjadi `null`.
- Pada frontend tetap berlaku aturan kapasitas harus lebih besar atau sama dengan nomor lantai.

## Pesan validasi

| Field | Kondisi | Pesan |
| --- | --- | --- |
| Lantai | Format salah | Lantai harus berupa angka bulat, misalnya 0, 1, atau 2. |
| Lantai | Desimal | Lantai harus berupa angka bulat, tanpa desimal. |
| Lantai | Kurang dari 0 | Lantai tidak boleh kurang dari 0. |
| Lantai | Terlalu besar | Nomor lantai terlalu besar. Masukkan angka yang lebih kecil. |
| Kapasitas | Format salah | Kapasitas harus berupa angka bulat, misalnya 30. |
| Kapasitas | Desimal | Kapasitas harus berupa angka bulat, tanpa desimal. |
| Kapasitas | Kurang dari 1 | Kapasitas minimal 1 kursi. |
| Kapasitas | Terlalu besar | Kapasitas terlalu besar. Masukkan angka yang lebih kecil. |
| Kapasitas | Kurang dari lantai | Kapasitas harus lebih besar atau sama dengan nomor lantai. |

## Error dari server

Response validasi backend membawa `errors[].path`. Untuk HTTP 400, ClassroomPage meneruskan error tersebut ke dialog dan dialog menampilkannya di bawah field yang sesuai, termasuk `floor`, `capacity`, `roomCode`, dan `roomName`. Error 400 tanpa field error serta error umum tetap ditampilkan sebagai notice dan toast umum.

Konflik HTTP 409 hanya dianggap konflik kode ruangan jika pesan server memang menyebut kode ruangan. Status 422 tidak otomatis dianggap duplikat kode ruangan.

## Catatan keputusan mentor

- Dukungan lantai basement dengan angka negatif belum dikonfirmasi.
- Aturan kapasitas harus lebih besar atau sama dengan nomor lantai masih menunggu konfirmasi mentor; untuk saat ini logikanya dipertahankan.
- Batas maksimum bisnis belum ditetapkan. Implementasi saat ini hanya menggunakan batas teknis `Int32` bersama, tanpa mengarang batas bisnis baru.
