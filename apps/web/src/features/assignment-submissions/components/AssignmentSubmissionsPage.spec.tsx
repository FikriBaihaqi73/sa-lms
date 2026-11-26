import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_SUBMITTED_RESULTS } from "../hooks";
import { AssignmentSubmissionsPage } from "./AssignmentSubmissionsPage";

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe("AssignmentSubmissionsPage", () => {
	it("renders 3 temporary sample submitted assignment results by default without making api calls", () => {
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

		// Banner for temporary sample data
		expect(screen.getByRole("note").textContent).toContain(
			"3 data contoh hasil tugas sementara",
		);

		// 3 submitted student works
		expect(screen.getByText("Ahmad Fauzi")).toBeTruthy();
		expect(screen.getByText("Siti Aisyah")).toBeTruthy();
		expect(screen.getByText("Budi Santoso")).toBeTruthy();

		// File names
		expect(screen.getByText("jawaban-persamaan-linear-ahmad.pdf")).toBeTruthy();
		expect(screen.getByText("crud-rest-api-siti.zip")).toBeTruthy();
		expect(screen.getByText("tugas-nahwu-sharaf-budi.docx")).toBeTruthy();

		// 4 Stats cards
		const cards = screen.getAllByRole("article");
		expect(cards).toHaveLength(4);
		expect(cards[0].textContent).toContain("3");
		expect(cards[0].textContent).toContain("TOTAL HASIL MASUK");
		expect(cards[1].textContent).toContain("2");
		expect(cards[1].textContent).toContain("SUDAH DINILAI");
		expect(cards[2].textContent).toContain("1");
		expect(cards[2].textContent).toContain("MENUNGGU PENILAIAN");
	});

	it("shows loading and error states cleanly", () => {
		const { rerender } = render(
			<AssignmentSubmissionsPage
				overrideState={{
					kind: "loading",
					rows: [],
					isUsingSampleData: false,
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
					isUsingSampleData: false,
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
					rows: SAMPLE_SUBMITTED_RESULTS,
					isUsingSampleData: true,
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
		render(<AssignmentSubmissionsPage />);

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
