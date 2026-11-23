import type { GradeMatchResult, StandardGrade } from "../types";

/**
 * Konversi predikat nilai ujian secara dinamis mengikuti rentang data master Grades (/grades).
 * Tidak melakukan hardcoding huruf mutu (A/B/C/D/E) agar kompatibel dengan standar penilaian kustom.
 */
export function resolveGradeFromScore(
	score: number | null | undefined,
	grades: StandardGrade[] = [],
): GradeMatchResult {
	if (score === null || score === undefined || Number.isNaN(score)) {
		return {
			grade: "-",
			description: null,
			scoreRangeText: "-",
			isMatched: false,
			colorBadge: {
				bg: "bg-slate-100 dark:bg-slate-800",
				text: "text-slate-500 dark:text-slate-400",
				border: "border-slate-200 dark:border-slate-700",
			},
		};
	}

	// Cari standar penilaian yang cocok berdasarkan rentang [min, max]
	const matched = grades.find((g) => {
		const min = g.minimumScore ?? 0;
		const max = g.maximumScore ?? 100;
		return score >= min && score <= max;
	});

	if (!matched) {
		return {
			grade: "Belum Terdefinisi",
			description:
				"Skor tidak berada dalam rentang standar penilaian yang terdaftar.",
			scoreRangeText: "-",
			isMatched: false,
			colorBadge: {
				bg: "bg-slate-100 dark:bg-slate-800",
				text: "text-slate-600 dark:text-slate-300",
				border: "border-slate-300 dark:border-slate-700",
			},
		};
	}

	const min = matched.minimumScore ?? 0;
	const max = matched.maximumScore ?? 100;
	const scoreRangeText = `${min} - ${max}`;

	// Penentuan warna badge yang proporsional sesuai nilai batas minimum atau predikat
	const lower = matched.grade.toLowerCase();
	let colorBadge = {
		bg: "bg-blue-50 dark:bg-blue-950/60",
		text: "text-blue-700 dark:text-blue-300",
		border: "border-blue-200 dark:border-blue-800",
	};

	if (
		min >= 85 ||
		lower.includes("a") ||
		lower.includes("pujian") ||
		lower.includes("sangat") ||
		lower.includes("istimewa")
	) {
		colorBadge = {
			bg: "bg-emerald-50 dark:bg-emerald-950/60",
			text: "text-emerald-700 dark:text-emerald-300",
			border: "border-emerald-200 dark:border-emerald-800",
		};
	} else if (
		min >= 70 ||
		lower.includes("b") ||
		lower.includes("baik") ||
		lower.includes("lulus")
	) {
		colorBadge = {
			bg: "bg-blue-50 dark:bg-blue-950/60",
			text: "text-blue-700 dark:text-blue-300",
			border: "border-blue-200 dark:border-blue-800",
		};
	} else if (min >= 55 || lower.includes("c") || lower.includes("cukup")) {
		colorBadge = {
			bg: "bg-amber-50 dark:bg-amber-950/60",
			text: "text-amber-700 dark:text-amber-300",
			border: "border-amber-200 dark:border-amber-800",
		};
	} else {
		colorBadge = {
			bg: "bg-rose-50 dark:bg-rose-950/60",
			text: "text-rose-700 dark:text-rose-300",
			border: "border-rose-200 dark:border-rose-800",
		};
	}

	return {
		grade: matched.grade,
		description: matched.description ?? null,
		scoreRangeText,
		isMatched: true,
		colorBadge,
	};
}

/**
 * Format angka skor ujian ke tampilan Decimal(5, 2)
 */
export function formatScore(score: number | null | undefined): string {
	if (score === null || score === undefined || Number.isNaN(score)) {
		return "-";
	}
	return Number(score).toFixed(2);
}

/**
 * Format tanggal dan jam pelaksanaan/penilaian ke waktu Indonesia
 */
export function formatDateTime(isoString: string | null | undefined): string {
	if (!isoString) return "-";
	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) return "-";

	const d = date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
	const t = date.toLocaleTimeString("id-ID", {
		hour: "2-digit",
		minute: "2-digit",
	});
	return `${d}, ${t} WIB`;
}

/**
 * Format tanggal singkat (misal: 14 Nov 2026)
 */
export function formatDateOnly(isoString: string | null | undefined): string {
	if (!isoString) return "-";
	const date = new Date(isoString);
	if (Number.isNaN(date.getTime())) return "-";

	return date.toLocaleDateString("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	});
}
