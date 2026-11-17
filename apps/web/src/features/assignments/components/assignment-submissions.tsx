import {
	CheckCircle2,
	Clock,
	Eye,
	FileArchive,
	Search,
	XCircle,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import type { AssignmentItem, StudentSubmissionRow } from "../types";

interface AssignmentSubmissionsProps {
	selectedAssignment?: AssignmentItem | null;
	submissions: StudentSubmissionRow[];
	onViewDetail: (row: StudentSubmissionRow) => void;
	isLoading?: boolean;
}

type TabFilter = "semua" | "sudah" | "belum_dinilai" | "belum_kumpul";

export const AssignmentSubmissions: React.FC<AssignmentSubmissionsProps> = ({
	selectedAssignment,
	submissions,
	onViewDetail,
	isLoading = false,
}) => {
	const [tabFilter, setTabFilter] = useState<TabFilter>("semua");
	const [searchQuery, setSearchQuery] = useState("");

	// Counts for tabs
	const counts = useMemo(() => {
		const total = submissions.length;
		const sudah = submissions.filter(
			(s) =>
				s.statusPengumpulan === "sudah_kumpul" ||
				s.statusPengumpulan === "terlambat",
		).length;
		const belumDinilai = submissions.filter(
			(s) => s.statusPenilaian === "menunggu_dinilai",
		).length;
		const belumKumpul = submissions.filter(
			(s) => s.statusPengumpulan === "belum_kumpul",
		).length;

		return { total, sudah, belumDinilai, belumKumpul };
	}, [submissions]);

	// Filtered list
	const filteredRows = useMemo(() => {
		let list = submissions;

		if (tabFilter === "sudah") {
			list = list.filter(
				(s) =>
					s.statusPengumpulan === "sudah_kumpul" ||
					s.statusPengumpulan === "terlambat",
			);
		} else if (tabFilter === "belum_dinilai") {
			list = list.filter((s) => s.statusPenilaian === "menunggu_dinilai");
		} else if (tabFilter === "belum_kumpul") {
			list = list.filter((s) => s.statusPengumpulan === "belum_kumpul");
		}

		if (searchQuery.trim()) {
			const q = searchQuery.toLowerCase().trim();
			list = list.filter(
				(s) =>
					s.fullName.toLowerCase().includes(q) ||
					s.studentNumber.toLowerCase().includes(q) ||
					s.email.toLowerCase().includes(q),
			);
		}

		return list;
	}, [submissions, tabFilter, searchQuery]);

	if (!selectedAssignment) {
		return (
			<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-800 dark:bg-[#111927]/60">
				<p className="text-xs text-slate-500 dark:text-slate-400">
					Pilih salah satu penugasan pada kartu di atas untuk memantau progres
					dan audit rincian pengumpulan siswa.
				</p>
			</div>
		);
	}

	const moduleTitle = selectedAssignment.module?.title || "Modul Pembelajaran";
	const teacherName =
		selectedAssignment.module?.class_subject?.teacher?.profile?.fullName ||
		"Guru Pengampu";
	const formattedDueDate = selectedAssignment.due_date
		? new Date(selectedAssignment.due_date).toLocaleDateString("id-ID", {
				year: "numeric",
				month: "long",
				day: "numeric",
				hour: "2-digit",
				minute: "2-digit",
			})
		: "-";

	return (
		<div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800/90 dark:bg-[#111927]">
			{/* 1. Header Detail Tugas Terpilih */}
			<div className="flex flex-col gap-4 border-b border-slate-200 pb-4 dark:border-slate-800/80 lg:flex-row lg:items-start lg:justify-between">
				<div className="space-y-1">
					<div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
						RINCIAN PENGUMPULAN SISWA KELAS • {moduleTitle}
					</div>
					<h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
						{selectedAssignment.title}
					</h3>
					<p className="max-w-3xl text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
						{selectedAssignment.description ||
							"Tidak ada deskripsi tambahan untuk tugas ini."}
					</p>
				</div>

				<div className="flex flex-wrap items-center gap-2 shrink-0">
					<div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-right dark:border-slate-800 dark:bg-[#0c1322]">
						<span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
							GURU PENGAMPU
						</span>
						<span className="text-xs font-semibold text-slate-900 dark:text-white">
							{teacherName}
						</span>
					</div>

					<div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-right dark:border-slate-800 dark:bg-[#0c1322]">
						<span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
							BATAS WAKTU (DUE DATE)
						</span>
						<span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
							{formattedDueDate}
						</span>
					</div>

					<div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-right dark:border-slate-800 dark:bg-[#0c1322]">
						<span className="block text-[9px] font-bold uppercase tracking-wider text-slate-500">
							SKOR MAKSIMAL
						</span>
						<span className="text-xs font-bold text-blue-600 dark:text-blue-400">
							{selectedAssignment.max_score ?? 100} Poin
						</span>
					</div>
				</div>
			</div>

			{/* 2. Filter Tabs & Search Bar */}
			<div className="flex flex-wrap items-center justify-between gap-3">
				{/* Tab Buttons */}
				<div className="inline-flex rounded-xl border border-slate-200 bg-slate-100 p-1 shadow-sm dark:border-slate-800 dark:bg-[#0c1322]">
					<button
						type="button"
						onClick={() => setTabFilter("semua")}
						className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
							tabFilter === "semua"
								? "bg-blue-600 text-white shadow-sm"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40"
						}`}
					>
						Semua Siswa ({counts.total})
					</button>

					<button
						type="button"
						onClick={() => setTabFilter("sudah")}
						className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
							tabFilter === "sudah"
								? "bg-blue-600 text-white shadow-sm"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40"
						}`}
					>
						Sudah Kumpul ({counts.sudah})
					</button>

					<button
						type="button"
						onClick={() => setTabFilter("belum_dinilai")}
						className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
							tabFilter === "belum_dinilai"
								? "bg-blue-600 text-white shadow-sm"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40"
						}`}
					>
						Belum Dinilai Guru ({counts.belumDinilai})
					</button>

					<button
						type="button"
						onClick={() => setTabFilter("belum_kumpul")}
						className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
							tabFilter === "belum_kumpul"
								? "bg-blue-600 text-white shadow-sm"
								: "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-800/40"
						}`}
					>
						Belum Kumpul ({counts.belumKumpul})
					</button>
				</div>

				{/* Search Input */}
				<div className="relative min-w-[220px] flex-1 sm:max-w-xs">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
					<input
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Cari nama siswa, NIS, atau email..."
						className="h-8 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200 dark:placeholder:text-slate-500"
					/>
				</div>
			</div>

			{/* 3. Submissions Table */}
			<div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800/90 dark:bg-[#0c1322]">
				<div className="overflow-x-auto">
					<table className="w-full border-collapse text-left text-xs">
						<thead>
							<tr className="border-b border-slate-200 bg-slate-100/80 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-[#080d18] dark:text-slate-400">
								<th className="px-4 py-3">SISWA / MAHASISWA</th>
								<th className="px-4 py-3">KELAS</th>
								<th className="px-4 py-3">STATUS PENGUMPULAN</th>
								<th className="px-4 py-3">WAKTU KIRIM & BERKAS</th>
								<th className="px-4 py-3">STATUS PENILAIAN GURU</th>
								<th className="px-4 py-3 text-center">NILAI AKHIR (GURU)</th>
								<th className="px-4 py-3 text-right">AUDIT DETAIL</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800/60 dark:text-slate-300">
							{isLoading ? (
								<tr>
									<td
										colSpan={7}
										className="py-12 text-center text-xs text-slate-400"
									>
										Memuat data pengumpulan tugas siswa...
									</td>
								</tr>
							) : filteredRows.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="py-12 text-center text-xs text-slate-400"
									>
										Tidak ada data siswa yang cocok dengan filter atau kata
										kunci pencarian.
									</td>
								</tr>
							) : (
								filteredRows.map((row) => {
									const initial =
										row.fullName.trim().charAt(0).toUpperCase() || "S";

									return (
										<tr
											key={row.studentId}
											className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
										>
											{/* Siswa / Mahasiswa */}
											<td className="px-4 py-3">
												<div className="flex items-center gap-3">
													<div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-blue-200 bg-blue-50 font-bold text-xs text-blue-700 dark:border-blue-500/40 dark:bg-blue-950/60 dark:text-blue-300">
														{initial}
													</div>
													<div className="min-w-0">
														<div className="font-semibold text-slate-900 dark:text-white truncate">
															{row.fullName}
														</div>
														<div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
															NIS: {row.studentNumber} • {row.email}
														</div>
													</div>
												</div>
											</td>

											{/* Kelas */}
											<td className="px-4 py-3 text-slate-700 dark:text-slate-300 whitespace-nowrap">
												{row.className}
											</td>

											{/* Status Pengumpulan */}
											<td className="px-4 py-3 whitespace-nowrap">
												{row.statusPengumpulan === "sudah_kumpul" ? (
													<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-400">
														<CheckCircle2 className="size-3 text-emerald-600 dark:text-emerald-400" />
														<span>Sudah Mengumpulkan</span>
													</span>
												) : row.statusPengumpulan === "terlambat" ? (
													<span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-400">
														<Clock className="size-3 text-amber-600 dark:text-amber-400" />
														<span>Terlambat Kumpul</span>
													</span>
												) : (
													<span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/50 dark:text-rose-400">
														<XCircle className="size-3 text-rose-600 dark:text-rose-400" />
														<span>Belum Mengumpulkan</span>
													</span>
												)}
											</td>

											{/* Waktu Kirim & Berkas */}
											<td className="px-4 py-3 text-xs">
												{row.namaBerkas ? (
													<div>
														<div className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-medium hover:underline">
															<FileArchive className="size-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
															<span className="truncate max-w-[180px]">
																{row.namaBerkas}
															</span>
														</div>
														<div className="text-[10px] text-slate-500 dark:text-slate-400">
															{row.waktuKirim || "-"}
														</div>
													</div>
												) : (
													<span className="text-slate-400 dark:text-slate-500">
														—
													</span>
												)}
											</td>

											{/* Status Penilaian Guru */}
											<td className="px-4 py-3 whitespace-nowrap">
												{row.statusPenilaian === "sudah_dinilai" ? (
													<span className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-950/50 dark:text-blue-400">
														Sudah Dinilai Guru
													</span>
												) : row.statusPenilaian === "menunggu_dinilai" ? (
													<span className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/50 dark:text-amber-300">
														Menunggu Dinilai Guru
													</span>
												) : (
													<span className="text-xs text-slate-400 dark:text-slate-500">
														Menunggu Submisi
													</span>
												)}
											</td>

											{/* Nilai Akhir (Guru) */}
											<td className="px-4 py-3 text-center whitespace-nowrap">
												{row.nilaiAkhir !== undefined &&
												row.nilaiAkhir !== null ? (
													<span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/60 dark:text-emerald-400">
														{row.nilaiAkhir} / {row.skorMaksimal}
													</span>
												) : (
													<span className="text-slate-400 dark:text-slate-500">
														—
													</span>
												)}
											</td>

											{/* Audit Detail */}
											<td className="px-4 py-3 text-right whitespace-nowrap">
												<button
													type="button"
													onClick={() => onViewDetail(row)}
													className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-white"
												>
													<Eye className="size-3.5" />
													<span>Rincian</span>
												</button>
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
};
