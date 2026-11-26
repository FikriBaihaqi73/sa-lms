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
import { useAttendanceSchedules } from "@/features/attendance-schedules/hooks";
import {
	deleteAttendance,
	getAcademicYearsOptions,
	getAttendanceStatusesOptions,
	getAttendances,
	getClassesOptions,
	updateAttendance,
} from "../api";
import type { Attendance } from "../types";
import { AttendanceListTab } from "./attendance-list-tab";

vi.mock("@/features/attendance-schedules/hooks", () => ({
	useAttendanceSchedules: vi.fn(),
}));

vi.mock("../api", () => ({
	getAttendances: vi.fn(),
	getAttendanceSummary: vi.fn(),
	getAttendanceById: vi.fn(),
	createAttendance: vi.fn(),
	upsertAttendance: vi.fn(),
	bulkUpsertAttendance: vi.fn(),
	updateAttendance: vi.fn(),
	deleteAttendance: vi.fn(),
	getClassesOptions: vi.fn(),
	getSchedulesOptions: vi.fn(),
	getAttendanceStatusesOptions: vi.fn(),
	getAcademicYearsOptions: vi.fn(),
	getClassStudentsOptions: vi.fn(),
}));

const mockRecords: Attendance[] = [
	{
		id: "att-1",
		schedule_id: "sch-1",
		attendance_schedule_id: "att-sched-1",
		student_id: "stu-1",
		attendance_status_id: "stat-hadir",
		attendance_date: "2026-11-11T00:00:00.000Z",
		notes: "Masuk tepat waktu",
		created_at: "2026-11-11T07:30:00.000Z",
		updated_at: "2026-11-11T07:30:00.000Z",
		attendance_status: {
			id: "stat-hadir",
			name: "Hadir",
			color: "#10B981",
			icon: "Check",
		},
		student: {
			id: "stu-1",
			studentNumber: "2026001",
			profile: {
				id: "prof-1",
				fullName: "Ahmad Dahlan",
			},
		},
		attendance_schedule: {
			id: "att-sched-1",
			title: "Matematika Wajib",
			scheduleType: "FROM_SCHEDULE",
			classId: "class-1",
			startTime: "07:30",
			endTime: "09:00",
			class: {
				id: "class-1",
				name: "X-IPA-1",
				grade_level: 10,
			},
		},
	},
	{
		id: "att-2",
		schedule_id: null,
		attendance_schedule_id: "att-sched-2",
		student_id: "stu-2",
		attendance_status_id: "stat-izin",
		attendance_date: "2026-11-10T00:00:00.000Z",
		notes: "Izin acara keluarga",
		created_at: "2026-11-10T08:00:00.000Z",
		updated_at: "2026-11-10T08:00:00.000Z",
		attendance_status: {
			id: "stat-izin",
			name: "Izin",
			color: "#3B82F6",
			icon: "Clock",
		},
		student: {
			id: "stu-2",
			studentNumber: "2026002",
			profile: {
				id: "prof-2",
				fullName: "Siti Aminah",
			},
		},
		attendance_schedule: {
			id: "att-sched-2",
			title: "Olahraga Pagi",
			scheduleType: "STANDALONE",
			classId: "class-1",
			startTime: "1970-01-01T06:30:00.000Z",
			endTime: "1970-01-01T07:15:00.000Z",
			class: {
				id: "class-1",
				name: "X-IPA-1",
				grade_level: 10,
			},
		},
	},
];

function renderTab() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});
	return render(
		<QueryClientProvider client={queryClient}>
			<AttendanceListTab />
		</QueryClientProvider>,
	);
}

