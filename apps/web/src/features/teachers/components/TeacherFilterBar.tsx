import { Download, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { TeacherReference } from "../types";

interface TeacherFilterBarProps {
	search: string;
	statusId: string;
	specializationId: string;
	departmentId?: string;
	statuses: TeacherReference[];
	specializations: TeacherReference[];
	departments?: TeacherReference[];
	onSearchChange: (value: string) => void;
	onStatusChange: (value: string) => void;
	onSpecializationChange: (value: string) => void;
	onDepartmentChange?: (value: string) => void;
}

export function TeacherFilterBar({
	search,
	statusId,
	specializationId,
	departmentId = "",
	statuses,
	specializations,
	departments = [],
	onSearchChange,
	onStatusChange,
	onSpecializationChange,
	onDepartmentChange,
}: TeacherFilterBarProps) {
	return (
		<div className="flex flex-col gap-2.5 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center">
			<div className="relative min-w-0 flex-1">
				<span className="sr-only">Cari guru</span>
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
				<Input
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
					placeholder="Cari nama, email, atau NIP..."
					className="h-10 pl-9"
				/>
			</div>
			<div className="flex flex-wrap items-center gap-2">
				<Select
					value={statusId}
					onChange={(event) => onStatusChange(event.target.value)}
					className="h-10 w-full sm:w-44"
					aria-label="Filter status kepegawaian"
				>
					<option value="">Semua status</option>
					{statuses.map((status) => (
						<option key={status.id} value={status.id}>
							{status.name}
						</option>
					))}
				</Select>
				<Select
					value={specializationId}
					onChange={(event) => onSpecializationChange(event.target.value)}
					className="h-10 w-full sm:w-48"
					aria-label="Filter spesialisasi"
				>
					<option value="">Semua spesialisasi</option>
					{specializations.map((specialization) => (
						<option key={specialization.id} value={specialization.id}>
							{specialization.name}
						</option>
					))}
				</Select>
				{departments.length > 0 && onDepartmentChange && (
					<Select
						value={departmentId}
						onChange={(event) => onDepartmentChange(event.target.value)}
						className="h-10 w-full sm:w-44"
						aria-label="Filter departemen"
					>
						<option value="">Semua departemen</option>
						{departments.map((dept) => (
							<option key={dept.id} value={dept.id}>
								{dept.name}
							</option>
						))}
					</Select>
				)}
				<Button
					type="button"
					variant="outline"
					className="h-10 border-slate-200 bg-white hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
					onClick={() => {
						const csvRows = [
							["Nama", "Email", "NIP", "Departemen", "Spesialisasi", "Status"],
						];
						const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
						const url = URL.createObjectURL(blob);
						const a = document.createElement("a");
						a.href = url;
						a.download = `data-guru-${new Date().toISOString().slice(0, 10)}.csv`;
						a.click();
						URL.revokeObjectURL(url);
					}}
					title="Ekspor daftar guru"
				>
					<Download className="mr-2 size-4" /> Ekspor
				</Button>
			</div>
		</div>
	);
}
