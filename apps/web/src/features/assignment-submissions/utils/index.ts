import type { SubmissionRow } from "../types";

export function submissionSummary(rows: SubmissionRow[]) {
	const late = rows.filter((row) => row.status === "late").length;
	const submitted = rows.filter((row) => row.status !== "missing").length;
	return [rows.length, submitted, late, rows.length - submitted] as const;
}

export function submissionDate(value: string | null) {
	if (!value || !Number.isFinite(Date.parse(value))) return "—";
	return new Intl.DateTimeFormat("id-ID", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: "Asia/Jakarta",
	}).format(new Date(value));
}
