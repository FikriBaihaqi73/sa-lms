# Implementasi Halaman Rencana Studi (Study Plans / KRS) - Admin Institusi

## 1. Ringkasan Fitur
Halaman **Rencana Studi (KRS)** (`/settings/study-plans`) diperuntukkan bagi **Admin Institusi** untuk mengelola pengambilan mata pelajaran kelas oleh siswa pada setiap tahun ajaran aktif di institusi. Setiap data rencana studi merepresentasikan kartu rencana studi (KRS) siswa yang menghubungkan:
- **Siswa / Mahasiswa (`students`)**: Berdasarkan data siswa institusi, lengkap dengan NIS/NIM/Email dan nama pengguna.
- **Mata Pelajaran Kelas (`class_subjects`)**: Mengaitkan kelas rombel, mata pelajaran, kode mapel, serta guru/dosen pengampu.
- **Tahun Ajaran (`academic_years`)**: Periode akademik aktif saat siswa mengambil mata pelajaran tersebut.

Tampilan antarmuka mengikuti standar tema Gelap (Dark Mode) modern yang konsisten 1:1 dengan halaman Ruang Kelas (`/settings/classrooms`), lengkap dengan 4 kartu statistik ringkasan, pencarian debounced, filter tahun ajaran dan kelas/mapel, tabel data komprehensif, modal form dialog (Create/Edit), dan dialog konfirmasi penghapusan.

---

## 2. Navigasi, Routing, dan Kontrol Akses (Role-Based Access)

### A. Frontend Route
- **Path**: `/settings/study-plans`
- **File Route**: `apps/web/src/routes/_settings/study-plans/index.tsx`
- **Parent Layout**: `settingsRoute` (`apps/web/src/routes/settingsLayout.tsx`)
- **Pendaftaran Router**: `apps/web/src/router.tsx`

### B. Proteksi Route Guard
- Didaftarkan ke dalam `INSTITUTION_ADMIN_ONLY_PREFIXES` di `apps/web/src/routes/__root.tsx`.
- Hanya pengguna dengan peran **Admin Institusi** (`admin`) yang dapat mengakses halaman ini. Peran non-admin atau Superadmin yang membuka path ini akan diarahkan ke layar `AccessDenied (403 — Akses ditolak)`.

### C. Sidebar Menu
- Ditambahkan ke dalam grup navigasi **`KONFIGURASI AKADEMIK`** di `apps/web/src/components/app-sidebar.tsx`:
  ```tsx
  <NavItem
    to="/settings/study-plans"
    icon={ClipboardList}
    label="Rencana Studi"
  />
  ```
- Indikator status aktif menyala ketika URL berada pada `/settings/study-plans`.

---

## 3. Spesifikasi Endpoint API Backend

Seluruh endpoint memerlukan header otentikasi JWT:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### A. Ringkasan Endpoint

| Method | Endpoint | Deskripsi | Query Parameters / Body |
|---|---|---|---|
| `GET` | `/study-plans` | Mengambil daftar rencana studi (paginated) | `page`, `limit`, `search`, `academic_year_id`, `class_subject_id`, `student_id` |
| `GET` | `/study-plans/:id` | Mengambil detail satu rencana studi | Param `id` (UUID) |
| `POST` | `/study-plans` | Mendaftarkan rencana studi baru | Body: `student_id`, `class_subject_id`, `academic_year_id` |
| `PATCH` | `/study-plans/:id` | Memperbarui rencana studi | Body: `student_id`, `class_subject_id`, `academic_year_id` |
| `DELETE` | `/study-plans/:id` | Menghapus rencana studi (soft delete) | Param `id` (UUID) |
| `GET` | `/students` | Opsi dropdown data siswa | `page=1&limit=100` |
| `GET` | `/class-subjects` | Opsi dropdown mata pelajaran kelas | `page=1&limit=100` |
| `GET` | `/academic-years` | Opsi dropdown tahun ajaran | `page=1&limit=100` |

---

## 4. Struktur Request & Response

### A. GET `/study-plans` (List & Filter)

#### Request Query
```http
GET /study-plans?page=1&limit=10&search=Budi&academic_year_id=0912f2c9-6617-48f8-b3fa-c2579dfd942f HTTP/1.1
Host: api.example.com
Authorization: Bearer <TOKEN>
```

