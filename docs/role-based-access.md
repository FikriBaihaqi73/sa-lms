# Role-Based Access Control (RBAC) & Navigation Architecture

## 1. Overview
Dokumen ini menjelaskan struktur hirarki peran (*role*) dan matriks navigasi sidebar aplikasi berdasarkan spesifikasi resmi.

---

## 2. Matriks Peran & Navigasi Sidebar

### 👑 SUPERADMIN — Pemilik Aplikasi
Superadmin mengelola platform secara keseluruhan dan institusi yang menggunakan aplikasi. Superadmin tidak mengelola kegiatan akademik harian masing-masing institusi.

- **System & Access**:
  - `roles` (`/roles`)
  - `permissions` (`/permissions`)
  - `role_permissions` (`/role-permissions`)
  - `users` (`/users`)
  - `activity_logs` (`/activity-logs`)
  - `settings` (`/settings`)
- **Master Data Global**:
  - `institution_levels` (`/jenjang-institusi`)
  - `religions` (`/religions`)
  - `nationalities` (`/nationalities`)
  - `academic_statuses` (`/academic-statuses`)
  - `employment_statuses` (`/employment-statuses`)
  - `specializations` (`/specialization-statuses`)
  - `attendance_statuses` (`/attendance-statuses`)
- **Institution Management**:
  - `institutions` (`/institutions`)

---

### 🛠️ ADMIN — Pengelola Institusi
Admin mengelola operasional harian institusi, pengguna (guru, siswa, wali), struktur akademik, nilai, serta materi pembelajaran.

- **User Management**:
  - `users` (`/users`)
  - `profiles` (`/profile`)
- **Academic Configuration**:
  - `grades` (`/grades`)
  - `academic_statuses` (`/academic-statuses`)
  - `employment_statuses` (`/employment-statuses`)
  - `attendance_statuses` (`/attendance-statuses`)
- **Sistem & Pengaturan**:
  - `activity_logs` (`/activity-logs`)
  - `settings` (`/settings`)

---

### 🎓 USER / SISWA / TEACHER
Akses disesuaikan dengan kebutuhan pengguna (melihat profil sendiri, materi, tugas, nilai, dan absensi).

- **My Profile**:
  - `profiles` (`/profile`)
- **Academic & Assessment**:
  - `grades` (`/grades`)

---

## 3. Implementasi Frontend

Struktur navigasi disajikan secara dinamis di [`apps/web/src/components/app-sidebar.tsx`](file:///c:/Users/T14s%20G1%20AMD%20R7%20VGA/.ms-ad/-sa-lms/apps/web/src/components/app-sidebar.tsx) sesuai peran aktif pengguna dari `AuthContext`.
