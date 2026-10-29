import { ApiError } from "@/lib/api";

export function getSubjectErrorMessage(error: unknown): string {
	if (error instanceof ApiError) {
		const details = error.fieldErrors
			.map(({ field, message }) => `${field}: ${message}`)
			.join("; ");
		return details ? `${error.message} (${details})` : error.message;
	}
	return error instanceof Error
		? error.message
		: "Terjadi kesalahan. Silakan coba kembali.";
}
