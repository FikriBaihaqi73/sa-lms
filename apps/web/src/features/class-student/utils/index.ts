/**
 * Format tanggal ke standar Indonesia (contoh: "12 Agu 2026")
 */
export function formatIndonesianDate(dateStr?: string | null): string {
	if (!dateStr) return "-";
	try {
		const d = new Date(dateStr);
		if (Number.isNaN(d.getTime())) return "-";
		return d.toLocaleDateString("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	} catch {
		return "-";
	}
}

/**
 * Teks footer pagination "Menampilkan {a}–{b} dari {n} data"
 */
export function getPaginationText(
	page: number,
	limit: number,
	total: number,
): string {
	if (total <= 0) return "Menampilkan 0 data";
	const safePage = Math.max(page, 1);
	const safeLimit = Math.max(limit, 1);
	const from = (safePage - 1) * safeLimit + 1;
	const to = Math.min(safePage * safeLimit, total);
	return `Menampilkan ${from}–${to} dari ${total} data`;
}

/**
 * Keterangan pada empat kartu informasi mengikuti filter kelas
 */
export function getCardSubtitle(
	type: "total" | "recent" | "deleted" | "filled",
	selectedClassName?: string | null,
): string {
	switch (type) {
		case "total":
			return selectedClassName
				? `siswa aktif di kelas ${selectedClassName}`
				: "siswa aktif di semua kelas";
		case "recent":
			return "dalam 30 hari terakhir";
		case "deleted":
			return "bisa dipulihkan";
		case "filled":
			return "kelas sudah punya siswa aktif";
	}
}

/**
 * Koreksi halaman saat setelah mutasi (misalnya seluruh baris di halaman terakhir dihapus)
 */
export function getCorrectedPage(
	currentPage: number,
	itemsCountAfterMutation: number,
	totalPages: number,
): number {
	if (itemsCountAfterMutation === 0 && currentPage > 1) {
		return Math.max(1, Math.min(currentPage - 1, totalPages));
	}
	return Math.max(1, Math.min(currentPage, Math.max(totalPages, 1)));
}

/**
 * Ekstraksi inisial avatar dari nama atau NIM
 */
export function getInitials(name?: string | null, fallback?: string): string {
	const cleanName = name?.trim();
	if (cleanName) {
		const parts = cleanName.split(/\s+/).filter(Boolean);
		if (parts.length >= 2) {
			const first = parts[0]?.charAt(0) ?? "";
			const second = parts[1]?.charAt(0) ?? "";
			return (first + second).toUpperCase();
		}
		return cleanName.slice(0, 2).toUpperCase();
	}
	const cleanFallback = fallback?.trim();
	if (cleanFallback) {
		return cleanFallback.slice(0, 2).toUpperCase();
	}
	return "SW";
}
