export function formatTimeDisplay(timeStr: string | null | undefined): string {
  if (!timeStr) return "—";
  const trimmed = timeStr.trim();
  // If already HH:mm or HH:mm:ss
  const match = trimmed.match(/^([01]\d|2[0-3]):([0-5]\d)/);
  if (match) {
    return `${match[1]}:${match[2]}`;
  }
  // If ISO string
  try {
    const d = new Date(trimmed);
    if (!Number.isNaN(d.getTime())) {
      const hours = String(d.getUTCHours()).padStart(2, "0");
      const minutes = String(d.getUTCMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
  } catch {
    // fallback
  }
  return timeStr;
}

export function formatTimeRange(
  startTime: string | null | undefined,
  endTime: string | null | undefined,
): string {
  const start = formatTimeDisplay(startTime);
  const end = formatTimeDisplay(endTime);
  if (start === "—" && end === "—") return "Belum diatur";
  if (start !== "—" && end !== "—") return `${start} - ${end} WIB`;
  if (start !== "—") return `Mulai ${start} WIB`;
  return `Selesai ${end} WIB`;
}

export function getDayBadgeColor(day: string): string {
  const normalized = day.trim().toLowerCase();
  switch (normalized) {
    case "senin":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 border-blue-200 dark:border-blue-900";
    case "selasa":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/70 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900";
    case "rabu":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900";
    case "kamis":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900";
    case "jumat":
      return "bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-900";
    case "sabtu":
      return "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-900";
    case "minggu":
    default:
      return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  }
}
