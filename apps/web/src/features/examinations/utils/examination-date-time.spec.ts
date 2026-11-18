import { describe, expect, it } from "vitest";
import { combineExaminationDateTime, splitExaminationDateTime } from "./examination-date-time";

describe("examination date-time conversion", () => {
  it("combines local midnight without changing the local calendar date", () => {
    const expected = new Date("2026-12-01T00:00").toISOString();
    expect(combineExaminationDateTime("2026-12-01", "00:00")).toBe(expected);
  });

  it("splits an ISO value into local date and time", () => {
    const localValue = "2026-11-30T17:00:00.000Z";
    const parts = splitExaminationDateTime(localValue);
    expect(combineExaminationDateTime(parts.date, parts.time)).toBe(new Date(localValue).toISOString());
  });

  it("returns no value when both parts are empty or only one part is present", () => {
    expect(combineExaminationDateTime("", "")).toBeUndefined();
    expect(combineExaminationDateTime("2026-12-01", "")).toBeUndefined();
    expect(combineExaminationDateTime("", "08:30")).toBeUndefined();
  });
});
