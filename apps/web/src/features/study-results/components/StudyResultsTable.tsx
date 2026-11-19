import {
	ChevronLeft,
	ChevronRight,
	Edit2,
	Eye,
	GraduationCap,
	Plus,
	Trash2,
} from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import type { DepartmentOption, StudyResult } from "../types";

interface StudyResultsTableProps {
	data: StudyResult[];
	departments: DepartmentOption[];
	page: number;
	totalPages: number;
	totalData: number;
	isLoading: boolean;
	onPageChange: (page: number) => void;
	onViewDetail: (result: StudyResult) => void;
	onEdit: (result: StudyResult) => void;
	onDelete: (result: StudyResult) => void;
	onAddNew: () => void;
}

function getGpaBadge(gpaValue: number | string | null | undefined) {
	if (gpaValue === null || gpaValue === undefined || gpaValue === "") {
		return (
			<span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
				-
			</span>
		);
	}

	const num = Number(gpaValue);
	if (Number.isNaN(num)) {
		return (
			<span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
				-
			</span>
		);
	}

	let badgeColor =
		"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
	if (num >= 3.5) {
		badgeColor =
			"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400";
	} else if (num >= 3.0) {
		badgeColor =
			"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400";
	} else if (num >= 2.0) {
		badgeColor =
			"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400";
	} else {
		badgeColor =
			"bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400";
	}

	return (
		<span
			className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold ${badgeColor}`}
		>
			{num.toFixed(2)}
		</span>
	);
}

function getAcademicStatusBadge(name?: string | null) {
	if (!name) {
		return (
			<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-slate-800">
				-
			</span>
		);
	}

	const lower = name.toLowerCase();
	if (lower.includes("aktif") || lower.includes("active")) {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400">
				<span className="size-1.5 rounded-full bg-emerald-500" />
				{name}
			</span>
		);
	}

	if (lower.includes("cuti") || lower.includes("leave")) {
		return (
			<span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
				<span className="size-1.5 rounded-full bg-amber-500" />
				{name}
			</span>
		);
	}

	return (
		<span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
			<span className="size-1.5 rounded-full bg-slate-400" />
			{name}
		</span>
	);
}

export const StudyResultsTable: React.FC<StudyResultsTableProps> = ({
	data,
	departments,
	page,
	totalPages,
	totalData,
	isLoading,
	onPageChange,
	onViewDetail,
	onEdit,
	onDelete,
	onAddNew,
}) => {
	// Department map for fast lookup
	const deptMap = React.useMemo(() => {
		const map = new Map<string, string>();
		for (const d of departments) {
			map.set(d.id, `${d.name} (${d.code})`);
		}
		return map;
	}, [departments]);

	if (isLoading) {
		return (
			<div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
				<div className="text-center">
					<div className="inline-block size-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
					<p className="mt-3 text-xs font-semibold text-slate-500">
						Memuat data rekap nilai siswa...
					</p>
				</div>
			</div>
		);
	}

	if (data.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
				<div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
					<GraduationCap className="size-7" />
				</div>
				<h3 className="mt-4 text-base font-bold text-slate-900 dark:text-slate-100">
					Belum ada data rekap nilai siswa
				</h3>
				<p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
					Mulai input hasil studi dan pantau capaian indeks prestasi siswa per
					semester secara terstruktur.
				</p>
				<Button
					type="button"
					onClick={onAddNew}
					className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-blue-700"
				>
					<Plus className="size-4" />
					<span>Tambah Rekap Nilai Pertama</span>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div className="overflow-x-auto">
					<table className="w-full text-left text-xs">
						<thead className="border-b border-slate-200 bg-slate-50/80 font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300">
							<tr>
								<th className="px-4 py-3.5 w-12 text-center">No</th>
								<th className="px-4 py-3.5">Informasi Siswa</th>
								<th className="px-4 py-3.5">Kelas / Departemen</th>
								<th className="px-4 py-3.5">Tahun Ajaran & Semester</th>
								<th className="px-4 py-3.5 text-center">Beban SKS</th>
								<th className="px-4 py-3.5 text-center">IPS</th>
								<th className="px-4 py-3.5 text-center">IPK</th>
								<th className="px-4 py-3.5 text-center">Status</th>
								<th className="px-4 py-3.5 text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
							{data.map((item, idx) => {
								const indexNum = (page - 1) * 10 + idx + 1;
								const studentName =
									item.student?.profile?.fullName ||
									"Nama Siswa Tidak Diketahui";
								const studentNumber = item.student?.studentNumber || "-";
								const studentEmail = item.student?.profile?.email;

								// Extract class names if assigned
								const classList = item.student?.classStudents
									?.map((cs) => cs.classes?.name)
									.filter(Boolean);
								const classDisplay =
									classList && classList.length > 0
										? classList.join(", ")
										: "-";

								// Department
								const deptDisplay = item.student?.departmentId
									? deptMap.get(item.student.departmentId) || "Departemen"
									: null;

								return (
									<tr
										key={item.id}
										className="transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
									>
										<td className="px-4 py-3 text-center text-slate-400 font-mono">
											{indexNum}
										</td>

										<td className="px-4 py-3">
											<div className="min-w-[180px]">
												<p className="font-bold text-slate-900 dark:text-slate-100">
													{studentName}
												</p>
												<p className="text-[11px] text-slate-500 font-mono">
													NIS: {studentNumber}
												</p>
												{studentEmail && (
													<p className="text-[10px] text-slate-400 truncate max-w-[200px]">
														{studentEmail}
													</p>
												)}
											</div>
										</td>

										<td className="px-4 py-3">
											<div className="min-w-[140px] space-y-1">
												<span className="inline-block rounded-md border border-blue-100 bg-blue-50/70 px-2 py-0.5 text-[11px] font-medium text-blue-700 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-300">
													{classDisplay}
												</span>
												{deptDisplay && (
													<p className="text-[10px] text-slate-500">
														{deptDisplay}
													</p>
												)}
											</div>
										</td>

										<td className="px-4 py-3">
											<div className="min-w-[150px]">
												<p className="font-semibold text-slate-800 dark:text-slate-200">
													{item.academicYear?.academic_year || "-"}
												</p>
												<p className="text-[11px] text-slate-500">
													{item.semester?.name || "-"}
												</p>
											</div>
										</td>

										<td className="px-4 py-3 text-center">
											<span className="inline-flex size-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200">
												{item.totalCredits ?? 0}
											</span>
										</td>

										<td className="px-4 py-3 text-center">
											{getGpaBadge(item.semesterGpa)}
										</td>

										<td className="px-4 py-3 text-center">
											{getGpaBadge(item.cumulativeGpa)}
										</td>

										<td className="px-4 py-3 text-center">
											{getAcademicStatusBadge(item.academicStatus?.name)}
										</td>

										<td className="px-4 py-3 text-right">
											<div className="flex items-center justify-end gap-1.5">
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => onViewDetail(item)}
													className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
													title="Lihat Detail Rekap Nilai"
													aria-label="Lihat Detail"
												>
													<Eye className="size-3.5" />
												</Button>

												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => onEdit(item)}
													className="h-7 w-7 p-0 text-slate-500 hover:text-slate-900 dark:hover:text-white"
													title="Ubah Rekap Nilai"
													aria-label="Ubah Rekap Nilai"
												>
													<Edit2 className="size-3.5" />
												</Button>

												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => onDelete(item)}
													className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
													title="Hapus Rekap Nilai"
													aria-label="Hapus Rekap Nilai"
												>
													<Trash2 className="size-3.5" />
												</Button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>

				{/* Pagination Footer */}
				{totalPages > 1 && (
					<div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800">
						<p className="text-xs text-slate-500 dark:text-slate-400">
							Halaman <span className="font-semibold">{page}</span> dari{" "}
							<span className="font-semibold">{totalPages}</span> (Total{" "}
							{totalData} data rekap nilai)
						</p>

						<div className="flex items-center gap-2">
							<Button
								type="button"
								size="sm"
								variant="outline"
								disabled={page <= 1}
								onClick={() => onPageChange(Math.max(page - 1, 1))}
								className="h-8 gap-1 px-3 text-xs"
							>
								<ChevronLeft className="size-3.5" />
								<span>Sebelumnya</span>
							</Button>

							<Button
								type="button"
								size="sm"
								variant="outline"
								disabled={page >= totalPages}
								onClick={() => onPageChange(Math.min(page + 1, totalPages))}
								className="h-8 gap-1 px-3 text-xs"
							>
								<span>Berikutnya</span>
								<ChevronRight className="size-3.5" />
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};
