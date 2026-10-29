import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createClassroomApi,
	deleteClassroomApi,
	getClassroomsApi,
	updateClassroomApi,
} from "../api/classrooms";
import type { CreateClassroomInput, UpdateClassroomInput } from "../types";

export const CLASSROOMS_QUERY_KEY = ["classrooms"] as const;

export const useClassrooms = (params?: {
	page?: number;
	limit?: number;
	search?: string;
}) =>
	useQuery({
		queryKey: [
			...CLASSROOMS_QUERY_KEY,
			params?.page ?? 1,
			params?.limit ?? 10,
			params?.search ?? "",
		],
		queryFn: () => getClassroomsApi(params),
		placeholderData: (previousData) => previousData,
	});

export const useCreateClassroom = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateClassroomInput) => createClassroomApi(input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY });
		},
	});
};

export const useUpdateClassroom = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateClassroomInput }) =>
			updateClassroomApi(id, input),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY });
		},
	});
};

export const useDeleteClassroom = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteClassroomApi(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY });
		},
	});
};
