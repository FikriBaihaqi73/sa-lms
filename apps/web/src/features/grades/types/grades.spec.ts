import { describe, expect, it } from "vitest";
import { buildUpdateGradePayload, toGradeRow, updateGradeApi } from "../api/grades";
import { gradeRowFormSchema } from "../schemas/grade-schema";
import { calcFinalScore, gradePredicate, gradeStatus, parseScore } from "./index";

describe("calcFinalScore", () => {
  it("menghitung nilai akhir dengan bobot 30/30/40", () => {
    const result = calcFinalScore({ tugas: 88, uts: 88, uas: 92 });
    expect(result).not.toBeNull();
    expect(result as number).toBeCloseTo(89.6, 1);
  });

  it("mengembalikan null jika salah satu komponen kosong", () => {
    expect(calcFinalScore({ tugas: 80, uts: 80, uas: null })).toBeNull();
    expect(calcFinalScore({ tugas: null, uts: 80, uas: 80 })).toBeNull();
    expect(calcFinalScore({ tugas: 80, uts: null, uas: 80 })).toBeNull();
  });

  it("menangani nilai batas 0 dan 100", () => {
    expect(calcFinalScore({ tugas: 0, uts: 0, uas: 0 })).toBe(0);
    expect(calcFinalScore({ tugas: 100, uts: 100, uas: 100 })).toBe(100);
  });

  it("menormalkan skor Decimal berbentuk string dari backend", () => {
    const result = calcFinalScore({
      tugas: parseScore("88"),
      uts: parseScore("88.00"),
      uas: parseScore("92"),
    });
    expect(result as number).toBeCloseTo(89.6, 1);
  });
});

describe("gradePredicate", () => {
  it("mengembalikan predikat sesuai rentang", () => {
    expect(gradePredicate(95)).toBe("Predikat A");
    expect(gradePredicate(85)).toBe("Predikat B");
    expect(gradePredicate(75)).toBe("Predikat C");
    expect(gradePredicate(60)).toContain("Predikat D");
  });

  it("menangani nilai null pada predikat", () => {
    expect(gradePredicate(null)).toBe("Menunggu UAS");
  });
});

describe("gradeStatus", () => {
  it("lulus jika >= KKM 70", () => {
    expect(gradeStatus(70)).toBe("Lulus");
    expect(gradeStatus(89.6)).toBe("Lulus");
  });

  it("remedial jika < KKM", () => {
    expect(gradeStatus(57.4)).toBe("Remedial");
  });

  it("belum lengkap jika null", () => {
    expect(gradeStatus(null)).toBe("Belum lengkap");
  });
});

describe("parseScore — normalisasi Decimal backend ke number", () => {
  it("mengonversi string Decimal JSON menjadi number", () => {
    expect(parseScore("85")).toBe(85);
    expect(parseScore("85.50")).toBe(85.5);
    expect(parseScore(" 92.5 ")).toBe(92.5);
    expect(parseScore("0")).toBe(0);
    expect(parseScore("100")).toBe(100);
  });

  it("mempertahankan number finite apa adanya", () => {
    expect(parseScore(85)).toBe(85);
    expect(parseScore(0)).toBe(0);
    expect(parseScore(85.5)).toBe(85.5);
  });

  it("mengembalikan null untuk null/undefined/kosong", () => {
    expect(parseScore(null)).toBeNull();
    expect(parseScore(undefined)).toBeNull();
    expect(parseScore("")).toBeNull();
    expect(parseScore("   ")).toBeNull();
  });

  it("mengembalikan null untuk nilai tidak valid", () => {
    expect(parseScore("abc")).toBeNull();
    expect(parseScore(Number.NaN)).toBeNull();
    expect(parseScore(Number.POSITIVE_INFINITY)).toBeNull();
    expect(parseScore(true)).toBeNull();
  });

  it("mengonversi objek Decimal mentah lewat toString", () => {
    const decimalLike = { toString: () => "77.25" };
    expect(parseScore(decimalLike)).toBe(77.25);
    // Objek tanpa representasi numerik (mis. JSON plain object) ditolak.
    expect(parseScore({ assignmentScore: 85 })).toBeNull();
  });
});

/** Contoh item response GET /student-grades (docs/0158-student-grades-api.md) dengan skor sebagai string Decimal. */
function sampleResponseItem(): Record<string, unknown> {
  return {
    id: "e9b1c7d2-3f4a-5b6c-7d8e-9f0a1b2c3d4e",
    assignmentScore: "85.00",
    quizScore: "90.00",
    midExamScore: "80.00",
    finalExamScore: "88.00",
    finalScore: "85.50",
    gradeId: "44444444-4444-4444-4444-444444444444",
    student: {
      studentNumber: "STD-2026-001",
      profile: { fullName: "Ahmad Student" },
    },
    classSubject: {
      class: { name: "X IPA 1" },
      subject: { code: "MATH101", name: "Mathematics" },
    },
    academicYear: { academic_year: "2024/2025" },
    grade: { id: "44444444-4444-4444-4444-444444444444", grade: "A", minimumScore: "85", maximumScore: "100" },
  };
}

