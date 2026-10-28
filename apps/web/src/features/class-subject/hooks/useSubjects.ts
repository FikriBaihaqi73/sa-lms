import { useQuery } from "@tanstack/react-query";
import { getAllSubjectsApi } from "../api/subjects";

export const SUBJECTS_QUERY_KEY = ["subjects", "options"] as const;

export function useSubjects() {
  return useQuery({ queryKey: SUBJECTS_QUERY_KEY, queryFn: getAllSubjectsApi, staleTime: 5 * 60 * 1000 });
}
