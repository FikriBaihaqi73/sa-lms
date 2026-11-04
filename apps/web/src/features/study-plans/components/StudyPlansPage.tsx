import { ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import {
	useAcademicYearsOptions,
	useClassSubjectsOptions,
	useCreateStudyPlan,
	useDeleteStudyPlan,
	useStudentsOptions,
	useStudyPlans,
	useUpdateStudyPlan,
} from "../hooks";
import type { StudyPlanFormValues } from "../schemas";
import type { StudyPlan } from "../types";
import { DeleteStudyPlanDialog } from "./DeleteStudyPlanDialog";
import { StudyPlanDialog } from "./StudyPlanDialog";
import { StudyPlansFilterBar } from "./StudyPlansFilterBar";
import { StudyPlansHeader } from "./StudyPlansHeader";
import { StudyPlansStats } from "./StudyPlansStats";
import { StudyPlansTable } from "./StudyPlansTable";

function errorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		if (error.status === 409) {
			return "Siswa ini sudah terdaftar pada mata pelajaran kelas dan tahun ajaran tersebut.";
		}
		if (error.status === 500) {
			return "Terjadi kesalahan pada server. Silakan coba lagi atau hubungi administrator.";
		}
		if (error.fieldErrors.length > 0) {
			return `${error.message}: ${error.fieldErrors
				.map(({ field, message }) => `${field || "field"} - ${message}`)
				.join("; ")}`;
		}
		return error.message;
	}
	if (error instanceof Error) return error.message;
	return "Terjadi kesalahan. Silakan coba lagi.";
}

