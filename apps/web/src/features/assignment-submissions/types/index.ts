/** Presentation contract only. Never pass the raw grader object from the API. */
export interface SubmissionRow {
	id?: string;
	studentId: string;
	fullName: string;
	studentNumber: string | null;
	className?: string | null;
	assignmentId?: string;
	assignmentTitle?: string;
	subjectName?: string;
	fileName?: string | null;
	fileUrl?: string | null;
	answerText?: string | null;
	submittedAt: string | null;
	status: "submitted" | "late" | "missing";
	score: string | number | null;
	maxScore?: number | null;
	feedback: string | null;
	graderName: string | null;
	gradedAt: string | null;
}

export interface AssignmentDataset {
	id: string;
	title: string;
	classId: string;
	subjectId?: string;
	subjectName?: string;
	subjectCode?: string | null;
	dueDate?: string | null;
	/** Complete authorized class roster joined with all submissions for this task. */
	rows: SubmissionRow[];
}

export interface SubjectAssignmentGroup {
	subjectId: string;
	subjectName: string;
	subjectCode?: string | null;
	assignmentCount: number;
	assignmentTitles: string[];
	classNames: string[];
	yearIds: string[];
	totalSubmissions: number;
	totalStudents: number;
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
