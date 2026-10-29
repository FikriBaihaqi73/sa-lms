import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Classroom } from "../types";

interface ClassroomTableProps {
	rows: Classroom[];
	isLoading: boolean;
	isError: boolean;
	searchTerm: string;
	config: {
		scheduleCount: boolean;
	};
	onRetry: () => void;
	onEdit: (item: Classroom) => void;
	onDelete: (item: Classroom) => void;
}

export function ClassroomTable({
	rows,
	isLoading,
	isError,
	searchTerm,
	config,
	onRetry,
	onEdit,
	onDelete,
}: ClassroomTableProps) {
	if (isLoading) {
		return (
			<div className="space-y-4 overflow-hidden rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
				{[1, 2, 3, 4].map((_item) => (
					<div
						key={_item}
						className="h-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800/60"
					/>
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<div className="rounded-xl border border-red-200 bg-red-50/50 p-8 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
				<p className="font-semibold">Gagal memuat data ruang kelas</p>
				<p className="text-sm opacity-90">
					Pastikan backend terhubung di VITE_API_URL.
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
					{searchTerm ? "Data tidak ditemukan" : "Belum ada ruang kelas"}
				</p>
				<p className="mt-1 text-sm">
					{searchTerm
						? "Coba ubah kata kunci atau filter."
						: "Klik Tambah Ruang Kelas untuk menambahkan data."}
				</p>
			</div>
		);
	}

	return (
		<div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
			<div className="overflow-x-auto">
				<table className="w-full min-w-[860px] text-left text-sm">
					<thead className="border-b border-slate-200 bg-slate-100/80 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
						<tr>
							<th className="px-5 py-3.5">Ruangan</th>
							<th className="px-5 py-3.5">Kode</th>
							<th className="px-5 py-3.5">Gedung</th>
							<th className="px-5 py-3.5">Lantai</th>
							<th className="px-5 py-3.5">Kapasitas</th>
							{config.scheduleCount && <th className="px-5 py-3.5">Jadwal</th>}
							<th className="px-5 py-3.5 text-right">Aksi</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
						{rows.map((item) => (
							<tr
								key={item.id}
								className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
							>
								<td className="px-5 py-4">
									<div className="font-semibold text-slate-900 dark:text-slate-100">
										{item.roomName}
									</div>
									<div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
										{item.description ?? ""}
									</div>
								</td>
								<td className="px-5 py-4">
									<Badge variant="outline" className="font-mono">
										{item.roomCode}
									</Badge>
								</td>
								<td className="px-5 py-4 text-slate-600 dark:text-slate-400">
									{item.building ?? ""}
								</td>
								<td className="px-5 py-4 text-slate-600 dark:text-slate-400">
									{item.floor ? `Lantai ${item.floor}` : ""}
								</td>
								<td className="px-5 py-4 text-slate-600 dark:text-slate-400">
									{item.capacity ? `${item.capacity} kursi` : ""}
								</td>
								{config.scheduleCount ? (
									<td className="px-5 py-4 text-slate-600 dark:text-slate-400">
										<Badge
											variant={
												item._count?.schedules && item._count.schedules > 0
													? "default"
													: "secondary"
											}
											className={
												item._count?.schedules && item._count.schedules > 0
													? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
													: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
											}
										>
											{item._count?.schedules ?? 0} jadwal
										</Badge>
									</td>
								) : (
									<td className="px-5 py-4" />
								)}
								<td className="px-5 py-4 text-right">
									<div className="flex items-center justify-end gap-1.5 opacity-90 transition-opacity group-hover:opacity-100">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onEdit(item)}
											className="h-8 px-2.5 text-slate-700 dark:border-slate-700 dark:text-slate-300"
											title="Ubah"
										>
											Ubah
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => onDelete(item)}
											className="h-8 px-2.5 text-red-600 dark:border-slate-700 dark:text-red-400"
											title="Hapus"
										>
											Hapus
										</Button>
									</div>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
