import type { RegisterSchema } from "@repo/shared/schemas/auth.schema";
import type * as z from "zod";
import { apiFetch } from "@/lib/api";

type RegisterDto = z.infer<typeof RegisterSchema>;

/**
 * Real API call for registering via the NestJS Backend.
 * Errors (409 email in use, validation, server down) are surfaced to the
 * form — never swallowed, otherwise the UI reports a fake success while
 * no account was created.
 */
export const registerApi = async (data: RegisterDto): Promise<void> => {
	await apiFetch("/auth/register", {
		method: "POST",
		body: JSON.stringify(data),
	});
};
