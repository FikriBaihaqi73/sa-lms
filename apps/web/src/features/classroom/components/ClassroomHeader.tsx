import { Plus, Search } from "lucide-react";

interface ClassroomHeaderProps {
	onOpenCreate: () => void;
}

export function ClassroomHeader({ onOpenCreate }: ClassroomHeaderProps) {
	return (
		<header>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
				<div>
					<div className="mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
						<Search className="size-5" />
						<span className="text-xs font-bold uppercase tracking-wider">
							DATA RUANGAN
						</span>
					</div>
					<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
						Ruang Kelas
					</h1>
					<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
						Kelola ruangan fisik yang dipakai untuk jadwal pelajaran di
						institusi Anda.
					</p>
				</div>
				<button
					type="button"
					onClick={onOpenCreate}
					className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-700"
				>
					<span className="flex items-center gap-2">
						<Plus className="size-4" />
						Tambah Ruang Kelas
					</span>
				</button>
			</div>
		</header>
	);
}
