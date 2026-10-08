# Feature Implementation: Academic Years (Tahun Ajaran)

**Feature**: `0190- feat/0190-page-academic_year`
**Scope**: Frontend (`apps/web`), Backend Integration (`apps/api`), Shared Contracts (`@repo/shared`)
**Target Audience**: Frontend & Fullstack Developers, Admin & Superadmin LMS Platform

---

## 1. Overview
Halaman **Academic Years (Tahun Ajaran)** menyediakan antarmuka CRUD lengkap bagi **Admin institusi** dan **Superadmin** untuk mengelola tahun ajaran (contoh: `2023/2024`) beserta status aktif/nonaktifnya. Data ini menjadi referensi utama untuk kelas, jadwal, dan nilai.

Halaman dilindungi access guard di `src/routes/__root.tsx` (termasuk dalam `ADMIN_ACCESSIBLE_PREFIXES`, sehingga hanya `admin`/`superadmin` yang dapat mengakses) dan terdaftar pada route `/academic-years` di bawah layout Settings.

---

## 2. Architecture & Directory Structure

```
apps/web/src/
├── components/
│   └── ui/                                  # Komponen shadcn/ui (dipindahkan dari folder salah "@/")
│       ├── alert-dialog.tsx                 # Konfirmasi hapus (Radix Alert Dialog)
│       ├── button.tsx                       # Button + buttonVariants (cva)
│       ├── dialog.tsx                       # Modal tambah/edit (Radix Dialog)
│       ├── dropdown-menu.tsx                # Menu aksi baris tabel (Radix Dropdown Menu)
│       ├── form.tsx                         # Wrapper react-hook-form (Form/FormField/FormItem/…)
│       └── switch.tsx                       # Toggle status aktif (Radix Switch)
├── features/
│   └── academic-years/
│       ├── api/
│       │   └── academic-years.ts            # Centralized API fetcher (apiFetch)
│       ├── components/
│       │   ├── AcademicYearDialog.tsx       # Modal tambah & edit tahun ajaran
│       │   ├── AcademicYearsFilterBar.tsx   # Card pencarian + filter status & tahun
│       │   ├── AcademicYearsPage.tsx        # Container halaman: header, stats, filter, tabel
│       │   ├── AcademicYearsStats.tsx       # 4 kartu statistik (total/aktif/nonaktif/recent)
│       │   ├── AcademicYearsTable.tsx       # Tabel data + footer count + dropdown aksi Edit/Hapus
│       │   └── DeleteAcademicYearDialog.tsx # Konfirmasi hapus (AlertDialog)
│       ├── hooks/
│       │   └── useAcademicYears.ts          # TanStack Query hooks + toast (sonner)
│       ├── schemas/
│       │   └── academicYearSchema.ts        # Zod form validation schema
│       └── types.ts                         # TypeScript interfaces
├── routes/
│   └── _settings/
│       └── academic-years/
│           └── index.tsx                    # Route definition (/academic-years)
└── main.tsx                                 # Mount <Toaster/> sonner (global)
```

---

## 3. Backend Endpoints (API Integration)

Semua permintaan HTTP melalui wrapper `apiFetch` dari `@/lib/api` dengan header otomatis:
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

Bentuk response mengikuti `ResponseHelper`: `{ "status", "message", "data", "code" }`.

### 1) Get All Academic Years
- **Method**: `GET`
- **URL**: `/academic-years`
- **Response Success (200 OK)**:
```json
{
  "status": "success",
  "message": "Academic years retrieved successfully",
  "data": [
    {
      "id": "e4b9533c-3837-4d4d-a77c-743db5bc6ce1",
      "academic_year": "2023/2024",
      "is_active": true,
      "institution_id": null,
      "created_at": "2026-10-07T02:00:00.000Z",
      "updated_at": "2026-10-07T02:00:00.000Z"
    }
  ],
  "code": 200
}
```

### 2) Get Academic Year by ID
- **Method**: `GET`
- **URL**: `/academic-years/:id`
- **Response Success (200 OK)**: objek tunggal pada `data`.
- **Error (404)**: `Academic year not found`.

