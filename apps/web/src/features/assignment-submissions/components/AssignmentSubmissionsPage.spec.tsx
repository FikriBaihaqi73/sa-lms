import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SubmissionRow } from "../types";
import { AssignmentSubmissionsPage } from "./AssignmentSubmissionsPage";

const mockSubmittedRows: SubmissionRow[] = [
	{
		id: "sub-1",
		studentId: "stu-1",
		fullName: "Ahmad Fauzi",
		studentNumber: "202610001",
		className: "X IPA 1",
		assignmentId: "asg-1",
		assignmentTitle: "Latihan Persamaan & Pertidaksamaan Linear",
		subjectName: "Matematika Wajib",
		fileName: "jawaban-persamaan-linear-ahmad.pdf",
		fileUrl: null,
		answerText:
			"Lampiran penyelesaian soal nomor 1 sampai 10 menggunakan metode eliminasi dan substitusi beserta grafik himpunan penyelesaian.",
		submittedAt: "2026-11-24T09:15:00.000Z",
		status: "submitted",
		score: 92,
		maxScore: 100,
		feedback: "Langkah pengerjaan sangat sistematis dan jawaban tepat.",
		graderName: "Ustadz Hendra, S.Pd.",
		gradedAt: "2026-11-24T13:30:00.000Z",
	},
	{
		id: "sub-2",
		studentId: "stu-2",
		fullName: "Siti Aisyah",
		studentNumber: "202610002",
		className: "X IPA 1",
		assignmentId: "asg-2",
		assignmentTitle: "Implementasi Endpoint CRUD REST API",
		subjectName: "Web Developer",
		fileName: "crud-rest-api-siti.zip",
		fileUrl: null,
		answerText:
			"Project API lengkap dengan validasi skema Zod, controller NestJS, serta dokumentasi pengujian endpoint.",
		submittedAt: "2026-11-25T10:40:00.000Z",
		status: "submitted",
		score: null,
		maxScore: 100,
		feedback: null,
		graderName: null,
		gradedAt: null,
	},
	{
		id: "sub-3",
		studentId: "stu-3",
		fullName: "Budi Santoso",
		studentNumber: "202610003",
		className: "X IPS 1",
		assignmentId: "asg-3",
		assignmentTitle: "Analisis I'rab & Terjemahan Kitab Dasar",
		subjectName: "Bahasa Arab",
		fileName: "tugas-nahwu-sharaf-budi.docx",
		fileUrl: null,
		answerText:
			"Terjemahan dan analisis i'rab 15 kalimat isim dan fi'il mudhari' pada bab mubtada khabar.",
		submittedAt: "2026-11-25T16:20:00.000Z",
		status: "late",
		score: 85,
		maxScore: 100,
		feedback:
			"Analisis sudah baik, mohon perhatikan ketepatan waktu pengumpulan berikutnya.",
		graderName: "Ustadzah Fatimah, Lc.",
		gradedAt: "2026-11-26T08:00:00.000Z",
	},
];

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("AssignmentSubmissionsPage", () => {
	it("renders empty state by default without sample data or making api calls", () => {
		const fetchMock = vi.fn();
		vi.stubGlobal("fetch", fetchMock);

		render(<AssignmentSubmissionsPage />);

		expect(
			screen.getByRole("heading", {
				level: 1,
				name: /Hasil Pengumpulan Tugas Siswa/i,
			}),
		).toBeTruthy();
		expect(fetchMock).not.toHaveBeenCalled();
		expect(screen.queryByRole("note")).toBeNull();
		expect(screen.getByRole("status").textContent).toContain(
			"Tidak ada hasil tugas yang cocok dengan filter.",
		);

		const cards = screen.getAllByRole("article");
		expect(cards).toHaveLength(4);
		expect(cards[0].textContent).toContain("0");
		expect(cards[0].textContent).toContain("TOTAL HASIL MASUK");
	});

	it("shows loading and error states cleanly", () => {
		const { rerender } = render(
			<AssignmentSubmissionsPage
				overrideState={{
					kind: "loading",
					rows: [],
				}}
			/>,
		);
		expect(screen.getByRole("status").textContent).toContain(
			"Memuat hasil tugas",
		);

		rerender(
			<AssignmentSubmissionsPage
				overrideState={{
					kind: "error",
					rows: [],
				}}
			/>,
		);
		expect(screen.getByRole("alert").textContent).toContain(
			"Gagal memuat hasil pengumpulan tugas",
		);
	});

	it("filters by subject, grading status, and search, and resets cleanly", () => {
		render(
			<AssignmentSubmissionsPage
				overrideState={{
					kind: "ready",
					rows: mockSubmittedRows,
				}}
			/>,
		);

		// Filter by subject
		fireEvent.change(screen.getByLabelText("Filter Mata Pelajaran"), {
			target: { value: "Web Developer" },
		});
		expect(screen.getByText("Siti Aisyah")).toBeTruthy();
		expect(screen.queryByText("Ahmad Fauzi")).toBeNull();

		// Reset
		fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
		expect(screen.getByText("Ahmad Fauzi")).toBeTruthy();
		expect(screen.getByText("Siti Aisyah")).toBeTruthy();

		// Filter by grading status (ungraded)
		fireEvent.change(screen.getByLabelText("Filter Status Penilaian"), {
			target: { value: "ungraded" },
		});
		expect(screen.getByText("Siti Aisyah")).toBeTruthy();
		expect(screen.queryByText("Ahmad Fauzi")).toBeNull();

		// Search
		fireEvent.click(screen.getByRole("button", { name: /Reset/i }));
		fireEvent.change(screen.getByLabelText("Cari hasil tugas"), {
			target: { value: "nahwu" },
		});
		expect(screen.getByText("Budi Santoso")).toBeTruthy();
		expect(screen.queryByText("Ahmad Fauzi")).toBeNull();
	});

	it("opens detail dialog showing submitted file, answer text, score, and feedback", () => {
		render(
			<AssignmentSubmissionsPage
				overrideState={{
					kind: "ready",
					rows: mockSubmittedRows,
				}}
			/>,
		);

		fireEvent.click(screen.getByLabelText("Lihat hasil Ahmad Fauzi"));
		expect(screen.getByText("Detail Hasil Tugas Siswa")).toBeTruthy();
		expect(
			screen.getAllByText("jawaban-persamaan-linear-ahmad.pdf").length,
		).toBeGreaterThan(0);
		expect(
			screen.getAllByText(
				/Langkah pengerjaan sangat sistematis dan jawaban tepat/i,
			).length,
		).toBeGreaterThan(0);

		const closeButtons = screen.getAllByRole("button", { name: "Tutup" });
		fireEvent.click(closeButtons[0]);
		expect(screen.queryByText("Detail Hasil Tugas Siswa")).toBeNull();
	});
});
