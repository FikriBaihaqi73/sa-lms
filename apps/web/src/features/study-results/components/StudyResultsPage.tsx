import React, { useState } from "react";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/useDebounce";
import {
	useAcademicStatusesOptions,
	useAcademicYearsOptions,
	useClassesOptions,
	useCreateStudyResult,
	useDeleteStudyResult,
	useDepartmentsOptions,
	useSemestersOptions,
	useStudentsOptions,
	useStudyResultStats,
	useStudyResults,
	useUpdateStudyResult,
} from "../hooks/useStudyResults";
import type { StudyResultFormValues } from "../schemas/studyResultSchema";
import type { StudyResult } from "../types";
import { DeleteStudyResultDialog } from "./DeleteStudyResultDialog";
import { StudyResultDetailDialog } from "./StudyResultDetailDialog";
import { StudyResultDialog } from "./StudyResultDialog";
import { StudyResultsFilter } from "./StudyResultsFilter";
import { StudyResultsHeader } from "./StudyResultsHeader";
import { StudyResultsStats } from "./StudyResultsStats";
import { StudyResultsTable } from "./StudyResultsTable";

export const StudyResultsPage: React.FC = () => {
	// Filters and pagination state
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [departmentId, setDepartmentId] = useState("");
	const [classId, setClassId] = useState("");
	const [academicYearId, setAcademicYearId] = useState("");
	const [semesterId, setSemesterId] = useState("");
	const [academicStatusId, setAcademicStatusId] = useState("");
	const [page, setPage] = useState(1);
	const limit = 10;

	// Dialogs state
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingResult, setEditingResult] = useState<StudyResult | null>(null);
	const [viewingResult, setViewingResult] = useState<StudyResult | null>(null);
	const [deletingResult, setDeletingResult] = useState<StudyResult | null>(
		null,
	);
	const [isExporting, setIsExporting] = useState(false);

	// Queries
	const studyResultsQuery = useStudyResults({
		page,
		limit,
		search: debouncedSearch.trim() || undefined,
		departmentId: departmentId || undefined,
		classId: classId || undefined,
		academicYearId: academicYearId || undefined,
		semesterId: semesterId || undefined,
		academicStatusId: academicStatusId || undefined,
	});

	const departmentsQuery = useDepartmentsOptions();
	const classesQuery = useClassesOptions();
	const academicYearsQuery = useAcademicYearsOptions();
	const semestersQuery = useSemestersOptions();
	const academicStatusesQuery = useAcademicStatusesOptions();
	const studentsQuery = useStudentsOptions();

	// Mutations
	const createMutation = useCreateStudyResult();
	const updateMutation = useUpdateStudyResult();
	const deleteMutation = useDeleteStudyResult();

	const resultsList = studyResultsQuery.data?.data || [];
	const meta = studyResultsQuery.data?.meta;
	const totalPages = Math.max(meta?.totalPages || 1, 1);
	const totalData = meta?.totalData ?? resultsList.length;

	const stats = useStudyResultStats(resultsList, totalData);

	// Department lookup map
	const deptMap = React.useMemo(() => {
		const map = new Map<string, string>();
		for (const d of departmentsQuery.data || []) {
			map.set(d.id, `${d.name} (${d.code})`);
		}
		return map;
	}, [departmentsQuery.data]);

	// Handlers
	const handleOpenAdd = () => {
		setEditingResult(null);
		setIsFormOpen(true);
	};

	const handleOpenEdit = (res: StudyResult) => {
		setEditingResult(res);
		setIsFormOpen(true);
	};

	const handleOpenDetail = (res: StudyResult) => {
		setViewingResult(res);
	};

	const handleOpenDelete = (res: StudyResult) => {
		setDeletingResult(res);
	};

	const handleSaveResult = async (values: StudyResultFormValues) => {
		try {
			if (editingResult) {
				await updateMutation.mutateAsync({
					id: editingResult.id,
					data: {
						studentId: values.studentId,
						academicYearId: values.academicYearId,
						semesterId: values.semesterId,
						academicStatusId: values.academicStatusId ?? null,
						totalCredits: values.totalCredits ?? null,
						semesterGpa: values.semesterGpa ?? null,
						cumulativeGpa: values.cumulativeGpa ?? null,
					},
				});
				toast.success("Data rekap nilai siswa berhasil diperbarui.");
			} else {
				await createMutation.mutateAsync({
					studentId: values.studentId,
					academicYearId: values.academicYearId,
					semesterId: values.semesterId,
					academicStatusId: values.academicStatusId ?? null,
					totalCredits: values.totalCredits ?? null,
					semesterGpa: values.semesterGpa ?? null,
					cumulativeGpa: values.cumulativeGpa ?? null,
				});
				toast.success("Data rekap nilai siswa berhasil ditambahkan.");
			}

			setIsFormOpen(false);
			setEditingResult(null);
			await studyResultsQuery.refetch();
		} catch (err) {
			const msg =
				err instanceof Error
					? err.message
					: "Gagal menyimpan data rekap nilai siswa.";
			toast.error(msg);
		}
	};

	const handleConfirmDelete = async () => {
		if (!deletingResult) return;
		try {
			await deleteMutation.mutateAsync(deletingResult.id);
			toast.success("Data rekap nilai siswa berhasil dihapus.");
			setDeletingResult(null);
			await studyResultsQuery.refetch();
		} catch (err) {
			const msg =
				err instanceof Error
					? err.message
					: "Gagal menghapus data rekap nilai.";
			toast.error(msg);
		}
	};

	const handleResetFilters = () => {
		setSearch("");
		setDepartmentId("");
		setClassId("");
		setAcademicYearId("");
		setSemesterId("");
		setAcademicStatusId("");
		setPage(1);
	};

	// CSV Export
	const handleExportCSV = () => {
		try {
			setIsExporting(true);
			if (resultsList.length === 0) {
				toast.error("Tidak ada data rekap nilai yang dapat diekspor.");
				setIsExporting(false);
				return;
			}

			const headers = [
				"No",
				"NIS",
				"Nama Siswa",
				"Email",
				"Kelas",
				"Departemen",
				"Tahun Ajaran",
				"Semester",
				"Beban SKS",
				"IPS",
				"IPK",
				"Status Akademik",
			];

			const rows = resultsList.map((r, idx) => {
				const studentName = r.student?.profile?.fullName || "-";
				const studentNumber = r.student?.studentNumber || "-";
				const email = r.student?.profile?.email || "-";
				const classNames =
					r.student?.classStudents
						?.map((cs) => cs.classes?.name)
						.filter(Boolean)
						.join(", ") || "-";
				const deptName = r.student?.departmentId
					? deptMap.get(r.student.departmentId) || "-"
					: "-";
				const ay = r.academicYear?.academic_year || "-";
				const sem = r.semester?.name || "-";
				const credits = r.totalCredits ?? 0;
				const sgpa =
					r.semesterGpa !== null && r.semesterGpa !== undefined
						? Number(r.semesterGpa).toFixed(2)
						: "-";
				const cgpa =
					r.cumulativeGpa !== null && r.cumulativeGpa !== undefined
						? Number(r.cumulativeGpa).toFixed(2)
						: "-";
				const status = r.academicStatus?.name || "Aktif";

				return [
					idx + 1,
					`"${studentNumber.replace(/"/g, '""')}"`,
					`"${studentName.replace(/"/g, '""')}"`,
					`"${email.replace(/"/g, '""')}"`,
					`"${classNames.replace(/"/g, '""')}"`,
					`"${deptName.replace(/"/g, '""')}"`,
					`"${ay.replace(/"/g, '""')}"`,
					`"${sem.replace(/"/g, '""')}"`,
					credits,
					sgpa,
					cgpa,
					`"${status.replace(/"/g, '""')}"`,
				];
			});

			const csvContent =
				"data:text/csv;charset=utf-8,\uFEFF" +
				[headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
			const encodedUri = encodeURI(csvContent);
			const link = document.createElement("a");
			link.setAttribute("href", encodedUri);
			const dateStr = new Date().toISOString().slice(0, 10);
			link.setAttribute("download", `rekap-nilai-siswa-${dateStr}.csv`);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			toast.success("Data rekap nilai siswa berhasil diekspor sebagai CSV.");
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Gagal mengekspor data ke CSV.";
			toast.error(msg);
		} finally {
			setIsExporting(false);
		}
	};

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-slate-950 dark:text-slate-100 sm:p-6 lg:p-8">
			<div className="mx-auto max-w-7xl space-y-6">
				{/* Page Header */}
				<StudyResultsHeader
					onAddResult={handleOpenAdd}
					onExport={handleExportCSV}
					isExporting={isExporting}
				/>

				{/* 4 Stats Cards */}
				<StudyResultsStats
					stats={stats}
					isLoading={studyResultsQuery.isPending}
				/>

				{/* Filter Bar */}
				<StudyResultsFilter
					search={search}
					departmentId={departmentId}
					classId={classId}
					academicYearId={academicYearId}
					semesterId={semesterId}
					academicStatusId={academicStatusId}
					departments={departmentsQuery.data || []}
					classes={classesQuery.data || []}
					academicYears={academicYearsQuery.data || []}
					semesters={semestersQuery.data || []}
					academicStatuses={academicStatusesQuery.data || []}
					onSearchChange={(v) => {
						setSearch(v);
						setPage(1);
					}}
					onDepartmentChange={(v) => {
						setDepartmentId(v);
						setPage(1);
					}}
					onClassChange={(v) => {
						setClassId(v);
						setPage(1);
					}}
					onAcademicYearChange={(v) => {
						setAcademicYearId(v);
						setPage(1);
					}}
					onSemesterChange={(v) => {
						setSemesterId(v);
						setPage(1);
					}}
					onAcademicStatusChange={(v) => {
						setAcademicStatusId(v);
						setPage(1);
					}}
					onReset={handleResetFilters}
				/>

				{/* Interactive Table / Empty State */}
				<StudyResultsTable
					data={resultsList}
					departments={departmentsQuery.data || []}
					page={page}
					totalPages={totalPages}
					totalData={totalData}
					isLoading={studyResultsQuery.isPending}
					onPageChange={setPage}
					onViewDetail={handleOpenDetail}
					onEdit={handleOpenEdit}
					onDelete={handleOpenDelete}
					onAddNew={handleOpenAdd}
				/>
			</div>

			{/* Create / Edit Dialog */}
			<StudyResultDialog
				open={isFormOpen}
				result={editingResult}
				students={studentsQuery.data || []}
				academicYears={academicYearsQuery.data || []}
				semesters={semestersQuery.data || []}
				academicStatuses={academicStatusesQuery.data || []}
				isSaving={createMutation.isPending || updateMutation.isPending}
				onClose={() => {
					setIsFormOpen(false);
					setEditingResult(null);
				}}
				onSave={handleSaveResult}
			/>

			{/* Detail Dialog */}
			<StudyResultDetailDialog
				open={Boolean(viewingResult)}
				result={viewingResult}
				departments={departmentsQuery.data || []}
				onClose={() => setViewingResult(null)}
				onEdit={handleOpenEdit}
			/>

			{/* Delete Confirmation Dialog */}
			<DeleteStudyResultDialog
				open={Boolean(deletingResult)}
				result={deletingResult}
				isDeleting={deleteMutation.isPending}
				onClose={() => setDeletingResult(null)}
				onConfirm={handleConfirmDelete}
			/>
		</main>
	);
};
