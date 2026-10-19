# Task 0206 — Redesign Generator Kode Referral pada Dialog Siswa

> Task: `0206-redesign-student-referral-code-generation`
> Branch: `0206-redesign-student-referral-code-generation`

Dokumen ini menjelaskan perubahan UI pada dialog **Tambah / Ubah Siswa** di modul Students (`apps/web`) terkait redesign fitur generator kode referral.

## Ringkasan Perubahan

- Dialog tetap memakai **pola modal terpusat** yang konsisten dengan dialog CRUD lain di project (`GuardianDialog`, `TeacherDialogForm`, `EditGradeDialog`): overlay `bg-slate-950/60 backdrop-blur-sm`, panel `rounded-2xl border border-slate-200 bg-white shadow-2xl`, header `px-6 py-4` + body `space-y-4 p-6` + footer `border-t pt-4`.
- Field Kode Referral dipisah ke **section/card khusus** ("Kode Referral") di dalam form, memakai pola card yang sudah dipakai project (`rounded-xl border border-slate-200`).
- Tombol "Salin" berubah menjadi **icon button** (ikon saja, `aria-label="Salin kode referral"`) yang menempel di kanan input kode, sesuai pola input + aksi ringkas; state tersalin ditandai dengan ikon centang hijau.
- Indikator status kedaluwarsa dirender sebagai **pill/badge** (`rounded-full px-2.5 py-0.5 text-xs font-semibold`), mengikuti pola badge yang dipakai di halaman status akademik, academic year, dan grades.
- Format kode tetap `REF-<tahun>-<6 karakter>` (tidak ada perubahan kontrak API).
- Tanggal kedaluwarsa otomatis diisi **30 hari** dari tanggal generate bila masih kosong.
- Indikator status kedaluwarsa ditampilkan realtime di bawah field tanggal.
- Tidak ada perubahan pada backend, API, autentikasi, maupun skema validasi.

## File yang Terlibat

| File | Perubahan |
|---|---|
| `apps/web/src/features/students/components/StudentDialog.tsx` | Redesign layout + section generator kode referral |
| `apps/web/src/features/students/utils/referralCode.ts` | *(baru)* helper generator kode referral & tanggal kedaluwarsa |
| `apps/web/src/features/students/utils/referralCode.spec.ts` | *(baru)* unit test helper referral |

## Endpoint (tidak berubah)

Tidak ada perubahan pada API. Dialog ini tetap memakai endpoint yang sudah ada:

| Method | URL | Keterangan |
|---|---|---|
| POST | `/students` | Membuat siswa baru (beserta `referralCode` & `referralExpiresAt` bila diisi) |
| PATCH | `/students/:id` | Memperbarui data siswa |

Body mengikuti `studentFormSchema`, lalu dinormalisasi oleh `StudentsPage.handleSave` sebelum dikirim (field kosong menjadi `null` atau dihilangkan):

```json
{
  "academicStatusId": "<uuid>",
  "studentNumber": "20260001",
  "departmentId": "<uuid>",
  "enrollmentYear": 2026,
  "referralCode": "REF-2026-A1B2C3",
  "referralExpiresAt": "2026-11-19"
}
```

Pada mode **create**, `profileId` ikut dikirim bila diisi. Pada mode **update**, `profileId` tidak dikirim.

## Aturan Validasi

Mengikuti `studentFormSchema` (`apps/web/src/features/students/schemas/studentSchema.ts`):

| Field | Aturan | Tipe di API |
|---|---|---|
| `profileId` | Opsional, UUID bila diisi | `string \| null` |
| `departmentId` | Opsional, UUID bila diisi | `string \| null` |
| `academicStatusId` | **Wajib**, UUID | `string` |
| `studentNumber` | **Wajib**, minimal 1 karakter (setelah `trim`) | `string` |
| `enrollmentYear` | Opsional, bilangan bulat | `number \| null` |
| `referralCode` | Opsional, maksimal 100 karakter (setelah `trim`) | `string \| null` |
| `referralExpiresAt` | Opsional, format `YYYY-MM-DD` (input `type="date"`) | `string \| null` |

