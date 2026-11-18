import { describe, expect, it } from "vitest";
import { examinationDateFilters, isExaminationDateRangeInvalid } from "./date-range";

describe("examination date filters", () => {
  it("rejects a reversed range", () => expect(isExaminationDateRangeInvalid("2026-12-10", "2026-12-01")).toBe(true));
  it("makes the end date inclusive through the local end of day", () => {
    const filters = examinationDateFilters("2026-12-01", "2026-12-10");
    expect(new Date(filters.dateFrom ?? "").getTime()).toBe(new Date("2026-12-01T00:00:00").getTime());
    expect(new Date(filters.dateTo ?? "").getTime()).toBe(new Date("2026-12-10T23:59:59.999").getTime());
  });
});
