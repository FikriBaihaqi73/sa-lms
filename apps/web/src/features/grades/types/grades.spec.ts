import { describe, expect, it, vi } from "vitest";
import {
  createGradeApi,
  deleteGradeApi,
  getGradeByIdApi,
  getGradesApi,
  toStandardGrade,
  updateGradeApi,
} from "../api/grades";
import { gradeFormSchema } from "../schemas/gradeSchema";
import {
  formatScoreRange,
  getGradeColorBadge,
  parseScore,
} from "./index";

const mockData = [
  { id: "1", grade: "A", minimumScore: "85", maximumScore: "100" },
  { id: "2", grade: "B", minimumScore: "70", maximumScore: "84" },
];

vi.mock("@/lib/api", () => ({
  apiFetch: vi.fn().mockImplementation((url: string, opts?: RequestInit) => {
    const method = opts?.method?.toUpperCase() ?? "GET";

    if (url === "/grades" && method === "GET") {
      return Promise.resolve({
        status: "success",
        code: 200,
        message: "Grades retrieved successfully",
        data: mockData,
      });
    }
    if (url === "/grades/1" && method === "GET") {
      return Promise.resolve({
        status: "success",
        code: 200,
        message: "Grade detail retrieved successfully",
        data: mockData[0],
      });
    }
    if (url === "/grades" && method === "POST") {
      const body = JSON.parse(String(opts?.body ?? "{}"));
      return Promise.resolve({
        status: "success",
        code: 201,
        message: "Grade created successfully",
        data: { id: "3", ...body },
      });
    }
    if (url === "/grades/1" && method === "PATCH") {
      const body = JSON.parse(String(opts?.body ?? "{}"));
      return Promise.resolve({
        status: "success",
        code: 200,
        message: "Grade updated successfully",
        data: { id: "1", grade: "A", ...body },
      });
    }
    if (url === "/grades/1" && method === "DELETE") {
      return Promise.resolve({
        status: "success",
        code: 200,
        message: "Grade deleted successfully",
        data: { success: true, id: "1" },
      });
    }
    return Promise.reject(new Error(`Unknown route: ${method} ${url}`));
  }),
}));

