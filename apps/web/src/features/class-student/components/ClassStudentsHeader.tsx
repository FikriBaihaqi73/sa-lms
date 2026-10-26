import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClassStudentsHeaderProps {
	onOpenCreate: () => void;
}

export function ClassStudentsHeader({
	onOpenCreate,
}: ClassStudentsHeaderProps) {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div>
				<div className="mb-2 flex items-center gap-2 text-blue-700 dark:text-blue-400">
					<Users className="size-5" />
					<span className="text-xs font-bold uppercase tracking-wider">
						Penempatan Siswa
					</span>
				</div>
				<h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
					Kelas Siswa
				</h1>
				<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
					Kelola penempatan siswa pada kelas di institusi Anda.
				</p>
			</div>
			<div>
				<Button
					type="button"
					onClick={onOpenCreate}
					className="h-10 bg-blue-700 font-semibold text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
				>
					<Plus className="mr-2 size-4" /> Tambah Siswa ke Kelas
				</Button>
			</div>
		</div>
	);
}
