import { apiFetch } from "@/lib/api";
import type {
	ApiResponse,
	CreateUserInput,
	DeleteUserResult,
	UpdateUserInput,
	User,
	UsersStatsResult,
	UsersResponse,
} from "../types";

export interface GetUsersParams {
	page: number;
	limit: number;
	search?: string;
	status?: "active" | "deleted" | "all";
	institution_id?: string;
}

export const getUsersApi = async ({
	page,
	limit,
	search,
	status,
	institution_id,
}: GetUsersParams): Promise<UsersResponse> => {
	const params = new URLSearchParams({
		page: String(page),
		limit: String(limit),
	});

	const normalizedSearch = search?.trim();
	if (normalizedSearch) {
		params.set("search", normalizedSearch);
	}

	if (status) {
		params.set("status", status);
	}

	if (institution_id) {
		params.set("institution_id", institution_id);
	}

	const response: ApiResponse<UsersResponse> = await apiFetch(
		`/users?${params.toString()}`,
	);
	return response.data;
};

export const getUsersStatsApi = async (
	institution_id?: string,
): Promise<UsersStatsResult> => {
	const params = new URLSearchParams();
	if (institution_id) params.set("institution_id", institution_id);
	const query = params.toString();
	const response: ApiResponse<UsersStatsResult> = await apiFetch(
		`/users/stats${query ? `?${query}` : ""}`,
	);
	return response.data;
};

export const getUserByIdApi = async (id: string): Promise<User> => {
	const response: ApiResponse<User> = await apiFetch(`/users/${id}`);
	return response.data;
};

export const createUserApi = async (input: CreateUserInput): Promise<User> => {
	const response: ApiResponse<User> = await apiFetch("/users", {
		method: "POST",
		body: JSON.stringify(input),
	});
	return response.data;
};

export const updateUserApi = async (
	id: string,
	input: UpdateUserInput,
): Promise<User> => {
	const response: ApiResponse<User> = await apiFetch(`/users/${id}`, {
		method: "PATCH",
		body: JSON.stringify(input),
	});
	return response.data;
};

export const deleteUserApi = async (id: string): Promise<DeleteUserResult> => {
	const response: ApiResponse<DeleteUserResult> = await apiFetch(
		`/users/${id}`,
		{
			method: "DELETE",
		},
	);
	return response.data;
};
