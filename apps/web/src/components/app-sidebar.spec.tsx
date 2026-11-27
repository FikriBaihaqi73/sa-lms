// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppSidebar } from "./app-sidebar";

const { authMock, locationMock } = vi.hoisted(() => ({
	authMock: vi.fn(),
	locationMock: vi.fn(() => ({ pathname: "/dashboard" })),
}));

vi.mock("@/features/auth/hooks/useAuth", () => ({ useAuth: authMock }));
vi.mock("@/components/ui/sky-toggle", () => ({
	SkyToggle: () => <button type="button">Theme</button>,
}));
vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		className,
		title,
	}: {
		children: ReactNode;
		to: string;
		className?: string;
		title?: string;
	}) => (
		<a href={to} className={className} title={title}>
			{children}
		</a>
	),
	useNavigate: () => vi.fn(),
	useLocation: locationMock,
}));

afterEach(cleanup);

beforeEach(() => {
	locationMock.mockReset();
	locationMock.mockReturnValue({ pathname: "/dashboard" });
});

function renderSidebar(role?: string) {
	authMock.mockReturnValue({
		user: { role, name: "Test User", email: "test@example.com" },
		logout: vi.fn(),
	});
	return render(<AppSidebar />);
}

describe("AppSidebar Admin Institusi grouping", () => {
	it(
		"renders the six grouped sections and all explicit-admin items",
		() => {
			renderSidebar("admin");

			for (const title of [
				"Manajemen Pengguna",
				"Struktur Akademik",
				"Pembelajaran",
				"Kehadiran",
				"Penilaian",
				"Sistem & Pengaturan",
			]) {
				expect(screen.getByRole("button", { name: title })).toBeTruthy();
				act(() => fireEvent.click(screen.getByRole("button", { name: title })));
			}

			for (const label of [
				"Data Pengguna",
				"Tambah Siswa",
				"Relasi Wali Siswa",
				"Guru",
				"Wali Murid",
				"Departemen",
				"Tahun Ajaran",
				"Peminatan & Keahlian",
				"Semester",
				"Ruang Kelas",
				"Kelas",
				"Mata Pelajaran",
				"Kelas Siswa",
				"Mata Pelajaran Kelas",
				"Prasyarat Mata Kuliah",
				"Jadwal Pelajaran",
				"Jurnal Mengajar",
				"Rencana Studi",
				"Modul & Konten Materi",
				"Tugas & Submisi",
				"Jenis Tugas",
				"Status Kehadiran",
				"Tambah Absensi",
				"Presensi & Absensi",
				"Standar Penilaian",
				"Ujian",
				"Nilai Siswa",
				"Nilai Ujian",
				"Rekap Nilai Siswa",
				"Pengumuman",
				"Log Aktivitas",
				"Pengaturan",
				"Profil Saya",
			]) {
				expect(
					screen.getAllByRole("link", { name: label }).length,
				).toBeGreaterThan(0);
			}
		},
		15000,
	);

	it("hides conditional groups and conditional items for a non-explicit admin", () => {
		renderSidebar();

		expect(screen.queryByRole("button", { name: "Kehadiran" })).toBeNull();
		expect(screen.getByRole("button", { name: "Penilaian" })).toBeTruthy();
		act(() =>
			fireEvent.click(screen.getByRole("button", { name: "Penilaian" })),
		);
		expect(
			screen.getByRole("link", { name: "Standar Penilaian" }),
		).toBeTruthy();
		expect(screen.queryByRole("link", { name: "Ujian" })).toBeNull();
	});

	it("does not add collapsible groups to unchanged non-admin blocks", () => {
		renderSidebar("superadmin");
		expect(screen.queryByRole("button", { name: "Kehadiran" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Sistem & Akses" })).toBeNull();

		cleanup();
		renderSidebar("student");
		expect(screen.queryByRole("button", { name: "Profil Saya" })).toBeNull();
		expect(
			screen.getAllByRole("link", { name: "Profil Saya" }).length,
		).toBeGreaterThan(0);
	});
});
