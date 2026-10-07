import { Building2, GraduationCap, MapPin, Sparkles } from "lucide-react";

interface InstitutionsStatsProps {
	total: number;
	levelCount: number;
	cityCount: number;
	newThisMonth: number;
	isLoading: boolean;
}

const cardClass =
	"rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md dark:border-slate-700/60 dark:bg-slate-800 dark:hover:border-blue-800 dark:hover:shadow-lg";

export function InstitutionsStats(props: InstitutionsStatsProps) {
	const { total, levelCount, cityCount, newThisMonth, isLoading } = props;
	const display = (value: number) =>
		isLoading ? "…" : value.toLocaleString("id-ID");
	return (
		<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{/* Total Institusi */}
			<div className={cardClass}>
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
							TOTAL INSTITUSI
						</p>
						<p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
							{display(total)}
						</p>
					</div>
					<div className="flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
						<Building2 className="size-5" />
					</div>
				</div>
				<div className="mt-4 flex items-center text-xs text-emerald-600 dark:text-emerald-400">
					<Sparkles className="mr-1 size-3" />
					<span className="font-medium">
						+{display(newThisMonth)} Institusi
					</span>
					<span className="ml-1 text-slate-500 dark:text-slate-400">
						bulan ini
					</span>
				</div>
			</div>

			{/* Total Jenjang */}
			<div className={cardClass}>
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
							TOTAL JENJANG
						</p>
						<p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">
							{display(levelCount)}
						</p>
					</div>
					<div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
						<GraduationCap className="size-5" />
					</div>
				</div>
				<div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
					Jenjang terdaftar di sistem
				</div>
			</div>

			{/* Kota Terjangkau */}
			<div className={cardClass}>
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
							KOTA TERJANGKAU
						</p>
						<p className="mt-2 text-3xl font-bold text-amber-500">
							{display(cityCount)}
						</p>
					</div>
					<div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
						<MapPin className="size-5" />
					</div>
				</div>
				<div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
					Kota unik dari data halaman ini
				</div>
			</div>

			{/* Baru Bulan Ini */}
			<div className={cardClass}>
				<div className="flex items-start justify-between">
					<div>
						<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider dark:text-slate-400">
							BARU BULAN INI
						</p>
						<p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-50">
							{display(newThisMonth)}
						</p>
					</div>
					<div className="flex size-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
						<Building2 className="size-5" />
					</div>
				</div>
				<div className="mt-4 flex items-center text-xs text-slate-500 dark:text-slate-400">
					Institusi dibuat bulan berjalan
				</div>
			</div>
		</div>
	);
}
