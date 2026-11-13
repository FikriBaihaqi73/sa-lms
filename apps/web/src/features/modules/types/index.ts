export type ContentType =
  | "text"
  | "video"
  | "pdf"
  | "link"
  | "document"
  | "assignment";

export interface ModuleContent {
  id: string;
  moduleId: string;
  title: string;
  contentType: string;
  content: string | null;
  fileId: string | null;
  sortOrder: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface LearningModule {
  id: string;
  class_subject_id: string;
  title: string;
  description: string | null;
  display_order: number | null;
  is_published: boolean | null;
  is_locked: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  moduleContents?: ModuleContent[];
  class_subject?: {
    id: string;
    class?: { id: string; name: string } | null;
    subject?: { id: string; name: string } | null;
  } | null;
}

export interface ModuleFilters {
  search?: string;
  class_subject_id?: string;
  is_published?: string;
  is_locked?: string;
  page?: number;
  limit?: number;
}

export interface CreateModuleInput {
  class_subject_id: string;
  title: string;
  description?: string | null;
  display_order?: number | null;
  is_published?: boolean;
  is_locked?: boolean;
}

export interface UpdateModuleInput {
  class_subject_id?: string;
  title?: string;
  description?: string | null;
  display_order?: number | null;
  is_published?: boolean;
  is_locked?: boolean;
}

export interface CreateModuleContentInput {
  moduleId: string;
  title: string;
  contentType: string;
  content?: string | null;
  fileId?: string | null;
  sortOrder?: number | null;
}

export interface UpdateModuleContentInput {
  moduleId?: string;
  title?: string;
  contentType?: string;
  content?: string | null;
  fileId?: string | null;
  sortOrder?: number | null;
}

export interface ClassSubjectOption {
  id: string;
  label: string;
  className?: string;
  subjectName?: string;
}

export interface ModuleStats {
  totalModules: number;
  publishedModules: number;
  lockedModules: number;
  totalContents: number;
}

