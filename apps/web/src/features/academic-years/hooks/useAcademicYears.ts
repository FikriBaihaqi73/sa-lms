
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
			toast.success("Academic year created successfully");
			queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to create academic year");
		},
	});
};

export const useUpdateAcademicYear = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, data }: { id: string; data: UpdateAcademicYearInput }) =>
			updateAcademicYearApi(id, data),
		onSuccess: () => {
			toast.success("Academic year updated successfully");
			queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to update academic year");
		},
	});
};

export const useDeleteAcademicYear = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: string) => deleteAcademicYearApi(id),
		onSuccess: () => {
			toast.success("Academic year deleted successfully");
			queryClient.invalidateQueries({ queryKey: ACADEMIC_YEARS_QUERY_KEY });
		},
		onError: (error: Error) => {
			toast.error(error.message || "Failed to delete academic year");
		},
	});
};
