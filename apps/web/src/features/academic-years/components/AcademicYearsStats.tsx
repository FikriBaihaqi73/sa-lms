import { BarChart3, CircleAlert, CircleCheckBig, History } from "lucide-react";

interface Props {
	total: number;
	active: number;
	inactive: number;
	recent: number;
	isLoading: boolean;
}

export function AcademicYearsStats({
	total,
	active,
	inactive,
	recent,
	isLoading,
}: Props) {
	const cards = [
		{
			icon: BarChart3,
			tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
			value: isLoading ? "..." : String(total),
			label: "Total Tahun Ajaran",
		},
		{
			icon: CircleCheckBig,
			tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
			value: isLoading ? "..." : String(active),
			label: "Aktif",
		},
		{
			icon: CircleAlert,
			tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
			value: isLoading ? "..." : String(inactive),
			label: "Tidak Aktif",
		},
		{
			icon: History,
			tone: "bg-teal-50 text-teal-600 dark:bg-teal-950/60 dark:text-teal-300",
			value: isLoading ? "..." : String(recent),
			label: "Ditambahkan 30 Hari Terakhir",
		},
	];
	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((c) => (
				<div
					key={c.label}
					className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
				>
					<span className={`grid size-12 place-items-center rounded-xl ${c.tone}`}>
						<c.icon className="size-6" />
					</span>
					<div>
						<p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
							{c.value}
						</p>
						<p className="text-xs font-medium text-slate-500 dark:text-slate-400">
							{c.label}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}