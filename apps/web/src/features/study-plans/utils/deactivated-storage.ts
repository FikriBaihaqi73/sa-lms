const STORAGE_KEY = "study_plans_deactivated_class_subjects";

export function getDeactivatedClassSubjectIds(): string[] {
	if (typeof window === "undefined" || !window.localStorage) {
		return [];
	}
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed)
			? parsed.filter((item): item is string => typeof item === "string")
			: [];
	} catch {
		return [];
	}
}

export function saveDeactivatedClassSubjectIds(ids: string[]): void {
	if (typeof window === "undefined" || !window.localStorage) {
		return;
	}
	try {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
	} catch {
		// Ignore storage quota or access errors
	}
}

export function isClassSubjectDeactivated(classSubjectId: string): boolean {
	const ids = getDeactivatedClassSubjectIds();
	return ids.includes(classSubjectId);
}

export function toggleClassSubjectActiveStatus(
	classSubjectId: string,
	isActive: boolean,
): string[] {
	const current = getDeactivatedClassSubjectIds();
	let updated: string[];

	if (isActive) {
		// Activating: remove from deactivated list
		updated = current.filter((id) => id !== classSubjectId);
	} else {
		// Deactivating: append to deactivated list if not already present
		if (!current.includes(classSubjectId)) {
			updated = [...current, classSubjectId];
		} else {
			updated = current;
		}
	}

	saveDeactivatedClassSubjectIds(updated);
	return updated;
}
