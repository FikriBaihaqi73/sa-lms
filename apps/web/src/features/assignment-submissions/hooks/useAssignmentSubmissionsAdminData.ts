import { useMemo } from "react";
import {
	useAcademicYearsOptions,
	useAssignmentSubmissions,
	useAssignments,
	useClassesOptions,
	useClassStudentsOptions,
} from "@/features/assignments/hooks/useAssignments";
import type {
	AssignmentDataset,
	SubmissionPageState,
	SubmissionRow,
} from "../types";

export function useAssignmentSubmissionsAdminData(
	filters: {
		year: string;
		classroom: string;
		assignment: string;
	},
	enabled = true,
): {
	state: SubmissionPageState;
	isLoading: boolean;
} {
	const { data: academicYears = [], isLoading: isYearsLoading } =
		useAcademicYearsOptions();
	const { data: rawClasses = [], isLoading: isClassesLoading } =
		useClassesOptions(enabled ? filters.year || undefined : undefined);
	const { data: assignmentsResult, isLoading: isAssignmentsLoading } =
		useAssignments();
	const { data: classStudents = [], isLoading: isStudentsLoading } =
		useClassStudentsOptions(
			enabled ? filters.classroom || undefined : undefined,
		);
	const { data: submissions = [], isLoading: isSubmissionsLoading } =
		useAssignmentSubmissions({
			assignmentId: enabled ? filters.assignment || undefined : undefined,
		});

	const years = useMemo(() => {
		if (!enabled) return [];
		return academicYears.map((ay) => ({
			id: ay.id,
			name: ay.label || ay.academic_year,
		}));
	}, [enabled, academicYears]);

	const classes = useMemo(() => {
		if (!enabled) return [];
		return rawClasses.map((c) => ({
			id: c.id,
			name: c.name,
			yearId: c.academicYearId || c.academic_year_id || "",
		}));
	}, [enabled, rawClasses]);

	const assignmentsList = assignmentsResult?.data || [];

	const assignments = useMemo((): AssignmentDataset[] => {
		if (!enabled || !assignmentsList.length) return [];

		return assignmentsList.map((asg) => {
			const classId = asg.module?.class_subject?.class_id || "";
			const dueDate = asg.due_date ? new Date(asg.due_date) : null;

			// Submissions matching this assignment
			const asgSubmissions = submissions.filter(
				(s) => s.assignmentId === asg.id,
			);
			const subMap = new Map(asgSubmissions.map((s) => [s.studentId, s]));

			// Build complete class roster rows
			const rows: SubmissionRow[] = classStudents.map((st) => {
				const sub = subMap.get(st.studentId);
				let status: SubmissionRow["status"] = "missing";

				if (sub?.submittedAt) {
					const submitDate = new Date(sub.submittedAt);
					if (dueDate && submitDate > dueDate) {
						status = "late";
					} else {
						status = "submitted";
					}
				}

				return {
					studentId: st.studentId,
					fullName: st.fullName || "Siswa",
					studentNumber: st.studentNumber || null,
					submittedAt: sub?.submittedAt ?? null,
					status,
					score: sub?.score ?? null,
					feedback: sub?.feedback ?? null,
					graderName: sub?.grader?.name ?? null,
					gradedAt: sub?.gradedAt ?? null,
				};
			});

			return {
				id: asg.id,
				title: asg.title,
				classId,
				rows,
			};
		});
	}, [enabled, assignmentsList, submissions, classStudents]);

	const isLoading =
		isYearsLoading ||
		isClassesLoading ||
		isAssignmentsLoading ||
		isStudentsLoading ||
		isSubmissionsLoading;

	const state: SubmissionPageState = useMemo(() => {
		if (!enabled) {
			return { kind: "blocked" };
		}
		if (isLoading && !years.length) {
			return { kind: "loading" };
		}
		return {
			kind: "ready",
			years,
			classes,
			assignments,
		};
	}, [enabled, isLoading, years, classes, assignments]);

	return { state, isLoading };
}
