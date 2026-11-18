import { useQuery } from "@tanstack/react-query";
import {
	type GetAssignmentSubmissionsParams,
	getAssignmentSubmissionsApi,
} from "../api";

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
