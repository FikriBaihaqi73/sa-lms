import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createModule,
	deleteModule,
	getClassSubjectOptions,
	getModuleById,
	getModules,
	updateModule,
} from "../api";
import type {
	CreateModuleInput,
	ModuleParams,
	UpdateModuleInput,
} from "../types";

export const MODULES_QUERY_KEY = ["modules"] as const;

export function useModules(params: ModuleParams = {}) {
	return useQuery({
		queryKey: [...MODULES_QUERY_KEY, params],
		queryFn: () => getModules(params),
	});
}

export function useModule(id: string | null) {
	return useQuery({
		queryKey: [...MODULES_QUERY_KEY, "detail", id],
		queryFn: () => {
			if (!id) throw new Error("Module ID is required");
			return getModuleById(id);
		},
		enabled: Boolean(id),
	});
}

export function useCreateModule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateModuleInput) => createModule(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
		},
	});
}

export function useUpdateModule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateModuleInput }) =>
			updateModule(id, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
		},
	});
}

export function useDeleteModule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteModule(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: MODULES_QUERY_KEY });
		},
	});
}

export function useClassSubjectOptions() {
	return useQuery({
		queryKey: ["class-subjects", "module-options"],
		queryFn: getClassSubjectOptions,
		staleTime: 5 * 60 * 1000,
	});
}

