import type { Attendance, AttendanceStudentItem, AttendanceScheduleItem } from "./index";

/** Full matrix payload returned by the backend (or mocked in tests). */
export interface AttendanceMatrix {
  /** Schedule the matrix belongs to */
  schedule: AttendanceScheduleItem;
  /** All students that may appear in the matrix */
  students: AttendanceStudentItem[];
  /** Calendar dates – only those with `active: true` are rendered */
  dates: { date: string; active: boolean }[];
  /** One record per attendance entry that actually exists */
  records: Attendance[];
}

/** Options needed to build the matrix UI (dropdowns, filters, etc.). */
export interface AttendanceMatrixOptions {
  academicYears: {
    id: string;
    academic_year: string;
    is_active: boolean;
  }[];
  classes: {
    id: string;
    name: string;
    academic_year_id: string;
  }[];
  schedules: AttendanceScheduleItem[];
  /** Minimal status info for the status filter */
  statuses: { id: string; name: string }[];
}

