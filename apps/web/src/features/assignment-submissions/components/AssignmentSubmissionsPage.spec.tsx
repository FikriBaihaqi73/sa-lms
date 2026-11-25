import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SubmissionPageState, SubmissionRow } from "../types";
import { AssignmentSubmissionsPage } from "./AssignmentSubmissionsPage";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

const mockRow: SubmissionRow = {
	studentId: "student-1",
	fullName: "Ahmad Fauzi",
	studentNumber: "202610001",
	submittedAt: "2026-11-10T09:14:00Z",
	status: "submitted",
	score: "90.00",
	feedback: "Pekerjaan sangat baik",
	graderName: "Guru Pengampu",
	gradedAt: "2026-11-10T12:00:00Z",
};

const mockReadyState: SubmissionPageState = {
	kind: "ready",
	years: [
		{ id: "year-1", name: "2026/2027 (Aktif)" },
		{ id: "year-2", name: "2027/2028" },
	],
	classes: [{ id: "class-1", yearId: "year-1", name: "X IPA 1" }],
	assignments: [
		{
			id: "task-1",
			classId: "class-1",
			title: "Persamaan Linear",
			rows: [
				mockRow,
				{
					studentId: "student-2",
					fullName: "Siti Aisyah",
					studentNumber: "202610002",
					submittedAt: "2026-11-10T10:27:00Z",
					status: "late",
					score: "85.00",
					feedback: "Terlambat mengumpulkan",
					graderName: "Guru Pengampu",
					gradedAt: "2026-11-10T13:00:00Z",
				},
				{
					studentId: "student-3",
					fullName: "Budi Santoso",
					studentNumber: "202610003",
					status: "missing",
					submittedAt: null,
					score: null,
					feedback: null,
					graderName: null,
					gradedAt: null,
				},
			],
		},
	],
};

function selectAcademicTask() {
	fireEvent.change(screen.getByLabelText("Tahun Akademik"), {
		target: { value: "year-1" },
	});
	fireEvent.change(screen.getByLabelText("Kelas"), {
		target: { value: "class-1" },
	});
	fireEvent.change(screen.getByLabelText("Tugas"), {
		target: { value: "task-1" },
	});
}

describe("AssignmentSubmissionsPage", () => {
	it("renders header and cards without making api calls in default state", () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		render(<AssignmentSubmissionsPage />);

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: /Pengumpulan Tugas Siswa/i,
			}),
		).toBeTruthy();
		expect(screen.getAllByRole("article")).toHaveLength(4);
		expect(screen.getByRole("status").textContent).toContain("belum tersedia");
		expect(fetchMock).not.toHaveBeenCalled();
		expect(screen.queryByText("Unduh Laporan")).toBeNull();
	});

	it.each(["loading", "error"] as const)("shows %s message cleanly", (kind) => {
		render(<AssignmentSubmissionsPage state={{ kind }} />);
		expect(screen.getAllByRole("article")).toHaveLength(4);
		expect(
			screen.getByRole(kind === "error" ? "alert" : "status"),
		).toBeTruthy();
	});

	it("filters by year, class, task, displays rows and opens detail modal", () => {
		render(<AssignmentSubmissionsPage state={mockReadyState} />);

		selectAcademicTask();

		expect(screen.getByText("Ahmad Fauzi")).toBeTruthy();
		expect(screen.getByText("Siti Aisyah")).toBeTruthy();
		expect(screen.getByText("Budi Santoso")).toBeTruthy();

		// Check 4 summary cards
		const cards = screen.getAllByRole("article");
		expect(cards[0].textContent).toContain("3");
		expect(cards[0].textContent).toContain("TOTAL SISWA");
		expect(cards[1].textContent).toContain("2");
		expect(cards[1].textContent).toContain("SUDAH MENGUMPULKAN");
		expect(cards[2].textContent).toContain("1");
		expect(cards[2].textContent).toContain("TERLAMBAT");
		expect(cards[3].textContent).toContain("1");
		expect(cards[3].textContent).toContain("BELUM MENGUMPULKAN");

		// Open Detail
		fireEvent.click(screen.getByLabelText("Detail Ahmad Fauzi"));
		expect(screen.getByText("Detail Pengumpulan")).toBeTruthy();
		expect(screen.getAllByText("Pekerjaan sangat baik").length).toBeGreaterThan(
			0,
		);

		// Close Detail using close button
		const closeButtons = screen.getAllByRole("button", { name: "Tutup" });
		fireEvent.click(closeButtons[0]);
		expect(screen.queryByText("Detail Pengumpulan")).toBeNull();
	});

	it("filters students by search input and resets properly", () => {
		render(<AssignmentSubmissionsPage state={mockReadyState} />);
		selectAcademicTask();

		const searchInput = screen.getByPlaceholderText("Cari nama siswa…");
		fireEvent.change(searchInput, { target: { value: "Aisyah" } });

		expect(screen.queryByText("Ahmad Fauzi")).toBeNull();
		expect(screen.getByText("Siti Aisyah")).toBeTruthy();

		// Reset
		fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
		expect(screen.getByText("Pilih tahun akademik")).toBeTruthy();
	});
});
