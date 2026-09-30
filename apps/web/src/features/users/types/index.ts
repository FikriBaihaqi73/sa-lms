export interface UserInstitution {
  id: string;
  name: string;
  shortName?: string | null;
}

export interface UserRole {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  institution?: UserInstitution | null;
  role?: UserRole | null;
}

export interface User {
  id: string;
  email: string;
  is_active: boolean;
  last_login: string | null;
  profile?: UserProfile[] | null;
}

export interface UsersPageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UsersResponse {
  data: User[];
  meta: UsersPageMeta;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
  code: number;
}

export interface CreateUserInput {
  email: string;
  password: string;
  is_active?: boolean;
}

export interface UpdateUserInput {
  email?: string;
  password?: string;
  is_active?: boolean;
}

export interface DeleteUserResult {
  success: boolean;
  id: string;
}
