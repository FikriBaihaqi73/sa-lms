# 0203 — Restrict Guardian Creation: Require Student Selection

Pembuatan guardian oleh admin institusi sekarang wajib memilih student terlebih
dahulu. `POST /guardians` membuat row guardian dan relasi pada tabel
`student_guardians` dalam satu operasi atomik.

## Request

`POST /guardians` memerlukan bearer token dan role `admin`.

```json
{
  "studentId": "00000000-0000-4000-8000-000000000001",
  "fullName": "Budi Santoso",
  "relationship": "Ayah",
  "phoneNumber": "081234567890",
  "email": "budi@example.com"
}
```

`studentId` wajib berupa UUID. Service memastikan student aktif dan profile
student berada pada institusi milik admin yang login. ID yang kosong atau
formatnya invalid ditolak sebagai `400`; student yang tidak ada atau lintas
institusi ditolak sebagai `404 Student not found`.

Field guardian lain mengikuti aturan sebelumnya. `PATCH /guardians/:id` tidak
memerlukan `studentId`, sehingga update data guardian yang sudah ada tidak
berubah.

## Frontend flow

Pada mode tambah di `GuardianDialog`, tampilkan searchable select **Siswa** dan
ambil opsi dari `GET /student-guardians/options/students`. Endpoint tersebut
sudah scoped ke institusi admin. Form menampilkan `Siswa wajib dipilih.` bila
submit tanpa pilihan. Kirim `studentId` bersama field guardian ke
`POST /guardians`.

Mode ubah tetap hanya mengubah field guardian. Relasi student-guardian yang
dibuat saat create menggunakan mekanisme `StudentGuardian` yang sudah ada; tidak
ada skema atau relasi database baru.
