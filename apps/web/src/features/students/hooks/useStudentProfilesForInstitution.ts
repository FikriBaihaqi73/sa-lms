import { useInfiniteQuery } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface StudentProfileOption {
  id: string;
  fullName: string;
  email: string | null;
}

interface OptionsPage {
  data: StudentProfileOption[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export function useStudentProfilesForInstitution(search = "", enabled = true) {
  return useInfiniteQuery({
    queryKey: ["student-profile-options", search],
    enabled,
    initialPageParam: 1,
    queryFn: async ({ pageParam }): Promise<OptionsPage> => {
      const params = new URLSearchParams({ page: String(pageParam), limit: "50", search });
      const response: { data: OptionsPage } = await apiFetch(`/profiles/student-options?${params}`);
      return response.data;
    },
    getNextPageParam: (last) => last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
  });
}