> Field kosong (`""`) dinormalisasi oleh `StudentsPage.handleSave` sebelum dikirim: `referralCode`/`referralExpiresAt` menjadi `null`, sedangkan `departmentId`/`enrollmentYear`/`profileId` dihilangkan bila kosong.

## Response

Endpoint mengikuti format standar backend (`ResponseHelper.success`, `packages/shared/src/http/response.ts`) dengan bentuk `{ status, message, data, code, meta? }`:

```json
{
  "status": "success",
  "message": "Student successfully created",
  "data": {
    "id": "<uuid>",
    "studentNumber": "20260001",
    "academicStatusId": "<uuid>",
    "departmentId": "<uuid>",
    "enrollmentYear": 2026,
    "referralCode": "REF-2026-A1B2C3",
    "referralExpiresAt": "2026-11-19T00:00:00.000Z"
  },
  "code": 200
}
```

`referralExpiresAt` disimpan sebagai kolom tanggal dan dikembalikan sebagai ISO-8601 string, sedangkan form web mengirim format `YYYY-MM-DD` (backend menerima keduanya pada `CreateStudentSchema.referralExpiresAt`).

Error validasi Zod (`ZodValidationPipe`) — `message` berisi `"Validation failed"` dan `errors` berisi daftar issue Zod (`path` + `message`):

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": [
    { "path": ["referralExpiresAt"], "message": "Format tanggal harus YYYY-MM-DD" }
  ],
  "code": 400
}
```

Error konflik (misal NIM atau profil sudah terdaftar) menghasilkan HTTP `409` dengan pesan `"Nomor Induk Siswa sudah terdaftar"` / `"Profil pengguna ini sudah terdaftar sebagai siswa"`.

Di sisi web, error API dilempar sebagai `ApiError` (`apps/web/src/lib/api.ts`) yang membawa `fieldErrors` per-field, lalu ditampilkan sebagai banner notifikasi oleh `StudentsPage`.

## Perilaku Frontend

1. **Generate** — klik "Buat kode"/"Buat ulang" menghasilkan kode acak 6 karakter dari alfabet tanpa karakter ambigu (`I`, `O`, `0`, `1`): `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`. Toast sukses "Kode referral baru dibuat.".
2. **Expire default** — bila field tanggal masih kosong saat kode dibuat, tanggal diisi otomatis `today + 30 hari` (format `YYYY-MM-DD`).
3. **Copy** — tombol ikon "Salin" menulis kode ke clipboard; ikon berubah menjadi centang hijau (`Check`) selama 2 detik lalu kembali ke ikon salin. Kegagalan clipboard menampilkan toast error "Gagal menyalin kode referral. Salin manual dari kolom kode.".
4. **Status kedaluwarsa** — kode dianggap kedaluwarsa setelah **pukul 23:59:59 pada tanggal kedaluwarsa**. Field kosong = tidak pernah kedaluwarsa. Status ditampilkan realtime sebagai pill/badge: hijau "Berlaku sampai <tanggal>" / merah "Kode referral sudah kedaluwarsa".
5. **Edit** — saat membuka dialog Ubah, kode & tanggal yang sudah ada ditampilkan apa adanya (tidak di-regenerate otomatis).
6. **Submit** — tombol submit memakai `isSaving` untuk men-disable seluruh input saat request berjalan, dan menampilkan "Menyimpan...". Judul tombol menyesuaikan mode: "Tambah Siswa" / "Simpan Perubahan".

### Ringkasan Field pada Dialog

| Field | Label UI | Kontrol |
|---|---|---|
| `studentNumber` | Nomor Siswa * | `Input` text |
| `academicStatusId` | Status Akademik * | `Select` (dari `useAcademicStatuses`) |
| `departmentId` | Jurusan | `Select` (dari `useStudentDepartments`), default "Tanpa jurusan" |
| `enrollmentYear` | Tahun Masuk | `Input` type `number` (`valueAsNumber`) |
| `referralCode` | Kode Referral | `Input` monospace + icon button Salin |
| `referralExpiresAt` | Tanggal Expired Referral | `Input` type `date` + pill status kedaluwarsa |

## Contoh Penggunaan di Frontend

Dialog ini dipakai di `apps/web/src/features/students/components/StudentsPage.tsx`:

```tsx
import { useAcademicStatuses } from "@/features/academic-statuses/hooks/useAcademicStatuses";
import { StudentDialog } from "@/features/students/components/StudentDialog";
import {
  useCreateStudent,
  useStudentDepartments,
  useStudents,
  useUpdateStudent,
} from "@/features/students/hooks/useStudents";

