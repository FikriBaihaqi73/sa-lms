export function isExaminationDateRangeInvalid(dateFrom: string, dateTo: string): boolean {
  return Boolean(dateFrom && dateTo && dateFrom > dateTo);
}

export function examinationDateFilters(dateFrom: string, dateTo: string): { dateFrom?: string; dateTo?: string } {
  return {
    ...(dateFrom ? { dateFrom: new Date(`${dateFrom}T00:00:00`).toISOString() } : {}),
    ...(dateTo ? { dateTo: new Date(`${dateTo}T23:59:59.999`).toISOString() } : {}),
  };
}
