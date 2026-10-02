# Pengaturan Superadmin

Halaman frontend tersedia di `/superadmin/settings`. Halaman ini adalah konsol konfigurasi lokal (belum melakukan request API) dengan light dan dark mode memakai tata letak yang sama.

## Interaksi saat ini

- Ganti tema menggunakan tombol matahari/bulan di kanan atas.
- Toggle memperbarui preview dan state formulir di browser.
- **Reset Perubahan** mengembalikan semua nilai ke placeholder awal.
- **Terapkan Konfigurasi** memvalidasi form lalu menampilkan status tersimpan secara lokal.

## Kontrak API yang diperlukan

Saat endpoint backend tersedia, integrasikan melalui `src/lib/api.ts`, bukan `fetch` langsung. Payload perlu memuat identitas platform/domain, aturan 2FA, onboarding tenant, dan pemeliharaan. Semua nilai teknis menggunakan string agar backend dapat menerapkan validasi spesifik infrastrukturnya.

Contoh respons sukses yang diharapkan:

```json
{
  "status": "success",
  "code": 200,
  "message": "Konfigurasi diterapkan",
  "data": {}
}
```
