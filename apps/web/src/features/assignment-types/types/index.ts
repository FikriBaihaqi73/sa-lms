export interface AssignmentType {
  id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateAssignmentTypeInput {
  name: string;
  description?: string;
}

export interface UpdateAssignmentTypeInput {
  name?: string;
  description?: string;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}
