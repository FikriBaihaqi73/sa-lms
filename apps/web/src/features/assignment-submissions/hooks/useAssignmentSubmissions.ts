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
				rows: [],
			};
		}
		if (isLoading) {
			return { kind: "loading", rows: [] };
		}
		if (isError || !data) {
			return { kind: "error", rows: [] };
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
					graderName:
						(Array.isArray(sub.grader?.profile)
							? sub.grader.profile[0]?.fullName
							: sub.grader?.profile?.fullName) ??
						sub.grader?.email ??
						null,
					gradedAt: sub.gradedAt ?? null,
				};
			});

		return {
			kind: "ready",
			rows: realRows,
		};
	}, [enabled, isLoading, isError, data]);
}
