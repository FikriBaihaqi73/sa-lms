import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createSemesterApi,
	deleteSemesterApi,
	getSemestersApi,
	updateSemesterApi,
	type GetSemestersParams,
} from "../api/semesters";
import type { CreateSemesterInput, UpdateSemesterInput } from "../types";

export const SEMESTERS_QUERY_KEY = ["semesters"] as const;

export const useSemesters = (params: GetSemestersParams) =>
	useQuery({
		queryKey: [
			...SEMESTERS_QUERY_KEY,
			params.page,
			params.limit,
			params.search ?? "",
			params.academic_year_id ?? "",
		],
		queryFn: () => getSemestersApi(params),
		placeholderData: (previousData) => previousData,
	});

export const useCreateSemester = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (input: CreateSemesterInput) => createSemesterApi(input),
		onSuccess: () => {
			toast.success("Semester berhasil ditambahkan.");
			queryClient.invalidateQueries({ queryKey: SEMESTERS_QUERY_KEY });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal menambahkan semester.");
		},
	});
};

export const useUpdateSemester = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, input }: { id: string; input: UpdateSemesterInput }) =>
			updateSemesterApi(id, input),
		onSuccess: () => {
			toast.success("Semester berhasil diperbarui.");
			queryClient.invalidateQueries({ queryKey: SEMESTERS_QUERY_KEY });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal memperbarui semester.");
		},
	});
};

export const useDeleteSemester = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => deleteSemesterApi(id),
		onSuccess: () => {
			toast.success("Semester berhasil dihapus.");
			queryClient.invalidateQueries({ queryKey: SEMESTERS_QUERY_KEY });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal menghapus semester.");
		},
	});
};

