import { Download, RefreshCw, Search, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export function InstitutionsFilterBar() {
	return (
		<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-2">
			<div className="relative flex-1 sm:max-w-md">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
				<Input
					type="text"
					placeholder="Cari nama, kode, atau kota institusi..."
					className="pl-9 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 focus-visible:ring-blue-500"
				/>
			</div>

			<div className="flex flex-wrap items-center gap-3">
				<Select
					defaultValue="Semua Status"
					className="w-[140px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200"
				>
					<option value="Semua Status">Semua Status</option>
					<option value="Aktif">Aktif</option>
					<option value="Nonaktif">Nonaktif</option>
					<option value="Trial">Trial</option>
				</Select>

				<Select
					defaultValue="Semua Jenis"
					className="w-[140px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200"
				>
					<option value="Semua Jenis">Semua Jenis</option>
					<option value="Sekolah">Sekolah</option>
					<option value="Kampus">Kampus</option>
					<option value="Perusahaan">Perusahaan</option>
					<option value="Lembaga Kursus">Lembaga Kursus</option>
				</Select>

				<div className="flex items-center gap-2 border-l border-slate-200 pl-3 dark:border-slate-700">
					<Button
						variant="outline"
						className="h-10 border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
					>
						<Download className="size-4 mr-2" />
						Unduh CSV
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-10 w-10 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
					>
						<RefreshCw className="size-4" />
					</Button>
					<Button
						variant="outline"
						size="icon"
						className="h-10 w-10 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
					>
						<Settings2 className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
