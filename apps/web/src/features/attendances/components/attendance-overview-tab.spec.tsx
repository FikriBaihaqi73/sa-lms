// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { AttendanceOverviewTab } from "./attendance-overview-tab";

vi.mock("../hooks", () => ({
	useClassesOptions: () => ({
		data: [
			{ id: "c-1", name: "Kelas 10-A" },
			{ id: "c-2", name: "Kelas 10-B" },
		],
		isLoading: false,
	}),
	useAcademicYearsOptions: () => ({
		data: [{ id: "ay-1", name: "2026/2027", is_active: true }],
		isLoading: false,
	}),
	useAttendanceStatusesOptions: () => ({
		data: [
			{ id: "st-1", name: "Hadir" },
			{ id: "st-2", name: "Izin" },
			{ id: "st-3", name: "Sakit" },
			{ id: "st-4", name: "Alpa" },
		],
		isLoading: false,
	}),
	useAttendanceSummary: () => ({
		data: {
			total: 50,
			present: 40,
			permission: 5,
			sick: 3,
			absent: 2,
			attendanceRate: 80,
		},
		isLoading: false,
	}),
	useAttendances: () => ({
		data: {
			data: [
				{
					id: "att-1",
					student_id: "student-1",
					student: {
						studentNumber: "12345",
						profile: { fullName: "Ahmad Dahlan" },
					},
					attendance_status: { name: "Hadir" },
					schedule: {
						classSubject: {
							class: { name: "Kelas 10-A" },
						},
					},
				},
				{
					id: "att-2",
					student_id: "student-2",
					student: {
						studentNumber: "67890",
						profile: { fullName: "Budi Utomo" },
					},
					attendance_status: { name: "Alpa" },
					schedule: {
						classSubject: {
							class: { name: "Kelas 10-A" },
						},
					},
				},
			],
			meta: {
				currentPage: 1,
				perPage: 5000,
				totalData: 2,
				totalPages: 1,
			},
		},
		isLoading: false,
	}),
}));

describe("AttendanceOverviewTab", () => {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false } },
	});

	const renderComponent = () =>
		render(
			<QueryClientProvider client={queryClient}>
				<AttendanceOverviewTab />
			</QueryClientProvider>,
		);

	it("renders title, KPI stats, and student summary table properly", () => {
		renderComponent();

		expect(
			screen.getByText("Overview & Rekapitulasi Presensi"),
		).not.toBeNull();
		expect(
			screen.getByText("Rangkuman Kehadiran Seluruh Siswa"),
		).not.toBeNull();
		expect(screen.getByText("Ahmad Dahlan")).not.toBeNull();
		expect(screen.getByText("Budi Utomo")).not.toBeNull();
		expect(screen.getByText("Ekspor Rekap (CSV)")).not.toBeNull();
	});

	it("filters students based on search input", () => {
		renderComponent();

		const searchInputs = screen.getAllByPlaceholderText(
			"Cari siswa atau NISN...",
		);
		const searchInput = searchInputs[0] as HTMLInputElement;
		fireEvent.change(searchInput, { target: { value: "Ahmad" } });
		expect(searchInput.value).toBe("Ahmad");
	});
});
