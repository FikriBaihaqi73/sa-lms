# Implementasi Halaman Nilai Ujian (Examination Scores) - Admin Institusi

Dokumen ini merupakan panduan komprehensif bagi Frontend & Backend Developer mengenai fitur **Nilai Ujian (`Examination Scores`)** untuk peran **Admin Institusi**.

---

## 1. Ringkasan Fitur
Halaman **Nilai Ujian (`Examination Scores`)** dirancang sebagai pusat evaluasi akademik per kelas dan audit hasil ujian siswa terintegrasi dengan **Standar Penilaian (`Grades`)**.

### Fitur Utama:
1. **Top-Down Filtering Hierarkis**:
   - Filter 1: **Tahun Ajaran (`academic_year_id`)** - otomatis memilih Tahun Ajaran yang berstatus Aktif (`is_active: true`).
   - Filter 2: **Pilih Kelas (`class_id`)** - dinamis menyesuaikan daftar kelas yang terdaftar pada tahun ajaran aktif.
   - **Pencarian Siswa**: Cari instan berdasarkan Nama Siswa atau NIS/NIM.
   - **Filter Status Nilai**: `Semua Status`, `Sudah Dinilai`, `Belum Dinilai`.
2. **Horizontal Card Selector Ujian (`Examinations`)**:
   - Menampilkan kartu-kartu mata ujian pada kelas dan tahun ajaran terpilih.
   - Rincian kartu: Judul Ujian, Mata Pelajaran, Tanggal Pelaksanaan, Durasi, Skor Maksimum, dan rasio kelengkapan penilaian (`X/Y Dinilai`).
   - Kartu aktif memiliki border biru menyala dengan status "Aktif Dipilih".
3. **Konversi Predikat Nilai Dinamis (`resolveGradeFromScore`)**:
   - Menghubungkan skor numerik siswa langsung dengan data master dari endpoint `/grades`.
   - Tidak melakukan hardcode huruf mutu (A/B/C/D/E) sehingga kompatibel dengan standar penilaian institusi (misal: "Lulus Dengan Pujian", "Kompeten", "Remedial", atau skala angka).
   - Menampilkan badge predikat berwarna beserta deskripsi capaian pembelajaran sebagai tooltip.
4. **4 Kartu Ringkasan Statistik Kelas**:
   - **Peserta Dinilai**: `{jumlahSudahDinilai} / {totalSiswa}` dengan persentase kelengkapan.
   - **Rata-Rata Skor Kelas**: `{rataRata}` (format 2 desimal) beserta badge predikat capaian rata-rata.
   - **Skor Max & Min**: Capaian nilai tertinggi dan terendah di kelas.
   - **Belum Dinilai**: Jumlah siswa antre penilaian dengan indikator peringatan jika > 0.
5. **Modal Input / Koreksi Nilai (`ExaminationScoreDialog`)**:
   - Pemilihan siswa otomatis (terkunci jika diklik dari baris tabel) atau searchable select jika dibuka dari tombol header.
   - Input skor angka desimal (`step="0.01"`, `min="0"`, `max="100"`).
   - Tombol preset cepat (`100`, `90`, `85`, `75`).
   - **Live Grade Preview Box**: Real-time update predikat dan rentang standar penilaian saat mengetik skor.
   - Input catatan evaluasi penguji opsional.
6. **Modal Audit Metadata Penilaian (`ExaminationScoreAuditDialog`)**:
   - Menampilkan ID UUID record skor, judul ujian, nama & NIS siswa, nama penilai (`graded_by`), waktu penilaian (`graded_at`), waktu pembuatan/pembaruan, dan catatan lengkap.
7. **Ekspor Rekap Nilai CSV**:
   - Ekspor rekap nilai per ujian dan kelas ke format CSV UTF-8.

---

## 2. API Endpoints Terkait

### A. Mendapatkan Daftar Nilai per Ujian
- **Method & URL**: `GET /examination-scores/examination/:examinationId`
- **Headers**:
  ```http
  Authorization: Bearer <TOKEN>
  ```
