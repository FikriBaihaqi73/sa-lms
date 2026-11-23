export type TargetAudience = "ALL" | "TEACHER" | "STUDENT";
export type AnnouncementCategory =
  | "GENERAL"
  | "ACADEMIC"
  | "EVENT"
  | "IMPORTANT";

export interface AnnouncementUser {
  id: string;
  email: string;
  profile?: {
    id: string;
    fullName: string;
  } | null;
}

export interface AnnouncementInstitution {
  id: string;
  name: string;
  shortName?: string | null;
  city?: string | null;
  province?: string | null;
}

export interface Announcement {
  id: string;
  title: string;
  content: string | null;
  contentBody?: string;
  targetAudience?: TargetAudience;
  category?: AnnouncementCategory;
  is_published: boolean;
  published_at?: string | null;
  expired_at?: string | null;
  institution_id: string;
  institution?: AnnouncementInstitution | null;
  created_by?: string | null;
  creator?: AnnouncementUser | null;
  updated_by?: string | null;
  updater?: AnnouncementUser | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface AnnouncementStats {
  total: number;
  published: number;
  draft: number;
  active: number;
}

export interface AnnouncementFilters {
  page?: number;
  limit?: number;
  search?: string;
  isPublished?: boolean;
  targetAudience?: TargetAudience;
  category?: AnnouncementCategory;
}

export interface AnnouncementListMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface AnnouncementListResponse {
  data: Announcement[];
  meta: AnnouncementListMeta;
}

export interface CreateAnnouncementInput {
  title: string;
  content?: string;
  targetAudience?: TargetAudience;
  category?: AnnouncementCategory;
  isPublished?: boolean;
  publishedAt?: string | null;
  expiredAt?: string | null;
}

export interface UpdateAnnouncementInput {
  title?: string;
  content?: string;
  targetAudience?: TargetAudience;
  category?: AnnouncementCategory;
  isPublished?: boolean;
  publishedAt?: string | null;
  expiredAt?: string | null;
}
