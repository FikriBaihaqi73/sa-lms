export interface ExaminationDateTimeParts {
  date: string;
  time: string;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function splitExaminationDateTime(value: string | null | undefined): ExaminationDateTimeParts {
  if (!value) return { date: "", time: "" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "", time: "" };
  return {
    date: `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    time: `${pad(date.getHours())}:${pad(date.getMinutes())}`,
  };
}

export function combineExaminationDateTime(date: string, time: string): string | undefined {
  if (!date && !time) return undefined;
  if (!date || !time) return undefined;
  const value = new Date(`${date}T${time}`);
  return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
}
