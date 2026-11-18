import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import {
  createStudyResultApi,
  deleteStudyResultApi,
  getAcademicStatusesOptionsApi,
  getAcademicYearsOptionsApi,
  getClassesOptionsApi,
  getDepartmentsOptionsApi,
  getSemestersOptionsApi,
  getStudentsOptionsApi,
  getStudyResultByIdApi,
  getStudyResultsApi,
  updateStudyResultApi,
} from "../api/study-results";
import type {
  CreateStudyResultInput,
  StudyResult,
  StudyResultFilters,
  StudyResultStats,
  UpdateStudyResultInput,
} from "../types";

export const STUDY_RESULTS_QUERY_KEY = "study-results";
export const DEPARTMENTS_OPTIONS_QUERY_KEY = "study-results-departments-options";
export const CLASSES_OPTIONS_QUERY_KEY = "study-results-classes-options";
export const ACADEMIC_YEARS_OPTIONS_QUERY_KEY = "study-results-academic-years-options";
export const SEMESTERS_OPTIONS_QUERY_KEY = "study-results-semesters-options";
export const ACADEMIC_STATUSES_OPTIONS_QUERY_KEY = "study-results-academic-statuses-options";
export const STUDENTS_OPTIONS_QUERY_KEY = "study-results-students-options";

export function useStudyResults(filters: StudyResultFilters = {}) {
  return useQuery({
    queryKey: [STUDY_RESULTS_QUERY_KEY, filters],
    queryFn: () => getStudyResultsApi(filters),
  });
}

export function useStudyResult(id?: string) {
  return useQuery({
    queryKey: [STUDY_RESULTS_QUERY_KEY, id],
    queryFn: () => {
      if (!id) throw new Error("ID tidak valid");
      return getStudyResultByIdApi(id);
    },
    enabled: Boolean(id),
  });
}

export function useCreateStudyResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStudyResultInput) => createStudyResultApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDY_RESULTS_QUERY_KEY] });
    },
  });
}

export function useUpdateStudyResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStudyResultInput;
    }) => updateStudyResultApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDY_RESULTS_QUERY_KEY] });
    },
  });
}

export function useDeleteStudyResult() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStudyResultApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [STUDY_RESULTS_QUERY_KEY] });
    },
  });
}

export function useDepartmentsOptions() {
  return useQuery({
    queryKey: [DEPARTMENTS_OPTIONS_QUERY_KEY],
    queryFn: getDepartmentsOptionsApi,
    staleTime: 5 * 60 * 1000,
  });
}

export function useClassesOptions() {
  return useQuery({
    queryKey: [CLASSES_OPTIONS_QUERY_KEY],
    queryFn: getClassesOptionsApi,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAcademicYearsOptions() {
  return useQuery({
    queryKey: [ACADEMIC_YEARS_OPTIONS_QUERY_KEY],
    queryFn: getAcademicYearsOptionsApi,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSemestersOptions() {
  return useQuery({
    queryKey: [SEMESTERS_OPTIONS_QUERY_KEY],
    queryFn: getSemestersOptionsApi,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAcademicStatusesOptions() {
  return useQuery({
    queryKey: [ACADEMIC_STATUSES_OPTIONS_QUERY_KEY],
    queryFn: getAcademicStatusesOptionsApi,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudentsOptions() {
  return useQuery({
    queryKey: [STUDENTS_OPTIONS_QUERY_KEY],
    queryFn: getStudentsOptionsApi,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStudyResultStats(
  studyResults: StudyResult[],
  totalServerCount?: number,
): StudyResultStats {
  return useMemo(() => {
    const totalRecords = totalServerCount ?? studyResults.length;
    if (studyResults.length === 0) {
      return {
        totalRecords: 0,
        averageCumulativeGpa: 0,
        averageSemesterGpa: 0,
        activeStudentsCount: 0,
      };
    }

    let sumCumulative = 0;
    let countCumulative = 0;
    let sumSemester = 0;
    let countSemester = 0;
    let activeCount = 0;

    for (const item of studyResults) {
      const cgpa = Number(item.cumulativeGpa);
      if (!Number.isNaN(cgpa) && cgpa > 0) {
        sumCumulative += cgpa;
        countCumulative += 1;
      }

      const sgpa = Number(item.semesterGpa);
      if (!Number.isNaN(sgpa) && sgpa > 0) {
        sumSemester += sgpa;
        countSemester += 1;
      }

      const statusName = item.academicStatus?.name?.toLowerCase() || "";
      if (statusName.includes("aktif") || statusName.includes("active")) {
        activeCount += 1;
      }
    }

    const avgCumulative =
      countCumulative > 0 ? Number((sumCumulative / countCumulative).toFixed(2)) : 0;
    const avgSemester =
      countSemester > 0 ? Number((sumSemester / countSemester).toFixed(2)) : 0;

    return {
      totalRecords,
      averageCumulativeGpa: avgCumulative,
      averageSemesterGpa: avgSemester,
      activeStudentsCount: activeCount,
    };
  }, [studyResults, totalServerCount]);
}
