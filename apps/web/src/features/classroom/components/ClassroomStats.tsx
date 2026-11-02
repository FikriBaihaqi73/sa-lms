import { BookOpen, Building2, Database, Users } from "lucide-react";

interface ClassroomStatsProps {
	totalRooms: number;
	totalCapacity: number;
	totalBuildings: number;
	usedRooms: number;
	isLoading: boolean;
}

export function ClassroomStats({
	totalRooms,
	totalCapacity,
	totalBuildings,
	usedRooms,
	isLoading,
}: ClassroomStatsProps) {
	const format = (value: number | string) =>
		typeof value === "number" ? value.toLocaleString("id-ID") : value;

	const cards = [
		{
			icon: BookOpen,
			label: "Total Ruangan",
			value: isLoading ? "..." : format(totalRooms),
			subtitle: "ruang kelas aktif",
			tone: "bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400",
		},
		{
			icon: Database,
			label: "Total Kapasitas",
			value: isLoading ? "..." : format(totalCapacity),
			subtitle: "total kursi",
			tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
		},
		{
			icon: Building2,
			label: "Jumlah Gedung",
			value: isLoading ? "..." : format(totalBuildings),
			subtitle: "gedung yang dipakai",
			tone: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400",
		},
		{
			icon: Users,
			label: "Ruangan Terpakai",
			value: isLoading ? "..." : `${format(usedRooms)} / ${format(totalRooms)}`,
			subtitle: "terpakai dari total",
			tone: "bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400",
		},
	] as const;

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{cards.map((card) => (
				<div
					key={card.label}
					className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800"
				>
					<span className={`rounded-xl p-3 ${card.tone}`}>
						<card.icon className="size-5" />
					</span>
					<div>
						<p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
							{card.label}
						</p>
						<p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
							{card.value}
						</p>
						<p className="text-xs text-slate-400 dark:text-slate-500">
							{card.subtitle}
						</p>
					</div>
				</div>
			))}
		</div>
	);
}