export function StudyPlansPage() {
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search);
	const [currentPage, setCurrentPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
	const [selectedClassSubjectId, setSelectedClassSubjectId] = useState("");

	const [isAdding, setIsAdding] = useState(false);
	const [editing, setEditing] = useState<StudyPlan | null>(null);
	const [deleting, setDeleting] = useState<StudyPlan | null>(null);
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);

	// Queries
	const listQuery = useStudyPlans({
		page: currentPage,
		limit,
		search: debouncedSearch.trim() || undefined,
		academic_year_id: selectedAcademicYearId || undefined,
		class_subject_id: selectedClassSubjectId || undefined,
	});

	const studentsQuery = useStudentsOptions();
	const classSubjectsQuery = useClassSubjectsOptions();
	const academicYearsQuery = useAcademicYearsOptions();

	// Mutations
	const createMutation = useCreateStudyPlan();
	const updateMutation = useUpdateStudyPlan();
	const deleteMutation = useDeleteStudyPlan();

	const rows = useMemo(() => listQuery.data?.data ?? [], [listQuery.data?.data]);
	const meta = listQuery.data?.meta ?? null;

	const studentsList = studentsQuery.data ?? [];
	const classSubjectsList = classSubjectsQuery.data ?? [];
	const academicYearsList = academicYearsQuery.data ?? [];

	// Summary stats calculation
	const totalStudyPlans = meta?.totalData ?? rows.length;

	const totalUniqueStudents = useMemo(() => {
		const studentIds = new Set<string>();
		for (const row of rows) {
			if (row.student_id) studentIds.add(row.student_id);
		}
		return studentIds.size;
	}, [rows]);

	const totalUniqueClassSubjects = useMemo(() => {
		const csIds = new Set<string>();
		for (const row of rows) {
			if (row.class_subject_id) csIds.add(row.class_subject_id);
		}
		return csIds.size;
	}, [rows]);

	const activeAcademicYearName = useMemo(() => {
		const active = academicYearsList.find((ay) => ay.is_active);
		return active?.academic_year || "";
	}, [academicYearsList]);

	const handleCreate = async (values: StudyPlanFormValues) => {
		try {
			await createMutation.mutateAsync({
				student_id: values.student_id,
				class_subject_id: values.class_subject_id,
				academic_year_id: values.academic_year_id,
			});
			setIsAdding(false);
			setNotice({
				kind: "success",
				message: "Rencana studi berhasil ditambahkan.",
			});
			toast.success("Rencana studi berhasil ditambahkan.");
		} catch (error) {
			setNotice({ kind: "error", message: errorMessage(error) });
			toast.error(errorMessage(error));
		}
	};

	const handleUpdate = async (values: StudyPlanFormValues) => {
		if (!editing) return;
		try {
			await updateMutation.mutateAsync({
				id: editing.id,
				input: {
					student_id: values.student_id,
					class_subject_id: values.class_subject_id,
					academic_year_id: values.academic_year_id,
				},
			});
			setEditing(null);
			setNotice({
				kind: "success",
				message: "Rencana studi berhasil diperbarui.",
			});
			toast.success("Rencana studi berhasil diperbarui.");
		} catch (error) {
			setNotice({ kind: "error", message: errorMessage(error) });
			toast.error(errorMessage(error));
		}
	};

	const handleDelete = async () => {
		if (!deleting) return;
		try {
			await deleteMutation.mutateAsync(deleting.id);
			setDeleting(null);
			setNotice({
				kind: "success",
				message: "Rencana studi berhasil dihapus.",
			});
			toast.success("Rencana studi berhasil dihapus.");
		} catch (error) {
			setNotice({ kind: "error", message: errorMessage(error) });
			toast.error(errorMessage(error));
		}
	};

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-900 dark:text-slate-50 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-6">
				{/* 1. Header */}
				<StudyPlansHeader onOpenCreate={() => setIsAdding(true)} />

				{/* Notice Banner */}
				{notice && (
					<div
						role="status"
						className={`flex items-center justify-between rounded-lg border p-4 text-sm font-medium shadow-sm ${
							notice.kind === "success"
								? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
								: "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
						}`}
					>
						<span>{notice.message}</span>
						<button
							type="button"
							onClick={() => setNotice(null)}
							className="text-xs font-semibold hover:underline"
						>
							Tutup
						</button>
					</div>
				)}

				{/* 2. Kartu Statistik */}
				<StudyPlansStats
					totalStudyPlans={totalStudyPlans}
					totalUniqueStudents={totalUniqueStudents}
					totalUniqueClassSubjects={totalUniqueClassSubjects}
					activeAcademicYearName={activeAcademicYearName}
					isLoading={listQuery.isPending}
				/>

				{/* 3. Bar Pencarian & Filter */}
				<StudyPlansFilterBar
					search={search}
					onSearchChange={(value) => {
						setSearch(value);
						setCurrentPage(1);
					}}
					academicYears={academicYearsList}
					classSubjects={classSubjectsList}
					selectedAcademicYearId={selectedAcademicYearId}
					selectedClassSubjectId={selectedClassSubjectId}
					onAcademicYearChange={(value) => {
						setSelectedAcademicYearId(value);
						setCurrentPage(1);
					}}
					onClassSubjectChange={(value) => {
						setSelectedClassSubjectId(value);
						setCurrentPage(1);
					}}
				/>

				{/* 4. Tabel Data */}
				<StudyPlansTable
					rows={rows}
					isLoading={listQuery.isPending}
					isError={listQuery.isError}
					searchTerm={debouncedSearch.trim()}
					onRetry={() => listQuery.refetch()}
					onEdit={setEditing}
					onDelete={setDeleting}
				/>

				{/* 5. Pagination & Footer */}
				{!listQuery.isPending &&
					!listQuery.isError &&
					meta &&
					meta.totalPages > 0 && (
						<div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:flex-row">
							<span className="text-sm text-slate-500 dark:text-slate-400">
								Menampilkan {rows.length} dari {totalStudyPlans} data
							</span>
							<div className="flex items-center gap-3">
								<label className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
									<div className="relative">
										<select
											value={limit}
											onChange={(event) => {
												setLimit(Number(event.target.value));
												setCurrentPage(1);
											}}
											className="w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 pr-8 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
										>
											<option value={5}>5 Perhalaman</option>
											<option value={10}>10 Perhalaman</option>
											<option value={20}>20 Perhalaman</option>
											<option value={50}>50 Perhalaman</option>
										</select>
										<ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
									</div>
								</label>

								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() =>
											setCurrentPage((page) => Math.max(1, page - 1))
										}
										disabled={currentPage <= 1}
										className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400"
										aria-label="Halaman sebelumnya"
									>
										&lt;
									</button>
									<button
										type="button"
										onClick={() => setCurrentPage(currentPage)}
										className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-700 text-sm font-semibold text-white disabled:opacity-50"
										aria-current="page"
										aria-label={`Halaman ${currentPage}`}
									>
										{currentPage}
									</button>
									<button
										type="button"
										onClick={() =>
											setCurrentPage((page) =>
												Math.min(meta.totalPages, page + 1),
											)
										}
										disabled={currentPage >= meta.totalPages}
										className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 text-sm font-medium text-slate-700 hover:border-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:text-blue-400"
										aria-label="Halaman berikutnya"
									>
										&gt;
									</button>
								</div>
							</div>
						</div>
					)}
			</div>

			{/* Dialog Tambah Rencana Studi */}
			<StudyPlanDialog
				open={isAdding}
				studyPlan={null}
				students={studentsList}
				classSubjects={classSubjectsList}
				academicYears={academicYearsList}
				isSaving={createMutation.isPending}
				onClose={() => setIsAdding(false)}
				onSave={handleCreate}
			/>

			{/* Dialog Ubah Rencana Studi */}
			<StudyPlanDialog
				open={Boolean(editing)}
				studyPlan={editing}
				students={studentsList}
				classSubjects={classSubjectsList}
				academicYears={academicYearsList}
				isSaving={updateMutation.isPending}
				onClose={() => setEditing(null)}
				onSave={handleUpdate}
			/>

			{/* Dialog Konfirmasi Hapus */}
			<DeleteStudyPlanDialog
				studyPlan={deleting}
				isDeleting={deleteMutation.isPending}
				onClose={() => setDeleting(null)}
				onConfirm={handleDelete}
			/>
		</main>
	);
}

