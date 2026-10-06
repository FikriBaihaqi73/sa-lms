export interface InstitutionRow {
	id: string;
	name: string;
	code: string;
	location: string;
	type: string;
	package: string;
	users: number;
	courses: number;
	status: "Aktif" | "Nonaktif" | "Trial" | "Trial (14 hari)";
}

export type InstitutionStatus =
	| "Aktif"
	| "Nonaktif"
	| "Trial"
	| "Trial (14 hari)";

export interface InstitutionsData {
	total: number;
	active: number;
	trial: number;
	totalUsers: number;
	newThisMonth: number;
	fullyOperationalPercentage: number;
	expiringIn3Days: number;
	sla: number;
	institutions: InstitutionRow[];
}
