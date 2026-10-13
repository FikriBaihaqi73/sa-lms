import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createGuardianApi,
	deleteGuardianApi,
	getGuardianByIdApi,
	getGuardiansApi,
	updateGuardianApi,
	type GetGuardiansParams,
} from "../api/guardians";
import type { CreateGuardianInput, UpdateGuardianInput } from "../types";

export const GUARDIANS_QUERY_KEY = ["guardians"] as const;

export const useGuardians = (params: GetGuardiansParams) => {
	return useQuery({
		queryKey: [...GUARDIANS_QUERY_KEY, params.page, params.limit, params.search ?? ""],
		queryFn: () => getGuardiansApi(params),
		placeholderData: keepPreviousData,
	});
};

export const useGuardian = (id?: string) => {
	return useQuery({
		queryKey: [...GUARDIANS_QUERY_KEY, "detail", id],
		queryFn: () => getGuardianByIdApi(id as string),
		enabled: Boolean(id),
	});
};

export const useCreateGuardian = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateGuardianInput) => createGuardianApi(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: GUARDIANS_QUERY_KEY });
		},
	});
};

export const useUpdateGuardian = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateGuardianInput }) =>
			updateGuardianApi(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: GUARDIANS_QUERY_KEY });
		},
	});
};

export const useDeleteGuardian = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteGuardianApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: GUARDIANS_QUERY_KEY });
		},
	});
};
