export interface ClassroomBrief {
  id: string;
  roomCode: string;
  roomName: string;
  building?: string | null;
  floor?: number | null;
  capacity?: number | null;
}

export interface ClassSubjectBrief {
  id: string;
  class_id?: string;
  subject_id?: string;
  teacher_id?: string;
  academic_year_id?: string;
  class?: {
    id: string;
    name: string;
    grade_level?: number;
  } | null;
  subject?: {
    id: string;
    name: string;
    code?: string | null;
  } | null;
  teacher?: {
    id: string;
    teacher_number?: string | null;
    profile?: {
      id: string;
      fullName: string;
      email?: string | null;
    } | null;
  } | null;
  academic_year?: {
    id: string;
    academic_year: string;
    is_active?: boolean;
  } | null;
}

export interface Schedule {
  id: string;
  classSubjectId: string;
  classroomId: string;
  day: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  classroom?: ClassroomBrief | null;
  classSubject?: ClassSubjectBrief | null;
}

export interface SchedulePageMeta {
  totalData: number;
  totalPages: number;
  currentPage: number;
  perPage: number;
}

export interface ScheduleListResponse {
  data: Schedule[];
  meta: SchedulePageMeta;
}

export interface GetSchedulesParams {
  page?: number;
  limit?: number;
  search?: string;
  day?: string;
  classroomId?: string;
  classSubjectId?: string;
}

export interface CreateScheduleInput {
  classSubjectId: string;
  classroomId: string;
  day: string;
  startTime?: string | null;
  endTime?: string | null;
}

export interface UpdateScheduleInput {
  classSubjectId?: string;
  classroomId?: string;
  day?: string;
  startTime?: string | null;
  endTime?: string | null;
}

export interface ScheduleClassSubjectOption {
  id: string;
  label: string;
  className: string;
  subjectName: string;
  subjectCode?: string;
  teacherName: string;
  academicYear: string;
}

export interface ScheduleClassroomOption {
  id: string;
  roomCode: string;
  roomName: string;
  building?: string | null;
  capacity?: number | null;
}

export interface ScheduleOptions {
  classSubjects: ScheduleClassSubjectOption[];
  classrooms: ScheduleClassroomOption[];
}