const studentsQuery = useStudents({ page: currentPage, limit, search });
const departmentsQuery = useStudentDepartments();
const academicStatusesQuery = useAcademicStatuses();
const createMutation = useCreateStudent();
const updateMutation = useUpdateStudent();

const departments = departmentsQuery.data?.data ?? [];
const academicStatuses = academicStatusesQuery.data ?? [];

<StudentDialog
  open={isDialogOpen}
  student={editingStudent}
  departments={departments}
  academicStatuses={academicStatuses}
  isSaving={createMutation.isPending || updateMutation.isPending}
  onClose={() => {
    setIsDialogOpen(false);
    setEditingStudent(null);
  }}
  onSave={handleSave}
/>;
```

> Catatan: `StudentDialog` **belum** diekspor dari `features/students/index.ts` (hanya `StudentsPage` dan types yang diekspor). Import langsung dari path komponen bila dipakai di luar `StudentsPage`.

## Catatan Teknis

- Helper referral berada di `apps/web/src/features/students/utils/referralCode.ts`:
  - `generateReferralSegment(length = 6, random = secureRandom)` → segment acak tanpa karakter ambigu.
  - `generateReferralCode(now = new Date(), random = secureRandom)` → `REF-<year>-<segment>`.
  - `defaultReferralExpiry(now = new Date())` → `YYYY-MM-DD` (30 hari ke depan).
  - `isReferralExpired(expiresAt?, now = new Date())` → `true` bila `expiresAt` < now (batas akhir hari `23:59:59`).
  - Randomness memakai `crypto.getRandomValues` bila tersedia, dengan fallback `Math.random()`.
- Unit test: `apps/web/src/features/students/utils/referralCode.spec.ts` (12 test, mencakup edge case random `0`/`1`, panjang segment, rollover bulan, dan batas kedaluwarsa).
- Tidak ada dependency baru; komponen `Button`, `Input`, `Label`, `Select` yang sudah ada digunakan kembali.
- Design system yang diikuti:
  - **Modal**: `fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm` + panel `max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl` (identik dengan `GuardianDialog`/`TeacherDialogForm`).
  - **Header**: ikon dalam `span grid size-10 place-items-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600`, judul `text-lg font-bold`, subjudul `text-xs text-slate-500`, tombol close `rounded-lg p-1.5 text-slate-500 hover:bg-slate-100`.
  - **Form**: `space-y-4 p-6`, field `space-y-2` + `Label text-sm font-semibold` + `Input className="h-11"`, pesan error `text-xs font-medium text-red-500`.
  - **Section referral**: `rounded-xl border border-slate-200 bg-slate-50 p-4` dengan header section berisi ikon `size-8 rounded-lg` + judul `text-sm font-bold`, lalu grid `grid gap-4 sm:grid-cols-2` yang sama dengan baris field form lain.
  - **Badge status**: `rounded-full px-2.5 py-0.5 text-xs font-semibold` (pola yang sama dengan badge di `AcademicStatusHeader`, `AcademicYearsPage`, `GradesPage`).
  - **Footer**: `flex justify-end gap-3 border-t border-slate-200 pt-4` + tombol Batal `variant="outline"` dan tombol simpan `bg-blue-700 ... hover:bg-blue-800` dengan spinner `Loader2` saat `isSaving`.
  - Tidak ada animasi, bottom sheet, drawer, atau komponen UI baru yang ditambahkan.
- `useWatch` (bukan `watch`) dipakai agar aman terhadap aturan React Compiler / ESLint `react-hooks/incompatible-library`.
- Toast memakai `sonner` (`toast.success` / `toast.error`).
- Dialog tetap dirender sebagai markup custom (`role="dialog"`, `aria-modal="true"`), bukan `Dialog` dari shadcn/ui — sama seperti dialog CRUD lain di project.
- Perubahan ini **hanya menyentuh frontend** — tidak ada perubahan pada `packages/shared` (schema/backend) maupun dependency.
