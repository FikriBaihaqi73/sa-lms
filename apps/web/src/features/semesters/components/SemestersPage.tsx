import { useDeferredValue, useState } from "react";
import { CalendarRange, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAcademicYears } from "@/features/academic-years/hooks/useAcademicYears";
import { useSemesters } from "../hooks/useSemesters";
import type { Semester } from "../types";
import { DeleteSemesterDialog } from "./DeleteSemesterDialog";
import { SemesterDialog } from "./SemesterDialog";
import { SemestersFilterBar } from "./SemestersFilterBar";
import { SemestersTable } from "./SemestersTable";

const PAGE_LIMIT = 10;

export function SemestersPage() {
	const [search, setSearch] = useState("");
	const deferredSearch = useDeferredValue(search);
	const [academicYearId, setAcademicYearId] = useState("");
	const [page, setPage] = useState(1);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

	const academicYearsQuery = useAcademicYears();
	const semestersQuery = useSemesters({
		page,
		limit: PAGE_LIMIT,
		search: deferredSearch.trim() || undefined,
		academic_year_id: academicYearId || undefined,
	});

	const semesters = semestersQuery.data?.data ?? [];
	const meta = semestersQuery.data?.meta;
	const academicYears = academicYearsQuery.data ?? [];

	const openCreateDialog = () => {
		setSelectedSemester(null);
		setIsDialogOpen(true);
	};

	const openEditDialog = (semester: Semester) => {
		setSelectedSemester(semester);
		setIsDialogOpen(true);
	};

	const openDeleteDialog = (semester: Semester) => {
		setSelectedSemester(semester);
		setIsDeleteDialogOpen(true);
	};

	const handleSearchChange = (value: string) => {
		setSearch(value);
		setPage(1);
	};

	const handleAcademicYearChange = (value: string) => {
		setAcademicYearId(value);
		setPage(1);
	};

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				<header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
					<div>
						<span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-400">
							<CalendarRange className="size-3.5" /> Portal Akademik
						</span>
						<h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Manajemen Semester</h1>
						<p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Kelola semester dan periode akademik pada institusi Anda.</p>
					</div>
					<Button type="button" onClick={openCreateDialog}><Plus className="size-4" /> Tambah Semester</Button>
				</header>

				<SemestersFilterBar
					search={search}
					academicYearId={academicYearId}
					academicYears={academicYears}
					onSearchChange={handleSearchChange}
					onAcademicYearChange={handleAcademicYearChange}
				/>
				<SemestersTable
					rows={semesters}
					meta={meta}
					isLoading={semestersQuery.isPending}
					isError={semestersQuery.isError}
					errorMessage={semestersQuery.error instanceof Error ? semestersQuery.error.message : undefined}
					onEdit={openEditDialog}
					onDelete={openDeleteDialog}
					onPageChange={setPage}
				/>
			</div>

			<SemesterDialog
				open={isDialogOpen}
				onOpenChange={(open) => { setIsDialogOpen(open); if (!open) setSelectedSemester(null); }}
				semester={selectedSemester}
				academicYears={academicYears}
				isAcademicYearsLoading={academicYearsQuery.isPending}
				isAcademicYearsError={academicYearsQuery.isError}
			/>
			<DeleteSemesterDialog
				open={isDeleteDialogOpen}
				onOpenChange={(open) => { setIsDeleteDialogOpen(open); if (!open) setSelectedSemester(null); }}
				semester={selectedSemester}
			/>
		</main>
	);
}

