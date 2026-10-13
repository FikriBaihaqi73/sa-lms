
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
	createAcademicYearApi,
	deleteAcademicYearApi,
	listAcademicYearsApi,
	updateAcademicYearApi,
} from "../api/academic-years";
import type { CreateAcademicYearInput, UpdateAcademicYearInput } from "../types";

export const ACADEMIC_YEARS_QUERY_KEY = ["academic-years"];

export const useAcademicYears = () => {
	return useQuery({
		queryKey: ACADEMIC_YEARS_QUERY_KEY,
		queryFn: () => listAcademicYearsApi(),
	});
};

export const useCreateAcademicYear = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: CreateAcademicYearInput) => createAcademicYearApi(data),
		onSuccess: () => {
			toast.success("Tahun ajaran berhasil ditambahkan.");
			queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal menambahkan tahun ajaran.");
		},
	});
};

export const useUpdateAcademicYear = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateAcademicYearInput }) =>
			updateAcademicYearApi(id, data),
		onSuccess: () => {
			toast.success("Tahun ajaran berhasil diperbarui.");
			queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal memperbarui tahun ajaran.");
		},
	});
};

export const useDeleteAcademicYear = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteAcademicYearApi(id),
		onSuccess: () => {
			toast.success("Tahun ajaran berhasil dihapus.");
			queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Gagal menghapus tahun ajaran.");
		},
	});
};
