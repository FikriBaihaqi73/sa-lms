/** Presentation contract only. Never pass the raw grader object from the API. */
export interface SubmissionRow {
	studentId: string;
	fullName: string;
	studentNumber: string | null;
	submittedAt: string | null;
	status: "submitted" | "late" | "missing";
	score: string | number | null;
	feedback: string | null;
	graderName: string | null;
	gradedAt: string | null;
}

export interface AssignmentDataset {
	id: string;
	title: string;
	classId: string;
	/** Complete authorized class roster joined with all submissions for this task. */
	rows: SubmissionRow[];
}

export type SubmissionPageState =
	| { kind: "blocked" | "loading" | "error" }
	| {
			kind: "ready";
			years: { id: string; name: string }[];
			classes: { id: string; name: string; yearId: string }[];
			assignments: AssignmentDataset[];
	  };

export interface AssignmentSubmissionsFilterValues {
	year: string;
	classroom: string;
	assignment: string;
	search: string;
}
