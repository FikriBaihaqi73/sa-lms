import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { StudyPlan } from "../types";

interface StudyPlansTableProps {
	rows: StudyPlan[];
	isLoading: boolean;
	isError: boolean;
	searchTerm: string;
	onRetry: () => void;
	onEdit: (item: StudyPlan) => void;
	onDelete: (item: StudyPlan) => void;
}

function formatDate(dateStr?: string | null): string {
	if (!dateStr) return "-";
	try {
		const d = new Date(dateStr);
		if (Number.isNaN(d.getTime())) return "-";
		return new Intl.DateTimeFormat("id-ID", {
			day: "numeric",
			month: "short",
			year: "numeric",
		}).format(d);
	} catch {
		return "-";
	}
}

export function StudyPlansTable({
	rows,
	isLoading,
	isError,
	searchTerm,
	onRetry,
	onEdit,
	onDelete,
}: StudyPlansTableProps) {
	if (isLoading) {
		return (
			<div className="space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
				{[1, 2, 3, 4, 5].map((item) => (
					<div
						key={item}
						className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
				<p className="font-semibold">Gagal memuat data rencana studi</p>
				<p className="text-sm opacity-90">
					Pastikan server backend terhubung di VITE_API_URL.
				</p>
				<Button variant="outline" className="mt-3" onClick={onRetry}>
					Coba lagi
				</Button>
			</div>
		);
	}

	if (rows.length === 0) {
		return (
			<div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
				<p className="text-base font-semibold text-slate-800 dark:text-slate-200">
					{searchTerm
						? "Data rencana studi tidak ditemukan"
						: "Belum ada rencana studi"}
				</p>
				<p className="mt-1 text-sm">
					{searchTerm
						? "Coba ubah kata kunci atau filter pencarian."
						: "Klik Tambah Rencana Studi untuk memasukkan data baru."}
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[960px] text-left text-sm">
					<thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
						<tr>
							<th className="px-5 py-3.5">Siswa / Mahasiswa</th>
							<th className="px-5 py-3.5">Kode Mapel</th>
							<th className="px-5 py-3.5">Mata Pelajaran & Kelas</th>
							<th className="px-5 py-3.5">Pengajar</th>
							<th className="px-5 py-3.5">Tahun Ajaran</th>
							<th className="px-5 py-3.5">Tanggal Dibuat</th>
							<th className="px-5 py-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
						{rows.map((item) => {
							const studentName =
								item.student?.profile?.fullName ||
								`Siswa #${item.student?.studentNumber || item.student_id.slice(0, 8)}`;
							const studentNumber = item.student?.studentNumber;
							const studentEmail = item.student?.profile?.email;
							const subjectCode =
								item.classSubject?.subject?.code || "-";
							const subjectName =
								item.classSubject?.subject?.name || "Mata Pelajaran";
							const className = item.classSubject?.class?.name || "Kelas";
							const teacherName =
								item.classSubject?.teacher?.profile?.fullName || "-";
							const academicYearName =
								item.academicYear?.academic_year ||
								item.classSubject?.academic_year?.academic_year ||
								"-";
							const isAcademicYearActive = Boolean(
								item.academicYear?.is_active ??
									item.classSubject?.academic_year?.is_active,
							);

							return (
								<tr
									key={item.id}
									className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
								>
									{/* Kolom 1: Siswa */}
									<td className="px-5 py-4">
										<div className="font-semibold text-slate-900 dark:text-slate-100">
											{studentName}
										</div>
										<div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
											{studentNumber && (
												<span className="font-mono">NIS: {studentNumber}</span>
											)}
											{studentEmail && !studentNumber && (
												<span>{studentEmail}</span>
											)}
										</div>
									</td>

									{/* Kolom 2: Kode Mapel */}
									<td className="px-5 py-4">
										<span className="rounded bg-slate-800 px-2.5 py-1 font-mono text-xs text-slate-200">
											{subjectCode}
										</span>
									</td>

									{/* Kolom 3: Mata Pelajaran & Kelas */}
									<td className="px-5 py-4">
										<div className="font-medium text-slate-900 dark:text-slate-100">
											{subjectName}
										</div>
										<div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
											Kelas: {className}
										</div>
									</td>

									{/* Kolom 4: Pengajar */}
									<td className="px-5 py-4 text-slate-600 dark:text-slate-300">
										{teacherName}
									</td>

									{/* Kolom 5: Tahun Ajaran */}
									<td className="px-5 py-4">
										<div className="flex items-center gap-2">
											<span className="font-medium text-slate-800 dark:text-slate-200">
												{academicYearName}
											</span>
											{isAcademicYearActive && (
												<Badge className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300">
													Aktif
												</Badge>
											)}
										</div>
									</td>

									{/* Kolom 6: Tanggal Dibuat */}
									<td className="px-5 py-4 text-slate-600 dark:text-slate-400">
										{formatDate(item.created_at)}
									</td>

									{/* Kolom Aksi */}
									<td className="px-5 py-4 text-right">
										<div className="flex items-center justify-end gap-3 opacity-90 transition-opacity group-hover:opacity-100">
											<button
												type="button"
												onClick={() => onEdit(item)}
												className="text-sm font-medium text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
												title="Ubah"
											>
												Ubah
											</button>
											<button
												type="button"
												onClick={() => onDelete(item)}
												className="text-sm font-medium text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300"
												title="Hapus"
											>
												Hapus
											</button>
										</div>
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}

