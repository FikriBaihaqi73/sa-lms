import { RotateCcw, Search } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import {
	type LiveSubmittedResultsState,
	useLiveSubmittedResults,
} from "../hooks";
import type { SubmissionRow } from "../types";
import { AssignmentSubmissionDetailDialog } from "./AssignmentSubmissionDetailDialog";
import { AssignmentSubmissionsHeader } from "./AssignmentSubmissionsHeader";
import { AssignmentSubmissionsStats } from "./AssignmentSubmissionsStats";
import { AssignmentSubmissionsTable } from "./AssignmentSubmissionsTable";

export interface AssignmentSubmissionsPageProps {
	overrideState?: LiveSubmittedResultsState;
}

export const AssignmentSubmissionsPage: React.FC<
	AssignmentSubmissionsPageProps
> = ({ overrideState }) => {
	const state: LiveSubmittedResultsState = overrideState ?? {
		kind: "ready",
		rows: [],
	};

	const [search, setSearch] = useState("");
	const [subjectFilter, setSubjectFilter] = useState("");
	const [gradingFilter, setGradingFilter] = useState<
		"" | "graded" | "ungraded"
	>("");
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [selectedRow, setSelectedRow] = useState<SubmissionRow | null>(null);

	const subjectOptions = useMemo(() => {
		const set = new Set<string>();
		for (const r of state.rows) {
			if (r.subjectName) set.add(r.subjectName);
		}
		return Array.from(set);
	}, [state.rows]);

	const filteredRows = useMemo(() => {
		const term = search.trim().toLocaleLowerCase("id");
		return state.rows.filter((row) => {
			if (subjectFilter && row.subjectName !== subjectFilter) return false;
			const isGraded = row.score !== null && row.score !== undefined;
			if (gradingFilter === "graded" && !isGraded) return false;
			if (gradingFilter === "ungraded" && isGraded) return false;
			if (!term) return true;
			return (
				row.fullName.toLocaleLowerCase("id").includes(term) ||
				(row.assignmentTitle ?? "").toLocaleLowerCase("id").includes(term) ||
				(row.fileName ?? "").toLocaleLowerCase("id").includes(term) ||
				(row.subjectName ?? "").toLocaleLowerCase("id").includes(term)
			);
		});
	}, [state.rows, search, subjectFilter, gradingFilter]);

	const statsCounts = useMemo<
		readonly [number, number, number, number] | null
	>(() => {
		if (state.kind !== "ready") return null;
		const total = filteredRows.length;
		const gradedRows = filteredRows.filter(
			(r) => r.score !== null && r.score !== undefined,
		);
		const graded = gradedRows.length;
		const ungraded = total - graded;
		const avgScore =
			graded > 0
				? Math.round(
						gradedRows.reduce((acc, r) => acc + Number(r.score ?? 0), 0) /
							graded,
					)
				: 0;
		return [total, graded, ungraded, avgScore];
	}, [state.kind, filteredRows]);

	const totalPages = Math.max(1, Math.ceil(filteredRows.length / limit));
	const currentPage = Math.min(page, totalPages);
	const paginatedRows = filteredRows.slice(
		(currentPage - 1) * limit,
		currentPage * limit,
	);

	const handleResetFilters = () => {
		setSearch("");
		setSubjectFilter("");
		setGradingFilter("");
		setPage(1);
	};

	const handleExportCsv = () => {
		if (filteredRows.length === 0) return;
		const headers = [
			"No",
			"Nama Siswa",
			"NIS",
			"Kelas",
			"Mata Pelajaran",
			"Judul Tugas",
			"Berkas Dikirim",
			"Catatan Jawaban",
			"Waktu Kirim",
			"Nilai",
			"Feedback",
		];
		const csvRows = filteredRows.map((r, idx) =>
			[
				String(idx + 1),
				`"${r.fullName.replace(/"/g, '""')}"`,
				`"${r.studentNumber || "-"}"`,
				`"${(r.className || "-").replace(/"/g, '""')}"`,
				`"${(r.subjectName || "-").replace(/"/g, '""')}"`,
				`"${(r.assignmentTitle || "-").replace(/"/g, '""')}"`,
				`"${(r.fileName || "-").replace(/"/g, '""')}"`,
				`"${(r.answerText || "-").replace(/"/g, '""')}"`,
				`"${r.submittedAt || "-"}"`,
				r.score !== null && r.score !== undefined ? String(r.score) : "-",
				`"${(r.feedback || "-").replace(/"/g, '""')}"`,
			].join(","),
		);
		const csv = `data:text/csv;charset=utf-8,\uFEFF${[headers.join(","), ...csvRows].join("\n")}`;
		const link = document.createElement("a");
		link.setAttribute("href", encodeURI(csv));
		link.setAttribute("download", "hasil-pengumpulan-tugas.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const emptyMessage =
		state.kind === "loading"
			? "Memuat hasil tugas yang dikirim siswa…"
			: state.kind === "error"
				? "Gagal memuat hasil pengumpulan tugas."
				: "Tidak ada hasil tugas yang cocok dengan filter.";

	return (
		<section
			className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 sm:p-6"
			aria-label="Hasil pengumpulan tugas siswa"
		>
			<div className="mx-auto max-w-7xl space-y-4">
				<AssignmentSubmissionsHeader
					canExport={filteredRows.length > 0}
					onExport={handleExportCsv}
				/>

				<AssignmentSubmissionsStats
					counts={statsCounts}
					isLoading={state.kind === "loading"}
				/>

				{/* Bar Filter */}
				<div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800/90 dark:bg-[#111927] sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
						<input
							type="text"
							value={search}
							onChange={(e) => {
								setSearch(e.target.value);
								setPage(1);
							}}
							placeholder="Cari nama siswa, judul tugas, atau berkas…"
							aria-label="Cari hasil tugas"
							className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 placeholder:text-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200 dark:placeholder:text-slate-500"
						/>
					</div>

					<div className="sm:w-48">
						<select
							value={subjectFilter}
							onChange={(e) => {
								setSubjectFilter(e.target.value);
								setPage(1);
							}}
							aria-label="Filter Mata Pelajaran"
							className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
						>
							<option value="">Semua Mata Pelajaran</option>
							{subjectOptions.map((subj) => (
								<option key={subj} value={subj}>
									{subj}
								</option>
							))}
						</select>
					</div>

					<div className="sm:w-44">
						<select
							value={gradingFilter}
							onChange={(e) => {
								setGradingFilter(e.target.value as "" | "graded" | "ungraded");
								setPage(1);
							}}
							aria-label="Filter Status Penilaian"
							className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
						>
							<option value="">Semua Status Penilaian</option>
							<option value="graded">Sudah Dinilai</option>
							<option value="ungraded">Menunggu Penilaian</option>
						</select>
					</div>

					<button
						type="button"
						onClick={handleResetFilters}
						className="inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
					>
						<RotateCcw className="size-3.5" />
						<span>Reset</span>
					</button>
				</div>

				<AssignmentSubmissionsTable
					rows={paginatedRows}
					currentPage={currentPage}
					limit={limit}
					totalPages={totalPages}
					totalData={filteredRows.length}
					emptyMessage={emptyMessage}
					isErrorState={state.kind === "error"}
					onPageChange={setPage}
					onLimitChange={(newLimit) => {
						setLimit(newLimit);
						setPage(1);
					}}
					onSelectDetail={setSelectedRow}
				/>

				<AssignmentSubmissionDetailDialog
					selected={selectedRow}
					onClose={() => setSelectedRow(null)}
				/>
			</div>
		</section>
	);
};

export const AssignmentSubmissionsLivePage: React.FC = () => {
	const liveState = useLiveSubmittedResults(true);
	return <AssignmentSubmissionsPage overrideState={liveState} />;
};
