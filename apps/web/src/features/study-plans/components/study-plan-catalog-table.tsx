import { AlertCircle, BookOpen, Layers, RefreshCw, Users } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import type { ClassSubjectOption } from "../types";
import { toggleClassSubjectActiveStatus } from "../utils/deactivated-storage";

interface StudyPlanCatalogTableProps {
	catalogItems: ClassSubjectOption[];
	isLoading?: boolean;
	isError?: boolean;
	deactivatedIds?: string[];
	onRetry?: () => void;
	onEnrollClick?: (classSubjectId: string) => void;
	onToggleStatus?: (classSubjectId: string, active: boolean) => void;
}

export const StudyPlanCatalogTable: React.FC<StudyPlanCatalogTableProps> = ({
	catalogItems,
	isLoading = false,
	isError = false,
	deactivatedIds,
	onRetry,
	onToggleStatus,
}) => {
	const [statusOverrides, setStatusOverrides] = useState<
		Record<string, boolean>
	>({});

	const getItemActive = (item: ClassSubjectOption) => {
		if (statusOverrides[item.id] !== undefined) {
			return statusOverrides[item.id];
		}
		if (deactivatedIds) {
			return !deactivatedIds.includes(item.id);
		}
		if (item.isActive !== undefined) return item.isActive;
		return item.isAcademicYearActive ?? true;
	};

	const handleToggle = (item: ClassSubjectOption, newStatus: boolean) => {
		setStatusOverrides((prev) => ({ ...prev, [item.id]: newStatus }));
		toggleClassSubjectActiveStatus(item.id, newStatus);
		onToggleStatus?.(item.id, newStatus);
	};

	if (isError) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-red-900/30 bg-red-950/20 p-12 text-center">
				<AlertCircle className="size-10 text-red-400" />
				<h3 className="mt-3 text-sm font-semibold text-white">
					Gagal memuat katalog kelas mata pelajaran
				</h3>
				<p className="mt-1 text-xs text-slate-400">
					Terjadi kesalahan saat memuat katalog kelas mata pelajaran.
				</p>
				{onRetry && (
					<button
						type="button"
						onClick={onRetry}
						className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
					>
						<RefreshCw className="size-3.5" />
						Coba Lagi
					</button>
				)}
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-slate-800 bg-[#111927] p-16 shadow-sm">
				<RefreshCw className="size-8 animate-spin text-blue-500" />
				<p className="mt-3 text-sm font-medium text-slate-400">
					Memuat katalog mata pelajaran kelas...
				</p>
			</div>
		);
	}

	if (catalogItems.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-[#111927] p-16 text-center shadow-sm">
				<Layers className="size-12 text-slate-600" />
				<h3 className="mt-4 text-base font-semibold text-white">
					Belum ada penawaran kelas mata pelajaran
				</h3>
				<p className="mt-1 max-w-sm text-xs text-slate-400">
					Tidak ada mata pelajaran kelas yang tersedia untuk tahun ajaran atau
					filter yang dipilih.
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-slate-800/90 bg-[#111927] shadow-sm">
			<div className="overflow-x-auto">
				<table className="w-full border-collapse text-left text-xs">
					<thead>
						<tr className="border-b border-slate-800 bg-[#0d1526] text-slate-400">
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								KODE & MATA PELAJARAN
							</th>
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								BIDANG
							</th>
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								KELAS
							</th>
							<th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">
								BOBOT KREDIT
							</th>
							<th className="px-4 py-3 font-semibold uppercase tracking-wider">
								GURU PENGAMPU
							</th>
							<th className="px-4 py-3 text-center font-semibold uppercase tracking-wider">
								PENDAFTAR
							</th>
							<th className="px-4 py-3 text-right font-semibold uppercase tracking-wider">
								AKSI
							</th>
						</tr>
					</thead>

					<tbody className="divide-y divide-slate-800/60">
						{catalogItems.map((item) => {
							const enrolled = item.enrolledCount ?? 0;
							const isActive = getItemActive(item);

							return (
								<tr
									key={item.id}
									className="transition-colors hover:bg-slate-800/30"
								>
									{/* 1. Kode & Mata Pelajaran */}
									<td className="px-4 py-3">
										<div className="flex items-center gap-2.5">
											<div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-950/60 text-blue-400 ring-1 ring-blue-500/20">
												<BookOpen className="size-3.5" />
											</div>
											<div>
												<div className="flex items-center gap-1.5">
													{item.subjectCode && (
														<span className="font-mono text-[10px] font-bold text-blue-400">
															[{item.subjectCode}]
														</span>
													)}
													<p className="font-semibold text-white">
														{item.subjectName}
													</p>
												</div>
											</div>
										</div>
									</td>

									{/* 2. Bidang */}
									<td className="px-4 py-3">
										{item.departmentName ? (
											<span className="inline-flex items-center rounded-md border border-purple-500/30 bg-purple-950/40 px-2 py-0.5 text-[10px] font-medium text-purple-300">
												{item.departmentName}
											</span>
										) : (
											<span className="text-slate-500">-</span>
										)}
									</td>

									{/* 3. Kelas */}
									<td className="px-4 py-3">
										<span className="font-medium text-slate-200">
											{item.className}
										</span>
									</td>

									{/* 4. Bobot Kredit */}
									<td className="px-4 py-3 text-center">
										<span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-950/60 px-2.5 py-0.5 text-xs font-bold text-blue-300">
											{item.credits} SKS
										</span>
									</td>

									{/* 5. Guru Pengampu */}
									<td className="px-4 py-3">
										<span className="font-medium text-slate-300">
											{item.teacherName || "-"}
										</span>
									</td>

									{/* 6. Pendaftar */}
									<td className="px-4 py-3 text-center">
										<span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/80 px-2.5 py-0.5 text-xs font-semibold text-white">
											<Users className="size-3 text-slate-400" />
											<span>{enrolled} Siswa Terdaftar</span>
										</span>
									</td>

									{/* 7. Aksi (Toggle Status Mapel) */}
									<td className="px-4 py-3 text-right">
										<div className="flex items-center justify-end gap-2.5">
											<span
												className={`text-[11px] font-medium ${
													isActive ? "text-emerald-400" : "text-slate-500"
												}`}
											>
												{isActive ? "Aktif" : "Nonaktif"}
											</span>
											<Switch
												checked={isActive}
												onCheckedChange={(checked) =>
													handleToggle(item, checked)
												}
												aria-label={`Toggle status mapel ${item.subjectName}`}
											/>
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
};
