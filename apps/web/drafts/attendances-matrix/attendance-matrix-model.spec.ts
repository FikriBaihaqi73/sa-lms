import { describe, expect, it } from "vitest";
import type { Attendance, AttendanceMatrix } from "../types";
import { matrixView } from "./attendance-matrix-model";

const record = (student: string, date: string, status: string): Attendance => ({ id: `${student}:${date}`, student_id: student, schedule_id: "schedule", attendance_status_id: status, attendance_status: { id: status, name: status }, attendance_date: date, created_at: "", updated_at: "" });
const matrix: AttendanceMatrix = {
  schedule: { id: "schedule", day: "Senin", startTime: null, endTime: null },
  students: [{ id: "one", studentNumber: "001", profile: { id: "p", fullName: "Budi" } }, { id: "two", studentNumber: "002", profile: null }, { id: "three", studentNumber: "003" }],
  dates: [{ date: "2026-11-02", active: true }, { date: "2026-11-09", active: true }, { date: "2026-11-01", active: false }],
  records: [record("one", "2026-11-02", "Hadir"), record("one", "2026-11-09", "Sakit"), record("two", "2026-11-02", "Alpa"), record("three", "2026-11-01", "Hadir")],
};

describe("attendance matrix calculations", () => {
  it("ignores inactive days and counts recorded cells without inventing absent records", () => {
    const view = matrixView(matrix, "", "");
    expect(view.students).toHaveLength(3);
    expect(view.summary).toEqual({ total: 3, present: 1, permission: 0, sick: 1, absent: 1, attendanceRate: 33 });
    expect(view.presentByDate.get("2026-11-02")).toBe(1);
  });
  it("searches NISN and names, and filters rows by status while preserving their other cells", () => {
    expect(matrixView(matrix, "  BUDI  ", "").students).toHaveLength(1);
    expect(matrixView(matrix, "002", "").students[0]?.id).toBe("two");
    const view = matrixView(matrix, "", "Sakit");
    expect(view.students.map((student) => student.id)).toEqual(["one"]);
    expect(view.summary.attendanceRate).toBe(50);
    expect(view.cells.size).toBe(2);
  });
  it("handles missing data, no matching rows and zero denominators", () => {
    expect(matrixView(undefined, "", "").summary.attendanceRate).toBe(0);
    expect(matrixView(matrix, "missing", "").summary.total).toBe(0);
    expect(matrixView(matrix, "", "Izin").students).toEqual([]);
  });
});
