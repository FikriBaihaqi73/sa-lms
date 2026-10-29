import { describe, expect, it } from "vitest";
import { classroomFormSchema } from "../schemas/classroomSchema";

const validForm = {
	roomCode: "R-101",
	roomName: "Ruang Kelas A",
	building: "Gedung A",
	floor: 1,
	capacity: 30,
	description: "Ruangan utama",
};

describe("classroomFormSchema", () => {
	it.each([-1, -5])("rejects invalid floor %s (must be >= 0)", (floor) => {
		const result = classroomFormSchema.safeParse({ ...validForm, floor });
		expect(result.success).toBe(false);
	});

	it.each([0, 1, 5])("accepts valid floor %s", (floor) => {
		const result = classroomFormSchema.safeParse({ ...validForm, floor });
		expect(result.success).toBe(true);
	});

	it.each([1.5, 2.5])("rejects non-integer floor %s", (floor) => {
		const result = classroomFormSchema.safeParse({ ...validForm, floor });
		expect(result.success).toBe(false);
	});

	it.each([1, 2, 10])("accepts valid capacity %s", (capacity) => {
		const result = classroomFormSchema.safeParse({ ...validForm, capacity });
		expect(result.success).toBe(true);
	});

	it.each([0, 0.5])("rejects capacity %s (must be >= 1)", (capacity) => {
		const result = classroomFormSchema.safeParse({ ...validForm, capacity });
		expect(result.success).toBe(false);
	});

	it.each([
		0, 0.5,
	])("rejects invalid capacity %s (must be >= 1)", (capacity) => {
		const result = classroomFormSchema.safeParse({ ...validForm, capacity });
		expect(result.success).toBe(false);
	});

	it.each([1.5, 2.5])("rejects non-integer capacity %s", (capacity) => {
		const result = classroomFormSchema.safeParse({ ...validForm, capacity });
		expect(result.success).toBe(false);
	});

	it("rejects roomCode longer than 255 characters", () => {
		const longCode = "A".repeat(256);
		const result = classroomFormSchema.safeParse({
			...validForm,
			roomCode: longCode,
		});
		expect(result.success).toBe(false);
	});

	it("accepts roomCode exactly 255 characters", () => {
		const longCode = "A".repeat(255);
		const result = classroomFormSchema.safeParse({
			...validForm,
			roomCode: longCode,
		});
		expect(result.success).toBe(true);
	});

	it("rejects roomName longer than 255 characters", () => {
		const longName = "B".repeat(256);
		const result = classroomFormSchema.safeParse({
			...validForm,
			roomName: longName,
		});
		expect(result.success).toBe(false);
	});

	it("accepts building exactly 255 characters", () => {
		const longBuilding = "C".repeat(255);
		const result = classroomFormSchema.safeParse({
			...validForm,
			building: longBuilding,
		});
		expect(result.success).toBe(true);
	});

	it("rejects building longer than 255 characters", () => {
		const longBuilding = "D".repeat(256);
		const result = classroomFormSchema.safeParse({
			...validForm,
			building: longBuilding,
		});
		expect(result.success).toBe(false);
	});

	it("trims leading and trailing whitespace from roomCode", () => {
		const result = classroomFormSchema.safeParse({
			...validForm,
			roomCode: "  r-101  ",
		});
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.roomCode).toBe("r-101");
		}
	});

	it("rejects empty roomCode", () => {
		const result = classroomFormSchema.safeParse({
			...validForm,
			roomCode: "   ",
		});
		expect(result.success).toBe(false);
	});

	it("rejects empty roomName", () => {
		const result = classroomFormSchema.safeParse({
			...validForm,
			roomName: "   ",
		});
		expect(result.success).toBe(false);
	});

	it("accepts capacity 1 (minimum)", () => {
		const result = classroomFormSchema.safeParse({ ...validForm, capacity: 1 });
		expect(result.success).toBe(true);
	});

	it("accepts floor 0 (minimum)", () => {
		const result = classroomFormSchema.safeParse({ ...validForm, floor: 0 });
		expect(result.success).toBe(true);
	});
});
