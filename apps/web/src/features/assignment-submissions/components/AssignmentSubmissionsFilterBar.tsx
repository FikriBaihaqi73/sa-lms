import { RotateCcw } from "lucide-react";
import type React from "react";
import type { UseFormRegister } from "react-hook-form";
import type {
	AssignmentDataset,
	AssignmentSubmissionsFilterValues,
	SubmissionPageState,
} from "../types";

interface AssignmentSubmissionsFilterBarProps {
	register: UseFormRegister<AssignmentSubmissionsFilterValues>;
	ready: Extract<SubmissionPageState, { kind: "ready" }> | null;
	classes: { id: string; name: string; yearId: string }[];
	assignments: AssignmentDataset[];
	filters: Partial<AssignmentSubmissionsFilterValues>;
	onYearChange: (value: string) => void;
	onClassChange: (value: string) => void;
	onAssignmentChange: (value: string) => void;
	onSearchChange: (value: string) => void;
	onReset: () => void;
}

const controlClass =
	"h-11 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 text-sm text-white focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-50";
const buttonClass =
	"inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm font-medium text-slate-200 hover:bg-slate-700 hover:text-white focus-visible:outline-2 focus-visible:outline-blue-500 disabled:opacity-40";

export const AssignmentSubmissionsFilterBar: React.FC<
	AssignmentSubmissionsFilterBarProps
> = ({
	register,
	ready,
	classes,
	assignments,
	filters,
	onYearChange,
	onClassChange,
	onAssignmentChange,
	onSearchChange,
	onReset,
}) => {
	const hasAssignment = Boolean(filters.assignment);
	const hasYear = Boolean(filters.year);
	const hasClass = Boolean(filters.classroom);

	return (
		<div className="grid items-end gap-4 rounded-xl border border-slate-700/80 bg-slate-900/60 p-5 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_1fr_1.2fr_auto]">
			<label className="space-y-1.5 text-xs font-medium text-slate-300">
				<span>Tahun Akademik</span>
				<select
					{...register("year")}
					disabled={!ready}
					className={controlClass}
					onChange={(e) => onYearChange(e.target.value)}
				>
					<option value="">Pilih tahun akademik</option>
					{ready?.years.map((item) => (
						<option key={item.id} value={item.id}>
							{item.name}
						</option>
					))}
				</select>
			</label>

			<label className="space-y-1.5 text-xs font-medium text-slate-300">
				<span>Kelas</span>
				<select
					{...register("classroom")}
					disabled={!hasYear || !ready}
					className={controlClass}
					onChange={(e) => onClassChange(e.target.value)}
				>
					<option value="">Pilih kelas</option>
					{classes.map((item) => (
						<option key={item.id} value={item.id}>
							{item.name}
						</option>
					))}
				</select>
			</label>

			<label className="space-y-1.5 text-xs font-medium text-slate-300">
				<span>Tugas</span>
				<select
					{...register("assignment")}
					disabled={!hasClass}
					className={controlClass}
					onChange={(e) => onAssignmentChange(e.target.value)}
				>
					<option value="">Pilih tugas</option>
					{assignments.map((item) => (
						<option key={item.id} value={item.id}>
							{item.title}
						</option>
					))}
				</select>
			</label>

			<label className="space-y-1.5 text-xs font-medium text-slate-300">
				<span className="sr-only">Cari nama siswa</span>
				<input
					{...register("search")}
					disabled={!hasAssignment}
					className={controlClass}
					placeholder="Cari nama siswa…"
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</label>

			<button type="button" className={buttonClass} onClick={onReset}>
				<RotateCcw className="size-4" /> Reset
			</button>
		</div>
	);
};