### 3) Create Academic Year
- **Method**: `POST`
- **URL**: `/academic-years`
- **Request Body**:
```json
{
  "academic_year": "2026/2027",
  "is_active": false
}
```
- **Response Success (201)**: objek academic year terbaru pada `data`.
- **Validation (400)**: `academic_year` wajib string minimal 1 karakter; `is_active` opsional boolean (default `false` di backend).
- **Conflict (409)**: `Academic year already exists` (duplikat).

### 4) Update Academic Year
- **Method**: `PATCH`
- **URL**: `/academic-years/:id`
- **Request Body** (kedua field opsional — PATCH sebagian):
```json
{
  "academic_year": "2026/2028",
  "is_active": true
}
```
- **Response Success (200)**: objek hasil update pada `data`.
- **Error (404)**: `Academic year not found`.
- **Conflict (409)**: `Academic year is already in use by another academic year`.

### 5) Delete Academic Year
- **Method**: `DELETE`
- **URL**: `/academic-years/:id`
- **Response Success (200)**:
```json
{
  "status": "success",
  "message": "Academic year deleted successfully",
  "data": { "success": true, "id": "e4b9533c-3837-4d4d-a77c-743db5bc6ce1" },
  "code": 200
}
```

---

## 4. Frontend Implementation Flow

1. **Route load** → `/academic-years` me-render `AcademicYearsPage` dengan layout identik halaman Grades: `<main>` berlatar slate + container `max-w-7xl`, header badge "Portal Akademik", judul, dan tombol **Add Academic Year** di kanan.
2. **Data fetching** → `useAcademicYears()` (TanStack Query, `queryKey: ["academic-years"]`) memanggil `GET /academic-years` via `apiFetch`.
3. **Statistik** → `AcademicYearsStats` menampilkan 4 kartu (Total, Aktif, Tidak Aktif, Ditambahkan 30 Hari Terakhir) yang dihitung dari **data terfilter**; saat loading nilai `"..."`.
4. **Filter & pencarian (client-side)** → `AcademicYearsFilterBar` berisi:
   - input pencarian (`Cari tahun ajaran...`, cocokkan sebagian pada `academic_year`, case-insensitive),
   - select **Status** (`Semua Status` / `Aktif` / `Tidak Aktif`),
   - select **Tahun** (`Semua Tahun` + daftar distinct tahun dari data, diurutkan mengebal).
   State difilter lewat `useMemo` di Page lalu di-pass sebagai `rows` ke tabel.
5. **Render tabel** → `AcademicYearsTable` (card `rounded-xl`, thead uppercase, loading/empty sebagai row inline sehingga card tetap tampil, footer "Menampilkan X dari Y data."). Kolom: *Tahun Ajaran*, *Status* (pill Aktif/Tidak Aktif), *Aksi*.
6. **Menu aksi** → `DropdownMenuTrigger` (tombol ikon `MoreHorizontal`) membuka `DropdownMenu` berisi **Edit** dan **Hapus**; state dialog di-*hold* di Page.
7. **Create/Edit** → `AcademicYearDialog` menggunakan `react-hook-form` + `zodResolver(academicYearSchema)` dengan komponen `Form/FormField/FormItem/FormLabel/FormControl/FormMessage` dan `Switch` untuk `is_active`.
8. **Delete** → `DeleteAcademicYearDialog` (`AlertDialog`) memunculkan konfirmasi; tombol Delete memanggil `DELETE /academic-years/:id` dan menutup modal pada `onSuccess`.
9. **Notifikasi** → setiap mutasi memanggil `toast.success(...)` / `toast.error(...)` dari **sonner**. `<Toaster richColors position="top-right" />` di-mount secara global di `src/main.tsx` — pastikan komponen ini tetap ada, jika tidak toast tidak akan tampil.
10. **Cache invalidation** → pada success, `queryClient.invalidateQueries({ queryKey: ["academic-years"] })` sehingga tabel re-fetch otomatis.

> **Catatan**: script generator `create-academic-years-frontend.js` (sekali pakai, pernah berada di root repo) sudah **dihapus** — file fitur sudah dibuat langsung dan script tersebut berisiko menimpa perubahan manual bila dijalankan ulang.

---

## 5. UI Components (shadcn/ui) — Catatan Perbaikan Path

Komponen berikut sempat ter-generate ke folder salah (`apps/web/@/components/ui/` akibat path Windows dengan backslash) dan telah **dipindahkan** ke `apps/web/src/components/ui/`:

