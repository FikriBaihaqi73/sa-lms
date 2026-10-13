# 📚 Katalog Fitur & Spesifikasi Fungsi Sistem Academic & LMS

Dokumen ini menjelaskan seluruh fitur yang tersedia pada aplikasi **Academic Management System & Learning Management System (LMS)** secara lengkap, terstruktur, dan mendalam, baik dari sisi fungsionalitas, hak akses pengguna (*Role-Based Access Control*), maupun peruntukannya di level frontend dan backend.

---

## 📑 Daftar Isi
1. [Struktur Peran Pengguna (User Roles)](#1-struktur-peran-pengguna-user-roles)
2. [Sistem & Keamanan (System, Auth & Access)](#2-sistem--keamanan-system-auth--access)
3. [Master Data Global (Khusus Superadmin)](#3-master-data-global-khusus-superadmin)
4. [Manajemen Civitas Akademika (User Management Institusi)](#4-manajemen-civitas-akademika-user-management-institusi)
5. [Konfigurasi & Struktur Akademik (Academic Configuration & Structure)](#5-konfigurasi--struktur-akademik-academic-configuration--structure)
6. [Presensi & Kegiatan Belajar Mengajar (Attendance & Teaching)](#6-presensi--kegiatan-belajar-mengajar-attendance--teaching)
7. [Learning Management System (LMS)](#7-learning-management-system-lms)
8. [Ujian & Penilaian Hasil Belajar (Examination & Assessment)](#8-ujian--penilaian-hasil-belajar-examination--assessment)
9. [Komunikasi & Manajemen Berkas (Communication & Files)](#9-komunikasi--manajemen-berkas-communication--files)

---

## 1. Struktur Peran Pengguna (User Roles)

Sistem dirancang dengan arsitektur multi-tenant berbasis hierarki akses:
- 👑 **Superadmin (Pemilik Aplikasi)**: Mengontrol platform secara global, data master universal, dan seluruh institusi mitra. Tidak mencampuri urusan akademik harian sekolah.
- 🛠️ **Admin Institusi (Pemilik / Pengelola Sekolah/Kampus)**: Mengelola operasional harian institusi, civitas akademika (guru, siswa, wali), kurikulum, jadwal, dan nilai institusinya.
- 👨‍🏫 **Teacher (Guru / Dosen)**: Mengelola materi LMS, memberikan tugas, mengisi jurnal mengajar, mencatat absensi siswa, dan memberi nilai.
- 🎓 **Student (Siswa / Mahasiswa)**: Mengakses jadwal, membaca materi modul, mengumpulkan tugas, mengikuti ujian, memantau absensi, dan melihat nilai/rapor.
- 👨‍👩‍👧 **Guardian (Orang Tua / Wali)**: Memantau kehadiran, rekapitulasi nilai, tagihan/pengumuman, dan perkembangan belajar anak mereka.

---

## 2. Sistem & Keamanan (System, Auth & Access)

### 2.1 Autentikasi Pengguna (Authentication)
- **Rute Frontend**: `/login`, `/register`
- **Endpoint API**: `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`
- **Hak Akses**: Publik (Semua pengguna)
- **Fungsi Utama**:
  - Menyediakan form masuk dengan validasi format email dan kata sandi menggunakan enkripsi aman (Bcrypt cost 10).
  - Menerbitkan token JWT (*JSON Web Token*) bertipe Bearer untuk autentikasi API.
  - Pendaftaran mandiri siswa atau institusi baru.
  - Mengarahkan rute awal (*landing page*) secara otomatis berdasarkan role pengguna saat berhasil login.

### 2.2 Profil Saya (My Profile)
- **Rute Frontend**: `/profile`
- **Endpoint API**: `GET /profiles/me`, `PATCH /profiles/me`
- **Hak Akses**: Semua pengguna yang terautentikasi (Superadmin, Admin, Guru, Siswa, Wali)
- **Fungsi Utama**:
  - Melihat informasi personal pengguna yang sedang aktif (nama lengkap, email, nomor HP, bio, alamat).
  - Memperbarui data profil mandiri tanpa memengaruhi kredensial hak akses sistem.
  - Inisialisasi profil otomatis apabila akun baru pertama kali mengakses sistem.

### 2.3 Manajemen Akun Pengguna (Users Management)
- **Rute Frontend**: `/users`
- **Endpoint API**: `GET /users`, `POST /users`, `PATCH /users/:id`, `DELETE /users/:id`
- **Hak Akses**: 👑 Superadmin & 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Mengelola seluruh akun login ke sistem.
  - Mengatur status akun (Aktif atau Dinonaktifkan).
  - Melakukan reset kata sandi atau pembuatan akun baru dengan role tertentu.

### 2.4 Manajemen Peran (Roles)
- **Rute Frontend**: `/roles`
- **Endpoint API**: `GET /roles`, `POST /roles`, `PATCH /roles/:id`, `DELETE /roles/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Menentukan nama dan deskripsi tingkatan peran pengguna di dalam ekosistem aplikasi.
  - Menjadi fondasi Role-Based Access Control (RBAC).

### 2.5 Manajemen Hak Izin (Permissions)
- **Rute Frontend**: `/permissions`
- **Endpoint API**: `GET /permissions`, `POST /permissions`, `PATCH /permissions/:id`, `DELETE /permissions/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Mendaftarkan izin aksi spesifik (misal: `create:users`, `read:grades`, `delete:institutions`).
  - Membatasi batasan granular keamanan sistem hingga level endpoint API.

### 2.6 Pemetaan Izin Peran (Role Permissions)
- **Rute Frontend**: `/role-permissions`
- **Endpoint API**: `GET /role-permissions`, `POST /role-permissions`, `DELETE /role-permissions/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Menghubungkan setiap *Permission* ke dalam *Role* yang berhak mengeksekusinya.
  - Mengunci atau membuka akses modul bagi peran tertentu secara dinamis.

### 2.7 Log Aktivitas Sistem (Activity Logs)
- **Rute Frontend**: `/activity-logs`
- **Endpoint API**: `GET /activity-logs`
- **Hak Akses**: 👑 Superadmin & 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Merekam audit trail (jejak audit) setiap aktivitas penting pengguna (login, ubah data, hapus data).
  - Menyimpan informasi IP address, user agent, waktu kejadian, dan entitas yang dimodifikasi untuk tujuan keamanan.

### 2.8 Pengaturan Sistem (Settings)
- **Rute Frontend**: `/settings`
- **Endpoint API**: `GET /settings`, `POST /settings`, `PATCH /settings/:id`, `DELETE /settings/:id`
- **Hak Akses**: 👑 Superadmin & 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Menyimpan konfigurasi key-value sistem (misal: nama aplikasi, logo, mode pemeliharaan/maintenance, preferensi umum).

---

## 3. Master Data Global (Khusus Superadmin)

Master data ini bersifat universal lintas seluruh institusi dan dipelihara secara terpusat oleh Superadmin.

### 3.1 Manajemen Institusi (Institutions)
- **Rute Frontend**: `/institutions`
- **Endpoint API**: `GET /institutions`, `POST /institutions`, `PATCH /institutions/:id`, `DELETE /institutions/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Mendaftarkan sekolah, universitas, atau lembaga pendidikan baru yang bermitra dengan platform.
  - Menyimpan detail legal institusi (nama institusi, email, nomor telepon, alamat, website resmi).

### 3.2 Jenjang Institusi (Institution Levels)
- **Rute Frontend**: `/jenjang-institusi`
- **Endpoint API**: `GET /institution-levels`, `POST /institution-levels`, `PATCH /institution-levels/:id`, `DELETE /institution-levels/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Mengelola klasifikasi tingkatan lembaga pendidikan (misal: PAUD, SD, SMP, SMA, SMK, Perguruan Tinggi).

### 3.3 Data Master Agama (Religions)
- **Rute Frontend**: `/religions`
- **Endpoint API**: `GET /religions`, `POST /religions`, `PATCH /religions/:id`, `DELETE /religions/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Menyediakan daftar baku agama resmi untuk formulir biodata civitas akademika.

### 3.4 Data Master Kewarganegaraan (Nationalities)
- **Rute Frontend**: `/nationalities`
- **Endpoint API**: `GET /nationalities`, `POST /nationalities`, `PATCH /nationalities/:id`, `DELETE /nationalities/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Menyediakan daftar negara / kewarganegaraan (WNI / WNA) untuk standarisasi profil.

### 3.5 Status Akademik Siswa (Academic Statuses)
- **Rute Frontend**: `/academic-statuses`
- **Endpoint API**: `GET /academic-statuses`, `POST /academic-statuses`, `PATCH /academic-statuses/:id`, `DELETE /academic-statuses/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Mengatur klasifikasi status perkuliahan/sekolah (misal: *Aktif, Cuti, Drop Out, Lulus, Pindah Sekolah*).

### 3.6 Status Kepegawaian (Employment Statuses)
- **Rute Frontend**: `/employment-statuses`
- **Endpoint API**: `GET /employment-statuses`, `POST /employment-statuses`, `PATCH /employment-statuses/:id`, `DELETE /employment-statuses/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Mengatur klasifikasi status kerja guru & tenaga kependidikan (misal: *PNS, Guru Tetap Yayasan, Honorer, Magang, Kontrak*).

### 3.7 Peminatan & Keahlian (Specialization Statuses)
- **Rute Frontend**: `/specialization-statuses`
- **Endpoint API**: `GET /specializations`, `POST /specializations`, `PATCH /specializations/:id`, `DELETE /specializations/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Mengelola daftar konsentrasi peminatan keahlian (misal: *MIPA, IPS, Bahasa, Rekayasa Perangkat Lunak, Teknik Kendaraan Ringan*).

### 3.8 Tipe Penugasan (Assignment Types)
- **Rute Frontend**: `/assignment-types`
- **Endpoint API**: `GET /assignment-types`, `POST /assignment-types`, `PATCH /assignment-types/:id`, `DELETE /assignment-types/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Mengelompokkan jenis tagihan tugas belajar (misal: *Tugas Harian, Proyek Kelompok, Pekerjaan Rumah (PR), Praktikum Laboratorium*).

### 3.9 Status Kehadiran (Attendance Statuses)
- **Rute Frontend**: `/attendance-statuses`
- **Endpoint API**: `GET /attendance-statuses`, `POST /attendance-statuses`, `PATCH /attendance-statuses/:id`, `DELETE /attendance-statuses/:id`
- **Hak Akses**: 👑 Superadmin
- **Fungsi Utama**:
  - Mengatur parameter dasar pencatatan absensi (misal: *Hadir, Izin Resmi, Sakit dengan Surat, Alpa / Tanpa Keterangan*).

---

## 4. Manajemen Civitas Akademika (User Management Institusi)

### 4.1 Tenaga Pengajar / Guru (Teachers)
- **Endpoint API**: `GET /teachers`, `POST /teachers`, `PATCH /teachers/:id`, `DELETE /teachers/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Mendata profil guru (Nomor Induk Pegawai/NIP, gelar pendidikan, spesialisasi keilmuan, nomor kontak).
  - Menghubungkan akun login pengguna dengan entitas pendidik institusi.

### 4.2 Siswa / Peserta Didik (Students)
- **Endpoint API**: `GET /students`, `POST /students`, `PATCH /students/:id`, `DELETE /students/:id`
- **Hak Akses**: 🛠️ Admin Institusi (Siswa hanya bisa membaca profil sendiri)
- **Fungsi Utama**:
  - Menyimpan data induk kesiswaan (Nomor Induk Siswa/NIS, NISN, tahun angkatan masuk, status akademik).
  - Mengelompokkan siswa ke dalam jurusan atau peminatan tertentu.

### 4.3 Orang Tua / Wali Siswa (Guardians)
- **Endpoint API**: `GET /guardians`, `POST /guardians`, `PATCH /guardians/:id`, `DELETE /guardians/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Mencatat data wali murid (Nama lengkap, nomor darurat, pekerjaan, alamat tinggal).

### 4.4 Relasi Siswa & Wali (Student Guardians)
- **Endpoint API**: `GET /student-guardians`, `POST /student-guardians`, `DELETE /student-guardians/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Menghubungkan siswa dengan orang tua atau walinya beserta status hubungan keluarga (Ayah, Ibu, Wali Asuh).

---

## 5. Konfigurasi & Struktur Akademik (Academic Configuration & Structure)

### 5.1 Tahun Ajaran (Academic Years)
- **Rute Frontend**: `/academic-years`
- **Endpoint API**: `GET /academic-years`, `POST /academic-years`, `PATCH /academic-years/:id`, `DELETE /academic-years/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Menetapkan periode kalender akademik sekolah (misal: *2024/2025, 2025/2026*).
  - Menentukan tahun ajaran mana yang sedang aktif berlaku di institusi.

### 5.2 Semester Akademik (Semesters)
- **Rute Frontend**: `/semesters`
- **Endpoint API**: `GET /semesters`, `POST /semesters`, `PATCH /semesters/:id`, `DELETE /semesters/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Mengelola periode semester (Semester Ganjil / Semester Genap).
  - Menentukan tanggal mulai dan berakhirnya proses KBM per semester.

### 5.3 Skala Penilaian & Mutu Nilai (Grades)
- **Rute Frontend**: `/grades`
- **Endpoint API**: `GET /grades`, `POST /grades`, `PATCH /grades/:id`, `DELETE /grades/:id`
- **Hak Akses**: 🛠️ Admin Institusi, 👨‍🏫 Guru, 🎓 Siswa (Read-only)
- **Fungsi Utama**:
  - Mengatur skala konversi nilai (Huruf mutu A, B, C, D, E, rentang angka minimum-maksimum, poin indeks prestasi, dan predikat kelulusan).

### 5.4 Program Studi / Jurusan (Departments)
- **Endpoint API**: `GET /departments`, `POST /departments`, `PATCH /departments/:id`, `DELETE /departments/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Mendata fakultas, jurusan, atau bidang keahlian di institusi (misal: *Teknik Informatika, Akuntansi, IPA*).

### 5.5 Rombongan Belajar / Kelas (Classes)
- **Endpoint API**: `GET /classes`, `POST /classes`, `PATCH /classes/:id`, `DELETE /classes/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Membentuk grup kelas per angkatan (misal: *Kelas X-IPA 1, Kelas XII-TKJ 2*).
  - Menunjuk guru sebagai Wali Kelas (*Homeroom Teacher*).

### 5.6 Pembagian Siswa Kelas (Class Students)
- **Endpoint API**: `GET /class-students`, `POST /class-students`, `DELETE /class-students/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Memasukkan dan memindahkan siswa ke dalam rombel kelas yang sesuai pada semester berjalan.

### 5.7 Mata Pelajaran / Mata Kuliah (Subjects)
- **Endpoint API**: `GET /subjects`, `POST /subjects`, `PATCH /subjects/:id`, `DELETE /subjects/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Mengelola katalog mata pelajaran kurikulum (Kode mapel, nama mapel, jumlah SKS/jam pelajaran, deskripsi).

### 5.8 Alokasi Mapel Kelas (Class Subjects)
- **Endpoint API**: `GET /class-subjects`, `POST /class-subjects`, `PATCH /class-subjects/:id`, `DELETE /class-subjects/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Memplot mata pelajaran ke rombel kelas tertentu beserta penunjukan guru pengampu mata pelajaran tersebut.

### 5.9 Prasyarat Mata Pelajaran (Subject Prerequisites)
- **Endpoint API**: `GET /subject-prerequisites`, `POST /subject-prerequisites`, `DELETE /subject-prerequisites/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Menentukan syarat kelulusan mapel dasar sebelum siswa dapat mengambil mapel tingkat lanjut (misal: *Kalkulus I* wajib sebelum *Kalkulus II*).

### 5.10 Ruang Belajar Fisik (Classrooms)
- **Endpoint API**: `GET /classrooms`, `POST /classrooms`, `PATCH /classrooms/:id`, `DELETE /classrooms/:id`
- **Hak Akses**: 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Mendata fasilitas ruangan gedung (misal: *Ruang Teori 101, Lab Komputer 2, Studio Musik*) lengkap dengan kapasitas meja/kursi.

### 5.11 Penjadwalan Pelajaran (Schedules)
- **Endpoint API**: `GET /schedules`, `POST /schedules`, `PATCH /schedules/:id`, `DELETE /schedules/:id`
- **Hak Akses**: 🛠️ Admin Institusi, 👨‍🏫 Guru, 🎓 Siswa
- **Fungsi Utama**:
  - Menyusun jadwal KBM terstruktur berdasarkan hari (Senin - Sabtu), jam mulai, jam berakhir, ruangan, guru, dan mata pelajaran.

---

## 6. Presensi & Kegiatan Belajar Mengajar (Attendance & Teaching)

### 6.1 Presensi Siswa (Attendances)
- **Endpoint API**: `GET /attendances`, `POST /attendances`, `PATCH /attendances/:id`
- **Hak Akses**: 👨‍🏫 Guru, 🛠️ Admin Institusi, 🎓 Siswa (Lihat milik sendiri), 👨‍👩‍👧 Wali
- **Fungsi Utama**:
  - Guru mencatat kehadiran siswa per pertemuan kelas (Hadir, Sakit, Izin, Alpa).
  - Sistem menyediakan rekapitulasi persentase kehadiran siswa untuk syarat mengikuti ujian.

### 6.2 Jurnal Mengajar Guru (Teaching Journals)
- **Endpoint API**: `GET /teaching-journals`, `POST /teaching-journals`, `PATCH /teaching-journals/:id`
- **Hak Akses**: 👨‍🏫 Guru, 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Guru mencatat resume materi pokok bahasan yang diajarkan, catatan khusus kelas, dan hambatan KBM pada setiap pertemuan.

### 6.3 Rencana Studi / KRS (Study Plans)
- **Endpoint API**: `GET /study-plans`, `POST /study-plans`, `PATCH /study-plans/:id`
- **Hak Akses**: 🎓 Siswa, 👨‍🏫 Guru Pembimbing, 🛠️ Admin Institusi
- **Fungsi Utama**:
  - Siswa menyusun atau memilih mata pelajaran yang diambil untuk semester depan.
  - Pembimbing akademik memvalidasi atau menyetujui rencana studi siswa.

---

## 7. Learning Management System (LMS)

### 7.1 Modul Silabus Pembelajaran (Modules)
- **Endpoint API**: `GET /modules`, `POST /modules`, `PATCH /modules/:id`, `DELETE /modules/:id`
- **Hak Akses**: 👨‍🏫 Guru (Pengelola), 🎓 Siswa (Pembaca)
- **Fungsi Utama**:
  - Mengorganisir silabus dan bab-bab topik pembelajaran per mata pelajaran secara berurutan.

### 7.2 Konten Materi Pembelajaran (Module Contents)
- **Endpoint API**: `GET /module-contents`, `POST /module-contents`, `PATCH /module-contents/:id`, `DELETE /module-contents/:id`
- **Hak Akses**: 👨‍🏫 Guru, 🎓 Siswa
- **Fungsi Utama**:
  - Mengunggah isi materi pelajaran (Bahan bacaan teks Markdown/HTML, lampiran PDF presentasi, video pembelajaran, dan pranala luar).

### 7.3 Tugas Belajar (Assignments)
- **Endpoint API**: `GET /assignments`, `POST /assignments`, `PATCH /assignments/:id`, `DELETE /assignments/:id`
- **Hak Akses**: 👨‍🏫 Guru (Pembuat), 🎓 Siswa (Pengerja)
- **Fungsi Utama**:
  - Guru mempublikasikan tugas belajar lengkap dengan instruksi, batas waktu pengumpulan (*deadline*), dan bobot nilai.

### 7.4 Pengumpulan Tugas Siswa (Assignment Submissions)
- **Endpoint API**: `GET /assignment-submissions`, `POST /assignment-submissions`, `PATCH /assignment-submissions/:id`
- **Hak Akses**: 🎓 Siswa, 👨‍🏫 Guru
- **Fungsi Utama**:
  - Siswa mengunggah dokumen jawaban tugas sebelum tenggat waktu.
  - Guru memeriksa file jawaban siswa, memberikan ulasan komentar koreksi (*feedback*), dan memasukkan nilai tugas.

---

## 8. Ujian & Penilaian Hasil Belajar (Examination & Assessment)

### 8.1 Manajemen Ujian (Examinations)
- **Endpoint API**: `GET /examinations`, `POST /examinations`, `PATCH /examinations/:id`, `DELETE /examinations/:id`
- **Hak Akses**: 🛠️ Admin Institusi, 👨‍🏫 Guru
- **Fungsi Utama**:
  - Menjadwalkan ujian (Kuis, Penilaian Tengah Semester/PTS, Penilaian Akhir Semester/PAS, Ujian Praktik).
  - Mengatur durasi waktu pengerjaan dan bobot penilaian terhadap nilai akhir.

### 8.2 Skor Nilai Ujian (Examination Scores)
- **Endpoint API**: `GET /examination-scores`, `POST /examination-scores`, `PATCH /examination-scores/:id`
- **Hak Akses**: 👨‍🏫 Guru, 🎓 Siswa (Lihat milik sendiri)
- **Fungsi Utama**:
  - Merekam perolehan poin ujian yang didapat oleh setiap siswa per mata ujian.

### 8.3 Nilai Akhir Siswa (Student Grades)
- **Endpoint API**: `GET /student-grades`, `POST /student-grades`, `PATCH /student-grades/:id`
- **Hak Akses**: 👨‍🏫 Guru, 🛠️ Admin Institusi, 🎓 Siswa
- **Fungsi Utama**:
  - Mengkalkulasikan akumulasi nilai (Tugas + Presensi + PTS + PAS) menjadi nilai akhir mata pelajaran.

### 8.4 Rapor & Hasil Studi / KHS (Study Results)
- **Endpoint API**: `GET /study-results`, `POST /study-results`, `PATCH /study-results/:id`
- **Hak Akses**: 🛠️ Admin Institusi, 👨‍🏫 Guru, 🎓 Siswa, 👨‍👩‍👧 Wali
- **Fungsi Utama**:
  - Menghasilkan lembar Kartu Hasil Studi (KHS) / Rapor semester resmi.
  - Menghitung Indeks Prestasi Semester (IPS), Indeks Prestasi Kumulatif (IPK), peringkat kelas, dan catatan deskripsi sikap siswa.

---

## 9. Komunikasi & Manajemen Berkas (Communication & Files)

### 9.1 Pengumuman Publik Institusi (Announcements)
- **Endpoint API**: `GET /announcements`, `POST /announcements`, `PATCH /announcements/:id`, `DELETE /announcements/:id`
- **Hak Akses**: 🛠️ Admin Institusi (Pembuat), Semua Civitas (Pembaca)
- **Fungsi Utama**:
  - Membagikan surat edaran, libur sekolah, atau informasi umum kepada seluruh warga institusi.

### 9.2 Pengumuman Khusus Kelas (Class Announcements)
- **Endpoint API**: `GET /class-announcements`, `POST /class-announcements`, `PATCH /class-announcements/:id`
- **Hak Akses**: 👨‍🏫 Guru Kelas, 🎓 Siswa di Kelas Tersebut
- **Fungsi Utama**:
  - Sarana interaksi pengumuman spesifik untuk anggota rombel kelas tertentu (misal: perubahan ruangan, instruksi tugas mendesak).

### 9.3 Notifikasi Sistem (Notifications)
- **Endpoint API**: `GET /notifications`, `PATCH /notifications/:id/read`
- **Hak Akses**: Semua Pengguna Terautentikasi
- **Fungsi Utama**:
  - Mengirim pemberitahuan *real-time* ke akun pengguna saat ada tugas baru, nilai telah diunggah, absensi terisi, atau pengumuman masuk.

### 9.4 Manajemen Berkas Unggahan (Files Storage)
- **Endpoint API**: `POST /files/upload`, `GET /files/:id`
- **Hak Akses**: Semua Pengguna Terautentikasi
- **Fungsi Utama**:
  - Mengelola penyimpanan dokumen, gambar, avatar profil, materi bahan ajar, dan lampiran tugas dengan aman di server.

---

## 📊 Matriks Ringkasan Hak Akses (Matrix Overview)

| Kategori Modul | Fitur / Entitas | Superadmin | Admin Institusi | Guru | Siswa | Wali |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **Keamanan & Akun** | Autentikasi (`/auth`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Profil Mandiri (`/profile`) | ✅ | ✅ | ✅ | ✅ | ✅ |
| | Manajemen Akun (`/users`) | ✅ CRUD | ✅ CRUD | ❌ | ❌ | ❌ |
| | Peran & Izin (`/roles`, `/permissions`) | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |
| | Log Audit (`/activity-logs`) | ✅ Read | ✅ Read | ❌ | ❌ | ❌ |
| **Master Global** | Institusi (`/institutions`) | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |
| | Master Data Global (Agama, Kewarganegaraan, dll.) | ✅ CRUD | ❌ | ❌ | ❌ | ❌ |
| **Akademik Institusi** | Guru, Siswa, Wali | ❌ | ✅ CRUD | ❌ | ❌ | ❌ |
| | Tahun Ajaran & Semester | ❌ | ✅ CRUD | ❌ | ❌ | ❌ |
| | Skala Nilai (`/grades`) | ❌ | ✅ CRUD | ✅ Read | ✅ Read | ✅ Read |
| | Kelas, Mapel, Jadwal | ❌ | ✅ CRUD | ✅ Read | ✅ Read | ❌ |
| **KBM & LMS** | Presensi Kehadiran | ❌ | ✅ Rekap | ✅ Input | ✅ Read | ✅ Read |
| | Jurnal Mengajar | ❌ | ✅ Read | ✅ Input | ❌ | ❌ |
| | Modul & Materi LMS | ❌ | ✅ Read | ✅ Kelola | ✅ Read | ❌ |
| | Tugas & Pengumpulan | ❌ | ✅ Read | ✅ Kelola | ✅ Kerjakan | ❌ |
| **Evaluasi** | Ujian & Nilai Ujian | ❌ | ✅ Read | ✅ Kelola | ✅ Kerjakan | ❌ |
| | Nilai Akhir & Rapor (KHS) | ❌ | ✅ Terbitkan | ✅ Input | ✅ Read | ✅ Read |
| **Komunikasi** | Pengumuman & Notifikasi | ❌ | ✅ Buat | ✅ Buat | ✅ Read | ✅ Read |

---
*Dokumen ini diperbarui secara otomatis untuk mencerminkan status implementasi arsitektur monorepo backend (NestJS) dan frontend (React Vite).*
