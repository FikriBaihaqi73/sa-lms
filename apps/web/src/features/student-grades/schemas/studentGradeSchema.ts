import { z } from "zod";

const score = (field: string) => z.number().min(0, `${field} minimal 0.`).max(100, `${field} maksimal 100.`).refine((value) => Number.isInteger(value * 100), `${field} maksimal 2 angka desimal.`).nullable().optional();
export const studentGradeFormSchema = z.object({
  studentId: z.string().uuid("studentId harus berupa UUID yang valid."),
  classSubjectId: z.string().uuid("classSubjectId harus berupa UUID yang valid."),
  academicYearId: z.string().uuid("academicYearId harus berupa UUID yang valid."),
  assignmentScore: score("assignmentScore"), quizScore: score("quizScore"), midExamScore: score("midExamScore"), finalExamScore: score("finalExamScore"), finalScore: score("finalScore"),
  gradeId: z.string().uuid("gradeId harus berupa UUID yang valid.").nullable().optional(),
  remarks: z.string().nullable().optional(),
});
export type StudentGradeFormValues = z.infer<typeof studentGradeFormSchema>;
