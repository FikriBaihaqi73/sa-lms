@echo off
:: ------------------------------------------------------------
:: setup.bat – Persiapan repository, hak akses, instalasi, dan dev server
:: Jalankan file ini dengan hak Administrator (klik kanan → Run as administrator)
:: ------------------------------------------------------------

rem ==== 1. Ambil kepemilikan dan beri hak penuh pada seluruh repo ====
takeown /F . /R /D Y
set "USER=%USERNAME%"
icacls . /grant "%USER%:(F)" /T

rem ==== 2. Hapus node_modules yang korup ==== 
if exist node_modules rmdir /s /q node_modules

rem ==== 3. Hapus file .npmrc yang bermasalah (opsional) ====
if exist "%USERPROFILE%\.npmrc" del "%USERPROFILE%\.npmrc"

rem ==== 4. Instal dependensi dengan pnpm (offline bila cache tersedia) ====
rem Bypass kebijakan eksekusi PowerShell untuk sesi ini
powershell -NoProfile -ExecutionPolicy Bypass -Command "pnpm.cmd install"

rem ==== 5. Build TypeScript (pastikan tsc tersedia) ====
pnpm.cmd exec tsc -b

rem ==== 6. Jalankan server development (dev) ====
pnpm.cmd dev

echo.
echo Setup selesai. Jika ada error, lihat output di atas.
pause