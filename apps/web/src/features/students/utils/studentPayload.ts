import type { StudentFormValues } from "../schemas/studentSchema";

export function studentUpdatePayload(values: StudentFormValues) {
	return {
		academicStatusId: values.academicStatusId,
		studentNumber: values.studentNumber.trim(),
		...(values.departmentId ? { departmentId: values.departmentId } : {}),
		...(values.enrollmentYear !== undefined
			? { enrollmentYear: values.enrollmentYear }
			: {}),
		referralCode: values.referralCode?.trim() ?? "",
		referralExpiresAt: values.referralExpiresAt || null,
	};
}

export function studentCreatePayload(values: StudentFormValues) {
	return { ...studentUpdatePayload(values), profileId: values.profileId };
}