#### Response Sukses (200 OK)
```json
{
  "status": "success",
  "code": 200,
  "message": "Study plans retrieved successfully",
  "data": [
    {
      "id": "180b5e28-1b6c-482a-bc97-5db1ae91d21b",
      "student_id": "b3e0d8ca-78c6-43ad-8d96-03f39ee4c356",
      "class_subject_id": "c1f7375a-a384-46c5-aee0-bc7e02df595b",
      "academic_year_id": "0912f2c9-6617-48f8-b3fa-c2579dfd942f",
      "created_at": "2026-11-04T08:30:00.000Z",
      "updated_at": "2026-11-04T08:30:00.000Z",
      "student": {
        "id": "b3e0d8ca-78c6-43ad-8d96-03f39ee4c356",
        "student_number": "NIS-2026-001",
        "user": {
          "id": "u182390a-1122-3344-5566-778899aabbcc",
          "name": "Budi Santoso",
          "email": "budi.santoso@sekolah.sch.id"
        },
        "profile": {
          "id": "p89123aa-3344-5566-7788-99aabbccdde0",
          "full_name": "Budi Santoso",
          "gender": "male"
        }
      },
      "classSubject": {
        "id": "c1f7375a-a384-46c5-aee0-bc7e02df595b",
        "class_id": "class-uuid-001",
        "subject_id": "subj-uuid-001",
        "teacher_id": "teach-uuid-001",
        "class": {
          "id": "class-uuid-001",
          "name": "X IPA 1"
        },
        "subject": {
          "id": "subj-uuid-001",
          "name": "Matematika Peminatan",
          "code": "MTH-01"
        },
        "teacher": {
          "id": "teach-uuid-001",
          "user": {
            "name": "Dr. Hendra Gunawan"
          },
          "profile": {
            "full_name": "Dr. Hendra Gunawan"
          }
        }
      },
      "academicYear": {
        "id": "0912f2c9-6617-48f8-b3fa-c2579dfd942f",
        "name": "2025/2026 Ganjil",
        "is_active": true
      }
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1
  }
}
```

### B. POST `/study-plans` (Tambah Rencana Studi)

#### Request Body
```json
{
  "student_id": "b3e0d8ca-78c6-43ad-8d96-03f39ee4c356",
  "class_subject_id": "c1f7375a-a384-46c5-aee0-bc7e02df595b",
  "academic_year_id": "0912f2c9-6617-48f8-b3fa-c2579dfd942f"
}
```

#### Response Sukses (201 Created)
```json
{
  "status": "success",
  "code": 201,
  "message": "Study plan created successfully",
  "data": {
    "id": "180b5e28-1b6c-482a-bc97-5db1ae91d21b",
    "student_id": "b3e0d8ca-78c6-43ad-8d96-03f39ee4c356",
    "class_subject_id": "c1f7375a-a384-46c5-aee0-bc7e02df595b",
    "academic_year_id": "0912f2c9-6617-48f8-b3fa-c2579dfd942f"
  }
}
```

#### Response Konflik / Duplikasi (409 Conflict)
```json
{
  "status": "error",
  "code": 409,
  "message": "Siswa ini sudah terdaftar pada mata pelajaran kelas dan tahun ajaran tersebut."
}
```

---

## 5. Arsitektur Modul Frontend (`apps/web/src/features/study-plans`)

Modul dibangun dengan prinsip segregasi tanggung jawab yang ketat:
```text
apps/web/src/features/study-plans/
├── api/
│   └── index.ts                 # Pemanggilan HTTP terpusat via apiFetch
├── hooks/
│   └── index.ts                 # React Query hooks, invalidasi cache & data options
├── schemas/
│   └── index.ts                 # Zod validation schema untuk form
├── types/
│   └── index.ts                 # TypeScript interfaces (Strict, tanpa any)
├── components/
│   ├── StudyPlansHeader.tsx     # Header dengan badge kategori dan CTA Button
│   ├── StudyPlansStats.tsx      # 4 Summary cards (Total, Siswa, Mapel, TA)
│   ├── StudyPlansFilterBar.tsx  # Input pencarian debounced dan filter dropdown
│   ├── StudyPlansTable.tsx      # Tabel dark mode, badge kode mapel, format pengajar & aksi
│   ├── StudyPlanDialog.tsx      # Modal Form Tambah/Ubah dengan auto-fill TA
│   ├── DeleteStudyPlanDialog.tsx# Dialog konfirmasi penghapusan data
│   └── StudyPlansPage.tsx       # Komponen halaman utama (orchestrator)
└── index.ts                     # Barrel export
```

---

## 6. Validasi & Penanganan Kasus Khusus (Edge Cases)

1. **Unique Constraint Duplikasi Siswa**:
   - Backend memiliki constraint `@@unique([student_id, class_subject_id, academic_year_id])`.
   - Form dialog dan mutation handler menangkap respon error duplikasi dan menampilkan pesan ramah: *"Siswa ini sudah terdaftar pada mata pelajaran kelas dan tahun ajaran tersebut."*
2. **Auto-select Tahun Ajaran**:
   - Ketika admin memilih Mata Pelajaran Kelas (`ClassSubject`) yang telah terafiliasi dengan tahun ajaran tertentu, form dialog secara otomatis mengisi field Tahun Ajaran (`academic_year_id`) agar mempercepat proses penginputan.
3. **Pencarian Real-time Aman (Debouncing)**:
   - Pencarian siswa atau mata pelajaran menggunakan hook `useDebounce` (500ms) untuk mencegah *rate limiting* dan lonjakan request berlebih ke server backend.
4. **Respon Kosong (Empty State)**:
   - Apabila belum ada data atau filter tidak menghasilkan kecocokan, tabel menampilkan ilustrasi empty state dengan tombol pintas *"Tambah Rencana Studi Sekarang"*.
5. **Strict TypeScript & Zero Linter Warning**:
   - Seluruh payload memiliki tipe eksplisit tanpa menggunakan tipe `any`.
   - Telah lulus build produksi `tsc -b && vite build`.

