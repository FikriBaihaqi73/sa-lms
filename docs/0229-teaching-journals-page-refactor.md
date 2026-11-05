# Refaktor Halaman Jurnal Mengajar (Teaching Journals Page)

## 1. Ringkasan Fitur
Halaman **Jurnal Mengajar** (`/teaching-journals`) diperuntukkan bagi **Admin Institusi** dan **Guru** untuk memantau serta mencatat aktivitas pelaksanaan kegiatan belajar mengajar (KBM) pada setiap pertemuan kelas. Data jurnal mengajar mengaitkan:
- **Jadwal Pelajaran (`schedules`)**: Menghubungkan kelas, mata pelajaran, guru pengampu, hari, jam pelaksanaan, dan ruang kelas.
- **Pertemuan Ke- (`meeting_number`)**: Nomor urut pertemuan pembelajaran.
- **Tanggal Pembelajaran (`journal_date`)**: Tanggal pelaksanaan sesi pembelajaran.
- **Topik Pembelajaran (`topic`)**: Judul bahasan utama materi ajar.
- **Rincian Materi (`material`)**: Uraian sub-materi, pembahasan konsep, atau latihan yang disampaikan di kelas.
- **Catatan & Evaluasi (`notes`)**: Catatan kendala, evaluasi kelas, keaktifan siswa, atau penugasan.
- **Pencatat (`created_by` / `createdBy`)**: Referensi pengguna yang mencatat jurnal.

Antarmuka telah direfaktorisasi penuh menggunakan gaya tema Gelap (Dark Mode) modern 1:1 yang seragam dengan halaman Ruang Kelas (`/settings/classrooms`), lengkap dengan 4 kartu statistik, filter bar debounced, tabel komprehensif, modal dialog form Tambah/Ubah, dialog detail baca lengkap, dan dialog konfirmasi hapus.

---

## 2. Struktur Modul Modular Frontend (`apps/web/src/features/teaching-journals/`)

Struktur flat lama telah direfaktor menjadi arsitektur modular standar proyek:
```text
apps/web/src/features/teaching-journals/
├── api/
│   └── index.ts                          # Wrapper HTTP request via apiFetch (GET list, GET by ID, POST, PATCH, DELETE)
├── components/
│   ├── teaching-journal-stats.tsx         # 4 Kartu metrik ringkasan (Total Jurnal, Total Pertemuan, Guru Mengisi, Jadwal Terpantau)
│   ├── teaching-journal-filter.tsx        # Filter bar (Pencarian debounced, Dropdown Jadwal, Filter Tanggal, Reset)
│   ├── teaching-journal-table.tsx         # Tabel data jurnal dengan badge, status catatan, dan pagination
│   ├── teaching-journal-dialog.tsx        # Modal form tambah & ubah jurnal (React Hook Form + Zod)
│   ├── teaching-journal-detail-dialog.tsx # Modal detail lengkap untuk membaca materi & catatan tanpa terpotong
│   ├── teaching-journal-delete-dialog.tsx # Alert dialog konfirmasi hapus jurnal
│   └── teaching-journals-page.tsx         # Komponen utama halaman jurnal mengajar (orchestrator)
├── hooks/
│   └── index.ts                          # React Query hooks (useTeachingJournals, mutations, useSchedulesOptions)
├── schemas/
│   └── index.ts                          # Skema validasi Zod untuk form dan query filter
├── types/
│   └── index.ts                          # Strict TypeScript interfaces (tanpa any)
└── index.ts                              # Barrel export untuk seluruh komponen, hooks, api, dan types
```

---

## 3. Spesifikasi Endpoint API Backend

