import {
	CreateStudentSchema,
	UpdateStudentSchema,
} from "@repo/shared/schemas/student.schema";
import { describe, expect, it } from "vitest";
import { studentCreatePayload, studentUpdatePayload } from "./studentPayload";

describe("student form payload", () => {
	const values = {
		profileId: "11111111-1111-4111-8111-111111111111",
		academicStatusId: "22222222-2222-4222-8222-222222222222",
		departmentId: "33333333-3333-4333-8333-333333333333",
		studentNumber: " 123 ",
		enrollmentYear: 2026,
		referralExpiresAt: "",
	};
	it.each([
		"",
		"  CODE-1  ",
	])("maps referral code %j for create and update", (referralCode) => {
		const input = { ...values, referralCode };
		const create = studentCreatePayload(input);
		const update = studentUpdatePayload(input);
		expect(create).toEqual({
			profileId: values.profileId,
			academicStatusId: values.academicStatusId,
			departmentId: values.departmentId,
			studentNumber: "123",
			enrollmentYear: 2026,
			referralCode: referralCode.trim(),
			referralExpiresAt: null,
		});
		expect(update).toEqual({
			academicStatusId: values.academicStatusId,
			departmentId: values.departmentId,
			studentNumber: "123",
			enrollmentYear: 2026,
			referralCode: referralCode.trim(),
			referralExpiresAt: null,
		});
		expect(CreateStudentSchema.safeParse(create).success).toBe(true);
		expect(UpdateStudentSchema.safeParse(update).success).toBe(true);
	});
});
