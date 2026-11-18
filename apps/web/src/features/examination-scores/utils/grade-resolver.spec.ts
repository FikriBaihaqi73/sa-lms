import { describe, expect, it } from "vitest";
import type { StandardGrade } from "../types";
import {
	formatDateOnly,
	formatDateTime,
	formatScore,
	resolveGradeFromScore,
} from "./grade-resolver";

const mockStandardGrades: StandardGrade[] = [
	{
		id: "g-1",
		grade: "A",
		minimumScore: 85,
		maximumScore: 100,
		description: "Sangat Memuaskan / Luar Biasa",
	},
	{
		id: "g-2",
		grade: "B",
		minimumScore: 70,
		maximumScore: 84.99,
		description: "Baik",
	},
	{
		id: "g-3",
		grade: "C",
		minimumScore: 55,
		maximumScore: 69.99,
		description: "Cukup",
	},
	{
		id: "g-4",
		grade: "D",
		minimumScore: 40,
		maximumScore: 54.99,
		description: "Kurang",
	},
	{
		id: "g-5",
		grade: "E",
		minimumScore: 0,
		maximumScore: 39.99,
		description: "Gagal / Remedial",
	},
];

const mockCustomGrades: StandardGrade[] = [
	{
		id: "cg-1",
		grade: "Lulus Dengan Pujian",
		minimumScore: 90,
		maximumScore: 100,
		description: "Cumlaude",
	},
	{
		id: "cg-2",
		grade: "Lulus Kompeten",
		minimumScore: 75,
		maximumScore: 89.99,
		description: "Memenuhi seluruh capaian pembelajaran",
	},
	{
		id: "cg-3",
		grade: "Remedial Mandiri",
		minimumScore: 0,
		maximumScore: 74.99,
		description: "Perlu bimbingan ulang",
	},
];

describe("grade-resolver utils", () => {
	describe("resolveGradeFromScore", () => {
		it("harus mengembalikan '-' jika skor null, undefined, atau NaN", () => {
			expect(resolveGradeFromScore(null, mockStandardGrades).grade).toBe("-");
			expect(resolveGradeFromScore(undefined, mockStandardGrades).grade).toBe(
				"-",
			);
			expect(resolveGradeFromScore(Number.NaN, mockStandardGrades).grade).toBe(
				"-",
			);
		});

		it("harus mengembalikan 'Belum Terdefinisi' jika daftar grades kosong", () => {
			const res = resolveGradeFromScore(88, []);
			expect(res.grade).toBe("Belum Terdefinisi");
			expect(res.isMatched).toBe(false);
		});

		it("harus mengembalikan 'Belum Terdefinisi' jika skor di luar seluruh rentang grade", () => {
			const res = resolveGradeFromScore(105, mockStandardGrades);
			expect(res.grade).toBe("Belum Terdefinisi");
			expect(res.isMatched).toBe(false);
		});

		it("harus mencocokkan huruf mutu standar secara tepat sesuai rentang", () => {
			const resA = resolveGradeFromScore(92.5, mockStandardGrades);
			expect(resA.grade).toBe("A");
			expect(resA.description).toBe("Sangat Memuaskan / Luar Biasa");
			expect(resA.scoreRangeText).toBe("85 - 100");
			expect(resA.isMatched).toBe(true);

			const resB = resolveGradeFromScore(75, mockStandardGrades);
			expect(resB.grade).toBe("B");
			expect(resB.isMatched).toBe(true);

			const resE = resolveGradeFromScore(25, mockStandardGrades);
			expect(resE.grade).toBe("E");
			expect(resE.isMatched).toBe(true);
		});

		it("harus mencocokkan standar predikat non-huruf mutu (kustom)", () => {
			const resCumlaude = resolveGradeFromScore(95, mockCustomGrades);
			expect(resCumlaude.grade).toBe("Lulus Dengan Pujian");
			expect(resCumlaude.description).toBe("Cumlaude");
			expect(resCumlaude.scoreRangeText).toBe("90 - 100");

			const resRemedial = resolveGradeFromScore(60, mockCustomGrades);
			expect(resRemedial.grade).toBe("Remedial Mandiri");
			expect(resRemedial.description).toBe("Perlu bimbingan ulang");
		});

		it("harus menangani batas angka batas (boundary check)", () => {
			const minA = resolveGradeFromScore(85, mockStandardGrades);
			expect(minA.grade).toBe("A");

			const maxA = resolveGradeFromScore(100, mockStandardGrades);
			expect(maxA.grade).toBe("A");

			const minB = resolveGradeFromScore(70, mockStandardGrades);
			expect(minB.grade).toBe("B");
		});
	});

	describe("formatScore", () => {
		it("harus memformat angka ke 2 desimal (Decimal(5, 2))", () => {
			expect(formatScore(95)).toBe("95.00");
			expect(formatScore(84.756)).toBe("84.76");
			expect(formatScore(0)).toBe("0.00");
		});

		it("harus mengembalikan '-' jika null atau undefined", () => {
			expect(formatScore(null)).toBe("-");
			expect(formatScore(undefined)).toBe("-");
			expect(formatScore(Number.NaN)).toBe("-");
		});
	});

	describe("formatDateTime & formatDateOnly", () => {
		it("harus memformat tanggal dan waktu ke format bahasa Indonesia", () => {
			const iso = "2026-11-18T10:30:00.000Z";
			const formatted = formatDateTime(iso);
			expect(formatted).toContain("2026");
			expect(formatted).toContain("WIB");
		});

		it("harus menangani tanggal null dan invalid", () => {
			expect(formatDateTime(null)).toBe("-");
			expect(formatDateTime("invalid-date")).toBe("-");
			expect(formatDateOnly(null)).toBe("-");
			expect(formatDateOnly("invalid-date")).toBe("-");
		});
	});
});