describe("AttendanceListTab", () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(getAcademicYearsOptions).mockResolvedValue([
			{ id: "ay-1", name: "2026/2027", is_active: true },
		]);
		vi.mocked(getClassesOptions).mockResolvedValue([
			{
				id: "class-1",
				name: "X-IPA-1",
				grade_level: 10,
				academic_year_id: "ay-1",
			},
		]);
		vi.mocked(getAttendanceStatusesOptions).mockResolvedValue([
			{
				id: "stat-hadir",
				name: "Hadir",
				color: "#10B981",
				icon: "Check",
				typeCategory: "hadir",
			},
			{
				id: "stat-izin",
				name: "Izin",
				color: "#3B82F6",
				icon: "Clock",
				typeCategory: "izin",
			},
		]);
		vi.mocked(useAttendanceSchedules).mockReturnValue({
			data: {
				data: [
					{
						id: "att-sched-1",
						academicYearId: "ay-1",
						classId: "class-1",
						scheduleId: "sch-1",
						title: "Matematika Wajib",
						scheduleType: "FROM_SCHEDULE",
						activeDays: ["SENIN", "RABU"],
						specificDate: null,
						startTime: "07:30",
						endTime: "09:00",
						isActive: true,
						notes: null,
						createdAt: "2026-11-01T00:00:00.000Z",
						updatedAt: "2026-11-01T00:00:00.000Z",
					},
				],
				meta: { totalData: 1, totalPages: 1, currentPage: 1, perPage: 10 },
				stats: { total: 1, active: 1, inactive: 0, standalone: 0 },
			},
			isLoading: false,
			isError: false,
		} as unknown as ReturnType<typeof useAttendanceSchedules>);
		vi.mocked(getAttendances).mockResolvedValue({
			data: mockRecords,
			meta: {
				currentPage: 1,
				perPage: 20,
				totalData: 45,
				totalPages: 3,
			},
		});
	});

	afterEach(cleanup);

	it("renders header, chronological rows with dynamic status & schedule types, and pagination", async () => {
		renderTab();

		expect(screen.getByText("Daftar Presensi Siswa")).toBeTruthy();
		expect(screen.getByText("Ekspor Daftar")).toBeTruthy();

		expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();
		expect(await screen.findByText("Siti Aminah")).toBeTruthy();
		const expectedRealTime = new Intl.DateTimeFormat("id-ID", {
			hour: "2-digit",
			minute: "2-digit",
		}).format(new Date("2026-11-10T08:00:00.000Z"));
		expect(await screen.findByText(expectedRealTime)).toBeTruthy();
		expect(screen.queryByText("06:30 - 07:15")).toBeNull();
		expect(screen.queryByText(/1970-/)).toBeNull();
		expect(await screen.findByText("Dari Jadwal")).toBeTruthy();
		expect(await screen.findByText("Sesi Mandiri")).toBeTruthy();
		expect(await screen.findByText("Masuk tepat waktu")).toBeTruthy();
		expect(await screen.findByText("Izin acara keluarga")).toBeTruthy();
		expect(await screen.findByText(/Halaman 1 dari 3/i)).toBeTruthy();
	});

	it("applies filters and triggers pagination", async () => {
		renderTab();
		expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();

		// Change status filter
		const statusSelect = screen.getByLabelText("Filter Status Daftar");
		fireEvent.change(statusSelect, { target: { value: "stat-izin" } });

		await waitFor(() => {
			expect(getAttendances).toHaveBeenCalledWith(
				expect.objectContaining({
					attendance_status_id: "stat-izin",
					page: 1,
				}),
			);
		});

		// Click Next page
		const nextBtn = await screen.findByRole("button", { name: /Berikutnya/i });
		fireEvent.click(nextBtn);

		await waitFor(() => {
			expect(getAttendances).toHaveBeenCalledWith(
				expect.objectContaining({
					page: 2,
				}),
			);
		});
	});

	it("opens EditAttendanceRecordDialog and updates status and notes", async () => {
		vi.mocked(updateAttendance).mockResolvedValueOnce(
			mockRecords[0] as Attendance,
		);
		renderTab();
		expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();

		const editButtons = await screen.findAllByRole("button", { name: /Ubah/i });
		const firstEdit = editButtons[0];
		expect(firstEdit).toBeTruthy();
		if (firstEdit) fireEvent.click(firstEdit);

		expect(
			await screen.findByText("Ubah Status & Catatan Presensi"),
		).toBeTruthy();

		const izinBtn = await screen.findByRole("button", { name: /Izin/i });
		fireEvent.click(izinBtn);

		const notesInput = screen.getByLabelText("Catatan (Opsional)");
		fireEvent.change(notesInput, { target: { value: "Izin pulang awal" } });

		const saveBtn = screen.getByRole("button", { name: /Simpan Perubahan/i });
		fireEvent.click(saveBtn);

		await waitFor(() => {
			expect(updateAttendance).toHaveBeenCalledWith("att-1", {
				attendance_status_id: "stat-izin",
				notes: "Izin pulang awal",
			});
		});
	});

	it("opens AlertDialog and deletes an attendance record", async () => {
		vi.mocked(deleteAttendance).mockResolvedValueOnce(undefined);
		renderTab();
		expect(await screen.findByText("Ahmad Dahlan")).toBeTruthy();

		const deleteBtn = await screen.findByRole("button", {
			name: /Hapus presensi Ahmad Dahlan/i,
		});
		fireEvent.click(deleteBtn);

		expect(await screen.findByText("Hapus Catatan Presensi?")).toBeTruthy();
		const confirmBtn = screen.getByRole("button", { name: /Ya, Hapus/i });
		fireEvent.click(confirmBtn);

		await waitFor(() => {
			expect(deleteAttendance).toHaveBeenCalledWith("att-1");
		});
	});
});
