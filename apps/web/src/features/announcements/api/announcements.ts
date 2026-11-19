import { apiFetch } from "@/lib/api";
import type {
  Announcement,
  AnnouncementFilters,
  AnnouncementListResponse,
  AnnouncementStats,
  CreateAnnouncementInput,
  UpdateAnnouncementInput,
} from "../types";

interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
  meta?: {
    totalData?: number;
    totalPages?: number;
    currentPage?: number;
    perPage?: number;
    total?: number;
    page?: number;
    limit?: number;
  };
}

export async function getAnnouncementsApi(
  filters: AnnouncementFilters = {},
): Promise<AnnouncementListResponse> {
  const query = new URLSearchParams();
  if (filters.page) query.set("page", String(filters.page));
  if (filters.limit) query.set("limit", String(filters.limit));
  if (filters.search?.trim()) query.set("search", filters.search.trim());
  if (filters.isPublished !== undefined) {
    query.set("isPublished", String(filters.isPublished));
  }
  if (filters.targetAudience) {
    query.set("targetAudience", filters.targetAudience);
  }
  if (filters.category) {
    query.set("category", filters.category);
  }

  const endpoint = `/announcements${query.toString() ? `?${query.toString()}` : ""}`;
  const res = (await apiFetch(endpoint)) as ApiResponse<Announcement[]>;

  return {
    data: res.data || [],
    meta: {
      totalData:
        res.meta?.totalData ?? res.meta?.total ?? (res.data || []).length,
      totalPages: res.meta?.totalPages ?? 1,
      currentPage: res.meta?.currentPage ?? res.meta?.page ?? filters.page ?? 1,
      perPage: res.meta?.perPage ?? res.meta?.limit ?? filters.limit ?? 10,
    },
  };
}

export async function getAnnouncementStatsApi(): Promise<AnnouncementStats> {
  const res = (await apiFetch("/announcements/stats")) as ApiResponse<AnnouncementStats>;
  return (
    res.data || {
      total: 0,
      published: 0,
      draft: 0,
      active: 0,
    }
  );
}

export async function getAnnouncementByIdApi(
  id: string,
): Promise<Announcement> {
  const res = (await apiFetch(`/announcements/${id}`)) as ApiResponse<Announcement>;
  return res.data;
}

export async function createAnnouncementApi(
  data: CreateAnnouncementInput,
): Promise<Announcement> {
  const res = (await apiFetch("/announcements", {
    method: "POST",
    body: JSON.stringify(data),
  })) as ApiResponse<Announcement>;
  return res.data;
}

export async function updateAnnouncementApi(
  id: string,
  data: UpdateAnnouncementInput,
): Promise<Announcement> {
  const res = (await apiFetch(`/announcements/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  })) as ApiResponse<Announcement>;
  return res.data;
}

export async function deleteAnnouncementApi(
  id: string,
): Promise<{ success: boolean; id: string }> {
  const res = (await apiFetch(`/announcements/${id}`, {
    method: "DELETE",
  })) as ApiResponse<{ success: boolean; id: string }>;
  return res.data;
}
