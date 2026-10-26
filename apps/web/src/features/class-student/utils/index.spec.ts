import { describe, expect, it } from "vitest";
import { addClassStudentSchema } from "../schemas/classStudentSchema";
import {
	formatIndonesianDate,
	getCardSubtitle,
	getCorrectedPage,
	getInitials,
	getPaginationText,
} from "./index";

describe("addClassStudentSchema", () => {
	it("rejects when classId is empty", () => {
		const res = addClassStudentSchema.safeParse({
			classId: "",
			studentIds: ["s-1"],
		});
		expect(res.success).toBe(false);
	});

	it("rejects when studentIds is empty array", () => {
		const res = addClassStudentSchema.safeParse({
			classId: "c-1",
			studentIds: [],
		});
		expect(res.success).toBe(false);
	});

	it("accepts valid input", () => {
		const res = addClassStudentSchema.safeParse({
			classId: "c-1",
			studentIds: ["s-1", "s-2"],
		});
		expect(res.success).toBe(true);
	});
});

describe("getPaginationText", () => {
	it("handles 0 total items", () => {
		expect(getPaginationText(1, 10, 0)).toBe("Menampilkan 0 data");
	});

	it("handles first page with items", () => {
		expect(getPaginationText(1, 10, 25)).toBe("Menampilkan 1–10 dari 25 data");
	});

	it("handles partial last page", () => {
		expect(getPaginationText(3, 10, 25)).toBe("Menampilkan 21–25 dari 25 data");
	});
});

describe("getCardSubtitle", () => {
	it("returns global subtitle when no class selected", () => {
		expect(getCardSubtitle("total", null)).toBe("siswa aktif di semua kelas");
		expect(getCardSubtitle("total", undefined)).toBe(
			"siswa aktif di semua kelas",
		);
	});

	it("returns scoped subtitle when class is selected", () => {
		expect(getCardSubtitle("total", "X-IPA-1")).toBe(
			"siswa aktif di kelas X-IPA-1",
		);
	});

	it("returns fixed subtitle for other cards regardless of class", () => {
		expect(getCardSubtitle("recent", "X-IPA-1")).toBe("dalam 30 hari terakhir");
		expect(getCardSubtitle("deleted", "X-IPA-1")).toBe("bisa dipulihkan");
		expect(getCardSubtitle("filled", "X-IPA-1")).toBe(
			"kelas sudah punya siswa aktif",
		);
	});
});

describe("getCorrectedPage", () => {
	it("steps back one page if current page becomes empty and page > 1", () => {
		expect(getCorrectedPage(3, 0, 2)).toBe(2);
	});

	it("stays at page 1 if current page is 1 even if empty", () => {
		expect(getCorrectedPage(1, 0, 0)).toBe(1);
	});

	it("retains current page if items still exist", () => {
		expect(getCorrectedPage(2, 5, 2)).toBe(2);
	});
});

describe("getInitials", () => {
	it("extracts 2-letter initials from full name", () => {
		expect(getInitials("Ahmad Dahlan")).toBe("AD");
		expect(getInitials("Siti Aminah")).toBe("SA");
	});

	it("extracts 2 letters from single name", () => {
		expect(getInitials("Budi")).toBe("BU");
	});

	it("falls back to student number or default", () => {
		expect(getInitials(null, "2026001")).toBe("20");
		expect(getInitials("", "")).toBe("SW");
	});
});

describe("formatIndonesianDate", () => {
	it("formats ISO date string", () => {
		const formatted = formatIndonesianDate("2026-08-12T00:00:00.000Z");
		expect(formatted).toContain("2026");
	});

	it("returns dash for invalid or null date", () => {
		expect(formatIndonesianDate(null)).toBe("-");
		expect(formatIndonesianDate("invalid")).toBe("-");
	});
});
