export interface User {
  id: string;
  email: string;
  name?: string;
  role: 'superadmin' | 'admin' | 'student' | 'guardian' | 'teacher';
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