| File | Ekspor Utama | Dependensi |
|---|---|---|
| `dropdown-menu.tsx` | `DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, …` | `@radix-ui/react-dropdown-menu` |
| `dialog.tsx` | `Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, …` | `@radix-ui/react-dialog` |
| `alert-dialog.tsx` | `AlertDialog, AlertDialogContent, AlertDialogAction, AlertDialogCancel, …` | `@radix-ui/react-alert-dialog` + `buttonVariants` dari `button.tsx` |
| `button.tsx` | `Button, buttonVariants` (cva) | `class-variance-authority`, `@radix-ui/react-slot` |
| `form.tsx` *(baru)* | `Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription` | `react-hook-form` |
| `switch.tsx` *(baru)* | `Switch` (`checked`, `onCheckedChange`) | `@radix-ui/react-switch` |

**Path alias**: `@/*` diarahkan ke `./src/*` oleh `tsconfig.app.json` (untuk TypeScript) dan `vite.config.ts` (untuk bundler). Import selalu ditulis `@/components/ui/...`, bukan path relatif/ber-backslash.

**Token tema Tailwind v4**: `src/index.css` mendeklarasikan blok `@theme inline` yang memetakan variabel HSL (`--background`, `--primary`, `--popover`, dll.) ke token warna (`--color-background`, …). Tanpa blok ini, utility seperti `bg-background`, `bg-popover`, `text-muted-foreground` **tidak akan ter-generate** dan komponen menjadi transparan.

---

## 6. Validation Rules (Frontend)

Zod schema (`schemas/academicYearSchema.ts`):
```ts
z.object({
  academic_year: z.string().min(1, "Academic year is required"),
  is_active: z.boolean(),
})
```
- `academic_year`: wajib, tidak boleh kosong. Contoh format: `2023/2024`.
- `is_active`: wajib boolean di sisi form (default selalu diisi `false` oleh `defaultValues` form — bukan oleh `.default()` schema, agar tipe input = output dan kompatibel dengan `zodResolver`).
- Error validasi ditampilkan per-field melalui `<FormMessage />` (pesan merah `text-destructive`).
- **Error validasi backend (400)**: `apiFetch` (`src/lib/api.ts`) kini melempar `ApiError` yang membawa `fieldErrors: { field, message }[]` (di-parse dari `errors: [{ path, message }]` hasil nestez-zod). `AcademicYearDialog` memetakannya ke `form.setError(field, { type: "server", message })`, sehingga pesan backend tampil langsung di bawah field yang bersangkutan — bukan hanya toast generik "Validation failed". Toast dari hook tetap fire (react-query v5 memanggil callback hook-level **dan** per-call).

---

## 7. Edge Cases & Error Handling

| Kasus | Perilaku |
|---|---|
| Data masih loading | Tabel diganti panel `Loading...` |
| Data kosong | Pesan `No academic years found. Add one to get started.` |
| Create/Edit sukses | Toast sukses + dialog tertutup + tabel re-fetch |
| Backend 409 (duplikat) | Toast error menampilkan pesan dari response |
| Backend 400 (validasi zod, mis. `academic_year` kosong) | `ApiError.fieldErrors` dipetakan ke `form.setError` → pesan merah muncul per-field via `<FormMessage />`, plus toast generik dari hook |
| Backend 404 (id tidak ada) | Toast error `Academic year not found` |
| Delete berjalan (isPending) | Tombol Cancel/Delete disabled, label berubah `Deleting...` |
| Submit ganda | Tombol Save disabled selama `isPending` |
| `academicYear` null pada dialog edit/hapus | `DeleteAcademicYearDialog` merender `null`; dialog edit mereset form ke nilai default |

---

## 8. Checklist untuk Developer Frontend

- [ ] Pastikan `<Toaster />` (sonner) tetap di-mount di `src/main.tsx`.
- [ ] Pastikan `sonner`, `class-variance-authority`, `@radix-ui/react-switch`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-alert-dialog` terpasang di `apps/web/package.json`.
- [ ] Jangan membuat folder komponen di luar `src/` — shadcn CLI selalu dijalankan dari `apps/web` dengan `components.json` (`aliases.ui = @/components/ui`).
- [ ] Verifikasi build: `pnpm --filter @repo/web build` (tsc + vite) harus lulus.