- **Response Success (200 OK)**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Examination scores retrieved successfully",
    "data": [
      {
        "id": "e458514e-4f24-4fc6-b7ff-1533ad78a1bc",
        "examinationId": "7df41864-16d4-4f40-8f92-9571ff5d35c1",
        "studentId": "9c12b7a8-1ef9-40d1-a477-9ca25fa3d11b",
        "score": 92.50,
        "notes": "Penguasaan materi sangat baik",
        "gradedBy": "a021591c-1960-494b-a7eb-d1be8b7bdf8f",
        "gradedAt": "2026-11-18T09:00:00.000Z",
        "createdAt": "2026-11-18T09:00:00.000Z",
        "updatedAt": "2026-11-18T09:00:00.000Z",
        "grader": {
          "id": "a021591c-1960-494b-a7eb-d1be8b7bdf8f",
          "email": "teacher@school.ac.id",
          "profile": {
            "id": "90cf49ad-f0f4-436d-961b-9685746f3a74",
            "fullName": "Dosen / Guru Penguji"
          }
        },
        "student": {
          "id": "9c12b7a8-1ef9-40d1-a477-9ca25fa3d11b",
          "studentNumber": "STU-2026-001",
          "profile": {
            "id": "42aa881b-5b5c-449e-b9ef-60ff0ea318c2",
            "fullName": "Ahmad Pratama"
          }
        }
      }
    ]
  }
  ```

### B. Input Nilai Ujian Baru
- **Method & URL**: `POST /examination-scores`
- **Request Body**:
  ```json
  {
    "examinationId": "7df41864-16d4-4f40-8f92-9571ff5d35c1",
    "studentId": "9c12b7a8-1ef9-40d1-a477-9ca25fa3d11b",
    "score": 88.50,
    "notes": "Lulus ujian teori dan praktikum"
  }
  ```

### C. Koreksi Nilai Ujian (Update)
- **Method & URL**: `PUT /examination-scores/:id`
- **Request Body**:
  ```json
  {
    "score": 95.00,
    "notes": "Revisi penilaian setelah konfirmasi berkas tugas"
  }
  ```

### D. Standar Penilaian Acuan (`Grades`)
- **Method & URL**: `GET /grades`
- **Response Success (200 OK)**:
  ```json
  {
    "status": "success",
    "code": 200,
    "message": "Grades retrieved successfully",
    "data": [
      {
        "id": "grade-uuid-1",
        "grade": "A",
        "minimumScore": 85.00,
        "maximumScore": 100.00,
        "description": "Sangat Memuaskan"
      },
      {
        "id": "grade-uuid-2",
        "grade": "B",
        "minimumScore": 70.00,
        "maximumScore": 84.99,
        "description": "Baik"
      }
    ]
  }
  ```

---

## 3. Logika Konversi Dinamis (`resolveGradeFromScore`)
Frontend menggunakan fungsi pembantu berikut untuk memastikan predikat selalu sinkron dengan Standar Penilaian:
```typescript
export function resolveGradeFromScore(
  score: number | null | undefined,
  grades: StandardGrade[] = []
): GradeMatchResult {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return {
      grade: "-",
      description: null,
      scoreRangeText: "-",
      isMatched: false,
      colorBadge: {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-500 dark:text-slate-400",
        border: "border-slate-200 dark:border-slate-700",
      },
    };
  }

  const matched = grades.find((g) => {
    const min = g.minimumScore ?? 0;
    const max = g.maximumScore ?? 100;
    return score >= min && score <= max;
  });

  if (!matched) {
    return {
      grade: "Belum Terdefinisi",
      description: "Skor tidak berada dalam rentang standar penilaian yang terdaftar.",
      scoreRangeText: "-",
      isMatched: false,
      colorBadge: {
        bg: "bg-slate-100 dark:bg-slate-800",
        text: "text-slate-600 dark:text-slate-300",
        border: "border-slate-300 dark:border-slate-700",
      },
    };
  }

  return {
    grade: matched.grade,
    description: matched.description ?? null,
    scoreRangeText: `${matched.minimumScore ?? 0} - ${matched.maximumScore ?? 100}`,
    isMatched: true,
    colorBadge: /* badge color calculation */,
  };
}
```

---

## 4. Pengujian dan Verifikasi Mutu
- **Unit Testing**:
  - `apps/web/src/features/examination-scores/utils/grade-resolver.spec.ts`: 10 test lulus 100%.
  - `apps/web/src/features/examination-scores/components/ExaminationScoresPage.spec.tsx`: 8 test lulus 100%.
- **Linter & Code Quality**:
  - `npx @biomejs/biome check` lulus dengan **0 errors** dan **0 warnings**.
  - Strict TypeScript diaktifkan tanpa `any`.
- **Build Verification**:
  - `vite build` (`@repo/web`) berhasil tanpa error.
  - NestJS compiler (`@repo/api`) berhasil tanpa error.
