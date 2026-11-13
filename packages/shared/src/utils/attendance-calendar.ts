/** Calendar-only calculations use UTC to avoid shifting dates across timezones. */
export function isAttendanceDay(date: string, day: string): boolean {
  const names = [
    ["minggu", "sunday", "ahad"], ["senin", "monday"],
    ["selasa", "tuesday"], ["rabu", "wednesday"],
    ["kamis", "thursday"], ["jumat", "friday"], ["sabtu", "saturday"],
  ];
  const weekday = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  return weekday !== 0 && (names[weekday]?.includes(day.trim().toLowerCase().replaceAll("'", "")) ?? false);
}

export function attendanceMonthDates(year: number, month: number): string[] {
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return Array.from({ length: days }, (_, index) => `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`);
}

export function attendanceStatusKind(name?: string | null): "present" | "permission" | "sick" | "absent" | "unknown" {
  const normalized = name?.trim().toLowerCase();
  if (normalized === "hadir" || normalized === "present") return "present";
  if (normalized === "izin" || normalized === "permission" || normalized === "permit") return "permission";
  if (normalized === "sakit" || normalized === "sick") return "sick";
  if (normalized === "alpa" || normalized === "alpha" || normalized === "absent" || normalized === "tidak hadir") return "absent";
  return "unknown";
}
