import { createContext, type ReactNode, useState } from "react";
import { loginApi } from "../api/login";
import type { AuthState, LoginCredentials, User } from "../types";

export interface AuthContextType extends AuthState {
	login: (credentials: LoginCredentials) => Promise<User>;
	logout: () => void;
}

// Context and provider intentionally share this module so feature imports stay concise.
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
	undefined,
);

function normalizeRole(value: unknown): User["role"] | null {
	if (typeof value !== "string") return null;
	const role = value.trim().toLowerCase();
	if (
		role === "superadmin" ||
		role === "admin" ||
		role === "student" ||
		role === "guardian" ||
		role === "teacher"
	) {
		return role;
	}
	return null;
}

function resolveStoredRole(
	payload: Record<string, unknown>,
): User["role"] | null {
	return (
		normalizeRole(payload.role) ??
		normalizeRole(payload.activeRole) ??
		(Array.isArray(payload.roles)
			? normalizeRole((payload.roles as unknown[])[0])
			: null)
	);
}

export function AuthProvider({ children }: { children: ReactNode }) {
	const [state, setState] = useState<AuthState>(() => {
		const token =
			typeof window !== "undefined"
				? localStorage.getItem("access_token") || localStorage.getItem("token")
				: null;
		let user = null;
		if (token) {
			try {
				const payload = JSON.parse(atob(token.split(".")[1])) as Record<
					string,
					unknown
				>;
				const role = resolveStoredRole(payload);
				if (!role) {
					localStorage.removeItem("access_token");
					localStorage.removeItem("token");
					return { user: null, isAuthenticated: false, isLoading: false };
				}
				user = {
					id: typeof payload.sub === "string" ? payload.sub : "1",
					email:
						typeof payload.email === "string"
							? payload.email
							: "admin@example.com",
					role,
				};
			} catch {
				localStorage.removeItem("access_token");
				localStorage.removeItem("token");
				return { user: null, isAuthenticated: false, isLoading: false };
			}
		}
		return {
			user,
			isAuthenticated: Boolean(token && user),
			isLoading: false,
		};
	});

	const login = async (credentials: LoginCredentials): Promise<User> => {
		setState((prev) => ({ ...prev, isLoading: true }));
		try {
			const user = await loginApi(credentials);
			setState({
				user,
				isAuthenticated: true,
				isLoading: false,
			});
			return user;
		} catch (error) {
			setState((prev) => ({ ...prev, isLoading: false }));
			throw error;
		}
	};

	const logout = () => {
		localStorage.removeItem("access_token");
		localStorage.removeItem("token");
		setState({ user: null, isAuthenticated: false, isLoading: false });
	};

	return (
		<AuthContext.Provider value={{ ...state, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
}
