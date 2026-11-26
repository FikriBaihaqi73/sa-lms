# Attendance Schedules (`Jadwal Absensi / Tambah Absensi`) Implementation

Fitur **Jadwal Absensi (`AttendanceSchedules`)** memungkinkan Admin Institusi mengelola sesi absensi secara fleksibel untuk seluruh jenjang pendidikan (SD, SMP, SMA, hingga Kuliah) menggunakan pendekatan *hybrid*:
- **`FROM_SCHEDULE`**: Ditarik dari jadwal pelajaran yang sudah ada (`scheduleId` terisi).
- **`STANDALONE`**: Sesi mandiri tanpa `scheduleId` (misalnya absensi harian wali kelas SD/SMP atau kelas pengganti).

---

## 1. Endpoints API

Semua endpoint dilindungi `JwtAuthGuard` dan `RolesGuard` dengan hak akses `@Roles("admin")`, serta otomatis ter-scope sesuai institusi Admin yang login.

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/attendance-schedules` | Daftar jadwal absensi + filter + paginasi + ringkasan `stats` (`total`, `active`, `inactive`, `standalone`) |
| `GET` | `/attendance-schedules/:id` | Detail jadwal absensi |
| `POST` | `/attendance-schedules` | Tambah jadwal absensi baru (`FROM_SCHEDULE` atau `STANDALONE`) |
| `PATCH` | `/attendance-schedules/:id` | Edit penuh jadwal absensi |
| `PATCH` | `/attendance-schedules/:id/status` | Quick toggle status aktif/nonaktif (`{ isActive: boolean }`) |
| `PATCH` | `/attendance-schedules/:id/days` | Quick update hari aktif mingguan (`{ activeDays: string[] }`) |
| `DELETE` | `/attendance-schedules/:id` | Soft delete jadwal absensi |

---

## 2. Contoh Request & Response

### `POST /attendance-schedules`
```json
{
  "academicYearId": "11111111-1111-4111-8111-111111111111",
  "classId": "22222222-2222-4222-8222-222222222222",
  "scheduleType": "STANDALONE",
  "scheduleId": null,
  "title": "Absensi Harian Kelas 1A",
  "activeDays": ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"],
  "specificDate": null,
  "startTime": "07:00",
  "endTime": "08:00",
  "isActive": true,
  "notes": "Absensi pagi wali kelas"
}
```

### Response `201 Created`
```json
{
  "status": "success",
  "message": "Attendance schedule created successfully",
  "code": 201,
  "data": {
    "id": "44444444-4444-4444-8444-444444444444",
    "academicYearId": "11111111-1111-4111-8111-111111111111",
    "classId": "22222222-2222-4222-8222-222222222222",
    "scheduleId": null,
    "title": "Absensi Harian Kelas 1A",
    "scheduleType": "STANDALONE",
    "activeDays": ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"],
    "specificDate": null,
    "startTime": "1970-01-01T07:00:00.000Z",
    "endTime": "1970-01-01T08:00:00.000Z",
    "isActive": true,
    "notes": "Absensi pagi wali kelas"
  }
}
```

---

## 3. Validasi & Edge Cases

- Jika `scheduleType === "FROM_SCHEDULE"`, `scheduleId` wajib diisi dan harus berasal dari kelas yang sama (`classId`).
- `classId` harus terdaftar dalam `academicYearId` yang dipilih dan berada di institusi Admin.
- Jika `startTime` dan `endTime` keduanya diisi, `endTime` harus lebih besar dari `startTime`.
- Enum `activeDays` hanya menerima nilai `SENIN`, `SELASA`, `RABU`, `KAMIS`, `JUMAT`, `SABTU`, `MINGGU`.
