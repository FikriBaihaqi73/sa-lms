import { AlertCircle } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useState } from "react";
import {
	useAcademicYears,
	useClasses,
	useClassStudents,
	useCreateScore,
	useExaminationScores,
	useExaminations,
	useGradesLookup,
	useUpdateScore,
} from "../hooks/useExaminationScores";
import type { ExaminationScoreItem, StudentParticipant } from "../types";
import {
	formatDateTime,
	formatScore,
	resolveGradeFromScore,
} from "../utils/grade-resolver";
import { ExaminationCardSelector } from "./examination-card-selector";
import { ExaminationScoreAuditDialog } from "./examination-score-audit-dialog";
import { ExaminationScoreDialog } from "./examination-score-dialog";
import {
	ExaminationScoresFilter,
	type ScoreStatusFilterType,
} from "./examination-scores-filter";
import { ExaminationScoresHeader } from "./examination-scores-header";
import { ExaminationScoresStats } from "./examination-scores-stats";
import { ExaminationScoresTable } from "./examination-scores-table";

export const ExaminationScoresPage: React.FC = () => {
	// 1. Data queries
	const { data: academicYears = [] } = useAcademicYears();
	const [selectedAcademicYearId, setSelectedAcademicYearId] =
		useState<string>("");

	// Set default tahun ajaran aktif
	useEffect(() => {
		if (!selectedAcademicYearId && academicYears.length > 0) {
			const activeYear =
				academicYears.find((y) => y.is_active) ?? academicYears[0];
			if (activeYear) {
				setSelectedAcademicYearId(activeYear.id);
			}
		}
	}, [academicYears, selectedAcademicYearId]);

	const { data: rawClasses = [] } = useClasses(
		selectedAcademicYearId || undefined,
	);

	// Filter kelas agar hanya menampilkan kelas yang terdaftar pada tahun ajaran terpilih
	const classes = useMemo(() => {
		if (!selectedAcademicYearId) return rawClasses;
		const hasAyTag = rawClasses.some((c) => Boolean(c.academic_year_id));
		if (!hasAyTag) return rawClasses;
		return rawClasses.filter(
			(c) => c.academic_year_id === selectedAcademicYearId,
		);
	}, [rawClasses, selectedAcademicYearId]);

	const [selectedClassId, setSelectedClassId] = useState<string>("");

	// Set default kelas pertama saat daftar kelas berubah
	useEffect(() => {
		if (classes.length > 0) {
			const exists = classes.some((c) => c.id === selectedClassId);
			if (!exists) {
				setSelectedClassId(classes[0]?.id ?? "");
			}
		} else {
			setSelectedClassId("");
		}
	}, [classes, selectedClassId]);

	// Filters state
	const [search, setSearch] = useState<string>("");
	const [statusFilter, setStatusFilter] =
		useState<ScoreStatusFilterType>("all");

	// Query ujian
	const { data: allExaminations = [], isLoading: isLoadingExams } =
		useExaminations();

	// Filter ujian berdasarkan kelas & tahun ajaran yang dipilih
	const availableExaminations = useMemo(() => {
		return allExaminations.filter((exam) => {
			const matchesClass =
				!selectedClassId || exam.classSubject?.class?.id === selectedClassId;
			const matchesYear =
				!selectedAcademicYearId ||
				exam.classSubject?.academic_year?.id === selectedAcademicYearId;
			return matchesClass && matchesYear;
		});
	}, [allExaminations, selectedClassId, selectedAcademicYearId]);

	const [selectedExamId, setSelectedExamId] = useState<string | null>(null);

	// Set default ujian pertama saat daftar ujian berubah
	useEffect(() => {
		if (availableExaminations.length > 0) {
			const exists = availableExaminations.some((e) => e.id === selectedExamId);
			if (!exists) {
				setSelectedExamId(availableExaminations[0]?.id ?? null);
			}
		} else {
			setSelectedExamId(null);
		}
	}, [availableExaminations, selectedExamId]);

	const activeExamination = useMemo(() => {
		return (
			availableExaminations.find((e) => e.id === selectedExamId) ??
			availableExaminations[0] ??
			null
		);
	}, [availableExaminations, selectedExamId]);

	// Query data siswa dalam kelas terpilih
	const { data: enrolledStudents = [], isLoading: isLoadingStudents } =
		useClassStudents(selectedClassId || undefined);

	// Query skor ujian untuk ujian aktif
	const { data: examinationScores = [], isLoading: isLoadingScores } =
		useExaminationScores(activeExamination?.id);

	// Query standar penilaian (/grades)
	const { data: gradesMaster = [] } = useGradesLookup();

	// Mutations
	const createScoreMutation = useCreateScore();
	const updateScoreMutation = useUpdateScore();

	// Dialogs state
	const [isInputDialogOpened, setIsInputDialogOpened] =
		useState<boolean>(false);
	const [targetStudentForDialog, setTargetStudentForDialog] =
		useState<StudentParticipant | null>(null);

	const [isAuditDialogOpened, setIsAuditDialogOpened] =
		useState<boolean>(false);
	const [auditTargetItem, setAuditTargetItem] =
		useState<ExaminationScoreItem | null>(null);
	const [auditTargetStudent, setAuditTargetStudent] =
		useState<StudentParticipant | null>(null);

	// Gabungkan data seluruh siswa kelas dengan record skor
	const mergedParticipants: StudentParticipant[] = useMemo(() => {
		const scoresMap = new Map<string, ExaminationScoreItem>();
		for (const score of examinationScores) {
			scoresMap.set(score.studentId, score);
		}

		return enrolledStudents.map((stu) => {
			const scoreRecord = scoresMap.get(stu.studentId) ?? null;
			return {
				...stu,
				scoreRecord,
			};
		});
	}, [enrolledStudents, examinationScores]);

	// Filter siswa berdasarkan pencarian teks & status nilai
	const filteredParticipants = useMemo(() => {
		return mergedParticipants.filter((p) => {
			// Filter teks pencarian nama / NIS
			if (search.trim() !== "") {
				const q = search.toLowerCase();
				const matchesName = p.fullName.toLowerCase().includes(q);
				const matchesNIS = p.studentNumber.toLowerCase().includes(q);
				if (!matchesName && !matchesNIS) return false;
			}

			// Filter status
			const hasScore =
				p.scoreRecord !== null &&
				p.scoreRecord !== undefined &&
				p.scoreRecord.score !== null;

			if (statusFilter === "graded" && !hasScore) return false;
			if (statusFilter === "ungraded" && hasScore) return false;

			return true;
		});
	}, [mergedParticipants, search, statusFilter]);

	// Hitung ringkasan statistik
	const stats = useMemo(() => {
		const totalStudents = mergedParticipants.length;
		let gradedCount = 0;
		let sumScore = 0;
		let max: number | null = null;
		let min: number | null = null;

		for (const p of mergedParticipants) {
			if (p.scoreRecord && p.scoreRecord.score !== null) {
				gradedCount += 1;
				const val = Number(p.scoreRecord.score);
				sumScore += val;
				if (max === null || val > max) max = val;
				if (min === null || val < min) min = val;
			}
		}

		const averageScore = gradedCount > 0 ? sumScore / gradedCount : null;
		const averageGrade = resolveGradeFromScore(averageScore, gradesMaster);
		const unassignedCount = totalStudents - gradedCount;

		return {
			totalStudents,
			gradedCount,
			unassignedCount,
			averageScore,
			averageGrade,
			maxScore: max,
			minScore: min,
		};
	}, [mergedParticipants, gradesMaster]);

	// Map progress penilaian per ujian untuk kartu selector
	const examProgressMap = useMemo(() => {
		const map: Record<string, { graded: number; total: number }> = {};
		if (activeExamination) {
			map[activeExamination.id] = {
				graded: stats.gradedCount,
				total: stats.totalStudents,
			};
		}
		return map;
	}, [activeExamination, stats.gradedCount, stats.totalStudents]);

	const selectedClassName =
		classes.find((c) => c.id === selectedClassId)?.name ?? "Kelas";

	// Handlers dialog
	const handleOpenGeneralInput = () => {
		setTargetStudentForDialog(null);
		setIsInputDialogOpened(true);
	};

	const handleOpenInputForStudent = (student: StudentParticipant) => {
		setTargetStudentForDialog(student);
		setIsInputDialogOpened(true);
	};

	const handleOpenAudit = (
		scoreItem: ExaminationScoreItem,
		student: StudentParticipant,
	) => {
		setAuditTargetItem(scoreItem);
		setAuditTargetStudent(student);
		setIsAuditDialogOpened(true);
	};

	const handleSaveScore = async (payload: {
		studentId: string;
		examinationId: string;
		score: number;
		notes?: string;
	}) => {
		// Cari apakah siswa sudah memiliki record skor
		const existing = mergedParticipants.find(
			(s) => s.studentId === payload.studentId,
		)?.scoreRecord;

		if (existing?.id) {
			await updateScoreMutation.mutateAsync({
				id: existing.id,
				input: {
					score: payload.score,
					notes: payload.notes,
					examinationId: payload.examinationId,
					studentId: payload.studentId,
				},
			});
		} else {
			await createScoreMutation.mutateAsync({
				examinationId: payload.examinationId,
				studentId: payload.studentId,
				score: payload.score,
				notes: payload.notes,
			});
		}
	};

	// CSV Export Rekap Nilai
	const handleExportCsv = () => {
		if (!activeExamination || mergedParticipants.length === 0) return;

		const headers = [
			"No",
			"Nama Siswa",
			"NIS/NIM",
			"Kelas",
			"Mata Ujian",
			"Skor",
			"Predikat",
			"Rentang Standar",
			"Penilai",
			"Waktu Penilaian",
			"Catatan",
		];

		const rows = mergedParticipants.map((p, index) => {
			const score = p.scoreRecord?.score ?? null;
			const gradeResult = resolveGradeFromScore(score, gradesMaster);
			const graderName =
				p.scoreRecord?.grader?.profile?.fullName ||
				p.scoreRecord?.grader?.email ||
				"-";

			return [
				index + 1,
				`"${p.fullName.replace(/"/g, '""')}"`,
				`"${p.studentNumber}"`,
				`"${selectedClassName}"`,
				`"${activeExamination.title.replace(/"/g, '""')}"`,
				score !== null ? formatScore(score) : "-",
				`"${gradeResult.grade}"`,
				`"${gradeResult.scoreRangeText}"`,
				`"${graderName.replace(/"/g, '""')}"`,
				`"${formatDateTime(p.scoreRecord?.gradedAt)}"`,
				`"${(p.scoreRecord?.notes ?? "").replace(/"/g, '""')}"`,
			].join(",");
		});

		const csvContent = `\uFEFF${[headers.join(","), ...rows].join("\r\n")}`;
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		const filename = `Rekap_Nilai_${activeExamination.title.replace(/\s+/g, "_")}_${selectedClassName.replace(/\s+/g, "_")}.csv`;
		link.setAttribute("href", url);
		link.setAttribute("download", filename);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleResetFilters = () => {
		setSearch("");
		setStatusFilter("all");
	};

	return (
		<div className="space-y-6 p-4 sm:p-6 lg:p-8">
			{/* 1. Header */}
			<ExaminationScoresHeader
				onExport={handleExportCsv}
				onOpenInputDialog={handleOpenGeneralInput}
				isExportDisabled={!activeExamination || mergedParticipants.length === 0}
			/>

			{/* 2. 4 Kartu Statistik */}
			<ExaminationScoresStats
				gradedCount={stats.gradedCount}
				totalStudents={stats.totalStudents}
				averageScore={stats.averageScore}
				averageGrade={stats.averageGrade}
				maxScore={stats.maxScore}
				minScore={stats.minScore}
				unassignedCount={stats.unassignedCount}
			/>

			{/* 3. Filter Bar (Tahun Ajaran -> Kelas -> Search -> Status) */}
			<ExaminationScoresFilter
				academicYearId={selectedAcademicYearId}
				onAcademicYearChange={setSelectedAcademicYearId}
				academicYears={academicYears}
				classId={selectedClassId}
				onClassChange={setSelectedClassId}
				classes={classes}
				search={search}
				onSearchChange={setSearch}
				statusFilter={statusFilter}
				onStatusFilterChange={setStatusFilter}
				onReset={handleResetFilters}
			/>

			{/* 4. Pemilih Kartu Mata Ujian */}
			<ExaminationCardSelector
				examinations={availableExaminations}
				selectedExamId={selectedExamId}
				onSelectExam={(exam) => setSelectedExamId(exam.id)}
				gradedCountMap={examProgressMap}
				classNameText={selectedClassName}
				isLoading={isLoadingExams}
			/>

			{/* 5. Tabel Utama Peserta & Nilai */}
			{activeExamination ? (
				<ExaminationScoresTable
					students={filteredParticipants}
					grades={gradesMaster}
					onOpenInputForStudent={handleOpenInputForStudent}
					onOpenAuditForStudent={handleOpenAudit}
					isLoading={isLoadingStudents || isLoadingScores}
				/>
			) : (
				<div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
					<AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
					<span>
						Silakan pilih tahun ajaran, kelas, dan salah satu mata ujian untuk
						memuat data peserta serta mengelola nilai ujian.
					</span>
				</div>
			)}

			{/* 6. Modal Input / Koreksi Nilai */}
			<ExaminationScoreDialog
				open={isInputDialogOpened}
				onClose={() => setIsInputDialogOpened(false)}
				examination={activeExamination}
				students={mergedParticipants}
				preselectedStudent={targetStudentForDialog}
				existingScore={targetStudentForDialog?.scoreRecord}
				grades={gradesMaster}
				onSave={handleSaveScore}
				isSaving={
					createScoreMutation.isPending || updateScoreMutation.isPending
				}
			/>

			{/* 7. Modal Audit Metadata */}
			<ExaminationScoreAuditDialog
				open={isAuditDialogOpened}
				onClose={() => setIsAuditDialogOpened(false)}
				scoreItem={auditTargetItem}
				student={auditTargetStudent}
				examination={activeExamination}
				grades={gradesMaster}
			/>
		</div>
	);
};