describe("parseScore", () => {
  it("mengurai angka numerik valid", () => {
    expect(parseScore(85)).toBe(85);
    expect(parseScore(0)).toBe(0);
    expect(parseScore(100)).toBe(100);
    expect(parseScore(92.75)).toBe(92.75);
  });

  it("mengurai string numerik desimal dari backend", () => {
    expect(parseScore("85")).toBe(85);
    expect(parseScore("85.50")).toBe(85.5);
    expect(parseScore("  90.25  ")).toBe(90.25);
    expect(parseScore("0")).toBe(0);
  });

  it("menangani objek dengan toString (seperti Decimal)", () => {
    const fakeDecimal = {
      toString: () => "78.45",
    };
    expect(parseScore(fakeDecimal)).toBe(78.45);
  });

  it("mengembalikan null untuk input kosong atau tidak valid", () => {
    expect(parseScore(null)).toBeNull();
    expect(parseScore(undefined)).toBeNull();
    expect(parseScore("")).toBeNull();
    expect(parseScore("   ")).toBeNull();
    expect(parseScore("not-a-number")).toBeNull();
    expect(parseScore(Number.NaN)).toBeNull();
    expect(parseScore(Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe("formatScoreRange", () => {
  it("memformat rentang dengan batas minimum dan maksimum", () => {
    expect(formatScoreRange(85, 100)).toBe("85 – 100");
    expect(formatScoreRange(70, 84.99)).toBe("70 – 84.99");
    expect(formatScoreRange(0, 50)).toBe("0 – 50");
  });

  it("memformat jika hanya ada batas minimum", () => {
    expect(formatScoreRange(75, null)).toBe("≥ 75");
    expect(formatScoreRange(75.5, null)).toBe("≥ 75.50");
  });

  it("memformat jika hanya ada batas maksimum", () => {
    expect(formatScoreRange(null, 60)).toBe("≤ 60");
    expect(formatScoreRange(null, 59.99)).toBe("≤ 59.99");
  });

  it("memformat jika kedua batas kosong", () => {
    expect(formatScoreRange(null, null)).toBe("Tanpa batasan skor");
  });
});

describe("getGradeColorBadge", () => {
  it("memberikan tema warna hijau/emerald untuk grade A", () => {
    const themeA = getGradeColorBadge("A");
    expect(themeA.text).toContain("emerald");
    const themeAPlus = getGradeColorBadge("A+");
    expect(themeAPlus.text).toContain("emerald");
  });

  it("memberikan tema warna biru untuk grade B", () => {
    const themeB = getGradeColorBadge("B");
    expect(themeB.text).toContain("blue");
  });

  it("memberikan tema warna amber untuk grade C", () => {
    const themeC = getGradeColorBadge("C");
    expect(themeC.text).toContain("amber");
  });

  it("memberikan tema warna oranye untuk grade D", () => {
    const themeD = getGradeColorBadge("D");
    expect(themeD.text).toContain("orange");
  });

  it("memberikan tema warna rose/merah untuk grade E atau F", () => {
    const themeE = getGradeColorBadge("E");
    expect(themeE.text).toContain("rose");
    const themeF = getGradeColorBadge("F");
    expect(themeF.text).toContain("rose");
  });

  it("memberikan tema default netral untuk grade non-alfabet", () => {
    const themeOther = getGradeColorBadge("Lulus");
    expect(themeOther.text).toContain("slate");
  });
});

describe("toStandardGrade", () => {
  it("memetakan objek mentah API ke StandardGrade entity", () => {
    const raw = {
      id: "grade-uuid-1",
      grade: "A",
      minimumScore: "85.00",
      maximumScore: "100.00",
      description: "Sangat Memuaskan",
      createdAt: "2026-10-01T00:00:00.000Z",
      updatedAt: "2026-10-02T00:00:00.000Z",
    };

    const entity = toStandardGrade(raw);
    expect(entity.id).toBe("grade-uuid-1");
    expect(entity.grade).toBe("A");
    expect(entity.minimumScore).toBe(85);
    expect(entity.maximumScore).toBe(100);
    expect(entity.description).toBe("Sangat Memuaskan");
    expect(entity.createdAt).toBe("2026-10-01T00:00:00.000Z");
  });

  it("menormalkan deskripsi kosong menjadi null", () => {
    const raw = {
      id: "grade-uuid-2",
      grade: "B",
      minimumScore: 70,
      maximumScore: 84.99,
      description: "   ",
    };

    const entity = toStandardGrade(raw);
    expect(entity.description).toBeNull();
  });
});

describe("gradeFormSchema validation", () => {
  it("memvalidasi data form yang lengkap dan benar", () => {
    const result = gradeFormSchema.safeParse({
      grade: "A",
      minimumScore: 85,
      maximumScore: 100,
      description: "Sangat Baik",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.grade).toBe("A");
      expect(result.data.minimumScore).toBe(85);
      expect(result.data.maximumScore).toBe(100);
      expect(result.data.description).toBe("Sangat Baik");
    }
  });

  it("mengonversi string angka menjadi number", () => {
    const result = gradeFormSchema.safeParse({
      grade: "B",
      minimumScore: "70",
      maximumScore: "84.5",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.minimumScore).toBe(70);
      expect(result.data.maximumScore).toBe(84.5);
    }
  });

  it("menerima batas nilai kosong (null / string kosong)", () => {
    const result = gradeFormSchema.safeParse({
      grade: "E",
      minimumScore: "",
      maximumScore: null,
      description: "Perlu bimbingan",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.minimumScore).toBeNull();
      expect(result.data.maximumScore).toBeNull();
    }
  });

  it("menolak nilai minimum yang lebih besar dari nilai maksimum", () => {
    const result = gradeFormSchema.safeParse({
      grade: "A",
      minimumScore: 90,
      maximumScore: 80,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const fieldError = result.error.issues.find(
        (issue) => issue.path.includes("minimumScore"),
      );
      expect(fieldError?.message).toBe(
        "Nilai minimum tidak boleh lebih besar dari nilai maksimum.",
      );
    }
  });

  it("menerima batas minimum dan maksimum yang bernilai sama", () => {
    const result = gradeFormSchema.safeParse({
      grade: "K",
      minimumScore: 75,
      maximumScore: 75,
    });

    expect(result.success).toBe(true);
  });

  it("menolak skor di luar rentang 0-100", () => {
    const negative = gradeFormSchema.safeParse({
      grade: "Z",
      minimumScore: -5,
      maximumScore: 50,
    });
    expect(negative.success).toBe(false);

    const exceed = gradeFormSchema.safeParse({
      grade: "Z",
      minimumScore: 50,
      maximumScore: 105,
    });
    expect(exceed.success).toBe(false);
  });

  it("menolak nama predikat yang kosong atau hanya spasi", () => {
    const empty = gradeFormSchema.safeParse({
      grade: "   ",
      minimumScore: 50,
      maximumScore: 60,
    });
    expect(empty.success).toBe(false);
  });
});

describe("API operations mock integration", () => {
  it("getGradesApi mengambil dan memetakan array standar nilai", async () => {
    const list = await getGradesApi();
    expect(list).toHaveLength(2);
    expect(list[0].grade).toBe("A");
    expect(list[0].minimumScore).toBe(85);

    const single = await getGradeByIdApi("1");
    expect(single.id).toBe("1");
    expect(single.grade).toBe("A");

    const created = await createGradeApi({
      grade: "C",
      minimumScore: 55,
      maximumScore: 69,
      description: "Cukup",
    });
    expect(created.id).toBe("3");
    expect(created.grade).toBe("C");

    const updated = await updateGradeApi("1", {
      grade: "A+",
      minimumScore: 90,
    });
    expect(updated.grade).toBe("A+");
    expect(updated.minimumScore).toBe(90);

    const deleted = await deleteGradeApi("1");
    expect(deleted.success).toBe(true);
    expect(deleted.id).toBe("1");
  });
});
