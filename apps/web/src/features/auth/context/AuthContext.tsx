import { createContext, useState, type ReactNode } from 'react';
import type { AuthState, LoginCredentials } from '../types';
import { loginApi } from '../api/login';

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

// Context and provider intentionally share this module so feature imports stay concise.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = typeof window !== 'undefined' ? (localStorage.getItem('access_token') || localStorage.getItem('token')) : null;
    let user = null;
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        user = {
          id: payload.sub || '1',
          email: payload.email || 'admin@example.com',
          role: payload.role || 'superadmin',
        };
      } catch (e) {
        user = { id: '1', email: 'admin@example.com', role: 'superadmin' };
      }
    }
    return {
      user,
      isAuthenticated: Boolean(token),
      isLoading: false,
    };
  });

  const login = async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const user = await loginApi(credentials);
      setState({
        user,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('token');
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
