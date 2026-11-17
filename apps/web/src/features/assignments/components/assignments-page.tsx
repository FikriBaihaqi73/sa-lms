import { CheckCircle2 } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import {
	useAcademicYearsOptions,
	useAssignmentSubmissions,
	useAssignments,
	useAssignmentTypesOptions,
	useClassesOptions,
	useClassStudentsOptions,
	useCreateAssignment,
	useDeleteAssignment,
	useModulesOptions,
	useUpdateAssignment,
} from "../hooks/useAssignments";
import type {
	AssignmentItem,
	AssignmentStatsSummary,
	CreateAssignmentPayload,
	StudentSubmissionRow,
	UpdateAssignmentPayload,
} from "../types";
import { AssignmentCardsGrid } from "./assignment-cards-grid";
import { AssignmentDialog } from "./assignment-dialog";
import { AssignmentFilter } from "./assignment-filter";
import { AssignmentHeader } from "./assignment-header";
import { AssignmentStats } from "./assignment-stats";
import { AssignmentSubmissions } from "./assignment-submissions";
import { DeleteAssignmentDialog } from "./delete-assignment-dialog";
import { SubmissionDetailDialog } from "./submission-detail-dialog";

export const AssignmentsPage: React.FC = () => {
	// 1. Filter States
	const [academicYearId, setAcademicYearId] = useState("");
	const [classId, setClassId] = useState("");
	const [moduleId, setModuleId] = useState("");
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);

	// 2. Selected Assignment for Submissions Table
	const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>("");

	// 3. Dialog States
	const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
	const [editingAssignment, setEditingAssignment] =
		useState<AssignmentItem | null>(null);
	const [deletingAssignment, setDeletingAssignment] =
		useState<AssignmentItem | null>(null);
	const [viewingSubmission, setViewingSubmission] =
		useState<StudentSubmissionRow | null>(null);

	// 4. Toast Notice
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);

	useEffect(() => {
		if (!notice) return;
		const timer = setTimeout(() => setNotice(null), 4000);
		return () => clearTimeout(timer);
	}, [notice]);

	// 5. Data Queries
	const { data: academicYears = [] } = useAcademicYearsOptions();
	const { data: classes = [] } = useClassesOptions();
	const { data: modules = [] } = useModulesOptions();
	const { data: assignmentTypes = [] } = useAssignmentTypesOptions();

	// Auto-select active academic year & first class
	useEffect(() => {
		if (!academicYearId && academicYears.length > 0) {
			const active = academicYears.find((ay) => ay.is_active);
			setAcademicYearId(active ? active.id : (academicYears[0]?.id ?? ""));
		}
	}, [academicYears, academicYearId]);

	useEffect(() => {
		if (!classId && classes.length > 0) {
			setClassId(classes[0]?.id ?? "");
		}
	}, [classes, classId]);

	// Selected Academic Year & Class objects
	const selectedAcademicYear = useMemo(() => {
		return academicYears.find((ay) => ay.id === academicYearId);
	}, [academicYears, academicYearId]);

	const selectedClass = useMemo(() => {
		return classes.find((c) => c.id === classId);
	}, [classes, classId]);

	// Filtered modules belonging to the selected class
	const filteredModules = useMemo(() => {
		if (!classId) return modules;
		return modules.filter(
			(m) => !m.class_subject?.class_id || m.class_subject.class_id === classId,
		);
	}, [modules, classId]);

	// 6. Query Assignments
	const { data: assignmentsResult, isLoading: isAssignmentsLoading } =
		useAssignments({
			search: debouncedSearch.trim() || undefined,
			module_id: moduleId || undefined,
		});

	const assignmentsList = assignmentsResult?.data || [];

	// Filter assignments further by selected class if classId is set
	const displayedAssignments = useMemo(() => {
		let list = assignmentsList;
		if (classId) {
			list = list.filter((asg) => {
				const cId = asg.module?.class_subject?.class_id;
				return !cId || cId === classId;
			});
		}
		if (moduleId) {
			list = list.filter((asg) => asg.module_id === moduleId);
		}
		return list;
	}, [assignmentsList, classId, moduleId]);

	// Auto-select first assignment if none selected
	useEffect(() => {
		if (displayedAssignments.length > 0) {
			const exists = displayedAssignments.some(
				(a) => a.id === selectedAssignmentId,
			);
			if (!exists) {
				setSelectedAssignmentId(displayedAssignments[0]?.id ?? "");
			}
		} else {
			setSelectedAssignmentId("");
		}
	}, [displayedAssignments, selectedAssignmentId]);

	const selectedAssignment = useMemo(() => {
		return displayedAssignments.find((a) => a.id === selectedAssignmentId);
	}, [displayedAssignments, selectedAssignmentId]);

	// 7. Submissions & Students Query
	const { data: rawSubmissions = [] } = useAssignmentSubmissions({
		assignmentId: selectedAssignmentId || undefined,
	});

	const { data: classStudents = [] } = useClassStudentsOptions(
		classId || undefined,
	);

	// 8. Mutations
	const createAssignmentMutation = useCreateAssignment();
	const updateAssignmentMutation = useUpdateAssignment();
	const deleteAssignmentMutation = useDeleteAssignment();

	// 9. Build Student Submissions Rows for Audit Table
	const studentSubmissionRows: StudentSubmissionRow[] = useMemo(() => {
		const submissionsMap = new Map(rawSubmissions.map((s) => [s.studentId, s]));

		const maxScore = selectedAssignment?.max_score ?? 100;
		const dueDate = selectedAssignment?.due_date
			? new Date(selectedAssignment.due_date)
			: null;

		return classStudents.map((st) => {
			const sub = submissionsMap.get(st.studentId);
			let statusPengumpulan: "sudah_kumpul" | "terlambat" | "belum_kumpul" =
				"belum_kumpul";
			let statusPenilaian:
				| "sudah_dinilai"
				| "menunggu_dinilai"
				| "menunggu_submisi" = "menunggu_submisi";

			let waktuKirim: string | null = null;
			let namaBerkas: string | null = null;

			if (sub?.submittedAt) {
				const submitDate = new Date(sub.submittedAt);
				waktuKirim = submitDate.toLocaleDateString("id-ID", {
					day: "2-digit",
					month: "short",
					year: "numeric",
					hour: "2-digit",
					minute: "2-digit",
				});

				if (dueDate && submitDate > dueDate) {
					statusPengumpulan = "terlambat";
				} else {
					statusPengumpulan = "sudah_kumpul";
				}

				if (sub.score !== undefined && sub.score !== null) {
					statusPenilaian = "sudah_dinilai";
				} else {
					statusPenilaian = "menunggu_dinilai";
				}

				namaBerkas =
					sub.fileName ||
					`${selectedAssignment?.title.toLowerCase().replace(/\s+/g, "-") || "tugas"}-${st.studentNumber}.zip`;
			}

			return {
				studentId: st.studentId,
				fullName: st.fullName,
				studentNumber: st.studentNumber,
				email: st.email,
				className: st.className || selectedClass?.name || "Kelas",
				submissionId: sub?.id,
				statusPengumpulan,
				waktuKirim,
				namaBerkas,
				urlBerkas: sub?.fileUrl || null,
				statusPenilaian,
				nilaiAkhir: sub?.score ?? null,
				skorMaksimal: maxScore,
				catatanFeedback: sub?.feedback || null,
				namaPenilai: sub?.grader?.name || null,
			};
		});
	}, [classStudents, rawSubmissions, selectedAssignment, selectedClass]);

	// 10. Compute 4 Stat Cards
	const stats: AssignmentStatsSummary = useMemo(() => {
		const totalAssignments = displayedAssignments.length;
		const totalModulesCount = filteredModules.length;
		const totalStudentsCount = classStudents.length || 5;

		const submittedCount = studentSubmissionRows.filter(
			(r) =>
				r.statusPengumpulan === "sudah_kumpul" ||
				r.statusPengumpulan === "terlambat",
		).length;

		const gradedCount = studentSubmissionRows.filter(
			(r) => r.statusPenilaian === "sudah_dinilai",
		).length;

		const pendingGradingCount = studentSubmissionRows.filter(
			(r) => r.statusPenilaian === "menunggu_dinilai",
		).length;

		const unsubmittedCount = studentSubmissionRows.filter(
			(r) => r.statusPengumpulan === "belum_kumpul",
		).length;

		const submissionPercentage =
			totalStudentsCount > 0
				? Math.round((submittedCount / totalStudentsCount) * 100)
				: 0;

		return {
			totalAssignments,
			totalModulesCount,
			submittedCount,
			totalStudentsCount,
			submissionPercentage,
			gradedCount,
			pendingGradingCount,
			unsubmittedCount,
		};
	}, [
		displayedAssignments,
		filteredModules,
		classStudents,
		studentSubmissionRows,
	]);

	// Count submissions map per assignment
	const submissionsCountMap = useMemo(() => {
		const map: Record<
			string,
			{ submitted: number; total: number; pendingGrading: number }
		> = {};

		for (const asg of displayedAssignments) {
			if (asg.id === selectedAssignmentId) {
				map[asg.id] = {
					submitted: stats.submittedCount,
					total: stats.totalStudentsCount,
					pendingGrading: stats.pendingGradingCount,
				};
			} else {
				// Estimated / default
				map[asg.id] = {
					submitted: 0,
					total: stats.totalStudentsCount,
					pendingGrading: 0,
				};
			}
		}
		return map;
	}, [displayedAssignments, selectedAssignmentId, stats]);

	// 11. Handlers
	const handleResetFilters = () => {
		setSearch("");
		const active = academicYears.find((ay) => ay.is_active);
		setAcademicYearId(active ? active.id : (academicYears[0]?.id ?? ""));
		setClassId(classes[0]?.id ?? "");
		setModuleId("");
	};

	const handleOpenAddAssignment = () => {
		setEditingAssignment(null);
		setIsAssignmentDialogOpen(true);
	};

	const handleOpenEditAssignment = (assignment: AssignmentItem) => {
		setEditingAssignment(assignment);
		setIsAssignmentDialogOpen(true);
	};

	const handleOpenDeleteAssignment = (assignment: AssignmentItem) => {
		setDeletingAssignment(assignment);
	};

	const handleSaveAssignment = async (
		payload: CreateAssignmentPayload | UpdateAssignmentPayload,
	) => {
		try {
			if (editingAssignment) {
				await updateAssignmentMutation.mutateAsync({
					id: editingAssignment.id,
					payload,
				});
				setNotice({
					kind: "success",
					message: "Penugasan berhasil diperbarui.",
				});
			} else {
				await createAssignmentMutation.mutateAsync(
					payload as CreateAssignmentPayload,
				);
				setNotice({
					kind: "success",
					message: "Penugasan baru berhasil ditambahkan.",
				});
			}
			setIsAssignmentDialogOpen(false);
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Gagal menyimpan penugasan.";
			setNotice({ kind: "error", message: msg });
		}
	};

	const handleConfirmDeleteAssignment = async () => {
		if (!deletingAssignment) return;
		try {
			await deleteAssignmentMutation.mutateAsync(deletingAssignment.id);
			setNotice({
				kind: "success",
				message: `Penugasan "${deletingAssignment.title}" berhasil dihapus.`,
			});
			setDeletingAssignment(null);
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Gagal menghapus penugasan.";
			setNotice({ kind: "error", message: msg });
		}
	};

	const handleExportClassRekap = () => {
		if (studentSubmissionRows.length === 0) {
			setNotice({
				kind: "error",
				message: "Tidak ada data submisi untuk diekspor.",
			});
			return;
		}

		const headers = [
			"No",
			"Nama Siswa",
			"NIS",
			"Email",
			"Kelas",
			"Tugas",
			"Status Pengumpulan",
			"Waktu Kirim",
			"Status Penilaian",
			"Nilai Akhir",
			"Skor Maksimal",
		];

		const rows = studentSubmissionRows.map((r, idx) => [
			String(idx + 1),
			`"${r.fullName.replace(/"/g, '""')}"`,
			`"${r.studentNumber}"`,
			`"${r.email}"`,
			`"${r.className.replace(/"/g, '""')}"`,
			`"${(selectedAssignment?.title || "Tugas").replace(/"/g, '""')}"`,
			`"${r.statusPengumpulan}"`,
			`"${r.waktuKirim || "-"}"`,
			`"${r.statusPenilaian}"`,
			r.nilaiAkhir !== null ? String(r.nilaiAkhir) : "-",
			String(r.skorMaksimal),
		]);

		const csvContent =
			"data:text/csv;charset=utf-8,\uFEFF" +
			[headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute(
			"download",
			`rekap-tugas-${selectedClass?.name || "kelas"}-${selectedAssignment?.title || "submisi"}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		setNotice({
			kind: "success",
			message: "Data rekap submisi kelas berhasil diekspor sebagai CSV.",
		});
	};

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-slate-50 p-4 text-slate-900 dark:bg-[#0b1120] dark:text-slate-100 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-4">
				{/* Floating Toast Notification */}
				{notice && (
					<div
						role="status"
						className={`fixed right-6 top-6 z-[70] flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
							notice.kind === "success"
								? "border-emerald-500 bg-emerald-600 text-white shadow-emerald-500/20"
								: "border-rose-500 bg-rose-600 text-white shadow-rose-500/20"
						}`}
					>
						{notice.kind === "success" ? (
							<CheckCircle2 className="size-5 shrink-0" />
						) : (
							<span className="size-2 rounded-full bg-white animate-ping" />
						)}
						<span>{notice.message}</span>
					</div>
				)}

				{/* 1. Header Halaman */}
				<AssignmentHeader
					activeAcademicYearLabel={selectedAcademicYear?.label}
					onExportClick={handleExportClassRekap}
					onAddAssignmentClick={handleOpenAddAssignment}
					isExportDisabled={studentSubmissionRows.length === 0}
				/>

				{/* 2. 4 Kartu Ringkasan Eksekutif */}
				<AssignmentStats
					stats={stats}
					className={selectedClass?.name || "Kelas Informatika A"}
					isLoading={isAssignmentsLoading}
				/>

				{/* 3. Bar Filter Terpadu */}
				<AssignmentFilter
					search={search}
					onSearchChange={setSearch}
					academicYearId={academicYearId}
					onAcademicYearChange={setAcademicYearId}
					academicYears={academicYears}
					classId={classId}
					onClassChange={setClassId}
					classes={classes}
					moduleId={moduleId}
					onModuleChange={setModuleId}
					modules={filteredModules}
					onReset={handleResetFilters}
				/>

				{/* 4. Daftar Kartu Penugasan */}
				<AssignmentCardsGrid
					assignments={displayedAssignments}
					selectedAssignmentId={selectedAssignmentId}
					onSelectAssignment={(asg) => setSelectedAssignmentId(asg.id)}
					onEditAssignment={handleOpenEditAssignment}
					onDeleteAssignment={handleOpenDeleteAssignment}
					classNameText={selectedClass?.name || "Kelas Informatika A"}
					isLoading={isAssignmentsLoading}
					submissionsCountMap={submissionsCountMap}
				/>

				{/* 5. Bagian Rincian Submisi Siswa */}
				<AssignmentSubmissions
					selectedAssignment={selectedAssignment}
					submissions={studentSubmissionRows}
					onViewDetail={(row) => setViewingSubmission(row)}
					isLoading={isAssignmentsLoading}
				/>

				{/* 6. Modal Tambah / Ubah Penugasan */}
				<AssignmentDialog
					isOpen={isAssignmentDialogOpen}
					onClose={() => setIsAssignmentDialogOpen(false)}
					onSubmit={handleSaveAssignment}
					assignment={editingAssignment}
					modules={filteredModules}
					assignmentTypes={assignmentTypes}
					isSubmitting={
						createAssignmentMutation.isPending ||
						updateAssignmentMutation.isPending
					}
				/>

				{/* 7. Modal Konfirmasi Hapus Penugasan */}
				<DeleteAssignmentDialog
					isOpen={Boolean(deletingAssignment)}
					onClose={() => setDeletingAssignment(null)}
					onConfirm={handleConfirmDeleteAssignment}
					assignment={deletingAssignment}
					isDeleting={deleteAssignmentMutation.isPending}
				/>

				{/* 8. Modal Audit Detail Submisi Siswa */}
				<SubmissionDetailDialog
					isOpen={Boolean(viewingSubmission)}
					onClose={() => setViewingSubmission(null)}
					submission={viewingSubmission}
					assignmentTitle={selectedAssignment?.title}
				/>
			</div>
		</main>
	);
};
