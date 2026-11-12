import { CheckCircle2 } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { ApiError } from "@/lib/api";
import {
	useAcademicYearsOptions,
	useClassSubjectsOptions,
	useCreateStudyPlan,
	useDeleteStudyPlan,
	useDepartmentsOptions,
	useStudentsOptions,
	useStudyPlans,
	useUpdateStudyPlan,
} from "../hooks";
import type {
	ClassSubjectOption,
	DepartmentOption,
	StudentKrsSummary,
	StudentOption,
	StudyPlan,
	StudyPlanSummaryStats,
	StudyPlanViewMode,
} from "../types";
import {
	getDeactivatedClassSubjectIds,
	toggleClassSubjectActiveStatus,
} from "../utils/deactivated-storage";
import { DeleteStudyPlanDialog } from "./delete-study-plan-dialog";
import { StudyPlanCatalogTable } from "./study-plan-catalog-table";
import { StudyPlanDialog } from "./study-plan-dialog";
import { StudyPlanFilter } from "./study-plan-filter";
import { StudyPlanHeader } from "./study-plan-header";
import { StudyPlanLogTable } from "./study-plan-log-table";
import { StudyPlanStats } from "./study-plan-stats";
import { StudyPlanStudentTable } from "./study-plan-student-table";

function parseErrorMessage(err: unknown): string {
	if (err instanceof ApiError) {
		if (err.status === 409) {
			return (
				err.message ||
				"Siswa sudah terdaftar pada mata pelajaran kelas ini untuk tahun ajaran yang dipilih."
			);
		}
		if (err.status === 403) {
			return "Akses ditolak: Operasi rencana studi dibatasi sesuai hak akses institusi.";
		}
		if (err.status === 404) {
			return "Siswa, mata pelajaran kelas, atau tahun ajaran tidak ditemukan.";
		}
		if (err.fieldErrors.length > 0) {
			return `${err.message}: ${err.fieldErrors
				.map(({ field, message }) => `${field || "input"} - ${message}`)
				.join("; ")}`;
		}
		return err.message;
	}
	if (err instanceof Error) return err.message;
	return "Terjadi kesalahan pada sistem. Silakan coba lagi.";
}

