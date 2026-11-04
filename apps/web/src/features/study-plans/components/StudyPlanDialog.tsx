import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	type StudyPlanFormValues,
	studyPlanFormSchema,
} from "../schemas";
import type {
	AcademicYearOption,
	ClassSubjectOption,
	StudentOption,
	StudyPlan,
} from "../types";

interface StudyPlanDialogProps {
	open: boolean;
	studyPlan: StudyPlan | null;
	students: StudentOption[];
	classSubjects: ClassSubjectOption[];
	academicYears: AcademicYearOption[];
	isSaving: boolean;
	onClose: () => void;
	onSave: (values: StudyPlanFormValues) => Promise<void>;
}

export function StudyPlanDialog({
	open,
	studyPlan,
	students,
	classSubjects,
	academicYears,
	isSaving,
	onClose,
	onSave,
}: StudyPlanDialogProps) {
	const {
		register,
		handleSubmit,
		reset,
		setValue,
		watch,
		formState: { errors },
	} = useForm<StudyPlanFormValues>({
		resolver: zodResolver(studyPlanFormSchema),
		defaultValues: {
			student_id: "",
			class_subject_id: "",
			academic_year_id: "",
		},
	});

	const selectedClassSubjectId = watch("class_subject_id");

	// Auto-select academic year when a class subject is selected (if academic year is not set yet)
	useEffect(() => {
		if (selectedClassSubjectId && !studyPlan) {
			const foundCs = classSubjects.find((cs) => cs.id === selectedClassSubjectId);
			if (foundCs?.academicYearName) {
				const matchingAy = academicYears.find(
					(ay) => ay.academic_year === foundCs.academicYearName,
				);
				if (matchingAy) {
					setValue("academic_year_id", matchingAy.id, { shouldValidate: true });
				}
			}
		}
	}, [selectedClassSubjectId, classSubjects, academicYears, setValue, studyPlan]);

	useEffect(() => {
		if (open) {
			if (studyPlan) {
				reset({
					student_id: studyPlan.student_id,
					class_subject_id: studyPlan.class_subject_id,
					academic_year_id: studyPlan.academic_year_id,
				});
			} else {
				// Default academic year to active one if available
				const activeAy = academicYears.find((ay) => ay.is_active);
				reset({
					student_id: "",
					class_subject_id: "",
					academic_year_id: activeAy ? activeAy.id : "",
				});
			}
		}
	}, [open, studyPlan, reset, academicYears]);

	const onSubmit = async (values: StudyPlanFormValues) => {
		await onSave(values);
	};

	return (
		<Dialog open={open} onOpenChange={(v) => !v && onClose()}>
			<DialogContent className="max-w-lg dark:bg-slate-900 dark:text-slate-100">
				<DialogHeader>
					<DialogTitle>
						{studyPlan ? "Ubah Rencana Studi" : "Tambah Rencana Studi (KRS)"}
					</DialogTitle>
					<p className="text-sm text-slate-500 dark:text-slate-400">
						{studyPlan
							? "Perbarui penetapan mata pelajaran kelas untuk siswa."
							: "Daftarkan siswa ke mata pelajaran kelas pada tahun ajaran yang dipilih."}
					</p>
				</DialogHeader>

				<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
					{/* Pilihan Siswa */}
					<div>
						<Label htmlFor="sp-student-id">
							Siswa / Mahasiswa <span className="text-red-500">*</span>
						</Label>
						<select
							id="sp-student-id"
							{...register("student_id")}
							className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
							disabled={isSaving}
						>
							<option value="">Pilih Siswa / Mahasiswa</option>
							{students.map((student) => (
								<option key={student.id} value={student.id}>
									{student.fullName} ({student.studentNumber})
								</option>
							))}
						</select>
						{errors.student_id && (
							<p className="mt-1 text-xs text-red-500">
								{errors.student_id.message}
							</p>
						)}
					</div>

					{/* Pilihan Mata Pelajaran Kelas */}
					<div>
						<Label htmlFor="sp-class-subject-id">
							Mata Pelajaran Kelas <span className="text-red-500">*</span>
						</Label>
						<select
							id="sp-class-subject-id"
							{...register("class_subject_id")}
							className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
							disabled={isSaving}
						>
							<option value="">Pilih Mata Pelajaran & Kelas</option>
							{classSubjects.map((cs) => (
								<option key={cs.id} value={cs.id}>
									{cs.subjectName} - Kelas {cs.className}{" "}
									{cs.teacherName ? `(Guru: ${cs.teacherName})` : ""}
								</option>
							))}
						</select>
						{errors.class_subject_id && (
							<p className="mt-1 text-xs text-red-500">
								{errors.class_subject_id.message}
							</p>
						)}
					</div>

					{/* Pilihan Tahun Ajaran */}
					<div>
						<Label htmlFor="sp-academic-year-id">
							Tahun Ajaran <span className="text-red-500">*</span>
						</Label>
						<select
							id="sp-academic-year-id"
							{...register("academic_year_id")}
							className="mt-1.5 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
							disabled={isSaving}
						>
							<option value="">Pilih Tahun Ajaran</option>
							{academicYears.map((ay) => (
								<option key={ay.id} value={ay.id}>
									{ay.academic_year} {ay.is_active ? "(Aktif Saat Ini)" : ""}
								</option>
							))}
						</select>
						{errors.academic_year_id && (
							<p className="mt-1 text-xs text-red-500">
								{errors.academic_year_id.message}
							</p>
						)}
					</div>

					<DialogFooter className="border-t border-slate-100 pt-4 dark:border-slate-800">
						<Button
							type="button"
							variant="outline"
							onClick={onClose}
							disabled={isSaving}
							className="dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
						>
							Batal
						</Button>
						<Button
							type="submit"
							disabled={isSaving}
							className="bg-blue-700 text-white hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
						>
							{isSaving ? "Menyimpan..." : "Simpan"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

