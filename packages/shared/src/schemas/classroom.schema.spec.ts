import { CLASSROOM_INT32_MAX } from "./classroom.constants";
import {
  CreateClassroomSchema,
  UpdateClassroomSchema,
} from "./classroom.schema";

const validCreate = {
  institutionId: "11111111-1111-4111-8111-111111111111",
  roomCode: "R-101",
  roomName: "Ruang Kelas 1",
  building: "Gedung A",
  floor: 2,
  capacity: 35,
  description: "Ruang kelas teori",
};

describe("Classroom schemas", () => {
  describe("CreateClassroomSchema", () => {
    it("accepts valid full payload", () => {
      const result = CreateClassroomSchema.safeParse(validCreate);
      expect(result.success).toBe(true);
    });

    it("accepts null floor and null capacity", () => {
      const result = CreateClassroomSchema.safeParse({
        ...validCreate,
        floor: null,
        capacity: null,
        building: null,
        description: null,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.floor).toBeNull();
        expect(result.data.capacity).toBeNull();
      }
    });

    it("accepts omitted optional fields (floor, capacity, building, description)", () => {
      const minimal = {
        institutionId: validCreate.institutionId,
        roomCode: validCreate.roomCode,
        roomName: validCreate.roomName,
      };
      const result = CreateClassroomSchema.safeParse(minimal);
      expect(result.success).toBe(true);
    });

    it("accepts undefined floor and capacity", () => {
      const result = CreateClassroomSchema.safeParse({
        ...validCreate,
        floor: undefined,
        capacity: undefined,
      });
      expect(result.success).toBe(true);
    });

    it.each([1.5, 2.7])("rejects non-integer floor %s", (floor) => {
      const result = CreateClassroomSchema.safeParse({
        ...validCreate,
        floor,
      });
      expect(result.success).toBe(false);
    });

    it.each([1.5, 2.7])("rejects non-integer capacity %s", (capacity) => {
      const result = CreateClassroomSchema.safeParse({
        ...validCreate,
        capacity,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid institutionId (not a UUID)", () => {
      const result = CreateClassroomSchema.safeParse({
        ...validCreate,
        institutionId: "invalid-uuid",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty roomCode and roomName", () => {
      expect(
        CreateClassroomSchema.safeParse({ ...validCreate, roomCode: "" })
          .success,
      ).toBe(false);
      expect(
        CreateClassroomSchema.safeParse({ ...validCreate, roomName: "" })
          .success,
      ).toBe(false);
    });

    it.each([
      ["floor", -1, "Lantai tidak boleh kurang dari 0."],
      ["capacity", 0, "Kapasitas minimal 1 kursi."],
      ["floor", 1.5, "Lantai harus berupa angka bulat, tanpa desimal."],
      ["capacity", 1.5, "Kapasitas harus berupa angka bulat, tanpa desimal."],
      [
        "floor",
        CLASSROOM_INT32_MAX + 1,
        "Nomor lantai terlalu besar. Masukkan angka yang lebih kecil.",
      ],
      [
        "capacity",
        CLASSROOM_INT32_MAX + 1,
        "Kapasitas terlalu besar. Masukkan angka yang lebih kecil.",
      ],
      [
        "floor",
        "abc",
        "Lantai harus berupa angka bulat, misalnya 0, 1, atau 2.",
      ],
      ["capacity", "abc", "Kapasitas harus berupa angka bulat, misalnya 30."],
    ])("returns the exact %s validation message", (field, value, message) => {
      const result = CreateClassroomSchema.safeParse({
        ...validCreate,
        [field]: value,
      });
      expect(result.success).toBe(false);
      if (!result.success)
        expect(result.error.issues[0]?.message).toBe(message);
    });

    it("accepts valid int32 boundary values", () => {
      const result = CreateClassroomSchema.safeParse({
        ...validCreate,
        floor: 0,
        capacity: CLASSROOM_INT32_MAX,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("UpdateClassroomSchema", () => {
    it("accepts partial update with null floor to clear it", () => {
      const result = UpdateClassroomSchema.safeParse({ floor: null });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.floor).toBeNull();
      }
    });

    it("accepts partial update with null capacity to clear it", () => {
      const result = UpdateClassroomSchema.safeParse({ capacity: null });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.capacity).toBeNull();
      }
    });

    it("accepts valid integer updates for floor and capacity", () => {
      const result = UpdateClassroomSchema.safeParse({
        floor: 3,
        capacity: 40,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.floor).toBe(3);
        expect(result.data.capacity).toBe(40);
      }
    });

    it("accepts empty object (no changes)", () => {
      const result = UpdateClassroomSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("applies the same floor and capacity rules to updates", () => {
      expect(UpdateClassroomSchema.safeParse({ floor: -1 }).success).toBe(
        false,
      );
      expect(UpdateClassroomSchema.safeParse({ capacity: 0 }).success).toBe(
        false,
      );
      expect(
        UpdateClassroomSchema.safeParse({ capacity: CLASSROOM_INT32_MAX + 1 })
          .success,
      ).toBe(false);
      expect(
        UpdateClassroomSchema.safeParse({ floor: null, capacity: null })
          .success,
      ).toBe(true);
    });
  });
});
