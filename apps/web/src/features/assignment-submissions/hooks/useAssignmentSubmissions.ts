import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import {
	fetchAllSubmissionPageSources,
	type GetAssignmentSubmissionsParams,
	getAssignmentSubmissionsApi,
	type RawSubmissionRecord,
} from "../api";
import type { SubmissionRow } from "../types";

export const ASSIGNMENT_SUBMISSIONS_QUERY_KEY = [
	"assignment-submissions",
] as const;

export const SAMPLE_SUBMITTED_RESULTS: SubmissionRow[] = [
	{
		id: "sample-sub-1",
		studentId: "sample-stu-1",
		fullName: "Ahmad Fauzi",
		studentNumber: "202610001",
		className: "X IPA 1",
		assignmentId: "sample-asg-1",
		assignmentTitle: "Latihan Persamaan & Pertidaksamaan Linear",
		subjectName: "Matematika Wajib",
		fileName: "jawaban-persamaan-linear-ahmad.pdf",
		fileUrl: null,
		answerText:
			"Lampiran penyelesaian soal nomor 1 sampai 10 menggunakan metode eliminasi dan substitusi beserta grafik himpunan penyelesaian.",
		submittedAt: "2026-11-24T09:15:00.000Z",
		status: "submitted",
		score: 92,
		maxScore: 100,
		feedback: "Langkah pengerjaan sangat sistematis dan jawaban tepat.",
		graderName: "Ustadz Hendra, S.Pd.",
		gradedAt: "2026-11-24T13:30:00.000Z",
	},
	{
		id: "sample-sub-2",
		studentId: "sample-stu-2",
		fullName: "Siti Aisyah",
		studentNumber: "202610002",
		className: "X IPA 1",
		assignmentId: "sample-asg-2",
		assignmentTitle: "Implementasi Endpoint CRUD REST API",
		subjectName: "Web Developer",
		fileName: "crud-rest-api-siti.zip",
		fileUrl: null,
		answerText:
			"Project API lengkap dengan validasi skema Zod, controller NestJS, serta dokumentasi pengujian endpoint.",
		submittedAt: "2026-11-25T10:40:00.000Z",
		status: "submitted",
		score: null,
		maxScore: 100,
		feedback: null,
		graderName: null,
		gradedAt: null,
	},
	{
		id: "sample-sub-3",
		studentId: "sample-stu-3",
		fullName: "Budi Santoso",
		studentNumber: "202610003",
		className: "X IPS 1",
		assignmentId: "sample-asg-3",
		assignmentTitle: "Analisis I'rab & Terjemahan Kitab Dasar",
		subjectName: "Bahasa Arab",
		fileName: "tugas-nahwu-sharaf-budi.docx",
		fileUrl: null,
		answerText:
			"Terjemahan dan analisis i'rab 15 kalimat isim dan fi'il mudhari' pada bab mubtada khabar.",
		submittedAt: "2026-11-25T16:20:00.000Z",
		status: "late",
		score: 85,
		maxScore: 100,
		feedback:
			"Analisis sudah baik, mohon perhatikan ketepatan waktu pengumpulan berikutnya.",
		graderName: "Ustadzah Fatimah, Lc.",
		gradedAt: "2026-11-26T08:00:00.000Z",
	},
];

export const useAssignmentSubmissions = (
	params: GetAssignmentSubmissionsParams = {},
	enabled = false,
) =>
	useQuery({
		queryKey: [
			...ASSIGNMENT_SUBMISSIONS_QUERY_KEY,
			params.page ?? 1,
			params.limit ?? 10,
			params.search ?? "",
		],
		queryFn: () => getAssignmentSubmissionsApi(params),
		enabled,
	});

function mapSubmissionStatus(
	sub: RawSubmissionRecord,
	dueDate?: string | null,
): SubmissionRow["status"] {
	const rawStatus = (sub.status || "").toLowerCase();
	if (rawStatus === "late" || rawStatus === "terlambat") {
		return "late";
	}
	if (dueDate && sub.submittedAt) {
		const due = new Date(dueDate).getTime();
		const submitted = new Date(sub.submittedAt).getTime();
		if (!Number.isNaN(due) && !Number.isNaN(submitted) && submitted > due) {
			return "late";
		}
	}
	return "submitted";
}

export interface LiveSubmittedResultsState {
	kind: "loading" | "error" | "ready";
	rows: SubmissionRow[];
	isUsingSampleData: boolean;
}

export function useLiveSubmittedResults(
	enabled = true,
): LiveSubmittedResultsState {
	const { data, isLoading, isError } = useQuery({
		queryKey: [...ASSIGNMENT_SUBMISSIONS_QUERY_KEY, "submitted-results"],
		queryFn: fetchAllSubmissionPageSources,
		enabled,
	});

	return useMemo<LiveSubmittedResultsState>(() => {
		if (!enabled) {
			return {
				kind: "ready",
				rows: SAMPLE_SUBMITTED_RESULTS,
				isUsingSampleData: true,
			};
		}
		if (isLoading) {
			return { kind: "loading", rows: [], isUsingSampleData: false };
		}
		if (isError || !data) {
			return { kind: "error", rows: [], isUsingSampleData: false };
		}

		const assignmentMap = new Map(data.assignments.map((a) => [a.id, a]));
		const classByStudentId = new Map<string, string>();
		const classMap = new Map(data.classes.map((c) => [c.id, c.name]));

		for (const cs of data.classStudents) {
			if (cs.studentId && cs.classId) {
				const cname = classMap.get(cs.classId);
				if (cname) classByStudentId.set(cs.studentId, cname);
			}
		}

		const realRows: SubmissionRow[] = data.submissions
			.filter((sub) => Boolean(sub.submittedAt || sub.status !== "missing"))
			.map((sub) => {
				const ass = assignmentMap.get(sub.assignmentId);
				const cs = ass?.module?.class_subject;
				const className =
					cs?.class?.name || classByStudentId.get(sub.studentId) || "-";
				const subjectName =
					cs?.subject?.name || ass?.module?.title || "Mata Pelajaran";

				return {
					id: sub.id,
					studentId: sub.studentId,
					fullName: sub.student?.profile?.fullName || "Santri",
					studentNumber: sub.student?.studentNumber ?? null,
					className,
					assignmentId: sub.assignmentId,
					assignmentTitle: ass?.title || "Tugas",
					subjectName,
					fileName:
						(sub as { fileName?: string | null }).fileName ||
						`hasil-tugas-${(sub.student?.profile?.fullName || "siswa").toLowerCase().replace(/\s+/g, "-")}.pdf`,
					fileUrl: (sub as { fileUrl?: string | null }).fileUrl ?? null,
					answerText:
						(sub as { answerText?: string | null }).answerText ?? null,
					submittedAt: sub.submittedAt ?? null,
					status: mapSubmissionStatus(sub, ass?.due_date),
					score: sub.score ?? null,
					maxScore: (ass as { max_score?: number | null })?.max_score ?? 100,
					feedback: sub.feedback ?? null,
					graderName: sub.grader?.name ?? null,
					gradedAt: sub.gradedAt ?? null,
				};
			});

		if (realRows.length === 0) {
			return {
				kind: "ready",
				rows: SAMPLE_SUBMITTED_RESULTS,
				isUsingSampleData: true,
			};
		}

		return {
			kind: "ready",
			rows: realRows,
			isUsingSampleData: false,
		};
	}, [enabled, isLoading, isError, data]);
}
