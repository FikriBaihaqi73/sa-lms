import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createInstitutionLevelApi,
	deleteInstitutionLevelApi,
	getInstitutionLevelByIdApi,
	getInstitutionLevelsApi,
	updateInstitutionLevelApi,
} from "../api/institution-levels";
import type {
	CreateInstitutionLevelInput,
	UpdateInstitutionLevelInput,
} from "../types";

export const INSTITUTION_LEVELS_QUERY_KEY = ["institution-levels"] as const;

export const useInstitutionLevels = () => {
	return useQuery({
		queryKey: INSTITUTION_LEVELS_QUERY_KEY,
		queryFn: getInstitutionLevelsApi,
	});
};

export const useInstitutionLevel = (id?: string) => {
	return useQuery({
		queryKey: [...INSTITUTION_LEVELS_QUERY_KEY, "detail", id],
		queryFn: () => getInstitutionLevelByIdApi(id as string),
		enabled: Boolean(id),
	});
};

export const useCreateInstitutionLevel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateInstitutionLevelInput) =>
			createInstitutionLevelApi(input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: INSTITUTION_LEVELS_QUERY_KEY,
			});
		},
	});
};

export const useUpdateInstitutionLevel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			id,
			input,
		}: {
			id: string;
			input: UpdateInstitutionLevelInput;
		}) => updateInstitutionLevelApi(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: INSTITUTION_LEVELS_QUERY_KEY,
			});
		},
	});
};

export const useDeleteInstitutionLevel = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteInstitutionLevelApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({
				queryKey: INSTITUTION_LEVELS_QUERY_KEY,
			});
		},
	});
};
