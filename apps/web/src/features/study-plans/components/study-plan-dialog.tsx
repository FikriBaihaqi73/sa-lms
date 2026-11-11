import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Shield, ShieldAlert } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { type StudyPlanFormValues, studyPlanFormSchema } from "../schemas";
import type {
	AcademicYearOption,
	ClassSubjectOption,
	DepartmentOption,
	StudentOption,
	StudyPlan,
} from "../types";

interface StudyPlanDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onSubmit: (values: StudyPlanFormValues) => Promise<void>;
	studyPlan?: StudyPlan | null;
	initialStudentId?: string;
	initialClassSubjectId?: string;
	students: StudentOption[];
	classSubjects: ClassSubjectOption[];
	academicYears: AcademicYearOption[];
	departments?: DepartmentOption[];
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
	deactivatedIds,
	isSubmitting = false,
	activeAcademicYearId,
}) => {
	const isEditing = Boolean(studyPlan);

	// State for filtering class subjects by Department in the modal
	const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		formState: { errors },
	} = useForm<StudyPlanFormValues>({
		resolver: zodResolver(studyPlanFormSchema),
		defaultValues: {
			student_id: "",
			class_subject_id: "",
			academic_year_id: "",
		},
	});

	const selectedStudentId = watch("student_id");
	const selectedClassSubjectId = watch("class_subject_id");
	const selectedAcademicYearId = watch("academic_year_id");

	// Reset or populate values when dialog opens
	useEffect(() => {
		if (isOpen) {
			if (studyPlan) {
				reset({
					student_id: studyPlan.student_id,
					class_subject_id: studyPlan.class_subject_id,
					academic_year_id: studyPlan.academic_year_id,
				});
				const deptId =
					studyPlan.classSubject?.subject?.departmentId ||
					studyPlan.student?.departmentId ||
					"";
				setSelectedDepartmentId(deptId);
			} else {
				const defaultAy =
					activeAcademicYearId ||
					academicYears.find((ay) => ay.is_active)?.id ||
					academicYears[0]?.id ||
					"";

				reset({
					student_id: initialStudentId || "",
					class_subject_id: initialClassSubjectId || "",
					academic_year_id: defaultAy,
				});

				if (initialStudentId) {
					const st = students.find((s) => s.id === initialStudentId);
					setSelectedDepartmentId(st?.departmentId || "");
				} else if (initialClassSubjectId) {
					const cs = classSubjects.find((c) => c.id === initialClassSubjectId);
					setSelectedDepartmentId(cs?.departmentId || "");
				} else {
					setSelectedDepartmentId("");
				}
			}
		}
	}, [
		isOpen,
		studyPlan,
		initialStudentId,
		initialClassSubjectId,
		academicYears,
		activeAcademicYearId,
		students,
		classSubjects,
		reset,
	]);

	// Auto-set department when student changes
	useEffect(() => {
		if (selectedStudentId && !isEditing) {
			const st = students.find((s) => s.id === selectedStudentId);
			if (st?.departmentId) {
				setSelectedDepartmentId(st.departmentId);
			}
		}
	}, [selectedStudentId, students, isEditing]);

	// Auto-align academic year if classSubject has one and not editing
	useEffect(() => {
		if (selectedClassSubjectId && !isEditing) {
			const foundCs = classSubjects.find(
				(cs) => cs.id === selectedClassSubjectId,
			);
			if (foundCs?.academicYearId) {
				setValue("academic_year_id", foundCs.academicYearId);
			}
		}
	}, [selectedClassSubjectId, classSubjects, isEditing, setValue]);

	// Filter class subjects based on active status, selected Department, and academic year
	const availableClassSubjects = useMemo(() => {
		let list = classSubjects;

		// 1. Filter out deactivated class subjects
		list = list.filter((cs) => {
			if (deactivatedIds?.includes(cs.id)) {
				return false;
			}
			if (cs.isActive === false) {
				return false;
			}
			return true;
		});

		// 2. Filter by academic year (target or active year)
		const targetYearId = selectedAcademicYearId || activeAcademicYearId;
		list = list.filter((cs) => {
			if (!targetYearId) return true;
			if (!cs.academicYearId) return true;
			return cs.academicYearId === targetYearId || cs.isAcademicYearActive;
		});

		// 3. Filter by department if selected
		if (selectedDepartmentId) {
			list = list.filter((cs) => cs.departmentId === selectedDepartmentId);
		}

		return list;
	}, [
		classSubjects,
		deactivatedIds,
		selectedAcademicYearId,
		activeAcademicYearId,
		selectedDepartmentId,
	]);

	// Calculation for SKS Info Box
	const sksSummary = useMemo(() => {
		const student = students.find((s) => s.id === selectedStudentId);
		const selectedCs = classSubjects.find(
			(cs) => cs.id === selectedClassSubjectId,
		);

		const currentCredits = student?.currentCredits ?? 0;
		// If editing the same subject, don't double count
		const isSameSubjectBeingEdited =
			isEditing && studyPlan?.class_subject_id === selectedClassSubjectId;
		const additionalCredits = isSameSubjectBeingEdited
			? 0
			: (selectedCs?.credits ?? 0);

		const totalCredits = currentCredits + additionalCredits;
		const remainingCredits = 24 - totalCredits;
		const isOverLimit = totalCredits > 24;

		const departmentName =
			student?.departmentName ||
			student?.className ||
			selectedCs?.departmentName ||
			"Umum";

		const activeYear = academicYears.find(
			(ay) => ay.id === (selectedAcademicYearId || activeAcademicYearId),
		);
		const yearName = activeYear?.academic_year || "Tahun Ajaran Aktif";

		return {
			currentCredits,
			additionalCredits,
			totalCredits,
			remainingCredits,
			isOverLimit,
			studentName: student?.fullName,
			departmentName,
			yearName,
		};
	}, [
		selectedStudentId,
		selectedClassSubjectId,
		students,
		classSubjects,
		isEditing,
		studyPlan,
		selectedAcademicYearId,
		activeAcademicYearId,
		academicYears,
	]);

	const onFormSubmit = async (values: StudyPlanFormValues) => {
		await onSubmit(values);
		onClose();
	};

	return (
		<Dialog
			open={isOpen}
			onOpenChange={(open) => {
				if (!open) onClose();
			}}
		>
			<DialogContent className="max-w-xl border-slate-800 bg-[#111927] p-6 text-slate-100 shadow-2xl">
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
					<DialogTitle className="mt-1 text-lg font-bold tracking-tight text-white">
						{isEditing
							? "Ubah Rencana Studi Manual"
							: "Tambah Rencana Studi Manual"}
					</DialogTitle>
					<DialogDescription className="text-xs text-slate-400">
						Daftarkan siswa secara manual ke mata pelajaran kelas dengan
						pemantauan kuota SKS otomatis.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit(onFormSubmit)} className="mt-4 space-y-4">
					{/* 2. Field 1: Siswa / Mahasiswa */}
					<div>
						<label
							htmlFor="student_id"
							className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300"
						>
							Siswa / Mahasiswa <span className="text-rose-400">*</span>
						</label>
						<select
							id="student_id"
							{...register("student_id")}
							disabled={isEditing}
							className="h-10 w-full truncate rounded-lg border border-slate-700/60 bg-[#0c1322] px-3 text-xs text-slate-200 transition-colors focus:border-blue-500 focus:outline-none disabled:opacity-50"
						>
							<option value="">Pilih Siswa / Mahasiswa</option>
							{students.map((st) => {
								const bidangOrClass =
									st.departmentName || st.className || "Umum";
								const nameOrEmail = st.email || st.fullName;
								const optionLabel = `${nameOrEmail} — NIS: ${st.studentNumber} (Bidang: ${bidangOrClass})`;

								return (
									<option key={st.id} value={st.id} title={optionLabel}>
										{optionLabel}
									</option>
								);
							})}
						</select>
						{errors.student_id && (
							<p className="mt-1 text-xs text-rose-400">
								{errors.student_id.message}
							</p>
						)}
					</div>

					{/* 3. Kotak Info Kuota SKS Siswa */}
					{selectedStudentId && (
						<div className="flex items-center justify-between rounded-xl border border-slate-800 bg-[#0b1120]/90 p-4 transition-all">
							<div className="min-w-0 flex-1 pr-3">
								<p className="truncate text-xs text-slate-400">
									Bidang:{" "}
									<strong className="text-white">
										{sksSummary.departmentName}
									</strong>{" "}
									• {sksSummary.yearName}
								</p>
								<p className="mt-1 text-sm font-bold text-white">
									SKS Terpakai: {sksSummary.currentCredits}
									{sksSummary.additionalCredits > 0 ? (
										<span className="text-blue-400">
											{" "}
											(+{sksSummary.additionalCredits} SKS)
										</span>
									) : null}{" "}
									/ 24 SKS
								</p>
								{sksSummary.isOverLimit && (
									<p className="mt-1 text-[11px] font-semibold text-rose-400">
										⚠️ Melebihi kuota standar 24 SKS per semester.
									</p>
								)}
							</div>
							<div className="shrink-0">
								<span
									className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
										sksSummary.remainingCredits < 0
											? "border-rose-500/40 bg-rose-500/10 text-rose-400"
											: "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
									}`}
								>
									Sisa Kuota: {sksSummary.remainingCredits} SKS
								</span>
							</div>
						</div>
					)}

					{/* 4. Field: Bidang / Departemen */}
					<div>
						<label
							htmlFor="department_filter"
							className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300"
						>
							Bidang / Departemen
						</label>
						<select
							id="department_filter"
							value={selectedDepartmentId}
							onChange={(e) => {
								const newDeptId = e.target.value;
								setSelectedDepartmentId(newDeptId);
								if (selectedClassSubjectId) {
									const cs = classSubjects.find(
										(c) => c.id === selectedClassSubjectId,
									);
									if (
										newDeptId &&
										cs?.departmentId &&
										cs.departmentId !== newDeptId
									) {
										setValue("class_subject_id", "");
									}
								}
							}}
							className="h-10 w-full truncate rounded-lg border border-slate-700/60 bg-[#0c1322] px-3 text-xs text-slate-200 transition-colors focus:border-blue-500 focus:outline-none"
						>
							<option value="">Semua Bidang / Departemen</option>
							{departments.map((dept) => (
								<option key={dept.id} value={dept.id}>
									{dept.name} ({dept.code})
								</option>
							))}
						</select>
					</div>

					{/* 5. Field 2: Mata Pelajaran Kelas */}
					<div>
						<label
							htmlFor="class_subject_id"
							className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300"
						>
							Mata Pelajaran Kelas <span className="text-rose-400">*</span>
						</label>

						<select
							id="class_subject_id"
							{...register("class_subject_id")}
							className="h-10 w-full truncate rounded-lg border border-slate-700/60 bg-[#0c1322] px-3 text-xs text-slate-200 transition-colors focus:border-blue-500 focus:outline-none"
						>
							<option value="">Pilih Mata Pelajaran Kelas</option>
							{availableClassSubjects.map((cs) => {
								const codeStr = cs.subjectCode ? `[${cs.subjectCode}] ` : "";
								const optionLabel = `${codeStr}${cs.subjectName} — ${cs.credits} SKS (Kelas: ${cs.className} • Pengajar: ${cs.teacherName || "Pengajar"})`;

								return (
									<option key={cs.id} value={cs.id} title={optionLabel}>
										{optionLabel}
									</option>
								);
							})}
						</select>
						{errors.class_subject_id && (
							<p className="mt-1 text-xs text-rose-400">
								{errors.class_subject_id.message}
							</p>
						)}
					</div>

					{/* 5. Field 3: Tahun Ajaran */}
					<div>
						<label
							htmlFor="academic_year_id"
							className="mb-1 block text-xs font-semibold uppercase tracking-wider text-slate-300"
						>
							Tahun Ajaran <span className="text-rose-400">*</span>
						</label>
						<select
							id="academic_year_id"
							{...register("academic_year_id")}
							className="h-10 w-full truncate rounded-lg border border-slate-700/60 bg-[#0c1322] px-3 text-xs text-slate-200 transition-colors focus:border-blue-500 focus:outline-none"
						>
							<option value="">-- Pilih Tahun Ajaran --</option>
							{academicYears.map((ay) => {
								const statusText = ay.is_active
									? "Aktif Saat Ini"
									: "Tidak Aktif";
								const labelText = `${ay.academic_year} (${statusText})`;

								return (
									<option key={ay.id} value={ay.id}>
										{labelText}
									</option>
								);
							})}
						</select>
						{errors.academic_year_id && (
							<p className="mt-1 text-xs text-rose-400">
								{errors.academic_year_id.message}
							</p>
						)}
					</div>

					{/* 6. Footer Modal */}
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
							disabled={isSubmitting}
							className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-blue-500 disabled:opacity-50"
						>
							<Check className="size-3.5" />
							<span>
								{isSubmitting
									? "Menyimpan..."
									: isEditing
										? "Simpan Perubahan"
										: "Simpan"}
							</span>
						</button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};
