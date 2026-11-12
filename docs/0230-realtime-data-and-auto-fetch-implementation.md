# 0230 - Realtime Data & Auto-Fetch Implementation

## Overview
Fitur ini mengimplementasikan auto-fetching dan re-fetching data otomatis pada panel Admin setelah setiap operasi CRUD (Tambah, Ubah, Hapus) sukses dijalankan, sehingga tabel dan tampilan data selalu sinkron dengan database secara langsung tanpa mengharuskan pengguna memuat ulang (reload/F5) halaman browser.

## Key Changes & Architecture

### 1. TanStack Query Mutation & Invalidation Pattern
Setiap custom hook mutasi (`useCreate*`, `useUpdate*`, `useDelete*`) kini mengembalikan `Promise` invalidasi query pada callback `onSuccess`:
- Query keys yang sesuai di-invalidate (`queryClient.invalidateQueries(...)`).
- Komponen page memanggil `await refetch()` atau menunggu mutasi selesai sebelum menutup modal form atau dialog konfirmasi.
- Perubahan state langsung tercermin pada antarmuka admin seketika operasi selesai.

### 2. Modul yang Ditingkatkan

| Modul | Query Key Utama | Auto-Fetch Trigger |
| :--- | :--- | :--- |
| **Teachers** (`useTeachers`) | `['teachers']`, `['teachers', 'stats']`, `['teacher-profiles']` | Create, Update, Delete Teacher |
| **Classrooms** (`useClassroom`) | `['classrooms']` | Create, Update, Delete Classroom |
| **Employment Statuses** (`useEmploymentStatuses`) | `['employment-statuses']` | Create, Update, Delete Employment Status |
| **Attendances** (`useAttendances`) | `['attendances']`, `['attendances', 'summary']` | Create, Update, Delete Attendance |
| **Students** (`useStudents`) | `['students']`, `['student-profile-options']` | Create, Update, Delete Student |
| **Classes** (`useClasses`) | `['classes']` | Create, Update, Delete Class |
| **Subjects** (`useSubjects`) | `['subjects']` | Create, Update, Delete Subject |

### 3. API Endpoints Terkait
- `GET /profiles/teacher-options`: Mendapatkan kandidat guru scoped per institusi untuk dialog tambah/edit guru.
- `GET /teachers`, `POST /teachers`, `PATCH /teachers/:id`, `DELETE /teachers/:id`
- `GET /classroom`, `POST /classroom`, `PATCH /classroom/:id`, `DELETE /classroom/:id`
- `GET /employment-status`, `POST /employment-status`, `PATCH /employment-status/:id`, `DELETE /employment-status/:id`
- `GET /attendances`, `POST /attendances`, `PATCH /attendances/:id`, `DELETE /attendances/:id`
- `GET /students`, `POST /students`, `PATCH /students/:id`, `DELETE /students/:id`
- `GET /classes`, `POST /classes`, `PATCH /classes/:id`, `DELETE /classes/:id`
- `GET /subjects`, `POST /subjects`, `PATCH /subjects/:id`, `DELETE /subjects/:id`

## Frontend Implementation Details
- Handlers `handleCreate`, `handleUpdate`, `handleDelete` mengeksekusi mutasi dengan `await mutateAsync(...)`.
- Dialog ditutup setelah data berhasil disimpan dan query di-refetch (`await Promise.all([query.refetch(), ...])`).
- Error state dan toast notifikasi sukses ditampilkan langsung kepada pengguna.

