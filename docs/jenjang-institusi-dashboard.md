# Dashboard Jenjang Institusi

Halaman Superadmin tersedia di `/jenjang-institusi`. Halaman ini saat ini memakai data contoh di sisi klien untuk menyajikan rancangan dan alur interaksi sebelum API jenjang institusi disambungkan.

## Interaksi yang tersedia

- Pencarian berdasarkan kode atau nama jenjang.
- Filter `Semua status`, `Aktif`, dan `Nonaktif`.
- Toggle untuk mengaktifkan atau menonaktifkan jenjang.
- Drawer `Tambah jenjang` dengan validasi kode unik, tanpa spasi, nama wajib, serta jumlah tingkat antara 1–99.
- Jenjang dengan institusi terdaftar hanya dapat diubah/dinonaktifkan; tombol hapus hanya muncul untuk jenjang tanpa institusi.

## Handoff API

Saat backend siap, data contoh perlu digantikan melalui client API terpusat di `src/lib/api.ts` dan hook TanStack Query di `features/institution-levels`. Bentuk data yang dibutuhkan:

```json
{
  "code": "SMA",
  "name": "SMA / MA",
  "levels": 3,
  "institutions": 191,
  "active": true
}
```

Endpoint yang diharapkan untuk alur UI:

- `GET /institution-levels?search=&status=` untuk daftar dan filter.
- `POST /institution-levels` untuk menyimpan form drawer.
- `PATCH /institution-levels/:code` untuk ubah detail atau status.
- `DELETE /institution-levels/:code` hanya bila `institutions` bernilai `0`.

Respons sukses sebaiknya mengikuti format aplikasi: `{ "status", "message", "data", "code" }`. Untuk validasi form, tampilkan field dan pesan yang diterima dari API; kesalahan autentikasi atau otorisasi cukup ditampilkan sebagai pesan umum.
