import {
	keepPreviousData,
	useMutation,
	useQuery,
	useQueryClient,
} from "@tanstack/react-query";
import {
	createSettingApi,
	deleteSettingApi,
	type GetSettingsParams,
	getSettingByIdApi,
	getSettingsApi,
	updateSettingApi,
} from "../api/settings";
import type { CreateSettingInput, UpdateSettingInput } from "../types";

export const SETTINGS_QUERY_KEY = ["settings"] as const;

export const useSettings = (params: GetSettingsParams = {}) => {
	return useQuery({
		queryKey: [
			...SETTINGS_QUERY_KEY,
			params.page ?? 1,
			params.limit ?? 10,
			params.search ?? "",
		],
		queryFn: () => getSettingsApi(params),
		placeholderData: keepPreviousData,
	});
};

export const useSetting = (id?: string) => {
	return useQuery({
		queryKey: [...SETTINGS_QUERY_KEY, "detail", id],
		queryFn: () => getSettingByIdApi(id as string),
		enabled: Boolean(id),
	});
};

export const useCreateSetting = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (input: CreateSettingInput) => createSettingApi(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
		},
	});
};

export const useUpdateSetting = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateSettingInput }) =>
			updateSettingApi(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
		},
	});
};

export const useDeleteSetting = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteSettingApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
		},
	});
};