describe("toGradeRow — parsing response /student-grades", () => {
  it("menormalkan skor string Decimal menjadi number pada GradeRow", () => {
    const row = toGradeRow(sampleResponseItem(), 0);
    expect(row.tugas).toBe(85);
    expect(row.uts).toBe(80);
    expect(row.uas).toBe(88);
    expect(typeof row.tugas).toBe("number");
    expect(row.studentName).toBe("Ahmad Student");
    expect(row.studentNumber).toBe("STD-2026-001");
    expect(row.className).toBe("X IPA 1");
    expect(row.subjectCode).toBe("MATH101");
    expect(row.semester).toBe("2024/2025");
  });

  it("memetakan relasi grade (Grade Range) dengan minimumScore/maximumScore number", () => {
    const row = toGradeRow(sampleResponseItem(), 0);
    expect(row.gradeRange).toEqual({ letter: "A", minimumScore: 85, maximumScore: 100 });
  });

  it("menangani skor null dan relasi grade tidak ada", () => {
    const item = sampleResponseItem();
    item.assignmentScore = null;
    item.midExamScore = null;
    item.finalExamScore = null;
    item.grade = null;
    const row = toGradeRow(item, 3);
    expect(row.tugas).toBeNull();
    expect(row.uts).toBeNull();
    expect(row.uas).toBeNull();
    expect(row.gradeRange).toBeNull();
    expect(row.avatarTone).toBe("teal");
  });

  it("menghasilkan nilai default untuk item kosong tanpa error", () => {
    const row = toGradeRow({}, 0);
    expect(row.id).toBe("sg-0");
    expect(row.tugas).toBeNull();
    expect(row.gradeRange).toBeNull();
  });
});

describe("buildUpdateGradePayload — request PATCH /student-grades/:id", () => {
  it("mengirim field number apa adanya", () => {
    expect(
      buildUpdateGradePayload({ assignmentScore: 88, midExamScore: 88, finalExamScore: 92 }),
    ).toEqual({ assignmentScore: 88, midExamScore: 88, finalExamScore: 92 });
  });

  it("meng-omit field null (backend z.number().optional() menolak null)", () => {
    expect(
      buildUpdateGradePayload({ assignmentScore: 88, midExamScore: null, finalExamScore: 92 }),
    ).toEqual({ assignmentScore: 88, finalExamScore: 92 });
  });

  it("menghasilkan objek kosong jika semua kolom kosong", () => {
    expect(
      buildUpdateGradePayload({ assignmentScore: null, midExamScore: null, finalExamScore: null }),
    ).toEqual({});
  });

  it("meng-omit field yang tidak disediakan (undefined)", () => {
    expect(buildUpdateGradePayload({})).toEqual({});
  });

  it("menolak submit tanpa perubahan di updateGradeApi", async () => {
    await expect(
      updateGradeApi("sg-1", { assignmentScore: null, midExamScore: null, finalExamScore: null }),
    ).rejects.toThrow("Tidak ada perubahan nilai untuk disimpan.");
  });
});

describe("gradeRowFormSchema — aturan backend 0-100", () => {
  it("menerima 0, 100, dan null (kolom kosong)", () => {
    expect(gradeRowFormSchema.safeParse({ tugas: 0, uts: 100, uas: null }).success).toBe(true);
  });

  it("menolak nilai di luar 0-100", () => {
    expect(gradeRowFormSchema.safeParse({ tugas: -1, uts: 50, uas: 50 }).success).toBe(false);
    expect(gradeRowFormSchema.safeParse({ tugas: 101, uts: 50, uas: 50 }).success).toBe(false);
  });

  it("menolak non-number", () => {
    expect(gradeRowFormSchema.safeParse({ tugas: "85", uts: 50, uas: 50 }).success).toBe(false);
    expect(gradeRowFormSchema.safeParse({ tugas: Number.NaN, uts: 50, uas: 50 }).success).toBe(false);
  });
});

describe("updateGradeApi — kontrak request/response", () => {
  function mockFetchOnce(responseBody: unknown) {
    const originalFetch = globalThis.fetch;
    const seen: { url: string; body: string }[] = [];
    globalThis.fetch = ((url: unknown, init?: RequestInit) => {
      seen.push({ url: String(url), body: String(init?.body ?? "") });
      return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(responseBody),
      } as Response);
    }) as typeof fetch;
    return {
      seen,
      restore: () => {
        globalThis.fetch = originalFetch;
      },
    };
  }

  it("mengirim payload PATCH tanpa null dan menormalkan response Decimal", async () => {
    const mock = mockFetchOnce({
      status: "success",
      message: "Student grade updated successfully",
      code: 200,
      data: sampleResponseItem(),
    });
    try {
      const row = await updateGradeApi("sg-1", {
        assignmentScore: 88,
        midExamScore: null,
        finalExamScore: 92,
      });
      expect(mock.seen).toHaveLength(1);
      expect(mock.seen[0].url).toContain("/student-grades/sg-1");
      const sent = JSON.parse(mock.seen[0].body) as Record<string, unknown>;
      expect(sent).toEqual({ assignmentScore: 88, finalExamScore: 92 });
      expect("midExamScore" in sent).toBe(false);
      expect(row.tugas).toBe(85);
      expect(row.uas).toBe(88);
      expect(row.gradeRange).toEqual({ letter: "A", minimumScore: 85, maximumScore: 100 });
    } finally {
      mock.restore();
    }
  });

  it("melempar error saat response data bukan objek", async () => {
    const mock = mockFetchOnce({
      status: "success",
      message: "ok",
      code: 200,
      data: null,
    });
    try {
      await expect(updateGradeApi("sg-1", { assignmentScore: 88 })).rejects.toThrow(
        "Response pembaruan nilai tidak valid.",
      );
    } finally {
      mock.restore();
    }
  });
});


