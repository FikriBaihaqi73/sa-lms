# TASK 0210 - Relocate Specialization Feature from Superadmin to Admin Institusi

## Summary
- **Backend**: `SpecializationController` diberi `@Roles("admin")` pada level controller. Token `superadmin`, `teacher`, `student`, `guardian` menerima **403 Forbidden**.
- **Frontend**: menu "Peminatan & Keahlian" pindah ke section **Konfigurasi Akademik** (Admin), route `/specializations` dan `/specialization-statuses` masuk `INSTITUTION_ADMIN_ONLY_PREFIXES` (Superadmin menerima halaman 403).
- **Data**: fitur tetap master data global (tanpa scoping institusi), sesuai pola yang ada.

## Endpoints
- `GET /specializations`
- `GET /specializations/:id`
- `POST /specializations`
- `PATCH /specializations/:id`
- `DELETE /specializations/:id`

## Access
- Backend: `admin` only.
- Frontend: Admin Institusi only; Superadmin melihat `AccessDenied (403)`.