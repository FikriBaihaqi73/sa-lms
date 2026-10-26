import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { ClassOption, ClassStudentStatusFilter } from "../types";

interface ClassStudentsFilterProps {
	searchTerm: string;
	onSearchChange: (value: string) => void;
	selectedClassId: string;
	onClassChange: (classId: string) => void;
	selectedStatus: ClassStudentStatusFilter;
	onStatusChange: (status: ClassStudentStatusFilter) => void;
	classes: ClassOption[];
	isLoadingClasses?: boolean;
}

export function ClassStudentsFilter({
	searchTerm,
	onSearchChange,
	selectedClassId,
	onClassChange,
	selectedStatus,
	onStatusChange,
	classes,
	isLoadingClasses = false,
}: ClassStudentsFilterProps) {
	return (
		<div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
			{/* Kolom Pencarian di kiri */}
			<div className="relative w-full sm:w-80">
				<label htmlFor="search-class-student" className="sr-only">
					Cari penempatan siswa
				</label>
				<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
				<Input
					id="search-class-student"
					type="search"
					value={searchTerm}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Cari nama, NIM, kelas..."
					className="h-10 pl-9 dark:bg-slate-950"
				/>
			</div>

			{/* Dua dropdown berdampingan di kanan */}
			<div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
				{/* 1. Dropdown Kelas */}
				<div className="w-full sm:w-56">
					<label htmlFor="filter-class" className="sr-only">
						Filter Kelas
					</label>
					<Select
						id="filter-class"
						disabled={isLoadingClasses}
						value={selectedClassId}
						onChange={(e) => onClassChange(e.target.value)}
						className="h-10 w-full dark:bg-slate-950"
					>
						<option value="">Semua kelas</option>
						{classes.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name} {c.academicYear ? `(TA ${c.academicYear})` : ""}
							</option>
						))}
					</Select>
				</div>

				{/* 2. Dropdown Status */}
				<div className="w-full sm:w-40">
					<label htmlFor="filter-status" className="sr-only">
						Filter Status
					</label>
					<Select
						id="filter-status"
						value={selectedStatus}
						onChange={(e) =>
							onStatusChange(e.target.value as ClassStudentStatusFilter)
						}
						className="h-10 w-full dark:bg-slate-950"
					>
						<option value="active">Aktif</option>
						<option value="deleted">Dikeluarkan</option>
					</Select>
				</div>
			</div>
		</div>
	);
}
