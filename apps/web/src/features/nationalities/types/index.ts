export interface Nationality {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNationalityInput {
  name: string;
  description?: string;
}

export interface UpdateNationalityInput {
  name?: string;
  description?: string;
}

export interface ApiResponse<T> {
  status: string;
  code: number;
  message: string;
  data: T;
}
