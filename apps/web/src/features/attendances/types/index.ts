export interface AttendanceStatusItem {
  id: string;
  name: string;
  description?: string | null;
}

export interface AttendanceStudentProfile {
  id: string;
  fullName: string;
  email?: string | null;
}

export interface AttendanceStudentItem {
  id: string;
  studentNumber?: string | null;
  profile?: AttendanceStudentProfile | null;
}

export interface AttendanceClassItem {
  id: string;
  name: string;
  grade_level?: number | null;
}

export interface AttendanceSubjectItem {
  id: string;
  name: string;
  code?: string | null;
}

export interface AttendanceTeacherProfile {
  id: string;
  fullName: string;
}

export interface AttendanceTeacherItem {
  id: string;
  teacher_number?: string | null;
  profile?: AttendanceTeacherProfile | null;
}

export interface AttendanceClassSubjectItem {
  id: string;
  class?: AttendanceClassItem | null;
  subject?: AttendanceSubjectItem | null;
  teacher?: AttendanceTeacherItem | null;
}

export interface AttendanceClassroomItem {
  id: string;
  roomCode: string;
  roomName: string;
}

export interface AttendanceScheduleItem {
  id: string;
  day: string;
  startTime: string | null;
  endTime: string | null;
  classroom?: AttendanceClassroomItem | null;
  classSubject?: AttendanceClassSubjectItem | null;
}

export interface Attendance {
  id: string;
  schedule_id: string;
  student_id: string;
  attendance_status_id: string;
  attendance_date: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  attendance_status?: AttendanceStatusItem | null;
  student?: AttendanceStudentItem | null;
  schedule?: AttendanceScheduleItem | null;
}

export interface AttendanceSummary {
  total: number;
  present: number;
  permission: number;
  sick: number;
  absent: number;
  attendanceRate: number;
}

export interface AttendanceFilters {
  page: number;
  limit: number;
  search?: string;
  student_id?: string;
  attendance_status_id?: string;
  schedule_id?: string;
  class_id?: string;
  attendance_date?: string;
}

export interface AttendancePaginationMeta {
  currentPage: number;
  perPage: number;
  totalData: number;
  totalPages: number;
}

export interface AttendanceListResponse {
  data: Attendance[];
  meta: AttendancePaginationMeta;
}

export interface CreateAttendanceInput {
  schedule_id: string;
  student_id: string;
  attendance_status_id: string;
  attendance_date?: string;
  notes?: string;
}

export type UpdateAttendanceInput = Partial<CreateAttendanceInput>;

