import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createUserApi,
	deleteUserApi,
	type GetUsersParams,
	getUserByIdApi,
	getUsersApi,
	getUsersStatsApi,
	updateUserApi,
} from "../api/users";
import type { CreateUserInput, UpdateUserInput } from "../types";

export const USERS_QUERY_KEY = ["users"] as const;

export const useUsers = (params: GetUsersParams) => {
	return useQuery({
		queryKey: [
			...USERS_QUERY_KEY,
			params.page,
			params.limit,
			params.search ?? "",
			params.status ?? "active",
			params.institution_id ?? "",
		],
		queryFn: () => getUsersApi(params),
	});
};

export const useUsersStats = (institutionId?: string) => {
	return useQuery({
		queryKey: [...USERS_QUERY_KEY, "stats", institutionId ?? ""],
		queryFn: () => getUsersStatsApi(institutionId),
	});
};

export const useUser = (id: string | undefined) => {
	return useQuery({
		queryKey: [...USERS_QUERY_KEY, "detail", id],
		queryFn: () => getUserByIdApi(id as string),
		enabled: Boolean(id),
	});
};

export const useCreateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateUserInput) => createUserApi(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
		},
	});
};

export const useUpdateUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateUserInput }) =>
			updateUserApi(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
		},
	});
};

export const useDeleteUser = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteUserApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY });
		},
	});
};
