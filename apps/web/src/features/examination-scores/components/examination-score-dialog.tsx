import { Info, Sparkles, UserCheck } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
	ExaminationOption,
	ExaminationScoreItem,
	StandardGrade,
	StudentParticipant,
} from "../types";
import { resolveGradeFromScore } from "../utils/grade-resolver";

interface ExaminationScoreDialogProps {
	open: boolean;
	onClose: () => void;
	examination: ExaminationOption | null;
	students: StudentParticipant[];
	preselectedStudent?: StudentParticipant | null;
	existingScore?: ExaminationScoreItem | null;
	grades: StandardGrade[];
	onSave: (payload: {
		studentId: string;
		examinationId: string;
		score: number;
		notes?: string;
	}) => Promise<void>;
	isSaving?: boolean;
}

const PRESET_SCORES = [100, 90, 85, 75];

export const ExaminationScoreDialog: React.FC<ExaminationScoreDialogProps> = ({
	open,
	onClose,
	examination,
	students,
	preselectedStudent,
	existingScore,
	grades,
	onSave,
	isSaving = false,
}) => {
	const [selectedStudentId, setSelectedStudentId] = useState<string>("");
	const [studentSearch, setStudentSearch] = useState<string>("");
	const [scoreString, setScoreString] = useState<string>("");
	const [notes, setNotes] = useState<string>("");
	const [formError, setFormError] = useState<string | null>(null);

	const isLockedStudent = Boolean(preselectedStudent);

	useEffect(() => {
		if (open) {
			setFormError(null);
			if (preselectedStudent) {
				setSelectedStudentId(preselectedStudent.studentId);
				setStudentSearch("");
			} else {
				setSelectedStudentId("");
				setStudentSearch("");
			}

			if (existingScore && existingScore.score !== null) {
				setScoreString(String(existingScore.score));
				setNotes(existingScore.notes ?? "");
			} else {
				setScoreString("");
				setNotes("");
			}
		}
	}, [open, preselectedStudent, existingScore]);

	// Hitung predikat secara live berdasarkan input skor saat ini
	const numericScore =
		scoreString.trim() !== "" ? Number.parseFloat(scoreString) : null;
	const gradePreview = resolveGradeFromScore(numericScore, grades);

	const filteredStudents = students.filter((s) => {
		const q = studentSearch.toLowerCase();
		return (
			s.fullName.toLowerCase().includes(q) ||
			s.studentNumber.toLowerCase().includes(q)
		);
	});

	const selectedStudentObj =
		students.find((s) => s.studentId === selectedStudentId) ??
		preselectedStudent ??
		null;

	const handleApplyPreset = (preset: number) => {
		setScoreString(String(preset));
		setFormError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		if (!selectedStudentId) {
			setFormError("Silakan pilih siswa yang akan dinilai.");
			return;
		}

		if (!examination?.id) {
			setFormError("Mata ujian tidak valid.");
			return;
		}

		if (
			scoreString.trim() === "" ||
			numericScore === null ||
			Number.isNaN(numericScore)
		) {
			setFormError("Silakan masukkan skor angka yang valid.");
			return;
		}

		if (numericScore < 0 || numericScore > 100) {
			setFormError("Skor harus berada di rentang 0.00 hingga 100.00.");
			return;
		}

		try {
			await onSave({
				studentId: selectedStudentId,
				examinationId: examination.id,
				score: numericScore,
				notes: notes.trim() !== "" ? notes.trim() : undefined,
			});
			onClose();
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Gagal menyimpan skor ujian.";
			setFormError(msg);
		}
	};

	return (
		<Dialog open={open} onOpenChange={(val) => !val && onClose()}>
			<DialogContent className="max-w-lg border-slate-200 bg-white sm:rounded-2xl dark:border-slate-800 dark:bg-[#111927]">
				<DialogHeader>
					<div className="flex items-center gap-2">
						<div className="flex size-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
							<UserCheck className="size-5" />
						</div>
						<div>
							<DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
								{existingScore?.score !== null &&
								existingScore?.score !== undefined
									? "Koreksi Nilai Ujian"
									: "Input Nilai Ujian Siswa"}
							</DialogTitle>
							<DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
								{examination?.title ?? "Mata Ujian"} •{" "}
								{examination?.classSubject?.subject?.name ?? "Mata Pelajaran"}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="mt-2 space-y-4">
					{formError && (
						<div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/50 dark:text-rose-300">
							{formError}
						</div>
					)}

					{/* 1. Pemilihan Siswa */}
					<div className="space-y-1.5">
						<Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
							Siswa / Peserta Ujian <span className="text-rose-500">*</span>
						</Label>

						{isLockedStudent && selectedStudentObj ? (
							<div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-[#0c1322]">
								<div className="flex items-center gap-2.5">
									<div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 font-bold text-xs text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
										{selectedStudentObj.fullName.slice(0, 2).toUpperCase()}
									</div>
									<div>
										<p className="text-xs font-bold text-slate-900 dark:text-white">
											{selectedStudentObj.fullName}
										</p>
										<p className="text-[11px] text-slate-500 dark:text-slate-400">
											NIS: {selectedStudentObj.studentNumber}
										</p>
									</div>
								</div>
								<span className="rounded-md bg-slate-200/60 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
									Terkunci
								</span>
							</div>
						) : (
							<div className="space-y-2">
								<Input
									type="text"
									placeholder="Ketik untuk memfilter nama / NIS..."
									value={studentSearch}
									onChange={(e) => setStudentSearch(e.target.value)}
									className="h-8 text-xs rounded-xl"
								/>
								<select
									value={selectedStudentId}
									onChange={(e) => setSelectedStudentId(e.target.value)}
									className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-800 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200"
								>
									<option value="">
										-- Pilih Siswa ({filteredStudents.length} tersedia) --
									</option>
									{filteredStudents.map((stu) => (
										<option key={stu.studentId} value={stu.studentId}>
											{stu.fullName} ({stu.studentNumber})
										</option>
									))}
								</select>
							</div>
						)}
					</div>

					{/* 2. Input Skor & Preset */}
					<div className="space-y-1.5">
						<div className="flex items-center justify-between">
							<Label
								htmlFor="exam_score_input"
								className="text-xs font-semibold text-slate-700 dark:text-slate-300"
							>
								Skor Nilai Ujian (0 - 100){" "}
								<span className="text-rose-500">*</span>
							</Label>
							<span className="text-[10px] text-slate-400">
								Format Decimal(5, 2)
							</span>
						</div>

						<div className="relative">
							<Input
								id="exam_score_input"
								type="number"
								step="0.01"
								min="0"
								max="100"
								placeholder="Contoh: 85.50"
								value={scoreString}
								onChange={(e) => setScoreString(e.target.value)}
								className="h-10 text-sm font-semibold tabular-nums rounded-xl pr-12"
							/>
							<span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
								/ 100
							</span>
						</div>

						{/* Tombol Preset Cepat */}
						<div className="flex items-center gap-1.5 pt-1">
							<span className="text-[11px] text-slate-400 dark:text-slate-500">
								Preset cepat:
							</span>
							{PRESET_SCORES.map((preset) => (
								<button
									key={preset}
									type="button"
									onClick={() => handleApplyPreset(preset)}
									className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
								>
									{preset}
								</button>
							))}
						</div>
					</div>

					{/* 3. Live Grade Preview Box (Konversi Standar Penilaian /grades) */}
					<div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-[#0c1322]/80">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
								<Sparkles className="size-3.5 text-blue-500" />
								<span>Pratinjau Predikat (Standar Penilaian)</span>
							</div>
							<span
								className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold ${gradePreview.colorBadge.bg} ${gradePreview.colorBadge.text} ${gradePreview.colorBadge.border}`}
							>
								{gradePreview.grade}
							</span>
						</div>

						<div className="mt-2 text-xs text-slate-600 dark:text-slate-300">
							<p className="flex items-center gap-1.5">
								<span className="font-medium text-slate-500 dark:text-slate-400">
									Rentang Standar:
								</span>
								<span className="font-semibold">
									{gradePreview.scoreRangeText}
								</span>
							</p>
							{gradePreview.description && (
								<p className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
									<Info className="size-3.5 shrink-0 mt-0.5 text-slate-400" />
									<span>{gradePreview.description}</span>
								</p>
							)}
						</div>
					</div>

					{/* 4. Input Catatan Penguji */}
					<div className="space-y-1.5">
						<Label
							htmlFor="exam_score_notes"
							className="text-xs font-semibold text-slate-700 dark:text-slate-300"
						>
							Catatan Penguji / Evaluasi (Opsional)
						</Label>
						<textarea
							id="exam_score_notes"
							rows={2}
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							placeholder="Berikan umpan balik atau catatan evaluasi untuk siswa..."
							className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-800 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none dark:border-slate-700/60 dark:bg-[#0c1322] dark:text-slate-200 dark:placeholder-slate-500"
						/>
					</div>

					<DialogFooter className="gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={onClose}
							disabled={isSaving}
							className="rounded-xl text-xs"
						>
							Batal
						</Button>
						<Button
							type="submit"
							size="sm"
							disabled={isSaving}
							className="rounded-xl bg-blue-600 text-xs font-semibold text-white hover:bg-blue-500"
						>
							{isSaving ? "Menyimpan..." : "Simpan Skor Nilai"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
};
