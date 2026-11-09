import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Teacher } from "../types";

function statusBadgeClass(statusName: string): string {
	const normalized = statusName.trim().toLowerCase();
	if (normalized.includes("tetap")) {
		return "border-emerald-200/70 bg-emerald-50 text-emerald-700 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300";
	}
	if (normalized.includes("honorer") || normalized.includes("kontrak")) {
		return "border-amber-200/70 bg-amber-50 text-amber-700 dark:border-amber-800/60 dark:bg-amber-950/60 dark:text-amber-300";
	}
	return "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300";
}

function initials(name: string): string {
	const parts = name.trim().split(/\s+/).filter(Boolean);
	if (parts.length === 0) return "G";
	if (parts.length === 1) return (parts[0] as string).slice(0, 2).toUpperCase();
	return `${(parts[0] as string).charAt(0)}${(parts[parts.length - 1] as string).charAt(0)}`.toUpperCase();
}

function formatJoinDate(dateStr?: string | null): string | null {
	if (!dateStr) return null;
	const date = new Date(dateStr);
	if (Number.isNaN(date.getTime())) return null;
	return new Intl.DateTimeFormat("id-ID", {
		day: "numeric",
		month: "short",
		year: "numeric",
	}).format(date);
}

export function TeacherRow({
	teacher,
	onEdit,
	onDelete,
}: {
	teacher: Teacher;
	onEdit: (teacher: Teacher) => void;
	onDelete: (teacher: Teacher) => void;
}) {
	const name =
		teacher.profile?.fullName?.trim() || `Guru #${teacher.teacher_number}`;
	const email = teacher.profile?.users?.email || teacher.profile?.email || null;
	const joinDateFormatted = formatJoinDate(teacher.join_date);
	const classCount =
		teacher._count?.classSubjects ?? teacher._count?.classes ?? 0;

	return (
		<tr className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 dark:border-slate-800/60 dark:hover:bg-slate-800/40">
			{/* Kolom 1: GURU */}
			<td className="px-5 py-4">
				<div className="flex items-center gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-blue-900/40 bg-blue-950 text-xs font-bold text-blue-300 dark:border-blue-800/60 dark:bg-blue-950 dark:text-blue-300">
						{initials(name)}
					</span>
					<div className="min-w-0">
						<p className="truncate font-semibold text-slate-900 dark:text-white">
							{name}
						</p>
						{email ? (
							<p className="truncate text-xs text-slate-500 dark:text-slate-400">
								{email}
							</p>
						) : (
							<span className="truncate text-xs italic text-slate-400 dark:text-slate-500">
								Belum ada email
							</span>
						)}
					</div>
				</div>
			</td>

			{/* Kolom 2: NIP */}
			<td className="px-5 py-4">
				<span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-200">
					{teacher.teacher_number || "—"}
				</span>
				{joinDateFormatted && (
					<p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500">
						Bergabung: {joinDateFormatted}
					</p>
				)}
			</td>

			{/* Kolom 3: DEPARTEMEN */}
			<td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
				{teacher.department?.name ? (
					<span>
						{teacher.department.name}
						{teacher.department.code && (
							<span className="ml-1 text-[11px] text-slate-400">
								({teacher.department.code})
							</span>
						)}
					</span>
				) : (
					<span className="text-slate-400 dark:text-slate-600">—</span>
				)}
			</td>

			{/* Kolom 4: SPESIALISASI */}
			<td className="px-5 py-4 text-xs text-slate-600 dark:text-slate-300">
				{teacher.specialization?.name ?? (
					<span className="text-slate-400 dark:text-slate-600">—</span>
				)}
			</td>

			{/* Kolom 5: STATUS */}
			<td className="px-5 py-4">
				{teacher.employment_status?.name ? (
					<span
						className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(
							teacher.employment_status.name,
						)}`}
					>
						{teacher.employment_status.name}
					</span>
				) : (
					<span className="text-xs text-slate-400 dark:text-slate-500">
						Tanpa status
					</span>
				)}
			</td>

			{/* Kolom 6: KELAS DIAMPU */}
			<td className="px-5 py-4 font-semibold tabular-nums">
				<span
					className={
						classCount === 0
							? "text-red-500 dark:text-red-400"
							: "text-slate-700 dark:text-slate-200"
					}
				>
					{classCount}
				</span>
			</td>

			{/* Kolom 7: AKSI */}
			<td className="px-5 py-4 text-right">
				<div className="flex items-center justify-end gap-1">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => onEdit(teacher)}
						className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-blue-400"
						title="Edit Data Guru"
						aria-label={`Ubah guru ${name}`}
					>
						<Pencil className="size-4" />
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						onClick={() => onDelete(teacher)}
						className="h-8 w-8 p-0 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400"
						title="Hapus Guru"
						aria-label={`Hapus guru ${name}`}
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			</td>
		</tr>
	);
}
