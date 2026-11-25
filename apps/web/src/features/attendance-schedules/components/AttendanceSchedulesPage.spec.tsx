// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import * as apiModule from "../api/attendance-schedules";
import { AttendanceSchedulesPage } from "./AttendanceSchedulesPage";

if (typeof globalThis.ResizeObserver === "undefined") {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	};
}

vi.mock("../api/attendance-schedules", () => ({
	getAttendanceSchedules: vi.fn(),
	createAttendanceSchedule: vi.fn(),
	updateAttendanceSchedule: vi.fn(),
	toggleAttendanceScheduleStatus: vi.fn(),
	updateAttendanceScheduleDays: vi.fn(),
	deleteAttendanceSchedule: vi.fn(),
	getAcademicYearsForAttendanceSchedules: vi.fn(),
	getClassesForAttendanceSchedules: vi.fn(),
	getSchedulesForAttendanceSchedules: vi.fn(),
}));

const mockYears = [
	{
		id: "11111111-1111-4111-8111-111111111111",
		academic_year: "2026/2027",
		is_active: true,
	},
];

const mockClasses = [
	{
		id: "22222222-2222-4222-8222-222222222222",
		name: "Kelas 1A",
		grade_level: 1,
		academic_year_id: "11111111-1111-4111-8111-111111111111",
	},
];

const mockSchedules = [
	{
		id: "33333333-3333-4333-8333-333333333333",
		day: "Senin",
		startTime: "1970-01-01T07:30:00.000Z",
		endTime: "1970-01-01T09:00:00.000Z",
		classroom: { id: "room-1", roomName: "Ruang A", roomCode: "R-A" },
		classSubject: {
			id: "cs-1",
			classId: "22222222-2222-4222-8222-222222222222",
			class: { id: "22222222-2222-4222-8222-222222222222", name: "Kelas 1A" },
			subject: { id: "sub-1", name: "Matematika", code: "MTK" },
		},
	},
];

const mockRows = [
	{
		id: "44444444-4444-4444-8444-444444444444",
		academicYearId: "11111111-1111-4111-8111-111111111111",
		classId: "22222222-2222-4222-8222-222222222222",
		scheduleId: null,
		title: "Absensi Harian Kelas 1A",
		scheduleType: "STANDALONE" as const,
		activeDays: ["SENIN", "SELASA", "RABU"] as const,
		specificDate: null,
		startTime: "1970-01-01T07:00:00.000Z",
		endTime: "1970-01-01T08:00:00.000Z",
		isActive: true,
		notes: "Gerbang pagi",
		createdAt: "2026-11-25T00:00:00.000Z",
		updatedAt: "2026-11-25T00:00:00.000Z",
		academicYear: mockYears[0],
		class: mockClasses[0],
		schedule: null,
	},
];

function renderPage() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<AttendanceSchedulesPage />
		</QueryClientProvider>,
	);
}

describe("AttendanceSchedulesPage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(
			apiModule.getAcademicYearsForAttendanceSchedules,
		).mockResolvedValue(mockYears);
		vi.mocked(apiModule.getClassesForAttendanceSchedules).mockResolvedValue(
			mockClasses,
		);
		vi.mocked(apiModule.getSchedulesForAttendanceSchedules).mockResolvedValue(
			mockSchedules,
		);
		vi.mocked(apiModule.getAttendanceSchedules).mockResolvedValue({
			data: mockRows.map((r) => ({ ...r, activeDays: [...r.activeDays] })),
			meta: {
				totalData: 1,
				totalPages: 1,
				currentPage: 1,
				perPage: 20,
			},
			stats: {
				total: 1,
				active: 1,
				inactive: 0,
				standalone: 1,
			},
		});
		vi.mocked(apiModule.updateAttendanceScheduleDays).mockResolvedValue({
			...mockRows[0],
			activeDays: ["SENIN", "SELASA", "RABU", "KAMIS"],
		});
		vi.mocked(apiModule.toggleAttendanceScheduleStatus).mockResolvedValue({
			...mockRows[0],
			isActive: false,
		});
		vi.mocked(apiModule.createAttendanceSchedule).mockResolvedValue({
			...mockRows[0],
			id: "55555555-5555-4555-8555-555555555555",
			title: "Sesi Sore",
		});
	});

	afterEach(() => {
		cleanup();
	});

	it("renders header, stats cards, and attendance schedule rows", async () => {
		renderPage();

		expect(screen.getByText("Kelola & Tambah Jadwal Absensi")).toBeTruthy();

		await waitFor(() => {
			expect(screen.getByText("Absensi Harian Kelas 1A")).toBeTruthy();
		});
		expect(screen.getByText("07:00 – 08:00")).toBeTruthy();
		expect(screen.getByText("Total Jadwal Absensi")).toBeTruthy();
	});

	it("toggles active day pill directly from the table", async () => {
		renderPage();

		await waitFor(() => {
			expect(screen.getByText("Absensi Harian Kelas 1A")).toBeTruthy();
		});

		const thursdayBtn = screen.getByRole("button", {
			name: "Kam untuk Absensi Harian Kelas 1A",
		});
		fireEvent.click(thursdayBtn);

		await waitFor(() => {
			expect(apiModule.updateAttendanceScheduleDays).toHaveBeenCalledWith(
				"44444444-4444-4444-8444-444444444444",
				["SENIN", "SELASA", "RABU", "KAMIS"],
			);
		});
	});

	it("toggles schedule active status switch directly from the table", async () => {
		renderPage();

		await waitFor(() => {
			expect(screen.getByText("Absensi Harian Kelas 1A")).toBeTruthy();
		});

		const statusSwitch = screen.getByRole("switch", {
			name: "Status aktif Absensi Harian Kelas 1A",
		});
		fireEvent.click(statusSwitch);

		await waitFor(() => {
			expect(apiModule.toggleAttendanceScheduleStatus).toHaveBeenCalledWith(
				"44444444-4444-4444-8444-444444444444",
				false,
			);
		});
	});

	it("opens create modal and submits a new STANDALONE schedule", async () => {
		renderPage();

		await waitFor(() => {
			expect(screen.getByText("Absensi Harian Kelas 1A")).toBeTruthy();
		});

		fireEvent.click(
			screen.getByRole("button", { name: /Tambah Jadwal Absensi/i }),
		);

		await waitFor(() => {
			expect(screen.getByText("Tambah Jadwal Absensi Baru")).toBeTruthy();
		});

		const titleInput = screen.getByPlaceholderText(
			"Contoh: Absensi Harian Kelas 1A",
		);
		fireEvent.change(titleInput, { target: { value: "Sesi Sore" } });

		fireEvent.click(screen.getByRole("button", { name: "Simpan Jadwal" }));

		await waitFor(() => {
			expect(apiModule.createAttendanceSchedule).toHaveBeenCalledWith(
				expect.objectContaining({
					title: "Sesi Sore",
					scheduleType: "STANDALONE",
					isActive: true,
				}),
			);
		});
	});
});
