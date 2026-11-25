import {
	AlertTriangle,
	Check,
	ChevronDown,
	PackageCheck,
	Search,
	Shield,
	ShieldAlert,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type {
	AcademicYearOption,
	ClassSubjectOption,
	DepartmentOption,
	SemesterOption,
	StudentOption,
	StudyPlan,
} from "../types";

export interface StudyPlanDialogSubmitPayload {
	student_id: string;
	academic_year_id: string;
	semester_id?: string;
	class_subject_id?: string;
	class_subject_ids?: string[];
}

interface StudyPlanDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: StudyPlanDialogSubmitPayload) => Promise<void>;
	studyPlan?: StudyPlan | null;
	initialStudentId?: string;
	initialClassSubjectId?: string;
	initialSemesterId?: string;
	initialDepartmentId?: string;
	initialBundleMode?: boolean;
	students: StudentOption[];
	classSubjects: ClassSubjectOption[];
	academicYears: AcademicYearOption[];
	semesters?: SemesterOption[];
	departments?: DepartmentOption[];
	existingStudyPlans?: StudyPlan[];
	deactivatedIds?: string[];
	isSubmitting?: boolean;
	activeAcademicYearId?: string;
}

export const StudyPlanDialog: React.FC<StudyPlanDialogProps> = ({
	isOpen,
	onClose,
	onSubmit,
	studyPlan,
	initialStudentId,
	initialClassSubjectId,
	initialSemesterId,
	initialDepartmentId,
	initialBundleMode = false,
	students,
	classSubjects,
	academicYears,
	semesters = [],
	departments = [],
	existingStudyPlans = [],
	deactivatedIds = [],
	isSubmitting = false,
	activeAcademicYearId,
}) => {
	const isEditing = Boolean(studyPlan);

	// 1. Form States
	const [selectedStudentId, setSelectedStudentId] = useState<string>("");
	const [selectedAcademicYearId, setSelectedAcademicYearId] =
		useState<string>("");
	const [selectedSemesterId, setSelectedSemesterId] = useState<string>("");
	const [selectedDepartmentPill, setSelectedDepartmentPill] =
		useState<string>("");
	const [selectedClassSubjectIds, setSelectedClassSubjectIds] = useState<
		string[]
	>([]);
	const [selectedClassSubjectId, setSelectedClassSubjectId] =
		useState<string>("");
	const [isAutoBundleEnabled, setIsAutoBundleEnabled] =
		useState<boolean>(initialBundleMode);

	// Searchable Combobox States
	const [isStudentDropdownOpen, setIsStudentDropdownOpen] = useState(false);
	const [studentSearchQuery, setStudentSearchQuery] = useState("");
	const studentComboboxRef = useRef<HTMLDivElement>(null);
	const searchInputRef = useRef<HTMLInputElement>(null);

	// 2. Active ClassSubjects in the selected Academic Year
	const activeClassSubjectsInYear = useMemo(() => {
		const targetAy = selectedAcademicYearId || activeAcademicYearId;
		return classSubjects.filter((cs) => {
			if (deactivatedIds.includes(cs.id)) return false;
			if (cs.isActive === false) return false;
			if (targetAy && cs.academicYearId && cs.academicYearId !== targetAy) {
				return false;
			}
			return true;
		});
	}, [
		classSubjects,
		selectedAcademicYearId,
		activeAcademicYearId,
		deactivatedIds,
	]);

	// Available Semesters for selected Academic Year
	const availableSemesters = useMemo(() => {
		const targetAy = selectedAcademicYearId || activeAcademicYearId;
		if (!targetAy) return semesters;
		return semesters.filter((s) => s.academic_year_id === targetAy);
	}, [semesters, selectedAcademicYearId, activeAcademicYearId]);

	// Department bundle subjects
	const departmentBundleSubjects = useMemo(() => {
		if (!selectedDepartmentPill || selectedDepartmentPill === "umum") return [];
		return activeClassSubjectsInYear.filter(
			(cs) => cs.departmentId === selectedDepartmentPill,
		);
	}, [activeClassSubjectsInYear, selectedDepartmentPill]);

	const departmentBundleCredits = useMemo(() => {
		return departmentBundleSubjects.reduce(
			(sum, cs) => sum + (cs.credits || 0),
			0,
		);
	}, [departmentBundleSubjects]);

	const currentDepartmentName = useMemo(() => {
		if (!selectedDepartmentPill) return "";
		if (selectedDepartmentPill === "umum") return "Umum / Tanpa Bidang";
		const dept = departments.find((d) => d.id === selectedDepartmentPill);
		return dept?.name || "Jurusan";
	}, [selectedDepartmentPill, departments]);

	const currentSemesterName = useMemo(() => {
		if (selectedSemesterId) {
			const s = semesters.find((item) => item.id === selectedSemesterId);
			if (s) return s.name;
		}
		const ay = academicYears.find((item) => item.id === selectedAcademicYearId);
		return ay?.academic_year || "Semester Aktif";
	}, [selectedSemesterId, semesters, selectedAcademicYearId, academicYears]);

	// 3. Department pills available strictly for the selected Academic Year
	const departmentPills = useMemo(() => {
		const deptIdsInYear = new Set<string>();
		let hasUmum = false;

		for (const cs of activeClassSubjectsInYear) {
			if (cs.departmentId) {
				deptIdsInYear.add(cs.departmentId);
			} else {
				hasUmum = true;
			}
		}

		const list: { id: string; name: string }[] = [];

		for (const dept of departments) {
			if (deptIdsInYear.has(dept.id)) {
				list.push({ id: dept.id, name: dept.name });
			}
		}

		for (const cs of activeClassSubjectsInYear) {
			if (cs.departmentId && !list.some((d) => d.id === cs.departmentId)) {
				list.push({
					id: cs.departmentId,
					name: cs.departmentName || "Bidang",
				});
			}
		}

		if (hasUmum) {
			list.push({ id: "umum", name: "Umum / Tanpa Bidang" });
		}

		return list;
	}, [activeClassSubjectsInYear, departments]);

	// 4. Initialize values when dialog opens
	useEffect(() => {
		if (isOpen) {
			setIsStudentDropdownOpen(false);
			setStudentSearchQuery("");
			setIsAutoBundleEnabled(initialBundleMode);

			if (studyPlan) {
				setSelectedStudentId(studyPlan.student_id);
				setSelectedAcademicYearId(studyPlan.academic_year_id);
				setSelectedClassSubjectId(studyPlan.class_subject_id);
				setSelectedClassSubjectIds([studyPlan.class_subject_id]);
				setSelectedSemesterId(initialSemesterId || "");

				const deptId =
					studyPlan.classSubject?.subject?.departmentId ||
					studyPlan.student?.departmentId ||
					"umum";
				setSelectedDepartmentPill(deptId);
			} else {
				const defaultAy =
					activeAcademicYearId ||
					academicYears.find((ay) => ay.is_active)?.id ||
					academicYears[0]?.id ||
					"";

				const initialStId = initialStudentId || students[0]?.id || "";
				setSelectedStudentId(initialStId);
				setSelectedAcademicYearId(defaultAy);

				const matchingSem =
					(initialSemesterId &&
						semesters.find((s) => s.id === initialSemesterId)) ||
					semesters.find(
						(s) => s.academic_year_id === defaultAy && s.is_active,
					) ||
					semesters.find((s) => s.academic_year_id === defaultAy) ||
					semesters[0];
				setSelectedSemesterId(matchingSem ? matchingSem.id : "");

				if (initialClassSubjectId) {
					setSelectedClassSubjectIds([initialClassSubjectId]);
					setSelectedClassSubjectId(initialClassSubjectId);
					const cs = classSubjects.find((c) => c.id === initialClassSubjectId);
					setSelectedDepartmentPill(cs?.departmentId || "umum");
				} else {
					const st = students.find((s) => s.id === initialStId);
					const targetDept =
						initialDepartmentId || st?.departmentId || "";
					setSelectedDepartmentPill(targetDept);

					if (initialBundleMode && targetDept && targetDept !== "umum") {
						const deptSubjects = classSubjects.filter((cs) => {
							if (deactivatedIds.includes(cs.id)) return false;
							if (cs.isActive === false) return false;
							if (
								defaultAy &&
								cs.academicYearId &&
								cs.academicYearId !== defaultAy
							) {
								return false;
							}
							return cs.departmentId === targetDept;
						});
						setSelectedClassSubjectIds(deptSubjects.map((cs) => cs.id));
					} else {
						setSelectedClassSubjectIds([]);
					}
					setSelectedClassSubjectId("");
				}
			}
		} else {
			setIsStudentDropdownOpen(false);
			setStudentSearchQuery("");
		}
	}, [
		isOpen,
		studyPlan,
		initialStudentId,
		initialClassSubjectId,
		initialSemesterId,
		initialDepartmentId,
		initialBundleMode,
		activeAcademicYearId,
		academicYears,
		semesters,
		students,
		classSubjects,
		deactivatedIds,
	]);

	// 5. Auto-select academic year when options load or become available
	useEffect(() => {
		if (!selectedAcademicYearId && academicYears.length > 0) {
			const defaultAy =
				activeAcademicYearId ||
				academicYears.find((ay) => ay.is_active)?.id ||
				academicYears[0]?.id ||
				"";
			if (defaultAy) {
				setSelectedAcademicYearId(defaultAy);
			}
		}
	}, [selectedAcademicYearId, activeAcademicYearId, academicYears]);

	// 6. Synchronize selected department pill with available pills in the selected Academic Year
	useEffect(() => {
		if (departmentPills.length === 0) {
			if (selectedDepartmentPill !== "") {
				setSelectedDepartmentPill("");
			}
			return;
		}

		const isCurrentAvailable = departmentPills.some(
			(p) => p.id === selectedDepartmentPill,
		);

		if (!isCurrentAvailable) {
			const st = students.find((s) => s.id === selectedStudentId);
			const stDeptInPills =
				st?.departmentId &&
				departmentPills.some((p) => p.id === st.departmentId);

			if (stDeptInPills && st?.departmentId) {
				setSelectedDepartmentPill(st.departmentId);
			} else if (departmentPills.length > 0) {
				setSelectedDepartmentPill(departmentPills[0]?.id || "");
			} else {
				setSelectedDepartmentPill("");
			}
		}
	}, [departmentPills, selectedDepartmentPill, selectedStudentId, students]);

	// Auto-select department pill and bundle when student changes (in Add mode)
	useEffect(() => {
		if (selectedStudentId && !isEditing) {
			const st = students.find((s) => s.id === selectedStudentId);
			if (
				st?.departmentId &&
				departmentPills.some((p) => p.id === st.departmentId)
			) {
				setSelectedDepartmentPill(st.departmentId);
				if (isAutoBundleEnabled) {
					const targetAy = selectedAcademicYearId || activeAcademicYearId;
					const deptSubjects = classSubjects.filter((cs) => {
						if (deactivatedIds.includes(cs.id)) return false;
						if (cs.isActive === false) return false;
						if (
							targetAy &&
							cs.academicYearId &&
							cs.academicYearId !== targetAy
						) {
							return false;
						}
						return cs.departmentId === st.departmentId;
					});
					setSelectedClassSubjectIds(deptSubjects.map((cs) => cs.id));
				}
			}
		}
	}, [
		selectedStudentId,
		students,
		isEditing,
		departmentPills,
		isAutoBundleEnabled,
		classSubjects,
		deactivatedIds,
		selectedAcademicYearId,
		activeAcademicYearId,
	]);

	// Department Pill Change Handler with auto-bundling
	const handleDepartmentPillChange = (deptId: string) => {
		setSelectedDepartmentPill(deptId);
		if (!isEditing && isAutoBundleEnabled && deptId && deptId !== "umum") {
			const targetAy = selectedAcademicYearId || activeAcademicYearId;
			const deptSubjects = classSubjects.filter((cs) => {
				if (deactivatedIds.includes(cs.id)) return false;
				if (cs.isActive === false) return false;
				if (
					targetAy &&
					cs.academicYearId &&
					cs.academicYearId !== targetAy
				) {
					return false;
				}
				return cs.departmentId === deptId;
			});
			setSelectedClassSubjectIds(deptSubjects.map((cs) => cs.id));
		}
	};

	// When Academic Year changes, update semester and bundle
	const handleAcademicYearChange = (newAyId: string) => {
		setSelectedAcademicYearId(newAyId);
		const semsInNewYear = semesters.filter(
			(s) => s.academic_year_id === newAyId,
		);
		const activeSem =
			semsInNewYear.find((s) => s.is_active) || semsInNewYear[0];
		setSelectedSemesterId(activeSem ? activeSem.id : "");

		if (!isEditing) {
			if (
				isAutoBundleEnabled &&
				selectedDepartmentPill &&
				selectedDepartmentPill !== "umum"
			) {
				const deptSubjects = classSubjects.filter((cs) => {
					if (deactivatedIds.includes(cs.id)) return false;
					if (cs.isActive === false) return false;
					if (newAyId && cs.academicYearId && cs.academicYearId !== newAyId) {
						return false;
					}
					return cs.departmentId === selectedDepartmentPill;
				});
				setSelectedClassSubjectIds(deptSubjects.map((cs) => cs.id));
			} else {
				setSelectedClassSubjectIds([]);
			}
		}
	};

	// When Semester changes, sync academic year and bundle
	const handleSemesterChange = (newSemId: string) => {
		setSelectedSemesterId(newSemId);
		if (newSemId) {
			setIsAutoBundleEnabled(true);
			const sem = semesters.find((s) => s.id === newSemId);
			if (
				sem &&
				sem.academic_year_id &&
				sem.academic_year_id !== selectedAcademicYearId
			) {
				setSelectedAcademicYearId(sem.academic_year_id);
			}
			if (
				!isEditing &&
				selectedDepartmentPill &&
				selectedDepartmentPill !== "umum"
			) {
				const targetAy =
					sem?.academic_year_id ||
					selectedAcademicYearId ||
					activeAcademicYearId;
				const deptSubjects = classSubjects.filter((cs) => {
					if (deactivatedIds.includes(cs.id)) return false;
					if (cs.isActive === false) return false;
					if (
						targetAy &&
						cs.academicYearId &&
						cs.academicYearId !== targetAy
					) {
						return false;
					}
					return cs.departmentId === selectedDepartmentPill;
				});
				setSelectedClassSubjectIds(deptSubjects.map((cs) => cs.id));
			}
		}
	};

	// Bundle operations: Apply All / Clear All
	const handleApplyBundle = () => {
		if (departmentBundleSubjects.length === 0) return;
		const bundleIds = departmentBundleSubjects.map((cs) => cs.id);
		setSelectedClassSubjectIds((prev) => {
			const set = new Set(prev);
			for (const id of bundleIds) {
				set.add(id);
			}
			return Array.from(set);
		});
	};

	const handleClearBundle = () => {
		if (departmentBundleSubjects.length === 0) return;
		const bundleIdSet = new Set(departmentBundleSubjects.map((cs) => cs.id));
		setSelectedClassSubjectIds((prev) =>
			prev.filter((id) => !bundleIdSet.has(id)),
		);
	};

	// Focus search input when combobox opens
	useEffect(() => {
		if (isStudentDropdownOpen) {
			const timer = setTimeout(() => {
				searchInputRef.current?.focus();
			}, 50);
			return () => clearTimeout(timer);
		}
	}, [isStudentDropdownOpen]);

	// Click outside & Escape handling for student combobox
	useEffect(() => {
		if (!isStudentDropdownOpen) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (
				studentComboboxRef.current &&
				!studentComboboxRef.current.contains(event.target as Node)
			) {
				setIsStudentDropdownOpen(false);
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setIsStudentDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isStudentDropdownOpen]);

	// Filtered students list for searchable combobox
	const filteredStudents = useMemo(() => {
		if (!studentSearchQuery.trim()) return students;
		const q = studentSearchQuery.toLowerCase().trim();
		return students.filter((st) => {
			const nameMatch = st.fullName.toLowerCase().includes(q);
			const emailMatch = st.email ? st.email.toLowerCase().includes(q) : false;
			const nisMatch = st.studentNumber
				? st.studentNumber.toLowerCase().includes(q)
				: false;
			const deptMatch = st.departmentName
				? st.departmentName.toLowerCase().includes(q)
				: false;
			const classMatch = st.className
				? st.className.toLowerCase().includes(q)
				: false;
			return nameMatch || emailMatch || nisMatch || deptMatch || classMatch;
		});
	}, [students, studentSearchQuery]);

	// Student details & primary department
	const selectedStudent = useMemo(() => {
		return students.find((s) => s.id === selectedStudentId);
	}, [students, selectedStudentId]);

	const studentPrimaryDeptName = useMemo(() => {
		if (!selectedStudent) return "-";
		if (selectedStudent.departmentId) {
			const dept = departments.find(
				(d) => d.id === selectedStudent.departmentId,
			);
			if (dept) return dept.name;
		}
		return selectedStudent.departmentName || "-";
	}, [selectedStudent, departments]);

	// Available ClassSubjects matching Department Pill
	const availableClassSubjectsForPill = useMemo(() => {
		if (!selectedDepartmentPill) return [];

		if (selectedDepartmentPill === "umum") {
			return activeClassSubjectsInYear.filter((cs) => !cs.departmentId);
		}

		return activeClassSubjectsInYear.filter(
			(cs) => cs.departmentId === selectedDepartmentPill,
		);
	}, [activeClassSubjectsInYear, selectedDepartmentPill]);

	// Set of already taken classSubjectIds by this student in the selected Academic Year
	const alreadyTakenClassSubjectIds = useMemo(() => {
		if (!selectedStudentId || !selectedAcademicYearId) return new Set<string>();
		const plans = existingStudyPlans.filter(
			(sp) =>
				sp.student_id === selectedStudentId &&
				sp.academic_year_id === selectedAcademicYearId,
		);
		return new Set(plans.map((p) => p.class_subject_id));
	}, [existingStudyPlans, selectedStudentId, selectedAcademicYearId]);

	// SKS Calculation
	const sksTerpakaiAwal = useMemo(() => {
		if (!selectedStudentId || !selectedAcademicYearId) return 0;
		const userPlans = existingStudyPlans.filter(
			(sp) =>
				sp.student_id === selectedStudentId &&
				sp.academic_year_id === selectedAcademicYearId,
		);
		if (userPlans.length > 0) {
			return userPlans.reduce(
				(sum, sp) => sum + (sp.classSubject?.subject?.credits ?? 0),
				0,
			);
		}
		return selectedStudent?.currentCredits ?? 0;
	}, [
		existingStudyPlans,
		selectedStudentId,
		selectedAcademicYearId,
		selectedStudent,
	]);

	const sksTambahan = useMemo(() => {
		if (isEditing) {
			if (studyPlan?.class_subject_id === selectedClassSubjectId) return 0;
			const cs = classSubjects.find((c) => c.id === selectedClassSubjectId);
			return cs?.credits ?? 0;
		}
		return selectedClassSubjectIds.reduce((sum, id) => {
			const cs = classSubjects.find((c) => c.id === id);
			return sum + (cs?.credits ?? 0);
		}, 0);
	}, [
		isEditing,
		studyPlan,
		selectedClassSubjectId,
		selectedClassSubjectIds,
		classSubjects,
	]);

	const totalSksAkhir = sksTerpakaiAwal + sksTambahan;
	const batasMaksimalSks = 24;
	const sisaKuota = batasMaksimalSks - totalSksAkhir;
	const isOverLimit = totalSksAkhir > batasMaksimalSks;

	const isAllBundleSelected = useMemo(() => {
		if (departmentBundleSubjects.length === 0) return false;
		return departmentBundleSubjects.every(
			(cs) =>
				selectedClassSubjectIds.includes(cs.id) ||
				alreadyTakenClassSubjectIds.has(cs.id),
		);
	}, [
		departmentBundleSubjects,
		selectedClassSubjectIds,
		alreadyTakenClassSubjectIds,
	]);

	// Toggle subject selection
	const handleToggleClassSubject = (id: string) => {
		if (isEditing) {
			setSelectedClassSubjectId(id);
			return;
		}
		setSelectedClassSubjectIds((prev) =>
			prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
		);
	};

	const handleFormSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedStudentId || isOverLimit) return;

		if (isEditing) {
			if (!selectedClassSubjectId) return;
			await onSubmit({
				student_id: selectedStudentId,
				academic_year_id: selectedAcademicYearId,
				semester_id: selectedSemesterId || undefined,
				class_subject_id: selectedClassSubjectId,
				class_subject_ids: [selectedClassSubjectId],
			});
		} else {
			if (selectedClassSubjectIds.length === 0) return;
			await onSubmit({
				student_id: selectedStudentId,
				academic_year_id: selectedAcademicYearId,
				semester_id: selectedSemesterId || undefined,
				class_subject_id: selectedClassSubjectIds[0],
				class_subject_ids: selectedClassSubjectIds,
			});
		}
		onClose();
	};

	const selectedStudentIdentifier = selectedStudent
		? selectedStudent.email || selectedStudent.studentNumber
		: "";
	const triggerLabel = selectedStudent
		? `${selectedStudent.fullName} (${selectedStudentIdentifier}) — Terpakai: ${sksTerpakaiAwal}/24 SKS`
		: "Pilih Siswa / Mahasiswa";

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-w-2xl border-slate-200 bg-white p-6 text-slate-900 shadow-2xl dark:border-slate-800 dark:bg-[#111927] dark:text-slate-100">
				{/* 1. Header Modal */}
				<DialogHeader className="border-b border-slate-200 pb-3 text-left dark:border-slate-800/80">
					<div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
						{isEditing ? (
							<Shield className="size-4" />
						) : (
							<ShieldAlert className="size-4" />
						)}
						<span>
							{isEditing
								? "INTERVENSI ADMIN (UBAH RENCANA STUDI)"
								: "INTERVENSI ADMIN (FORCE ENROLL)"}
						</span>
					</div>
					<DialogTitle className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
						{isEditing
							? "Ubah Rencana Studi Manual"
							: "Tambah Rencana Studi Manual"}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
						Pilih bidang studi, lalu centang satu atau beberapa mata pelajaran
						sesuai sisa kuota kredit (SKS) siswa.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
					{/* 2. Grid Baris 1 & 2: Siswa & Tahun Ajaran */}
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						{/* Urutan 1: Siswa / Mahasiswa (Searchable Combobox) */}
						<div className="relative">
							<label
								htmlFor="student_id"
								className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
							>
								1. SISWA / MAHASISWA{" "}
								<span className="text-rose-500 dark:text-rose-400">*</span>
							</label>
							<div ref={studentComboboxRef} className="relative">
								<button
									type="button"
									id="student_id"
									role="combobox"
									aria-expanded={isStudentDropdownOpen}
									aria-haspopup="listbox"
									aria-label="1. SISWA / MAHASISWA"
									disabled={isEditing}
									onClick={() => setIsStudentDropdownOpen((prev) => !prev)}
									className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
								>
									<span className="truncate pr-2">{triggerLabel}</span>
									<ChevronDown
										className={`size-4 shrink-0 text-slate-400 transition-transform ${
											isStudentDropdownOpen ? "rotate-180" : ""
										}`}
									/>
								</button>

								{/* Dropdown Popover */}
								{isStudentDropdownOpen && !isEditing && (
									<div
										role="listbox"
										className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#0c1322]"
									>
										{/* Sticky Search Header */}
										<div className="sticky top-0 z-10 border-b border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-[#0c1322]">
											<div className="relative">
												<Search className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-slate-400" />
												<input
													ref={searchInputRef}
													type="text"
													value={studentSearchQuery}
													onChange={(e) =>
														setStudentSearchQuery(e.target.value)
													}
													placeholder="Cari nama siswa, email, atau NIS/NIM..."
													className="h-8 w-full rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-7 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:placeholder:text-slate-500"
												/>
												{studentSearchQuery && (
													<button
														type="button"
														onClick={() => setStudentSearchQuery("")}
														title="Hapus pencarian"
														aria-label="Hapus kata kunci pencarian"
														className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white"
													>
														<X className="size-3.5" />
													</button>
												)}
											</div>
											<div className="mt-1 px-1 text-[10px] text-slate-500 dark:text-slate-400">
												Menampilkan {filteredStudents.length} dari{" "}
												{students.length} siswa
											</div>
										</div>

										{/* Scrollable Student Options List */}
										<div className="max-h-52 overflow-y-auto p-1 space-y-0.5">
											{filteredStudents.length === 0 ? (
												<div className="py-4 text-center text-xs text-slate-500 dark:text-slate-400">
													Siswa tidak ditemukan untuk kata kunci tersebut.
												</div>
											) : (
												filteredStudents.map((st) => {
													const isSelected = st.id === selectedStudentId;
													const userPlans = existingStudyPlans.filter(
														(sp) =>
															sp.student_id === st.id &&
															sp.academic_year_id === selectedAcademicYearId,
													);
													const credits =
														userPlans.length > 0
															? userPlans.reduce(
																	(sum, sp) =>
																		sum +
																		(sp.classSubject?.subject?.credits ?? 0),
																	0,
																)
															: (st.currentCredits ?? 0);
													const identifier = st.email || st.studentNumber;

													return (
														<button
															key={st.id}
															type="button"
															role="option"
															aria-selected={isSelected}
															onClick={() => {
																setSelectedStudentId(st.id);
																setIsStudentDropdownOpen(false);
																setStudentSearchQuery("");
															}}
															className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
																isSelected
																	? "bg-blue-50 text-blue-700 font-semibold dark:bg-blue-600/20 dark:text-blue-300"
																	: "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800/80"
															}`}
														>
															<div className="min-w-0 flex-1 pr-2">
																<div className="truncate font-medium text-slate-900 dark:text-white">
																	{st.fullName}
																</div>
																<div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
																	{identifier ? `${identifier} • ` : ""}
																	{st.className
																		? `Kelas: ${st.className} • `
																		: ""}
																	Terpakai: {credits}/24 SKS
																</div>
															</div>
															{isSelected && (
																<Check className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
															)}
														</button>
													);
												})
											)}
										</div>
									</div>
								)}
							</div>
						</div>

						{/* Urutan 2: Tahun Ajaran & Semester */}
						<div className="space-y-1">
							<label
								htmlFor="academic_year_id"
								className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300"
							>
								2. TAHUN AJARAN & SEMESTER{" "}
								<span className="text-rose-500 dark:text-rose-400">*</span>
							</label>
							<div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
								<div>
									<select
										id="academic_year_id"
										value={selectedAcademicYearId}
										onChange={(e) => handleAcademicYearChange(e.target.value)}
										aria-label="Pilih Tahun Ajaran"
										className="h-10 w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
									>
										<option value="">Pilih Tahun Ajaran</option>
										{academicYears.map((ay) => {
											const statusText = ay.is_active ? "Aktif" : "Tidak Aktif";
											const labelText = `${ay.academic_year} (${statusText})`;

											return (
												<option key={ay.id} value={ay.id}>
													{labelText}
												</option>
											);
										})}
									</select>
								</div>
								<div>
									<select
										id="semester_id"
										value={selectedSemesterId}
										onChange={(e) => handleSemesterChange(e.target.value)}
										aria-label="Pilih Semester"
										className="h-10 w-full truncate rounded-lg border border-slate-200 bg-slate-50 px-2.5 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
									>
										<option value="">Pilih Semester</option>
										{availableSemesters.map((sem) => (
											<option key={sem.id} value={sem.id}>
												{sem.name} {sem.is_active ? "(Aktif)" : ""}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>
					</div>

					{/* 3. Urutan 3: Pilih Bidang / Departemen (Single-Select Interactive Pill Buttons) */}
					<div className="space-y-2">
						<div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
							<span className="text-slate-700 dark:text-slate-300">
								3. PILIH BIDANG / DEPARTEMEN{" "}
								<span className="text-rose-500 dark:text-rose-400">*</span>
							</span>
							<span className="text-xs font-normal normal-case text-slate-500 dark:text-slate-400">
								Bidang utama siswa:{" "}
								<span className="font-semibold text-emerald-600 dark:text-emerald-400">
									{studentPrimaryDeptName}
								</span>
							</span>
						</div>

						{departmentPills.length === 0 ? (
							<div className="py-3 text-xs text-slate-500 dark:text-slate-400">
								Belum ada bidang studi / mata pelajaran kelas yang dibuka pada
								tahun ajaran ini.
							</div>
						) : (
							<div className="flex flex-wrap items-center gap-2">
								{departmentPills.map((dept) => {
									const isSelected = selectedDepartmentPill === dept.id;
									return (
										<button
											key={dept.id}
											type="button"
											onClick={() => handleDepartmentPillChange(dept.id)}
											className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
												isSelected
													? "border border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm dark:bg-emerald-500/20 dark:text-emerald-400"
													: "border border-slate-200 bg-slate-100 text-slate-700 hover:border-slate-300 hover:bg-slate-200/80 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
											}`}
										>
											<span
												className={`size-2 rounded-full ${
													isSelected
														? "bg-emerald-500 dark:bg-emerald-400"
														: "bg-slate-400 dark:bg-slate-500"
												}`}
											/>
											<span>{dept.name}</span>
										</button>
									);
								})}
							</div>
						)}
					</div>

					{/* 3B. Paket KRS Jurusan dalam Semester (Bundle Card) */}
					{departmentBundleSubjects.length > 0 && !isEditing && (
						<div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-blue-50/90 p-3.5 shadow-sm dark:border-blue-900/60 dark:from-blue-950/40 dark:via-indigo-950/30 dark:to-blue-950/40">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
								<div className="flex items-start gap-3">
									<div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm dark:bg-blue-500">
										<PackageCheck className="size-5" />
									</div>
									<div>
										<div className="flex items-center gap-2 flex-wrap">
											<span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
												Paket KRS: {currentDepartmentName}
											</span>
											<span className="rounded-md border border-blue-200 bg-blue-100/70 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
												{currentSemesterName}
											</span>
										</div>
										<p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-400">
											Sistem menggabungkan paket{" "}
											<strong className="text-slate-900 dark:text-white">
												{departmentBundleSubjects.length} mata pelajaran
											</strong>{" "}
											dengan bobot{" "}
											<strong className="text-blue-700 dark:text-blue-300">
												{departmentBundleCredits} SKS
											</strong>{" "}
											untuk jurusan ini pada semester ini.
										</p>
									</div>
								</div>

								<div className="flex items-center gap-2 shrink-0">
									<button
										type="button"
										onClick={
											isAllBundleSelected
												? handleClearBundle
												: handleApplyBundle
										}
										className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold shadow-sm transition-all ${
											isAllBundleSelected
												? "border border-emerald-300 bg-emerald-100/80 text-emerald-800 hover:bg-emerald-200/80 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
												: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
										}`}
									>
										{isAllBundleSelected ? (
											<>
												<Check className="size-3.5 text-emerald-700 dark:text-emerald-400" />
												<span>
													Paket Tergabung ({departmentBundleSubjects.length} Mapel)
												</span>
											</>
										) : (
											<>
												<PackageCheck className="size-3.5" />
												<span>
													Gabungkan Semua Paket ({departmentBundleSubjects.length}{" "}
													Mapel • {departmentBundleCredits} SKS)
												</span>
											</>
										)}
									</button>
								</div>
							</div>
						</div>
					)}

					{/* 4. Urutan 4: Daftar Mata Pelajaran Kelas (Multi-Select Checkbox Cards) */}
					<div className="space-y-2">
						<span className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
							{isEditing
								? "4. PILIH MATA PELAJARAN *"
								: "4. PILIH MATA PELAJARAN (BISA PILIH LEBIH DARI SATU) *"}
						</span>

						<div className="max-h-56 overflow-y-auto space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-[#0b1120]">
							{availableClassSubjectsForPill.length === 0 ? (
								<div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
									Tidak ada mata pelajaran kelas yang tersedia untuk bidang dan
									tahun ajaran ini.
								</div>
							) : (
								availableClassSubjectsForPill.map((cs) => {
									const isAlreadyTaken = alreadyTakenClassSubjectIds.has(cs.id);
									const isChecked = isEditing
										? selectedClassSubjectId === cs.id
										: selectedClassSubjectIds.includes(cs.id);

									return (
										<label
											key={cs.id}
											className={`flex items-center justify-between rounded-xl border p-3 transition-all ${
												isAlreadyTaken && !isEditing
													? "border-slate-200 bg-slate-100 opacity-60 cursor-not-allowed dark:border-slate-800/60 dark:bg-slate-900/30"
													: isChecked
														? "border-blue-500 bg-blue-50 shadow-sm cursor-pointer dark:border-blue-500/60 dark:bg-blue-950/20"
														: "border-slate-200 bg-white hover:border-slate-300 cursor-pointer dark:border-slate-800/80 dark:bg-[#0d1526]/80 dark:hover:border-slate-700/80"
											}`}
										>
											<div className="flex items-center gap-3 min-w-0 flex-1 pr-3">
												<input
													type="checkbox"
													checked={isChecked || (isAlreadyTaken && !isEditing)}
													disabled={isAlreadyTaken && !isEditing}
													onChange={() => {
														if (isAlreadyTaken && !isEditing) return;
														handleToggleClassSubject(cs.id);
													}}
													aria-label={cs.subjectName}
													className="size-4 rounded border-slate-300 bg-white text-blue-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed dark:border-slate-700 dark:bg-[#0c1322]"
												/>
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2 flex-wrap">
														{cs.subjectCode && (
															<span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
																[{cs.subjectCode}]
															</span>
														)}
														<span className="font-bold text-xs text-slate-900 dark:text-white">
															{cs.subjectName}
														</span>
														{cs.departmentId === selectedDepartmentPill &&
															selectedDepartmentPill !== "umum" && (
																<span className="rounded-md border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300">
																	Paket Jurusan
																</span>
															)}
														{isAlreadyTaken && (
															<span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
																Sudah Diambil
															</span>
														)}
													</div>
													<p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
														Kelas: {cs.className} • Pengajar:{" "}
														{cs.teacherName || "Pengajar"}
													</p>
												</div>
											</div>
											<div className="shrink-0">
												<span className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 dark:border-blue-500/30 dark:bg-blue-950/60 dark:text-blue-400">
													+{cs.credits} SKS
												</span>
											</div>
										</label>
									);
								})
							)}
						</div>
					</div>

					{/* 5. Status Kuota Kredit (SKS) Box */}
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800/90 dark:bg-[#0c1322]">
						<div>
							<p className="text-xs text-slate-600 dark:text-slate-400">
								Kredit Terpakai:{" "}
								<strong className="text-slate-900 dark:text-white">
									{sksTerpakaiAwal} SKS
								</strong>{" "}
								+ Dipilih Baru:{" "}
								<strong className="text-emerald-600 dark:text-emerald-400">
									{sksTambahan} SKS ({selectedClassSubjectIds.length} Mapel)
								</strong>
							</p>
							<p className="mt-1 text-sm font-bold text-slate-900 dark:text-white">
								Total Kredit Akhir:{" "}
								<span
									className={
										isOverLimit
											? "text-rose-600 dark:text-rose-400"
											: "text-emerald-600 dark:text-emerald-400"
									}
								>
									{totalSksAkhir} / 24 SKS
								</span>
							</p>
						</div>
						<div className="shrink-0">
							<span
								className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
									isOverLimit
										? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-950/40 dark:text-rose-400"
										: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-950/40 dark:text-emerald-400"
								}`}
							>
								Sisa Kuota: {sisaKuota} SKS
							</span>
						</div>
					</div>

					{/* 6. Alert Box saat melebihi batas 24 SKS */}
					{isOverLimit && (
						<div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-400">
							<AlertTriangle className="size-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
							<div>
								<p className="font-bold text-red-800 dark:text-red-300">
									Kredit siswa tidak mencukupi!
								</p>
								<p className="mt-0.5 text-red-700 dark:text-red-400/90 leading-relaxed">
									Total beban studi mencapai {totalSksAkhir} SKS dan melebihi
									batas maksimal 24 SKS (kelebihan {totalSksAkhir - 24} SKS).
									Silakan kurangi mata pelajaran yang dipilih.
								</p>
							</div>
						</div>
					)}

					{/* 7. Footer Modal */}
					<div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 mt-2 dark:border-slate-800/80">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700/60 dark:bg-transparent dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
						>
							Batal
						</button>
						<button
							type="submit"
							disabled={
								isSubmitting ||
								!selectedStudentId ||
								isOverLimit ||
								(isEditing
									? !selectedClassSubjectId
									: selectedClassSubjectIds.length === 0)
							}
							className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
						>
							<Check className="size-3.5" />
							<span>
								{isSubmitting
									? "Menyimpan..."
									: isEditing
										? "Simpan Perubahan"
										: `Simpan (${selectedClassSubjectIds.length} Mapel)`}
							</span>
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
