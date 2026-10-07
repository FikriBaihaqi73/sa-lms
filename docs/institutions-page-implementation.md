# Institutions Page — Backend Integration

## Ringkasan
Halaman `/institutions` sebelumnya 100% mock (data statis, tombol mati).
Sekarang tersambung penuh ke backend (`GET/POST/PATCH/DELETE /institutions`
+ `GET /institution-levels`) mengikuti pola `nationalities/`.

Perubahan sesuai permintaan:
1. Tombol **Impor Massal** (header) dihapus.
2. Tombol **Unduh CSV** + tombol settings (filter bar) dihapus.
3. Tombol **Tambah institusi** membuka dialog modal terpusat dengan tombol
   **Batal** dan **Buat**.
4. Search + filter jenjang berfungsi; tabel + pagination memakai data nyata;
   4 kartu statistik dihitung dari data backend + efek hover.

## Endpoint yang dipakai

| Method | URL | Keterangan |
|---|---|---|
| `GET` | `/institutions?page=1&limit=10&search=` | List + pagination + search by `name` |
| `POST` | `/institutions` | Create (wajib `name` + `institutionLevelId` UUID) |
| `PATCH` | `/institutions/:id` | Update partial |
| `DELETE` | `/institutions/:id` | Soft-delete |
| `GET` | `/institution-levels` | Dropdown jenjang (filter + form) |

Semua request via `apiFetch` (`apps/web/src/lib/api.ts`) — base URL dari
`VITE_API_URL`, token dari `localStorage (access_token/token)`.

### Contoh response list
```json
{
  "status": "success",
  "code": 200,
  "message": "Institutions retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "institutionLevelId": "uuid",
      "name": "SMA Negeri 1 Surabaya",
      "shortName": "SMAN 1 SBY",
      "city": "Surabaya",
      "province": "Jawa Timur",
      "phoneNumber": "031-123456",
      "email": "info@sman1.sch.id",
      "website": "https://sman1.sch.id",
      "createdAt": "2026-10-01T00:00:00.000Z",
      "updatedAt": "2026-10-01T00:00:00.000Z",
      "institutionLevel": { "id": "uuid", "name": "SMA" }
    }
  ],
  "meta": { "totalData": 1, "totalPages": 1, "currentPage": 1, "perPage": 10 }
}
```

### Contoh create
```json
POST /institutions
{ "institutionLevelId": "uuid-dari-/institution-levels", "name": "SMK Baru", "city": "Surabaya" }
```

## File yang diubah/dibuat

- `features/institutions/types.ts` — tipe backend (`Institution`,
  `InstitutionLevel`, `PaginationMeta`, `ApiResponse`).
- `features/institutions/api/institutions.ts` (dulu `mockData.ts`) —
  `listInstitutionsApi`, `getInstitutionLevelsApi`,
  `create/update/deleteInstitutionApi`.
- `features/institutions/hooks/useInstitutions.ts` (baru) — React Query
  `useInstitutions` (debounce search 400ms di page), `useInstitutionLevels`,
  `useCreate/Update/DeleteInstitution` + invalidate.
- `features/institutions/schemas/institutionSchema.ts` (baru) — Zod form
  (`name` + `institutionLevelId` wajib, sisanya opsional).
- `components/InstitutionDialog.tsx` (baru) — modal tengah tambah/ubah,
  tombol Batal + Buat/Simpan Perubahan.
- `components/DeleteInstitutionDialog.tsx` (baru) — konfirmasi hapus.
- `components/InstitutionsPage.tsx` — state search/page/levelId/dialog,
  notice sukses/gagal, statistik dari data nyata.
- `components/InstitutionsFilterBar.tsx` — search controlled + dropdown
  "Semua Jenjang" + refresh. CSV/settings dihapus.
- `components/InstitutionsStats.tsx` — 4 kartu (Total Institusi, Total
  Jenjang, Kota Terjangkau, Baru Bulan Ini) + hover
  (`hover:-translate-y-0.5 hover:shadow-md`).
- `components/InstitutionsTable.tsx` — kolom Institusi/Jenjang/Lokasi &
  Telepon/Kontak/Aksi; Ubah/Hapus berfungsi; pagination dari `meta`;
  state loading/error/kosong.

## Perilaku frontend

1. Buka `/institutions` → `GET /institutions?page&limit` + `GET
   /institution-levels` paralel.
2. Ketik search → debounce 400ms → `GET /institutions?search=` (reset ke
   halaman 1).
3. Pilih jenjang → filter client-side pada halaman aktif (backend tidak
   punya filter level; search tetap server-side).
4. Klik Tambah institusi → dialog → isi Nama + Jenjang → Buat →
   `POST /institutions` → invalidate → tabel refresh + notice hijau.
5. Klik Ubah → dialog prefill → `PATCH /institutions/:id`.
6. Klik Hapus → konfirmasi → `DELETE /institutions/:id` → notice.
7. Pagination prev/next memakai `meta.currentPage/totalPages`.
8. Semua error API tampil sebagai notice merah / banner "Coba lagi".

## Catatan / batasan backend

- Search backend hanya mencocokkan `name` (`contains`, insensitive) —
  bukan kota/shortName.
- Tidak ada agregat statistik di backend; kartu dihitung dari halaman
  aktif (`cityCount`, `newThisMonth`) + `meta.totalData` + jumlah levels.
- Kolom lama (`code`, `type`, `package`, `users`, `courses`, `status`,
  trial/SLA) tidak ada di backend dan tidak ditampilkan lagi. Jika
  dibutuhkan, itu task backend terpisah (Prisma + migrasi).
- Field `address` ada di backend tetapi tidak dikirim dari form saat ini
  (form memakai city/province/phone/email/website); mudah ditambah bila
  perlu.

## Verifikasi

- `pnpm --filter @repo/web exec tsc --noEmit` → bersih.
- `pnpm --filter @repo/web exec biome check src/features/institutions`
  → `Checked 10 files`, no errors.