export const StudyPlansPage: React.FC = () => {
	// 1. View Mode State
	const [viewMode, setViewMode] = useState<StudyPlanViewMode>("student_view");

	// 2. Filters & Search State
	const [search, setSearch] = useState("");
	const debouncedSearch = useDebounce(search, 300);
	const [academicYearId, setAcademicYearId] = useState("");
	const [departmentId, setDepartmentId] = useState("");
	const [classSubjectId, setClassSubjectId] = useState("");

	// Pagination for log view
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);

	// 3. Notification Toast State
	const [notice, setNotice] = useState<{
		kind: "success" | "error";
		message: string;
	} | null>(null);

	useEffect(() => {
		if (!notice) return;
		const timer = setTimeout(() => setNotice(null), 4000);
		return () => clearTimeout(timer);
	}, [notice]);

	// 4. Modal Dialog States
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingStudyPlan, setEditingStudyPlan] = useState<StudyPlan | null>(
		null,
	);
	const [preselectedStudentId, setPreselectedStudentId] = useState<string>("");
	const [preselectedClassSubjectId, setPreselectedClassSubjectId] =
		useState<string>("");

	const [deletingStudyPlan, setDeletingStudyPlan] = useState<StudyPlan | null>(
		null,
	);

	// Persistent Deactivated Class Subject IDs from localStorage
	const [deactivatedIds, setDeactivatedIds] = useState<string[]>(() =>
		getDeactivatedClassSubjectIds(),
	);

	// 5. Data Queries
	const { data: academicYears = [] } = useAcademicYearsOptions();
	const { data: departments = [] } = useDepartmentsOptions();
	const { data: allClassSubjects = [] } = useClassSubjectsOptions();
	const { data: allStudents = [] } = useStudentsOptions();

	// Auto-select active academic year when options load
	useEffect(() => {
		if (!academicYearId && academicYears.length > 0) {
			const active = academicYears.find((ay) => ay.is_active);
			setAcademicYearId(active ? active.id : (academicYears[0]?.id ?? ""));
		}
	}, [academicYears, academicYearId]);

	// Active Academic Year Object
	const selectedAcademicYear = useMemo(() => {
		return academicYears.find((ay) => ay.id === academicYearId);
	}, [academicYears, academicYearId]);

	// Auto-reset classSubjectId if the selected subject does not belong to newly selected department
	useEffect(() => {
		if (classSubjectId && departmentId) {
			const selectedCs = allClassSubjects.find(
				(cs) => cs.id === classSubjectId,
			);
			if (
				selectedCs?.departmentId &&
				selectedCs.departmentId !== departmentId
			) {
				setClassSubjectId("");
			}
		}
	}, [departmentId, classSubjectId, allClassSubjects]);

	// 6. StudyPlans Query (Fetches up to 1000 for student/catalog view aggregation, or page/limit for log view)
	const isLogView = viewMode === "log_view";
	const {
		data: studyPlansResult,
		isLoading: isStudyPlansLoading,
		isError: isStudyPlansError,
		refetch,
	} = useStudyPlans({
		page: isLogView ? page : 1,
		limit: isLogView ? limit : 1000,
		search: debouncedSearch.trim() || undefined,
		academic_year_id: academicYearId || undefined,
		department_id:
			departmentId && departmentId !== "umum" ? departmentId : undefined,
		class_subject_id: classSubjectId || undefined,
	});

	const rawStudyPlans = studyPlansResult?.data ?? [];
	const meta = studyPlansResult?.meta;

	// Smart Merge & Deduplicate: Combine allClassSubjects from API with any classSubject from rawStudyPlans
	const mergedClassSubjects: ClassSubjectOption[] = useMemo(() => {
		const map = new Map<string, ClassSubjectOption>();

		// 1. Add all from /class-subjects API query
		for (const cs of allClassSubjects) {
			map.set(cs.id, {
				...cs,
				isActive: !deactivatedIds.includes(cs.id),
			});
		}

		// 2. Add / merge any classSubject from rawStudyPlans
		for (const sp of rawStudyPlans) {
			const cs = sp.classSubject;
			if (cs?.id && !map.has(cs.id)) {
				const subName = cs.subject?.name || "Mata Pelajaran";
				const subCode = cs.subject?.code || "";
				const clsName = cs.class?.name || "Kelas";
				const tchName =
					cs.teacher?.profile?.fullName ||
					(cs.teacher?.teacher_number
						? `Guru (${cs.teacher.teacher_number})`
						: "Pengajar");
				const credits = cs.subject?.credits ?? 0;
				const codePrefix = subCode ? `[${subCode}] ` : "";
				const label = `${codePrefix}${subName} — ${clsName} (${tchName}) • ${credits} SKS`;

				const ayId =
					cs.academic_year_id ||
					cs.academic_year?.id ||
					sp.academic_year_id ||
					null;
				const ayName =
					cs.academic_year?.academic_year ||
					sp.academicYear?.academic_year ||
					null;
				const isAyActive =
					cs.academic_year?.is_active ?? sp.academicYear?.is_active ?? false;

				map.set(cs.id, {
					id: cs.id,
					subjectId: cs.subject?.id || cs.subject_id,
					subjectName: subName,
					subjectCode: subCode,
					credits,
					className: clsName,
					teacherName: tchName,
					departmentId:
						cs.subject?.department?.id || cs.subject?.departmentId || null,
					departmentName: cs.subject?.department?.name || null,
					academicYearId: ayId,
					academicYearName: ayName,
					isAcademicYearActive: isAyActive,
					isActive: !deactivatedIds.includes(cs.id),
					label,
				});
			}
		}

		return Array.from(map.values());
	}, [allClassSubjects, rawStudyPlans, deactivatedIds]);

	// Derive available departments strictly for the active academic year
	const availableDepartmentsForFilter: DepartmentOption[] = useMemo(() => {
		const csInYear = mergedClassSubjects.filter((cs) => {
			if (
				academicYearId &&
				cs.academicYearId &&
				cs.academicYearId !== academicYearId
			) {
				return false;
			}
			return true;
		});

		const deptIdsInYear = new Set<string>();
		let hasUmum = false;

		for (const cs of csInYear) {
			if (cs.departmentId) {
				deptIdsInYear.add(cs.departmentId);
			} else {
				hasUmum = true;
			}
		}

		const list: DepartmentOption[] = [];
		for (const d of departments) {
			if (deptIdsInYear.has(d.id)) {
				list.push(d);
			}
		}

		for (const cs of csInYear) {
			if (cs.departmentId && !list.some((d) => d.id === cs.departmentId)) {
				list.push({
					id: cs.departmentId,
					name: cs.departmentName || "Bidang",
					code: "MAPEL",
				});
			}
		}

		if (hasUmum) {
			list.push({
				id: "umum",
				name: "Umum / Tanpa Bidang",
				code: "UMUM",
			});
		}

		return list;
	}, [mergedClassSubjects, academicYearId, departments]);

	// Auto-reset departmentId if the selected department is not available in the new academic year
	useEffect(() => {
		if (departmentId) {
			const isStillAvailable = availableDepartmentsForFilter.some(
				(d) => d.id === departmentId,
			);
			if (!isStillAvailable) {
				setDepartmentId("");
			}
		}
	}, [departmentId, availableDepartmentsForFilter]);

	// Filtered ClassSubjects options for dropdown based on department and academic year
	const filteredClassSubjectsOptions = useMemo(() => {
		return mergedClassSubjects.filter((cs) => {
			if (
				academicYearId &&
				cs.academicYearId &&
				cs.academicYearId !== academicYearId
			) {
				return false;
			}
			if (departmentId === "umum") {
				return !cs.departmentId;
			}
			if (departmentId && cs.departmentId !== departmentId) {
				return false;
			}
			return true;
		});
	}, [mergedClassSubjects, academicYearId, departmentId]);

	// 7. Mutations
	const createMutation = useCreateStudyPlan();
	const updateMutation = useUpdateStudyPlan();
	const deleteMutation = useDeleteStudyPlan();

	// 8. Aggregate Data for 4 Stat Cards
	const stats: StudyPlanSummaryStats = useMemo(() => {
		// Unique students who have KRS in current academic year
		const uniqueStudents = new Set<string>();
		let totalCredits = 0;

		for (const sp of rawStudyPlans) {
			if (sp.student_id) uniqueStudents.add(sp.student_id);
			totalCredits += sp.classSubject?.subject?.credits ?? 0;
		}

		// Active class subjects for selected academic year
		const activeCs = mergedClassSubjects.filter((cs) =>
			academicYearId && cs.academicYearId
				? cs.academicYearId === academicYearId
				: true,
		);

		const uniqueDepts = new Set<string>();
		for (const cs of activeCs) {
			if (cs.departmentId) uniqueDepts.add(cs.departmentId);
		}

		const studentsWithKrs = uniqueStudents.size;
		const totalStudentsCount = allStudents.length;
		const studentsWithoutKrs = Math.max(
			0,
			totalStudentsCount - studentsWithKrs,
		);

		return {
			studentsWithKrsCount: studentsWithKrs,
			totalEnrollments: rawStudyPlans.length,
			totalCreditsEnrolled: totalCredits,
			activeClassSubjectsCount: activeCs.length,
			departmentsCount: uniqueDepts.size || departments.length,
			studentsWithoutKrsCount: studentsWithoutKrs,
		};
	}, [
		rawStudyPlans,
		mergedClassSubjects,
		allStudents,
		academicYearId,
		departments,
	]);

	// 9. Tab 1: Group study plans by Student
	const studentKrsList: StudentKrsSummary[] = useMemo(() => {
		// Index study plans by student_id
		const spByStudent = new Map<string, StudyPlan[]>();
		for (const sp of rawStudyPlans) {
			const list = spByStudent.get(sp.student_id) || [];
			list.push(sp);
			spByStudent.set(sp.student_id, list);
		}

		// Build map of all students
		const studentMap = new Map<string, StudentKrsSummary>();

		// 1. From allStudents
		for (const s of allStudents) {
			const userPlans = spByStudent.get(s.id) || [];

			// If departmentId is filtered, check if student or their plans match the department
			if (departmentId === "umum") {
				const hasPlanInUmum = userPlans.some(
					(p) =>
						!p.classSubject?.subject?.department?.id &&
						!p.classSubject?.subject?.departmentId,
				);
				const studentInUmum = !s.departmentId;
				if (!hasPlanInUmum && !studentInUmum) {
					continue;
				}
			} else if (departmentId) {
				const studentMatchesDept = s.departmentId === departmentId;
				const hasPlanInDept = userPlans.some(
					(p) =>
						p.classSubject?.subject?.department?.id === departmentId ||
						p.classSubject?.subject?.departmentId === departmentId,
				);
				if (!studentMatchesDept && !hasPlanInDept) {
					continue;
				}
			}

			// If classSubjectId is filtered, only include students enrolled in that classSubject
			if (classSubjectId) {
				const hasPlanInCs = userPlans.some(
					(p) => p.class_subject_id === classSubjectId,
				);
				if (!hasPlanInCs) {
					continue;
				}
			}

			let credits = 0;
			for (const p of userPlans) {
				credits += p.classSubject?.subject?.credits ?? 0;
			}

			// Check class name from first study plan or student info
			const firstPlan = userPlans[0];
			const className =
				firstPlan?.classSubject?.class?.name || s.className || "Kelas";
			const departmentName =
				firstPlan?.classSubject?.subject?.department?.name ||
				s.departmentName ||
				undefined;

			studentMap.set(s.id, {
				studentId: s.id,
				studentNumber: s.studentNumber,
				fullName: s.fullName,
				email: s.email,
				className,
				departmentName,
				totalSubjects: userPlans.length,
				totalCredits: credits,
				maxCredits: 24,
				status: userPlans.length > 0 ? "sudah_krs" : "belum_krs",
				studyPlans: userPlans,
			});
		}

		// 2. Include any students in rawStudyPlans not found in allStudents
		for (const sp of rawStudyPlans) {
			if (sp.student_id && !studentMap.has(sp.student_id)) {
				// If departmentId is filtered, check if study plan matches department
				if (departmentId === "umum") {
					const deptMatch =
						!sp.classSubject?.subject?.department?.id &&
						!sp.classSubject?.subject?.departmentId;
					if (!deptMatch) continue;
				} else if (departmentId) {
					const deptMatch =
						sp.classSubject?.subject?.department?.id === departmentId ||
						sp.classSubject?.subject?.departmentId === departmentId;
					if (!deptMatch) continue;
				}

				// If classSubjectId is filtered, check if study plan matches classSubject
				if (classSubjectId && sp.class_subject_id !== classSubjectId) {
					continue;
				}

				const userPlans = spByStudent.get(sp.student_id) || [];
				let credits = 0;
				for (const p of userPlans) {
					credits += p.classSubject?.subject?.credits ?? 0;
				}

				const sName =
					sp.student?.profile?.fullName ||
					`Siswa #${sp.student?.studentNumber}`;
				const sNum = sp.student?.studentNumber || "-";
				const className = sp.classSubject?.class?.name || "Kelas";
				const departmentName =
					sp.classSubject?.subject?.department?.name || undefined;

				studentMap.set(sp.student_id, {
					studentId: sp.student_id,
					studentNumber: sNum,
					fullName: sName,
					email: sp.student?.profile?.email,
					className,
					departmentName,
					totalSubjects: userPlans.length,
					totalCredits: credits,
					maxCredits: 24,
					status: "sudah_krs",
					studyPlans: userPlans,
				});
			}
		}

		let result = Array.from(studentMap.values());

		// Apply client-side search filter for Tab 1
		if (debouncedSearch.trim()) {
			const q = debouncedSearch.toLowerCase().trim();
			result = result.filter(
				(s) =>
					s.fullName.toLowerCase().includes(q) ||
					s.studentNumber.toLowerCase().includes(q) ||
					s.studyPlans.some(
						(sp) =>
							sp.classSubject?.subject?.name?.toLowerCase().includes(q) ||
							sp.classSubject?.subject?.code?.toLowerCase().includes(q),
					),
			);
		}

		return result;
	}, [
		allStudents,
		rawStudyPlans,
		debouncedSearch,
		departmentId,
		classSubjectId,
	]);

	// 10. Tab 2: Catalog list with enrolled counts
	const catalogList: ClassSubjectOption[] = useMemo(() => {
		// Count enrollments per class_subject_id from rawStudyPlans
		const counts = new Map<string, number>();
		for (const sp of rawStudyPlans) {
			counts.set(
				sp.class_subject_id,
				(counts.get(sp.class_subject_id) || 0) + 1,
			);
		}

		let items = filteredClassSubjectsOptions.map((cs) => ({
			...cs,
			isActive: !deactivatedIds.includes(cs.id),
			enrolledCount: counts.get(cs.id) || 0,
		}));

		if (classSubjectId) {
			items = items.filter((cs) => cs.id === classSubjectId);
		}

		if (debouncedSearch.trim()) {
			const q = debouncedSearch.toLowerCase().trim();
			items = items.filter(
				(cs) =>
					cs.subjectName.toLowerCase().includes(q) ||
					cs.subjectCode?.toLowerCase().includes(q) ||
					cs.className.toLowerCase().includes(q) ||
					cs.teacherName?.toLowerCase().includes(q),
			);
		}

		return items;
	}, [
		filteredClassSubjectsOptions,
		rawStudyPlans,
		classSubjectId,
		debouncedSearch,
		deactivatedIds,
	]);

	// Log View: Filter raw study plans if "umum" is selected (client-side)
	const displayStudyPlans = useMemo(() => {
		if (departmentId === "umum") {
			return rawStudyPlans.filter(
				(sp) =>
					!sp.classSubject?.subject?.departmentId &&
					!sp.classSubject?.subject?.department?.id,
			);
		}
		return rawStudyPlans;
	}, [rawStudyPlans, departmentId]);

	// 11. Students option list enriched with currentCredits, departmentName, and className
	const enrichedStudentsOptions: StudentOption[] = useMemo(() => {
		const creditsMap = new Map<string, number>();
		const studentDeptMap = new Map<string, string>();
		const studentClassMap = new Map<string, string>();

		for (const sp of rawStudyPlans) {
			creditsMap.set(
				sp.student_id,
				(creditsMap.get(sp.student_id) || 0) +
					(sp.classSubject?.subject?.credits ?? 0),
			);
			if (sp.classSubject?.subject?.department?.name) {
				studentDeptMap.set(
					sp.student_id,
					sp.classSubject.subject.department.name,
				);
			}
			if (sp.classSubject?.class?.name) {
				studentClassMap.set(sp.student_id, sp.classSubject.class.name);
			}
		}

		return allStudents.map((s) => ({
			...s,
			departmentName:
				s.departmentName ||
				studentDeptMap.get(s.id) ||
				studentClassMap.get(s.id) ||
				s.className ||
				null,
			className: s.className || studentClassMap.get(s.id) || null,
			currentCredits: creditsMap.get(s.id) || 0,
		}));
	}, [allStudents, rawStudyPlans]);

	// 12. Handlers
	const handleResetFilters = () => {
		setSearch("");
		const active = academicYears.find((ay) => ay.is_active);
		setAcademicYearId(active ? active.id : (academicYears[0]?.id ?? ""));
		setDepartmentId("");
		setClassSubjectId("");
		setPage(1);
	};

	const handleOpenAddModal = (studentId?: string, csId?: string) => {
		setEditingStudyPlan(null);
		setPreselectedStudentId(studentId || "");
		setPreselectedClassSubjectId(csId || "");
		setIsDialogOpen(true);
	};

	const handleOpenEditModal = (sp: StudyPlan) => {
		setEditingStudyPlan(sp);
		setPreselectedStudentId(sp.student_id);
		setPreselectedClassSubjectId(sp.class_subject_id);
		setIsDialogOpen(true);
	};

	const handleOpenDeleteModal = (sp: StudyPlan) => {
		setDeletingStudyPlan(sp);
	};

	const handleSaveStudyPlan = async (values: {
		student_id: string;
		academic_year_id: string;
		class_subject_id?: string;
		class_subject_ids?: string[];
	}) => {
		try {
			if (editingStudyPlan) {
				const csId =
					values.class_subject_id || values.class_subject_ids?.[0] || "";
				await updateMutation.mutateAsync({
					id: editingStudyPlan.id,
					input: {
						student_id: values.student_id,
						class_subject_id: csId,
						academic_year_id: values.academic_year_id,
					},
				});
				setNotice({
					kind: "success",
					message: "Rencana studi berhasil diperbarui.",
				});
			} else {
				const ids =
					values.class_subject_ids && values.class_subject_ids.length > 0
						? values.class_subject_ids
						: values.class_subject_id
							? [values.class_subject_id]
							: [];

				if (ids.length === 0) return;

				await Promise.all(
					ids.map((csId) =>
						createMutation.mutateAsync({
							student_id: values.student_id,
							class_subject_id: csId,
							academic_year_id: values.academic_year_id,
						}),
					),
				);
				setNotice({
					kind: "success",
					message: `${ids.length} mata pelajaran berhasil didaftarkan ke rencana studi siswa (KRS).`,
				});
			}
			setIsDialogOpen(false);
		} catch (err) {
			setNotice({
				kind: "error",
				message: parseErrorMessage(err),
			});
			throw err;
		}
	};

	const handleConfirmDelete = async () => {
		if (!deletingStudyPlan) return;
		try {
			await deleteMutation.mutateAsync(deletingStudyPlan.id);
			setNotice({
				kind: "success",
				message: "Rencana studi berhasil dihapus / drop.",
			});
			setDeletingStudyPlan(null);
		} catch (err) {
			setNotice({
				kind: "error",
				message: parseErrorMessage(err),
			});
			throw err;
		}
	};

	const handleExportCsv = () => {
		if (rawStudyPlans.length === 0) {
			setNotice({
				kind: "error",
				message: "Tidak ada data rencana studi untuk diekspor.",
			});
			return;
		}

		const headers = [
			"No",
			"Nama Siswa",
			"NIS",
			"Kode Mapel",
			"Mata Pelajaran",
			"Kelas",
			"Bidang/Departemen",
			"Kredit (SKS)",
			"Pengajar",
			"Tahun Ajaran",
			"Tanggal Dibuat",
		];

		const rows = rawStudyPlans.map((sp, idx) => {
			const sName =
				sp.student?.profile?.fullName || `Siswa #${sp.student?.studentNumber}`;
			const sNis = sp.student?.studentNumber || "-";
			const code = sp.classSubject?.subject?.code || "-";
			const subName = sp.classSubject?.subject?.name || "Mata Pelajaran";
			const clsName = sp.classSubject?.class?.name || "Kelas";
			const deptName = sp.classSubject?.subject?.department?.name || "-";
			const credits = sp.classSubject?.subject?.credits ?? 0;
			const tchName = sp.classSubject?.teacher?.profile?.fullName || "-";
			const ayName =
				sp.academicYear?.academic_year ||
				sp.classSubject?.academic_year?.academic_year ||
				"-";
			const date = sp.created_at
				? new Date(sp.created_at).toLocaleDateString("id-ID")
				: "-";

			return [
				String(idx + 1),
				`"${sName.replace(/"/g, '""')}"`,
				`"${sNis}"`,
				`"${code}"`,
				`"${subName.replace(/"/g, '""')}"`,
				`"${clsName.replace(/"/g, '""')}"`,
				`"${deptName.replace(/"/g, '""')}"`,
				String(credits),
				`"${tchName.replace(/"/g, '""')}"`,
				`"${ayName}"`,
				`"${date}"`,
			].join(",");
		});

		const csvContent =
			"data:text/csv;charset=utf-8,\uFEFF" +
			[headers.join(","), ...rows].join("\n");
		const encodedUri = encodeURI(csvContent);
		const link = document.createElement("a");
		link.setAttribute("href", encodedUri);
		link.setAttribute(
			"download",
			`rekap-krs-${selectedAcademicYear?.academic_year || "tahun"}.csv`,
		);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		setNotice({
			kind: "success",
			message: "Data rencana studi berhasil diekspor sebagai CSV.",
		});
	};

	return (
		<main className="min-h-[calc(100vh-4rem)] bg-[#0b1120] p-4 text-slate-100 sm:p-6">
			<div className="mx-auto max-w-7xl space-y-4">
				{/* Floating Notification Banner */}
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
				<StudyPlanHeader
					activeAcademicYearName={selectedAcademicYear?.label}
					onAddClick={() => handleOpenAddModal()}
					onExportClick={handleExportCsv}
					isExportDisabled={rawStudyPlans.length === 0}
				/>

				{/* 2. 4 Kartu Ringkasan Eksekutif */}
				<StudyPlanStats stats={stats} isLoading={isStudyPlansLoading} />

				{/* 3. Bar Filter & View Switcher Tabs */}
				<StudyPlanFilter
					viewMode={viewMode}
					onViewModeChange={setViewMode}
					search={search}
					onSearchChange={setSearch}
					academicYearId={academicYearId}
					onAcademicYearChange={setAcademicYearId}
					academicYearOptions={academicYears}
					departmentId={departmentId}
					onDepartmentChange={setDepartmentId}
					departmentOptions={availableDepartmentsForFilter}
					classSubjectId={classSubjectId}
					onClassSubjectChange={setClassSubjectId}
					classSubjectOptions={filteredClassSubjectsOptions}
					onReset={handleResetFilters}
				/>

				{/* 4. Tab Content */}
				{viewMode === "student_view" && (
					<StudyPlanStudentTable
						students={studentKrsList}
						isLoading={isStudyPlansLoading}
						isError={isStudyPlansError}
						onRetry={() => refetch()}
						onAddSubjectClick={(studentId) => handleOpenAddModal(studentId)}
						onDropSubjectClick={(sp) => handleOpenDeleteModal(sp)}
					/>
				)}

				{viewMode === "catalog_view" && (
					<StudyPlanCatalogTable
						catalogItems={catalogList}
						isLoading={isStudyPlansLoading}
						isError={isStudyPlansError}
						deactivatedIds={deactivatedIds}
						onRetry={() => refetch()}
						onEnrollClick={(csId) => handleOpenAddModal(undefined, csId)}
						onToggleStatus={(csId, active) => {
							const updated = toggleClassSubjectActiveStatus(csId, active);
							setDeactivatedIds(updated);
							const item = catalogList.find((c) => c.id === csId);
							const name = item ? item.subjectName : "Mata pelajaran";
							setNotice({
								kind: "success",
								message: `${name} berhasil di${active ? "aktifkan" : "nonaktifkan"}.`,
							});
						}}
					/>
				)}

				{viewMode === "log_view" && (
					<StudyPlanLogTable
						studyPlans={displayStudyPlans}
						meta={meta}
						isLoading={isStudyPlansLoading}
						isError={isStudyPlansError}
						onRetry={() => refetch()}
						onEdit={(sp) => handleOpenEditModal(sp)}
						onDelete={(sp) => handleOpenDeleteModal(sp)}
						onPageChange={setPage}
						onLimitChange={(newLimit) => {
							setLimit(newLimit);
							setPage(1);
						}}
					/>
				)}

				{/* 5. Modal Dialog Tambah / Ubah */}
				<StudyPlanDialog
					isOpen={isDialogOpen}
					onClose={() => setIsDialogOpen(false)}
					onSubmit={handleSaveStudyPlan}
					studyPlan={editingStudyPlan}
					initialStudentId={preselectedStudentId}
					initialClassSubjectId={preselectedClassSubjectId}
					students={enrichedStudentsOptions}
					classSubjects={mergedClassSubjects}
					academicYears={academicYears}
					departments={departments}
					existingStudyPlans={rawStudyPlans}
					deactivatedIds={deactivatedIds}
					isSubmitting={createMutation.isPending || updateMutation.isPending}
					activeAcademicYearId={academicYearId}
				/>

				{/* 6. Modal Dialog Konfirmasi Hapus / Drop */}
				<DeleteStudyPlanDialog
					isOpen={Boolean(deletingStudyPlan)}
					onClose={() => setDeletingStudyPlan(null)}
					onConfirm={handleConfirmDelete}
					studyPlan={deletingStudyPlan}
					isDeleting={deleteMutation.isPending}
				/>
			</div>
		</main>
	);
};
