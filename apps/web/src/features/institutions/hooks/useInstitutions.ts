import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createInstitutionApi,
	deleteInstitutionApi,
	getInstitutionLevelsApi,
	type ListInstitutionsParams,
	listInstitutionsApi,
} from "../api/institutions";
import type { CreateInstitutionInput, UpdateInstitutionInput } from "../types";

export const INSTITUTIONS_QUERY_KEY = ["institutions"] as const;
export const INSTITUTION_LEVELS_QUERY_KEY = ["institution-levels"] as const;

export const useInstitutions = (params: ListInstitutionsParams) => {
	return useQuery({
		queryKey: [
			...INSTITUTIONS_QUERY_KEY,
			"list",
			params.page ?? 1,
			params.limit ?? 10,
			params.search ?? "",
		],
		queryFn: () => listInstitutionsApi(params),
		placeholderData: (previousData) => previousData,
	});
};

export const useInstitutionLevels = () => {
	return useQuery({
		queryKey: INSTITUTION_LEVELS_QUERY_KEY,
		queryFn: getInstitutionLevelsApi,
		staleTime: 5 * 60 * 1000,
	});
};

export const useCreateInstitution = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateInstitutionInput) => createInstitutionApi(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: INSTITUTIONS_QUERY_KEY });
		},
	});
};

export const useUpdateInstitution = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: string;
			input: UpdateInstitutionInput;
		}) => updateInstitutionApi(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: INSTITUTIONS_QUERY_KEY });
		},
	});
};

export const useDeleteInstitution = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteInstitutionApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: INSTITUTIONS_QUERY_KEY });
		},
	});
};
