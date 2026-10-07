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
 * Every backend error (401/409/500) is rethrown untouched so the form shows it.
 */
export const loginApi = async (
	credentials: LoginCredentials,
): Promise<User> => {
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
};
