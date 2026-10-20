import { z } from "zod";

const optionalScore = z.preprocess(
  (val) => {
    if (val === "" || val == null) return null;
    const num = Number(val);
    return Number.isFinite(num) ? num : null;
  },
  z
    .number({ error: "Nilai harus berupa angka numerik." })
    .min(0, "Nilai tidak boleh kurang dari 0.")
    .max(100, "Nilai tidak boleh lebih dari 100.")
    .nullable()
    .optional(),
);

export const gradeFormSchema = z
  .object({
    grade: z
      .string()
      .trim()
      .min(1, "Nama predikat/grade wajib diisi (misal: A, B, C, Lulus).")
      .max(50, "Nama predikat maksimal 50 karakter.")
      .describe("Nama huruf mutu / predikat nilai."),
    minimumScore: optionalScore.describe("Skor batas minimum rentang penilaian (0-100)."),
    maximumScore: optionalScore.describe("Skor batas maksimum rentang penilaian (0-100)."),
    description: z
      .string()
      .trim()
      .max(255, "Deskripsi maksimal 255 karakter.")
      .optional()
      .nullable()
      .describe("Deskripsi atau rubrik capaian predikat."),
  })
  .refine(
    (data) => {
      if (data.minimumScore != null && data.maximumScore != null) {
        return data.minimumScore <= data.maximumScore;
      }
      return true;
    },
    {
      message: "Nilai minimum tidak boleh lebih besar dari nilai maksimum.",
      path: ["minimumScore"],
    },
  );

export type GradeFormInput = z.input<typeof gradeFormSchema>;
export type GradeFormValues = z.output<typeof gradeFormSchema>;
