import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  createAnnouncementApi,
  deleteAnnouncementApi,
  getAnnouncementByIdApi,
  getAnnouncementStatsApi,
  getAnnouncementsApi,
  updateAnnouncementApi,
} from "../api/announcements";
import type {
  AnnouncementFilters,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "../types";

export const ANNOUNCEMENTS_QUERY_KEY = "announcements";
export const ANNOUNCEMENT_STATS_QUERY_KEY = "announcement-stats";

export function useAnnouncements(filters: AnnouncementFilters = {}) {
  return useQuery({
    queryKey: [ANNOUNCEMENTS_QUERY_KEY, filters],
    queryFn: () => getAnnouncementsApi(filters),
    placeholderData: keepPreviousData,
  });
}

export function useAnnouncementStats() {
  return useQuery({
    queryKey: [ANNOUNCEMENT_STATS_QUERY_KEY],
    queryFn: getAnnouncementStatsApi,
  });
}

export function useAnnouncementDetail(id?: string) {
  return useQuery({
    queryKey: [ANNOUNCEMENTS_QUERY_KEY, id],
    queryFn: () => getAnnouncementByIdApi(id!),
    enabled: Boolean(id),
  });
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateAnnouncementInput) =>
      createAnnouncementApi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ANNOUNCEMENT_STATS_QUERY_KEY],
      });
    },
  });
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateAnnouncementInput;
    }) => updateAnnouncementApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ANNOUNCEMENT_STATS_QUERY_KEY],
      });
    },
  });
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAnnouncementApi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ANNOUNCEMENTS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [ANNOUNCEMENT_STATS_QUERY_KEY],
      });
    },
  });
}
