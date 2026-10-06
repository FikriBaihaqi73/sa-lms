import { apiFetch } from "@/lib/api";
import type { LoginCredentials, User } from "../types";

type RoleLike = User["role"];

function normalizeRole(value: unknown): RoleLike | null {
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

function resolveRole(
	user: Record<string, unknown> | null,
	token: string | null,
): RoleLike | null {
	const direct =
		normalizeRole(user?.["role"]) ??
		normalizeRole(user?.["activeRole"]) ??
		normalizeRole(
			(user?.["profile"] as Record<string, unknown> | undefined)?.["role"],
		) ??
		normalizeRole(
			(
				(user?.["profile"] as Record<string, unknown> | undefined)?.["role"] as
					| Record<string, unknown>
					| undefined
			)?.["name"],
		) ??
		normalizeRole(
			Array.isArray(user?.["profile"])
				? (normalizeRole(
						(
							(user?.["profile"] as unknown[])[0] as
								| Record<string, unknown>
								| undefined
						)?.["role"] &&
							(
								(
									(user?.["profile"] as unknown[])[0] as Record<string, unknown>
								)["role"] as Record<string, unknown>
							)["name"],
					) ??
						normalizeRole(
							(
								(user?.["profile"] as unknown[])[0] as
									| Record<string, unknown>
									| undefined
							)?.["role"],
						))
				: null,
		);
	if (direct) return direct;

	if (token) {
		try {
			const payload = JSON.parse(atob(token.split(".")[1])) as Record<
				string,
				unknown
			>;
			return (
				normalizeRole(payload["role"]) ?? normalizeRole(payload["activeRole"])
			);
		} catch {
			// ignore malformed tokens
		}
	}
	return null;
}

/**
 * Real API call for logging in via the NestJS Backend.
 * The active role always comes from the backend Profile (single source of truth).
 */
export const loginApi = async (
	credentials: LoginCredentials,
): Promise<User> => {
	try {
		const response = await apiFetch("/auth/login", {
			method: "POST",
			body: JSON.stringify(credentials),
		});

		if (response.data?.accessToken) {
			localStorage.setItem("access_token", response.data.accessToken);
			localStorage.setItem("token", response.data.accessToken);
		}

		const user = response.data?.user || response.data;
		const accessToken: string | null = response.data?.accessToken ?? null;
		const role = resolveRole(
			(user ?? null) as Record<string, unknown> | null,
			accessToken,
		);

		if (!role) {
			throw new Error(
				"Akun ini belum memiliki peran (role). Hubungi administrator.",
			);
		}

		return { ...user, role };
	} catch (error) {
		// Only fall back to a local preview session when the backend is
		// unreachable during development AND no backend error was returned.
		const isNetworkError =
			error instanceof TypeError ||
			(error instanceof Error && /fetch|network|offline/i.test(error.message));

		if (isNetworkError && import.meta.env.DEV) {
			console.warn(
				"Backend API offline during dev login, using local preview session.",
			);
			const email = credentials.email || "admin@akademik.id";
			const previewRole: User["role"] = email.toLowerCase().includes("super")
				? "superadmin"
				: "admin";
			const mockToken = `mock-preview-token-${Date.now()}.${btoa(JSON.stringify({ sub: "preview-123", email, role: previewRole }))}.preview`;
			localStorage.setItem("access_token", mockToken);
			localStorage.setItem("token", mockToken);

			return {
				id: "preview-123",
				email,
				name: previewRole === "superadmin" ? "Super Admin" : "Admin",
				role: previewRole,
			};
		}

		throw error;
	}
};
