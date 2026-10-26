import { BookOpenCheck, CalendarCheck, UserMinus, Users } from "lucide-react";
import type { ClassStudentsSummary } from "../types";
import { getCardSubtitle } from "../utils";

interface ClassStudentsStatsProps {
	summary?: ClassStudentsSummary;
	selectedClassName?: string | null;
	isLoading: boolean;
	isError: boolean;
}

const cardClass =
	"flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900";

export function ClassStudentsStats({
	summary,
	selectedClassName,
	isLoading,
	isError,
}: ClassStudentsStatsProps) {
	const renderCardContent = (
		label: string,
		value: string | number | undefined,
		subtitle: string,
	) => {
		if (isLoading) {
			return (
				<div className="space-y-1.5">
					<div className="h-3 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
					<div className="h-7 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
					<div className="h-2.5 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
				</div>
			);
		}

		// Jika error atau summary belum tersedia, tampilkan "0" bukan pesan error
		const displayValue =
			isError || value === undefined
				? "0"
				: typeof value === "number"
					? value.toLocaleString("id-ID")
					: value;

		const displaySubtitle =
			isError || summary === undefined ? "Belum ada data" : subtitle;

		return (
			<div>
				<p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
					{label}
				</p>
				<p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
					{displayValue}
				</p>
				<p className="text-[11px] text-slate-400 dark:text-slate-500">
					{displaySubtitle}
				</p>
			</div>
		);
	};

	return (
		<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{/* 1. Total Penempatan */}
			<div className={cardClass}>
				<div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/60 dark:text-blue-400">
					<Users className="size-5" />
				</div>
				{renderCardContent(
					"Total Penempatan",
					summary?.totalActive,
					getCardSubtitle("total", selectedClassName),
				)}
			</div>

			{/* 2. Baru Bergabung */}
			<div className={cardClass}>
				<div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/60 dark:text-emerald-400">
					<CalendarCheck className="size-5" />
				</div>
				{renderCardContent(
					"Baru Bergabung",
					summary?.recentJoined,
					getCardSubtitle("recent", selectedClassName),
				)}
			</div>

			{/* 3. Dikeluarkan */}
			<div className={cardClass}>
				<div className="rounded-lg border border-amber-100 bg-amber-50 p-3 text-amber-600 dark:border-amber-900/50 dark:bg-amber-950/60 dark:text-amber-400">
					<UserMinus className="size-5" />
				</div>
				{renderCardContent(
					"Dikeluarkan",
					summary?.totalDeleted,
					getCardSubtitle("deleted", selectedClassName),
				)}
			</div>

			{/* 4. Kelas Terisi */}
			<div className={cardClass}>
				<div className="rounded-lg border border-violet-100 bg-violet-50 p-3 text-violet-600 dark:border-violet-900/50 dark:bg-violet-950/60 dark:text-violet-400">
					<BookOpenCheck className="size-5" />
				</div>
				{renderCardContent(
					"Kelas Terisi",
					summary
						? `${summary.filledClassesCount} / ${summary.totalClassesCount}`
						: isError
							? "0 / 0"
							: undefined,
					getCardSubtitle("filled", selectedClassName),
				)}
			</div>
		</div>
	);
}
