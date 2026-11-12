import {
	AlertTriangle,
	Check,
	ChevronDown,
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
	StudentOption,
	StudyPlan,
} from "../types";

export interface StudyPlanDialogSubmitPayload {
	student_id: string;
	academic_year_id: string;
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
	students: StudentOption[];
	classSubjects: ClassSubjectOption[];
	academicYears: AcademicYearOption[];
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
	students,
	classSubjects,
	academicYears,
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
	const [selectedDepartmentPill, setSelectedDepartmentPill] =
		useState<string>("");
	const [selectedClassSubjectIds, setSelectedClassSubjectIds] = useState<
		string[]
	>([]);
	const [selectedClassSubjectId, setSelectedClassSubjectId] =
		useState<string>("");

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

			if (studyPlan) {
				setSelectedStudentId(studyPlan.student_id);
				setSelectedAcademicYearId(studyPlan.academic_year_id);
				setSelectedClassSubjectId(studyPlan.class_subject_id);
				setSelectedClassSubjectIds([studyPlan.class_subject_id]);

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

				if (initialClassSubjectId) {
					setSelectedClassSubjectIds([initialClassSubjectId]);
					setSelectedClassSubjectId(initialClassSubjectId);
					const cs = classSubjects.find((c) => c.id === initialClassSubjectId);
					setSelectedDepartmentPill(cs?.departmentId || "umum");
				} else {
					setSelectedClassSubjectIds([]);
					setSelectedClassSubjectId("");

					const st = students.find((s) => s.id === initialStId);
					if (st?.departmentId) {
						setSelectedDepartmentPill(st.departmentId);
					} else {
						setSelectedDepartmentPill("");
					}
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
		activeAcademicYearId,
		academicYears,
		students,
		classSubjects,
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

	// Auto-select department pill when student changes (in Add mode)
	useEffect(() => {
		if (selectedStudentId && !isEditing) {
			const st = students.find((s) => s.id === selectedStudentId);
			if (
				st?.departmentId &&
				departmentPills.some((p) => p.id === st.departmentId)
			) {
				setSelectedDepartmentPill(st.departmentId);
			}
		}
	}, [selectedStudentId, students, isEditing, departmentPills]);

	// When Academic Year changes, reset selected class subjects (in Add mode)
	const handleAcademicYearChange = (newAyId: string) => {
		setSelectedAcademicYearId(newAyId);
		if (!isEditing) {
			setSelectedClassSubjectIds([]);
		}
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
				class_subject_id: selectedClassSubjectId,
				class_subject_ids: [selectedClassSubjectId],
			});
		} else {
			if (selectedClassSubjectIds.length === 0) return;
			await onSubmit({
				student_id: selectedStudentId,
				academic_year_id: selectedAcademicYearId,
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
			<DialogContent className="max-w-2xl border-slate-800 bg-[#111927] p-6 text-slate-100 shadow-2xl">
				{/* 1. Header Modal */}
				<DialogHeader className="border-b border-slate-800/80 pb-3 text-left">
					<div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-400">
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
					<DialogTitle className="mt-1 text-xl font-bold tracking-tight text-white">
						{isEditing
							? "Ubah Rencana Studi Manual"
							: "Tambah Rencana Studi Manual"}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-400">
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
								className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-300"
							>
								1. SISWA / MAHASISWA <span className="text-rose-400">*</span>
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
									className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-700/60 bg-[#0c1322] px-3 text-left text-xs text-slate-200 transition-colors focus:border-blue-500 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
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
										className="absolute left-0 right-0 top-full z-50 mt-1 max-h-72 overflow-hidden rounded-xl border border-slate-700 bg-[#0c1322] shadow-2xl"
									>
										{/* Sticky Search Header */}
										<div className="sticky top-0 z-10 border-b border-slate-800 bg-[#0c1322] p-2">
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
													className="h-8 w-full rounded-lg border border-slate-700 bg-slate-900/90 pl-8 pr-7 text-xs text-slate-200 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
												/>
												{studentSearchQuery && (
													<button
														type="button"
														onClick={() => setStudentSearchQuery("")}
														title="Hapus pencarian"
														aria-label="Hapus kata kunci pencarian"
														className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
													>
														<X className="size-3.5" />
													</button>
												)}
											</div>
											<div className="mt-1 px-1 text-[10px] text-slate-400">
												Menampilkan {filteredStudents.length} dari{" "}
												{students.length} siswa
											</div>
										</div>

										{/* Scrollable Student Options List */}
										<div className="max-h-52 overflow-y-auto p-1 space-y-0.5">
											{filteredStudents.length === 0 ? (
												<div className="py-4 text-center text-xs text-slate-400">
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
																	? "bg-blue-600/20 text-blue-300 font-semibold"
																	: "text-slate-200 hover:bg-slate-800/80"
															}`}
														>
															<div className="min-w-0 flex-1 pr-2">
																<div className="truncate font-medium text-white">
																	{st.fullName}
																</div>
																<div className="truncate text-[11px] text-slate-400">
																	{identifier ? `${identifier} • ` : ""}
																	{st.className
																		? `Kelas: ${st.className} • `
																		: ""}
																	Terpakai: {credits}/24 SKS
																</div>
															</div>
															{isSelected && (
																<Check className="size-4 shrink-0 text-blue-400" />
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

						{/* Urutan 2: Tahun Ajaran */}
						<div>
							<label
								htmlFor="academic_year_id"
								className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-300"
							>
								2. TAHUN AJARAN <span className="text-rose-400">*</span>
							</label>
							<select
								id="academic_year_id"
								value={selectedAcademicYearId}
								onChange={(e) => handleAcademicYearChange(e.target.value)}
								className="h-10 w-full truncate rounded-lg border border-slate-700/60 bg-[#0c1322] px-3 text-xs text-slate-200 transition-colors focus:border-blue-500 focus:outline-none"
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
					</div>

					{/* 3. Urutan 3: Pilih Bidang / Departemen (Single-Select Interactive Pill Buttons) */}
					<div className="space-y-2">
						<div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider">
							<span className="text-slate-300">
								3. PILIH BIDANG / DEPARTEMEN{" "}
								<span className="text-rose-400">*</span>
							</span>
							<span className="text-xs font-normal normal-case text-slate-400">
								Bidang utama siswa:{" "}
								<span className="font-semibold text-emerald-400">
									{studentPrimaryDeptName}
								</span>
							</span>
						</div>

						{departmentPills.length === 0 ? (
							<div className="py-3 text-xs text-slate-400">
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
											onClick={() => setSelectedDepartmentPill(dept.id)}
											className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
												isSelected
													? "border border-emerald-500 bg-emerald-500/20 text-emerald-400 shadow-sm"
													: "border border-slate-700 bg-slate-800/80 text-slate-300 hover:border-slate-600 hover:bg-slate-800"
											}`}
										>
											<span
												className={`size-2 rounded-full ${
													isSelected ? "bg-emerald-400" : "bg-slate-500"
												}`}
											/>
											<span>{dept.name}</span>
										</button>
									);
								})}
							</div>
						)}
					</div>

					{/* 4. Urutan 4: Daftar Mata Pelajaran Kelas (Multi-Select Checkbox Cards) */}
					<div className="space-y-2">
						<span className="block text-xs font-bold uppercase tracking-wider text-slate-300">
							{isEditing
								? "4. PILIH MATA PELAJARAN *"
								: "4. PILIH MATA PELAJARAN (BISA PILIH LEBIH DARI SATU) *"}
						</span>

						<div className="max-h-56 overflow-y-auto space-y-2 rounded-xl border border-slate-800/80 bg-[#0b1120] p-3">
							{availableClassSubjectsForPill.length === 0 ? (
								<div className="py-8 text-center text-xs text-slate-400">
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
													? "border-slate-800/60 bg-slate-900/30 opacity-60 cursor-not-allowed"
													: isChecked
														? "border-blue-500/60 bg-blue-950/20 shadow-sm cursor-pointer"
														: "border-slate-800/80 bg-[#0d1526]/80 hover:border-slate-700/80 cursor-pointer"
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
													className="size-4 rounded border-slate-700 bg-[#0c1322] text-blue-600 focus:ring-0 cursor-pointer disabled:cursor-not-allowed"
												/>
												<div className="min-w-0 flex-1">
													<div className="flex items-center gap-2 flex-wrap">
														{cs.subjectCode && (
															<span className="font-mono text-xs font-bold text-blue-400">
																[{cs.subjectCode}]
															</span>
														)}
														<span className="font-bold text-xs text-white">
															{cs.subjectName}
														</span>
														{isAlreadyTaken && (
															<span className="rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
																Sudah Diambil
															</span>
														)}
													</div>
													<p className="mt-0.5 text-[11px] text-slate-400 truncate">
														Kelas: {cs.className} • Pengajar:{" "}
														{cs.teacherName || "Pengajar"}
													</p>
												</div>
											</div>
											<div className="shrink-0">
												<span className="rounded-lg border border-blue-500/30 bg-blue-950/60 px-3 py-1 text-xs font-bold text-blue-400">
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
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-xl border border-slate-800/90 bg-[#0c1322] p-4">
						<div>
							<p className="text-xs text-slate-400">
								Kredit Terpakai:{" "}
								<strong className="text-white">{sksTerpakaiAwal} SKS</strong> +
								Dipilih Baru:{" "}
								<strong className="text-emerald-400">
									{sksTambahan} SKS ({selectedClassSubjectIds.length} Mapel)
								</strong>
							</p>
							<p className="mt-1 text-sm font-bold text-white">
								Total Kredit Akhir:{" "}
								<span
									className={isOverLimit ? "text-rose-400" : "text-emerald-400"}
								>
									{totalSksAkhir} / 24 SKS
								</span>
							</p>
						</div>
						<div className="shrink-0">
							<span
								className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
									isOverLimit
										? "border-rose-500/40 bg-rose-950/40 text-rose-400"
										: "border-emerald-500/40 bg-emerald-950/40 text-emerald-400"
								}`}
							>
								Sisa Kuota: {sisaKuota} SKS
							</span>
						</div>
					</div>

					{/* 6. Alert Box saat melebihi batas 24 SKS */}
					{isOverLimit && (
						<div className="flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-400">
							<AlertTriangle className="size-4 shrink-0 text-red-400 mt-0.5" />
							<div>
								<p className="font-bold text-red-300">
									Kredit siswa tidak mencukupi!
								</p>
								<p className="mt-0.5 text-red-400/90 leading-relaxed">
									Total beban studi mencapai {totalSksAkhir} SKS dan melebihi
									batas maksimal 24 SKS (kelebihan {totalSksAkhir - 24} SKS).
									Silakan kurangi mata pelajaran yang dipilih.
								</p>
							</div>
						</div>
					)}

					{/* 7. Footer Modal */}
					<div className="flex items-center justify-end gap-3 border-t border-slate-800/80 pt-4 mt-2">
						<button
							type="button"
							onClick={onClose}
							disabled={isSubmitting}
							className="rounded-xl border border-slate-700/60 bg-transparent px-5 py-2.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
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
