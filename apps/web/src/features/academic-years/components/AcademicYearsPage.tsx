import { useMemo, useState } from "react";
import { CalendarRange, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAcademicYears } from "../hooks/useAcademicYears";
import type { AcademicYear } from "../types";
import { AcademicYearDialog } from "./AcademicYearDialog";
import { AcademicYearsFilterBar } from "./AcademicYearsFilterBar";
import { AcademicYearsStats } from "./AcademicYearsStats";
import { AcademicYearsTable } from "./AcademicYearsTable";
import { DeleteAcademicYearDialog } from "./DeleteAcademicYearDialog";

// Dihitung sekali saat module load (bukan saat render) agar tetap pure.
const RECENT_CUTOFF = Date.now() - 30 * 24 * 60 * 60 * 1000;

export function AcademicYearsPage() {
	const {
		data: academicYears = [],
		isPending,
		isError,
		error,
	} = useAcademicYears();

	const [search, setSearch] = useState("");
	const [statusFilter, setStatusFilter] = useState("Semua Status");
	const [yearFilter, setYearFilter] = useState("Semua Tahun");

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [selectedItem, setSelectedItem] = useState<AcademicYear | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

	const yearOptions = useMemo(() => {
		const years = new Set(academicYears.map((item) => item.academic_year));
		return ["Semua Tahun", ...Array.from(years).sort().reverse()];
	}, [academicYears]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return academicYears.filter((item) => {
			const matchesSearch = !q || item.academic_year.toLowerCase().includes(q);
			const matchesStatus =
				statusFilter === "Semua Status" ||
				(statusFilter === "Aktif" ? item.is_active : !item.is_active);
			const matchesYear =
				yearFilter === "Semua Tahun" || item.academic_year === yearFilter;
			return matchesSearch && matchesStatus && matchesYear;
		});
	}, [academicYears, search, statusFilter, yearFilter]);

	const stats = useMemo(() => {
		const active = filtered.filter((item) => item.is_active).length;
		const inactive = filtered.length - active;
		const recent = filtered.filter((item) => {
			const timestamp = item.created_at ? Date.parse(item.created_at) : Number.NaN;
			return !Number.isNaN(timestamp) && timestamp >= RECENT_CUTOFF;
		}).length;
		return { total: filtered.length, active, inactive, recent };
	}, [filtered]);

	const handleEdit = (item: AcademicYear) => {
		setSelectedItem(item);
		setIsEditDialogOpen(true);
	};

	const handleDelete = (item: AcademicYear) => {
		setSelectedItem(item);
		setIsDeleteDialogOpen(true);
	};

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
							<CalendarRange className="size-3.5" /> Portal Akademik
						</span>
						<h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
							Manajemen Tahun Ajaran (Academic Years)
						</h1>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
							Kelola tahun ajaran dan status aktifnya sebagai referensi kelas,
							jadwal, dan nilai.
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button type="button" onClick={() => setIsCreateDialogOpen(true)}>
							<Plus className="size-4" /> Add Academic Year
						</Button>
					</div>
				</header>

				{isError && (
					<div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
						{error instanceof Error
							? error.message
							: "Gagal memuat data tahun ajaran."}
					</div>
				)}

				<AcademicYearsStats
					total={stats.total}
					active={stats.active}
					inactive={stats.inactive}
					recent={stats.recent}
					isLoading={isPending}
				/>
				<AcademicYearsFilterBar
					search={search}
					statusFilter={statusFilter}
					yearFilter={yearFilter}
					yearOptions={yearOptions}
					onSearchChange={setSearch}
					onStatusChange={setStatusFilter}
					onYearChange={setYearFilter}
				/>
				<AcademicYearsTable
					rows={filtered}
					totalCount={academicYears.length}
					isLoading={isPending}
					onEdit={handleEdit}
					onDelete={handleDelete}
				/>
			</div>

			<AcademicYearDialog
				open={isCreateDialogOpen}
				onOpenChange={setIsCreateDialogOpen}
				academicYear={null}
			/>
			<AcademicYearDialog
				open={isEditDialogOpen}
				onOpenChange={setIsEditDialogOpen}
				academicYear={selectedItem}
			/>
			<DeleteAcademicYearDialog
				open={isDeleteDialogOpen}
				onOpenChange={setIsDeleteDialogOpen}
				academicYear={selectedItem}
			/>
		</main>
	);
}
