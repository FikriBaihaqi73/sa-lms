# 0245 Sidebar Menu Grouping

Sidebar Admin Institusi sekarang mengelompokkan menu menjadi enam grup yang dapat dibuka dan ditutup:

| Grup | Item |
| --- | --- |
| Manajemen Pengguna | Data Pengguna, Tambah Siswa, Relasi Wali Siswa, Guru, Wali Murid |
| Struktur Akademik | Departemen, Tahun Ajaran, Peminatan & Keahlian, Semester, Ruang Kelas, Kelas, Mata Pelajaran, Kelas Siswa, Mata Pelajaran Kelas, Prasyarat Mata Kuliah |
| Pembelajaran | Jadwal Pelajaran, Jurnal Mengajar, Rencana Studi, Modul & Konten Materi, Tugas & Submisi, Jenis Tugas |
| Kehadiran | Status Kehadiran, Presensi & Absensi |
| Penilaian | Standar Penilaian, Ujian, Nilai Siswa, Nilai Ujian, Rekap Nilai Siswa |
| Sistem & Pengaturan | Pengumuman, Log Aktivitas, Pengaturan, Profil Saya |

Menu dan kondisi akses existing dipertahankan. Grup Kehadiran hanya muncul jika ada item anak yang dirender, sehingga Admin non-explicit tidak melihat grup kosong.

## Perilaku buka/tutup

- Grup terbuka otomatis ketika pathname sama dengan route anak atau merupakan child route-nya.
- Navigasi ke route dalam grup yang tertutup akan membuka grup tersebut.
- Pengguna tetap dapat menutup grup aktif secara manual.
- Beberapa grup dapat terbuka bersamaan.
- Anak grup yang tertutup memakai atribut `hidden`, sehingga tidak dapat difokuskan.
- Header grup adalah button keyboard-accessible dengan `aria-expanded` dan `aria-controls`.
- `/settings` hanya membuka Sistem & Pengaturan pada pathname `/settings` yang tepat. `/settings/classrooms`, `/settings/study-plans`, dan `/settings/assignments` membuka grup pemiliknya, sehingga grup Sistem & Pengaturan tidak ikut terbuka hanya karena prefix `/settings`.

## Test akses

Pemindahan dilakukan dengan membungkus `<NavItem>` existing, bukan memindahkannya ke array data atau menulis ulang kondisi akses. Dengan begitu test kontrak yang membaca source sidebar tetap menemukan route, label, dan marker `INSTITUTION ADMIN SECTION`. Assertion attendance-statuses yang sebelumnya terlalu bergantung pada whitespace diubah menjadi regex yang tidak peka spasi.

Tidak ada route baru, perubahan authorization, perubahan backend, atau dependency baru.

## Menunggu konfirmasi mentor

- Apakah grouping nantinya juga berlaku untuk Superadmin dan Student/Teacher/Guardian?
- Apakah “Overview Kehadiran” dan “Data Presensi” harus menjadi halaman terpisah, atau cukup dua menu existing dalam grup Kehadiran?
- Apakah state buka/tutup perlu dipersistenkan antar sesi?
- Apakah diperlukan mode sidebar ikon-saja atau mobile drawer? Sidebar saat ini hanya tampil pada layar `lg` ke atas.
- Route `/students` tersedia tetapi belum memiliki menu sidebar.
