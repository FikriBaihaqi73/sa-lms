import { Search } from "lucide-react";
import { Select } from "@/components/ui/select";

interface Props {
	search: string;
	statusFilter: string;
	yearFilter: string;
	yearOptions: string[];
	onSearchChange: (v: string) => void;
	onStatusChange: (v: string) => void;
	onYearChange: (v: string) => void;
}

const STATUS_OPTIONS = ["Semua Status", "Aktif", "Tidak Aktif"];

export function AcademicYearsFilterBar(p: Props) {
	const box =
		"h-10 rounded-lg border border-slate-200 bg-white text-sm dark:border-slate-700 dark:bg-slate-800";
	return (
		<div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div className="grid grid-cols-1 gap-3 md:grid-cols-3">
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
					<input
						value={p.search}
						onChange={(e) => p.onSearchChange(e.target.value)}
						placeholder="Cari tahun ajaran..."
						className="h-10 w-full rounded-lg border border-slate-200 bg-transparent pl-9 pr-4 text-sm outline-none placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:placeholder:text-slate-500 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
					/>
				</div>
				<Select
					value={p.statusFilter}
					onChange={(e) => p.onStatusChange(e.target.value)}
					className={box}
				>
					{STATUS_OPTIONS.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</Select>
				<Select
					value={p.yearFilter}
					onChange={(e) => p.onYearChange(e.target.value)}
					className={box}
				>
					{p.yearOptions.map((o) => (
						<option key={o} value={o}>
							{o}
						</option>
					))}
				</Select>
			</div>
		</div>
	);
}