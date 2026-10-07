import type { SettingEntity } from "@repo/shared/entities/setting.entity";
import type {
	CreateSettingSchema,
	UpdateSettingSchema,
} from "@repo/shared/schemas/setting.schema";
import type { z } from "zod";

export type Setting = SettingEntity;
export type CreateSettingInput = z.infer<typeof CreateSettingSchema>;
export type UpdateSettingInput = z.infer<typeof UpdateSettingSchema>;

export interface SettingPageMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
}

export interface SettingsResponse {
	data: Setting[];
	meta: SettingPageMeta;
}

export interface ApiResponse<T> {
	status: string;
	message?: string;
	data: T;
	meta?: {
		totalData: number;
		totalPages: number;
		currentPage: number;
		perPage: number;
	};
}