Semua request membutuhkan header otentikasi:
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
```

### A. Daftar Endpoint

| Method | Endpoint | Deskripsi | Query / Body |
|---|---|---|---|
| `GET` | `/teaching-journals` | Mengambil daftar jurnal (paginated, scoped) | `page`, `limit`, `search`, `schedule_id`, `journal_date` |
| `GET` | `/teaching-journals/:id` | Mengambil detail satu jurnal mengajar | Param `id` (UUID) |
| `POST` | `/teaching-journals` | Membuat jurnal mengajar baru | Body JSON DTO |
| `PATCH` | `/teaching-journals/:id` | Memperbarui jurnal mengajar | Param `id` (UUID) + Body JSON DTO |
| `DELETE` | `/teaching-journals/:id` | Menghapus jurnal mengajar (soft delete) | Param `id` (UUID) |
| `GET` | `/schedules` | Opsi dropdown jadwal pelajaran institusi | `page=1&limit=100` |

---

## 4. Contoh Request & Response

### A. GET `/teaching-journals`
#### Query Params
```http
GET /teaching-journals?page=1&limit=10&search=Aljabar&schedule_id=12345678-1234-1234-1234-123456789abc HTTP/1.1
Host: api.example.com
Authorization: Bearer <TOKEN>
```

#### Response Sukses (200 OK)
```json
{
  "status": "success",
  "code": 200,
  "message": "Teaching journals retrieved successfully",
  "data": [
    {
      "id": "j1820b12-99ab-4455-88cc-112233445566",
      "schedule_id": "12345678-1234-1234-1234-123456789abc",
      "meeting_number": 1,
      "journal_date": "2026-01-02T00:00:00.000Z",
      "topic": "Pengenalan Aljabar Linear",
      "material": "Pembahasan konsep variabel, koefisien, dan persamaan linier satu variabel.",
      "notes": "Siswa sangat antusias, tugas latihan halaman 24 dikumpulkan minggu depan.",
      "created_at": "2026-01-02T09:30:00.000Z",
      "updated_at": "2026-01-02T09:30:00.000Z",
      "schedule": {
        "id": "12345678-1234-1234-1234-123456789abc",
        "day": "Senin",
        "startTime": "07:30",
        "endTime": "09:00",
        "classroom": {
          "id": "c1",
          "roomCode": "LAB-01",
          "roomName": "Lab Komputer 1"
        },
        "classSubject": {
          "id": "cs1",
          "class": {
            "id": "cls1",
            "name": "X RPL 1"
          },
          "subject": {
            "id": "s1",
            "name": "Matematika",
            "code": "MTK-01"
          },
          "teacher": {
            "id": "t1",
            "teacher_number": "GUR-001",
            "profile": {
              "id": "p1",
              "fullName": "Budi Santoso, M.Pd"
            }
          }
        }
      },
      "createdBy": {
        "id": "u1",
        "email": "budi@school.sch.id",
        "profile": {
          "fullName": "Budi Santoso, M.Pd"
        }
      }
    }
  ],
  "meta": {
    "currentPage": 1,
    "perPage": 10,
    "totalData": 1,
    "totalPages": 1
  }
}
```

### B. POST `/teaching-journals`
#### Request Body
```json
{
  "schedule_id": "12345678-1234-1234-1234-123456789abc",
  "meeting_number": 2,
  "journal_date": "2026-01-09T00:00:00.000Z",
  "topic": "Sistem Persamaan Linier Dua Variabel",
  "material": "Metode eliminasi dan substitusi dalam SPLDV.",
  "notes": "Sebagian siswa memerlukan latihan tambahan pada metode eliminasi."
}
```

---

## 5. Navigasi & Hak Akses
- **Path Route**: `/teaching-journals`
- **File Route**: `apps/web/src/routes/_settings/teaching-journals/index.tsx`
- **Sidebar**: Terdaftar di bawah menu grup kategori **AKTIVITAS AKADEMIK** pada `apps/web/src/components/app-sidebar.tsx`:
  ```tsx
  {hasExplicitAdminRole && <NavItem to="/teaching-journals" icon={BookOpenCheck} label="Jurnal Mengajar" />}
  ```
- **Guard Route**: Terdaftar dalam `INSTITUTION_ADMIN_ONLY_PREFIXES` di `apps/web/src/routes/__root.tsx`.

---

## 6. Verifikasi & Pengujian
- Unit test suite (`apps/web/src/features/teaching-journals/TeachingJournalsPage.spec.tsx`, `api.spec.ts`, `access-contract.spec.ts`) lulus 100% (10 passed tests).
- Build package `@repo/web` (`tsc -b && vite build`) lulus dengan **Zero Errors / Zero Warnings**.
- Linter Biome pada kode terkait lulus tanpa error (`biome check` exit code 0).

