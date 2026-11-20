export interface StudentGrade {
  id: string;
  studentId: string;
  classSubjectId: string;
  academicYearId: string;
  assignmentScore: number | null;
  quizScore: number | null;
  midExamScore: number | null;
  finalExamScore: number | null;
  finalScore: number | null;
  gradeId: string | null;
  remarks: string | null;
  student: { id: string; studentNumber: string; profile: { fullName: string } | null };
  classSubject: { id: string; class: { id: string; name: string } | null; subject: { id: string; name: string } | null; academic_year: { id: string; academic_year: string } | null };
  academicYear: { id: string; academic_year: string };
  grade: { id: string; grade: string; minimumScore: number | null; maximumScore: number | null } | null;
}
export interface StudentGradeFilters { page?: number; limit?: number; search?: string; classSubjectId?: string; academicYearId?: string; studentId?: string; }
export interface StudentGradeListResult { data: StudentGrade[]; meta: { totalData: number; totalPages: number; currentPage: number; perPage: number }; }
export interface StudentGradeStats { total: number; complete: number; incomplete: number; averageFinalScore: number | null; }
export interface StudentGradeInput { studentId: string; classSubjectId: string; academicYearId: string; assignmentScore?: number | null; quizScore?: number | null; midExamScore?: number | null; finalExamScore?: number | null; finalScore?: number | null; gradeId?: string | null; remarks?: string | null; }
