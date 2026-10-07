import type { z } from "zod";
import type { 
  CreateSettingSchema, 
  UpdateSettingSchema 
} from "@repo/shared/schemas/setting.schema";
import type { SettingEntity } from "@repo/shared/entities/setting.entity";

export type Setting = SettingEntity;
export type CreateSettingInput = z.infer<typeof CreateSettingSchema>;
export type UpdateSettingInput = z.infer<typeof UpdateSettingSchema>;

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
