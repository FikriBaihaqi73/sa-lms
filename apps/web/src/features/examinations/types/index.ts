export interface Examination {
  id: string;
  classSubjectId: string;
  assignmentTypeId: string | null;
  title: string;
  description: string | null;
  examinationDate: string | null;
  duration: number | null;
  maximumScore: number | null;
  classSubject: {
    id: string;
    class: { id: string; name: string } | null;
    subject: { id: string; name: string } | null;
    academic_year: { id: string; academic_year: string } | null;
  } | null;
  assignmentType: { id: string; name: string } | null;
}

export interface ExaminationFilters {
  page?: number;
  limit?: number;
  search?: string;
  classSubjectId?: string;
  assignmentTypeId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExaminationListResult {
  data: Examination[];
  meta: { totalData: number; totalPages: number; currentPage: number; perPage: number };
}

export interface ExaminationStats {
  total: number;
  upcoming: number;
  completed: number;
  withoutDate: number;
}

export interface ExaminationInput {
  classSubjectId: string;
  assignmentTypeId?: string;
  title: string;
  description?: string;
  examinationDate?: string;
  duration?: number;
  maximumScore?: number;
}
