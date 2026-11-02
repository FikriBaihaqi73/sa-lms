import type { ClassroomConfig } from "./types";

export const classroomConfig: ClassroomConfig = {
	list: true,
	search: true,
	create: true,
	update: true,
	softDelete: false,
	summary: false,
	filterOptions: false,
	buildingFloorFilters: true,
	scheduleCount: false,
	fieldErrors: false,
} as const;

export type ClassroomConfigKey = keyof ClassroomConfig;
