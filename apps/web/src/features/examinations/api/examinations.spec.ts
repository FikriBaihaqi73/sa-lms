import { beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "@/lib/api";
import { getExaminationsApi, getExaminationStatsApi } from "./examinations";

vi.mock("@/lib/api", () => ({ apiFetch: vi.fn() }));

describe("examinations API", () => {
  beforeEach(() => vi.clearAllMocks());

  it("serializes list filters", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ data: { data: [], meta: {} } });
    await getExaminationsApi({ page: 2, limit: 25, search: "UTS", classSubjectId: "class-1", assignmentTypeId: "type-1", dateFrom: "2026-01-01T00:00:00.000Z" });
    expect(apiFetch).toHaveBeenCalledWith(expect.stringContaining("page=2"));
    expect(apiFetch).toHaveBeenCalledWith(expect.stringContaining("classSubjectId=class-1"));
    expect(apiFetch).toHaveBeenCalledWith(expect.stringContaining("dateFrom=2026-01-01T00%3A00%3A00.000Z"));
  });

  it("reads statistics from the dedicated endpoint", async () => {
    vi.mocked(apiFetch).mockResolvedValue({ data: { total: 2, upcoming: 1, completed: 1, withoutDate: 0 } });
    await expect(getExaminationStatsApi()).resolves.toEqual({ total: 2, upcoming: 1, completed: 1, withoutDate: 0 });
    expect(apiFetch).toHaveBeenCalledWith("/examinations/stats");
  });
});
