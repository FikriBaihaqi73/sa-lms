import { z } from "zod";

export const assignmentSubmissionFilterSchema = z.object({
	year: z.string(),
	classroom: z.string(),
	assignment: z.string(),
	search: z.string(),
});

export type AssignmentSubmissionFilterSchema = z.infer<
	typeof assignmentSubmissionFilterSchema
>;
